#!/usr/bin/env python3
"""
add_district_elevation.py — real per-district centroid ELEVATION into the geography
dimension, from an OPEN DEM (SRTM via the open-elevation public API).

Why centroid elevation (not a full raster stat): a full SRTM mean-per-district
needs a multi-GB DEM + rasterio (not installed). The district CENTROID elevation
from open SRTM is a genuine, sourced per-district number that already separates
Himalayan/plateau/plain/coastal districts well — and it's honest about being a
single representative point, not a within-district mean.

Sourcing / honesty:
  * Geometry: districts/*.geojson (district polygons already in the repo).
  * Elevation: open-elevation.com (SRTM 30m/250m open DEM). Third-party but open;
    tagged source_tier 3 and labelled "centroid, open SRTM".
  * If the API is unreachable, elevation stays None (gap) — NEVER fabricated.
  * Writes geography.elevation = {centroid_m, terrain_band, level, source}.
    terrain_band is derived FROM the measured elevation (lowland/upland/hill/
    high-mountain), a real per-district refinement of the state-proxy terrain.

Idempotent: re-running refreshes values (and fills any that were gaps last time).
Run: python3 add_district_elevation.py
"""
import glob
import json
import sys
import time
import urllib.request

from geo_utils import centroid   # shared: outer-ring vertex-average centroid

LEDGER = "district-ledger.json"
DISTRICTS_GLOB = "districts/*.geojson"
ELEV_API = "https://api.open-elevation.com/api/v1/lookup"
ELEV_SRC = "https://open-elevation.com/"  # open SRTM-derived DEM
BATCH = 100          # points per POST
TIMEOUT = 30


def elevation_band(m):
    if m is None:
        return None
    if m < 200:
        return "lowland (<200 m)"
    if m < 600:
        return "upland (200-600 m)"
    if m < 1500:
        return "hill (600-1500 m)"
    return "high-mountain (>1500 m)"


def fetch_elevations(points):
    """points: list of (lon, lat). Returns list of elevations (m) or None on fail."""
    out = []
    for i in range(0, len(points), BATCH):
        chunk = points[i:i + BATCH]
        body = json.dumps({
            "locations": [{"latitude": lat, "longitude": lon} for lon, lat in chunk]
        }).encode()
        req = urllib.request.Request(
            ELEV_API, data=body, headers={"Content-Type": "application/json"})
        try:
            r = json.loads(urllib.request.urlopen(req, timeout=TIMEOUT).read())
            out.extend(x.get("elevation") for x in r["results"])
        except Exception as e:
            print(f"  ! batch {i//BATCH} failed ({type(e).__name__}); "
                  f"{len(chunk)} districts stay gaps this run")
            out.extend([None] * len(chunk))
        time.sleep(1.0)  # be polite to the free API
    return out


def main():
    data = json.load(open(LEDGER, encoding="utf-8"))

    # 1) collect (state, district) -> centroid from district geojson files
    cents = {}
    for path in glob.glob(DISTRICTS_GLOB):
        gj = json.load(open(path, encoding="utf-8"))
        for feat in gj["features"]:
            p = feat["properties"]
            st, dn = p.get("STATE"), p.get("DISTRICT")
            if st and dn:
                cents[(st, dn)] = centroid(feat["geometry"])

    # 2) order the districts that exist in the ledger; query elevation
    keys = [(st, dn) for st in data["states"]
            for dn in data["states"][st].get("districts", {})
            if (st, dn) in cents and cents[(st, dn)][0] is not None]
    pts = [cents[k] for k in keys]
    print(f"querying open SRTM elevation for {len(pts)} district centroids "
          f"({(len(pts)+BATCH-1)//BATCH} batches)…")
    elevs = fetch_elevations(pts)

    # 3) write into geography.elevation
    n_ok = 0
    got = dict(zip(keys, elevs))
    for st in data["states"]:
        for dn, dist in data["states"][st].get("districts", {}).items():
            m = got.get((st, dn))
            g = dist.setdefault("dimensions", {}).setdefault("geography", {})
            g["elevation"] = {
                "centroid_m": round(m) if isinstance(m, (int, float)) else None,
                "terrain_band": elevation_band(m) if isinstance(m, (int, float)) else None,
                "level": "district-centroid",
                "figure_gap": not isinstance(m, (int, float)),
                "note": "District-centroid elevation from open SRTM (a single "
                        "representative point, not a within-district mean). Refines "
                        "the state-proxy terrain with a real per-district number.",
                "source": ELEV_SRC,
                "source_tier": 3,
            }
            if isinstance(m, (int, float)):
                n_ok += 1
            else:
                gaps = dist.setdefault("_gaps", [])
                gtxt = "geography district-centroid elevation (open SRTM) unfetched"
                if gtxt not in gaps:
                    gaps.append(gtxt)

    json.dump(data, open(LEDGER, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"elevation written for {n_ok}/{len(keys)} districts "
          f"({len(keys)-n_ok} stayed gaps).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
