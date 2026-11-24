#!/usr/bin/env python3
"""gen_district_centroids.py — precompute one [lat, lng] centroid per district.

Walks the per-state boundary geojson in districts/*.geojson (Datameet/Census-2011,
STATE + DISTRICT properties) and emits a compact district-centroids.json keyed by
"State|District". Used by feed.html's map view to drop each news bubble on the real
district rather than jittering around the state centroid.

Area-weighted centroid of the largest polygon ring (so a multipolygon district — e.g.
islands or exclaves — pins on its main landmass, not a point in the sea between parts).

Regenerate after any change to districts/*.geojson:
    python3 gen_district_centroids.py
"""
import glob
import json
import os

OUT = "district-centroids.json"


def ring_centroid(coords):
    """Area-weighted centroid of a closed ring of [lng, lat] points."""
    sx = sy = a = 0.0
    for i in range(len(coords) - 1):
        x0, y0 = coords[i][0], coords[i][1]
        x1, y1 = coords[i + 1][0], coords[i + 1][1]
        cross = x0 * y1 - x1 * y0
        a += cross
        sx += (x0 + x1) * cross
        sy += (y0 + y1) * cross
    if a == 0:  # degenerate ring → fall back to vertex mean
        xs = [c[0] for c in coords]
        ys = [c[1] for c in coords]
        return sum(xs) / len(xs), sum(ys) / len(ys)
    a *= 0.5
    return sx / (6 * a), sy / (6 * a)


def poly_centroid(geom):
    """Return (lat, lng) for a Polygon / MultiPolygon, using its largest outer ring."""
    cs = geom["coordinates"]
    polys = cs if geom["type"] == "MultiPolygon" else [cs]
    best, best_len = None, -1
    for poly in polys:
        outer = poly[0]
        if len(outer) > best_len:
            best_len, best = len(outer), outer
    cx, cy = ring_centroid(best)
    return round(cy, 4), round(cx, 4)  # geojson is [lng, lat]; Leaflet wants [lat, lng]


def main():
    cent = {}
    files = sorted(glob.glob("districts/*.geojson"))
    for fp in files:
        with open(fp) as fh:
            g = json.load(fh)
        for f in g.get("features", []):
            p = f.get("properties", {})
            st, dn = p.get("STATE"), p.get("DISTRICT")
            if not st or not dn or not f.get("geometry"):
                continue
            try:
                cent[f"{st}|{dn}"] = poly_centroid(f["geometry"])
            except Exception as e:  # never let one bad ring kill the run
                print(f"  ! skipped {st}|{dn}: {e}")

    payload = {
        "_meta": {
            "source": "districts/*.geojson (Datameet-derived, Census-2011 boundaries)",
            "note": "Area-weighted centroid of each district's largest polygon ring. [lat, lng].",
            "count": len(cent),
        },
        "centroids": cent,
    }
    with open(OUT, "w") as fh:
        json.dump(payload, fh, separators=(",", ":"))  # compact — this ships to the browser
    print(f"wrote {OUT}: {len(cent)} district centroids ({os.path.getsize(OUT) // 1024} KB)")


if __name__ == "__main__":
    main()
