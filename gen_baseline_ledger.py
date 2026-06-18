#!/usr/bin/env python3
"""
Generate a BASELINE ledger entry for every district in districts/*.geojson,
WITHOUT touching the hand-authored deep exemplars.

Each baseline entry is an honest skeleton: an admin-model classification
(heuristic), empty roster/ledger/plants, and an explicit _gaps list. Nothing is
fabricated — a baseline district shows structure + "data not yet sourced", so
the map and drill-down light up nationwide while staying truthful.

Deep districts (Kolkata, Birbhum, Purba Singhbhum) are preserved verbatim.

Usage:  python3 gen_baseline_ledger.py        # writes district-ledger.json in place
        python3 gen_baseline_ledger.py --dry   # report only
"""
import json, glob, sys, os

ROOT = os.path.dirname(os.path.abspath(__file__))
LEDGER = os.path.join(ROOT, "district-ledger.json")

# Districts we authored by hand — never regenerate these.
DEEP = {("West Bengal", "Kolkata"), ("West Bengal", "Birbhum"),
        ("Jharkhand", "Purba Singhbhum")}

# State -> entity type (drives which heads exist).
UT_LEGISLATURE = {"Delhi", "Jammu & Kashmir", "Puducherry"}
UT_NO_LEG = {"Chandigarh", "Andaman & Nicobar", "Lakshadweep",
             "Dadra and Nagar Haveli", "Daman and Diu", "Ladakh"}

# Known non-standard district admin models (extend as researched).
KNOWN_ADMIN = {
    ("West Bengal", "Kolkata"): "split",
    ("Jharkhand", "Purba Singhbhum"): "company_township",
    # metros where the Police Commissionerate / municipal corp split applies
    ("Maharashtra", "Mumbai"): "split",
    ("Maharashtra", "Mumbai City"): "split",
    ("Maharashtra", "Mumbai Suburban"): "split",
    ("Tamil Nadu", "Chennai"): "split",
    ("Karnataka", "Bangalore"): "split",
    ("Karnataka", "Bengaluru Urban"): "split",
    ("Telangana", "Hyderabad"): "split",
}

# State-name normalisation: geojson STATE -> our display name.
STATE_FIX = {
    "Andaman and Nicobar": "Andaman & Nicobar",
    "Jammu and Kashmir": "Jammu & Kashmir",
    "NCT of Delhi": "Delhi",
    "Orissa": "Odisha",
}


def state_disp(raw):
    return STATE_FIX.get(raw, raw)


def entity_type(state):
    if state in UT_LEGISLATURE:
        return "ut_legislature"
    if state in UT_NO_LEG:
        return "ut_no_legislature"
    return "state"


def admin_model(state, district):
    if (state, district) in KNOWN_ADMIN:
        return KNOWN_ADMIN[(state, district)]
    return "standard"  # honest default; corrected as districts are researched


def heads_block(state):
    et = entity_type(state)
    const_head = ("Lieutenant Governor" if et == "ut_legislature"
                  else "Administrator" if et == "ut_no_legislature"
                  else "Governor")
    h = {
        ("lt_governor" if et == "ut_legislature"
         else "administrator" if et == "ut_no_legislature"
         else "governor"):
            {"name": None, "post": const_head, "as_of": None, "source": None, "source_tier": None},
        "chief_secretary": {"name": None, "post": "Chief Secretary", "as_of": None, "source": None, "source_tier": None},
        "dgp": {"name": None, "post": "Director General of Police", "as_of": None, "source": None, "source_tier": None},
        "high_court": {"name": None, "chief_justice": None, "source": None},
    }
    if et != "ut_no_legislature":
        h["chief_minister"] = {"name": None, "post": "Chief Minister", "as_of": None, "source": None, "source_tier": None}
    return h


def baseline_district(state, district):
    return {
        "admin_model": admin_model(state, district),
        "baseline": True,  # flag: skeleton, not hand-sourced
        "system_notes": [],
        "roster": {
            "collector": {"name": None,
                          "post": ("Deputy Commissioner" if entity_type(state) != "state" else "District Magistrate & Collector"),
                          "service": "IAS", "as_of": None, "source": None, "source_tier": None},
            "sp": {"name": None, "post": "Superintendent of Police", "service": "IPS", "as_of": None, "source": None, "source_tier": None},
            "district_judge": {"name": None, "post": "District & Sessions Judge", "service": "Judicial", "as_of": None, "source": None, "source_tier": None},
        },
        "legislature": {"lok_sabha": [], "assembly": []},
        "plants": [],
        "departments": [],
        "ledger": [],
        "_gaps": ["roster_names", "lok_sabha_mps", "assembly_mlas",
                  "money_flows", "scheme_utilisation", "plants",
                  "all figures — baseline skeleton, not yet sourced"],
    }


def main():
    dry = "--dry" in sys.argv
    led = json.load(open(LEDGER))
    states = led["states"]

    added = 0
    preserved = 0
    state_count = 0

    for f in sorted(glob.glob(os.path.join(ROOT, "districts", "*.geojson"))):
        geo = json.load(open(f))
        # state name from feature props (consistent within a file)
        props0 = geo["features"][0]["properties"]
        raw_state = props0.get("STATE") or props0.get("NAME_1")
        state = state_disp(raw_state)
        state_count += 1

        if state not in states:
            states[state] = {"entity_type": entity_type(state),
                             "heads": heads_block(state),
                             "rajya_sabha": [], "districts": {}}

        for feat in geo["features"]:
            p = feat["properties"]
            dn = p.get("DISTRICT") or p.get("NAME_2")
            if not dn:
                continue
            if (state, dn) in DEEP or (dn in states[state]["districts"] and states[state]["districts"][dn].get("baseline") is not True and not dry):
                # preserve deep/hand-authored entries
                if (state, dn) in DEEP or dn in states[state]["districts"]:
                    preserved += 1
                    continue
            if dn in states[state]["districts"] and states[state]["districts"][dn].get("baseline"):
                # already a baseline — refresh idempotently
                pass
            states[state]["districts"][dn] = baseline_district(state, dn)
            added += 1

    # update coverage meta
    total_districts = sum(len(s["districts"]) for s in states.values())
    deep = sum(1 for s in states.values() for d in s["districts"].values() if not d.get("baseline"))
    led["_meta"]["coverage"]["districts"] = total_districts
    led["_meta"]["coverage"]["deep_districts"] = deep
    led["_meta"]["coverage"]["baseline_districts"] = total_districts - deep
    led["_meta"]["coverage"]["note"] = (
        f"{total_districts} districts across {len(states)} states/UTs. "
        f"{deep} hand-authored deep exemplars (Kolkata, Birbhum, Jamshedpur); "
        f"the rest are honest baseline skeletons (admin-model classified, "
        f"empty roster/ledger with explicit _gaps — not fabricated).")

    if dry:
        print(f"DRY: would add {added} baselines, preserve {preserved}, "
              f"{state_count} state files -> {len(states)} states, {total_districts} districts total")
        return

    json.dump(led, open(LEDGER, "w"), indent=2, ensure_ascii=False)
    print(f"Wrote {LEDGER}: +{added} baselines, {preserved} preserved, "
          f"{total_districts} districts across {len(states)} states ({deep} deep).")


if __name__ == "__main__":
    main()
