#!/usr/bin/env python3
"""
add_vehicles_dimension.py — attach the VEHICLES / RTO dimension to every district.

The "vehicles" segment for understanding a district: which Regional Transport
Office(s) register its vehicles, the RTO code you see on every number plate
(e.g. KA-01, WB-02, MH-12), and — where MoRTH's Vahan dashboard publishes it —
the count of registered vehicles.

Same iron rules as every other dimension (dimensions-schema.md):
  * SOURCED-OR-GAP. RTO codes + office names below are stable public facts
    (state transport departments / MoRTH). Registered-vehicle COUNTS are pinned
    only where a public Vahan figure is quotable; everything else is an explicit
    gap (figure_gap=True), never fabricated.
  * COMPARATIVE, not a verdict. We show where a district sits in the RTO system;
    we do not compute a "motorisation score".
  * Every block carries as_of + source + source_tier + level.

State-level fallback: every district in a state inherits the state's number-plate
PREFIX (e.g. every Karnataka district plate starts "KA") as level "state-prefix",
so the dimension is present everywhere; the specific district RTO code + office is
filled where known (level "district"), else a gap.

Idempotent. Run AFTER the ledger exists: python3 add_vehicles_dimension.py
"""
import json
import sys

LEDGER = "district-ledger.json"
VAHAN_SRC = "https://vahan.parivahan.gov.in/vahan4dashboard/"
MORTH_SRC = "https://morth.nic.in/"
AS_OF = "MoRTH Vahan / state transport dept (RTO codes stable; counts as-published)"

# ---------------------------------------------------------------------------
# STATE number-plate PREFIX — the letters every plate in the state/UT starts with.
# Stable public fact (MoRTH one-vehicle-one-code). Districts inherit this as the
# state-prefix fallback so the dimension is present for all 594.
# ---------------------------------------------------------------------------
STATE_PREFIX = {
    "Andhra Pradesh": "AP", "Arunachal Pradesh": "AR", "Assam": "AS", "Bihar": "BR",
    "Chhattisgarh": "CG", "Goa": "GA", "Gujarat": "GJ", "Haryana": "HR",
    "Himachal Pradesh": "HP", "Jharkhand": "JH", "Karnataka": "KA", "Kerala": "KL",
    "Madhya Pradesh": "MP", "Maharashtra": "MH", "Manipur": "MN", "Meghalaya": "ML",
    "Mizoram": "MZ", "Nagaland": "NL", "Odisha": "OD", "Punjab": "PB",
    "Rajasthan": "RJ", "Sikkim": "SK", "Tamil Nadu": "TN", "Telangana": "TS",
    "Tripura": "TR", "Uttar Pradesh": "UP", "Uttarakhand": "UK", "West Bengal": "WB",
    "Delhi": "DL", "Jammu & Kashmir": "JK", "Puducherry": "PY",
    "Andaman & Nicobar": "AN", "Chandigarh": "CH", "Lakshadweep": "LD",
    "Daman and Diu": "DD", "Dadra and Nagar Haveli": "DN",
}

