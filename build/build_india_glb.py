#!/usr/bin/env python3
"""
build_india_glb.py — a standalone 3D GLB of India, extruded by geography constraint.

Produces `india.glb`: each state/UT is a 3D prism whose HEIGHT encodes the physical
constraint-on-development score (coastal + flood-prone + terrain difficulty) and
whose COLOUR encodes the constraint class — the same "Flood & coast" layer as the
2-D map, now in 3-D so a zone's constraint reads at a glance.

HONESTY (same rules as the rest of the project):
  * Geometry = the india-states.geojson we already ship (state boundaries).
  * Height = a TRANSPARENT, additive constraint index built ONLY from already-
    sourced booleans (on_coast, flood_prone, terrain class). It is NOT a
    "development-hindrance score" masquerading as an outcome — it is a legend-
    documented sum of physical-constraint flags, and it is labelled as such.
  * The "civilian-only / no government land" cut CANNOT be honoured: there is no
    open cadastral ownership layer for India. So this GLB includes ALL land and
    records that exclusion as an explicit gap (printed + in the sidecar .json).
    NOT silently ignored.

No external geo libs and no dependency on any running Blender session (your live
Blender scene is left untouched). Pure Python + numpy; writes a valid binary glTF
2.0 (.glb) that opens in any glTF viewer, three.js, Blender import, etc.

Run: python3 build_india_glb.py
"""
import json
import struct
import sys

import numpy as np

GEOJSON = "india-states.geojson"
LEDGER = "district-ledger.json"
OUT_GLB = "india.glb"
OUT_META = "india-glb-meta.json"

# Height (in the model's Z, arbitrary units) contributed by each constraint. The
# index is a documented SUM of physical-constraint flags — see the sidecar meta.
BASE_H = 0.15
H_COAST = 0.25          # CRZ applies — near-shore construction legally capped
H_FLOOD = 0.35          # on the CWC/NDMA chronically flood-prone list
TERRAIN_H = {
    "himalayan-hill": 0.6, "northeast-hill": 0.5, "plateau": 0.25,
    "indo-gangetic-plain": 0.15, "coastal-plain": 0.2, "desert-arid": 0.3,
    "island": 0.45,
}
# Colour by constraint class (linear-ish RGB, matches the 2-D legend intent).
CLASS_RGB = {
    "coast-flood": (0.78, 0.20, 0.16),   # red — max constraint
    "flood": (0.32, 0.45, 0.85),         # blue
    "coast": (0.20, 0.62, 0.68),         # teal
    "himalayan-hill": (0.70, 0.72, 0.82),
    "northeast-hill": (0.35, 0.62, 0.45),
    "plateau": (0.55, 0.45, 0.30),
    "indo-gangetic-plain": (0.72, 0.70, 0.35),
    "coastal-plain": (0.40, 0.62, 0.66),
    "desert-arid": (0.80, 0.66, 0.35),
    "island": (0.40, 0.58, 0.72),
    "other": (0.45, 0.45, 0.45),
}


def load_state_geography():
    """Map state name -> (on_coast, flood_prone, terrain) from the ledger we built."""
    data = json.load(open(LEDGER, encoding="utf-8"))
    out = {}
    for sname, s in data["states"].items():
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


# --- ear-clipping triangulation (top/bottom caps), pure Python -------------
def _signed_area(poly):
    a = 0.0
    n = len(poly)
    for i in range(n):
        x1, y1 = poly[i]
        x2, y2 = poly[(i + 1) % n]
        a += x1 * y2 - x2 * y1
    return a * 0.5


def _point_in_tri(p, a, b, c):
    (px, py), (ax, ay), (bx, by), (cx, cy) = p, a, b, c
    d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
    if abs(d) < 1e-12:
        return False
    w1 = ((by - cy) * (px - cx) + (cx - bx) * (py - cy)) / d
    w2 = ((cy - ay) * (px - cx) + (ax - cx) * (py - cy)) / d
    w3 = 1 - w1 - w2
    return w1 >= -1e-9 and w2 >= -1e-9 and w3 >= -1e-9


def triangulate(ring):
    """Ear-clipping for a simple (outer) ring. Returns list of index triples into ring."""
    poly = ring[:]
    # ensure CCW
    if _signed_area(poly) < 0:
        poly = poly[::-1]
        rev = True
    else:
        rev = False
    n = len(poly)
    idx = list(range(n))
    tris = []
    guard = 0
    while len(idx) > 3 and guard < 5 * n:
        guard += 1
        ear = False
        m = len(idx)
        for i in range(m):
            i0, i1, i2 = idx[(i - 1) % m], idx[i], idx[(i + 1) % m]
            a, b, c = poly[i0], poly[i1], poly[i2]
            # convex?
            cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
            if cross <= 0:
                continue
            # no other vertex inside
            bad = False
            for j in idx:
                if j in (i0, i1, i2):
                    continue
                if _point_in_tri(poly[j], a, b, c):
                    bad = True
                    break
            if bad:
                continue
            tris.append((i0, i1, i2))
            idx.pop(i)
            ear = True
            break
        if not ear:
            break  # degenerate; stop (cap will be partial, walls still fine)
    if len(idx) == 3:
        tris.append((idx[0], idx[1], idx[2]))
    if rev:
        # map back to original ordering
        tris = [(n - 1 - a, n - 1 - b, n - 1 - c) for (a, b, c) in tris]
    return tris


def polygons_of(feature):
    """Yield outer rings (list of [x,y]) for Polygon / MultiPolygon (outer ring only)."""
    geom = feature["geometry"]
    t = geom["type"]
    if t == "Polygon":
        yield geom["coordinates"][0]
    elif t == "MultiPolygon":
        for poly in geom["coordinates"]:
            yield poly[0]


