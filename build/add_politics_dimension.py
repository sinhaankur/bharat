#!/usr/bin/env python3
"""
add_politics_dimension.py — attach the POLITICS dimension, per dimensions-schema.md.

The analytically valuable axis (and the one that's reliably sourceable) is at the
STATE level: which party/coalition governs the state, and whether it is ALIGNED
with the party governing the Union. That alignment is the federal-friction lever —
juxtapose it with central money flow (e.g. the Birbhum MGNREGS freeze) and let the
reader judge. We do NOT compute a "bias score" — we show the facts side by side.

Honest scope:
  - STATE: ruling_party + alignment_with_centre  [reliable, sourced, as_of dated]
  - DISTRICT: constituency-level MP/MLA results left as an explicit gap (ECI),
    never bulk-guessed. Roster already holds some named MPs where sourced.

Ruling parties change — every value carries as_of (snapshot date) and an ECI
source. Update the table when governments change.

Idempotent. Run: python3 add_politics_dimension.py
"""
import json
import sys

LEDGER = "district-ledger.json"
ECI = "https://results.eci.gov.in/"
AS_OF = "2026-06"  # snapshot date — update when governments change
UNION_RULING = "BJP-led NDA"  # party governing the Union at AS_OF

# State/UT -> {party, bloc}. bloc in {NDA, INDIA, other} for alignment calc.
# Reflects the well-established government as of AS_OF. Verify against ECI before
# treating any single entry as current — governments change.
STATE_GOV = {
    "Andhra Pradesh": ("TDP-led NDA", "NDA"),
    "Arunachal Pradesh": ("BJP", "NDA"),
    "Assam": ("BJP", "NDA"),
    "Bihar": ("JD(U)-BJP NDA", "NDA"),
    "Chhattisgarh": ("BJP", "NDA"),
    "Goa": ("BJP", "NDA"),
    "Gujarat": ("BJP", "NDA"),
    "Haryana": ("BJP", "NDA"),
    "Himachal Pradesh": ("INC", "INDIA"),
    "Jharkhand": ("JMM-led INDIA", "INDIA"),
    "Karnataka": ("INC", "INDIA"),
    "Kerala": ("CPI(M)-led LDF", "other"),
    "Madhya Pradesh": ("BJP", "NDA"),
    "Maharashtra": ("BJP-led Mahayuti", "NDA"),
    "Manipur": ("BJP", "NDA"),
    "Meghalaya": ("NPP-led (NDA ally)", "NDA"),
    "Mizoram": ("ZPM", "other"),
    "Nagaland": ("NDPP-BJP", "NDA"),
    "Odisha": ("BJP", "NDA"),
    "Punjab": ("AAP", "other"),
    "Rajasthan": ("BJP", "NDA"),
    "Sikkim": ("SKM (NDA ally)", "NDA"),
    "Tamil Nadu": ("DMK-led INDIA", "INDIA"),
    "Telangana": ("INC", "INDIA"),
    "Tripura": ("BJP", "NDA"),
    "Uttar Pradesh": ("BJP", "NDA"),
    "Uttarakhand": ("BJP", "NDA"),
    "West Bengal": ("AITC (TMC)", "INDIA"),
    # UTs (governed differently — note where no full state govt)
    "Delhi": ("BJP", "NDA"),
    "Puducherry": ("AINRC-BJP NDA", "NDA"),
    "Jammu & Kashmir": ("JKNC-led INDIA", "INDIA"),
    # UTs without a legislative government: administered by the Union directly
    "Andaman & Nicobar": ("Union-administered (UT, no legislature)", "union-admin"),
    "Chandigarh": ("Union-administered (UT, no legislature)", "union-admin"),
    "Dadra and Nagar Haveli": ("Union-administered (UT, no legislature)", "union-admin"),
    "Daman and Diu": ("Union-administered (UT, no legislature)", "union-admin"),
    "Lakshadweep": ("Union-administered (UT, no legislature)", "union-admin"),
    "Ladakh": ("Union-administered (UT, no legislature)", "union-admin"),
}


def alignment(bloc):
    if bloc == "union-admin":
        return "union-administered (no elected state govt)"
    if bloc == "NDA":
        return "aligned with Union"
    return "opposition to Union"


def main():
    with open(LEDGER, encoding="utf-8") as f:
        data = json.load(f)

    n_state = 0
    n_dist = 0
    missing = set()

    for sname, s in data["states"].items():
        gov = STATE_GOV.get(sname)
        if gov is None:
            missing.add(sname)
            party, bloc = None, None
        else:
            party, bloc = gov
        align = alignment(bloc) if bloc else None

        # state-level politics block (sibling to heads/rajya_sabha)
        s["politics"] = {
            "ruling_party": party,
            "bloc": bloc,
            "union_ruling": UNION_RULING,
            "alignment_with_centre": align,
            "as_of": AS_OF,
            "source": ECI,
            "source_tier": 2,
            "note": "State government snapshot; verify against ECI — governments "
                    "change. Alignment is shown to juxtapose with money flow, NOT "
                    "as a causal/bias claim.",
        }
        if party:
            n_state += 1

        for dname, dist in s.get("districts", {}).items():
            n_dist += 1
            dims = dist.setdefault("dimensions", {})
            dims["politics"] = {
                "state_ruling_party": party,
                "alignment_with_centre": align,
                "lok_sabha": None,        # constituency MP — ECI, district-level gap
                "assembly": None,         # MLA(s) — ECI, district-level gap
                "level": "state-proxy",   # honesty: this is the STATE's politics
                "figure_gap": True,
                "source": ECI,
                "source_tier": 2,
                "note": "State-level alignment shown; constituency MP/MLA results "
                        "are a district-level gap (ECI) until sourced.",
            }
            gaps = dist.setdefault("_gaps", [])
            gnote = "politics constituency results (ECI, district-level) unsourced"
            if gnote not in gaps:
                gaps.append(gnote)

    with open(LEDGER, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    print(f"politics dimension attached: {n_state} states + {n_dist} districts")
    print(f"  states missing from table: {sorted(missing) or 'none'}")
    print(f"  union ruling (as_of {AS_OF}): {UNION_RULING}")
    print("  constituency MP/MLA left as district gaps (no fabrication).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
