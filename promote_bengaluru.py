#!/usr/bin/env python3
"""
promote_bengaluru.py — promote Bangalore Urban (BBMP) from a baseline skeleton to a
deep, SOURCED civic-budget entry, and upgrade Chennai's ledger citation from a news
link to the Greater Chennai Corporation's own budget portal.

Every figure here is a real, published municipal-budget number — the honest kind of
"deep" the project allows at scale (a corporation's OWN budget total is primary,
citeable, and not a fabricated utilisation/CAG claim). Where no official PDF is
online, the row stays tier-3 with needs_pdf_upgrade=True — never fabricated, never
dressed up as a gov PDF it isn't. See the no-faked-deep-ledgers rule.

Also registers the "BBMP civic budget" scheme alias -> _ULB_CIVIC_BUDGET so
apply_protocol_all.py attaches the local_body protocol badge, exactly like the
other metros.

Idempotent. Run:
    python3 promote_bengaluru.py && python3 apply_protocol_all.py && python3 gen_provenance.py
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
LEDGER = os.path.join(ROOT, "district-ledger.json")

# --- official / best-available citations ------------------------------------
# BBMP's public budget archive (site.bbmp.gov.in/budget.html) currently tops out at
# 2023-24; the 2025-26 budget book is not yet posted there (BBMP is being reorganised
# under the new Greater Bengaluru Authority). So the 2025-26 total is cited to the
# strongest available reporting + OpenCity's civic-budget analysis, and flagged
# needs_pdf_upgrade until the official book is online.
BBMP_BUDGET_ARCHIVE = "https://site.bbmp.gov.in/budget.html"
BBMP_2025_REPORT = "https://www.business-standard.com/india-news/bengaluru-municipal-body-unveils-rs-19-930-crore-budget-for-2025-26-125032900496_1.html"
GCC_BUDGET_PORTAL = "https://chennaicorporation.gov.in/gcc/budget/"


def grant_ledger_row(fy, scheme, dept, money, basis, total_recv, total_exp, own,
                     notes, source, tier, primary="municipal_commissioner", secondary=None):
    return {
        "fy": fy, "scheme": scheme, "stream": "intergovernmental_grant", "through_dept": dept,
        "money_in_cr": money, "money_in_basis": basis,
        "intended": "Urban civic services (water, sanitation, roads, health, infrastructure).",
        "what_happened": {
            "utilisation_pct": None, "unspent_cr": None, "lapsed": None, "audit_flag": None,
            "cag_para": None, "vendor": None,
            "total_receipt_cr": total_recv, "total_expenditure_cr": total_exp,
            "own_source_revenue_cr": own, "notes": notes,
        },
        "responsible": {"primary": primary, "secondary": secondary or []},
        "source": source, "source_tier": tier, "needs_pdf_upgrade": tier >= 3, "figure_gap": False,
    }


BENGALURU_ROW = grant_ledger_row(
    "2025-26 (BE)", "BBMP civic budget", "Bruhat Bengaluru Mahanagara Palike (BBMP)",
    19930.64,
    "BBMP Budget Estimate 2025-26: total receipts ₹19,930.64 cr, expenditure "
    "₹19,927.08 cr (surplus ₹3.56 cr) — up ~50% YoY. Own-source revenue ₹11,149.17 cr; "
    "Central+State grants ₹8,778.94 cr.",
    19930.64, 19927.08, 11149.17,
    "India's second-largest municipal budget after Mumbai — ₹19,931 cr through ONE "
    "district. 65% (₹12,952 cr) is 'development works'; ₹1,400 cr solid-waste. "
    "Presented by a Special Commissioner (Finance) — the FIFTH straight budget with NO "
    "elected council. BBMP is being reorganised under the new Greater Bengaluru "
    "Authority (GBA), which now administers all Bengaluru city corporations.",
    BBMP_2025_REPORT, 3, primary="municipal_commissioner",
    secondary=["collector", "police_commissioner"])


BANGALORE_URBAN = {
    "system_notes": [
        {"note": "Bengaluru's civic body BBMP runs a ₹19,931 cr budget (2025-26) — "
                 "second only to Mumbai's BMC among Indian municipalities, and larger "
                 "than several state budgets. Own-source revenue ₹11,149 cr (property "
                 "tax target ₹5,716 cr) funds 56% of it; the rest is Central+State "
                 "grants-in-aid.",
         "kind": "structural", "source": BBMP_2025_REPORT, "source_tier": 3, "needs_pdf_upgrade": True},
        {"note": "Governance deficit: the ₹19,931 cr budget was presented by a "
                 "state-appointed Special Commissioner, not an elected council — the "
                 "FIFTH consecutive budget without an elected body (BBMP's term lapsed "
                 "in 2020). In 2025 BBMP was being restructured under the Greater "
                 "Bengaluru Authority (GBA), splitting the metro into multiple city "
                 "corporations. A democratic deficit in India's tech capital.",
         "kind": "governance_deficit", "source": BBMP_BUDGET_ARCHIVE, "source_tier": 3, "needs_pdf_upgrade": True},
    ],
    "ledger": [BENGALURU_ROW],
    "_gaps": [
        "bbmp_2025_26_official_budget_book (site.bbmp.gov.in archive stops at 2023-24)",
        "gba_reorganisation_final_structure (multiple corporations — boundaries TBD)",
        "utilisation_vs_allocation (BBMP publishes BE, not audited actuals promptly)",
        "collector_and_police_commissioner_names",
        "lok_sabha_mp_names (Bengaluru has 3 LS seats)",
    ],
}


def deep_update_district(dist, patch):
    """Replace baseline ledger/_gaps/system_notes with the sourced version, keeping
    everything else (roster, dimensions, protocol tags applied later)."""
    dist.pop("baseline", None)
    # merge system_notes (dedupe by note text so re-runs don't duplicate)
    existing = dist.get("system_notes") or []
    seen = {n.get("note") for n in existing if isinstance(n, dict)}
    for n in patch["system_notes"]:
        if n["note"] not in seen:
            existing.append(n)
    dist["system_notes"] = existing
    dist["ledger"] = patch["ledger"]
    # union the gaps
    gaps = list(dict.fromkeys((dist.get("_gaps") or []) + patch["_gaps"]))
    dist["_gaps"] = gaps


def main():
    with open(LEDGER, encoding="utf-8") as f:
        data = json.load(f)

    changed = []

    # 1. Bengaluru (Bangalore Urban)
    ka = data["states"]["Karnataka"]["districts"]
    if "Bangalore Urban" not in ka:
        print("ERROR: 'Bangalore Urban' not found in Karnataka", file=sys.stderr)
        sys.exit(1)
    bu = ka["Bangalore Urban"]
    already = any(isinstance(r.get("money_in_cr"), (int, float)) and r.get("money_in_cr")
                  for r in bu.get("ledger", []))
    deep_update_district(bu, BANGALORE_URBAN)
    changed.append(("Bangalore Urban", "added BBMP civic budget ₹19,930.64 cr" if not already
                    else "refreshed BBMP civic budget row"))

    # 2. register the scheme alias so the protocol badge attaches
    aliases = data["_meta"].setdefault("scheme_aliases", {})
    if aliases.get("BBMP civic budget") != "_ULB_CIVIC_BUDGET":
        aliases["BBMP civic budget"] = "_ULB_CIVIC_BUDGET"
        changed.append(("_meta", "aliased 'BBMP civic budget' -> _ULB_CIVIC_BUDGET"))

    # 3. upgrade Chennai's citation news-link -> official GCC budget portal
    tn = data["states"]["Tamil Nadu"]["districts"]["Chennai"]
    for r in tn.get("ledger", []):
        if r.get("scheme", "").startswith("Greater Chennai Corporation"):
            if r.get("source") != GCC_BUDGET_PORTAL:
                r["source"] = GCC_BUDGET_PORTAL
                r["source_tier"] = 2          # official corporation portal (HTML)
                r["needs_pdf_upgrade"] = True   # still want the actual budget-book PDF
                # clarify the figure basis: reported ₹5,146 cr is the REVENUE budget;
                # total outlay incl. capex ₹3,191 cr is ~₹8,400 cr.
                r["money_in_basis"] = (
                    "GCC Budget 2025-26: revenue receipts ₹5,145.52 cr vs revenue "
                    "expenditure ₹5,214.09 cr; capex ₹3,190.61 cr — total outlay "
                    "~₹8,400 cr. Figure shown is the revenue budget.")
                changed.append(("Chennai", "citation -> GCC official budget portal (tier 2)"))

    with open(LEDGER, "w", encoding="utf-8") as f:
        # keep the ledger minified (build-optimization rule)
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    print("✓ promote_bengaluru.py")
    for where, what in changed:
        print(f"  {where}: {what}")
    if not changed:
        print("  (no changes — already applied)")
    print("\n  next: python3 apply_protocol_all.py && python3 gen_provenance.py")


if __name__ == "__main__":
    main()