# ---------------------------------------------------------------------------
# DISTRICT-level RTO — (state, district) -> {codes:[...], office, registered_vehicles}
# Codes are the well-known public RTO codes for that district's principal office.
# registered_vehicles: int only where a public Vahan figure is quotable, else None
# (an explicit gap). Keys must match the ledger's geoBoundaries district names —
# the join is verified at runtime and misses are reported, never silently dropped.
# ---------------------------------------------------------------------------
DISTRICT_RTO = {
    ("Delhi", "Delhi"):
        {"codes": ["DL-01", "DL-02", "DL-03", "DL-04", "DL-05", "DL-06", "DL-07",
                   "DL-08", "DL-09", "DL-10", "DL-11", "DL-12", "DL-13"],
         "office": "Delhi zonal RTOs (Mall Road, Sheikh Sarai, Janakpuri, …)",
         "registered_vehicles": None},
    ("West Bengal", "Kolkata"):
        {"codes": ["WB-01", "WB-02", "WB-03", "WB-04", "WB-05", "WB-06",
                   "WB-07", "WB-08", "WB-09", "WB-10"],
         "office": "Public Vehicles Dept, Kolkata (Beltala) + Kolkata RTOs",
         "registered_vehicles": None},
    ("Maharashtra", "Greater Bombay"):
        {"codes": ["MH-01", "MH-02", "MH-03"],
         "office": "RTO Mumbai (Tardeo) / West (Andheri) / East (Wadala)",
         "registered_vehicles": None},
    ("Maharashtra", "Pune"):
        {"codes": ["MH-12", "MH-14"], "office": "RTO Pune / Pimpri-Chinchwad",
         "registered_vehicles": None},
    ("Maharashtra", "Nagpur"):
        {"codes": ["MH-31", "MH-49"], "office": "RTO Nagpur (East/City)",
         "registered_vehicles": None},
    ("Tamil Nadu", "Chennai"):
        {"codes": ["TN-01", "TN-02", "TN-03", "TN-04", "TN-05", "TN-06",
                   "TN-07", "TN-09", "TN-10", "TN-11", "TN-12", "TN-13", "TN-14",
                   "TN-18", "TN-22", "TN-85"],
         "office": "Chennai Central & zonal RTOs", "registered_vehicles": None},
    ("Tamil Nadu", "Coimbatore"):
        {"codes": ["TN-37", "TN-38", "TN-66", "TN-99"], "office": "RTO Coimbatore",
         "registered_vehicles": None},
    ("Tamil Nadu", "Madurai"):
        {"codes": ["TN-58", "TN-59", "TN-64"], "office": "RTO Madurai",
         "registered_vehicles": None},
    ("Karnataka", "Bangalore Urban"):   # geoBoundaries name for Bengaluru
        {"codes": ["KA-01", "KA-02", "KA-03", "KA-04", "KA-05", "KA-41",
                   "KA-50", "KA-51", "KA-53"],
         "office": "Bengaluru Central & zonal RTOs", "registered_vehicles": None},
    ("Andhra Pradesh", "Hyderabad"):   # ledger files Hyderabad under AP (pre-bifurcation names)
        {"codes": ["TS-09", "TS-10", "TS-11", "TS-12", "TS-13", "TS-14", "TS-15"],
         "office": "Hyderabad zonal RTAs (Telangana)", "registered_vehicles": None},
    ("Gujarat", "Surat"):
        {"codes": ["GJ-05"], "office": "RTO Surat", "registered_vehicles": None},
    ("Gujarat", "Vadodara"):
        {"codes": ["GJ-06"], "office": "RTO Vadodara", "registered_vehicles": None},
    ("Rajasthan", "Jaipur"):
        {"codes": ["RJ-14", "RJ-45", "RJ-47"], "office": "RTO Jaipur",
         "registered_vehicles": None},
    ("Uttar Pradesh", "Lucknow"):
        {"codes": ["UP-32"], "office": "RTO Lucknow", "registered_vehicles": None},
    ("Uttar Pradesh", "Varanasi"):
        {"codes": ["UP-65"], "office": "RTO Varanasi", "registered_vehicles": None},
    ("Kerala", "Thiruvananthapuram"):
        {"codes": ["KL-01", "KL-16", "KL-19", "KL-20", "KL-21", "KL-74"],
         "office": "RTO Thiruvananthapuram", "registered_vehicles": None},
    ("Kerala", "Ernakulam"):
        {"codes": ["KL-07", "KL-17", "KL-39", "KL-40", "KL-41", "KL-42",
                   "KL-43", "KL-63"], "office": "RTO Ernakulam (Kochi)",
         "registered_vehicles": None},
    ("Kerala", "Kozhikode"):
        {"codes": ["KL-11", "KL-18", "KL-56", "KL-57"], "office": "RTO Kozhikode",
         "registered_vehicles": None},
    ("Assam", "Kamrup"):
        {"codes": ["AS-01"], "office": "DTO Kamrup (Guwahati)",
         "registered_vehicles": None},
    ("Bihar", "Patna"):
        {"codes": ["BR-01"], "office": "DTO Patna", "registered_vehicles": None},
    ("Bihar", "Munger"):
        {"codes": ["BR-08"], "office": "DTO Munger", "registered_vehicles": None},
    ("Chhattisgarh", "Raipur"):
        {"codes": ["CG-04"], "office": "RTO Raipur", "registered_vehicles": None},
    ("Madhya Pradesh", "Indore"):
        {"codes": ["MP-09"], "office": "RTO Indore", "registered_vehicles": None},
    ("Odisha", "Khordha"):
        {"codes": ["OD-02", "OD-33"], "office": "RTO Khordha (Bhubaneswar)",
         "registered_vehicles": None},
    ("Punjab", "Amritsar"):
        {"codes": ["PB-02"], "office": "RTO Amritsar", "registered_vehicles": None},
    ("Punjab", "Ludhiana"):
        {"codes": ["PB-10"], "office": "RTO Ludhiana", "registered_vehicles": None},
    ("Jammu & Kashmir", "Srinagar"):
        {"codes": ["JK-01"], "office": "RTO Kashmir (Srinagar)",
         "registered_vehicles": None},
    ("Goa", "North Goa"):
        {"codes": ["GA-03", "GA-07", "GA-08", "GA-10", "GA-11"],
         "office": "RTO Panaji / Mapusa", "registered_vehicles": None},
    ("Goa", "South Goa"):
        {"codes": ["GA-02", "GA-04", "GA-05", "GA-06", "GA-09"],
         "office": "RTO Margao / Vasco", "registered_vehicles": None},
    ("Chandigarh", "Chandigarh"):
        {"codes": ["CH-01", "CH-02", "CH-03", "CH-04"], "office": "RLA Chandigarh",
         "registered_vehicles": None},
}


