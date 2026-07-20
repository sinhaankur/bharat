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
            for c in (enc.get("cases") or []):
                ll = cent.get(f"{state}|{district}")
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
                    "latlng": ll,   # district centroid — approximate, not the exact site
                })

    # newest first, then by state for a stable order
    cases.sort(key=lambda c: (-(c["year"] or 0), c["state"], c["district"]))

    payload = {
        "_meta": {
            "purpose": "Documented cases of construction on land the water reclaims "
                       "(floodplain / lakebed / wetland), each ruled on by NGT / a court / "
                       "CAG. Generated from the district ledger's geography dimension — "
                       "documented-only, sourced-or-gap; latlng is the district centroid "
                       "(approximate placement, not the exact site).",
            "count": len(cases),
            "districts": len({(c["state"], c["district"]) for c in cases}),
        },
        "cases": cases,
    }
    json.dump(payload, open(OUT, "w"), ensure_ascii=False, separators=(",", ":"))
    print(f"wrote {OUT}: {len(cases)} cases across "
          f"{payload['_meta']['districts']} districts")


if __name__ == "__main__":
    main()
