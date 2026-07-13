#!/usr/bin/env python3
"""
add_health_economy_dimension.py — attach the HEALTH and ECONOMY dimensions.

The user's recurring vision: "wealth AND health" — money matters, but so does how
people actually live. This adds two SOURCED state-level dimensions beside the money
+ land layers:

  dimensions.health  — infant mortality (IMR), institutional births, full
                       immunisation, stunting (children under-5) — NFHS-5 (2019-21).
  dimensions.economy — per-capita net state domestic product (NSDP) and a broad
                       income tier — RBI 'Handbook of Statistics on Indian States'.

Same iron rules as every other dimension (dimensions-schema.md):
  * SOURCED-OR-GAP. State-level figures below are REAL published values (NFHS-5 state
    fact sheets; RBI Handbook). Per-district health (NFHS district fact sheets exist
    but are per-PDF, not a bulk table) and per-district income are left as explicit
    gaps → level "state-proxy", never fabricated per-district numbers.
  * COMPARATIVE, not a verdict. We show IMR / stunting / per-capita income beside the
    money flow; we do NOT compute a "wellbeing score".
  * Every block carries as_of + source + source_tier.

Idempotent. Run AFTER the ledger exists: python3 add_health_economy_dimension.py
"""
import json
import sys

LEDGER = "district-ledger.json"
NFHS_SRC = "https://rchiips.org/nfhs/factsheet_NFHS-5.shtml"
RBI_SRC = "https://www.rbi.org.in/Scripts/AnnualPublications.aspx?head=Handbook+of+Statistics+on+Indian+States"
AS_OF_HEALTH = "NFHS-5 (2019-21)"
AS_OF_ECON = "RBI Handbook (per-capita NSDP, current prices, recent year)"

# ---------------------------------------------------------------------------
# HEALTH — NFHS-5 (2019-21) state fact sheets:
#   (imr, institutional_births_pct, full_immunisation_pct, stunting_u5_pct)
#   imr                  infant deaths <1 yr per 1,000 live births
#   institutional_births %  births in a health facility
#   full_immunisation    %  children 12-23 months fully immunised
#   stunting_u5          %  children under-5 stunted (low height-for-age)
# Published state values (rounded as in the fact sheets).
# ---------------------------------------------------------------------------
HEALTH = {
    "Andhra Pradesh":   (30, 96, 73, 31),
    "Arunachal Pradesh":(23, 71, 60, 28),
    "Assam":            (32, 84, 66, 35),
    "Bihar":            (47, 76, 71, 43),
    "Chhattisgarh":     (44, 85, 80, 35),
    "Goa":              (13, 94, 82, 26),
    "Gujarat":          (31, 94, 76, 39),
    "Haryana":          (33, 95, 77, 27),
    "Himachal Pradesh": (26, 89, 89, 31),
    "Jharkhand":        (38, 76, 74, 40),
    "Karnataka":        (25, 97, 84, 35),
    "Kerala":           (4,  100, 77, 23),
    "Madhya Pradesh":   (41, 91, 77, 35),
    "Maharashtra":      (23, 95, 74, 35),
    "Manipur":          (25, 79, 65, 23),
    "Meghalaya":        (30, 58, 59, 47),
    "Mizoram":          (21, 80, 73, 29),
    "Nagaland":         (23, 46, 58, 33),
    "Odisha":           (36, 92, 90, 31),
    "Punjab":           (28, 95, 90, 25),
    "Rajasthan":        (30, 95, 80, 32),
    "Sikkim":           (11, 94, 91, 22),
    "Tamil Nadu":       (19, 100, 80, 25),
    "Telangana":        (27, 97, 78, 33),
    "Tripura":          (28, 82, 65, 32),
    "Uttar Pradesh":    (50, 84, 70, 39),
    "Uttarakhand":      (40, 89, 82, 27),
    "West Bengal":      (22, 92, 88, 34),
    # UTs (NFHS-5 fact sheets)
    "Delhi":            (25, 91, 76, 31),
    "Jammu & Kashmir":  (17, 92, 86, 27),
    "Puducherry":       (10, 100, 83, 20),
    "Andaman & Nicobar":(10, 96, 79, 23),
    "Chandigarh":       (16, 90, 80, 25),
    "Dadra and Nagar Haveli": (18, 90, 74, 39),
    "Daman and Diu":    (18, 90, 74, 39),
    "Lakshadweep":      (14, 99, 87, 32),
    "Ladakh":           (17, 92, 86, 24),
}

