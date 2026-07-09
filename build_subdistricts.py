#!/usr/bin/env python3
"""
build_subdistricts.py — split open India sub-district (ADM3) boundaries into
per-state files, so the map can zoom BELOW the district into taluk/tehsil/block
polygons (click a sub-district, not just a district).

Source: geoBoundaries gbOpen IND ADM3 (6,824 sub-districts), derived from the
government Local Government Directory (lgdirectory.gov.in) + Pathways Data, under
the Open Data Commons ODbL 1.0. Open + attributable + gov-derived — fits the
project's sourced-or-gap rule. Download once to /tmp, then run this splitter.

geoBoundaries ADM3 carries only shapeName (the sub-district name) — no parent
state/district. We assign each sub-district to a STATE by centroid point-in-polygon
against india-states.geojson (the same file the map already ships). Output mirrors
the existing districts/ convention: subdistricts/<State>.geojson, loaded lazily on
drill-in. Districts are NOT re-derived here — the sub-district → district link is a
future refinement (would need an ADM2 spatial join); for now each carries its state.

Run:  python3 build_subdistricts.py  [/path/to/geoBoundaries-IND-ADM3.geojson]
      (defaults to /tmp/ind_adm3.geojson)
"""
import json
import os
import sys

from geo_utils import bbox_of, centroid, point_in_geom, rdp

STATES_GEOJSON = "india-states.geojson"
OUT_DIR = "subdistricts"
DEFAULT_SRC = "/tmp/ind_adm3.geojson"
ATTRIB = ("geoBoundaries gbOpen IND ADM3 (ODbL 1.0); source: Local Government "
          "Directory lgdirectory.gov.in via Pathways Data")


SIMPLIFY_TOL = 0.004   # ~450 m — plenty for a web choropleth; shrinks files ~20x
COORD_PREC = 4          # decimal places (~11 m) — round to shrink further


def _round_ring(ring):
    return [[round(x, COORD_PREC), round(y, COORD_PREC)] for x, y in ring]


def _simplify_ring(ring):
    """Simplify a CLOSED ring correctly: RDP the open form (a closed ring's first
    == last point makes a zero-length chord that collapses naive RDP), then re-close."""
    closed = len(ring) > 1 and ring[0] == ring[-1]
    open_ring = ring[:-1] if closed else ring[:]
    if len(open_ring) < 3:
        return None
    # rotate so the ring starts at its westernmost point → the RDP end-chord spans
    # the polygon instead of the (degenerate) seam, so it can't collapse to nothing.
    k = min(range(len(open_ring)), key=lambda i: open_ring[i][0])
    rot = open_ring[k:] + open_ring[:k]
    s = rdp(rot, SIMPLIFY_TOL)
    if len(s) < 3:
        s = rot  # too small to simplify safely — keep as-is
    s = _round_ring(s)
    s.append(s[0])       # re-close
    return s if len(s) >= 4 else None


def simplify_geom(geom):
    """Simplify + round every ring; drop rings that collapse below a triangle."""
    t, c = geom["type"], geom["coordinates"]

    def do_poly(poly):
        out = []
        for ring in poly:
            s = _simplify_ring(ring)
            if s:
                out.append(s)
        return out

    if t == "Polygon":
        rings = do_poly(c)
        return {"type": "Polygon", "coordinates": rings} if rings else None
    if t == "MultiPolygon":
        polys = [p for p in (do_poly(poly) for poly in c) if p]
        return {"type": "MultiPolygon", "coordinates": polys} if polys else None
    return geom


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SRC
    if not os.path.exists(src):
        print(f"ERROR: source not found: {src}")
        print("Download it first (see docstring): geoBoundaries IND ADM3 geojson.")
        return 1

    states = json.load(open(STATES_GEOJSON, encoding="utf-8"))
    # precompute state bboxes for a fast reject before the PIP test
    st_feats = []
    for f in states["features"]:
        st_feats.append((f["properties"]["ST_NM"], bbox_of(f["geometry"]), f["geometry"]))

    adm3 = json.load(open(src, encoding="utf-8"))
    print(f"loaded {len(adm3['features'])} sub-districts; assigning to states…")

    by_state = {}
    unmatched = 0
    for feat in adm3["features"]:
        cx, cy = centroid(feat["geometry"])
        if cx is None:
            unmatched += 1
            continue
        hit = None
        for name, (x0, y0, x1, y1), geom in st_feats:
            if x0 <= cx <= x1 and y0 <= cy <= y1 and point_in_geom(cx, cy, geom):
                hit = name
                break
        if hit is None:
            unmatched += 1
            continue
        # simplify geometry for the web (assignment used the full-res centroid)
        simp = simplify_geom(feat["geometry"])
        if simp is None:
            unmatched += 1
            continue
        p = feat.get("properties", {})
        out_feat = {
            "type": "Feature",
            "properties": {
                "SUBDISTRICT": p.get("shapeName"),
                "STATE": hit,
                "shapeID": p.get("shapeID"),
                "source": ATTRIB,
            },
            "geometry": simp,
        }
        by_state.setdefault(hit, []).append(out_feat)

    os.makedirs(OUT_DIR, exist_ok=True)
    total = 0
    for state, feats in sorted(by_state.items()):
        fname = os.path.join(OUT_DIR, state.replace(" ", "_").replace("&", "and") + ".geojson")
        json.dump({"type": "FeatureCollection", "features": feats},
                  open(fname, "w", encoding="utf-8"), ensure_ascii=False)
        total += len(feats)
        print(f"  {state:<26} {len(feats):>4} sub-districts → {fname}")

    print(f"\nwrote {total} sub-districts across {len(by_state)} states "
          f"({unmatched} unmatched/dropped).")
    # size report
    sizes = sorted(((os.path.getsize(os.path.join(OUT_DIR, f)), f)
                    for f in os.listdir(OUT_DIR) if f.endswith(".geojson")), reverse=True)
    if sizes:
        print(f"largest file: {sizes[0][1]} = {sizes[0][0]/1e6:.2f} MB")
        print(f"total: {sum(s for s, _ in sizes)/1e6:.1f} MB across {len(sizes)} files")
    return 0


if __name__ == "__main__":
    sys.exit(main())
