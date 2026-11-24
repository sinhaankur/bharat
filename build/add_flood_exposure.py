#!/usr/bin/env python3
"""
add_flood_exposure.py — DEM-raster flood-exposure stats for EVERY district,
from open AWS Terrain Tiles (SRTM-derived; same source family as the Kolkata
flood-sim terrain). Upgrades the single-point centroid elevation to a real
within-district raster measure: what SHARE of each district's area lies below
5 m / 10 m elevation — the honest, all-594 backbone behind the per-district
flood story (hero fluid sims stay curated, this layer is universal).

Sourcing / honesty:
  * Geometry: districts/*.geojson (STATE/DISTRICT properties match ledger keys).
  * Elevation: https://registry.opendata.aws/terrain-tiles/ (terrarium PNGs,
    public S3, no key). z9 ≈ 300 m/px. Third-party but open; source_tier 3.
  * Pixels below -3 m are treated as ocean/SRTM-void and EXCLUDED (no real
    Indian land sits below -3 m; keeps imprecise coastlines from inflating
    the low-lying share).
  * Any district whose tiles fail to fetch or whose polygon rasterizes to
    zero pixels stays a gap — NEVER fabricated.
  * This is an exposure PROXY (area below a contour), not a hydrological model.

Idempotent: re-running refreshes values and fills gaps.
Run: python3 add_flood_exposure.py
"""
import glob
import io
import json
import math
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor

import numpy as np
from PIL import Image, ImageDraw

from ledger_io import load_ledger, save_ledger

DISTRICTS_GLOB = "districts/*.geojson"
ZOOM = 9
WORLD_PX = (2 ** ZOOM) * 256
TILE_URL = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
SRC = "https://registry.opendata.aws/terrain-tiles/"
OCEAN_CUTOFF = -3.0  # metres; below this = ocean/void, excluded
THRESHOLDS = (5.0, 10.0)

_tile_cache = {}


