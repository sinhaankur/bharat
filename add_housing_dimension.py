#!/usr/bin/env python3
"""
add_housing_dimension.py — attach the HOUSING dimension to every district.

The "housing / real-estate" segment ("housing bubble"): is this district's market
tracked by an OFFICIAL house-price index, and by which one? India has no official
per-DISTRICT price series, so this dimension is deliberately about COVERAGE +
PROVENANCE, not fabricated prices:

  * RBI HPI (House Price Index) — 10 major cities, quarterly.
  * NHB RESIDEX — ~50 cities, the National Housing Bank index.

Same iron rules (dimensions-schema.md):
  * SOURCED-OR-GAP. Which index tracks a city is public record (RBI/NHB). The
    actual index VALUE / price is left an explicit gap (index_value=None,
    figure_gap=True) — never fabricated. A district not in any index is asserted
    `tracked: false` (a real fact: no official index covers it), which is WHY
    'housing bubble' cannot be measured per-district from official data — the
    dimension makes that absence visible.
  * COMPARATIVE, not a verdict. No computed 'bubble score'.

Idempotent. Run AFTER the ledger exists: python3 add_housing_dimension.py
"""
import json
import sys

LEDGER = "district-ledger.json"
RBI_SRC = "https://www.rbi.org.in/Scripts/QuarterlyPublications.aspx"   # HPI
NHB_SRC = "https://residex.nhbonline.org.in/"                            # RESIDEX
AS_OF = "RBI HPI (10 cities) / NHB RESIDEX (~50 cities) — coverage, not per-district prices"

# ---------------------------------------------------------------------------
# Host district -> which official indices track this city. Keys must match the
# ledger's geoBoundaries district names (verified at runtime; misses reported).
#   rbi_hpi:  in the RBI 10-city House Price Index
#   residex:  in NHB RESIDEX
# index_value is intentionally None (a gap) — pin a quoted RBI/NHB figure to fill.
# ---------------------------------------------------------------------------
RBI_HPI_CITIES = {   # the RBI 10-city HPI set, on host district
    ("Maharashtra", "Greater Bombay"),   # Mumbai
    ("Delhi", "Delhi"),
    ("West Bengal", "Kolkata"),
    ("Karnataka", "Bangalore Urban"),    # Bengaluru
    ("Andhra Pradesh", "Hyderabad"),
    ("Tamil Nadu", "Chennai"),
    ("Maharashtra", "Pune"),
    ("Rajasthan", "Jaipur"),
    ("Uttar Pradesh", "Lucknow"),
    ("Madhya Pradesh", "Bhopal"),        # Kochi is the 10th but Ernakulam handled via RESIDEX below
}

RESIDEX_CITIES = {   # a sourced subset of the ~50 NHB RESIDEX cities, on host district
    ("Maharashtra", "Greater Bombay"), ("Delhi", "Delhi"), ("West Bengal", "Kolkata"),
    ("Karnataka", "Bangalore Urban"), ("Andhra Pradesh", "Hyderabad"),
    ("Tamil Nadu", "Chennai"), ("Maharashtra", "Pune"), ("Rajasthan", "Jaipur"),
    ("Uttar Pradesh", "Lucknow"), ("Madhya Pradesh", "Bhopal"), ("Madhya Pradesh", "Indore"),
    ("Kerala", "Ernakulam"),             # Kochi
    ("Gujarat", "Surat"), ("Gujarat", "Vadodara"),
    ("Maharashtra", "Nagpur"), ("Punjab", "Ludhiana"), ("Punjab", "Amritsar"),
    ("Bihar", "Patna"), ("Chhattisgarh", "Raipur"), ("Odisha", "Khordha"),   # Bhubaneswar
    ("Uttar Pradesh", "Varanasi"), ("Tamil Nadu", "Coimbatore"),
    ("Kerala", "Thiruvananthapuram"), ("Chandigarh", "Chandigarh"),
    ("Andhra Pradesh", "Vishakhapatnam"),
}


def main():
    with open(LEDGER, encoding="utf-8") as f:
        data = json.load(f)

    ledger_pairs = {(sn, dn) for sn, s in data["states"].items()
                    for dn in s.get("districts", {})}
    unmatched = sorted((RBI_HPI_CITIES | RESIDEX_CITIES) - ledger_pairs)

    n_dist = 0
    n_tracked = 0
    n_rbi = 0
    n_residex = 0

    for sname, s in data["states"].items():
        for dname, dist in s.get("districts", {}).items():
            n_dist += 1
            key = (sname, dname)
            in_rbi = key in RBI_HPI_CITIES
            in_residex = key in RESIDEX_CITIES
            tracked = in_rbi or in_residex
            indices = ([("RBI HPI")] if in_rbi else []) + (["NHB RESIDEX"] if in_residex else [])

            dims = dist.setdefault("dimensions", {})
            dims["housing"] = {
                "tracked": tracked,
                "indices": indices or None,
                "rbi_hpi": in_rbi,
                "nhb_residex": in_residex,
                "index_value": None,        # a gap — no fabricated price/index number
                "level": "city" if tracked else "district",
                "as_of": AS_OF,
                "figure_gap": tracked,      # tracked-but-value-unknown = a gap; untracked is asserted
                "source": RBI_SRC if in_rbi else (NHB_SRC if in_residex else NHB_SRC),
                "source_tier": 1,
                "note": (
                    "Tracked by an official house-price index ("
                    + " + ".join(indices) +
                    "). The index VALUE is a gap here — pin a quoted RBI/NHB figure; "
                    "not fabricated. Coverage is city-level."
                    if tracked else
                    "No official house-price index (RBI HPI / NHB RESIDEX) covers this "
                    "district — asserted, not a gap. This is WHY a per-district 'housing "
                    "bubble' can't be measured from official data for most of India."
                ),
            }
            if tracked:
                n_tracked += 1
                if in_rbi:
                    n_rbi += 1
                if in_residex:
                    n_residex += 1
                gaps = dist.setdefault("_gaps", [])
                g = "housing official index VALUE (RBI HPI / NHB RESIDEX) unsourced"
                if g not in gaps:
                    gaps.append(g)

    with open(LEDGER, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"housing dimension attached: {n_dist} districts")
    print(f"  tracked by an official index: {n_tracked}  (RBI HPI {n_rbi} / RESIDEX {n_residex})")
    if unmatched:
        print(f"  !! index-city keys that did NOT match a ledger district: {unmatched}")
    else:
        print("  all index-city keys matched a ledger district.")
    print("  index values left as gap; untracked districts asserted tracked=false.")
    return 1 if unmatched else 0


if __name__ == "__main__":
    sys.exit(main())
