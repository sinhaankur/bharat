#!/usr/bin/env python3
"""gen_encroachment_cases.py — extract the "built where the water returns" cases.

Walks the district ledger's geography dimension and pulls every documented
encroachment case (construction on a floodplain / lakebed / wetland that a court /
NGT / CAG has ruled on) into one compact encroachment-cases.json. This is the
single source for the encroachment atlas page — it can't drift from the ledger
because it's generated from it.

Documented cases only (each already carries its own court order + source in the
ledger); nothing invented. Regenerate after editing the geography dimension:
    python3 gen_encroachment_cases.py
"""
import json

LEDGER = "district-ledger.json"
CENTROIDS = "district-centroids.json"
OUT = "encroachment-cases.json"

# Curated coordinates of the ACTUAL water body / floodplain each case sits on — public,
# well-known named features (lake / marsh / river reach). Keyed by "State|District".
# Approximate to the feature centre (not a survey point), but far tighter than the district
# centroid. Placement only — no factual claim beyond "this is roughly where that water is".
SITE_COORDS = {
    "West Bengal|Kolkata": [22.5510, 88.4300],          # East Kolkata Wetlands (E of the city)
    "Karnataka|Bangalore Urban": [12.9350, 77.6700],    # Bellandur lake
    "Tamil Nadu|Chennai": [12.9400, 80.2100],           # Pallikaranai marsh
    "Delhi|Delhi": [28.6300, 77.2600],                  # Yamuna floodplain (Delhi stretch)
    "Maharashtra|Greater Bombay": [19.0600, 72.8600],   # Mithi river / BKC
    "Andhra Pradesh|Hyderabad": [17.4240, 78.4730],     # Hussain Sagar (ledger files Hyderabad under AP)
    "Assam|Kamrup": [26.1300, 91.6500],                 # Deepor Beel (W of Guwahati)
    "Madhya Pradesh|Bhopal": [23.2600, 77.3300],        # Bhoj Upper Lake
    "Gujarat|Ahmadabad": [23.0300, 72.5800],            # Sabarmati riverfront
    "Gujarat|Vadodara": [22.3000, 73.2000],             # Vishwamitri river
    "Maharashtra|Pune": [18.5200, 73.8500],             # Mula-Mutha confluence
    "Haryana|Gurgaon": [28.4200, 77.0700],              # Najafgarh jheel / Basai wetland
    "Jammu & Kashmir|Srinagar": [34.1200, 74.8600],     # Dal Lake
    "Jammu and Kashmir|Srinagar": [34.1200, 74.8600],
    "Andhra Pradesh|Krishna": [16.6500, 80.9000],       # Budameru near Vijayawada
}
SITE_SOURCE = "Curated centre of the named water body / floodplain (public geography) — approximate placement, not a survey point"


# Human labels + unit for the timeline metrics we surface as a before→after loss.
LOSS_LABEL = {
    "wular_openwater_km2": ("Wular open water", "km²"),
    "marsh_area_ha": ("marsh area", "ha"),
    "lake_extent_index": ("lake extent", " (1979=100)"),
    "water_bodies": ("water bodies", ""),
    "wetland_area_km2": ("wetland area", "km²"),
    "lake_count": ("lakes", ""),
    "builtup_pct": ("built-up in the catchment", "%"),
    "dal_openwater_km2": ("Dal open water", "km²"),
}