def build():
    geo = json.load(open(GEOJSON, encoding="utf-8"))
    stategeo = load_state_geography()

    # collect all coords to centre + scale the model to a sane size
    all_xy = []
    for f in geo["features"]:
        for ring in polygons_of(f):
            all_xy.extend(ring)
    arr = np.array(all_xy, dtype=np.float64)
    cx, cy = arr[:, 0].mean(), arr[:, 1].mean()
    span = max(arr[:, 0].max() - arr[:, 0].min(), arr[:, 1].max() - arr[:, 1].min())
    scale = 10.0 / span  # model ~10 units wide

    verts = []   # (x, y, z)
    colors = []  # (r, g, b)
    indices = []
    per_state = []

    def add_vertex(x, y, z, rgb):
        verts.append((x, y, z))
        colors.append(rgb)
        return len(verts) - 1

    for f in geo["features"]:
        sname = f["properties"].get("ST_NM", "?")
        # ledger uses slightly different UT names; try direct, else best-effort skip constraint
        on_coast, flood, terrain = stategeo.get(sname, (False, False, None))
        cls = geo_class(on_coast, flood, terrain)
        h = constraint_height(on_coast, flood, terrain)
        rgb = CLASS_RGB.get(cls, CLASS_RGB["other"])
        tri0 = len(indices)

        for ring in polygons_of(f):
            if len(ring) < 4:
                continue
            # normalise coords -> centre, scale, y-up model (x, z=lat, y=height)
            pts = [((px - cx) * scale, (py - cy) * scale) for px, py in ring]
            # drop duplicate closing point if present
            if pts[0] == pts[-1]:
                pts = pts[:-1]
            n = len(pts)
            if n < 3:
                continue
            base = len(verts)
            # top ring (y = h) then bottom ring (y = 0)
            for (mx, mz) in pts:
                add_vertex(mx, h, mz, rgb)
            for (mx, mz) in pts:
                add_vertex(mx, 0.0, mz, rgb)
            # top cap
            for (a, b, c) in triangulate(pts):
                indices.extend([base + a, base + b, base + c])
            # side walls (quad per edge -> 2 tris), wound outward
            for i in range(n):
                j = (i + 1) % n
                t0, t1 = base + i, base + j
                b0, b1 = base + n + i, base + n + j
                indices.extend([t0, b0, t1,  t1, b0, b1])

        per_state.append({
            "state": sname, "class": cls, "height": round(h, 3),
            "on_coast": on_coast, "flood_prone": flood, "terrain": terrain,
            "tri_count": (len(indices) - tri0) // 3,
        })

    return verts, colors, indices, per_state


# --- minimal binary glTF 2.0 writer ---------------------------------------
def write_glb(path, verts, colors, indices):
    positions = np.array(verts, dtype=np.float32)
    cols = np.array(colors, dtype=np.float32)
    # per-vertex COLOR_0 as VEC4 (add alpha=1)
    cols4 = np.concatenate([cols, np.ones((len(cols), 1), np.float32)], axis=1)
    idx = np.array(indices, dtype=np.uint32)

    pos_bytes = positions.tobytes()
    col_bytes = cols4.tobytes()
    idx_bytes = idx.tobytes()

    def pad4(b, fill=b"\x00"):
        return b + fill * ((4 - len(b) % 4) % 4)

    pos_bytes, col_bytes, idx_bytes = pad4(pos_bytes), pad4(col_bytes), pad4(idx_bytes)
    buf = pos_bytes + col_bytes + idx_bytes
    off_pos, off_col, off_idx = 0, len(pos_bytes), len(pos_bytes) + len(col_bytes)

    pmin = positions.min(axis=0).tolist()
    pmax = positions.max(axis=0).tolist()

    gltf = {
        "asset": {"version": "2.0", "generator": "build_india_glb.py (India Fiscal Map)"},
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": [{"mesh": 0, "name": "India_geography_extruded"}],
        "meshes": [{"primitives": [{
            "attributes": {"POSITION": 0, "COLOR_0": 1},
            "indices": 2, "mode": 4,
            "material": 0,
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

    # glTF spec: JSON chunk padded with SPACES (0x20), BIN chunk padded with ZEROS.
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
        "generated_by": "build_india_glb.py",
        "geometry_source": GEOJSON + " (state boundaries)",
        "height_encodes": "physical-constraint index = BASE + coastal(CRZ) + "
                          "flood-prone(CWC/NDMA) + terrain-difficulty. A documented "
                          "SUM of already-sourced constraint flags — NOT an outcome "
                          "score and NOT a 'development-hindrance score'.",
        "height_weights": {"base": BASE_H, "coast": H_COAST, "flood": H_FLOOD,
                            "terrain": TERRAIN_H},
        "colour_encodes": "constraint class (coast+flood > flood > coast > terrain)",
        "GAP_civilian_only": "This GLB includes ALL land. The requested 'civilian "
                             "area only, no government land' cut is NOT applied: "
                             "India has no open cadastral ownership layer to "
                             "distinguish civilian vs government parcels (per-state "
                             "revenue records, mostly not machine-readable). Recorded "
                             "as a gap, not silently dropped.",
        "vertices": len(verts), "triangles": len(indices) // 3,
        "states": per_state,
    }
    json.dump(meta, open(OUT_META, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

    print(f"wrote {OUT_GLB}: {len(verts)} verts, {len(indices)//3} tris, "
          f"{len(per_state)} states")
    print(f"wrote {OUT_META} (height/colour legend + civilian-only GAP note)")
    print("  GAP: civilian-vs-govt-land cut NOT applied (no open cadastral layer).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
