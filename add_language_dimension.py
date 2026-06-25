#!/usr/bin/env python3
"""
add_language_dimension.py — attach the LANGUAGE dimension to every district,
per dimensions-schema.md.

Honest scope (the hard part): full district-level mother-tongue *percentages*
(Census 2011 table C-16) are not uniformly machine-available and must not be
faked. What IS reliable, statutory fact is each STATE/UT's official language(s)
— from each state's Official Languages Act / the Constitution's Eighth Schedule.

So every district gets:
  - dimensions.language.state_official  = the state's official language(s)  [sourced]
  - dimensions.language.dominant_mother_tongue = null  + figure_gap         [honest gap]
  - level field so a state-official value is never mistaken for a district count.

This gives real structure for all 594 districts with zero fabrication; the
district mother-tongue %s fill in later from Census C-16 where sourced.

Idempotent. Run: python3 add_language_dimension.py
"""
import json
import sys

LEDGER = "district-ledger.json"

EIGHTH_SCHEDULE_NOTE = "Constitution of India, Eighth Schedule + the state's Official Languages Act."
CENSUS = "https://censusindia.gov.in/"  # C-16 mother tongue (district fills later)

# State / UT -> official language(s). Statutory fact (not a count). Where a state
# has more than one official language, list them. 'link' languages (English/Hindi
# at the Union level) are not repeated per state unless they are a state official.
STATE_OFFICIAL = {
    "Andhra Pradesh": ["Telugu"],
    "Arunachal Pradesh": ["English"],
    "Assam": ["Assamese"],
    "Bihar": ["Hindi", "Urdu"],
    "Chhattisgarh": ["Hindi", "Chhattisgarhi"],
    "Goa": ["Konkani"],
    "Gujarat": ["Gujarati"],
    "Haryana": ["Hindi"],
    "Himachal Pradesh": ["Hindi"],
    "Jharkhand": ["Hindi"],
    "Karnataka": ["Kannada"],
    "Kerala": ["Malayalam"],
    "Madhya Pradesh": ["Hindi"],
    "Maharashtra": ["Marathi"],
    "Manipur": ["Meitei (Manipuri)"],
    "Meghalaya": ["English"],
    "Mizoram": ["Mizo", "English"],
    "Nagaland": ["English"],
    "Odisha": ["Odia"],
    "Punjab": ["Punjabi"],
    "Rajasthan": ["Hindi"],
    "Sikkim": ["Nepali", "English"],
    "Tamil Nadu": ["Tamil"],
    "Telangana": ["Telugu", "Urdu"],
    "Tripura": ["Bengali", "Kokborok"],
    "Uttar Pradesh": ["Hindi", "Urdu"],
    "Uttarakhand": ["Hindi"],
    "West Bengal": ["Bengali"],
    # UTs
    "Andaman & Nicobar": ["Hindi", "English"],
    "Chandigarh": ["English"],
    "Dadra and Nagar Haveli": ["Gujarati", "Hindi"],
    "Daman and Diu": ["Gujarati", "Konkani"],
    "Delhi": ["Hindi"],
    "Jammu & Kashmir": ["Kashmiri", "Dogri", "Urdu", "Hindi", "English"],
    "Lakshadweep": ["Malayalam"],
    "Puducherry": ["Tamil"],
}


def main():
    with open(LEDGER, encoding="utf-8") as f:
        data = json.load(f)

    n_dist = 0
    n_with_official = 0
    missing_states = set()

    for sname, s in data["states"].items():
        official = STATE_OFFICIAL.get(sname)
        if official is None:
            missing_states.add(sname)
        for dname, dist in s.get("districts", {}).items():
            n_dist += 1
            dims = dist.setdefault("dimensions", {})
            dims["language"] = {
                "state_official": official,            # statutory fact (or null)
                "state_official_source": EIGHTH_SCHEDULE_NOTE if official else None,
                "state_official_source_tier": 2 if official else None,
                "dominant_mother_tongue": None,        # Census C-16 — district-level
                "dominant_pct": None,
                "top3": [],
                "level": "state-official",             # NOT a district count
                "figure_gap": True,
                "source": CENSUS,
                "source_tier": None,
                "note": "State official language is statutory fact; district-level "
                        "mother-tongue %s are a gap until sourced from Census 2011 "
                        "table C-16 — never estimated.",
            }
            if official:
                n_with_official += 1
            gaps = dist.setdefault("_gaps", [])
            gnote = "language.dominant_mother_tongue (Census C-16, district-level) unsourced"
            if gnote not in gaps:
                gaps.append(gnote)

    with open(LEDGER, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"language dimension attached to {n_dist} districts")
    print(f"  with state-official language : {n_with_official}")
    print(f"  states missing from table    : {sorted(missing_states) or 'none'}")
    print("  district mother-tongue %s left as explicit gaps (no fabrication).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
