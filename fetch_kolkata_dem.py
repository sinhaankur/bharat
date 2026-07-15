#!/usr/bin/env python3
"""
fetch_kolkata_dem.py — open DEM heightmap for the Kolkata district bbox, from
AWS Terrain Tiles (Mapzen terrarium PNGs, public S3 bucket, no key needed).

Sourcing / honesty (same rule as add_district_elevation.py):
  * Geometry bbox: districts/West_Bengal.geojson (Kolkata feature).
  * Elevation: https://registry.opendata.aws/terrain-tiles/ (open SRTM-derived).
  * Output is a raw float32 grid + JSON sidecar with bounds/stats — every
    downstream artefact (STL, simulation) can cite this file.

Run: python3 fetch_kolkata_dem.py
Writes: /tmp/kolkata_dem.npy + /tmp/kolkata_dem.json
"""
import io
import json
import math
import urllib.request

import numpy as np
from PIL import Image

BBOX = (88.27065, 22.49494, 88.40731, 22.62974)  # lon_min, lat_min, lon_max, lat_max
ZOOM = 13
TILE_URL = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"


def lonlat_to_tile(lon, lat, z):
    n = 2 ** z
    x = (lon + 180.0) / 360.0 * n
    y = (1.0 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2.0 * n
    return x, y


def main():
    lon0, lat0, lon1, lat1 = BBOX
    x0, y1 = lonlat_to_tile(lon0, lat0, ZOOM)  # south-west -> larger y
    x1, y0 = lonlat_to_tile(lon1, lat1, ZOOM)  # north-east -> smaller y
    tx0, tx1 = int(x0), int(x1)
    ty0, ty1 = int(y0), int(y1)
    cols, rows = tx1 - tx0 + 1, ty1 - ty0 + 1
    print(f"tiles: {cols} x {rows} at z{ZOOM}")

    mosaic = np.zeros((rows * 256, cols * 256), dtype=np.float32)
    for ty in range(ty0, ty1 + 1):
        for tx in range(tx0, tx1 + 1):
            url = TILE_URL.format(z=ZOOM, x=tx, y=ty)
            with urllib.request.urlopen(url, timeout=30) as r:
                img = np.asarray(Image.open(io.BytesIO(r.read())).convert("RGB"), dtype=np.float32)
            elev = img[:, :, 0] * 256.0 + img[:, :, 1] + img[:, :, 2] / 256.0 - 32768.0
            ry, rx = ty - ty0, tx - tx0
            mosaic[ry * 256:(ry + 1) * 256, rx * 256:(rx + 1) * 256] = elev
            print(f"  {url} ok  ({elev.min():.1f}..{elev.max():.1f} m)")

    # crop mosaic to the exact bbox
    px0 = int((x0 - tx0) * 256)
    px1 = int((x1 - tx0) * 256)
    py0 = int((y0 - ty0) * 256)
    py1 = int((y1 - ty0) * 256)
    grid = mosaic[py0:py1 + 1, px0:px1 + 1]

    np.save("/tmp/kolkata_dem.npy", grid)
    meta = {
        "bbox": BBOX, "zoom": ZOOM, "shape": list(grid.shape),
        "min_m": float(grid.min()), "max_m": float(grid.max()),
        "mean_m": float(grid.mean()),
        "source": "https://registry.opendata.aws/terrain-tiles/ (terrarium, open SRTM-derived)",
    }
    json.dump(meta, open("/tmp/kolkata_dem.json", "w"), indent=1)
    print("grid:", grid.shape, f"elev {grid.min():.1f}..{grid.max():.1f} m, mean {grid.mean():.1f} m")


if __name__ == "__main__":
    main()