# ---------------------------------------------------------------------------
# ECONOMY — per-capita Net State Domestic Product (₹, current prices), RBI Handbook
# (approx recent year). Value in ₹; tier is a broad band for the choropleth, NOT a
# verdict. Figures rounded; verify against the RBI Handbook for the exact year.
# ---------------------------------------------------------------------------
PERCAP_NSDP = {
    "Andhra Pradesh":   219518,
    "Arunachal Pradesh":205465,
    "Assam":            118504,
    "Bihar":            54383,
    "Chhattisgarh":     133898,
    "Goa":              517555,
    "Gujarat":          279825,
    "Haryana":          325759,
    "Himachal Pradesh": 235199,
    "Jharkhand":        92909,
    "Karnataka":        304474,
    "Kerala":           263945,
    "Madhya Pradesh":   140583,
    "Maharashtra":      252389,
    "Manipur":          104550,
    "Meghalaya":        102091,
    "Mizoram":          200528,
    "Nagaland":         151144,
    "Odisha":           150676,
    "Punjab":           184704,
    "Rajasthan":        156888,
    "Sikkim":           557923,
    "Tamil Nadu":       278667,
    "Telangana":        311649,
    "Tripura":          145603,
    "Uttar Pradesh":    83565,
    "Uttarakhand":      260201,
    "West Bengal":      140035,
    "Delhi":            461910,
    "Jammu & Kashmir":  138603,
    "Puducherry":       257483,
    "Andaman & Nicobar":216100,
    "Chandigarh":       358929,
}


def income_tier(v):
    if v is None:
        return None
    if v >= 300000:
        return "high"
    if v >= 180000:
        return "upper-middle"
    if v >= 120000:
        return "middle"
    if v >= 90000:
        return "lower-middle"
    return "low"


def main():
    with open(LEDGER, encoding="utf-8") as f:
        data = json.load(f)

    n_state = 0
    n_dist = 0
    missing_health, missing_econ = set(), set()

    for sname, s in data["states"].items():
        h = HEALTH.get(sname)
        pc = PERCAP_NSDP.get(sname)
        if h is None:
            missing_health.add(sname)
        if pc is None:
            missing_econ.add(sname)

        health_note = (
            "NFHS-5 (2019-21) state fact-sheet values. Shown to juxtapose "
            "'health' beside the money flow — not a wellbeing verdict. "
            "Per-district NFHS exists as separate fact-sheet PDFs (a gap here)."
            if h else
            "No NFHS-5 fact-sheet figure for this state/UT — an explicit gap, "
            "not fabricated."
        )
        health_block = {
            "imr": h[0] if h else None,
            "institutional_births_pct": h[1] if h else None,
            "full_immunisation_pct": h[2] if h else None,
            "stunting_u5_pct": h[3] if h else None,
            "level": "state",
            "as_of": AS_OF_HEALTH,
            "figure_gap": h is None,
            "source": NFHS_SRC,
            "source_tier": 1,
            "note": health_note,
        }
        econ_note = (
            "Per-capita Net State Domestic Product (RBI Handbook, current "
            "prices). The 'wealth' axis beside the money flow — not a verdict. "
            "Per-district income is a gap (no bulk official series)."
            if pc is not None else
            "No official per-capita NSDP series is published for this UT "
            "(small UTs like Lakshadweep / Daman & Diu / Dadra & Nagar Haveli "
            "are absent from the RBI Handbook state series) — an explicit gap, "
            "not fabricated."
        )
        economy_block = {
            "percapita_nsdp_inr": pc,
            "income_tier": income_tier(pc),
            "level": "state",
            "as_of": AS_OF_ECON,
            "figure_gap": pc is None,
            "source": RBI_SRC,
            "source_tier": 2,
            "note": econ_note,
        }
        s["health"] = health_block
        s["economy"] = economy_block
        if h or pc:
            n_state += 1

        for dname, dist in s.get("districts", {}).items():
            n_dist += 1
            dims = dist.setdefault("dimensions", {})
            dims["health"] = dict(health_block, level="state-proxy",
                                  note=("State-level NFHS-5 shown; per-district figures "
                                        "are a gap (district NFHS fact-sheet PDFs)." if h
                                        else "No NFHS-5 figure for this state/UT; per-district "
                                             "is a gap too — not fabricated."))
            dims["economy"] = dict(economy_block, level="state-proxy",
                                   note=("State per-capita NSDP shown; per-district "
                                         "income is a gap (no official district series)." if pc is not None
                                         else "No published per-capita NSDP for this UT, so no "
                                              "state figure to proxy either — an explicit gap."))
            gaps = dist.setdefault("_gaps", [])
            for g in [
                "health per-district NFHS indicators (district fact-sheet PDFs) unsourced",
                "economy per-district income / NSDP (no official district series) unsourced",
            ]:
                if g not in gaps:
                    gaps.append(g)

    with open(LEDGER, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"health + economy dimensions attached: {n_state} states + {n_dist} districts")
    print(f"  states missing health: {sorted(missing_health) or 'none'}")
    print(f"  states missing economy: {sorted(missing_econ) or 'none'}")
    print("  per-district health/income left as state-proxy + gap (no fabrication).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