def main():
    with open(LEDGER, encoding="utf-8") as f:
        data = json.load(f)

    n_state = 0
    n_dist = 0
    n_district_rto = 0
    missing_prefix = set()
    unmatched_rto = []

    # verify every DISTRICT_RTO key resolves to a real ledger district
    ledger_pairs = {(sn, dn) for sn, s in data["states"].items()
                    for dn in s.get("districts", {})}
    for key in DISTRICT_RTO:
        if key not in ledger_pairs:
            unmatched_rto.append(key)

    for sname, s in data["states"].items():
        prefix = STATE_PREFIX.get(sname)
        if prefix is None:
            missing_prefix.add(sname)
        n_state += 1

        for dname, dist in s.get("districts", {}).items():
            n_dist += 1
            dims = dist.setdefault("dimensions", {})
            rto = DISTRICT_RTO.get((sname, dname))

            block = {
                "plate_prefix": prefix,
                "rto_codes": rto["codes"] if rto else None,
                "rto_office": rto["office"] if rto else None,
                "registered_vehicles": rto["registered_vehicles"] if rto else None,
                "level": "district" if rto else ("state-prefix" if prefix else "gap"),
                "as_of": AS_OF,
                "figure_gap": not (rto and rto.get("registered_vehicles") is not None),
                "source": VAHAN_SRC if rto else MORTH_SRC,
                "source_tier": 2,
                "note": (
                    "District RTO code(s) + office (state transport dept / MoRTH). "
                    "Registered-vehicle count is a gap unless a public Vahan figure "
                    "is pinned — not fabricated."
                    if rto else
                    "State number-plate prefix shown (every plate in the state starts "
                    "with it); the specific district RTO code + office is a gap here."
                ),
            }
            dims["vehicles"] = block
            if rto:
                n_district_rto += 1

            gaps = dist.setdefault("_gaps", [])
            for g in [
                "vehicles registered-count (MoRTH Vahan per-district) unsourced",
            ] + ([] if rto else ["vehicles district RTO code + office unsourced"]):
                if g not in gaps:
                    gaps.append(g)

    with open(LEDGER, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"vehicles / RTO dimension attached: {n_state} states + {n_dist} districts")
    print(f"  district-level RTO pinned: {n_district_rto}")
    print(f"  states missing plate prefix: {sorted(missing_prefix) or 'none'}")
    if unmatched_rto:
        print(f"  !! DISTRICT_RTO keys that did NOT match a ledger district "
              f"(fix the name): {unmatched_rto}")
    else:
        print("  all DISTRICT_RTO keys matched a ledger district.")
    print("  registered-vehicle counts left as gap (no fabrication).")
    return 1 if unmatched_rto else 0


if __name__ == "__main__":
    sys.exit(main())
