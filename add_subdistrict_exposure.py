#!/usr/bin/env python3
"""
add_subdistrict_exposure.py — per-SUB-DISTRICT (taluk/tehsil) elevation +
low-lying stats for all ~6,200 ADM3 polygons, from the same open AWS Terrain
Tiles as the district flood_exposure layer (add_flood_exposure.py), at z10
(~140 m/px — taluks are small, districts used z9).

Stats are written INTO subdistricts/<State>.geojson feature properties so the
existing lazy per-state fetch carries them to the map with no extra request:
  ELEV_MEAN_M, ELEV_MIN_M, ELEV_MAX_M, PCT_BELOW_5M, PCT_BELOW_10M
A taluk whose polygon yields <4 raster pixels or whose tiles fail stays WITHOUT
these keys — absent = gap, never fabricated (same rule as everywhere).

Idempotent: re-running refreshes values. Run: python3 add_subdistrict_exposure.py
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

ZOOM = 10
WORLD_PX = (2 ** ZOOM) * 256
TILE_URL = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
OCEAN_CUTOFF = -3.0

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


def poly_stats(geom):
    polys = rings_of(geom)
    if not polys:
        return None
    allpts = [pt for poly in polys for ring in poly for pt in ring]
    lons = [p[0] for p in allpts]; lats = [p[1] for p in allpts]
    x0, y0 = lonlat_to_px(min(lons), max(lats))
    x1, y1 = lonlat_to_px(max(lons), min(lats))
    px0, py0, px1, py1 = int(x0), int(y0), int(math.ceil(x1)), int(math.ceil(y1))
    W, H = max(px1 - px0, 1), max(py1 - py0, 1)
    if W * H > 40_000_000:
        return None

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
            gx0, gy0 = tx * 256, ty * 256
            sx0, sy0 = max(px0 - gx0, 0), max(py0 - gy0, 0)
            sx1, sy1 = min(px1 - gx0, 256), min(py1 - gy0, 256)
            if sx1 <= sx0 or sy1 <= sy0:
                continue
            dx0, dy0 = gx0 + sx0 - px0, gy0 + sy0 - py0
            elev[dy0:dy0 + (sy1 - sy0), dx0:dx0 + (sx1 - sx0)] = arr[sy0:sy1, sx0:sx1]

    vals = elev[mask]
    vals = vals[~np.isnan(vals)]
    vals = vals[vals >= OCEAN_CUTOFF]
    if len(vals) < 4:
        return None
    return {
        "ELEV_MEAN_M": round(float(vals.mean()), 1),
        "ELEV_MIN_M": round(float(vals.min()), 1),
        "ELEV_MAX_M": round(float(vals.max()), 1),
        "PCT_BELOW_5M": round(float((vals <= 5.0).mean() * 100.0), 1),
        "PCT_BELOW_10M": round(float((vals <= 10.0).mean() * 100.0), 1),
    }


def main():
    n_ok = n_gap = 0
    for path in sorted(glob.glob("subdistricts/*.geojson")):
        gj = json.load(open(path, encoding="utf-8"))
        for feat in gj["features"]:
            stats = poly_stats(feat.get("geometry") or {})
            if stats:
                feat["properties"].update(stats)
                n_ok += 1
            else:
                for k in ("ELEV_MEAN_M", "ELEV_MIN_M", "ELEV_MAX_M", "PCT_BELOW_5M", "PCT_BELOW_10M"):
                    feat["properties"].pop(k, None)  # stale values never survive a gap
                n_gap += 1
        # compact like build_subdistricts.py output (don't re-bloat the repo)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(gj, f, ensure_ascii=False, separators=(",", ":"))
        print(f"  {path}: done")
    print(f"sub-district exposure written for {n_ok} taluks ({n_gap} gaps), "
          f"{len(_tile_cache)} tiles fetched at z{ZOOM}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
