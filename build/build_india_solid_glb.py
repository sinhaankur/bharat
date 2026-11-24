#!/usr/bin/env python3
"""
build_india_solid_glb.py — a SOLID 3D GLB of India from the real state boundaries.

Replaces the sparse output of build_india_glb.py. The original used a fragile pure-
Python ear-clipper that bailed out on India's complex, high-vertex coastlines, so most
state "top caps" were never triangulated — the model rendered as feathery slivers, not
a filled country. This version uses mapbox_earcut (the robust triangulator deck.gl /
Mapbox use), which handles concave rings AND polygon holes, so every state fills solid.

Conventions (MUST match hero-3d.html geoToModel, which expects north = +Z):
  * lon -> +X (east)      lat -> +Z (north)      height -> +Y (up)
  * centred on the mean lon/lat, scaled to ~10 model units wide
  * per-vertex COLOR_0 (VEC4) by constraint class, same palette as the original
  * height encodes the same documented physical-constraint index

Run: python3 build_india_solid_glb.py   (needs mapbox_earcut + numpy)
"""
import json
import struct
import sys

import numpy as np
import mapbox_earcut as earcut

import os as _os0
GEOJSON = "india-states.geojson"
LEDGER = "district-ledger.json"
OUT_GLB = _os0.environ.get("INDIA_GLB_OUT", "india.glb")
OUT_META = _os0.environ.get("INDIA_GLB_META", "india-glb-meta.json")

BASE_H = 0.15
H_COAST = 0.25
H_FLOOD = 0.35
TERRAIN_H = {
    "himalayan-hill": 0.6, "northeast-hill": 0.5, "plateau": 0.25,
    "indo-gangetic-plain": 0.15, "coastal-plain": 0.2, "desert-arid": 0.3,
    "island": 0.45,
}
CLASS_RGB = {
    "coast-flood": (0.78, 0.20, 0.16),
    "flood": (0.32, 0.45, 0.85),
    "coast": (0.20, 0.62, 0.68),
    "himalayan-hill": (0.70, 0.72, 0.82),
    "northeast-hill": (0.35, 0.62, 0.45),
    "plateau": (0.55, 0.45, 0.30),
    "indo-gangetic-plain": (0.72, 0.70, 0.35),
    "coastal-plain": (0.40, 0.62, 0.66),
    "desert-arid": (0.80, 0.66, 0.35),
    "island": (0.40, 0.58, 0.72),
    "other": (0.45, 0.45, 0.45),
}

# HERO palette (default): a warm BRONZE→GOLD gradient by height, so the GLB reads as
# proud warm stone + gold everywhere — not a muddy flood-risk choropleth. Set the env var
# INDIA_GLB_PALETTE=class to bake the old data-viz class colours instead.
import os as _os
PALETTE_MODE = _os.environ.get("INDIA_GLB_PALETTE", "hero")
_BRONZE_LO = (0.43, 0.31, 0.15)   # deep bronze (low land)
_BRONZE_MID = (0.61, 0.46, 0.21)  # warm bronze
_GILT_HI = (0.89, 0.75, 0.41)     # gilt (high land / ridges)


def _lerp3(a, b, t):
    return (a[0] + (b[0]-a[0])*t, a[1] + (b[1]-a[1])*t, a[2] + (b[2]-a[2])*t)


def hero_rgb(height, h_min, h_max):
    """Bronze→gold by normalised height."""
    t = 0.0 if h_max <= h_min else (height - h_min) / (h_max - h_min)
    if t < 0.5:
        return _lerp3(_BRONZE_LO, _BRONZE_MID, t / 0.5)
    return _lerp3(_BRONZE_MID, _GILT_HI, (t - 0.5) / 0.5)


def load_state_geography():
    try:
        data = json.load(open(LEDGER, encoding="utf-8"))
    except FileNotFoundError:
        return {}
    out = {}
    for sname, s in data.get("states", {}).items():
        g = s.get("geography", {})
        out[sname] = (bool(g.get("on_coast")), bool(g.get("flood_prone")), g.get("terrain"))
    return out


def geo_class(on_coast, flood, terrain):
    if on_coast and flood:
        return "coast-flood"
    if flood:
        return "flood"
    if on_coast:
        return "coast"
    return terrain or "other"