def loss_from_timeline(tl):
    """Earliest vs latest numeric point of the same metric → a before→after loss dict."""
    pts = [p for p in (tl.get("points") or [])
           if isinstance(p.get("value"), (int, float)) and not isinstance(p.get("value"), bool)]
    by_metric = {}
    for p in pts:
        by_metric.setdefault(p["metric"], []).append(p)
    best = None
    for metric, ps in by_metric.items():
        if len(ps) < 2:
            continue
        ps = sorted(ps, key=lambda x: x["year"])
        a, b = ps[0], ps[-1]
        label, unit = LOSS_LABEL.get(metric, (metric.replace("_", " "), ""))
        pct = round((b["value"] - a["value"]) / a["value"] * 100) if a["value"] else None
        best = {
            "metric": metric, "label": label, "unit": unit,
            "from": a["value"], "from_year": a["year"],
            "to": b["value"], "to_year": b["year"], "pct": pct,
            # every sourced point [year, value], so the atlas can scrub a timeline
            # (values BETWEEN points are interpolated — the dots are the real data).
            "points": [[p["year"], p["value"]] for p in ps],
        }
    return best, (tl.get("range_note") or None)


def main():
    led = json.load(open(LEDGER))
    try:
        cent = json.load(open(CENTROIDS)).get("centroids", {})
    except FileNotFoundError:
        cent = {}

    cases = []
    for state, s in led.get("states", {}).items():
        for district, d in (s.get("districts") or {}).items():
            g = (d.get("dimensions") or {}).get("geography") or {}
            enc = g.get("encroachment") or {}
            # flood-consequence figures for this district (the "and this is why it floods" half)
            fe = g.get("flood_exposure") or {}
            low_pct = fe.get("pct_area_below_10m") if not fe.get("figure_gap") else None
            flood_level = g.get("flood_level")
            rivers = g.get("major_rivers") or []

            # what was lost, over time — the earliest vs latest numeric point of the same
            # metric in the district's water-body timeline. A real before→after, sourced.
            loss, loss_note = loss_from_timeline(g.get("timeline") or {})

            for c in (enc.get("cases") or []):
                key = f"{state}|{district}"
                centroid = cent.get(key)
                site = SITE_COORDS.get(key)
                # best available position: the curated site if we have one, else the centroid
                latlng = site or centroid
                cases.append({
                    "state": state,
                    "district": district,
                    "type": c.get("type"),
                    "water_body": c.get("water_body"),
                    "year": c.get("year"),
                    "detail": c.get("detail"),
                    "order_ref": c.get("order_ref"),
                    "status": c.get("status"),
                    "source": c.get("source"),
                    "latlng": latlng,               # best available (site if known)
                    "site_latlng": site,            # curated water-body centre, or null
                    "centroid_latlng": centroid,    # district centroid fallback
                    "placement": "site" if site else ("district" if centroid else None),
                    # flood consequence — the "and this is why it floods" half of the story
                    "low_lying_pct": low_pct,       # % of district < 10 m (DEM); null where a gap
                    "flood_level": flood_level,     # district-chronic / state-flood-prone / not-flagged
                    "rivers": rivers[:3],           # the rivers whose plain this sits on
                    "loss": loss,                   # {metric, from, to, from_year, to_year, pct} or null
                    "loss_note": loss_note,         # the timeline range_note (story fallback)
                })

    # newest first, then by state for a stable order
    cases.sort(key=lambda c: (-(c["year"] or 0), c["state"], c["district"]))

    payload = {
        "_meta": {
            "purpose": "Documented cases of construction on land the water reclaims "
                       "(floodplain / lakebed / wetland), each ruled on by NGT / a court / "
                       "CAG. Generated from the district ledger's geography dimension — "
                       "documented-only, sourced-or-gap. latlng = best available position: "
                       "the curated water-body centre (placement='site') where known, else "
                       "the district centroid (placement='district'). Neither is a survey point.",
            "site_source": SITE_SOURCE,
            "count": len(cases),
            "districts": len({(c["state"], c["district"]) for c in cases}),
            "sited": sum(1 for c in cases if c["placement"] == "site"),
        },
        "cases": cases,
    }
    json.dump(payload, open(OUT, "w"), ensure_ascii=False, separators=(",", ":"))
    print(f"wrote {OUT}: {len(cases)} cases across "
          f"{payload['_meta']['districts']} districts")


if __name__ == "__main__":
    main()
