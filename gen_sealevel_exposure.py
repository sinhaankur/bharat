#!/usr/bin/env python3
"""gen_sealevel_exposure.py — how many districts sit below each sea-level stop.

Reads the per-district flood-exposure figures (open-DEM: pct area below 5 m / 10 m,
and min/mean elevation) from the ledger and emits a tiny sealevel-exposure.json the
3D page loads to answer "at +N m, how many of the 594 districts have land under
this line" — a real, sourced count per slider stop, no ledger shipped to the browser.

Threshold logic (honest to what the DEM supports):
  • area-based (b5, b10) where we have a real % of area below that height;
  • min-elevation based for the others (a district "has ground below N m" if its
    lowest DEM pixel is below N m).

Regenerate after the geography dimension changes:
    python3 gen_sealevel_exposure.py
"""
import json

LEDGER = "district-ledger.json"
OUT = "sealevel-exposure.json"

# slider stops → how we count "below this line" for each
STOPS = [1, 2, 5, 10, 30, 70]


def main():
    led = json.load(open(LEDGER))
    recs = []
    for state, s in led.get("states", {}).items():
        for district, d in (s.get("districts") or {}).items():
            fe = (d.get("dimensions") or {}).get("geography", {}).get("flood_exposure") or {}
            if fe.get("figure_gap"):
                continue
            recs.append({
                "district": district, "state": state,
                "b5": fe.get("pct_area_below_5m"),
                "b10": fe.get("pct_area_below_10m"),
                "min_m": fe.get("min_m"),
                "mean_m": fe.get("mean_m"),
            })

    total = len(recs)

    def below_min(m):
        return [r for r in recs if isinstance(r["min_m"], (int, float)) and r["min_m"] < m]

    def area_below(field):
        return [r for r in recs if isinstance(r.get(field), (int, float)) and r[field] > 0]

    stops = {}
    for m in STOPS:
        if m == 5:
            hits = area_below("b5"); basis = "area below 5 m (open DEM)"
        elif m == 10:
            hits = area_below("b10"); basis = "area below 10 m (open DEM)"
        else:
            hits = below_min(m); basis = f"lowest ground below {m} m (min DEM elevation)"
        # rank the most-exposed for a headline, by area% at 10 m (a stable proxy)
        top = sorted(hits, key=lambda r: -(r["b10"] if isinstance(r["b10"], (int, float)) else 0))[:6]
        stops[str(m)] = {
            "count": len(hits),
            "pct_of_districts": round(len(hits) / total * 100),
            "basis": basis,
            "top": [{"district": r["district"], "state": r["state"],
                     "pct_below_10m": r["b10"]} for r in top],
        }

    payload = {
        "_meta": {
            "purpose": "District counts below each 3D sea-level stop — from open-DEM "
                       "flood-exposure figures. A bathtub count, not a hydrological "
                       "projection; area-based where available (5 m/10 m), else lowest-"
                       "elevation based.",
            "total_districts": total,
            "source": "AWS Terrain Tiles (open SRTM/NASADEM) per-district raster",
        },
        "stops": stops,
    }
    json.dump(payload, open(OUT, "w"), separators=(",", ":"))
    print(f"wrote {OUT}: {total} districts, stops " +
          ", ".join(f"+{m}m={stops[str(m)]['count']}" for m in STOPS))


if __name__ == "__main__":
    main()
