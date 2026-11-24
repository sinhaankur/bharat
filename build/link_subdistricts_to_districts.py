#!/usr/bin/env python3
"""
link_subdistricts_to_districts.py — add a parent DISTRICT to each sub-district.

geoBoundaries ADM3 carries only the sub-district name + (via our splitter) its
STATE. To make a taluk clickable INTO its district's full panel, each sub-district
needs its parent district. We derive it by a centroid point-in-polygon join against
the district boundaries we already ship (districts/<State>.geojson, GADM ADM2).

Honesty:
  * The join is geometric (centroid in district polygon), same method as the
    state assignment. A sub-district whose centroid lands in no district polygon
    of its state (border/coast edge cases) gets DISTRICT = null — an honest gap,
    not a guess.
  * Runs on the already-simplified subdistricts/*.geojson in place (idempotent).

Run: python3 link_subdistricts_to_districts.py
"""
import glob
import json
import os
import sys

from geo_utils import bbox_of, centroid, point_in_geom

SUBDIR = "subdistricts"
DISTDIR = "districts"


def state_file(name):
    return name.replace(" ", "_").replace("&", "and") + ".geojson"


def main():
    sub_files = sorted(glob.glob(os.path.join(SUBDIR, "*.geojson")))
    total = linked = gap = 0
    per_state = []

    for spath in sub_files:
        sub = json.load(open(spath, encoding="utf-8"))
        state = sub["features"][0]["properties"].get("STATE") if sub["features"] else None
        dpath = os.path.join(DISTDIR, os.path.basename(spath))
        # district file names mostly match; fall back to STATE-derived name
        if not os.path.exists(dpath) and state:
            dpath = os.path.join(DISTDIR, state_file(state))
        if not os.path.exists(dpath):
            print(f"  ! no district file for {os.path.basename(spath)} — DISTRICT left null")
            for feat in sub["features"]:
                feat["properties"]["DISTRICT"] = None
            json.dump(sub, open(spath, "w", encoding="utf-8"), ensure_ascii=False)
            continue

        dist = json.load(open(dpath, encoding="utf-8"))
        dgeoms = [(f["properties"].get("DISTRICT"), bbox_of(f["geometry"]), f["geometry"])
                  for f in dist["features"]]

        s_linked = 0
        for feat in sub["features"]:
            total += 1
            cx, cy = centroid(feat["geometry"])
            hit = None
            if cx is not None:
                for dname, (x0, y0, x1, y1), geom in dgeoms:
                    if x0 <= cx <= x1 and y0 <= cy <= y1 and point_in_geom(cx, cy, geom):
                        hit = dname
                        break
            feat["properties"]["DISTRICT"] = hit
            if hit:
                linked += 1; s_linked += 1
            else:
                gap += 1
        json.dump(sub, open(spath, "w", encoding="utf-8"), ensure_ascii=False)
        per_state.append((state or os.path.basename(spath), len(sub["features"]), s_linked))

    for st, n, l in per_state:
        flag = "" if l == n else f"  ({n - l} unmatched)"
        print(f"  {st:<26} {l}/{n} linked{flag}")
    print(f"\nlinked {linked}/{total} sub-districts to a parent district "
          f"({gap} left null — honest gaps).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