def lonlat_to_px(lon, lat):
    x = (lon + 180.0) / 360.0 * WORLD_PX
    lat = max(min(lat, 85.0), -85.0)
    y = (1.0 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2.0 * WORLD_PX
    return x, y


def fetch_tile(txy):
    tx, ty = txy
    try:
        with urllib.request.urlopen(TILE_URL.format(z=ZOOM, x=tx, y=ty), timeout=30) as r:
            img = np.asarray(Image.open(io.BytesIO(r.read())).convert("RGB"), dtype=np.float32)
        return txy, img[:, :, 0] * 256.0 + img[:, :, 1] + img[:, :, 2] / 256.0 - 32768.0
    except Exception:
        return txy, None


def rings_of(geom):
    if geom["type"] == "Polygon":
        return [geom["coordinates"]]
    if geom["type"] == "MultiPolygon":
        return geom["coordinates"]
    return []


def district_stats(geom):
    """Returns dict of raster stats or None (gap) for one district geometry."""
    polys = rings_of(geom)
    if not polys:
        return None
    allpts = [pt for poly in polys for ring in poly for pt in ring]
    lons = [p[0] for p in allpts]; lats = [p[1] for p in allpts]
    x0, y0 = lonlat_to_px(min(lons), max(lats))  # NW corner
    x1, y1 = lonlat_to_px(max(lons), min(lats))  # SE corner
    px0, py0, px1, py1 = int(x0), int(y0), int(math.ceil(x1)), int(math.ceil(y1))
    W, H = max(px1 - px0, 1), max(py1 - py0, 1)
    if W * H > 40_000_000:  # sanity guard against a broken geometry
        return None

    # polygon mask in window pixel coords (exterior fill, holes clear)
    mask_img = Image.new("L", (W, H), 0)
    draw = ImageDraw.Draw(mask_img)
    for poly in polys:
        for i, ring in enumerate(poly):
            xy = [(lonlat_to_px(lon, lat)[0] - px0, lonlat_to_px(lon, lat)[1] - py0)
                  for lon, lat in ring]
            if len(xy) >= 3:
                draw.polygon(xy, fill=1 if i == 0 else 0)
    mask = np.asarray(mask_img, dtype=bool)
    if not mask.any():
        return None

    # assemble elevation window from cached tiles
    tx0, ty0, tx1, ty1 = px0 // 256, py0 // 256, (px1 - 1) // 256, (py1 - 1) // 256
    need = [(tx, ty) for ty in range(ty0, ty1 + 1) for tx in range(tx0, tx1 + 1)
            if (tx, ty) not in _tile_cache]
    if need:
        with ThreadPoolExecutor(max_workers=16) as ex:
            for txy, arr in ex.map(fetch_tile, need):
                _tile_cache[txy] = arr
    elev = np.full((H, W), np.nan, dtype=np.float32)
    for ty in range(ty0, ty1 + 1):
        for tx in range(tx0, tx1 + 1):
            arr = _tile_cache.get((tx, ty))
            if arr is None:
                continue
            gx0, gy0 = tx * 256, ty * 256  # tile origin in global px
            sx0, sy0 = max(px0 - gx0, 0), max(py0 - gy0, 0)
            sx1, sy1 = min(px1 - gx0, 256), min(py1 - gy0, 256)
            if sx1 <= sx0 or sy1 <= sy0:
                continue
            dx0, dy0 = gx0 + sx0 - px0, gy0 + sy0 - py0
            elev[dy0:dy0 + (sy1 - sy0), dx0:dx0 + (sx1 - sx0)] = arr[sy0:sy1, sx0:sx1]

    vals = elev[mask]
    vals = vals[~np.isnan(vals)]
    vals = vals[vals >= OCEAN_CUTOFF]
    if len(vals) < 4:  # too small / all tiles failed -> gap
        return None
    lat_mid = (min(lats) + max(lats)) / 2.0
    return {
        "pct_area_below_5m": round(float((vals <= THRESHOLDS[0]).mean() * 100.0), 1),
        "pct_area_below_10m": round(float((vals <= THRESHOLDS[1]).mean() * 100.0), 1),
        "mean_m": round(float(vals.mean()), 1),
        "min_m": round(float(vals.min()), 1),
        "max_m": round(float(vals.max()), 1),
        "pixels": int(len(vals)),
        "res_m": int(156543.03 / (2 ** ZOOM) * math.cos(math.radians(lat_mid))),
    }


def main():
    data = load_ledger()
    geoms = {}
    for path in glob.glob(DISTRICTS_GLOB):
        gj = json.load(open(path, encoding="utf-8"))
        for feat in gj["features"]:
            p = feat["properties"]
            if p.get("STATE") and p.get("DISTRICT"):
                geoms[(p["STATE"], p["DISTRICT"])] = feat["geometry"]

    n_ok = n_gap = 0
    for st in data["states"]:
        for dn, dist in data["states"][st].get("districts", {}).items():
            geom = geoms.get((st, dn))
            stats = district_stats(geom) if geom else None
            g = dist.setdefault("dimensions", {}).setdefault("geography", {})
            entry = {
                "level": "district-raster",
                "figure_gap": stats is None,
                "note": "Share of district area below 5 m / 10 m elevation + raster "
                        "elevation stats from open AWS Terrain Tiles (SRTM-derived, "
                        f"z{ZOOM} ≈ 300 m/px), polygon-masked; pixels below -3 m "
                        "treated as ocean/void and excluded. A within-district "
                        "raster upgrade of the centroid elevation. Exposure proxy "
                        "(area below a contour), NOT a hydrological flood model.",
                "source": SRC,
                "source_tier": 3,
            }
            if stats:
                entry.update(stats)
                n_ok += 1
            else:
                n_gap += 1
                gaps = dist.setdefault("_gaps", [])
                gtxt = "geography flood-exposure raster (open terrain tiles) unfetched"
                if gtxt not in gaps:
                    gaps.append(gtxt)
            g["flood_exposure"] = entry
        print(f"  {st}: done")

    save_ledger(data)
    print(f"flood_exposure written for {n_ok} districts ({n_gap} gaps), "
          f"{len(_tile_cache)} tiles fetched.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