def constraint_height(on_coast, flood, terrain):
    h = BASE_H
    if on_coast:
        h += H_COAST
    if flood:
        h += H_FLOOD
    h += TERRAIN_H.get(terrain, 0.2)
    return h


def iter_polygons(feature):
    """Yield each polygon as (outer_ring, [hole_rings...]) for Polygon / MultiPolygon."""
    geom = feature.get("geometry")
    if not geom:
        return
    t = geom["type"]
    if t == "Polygon":
        rings = geom["coordinates"]
        yield rings[0], rings[1:]
    elif t == "MultiPolygon":
        for poly in geom["coordinates"]:
            yield poly[0], poly[1:]


def triangulate_polygon(outer, holes):
    """mapbox_earcut triangulation of one polygon with holes.

    Returns (verts_xy, tri_indices) where tri_indices index into verts_xy.
    earcut wants all rings concatenated into one (N,2) array plus the start index
    of each hole ring.
    """
    rings = [outer] + list(holes)
    # drop duplicate closing point per ring (earcut doesn't need it)
    cleaned = []
    for r in rings:
        rr = r[:-1] if len(r) > 1 and r[0] == r[-1] else r
        cleaned.append(rr)
    flat = []
    ring_ends = []
    for rr in cleaned:
        flat.extend(rr)
        ring_ends.append(len(flat))
    verts_xy = np.array(flat, dtype=np.float64)
    if len(verts_xy) < 3:
        return verts_xy, np.array([], dtype=np.uint32)
    # earcut: rings array = the END index of each ring (exclusive)
    rings_arr = np.array(ring_ends, dtype=np.uint32)
    tris = earcut.triangulate_float64(verts_xy, rings_arr)
    return verts_xy, tris


def build():
    geo = json.load(open(GEOJSON, encoding="utf-8"))
    stategeo = load_state_geography()

    # centre + scale from ALL coordinates (outer rings are enough for the bbox)
    all_xy = []
    for f in geo["features"]:
        for outer, _ in iter_polygons(f):
            all_xy.extend(outer)
    arr = np.array(all_xy, dtype=np.float64)
    cx, cy = arr[:, 0].mean(), arr[:, 1].mean()
    span = max(arr[:, 0].max() - arr[:, 0].min(), arr[:, 1].max() - arr[:, 1].min())
    scale = 10.0 / span

    verts = []
    colors = []
    indices = []
    per_state = []

    def add_vertex(x, y, z, rgb):
        verts.append((x, y, z))
        colors.append(rgb)
        return len(verts) - 1

    # precompute the height range across all states for the hero gradient
    _all_h = [constraint_height(*stategeo.get(f["properties"].get("ST_NM", "?"), (False, False, None)))
              for f in geo["features"]]
    H_MIN, H_MAX = (min(_all_h), max(_all_h)) if _all_h else (0.0, 1.0)

    for f in geo["features"]:
        sname = f["properties"].get("ST_NM", "?")
        on_coast, flood, terrain = stategeo.get(sname, (False, False, None))
        cls = geo_class(on_coast, flood, terrain)
        h = constraint_height(on_coast, flood, terrain)
        if PALETTE_MODE == "hero":
            rgb_top = hero_rgb(h, H_MIN, H_MAX)         # gilt at the lifted top
            rgb_bot = _lerp3(_BRONZE_LO, rgb_top, 0.35)  # darker bronze at the base
        else:
            rgb_top = rgb_bot = CLASS_RGB.get(cls, CLASS_RGB["other"])
        tri0 = len(indices)

        for outer, holes in iter_polygons(f):
            if len(outer) < 4:
                continue
            verts_xy, tris = triangulate_polygon(outer, holes)
            if len(tris) == 0:
                continue
            n = len(verts_xy)
            base = len(verts)
            # lon -> +X (east), lat -> +Z (north), height -> +Y. Top ring then bottom.
            for (px, py) in verts_xy:
                add_vertex((px - cx) * scale, h, (py - cy) * scale, rgb_top)
            for (px, py) in verts_xy:
                add_vertex((px - cx) * scale, 0.0, (py - cy) * scale, rgb_bot)
            # top cap (earcut winds CW for +Y-up screen space; flip to face up)
            for t in range(0, len(tris), 3):
                a, b, c = int(tris[t]), int(tris[t + 1]), int(tris[t + 2])
                indices.extend([base + a, base + c, base + b])
            # side walls along the OUTER ring only (holes are interior, no visible wall)
            outer_n = len(outer[:-1]) if (len(outer) > 1 and outer[0] == outer[-1]) else len(outer)
            for i in range(outer_n):
                j = (i + 1) % outer_n
                t0, t1 = base + i, base + j
                b0, b1 = base + n + i, base + n + j
                indices.extend([t0, b0, t1, t1, b0, b1])

        per_state.append({
            "state": sname, "class": cls, "height": round(h, 3),
            "on_coast": on_coast, "flood_prone": flood, "terrain": terrain,
            "tri_count": (len(indices) - tri0) // 3,
        })

    return verts, colors, indices, per_state


def write_glb(path, verts, colors, indices):
    positions = np.array(verts, dtype=np.float32)
    cols = np.array(colors, dtype=np.float32)
    cols4 = np.concatenate([cols, np.ones((len(cols), 1), np.float32)], axis=1)
    idx = np.array(indices, dtype=np.uint32)

    def pad4(b, fill=b"\x00"):
        return b + fill * ((4 - len(b) % 4) % 4)

    pos_bytes = pad4(positions.tobytes())
    col_bytes = pad4(cols4.tobytes())
    idx_bytes = pad4(idx.tobytes())
    buf = pos_bytes + col_bytes + idx_bytes
    off_pos, off_col, off_idx = 0, len(pos_bytes), len(pos_bytes) + len(col_bytes)

    pmin = positions.min(axis=0).tolist()
    pmax = positions.max(axis=0).tolist()

    gltf = {
        "asset": {"version": "2.0", "generator": "build_india_solid_glb.py"},
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": [{"mesh": 0, "name": "India_solid"}],
        "meshes": [{"primitives": [{
            "attributes": {"POSITION": 0, "COLOR_0": 1},
            "indices": 2, "mode": 4, "material": 0,
        }], "name": "India"}],
        "materials": [{
            "name": "vertexcolor",
            "pbrMetallicRoughness": {"metallicFactor": 0.0, "roughnessFactor": 0.9},
        }],
        "buffers": [{"byteLength": len(buf)}],
        "bufferViews": [
            {"buffer": 0, "byteOffset": off_pos, "byteLength": len(pos_bytes), "target": 34962},
            {"buffer": 0, "byteOffset": off_col, "byteLength": len(col_bytes), "target": 34962},
            {"buffer": 0, "byteOffset": off_idx, "byteLength": len(idx_bytes), "target": 34963},
        ],
        "accessors": [
            {"bufferView": 0, "componentType": 5126, "count": len(positions),
             "type": "VEC3", "min": pmin, "max": pmax},
            {"bufferView": 1, "componentType": 5126, "count": len(cols4), "type": "VEC4"},
            {"bufferView": 2, "componentType": 5125, "count": len(idx), "type": "SCALAR"},
        ],
    }

    json_bytes = pad4(json.dumps(gltf, separators=(",", ":")).encode("utf-8"), b" ")
    bin_bytes = pad4(buf, b"\x00")
    total = 12 + 8 + len(json_bytes) + 8 + len(bin_bytes)
    with open(path, "wb") as f:
        f.write(b"glTF")
        f.write(struct.pack("<II", 2, total))
        f.write(struct.pack("<I", len(json_bytes)))
        f.write(b"JSON")
        f.write(json_bytes)
        f.write(struct.pack("<I", len(bin_bytes)))
        f.write(b"BIN\x00")
        f.write(bin_bytes)


def main():
    verts, colors, indices, per_state = build()
    write_glb(OUT_GLB, verts, colors, indices)
    meta = {
        "generated_by": "build_india_solid_glb.py",
        "geometry_source": GEOJSON + " (state boundaries, SOLID fill via mapbox_earcut)",
        "convention": "lon->+X (east), lat->+Z (north), height->+Y",
        "vertices": len(verts), "triangles": len(indices) // 3,
        "states": per_state,
    }
    json.dump(meta, open(OUT_META, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"wrote {OUT_GLB}: {len(verts)} verts, {len(indices)//3} tris, {len(per_state)} states")
    weak = [s["state"] for s in per_state if s["tri_count"] < 2]
    if weak:
        print("  WARNING: states with <2 triangles (possible fill gaps):", weak)
    else:
        print("  all states triangulated (solid fill)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
