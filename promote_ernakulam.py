#!/usr/bin/env python3
"""Promote Ernakulam (Kerala) from baseline to a deep, sourced entry.

Significance: first deep district in a BLOCK-PILOT state (Kerala has taluks in
india-blocks.json), so this lights up the full state->district->block drill with
parent-context. Also the 2nd district (after Kolkata) with a REAL money figure:
Kochi Municipal Corporation audited FY24 finances from the MoHUA CityFinance
portal (gov, tier-2).
"""
import json, os

ROOT = os.path.dirname(os.path.abspath(__file__))
LEDGER = os.path.join(ROOT, "district-ledger.json")

ERNAKULAM = {
    "admin_model": "standard",
    "system_notes": [
        {
            "note": "Kochi Municipal Corporation is ~50% grant-dependent: of ₹453 cr total revenue (audited FY24), ₹225 cr is government grant vs ₹229 cr own-source — and it runs close to balance (expenditure ₹402 cr). Comparable to Kolkata's grant-dependence but with a far healthier own-source share (₹229 cr own vs ₹184 cr tax). A relatively well-run urban local body.",
            "kind": "structural",
            "source": "https://www.cityfinance.in/municipal-data/city/kochi",
            "source_tier": 2, "needs_pdf_upgrade": False,
        },
        {
            "note": "Ernakulam is Kerala's commercial capital (Kochi) — port, IT (Infopark/SmartCity), shipbuilding (Cochin Shipyard, a central PSU), and the Cochin International Airport (CIAL), the world's first fully solar-powered airport and a pioneering public-private-shareholder model. Diversified base, unlike single-industry districts.",
            "kind": "structural",
            "source": "https://en.wikipedia.org/wiki/Ernakulam_district",
            "source_tier": 3, "needs_pdf_upgrade": True,
        },
    ],
    "roster": {
        "collector": {"name": "G. Priyanka", "post": "District Collector & Magistrate", "service": "IAS", "as_of": "2025-08", "source": "https://ernakulam.nic.in/en/district_collector/", "source_tier": 2, "needs_pdf_upgrade": False, "note": "2017 batch; 3rd woman Collector of Ernakulam."},
        "police_commissioner": {"name": "Putta Vimaladitya", "post": "Commissioner of Police, Kochi City", "service": "IPS", "as_of": "2026", "source": "https://en.wikipedia.org/wiki/Ernakulam_district", "source_tier": 3, "needs_pdf_upgrade": True},
        "district_judge": {"name": None, "post": "District & Sessions Judge", "service": "Judicial", "as_of": None, "source": None, "source_tier": None},
    },
    "legislature": {
        "lok_sabha": [
            {"constituency": "Ernakulam", "name": None, "party": None, "term": "18th LS (2024-)", "source": "https://en.wikipedia.org/wiki/Ernakulam_district", "source_tier": 3, "needs_pdf_upgrade": True},
            {"constituency": "Chalakudy (partial)", "name": None, "party": None, "term": "18th LS (2024-)", "source": "https://en.wikipedia.org/wiki/Ernakulam_district", "source_tier": 3, "needs_pdf_upgrade": True},
        ],
        "assembly": [],
    },
    "plants": [
        {"name": "Cochin Shipyard Ltd (CSL)", "sector": "Shipbuilding / heavy engineering", "ownership": "Central PSU (listed)",
         "capacity": "India's largest shipbuilding & maintenance facility; built INS Vikrant (1st indigenous aircraft carrier)",
         "employment_note": "Major skilled-employment anchor for Kochi.",
         "significance": "Strategic defence + commercial shipbuilding; delivered India's first indigenous aircraft carrier.",
         "source": "https://en.wikipedia.org/wiki/Cochin_Shipyard", "source_tier": 3, "needs_pdf_upgrade": True},
        {"name": "BPCL Kochi Refinery", "sector": "Petroleum refining", "ownership": "Central PSU (Bharat Petroleum)",
         "capacity": "~15.5 MMTPA — among India's largest public-sector refineries",
         "employment_note": None,
         "significance": "One of India's biggest refineries; anchors Kochi's petrochemical cluster.",
         "source": "https://en.wikipedia.org/wiki/Kochi_Refineries", "source_tier": 3, "needs_pdf_upgrade": True},
        {"name": "Cochin International Airport (CIAL)", "sector": "Aviation / infrastructure", "ownership": "Public-private (govt + public shareholders)",
         "capacity": "World's first fully solar-powered airport",
         "employment_note": None,
         "significance": "First Indian airport built on a public-private-shareholder model (1999); a much-cited governance innovation.",
         "source": "https://en.wikipedia.org/wiki/Cochin_International_Airport", "source_tier": 3, "needs_pdf_upgrade": True},
    ],
    "plants_note": "Ernakulam/Kochi has a DIVERSIFIED base — central PSUs (Cochin Shipyard, BPCL refinery), IT parks, port, and the CIAL public-shareholder airport. Unlike single-industry districts, no one employer dominates. Figures from encyclopaedic/PSU sources; upgrade to annual reports for tier-1.",
    "departments": [
        {"dept": "Kochi Municipal Corporation", "type": "public_facing", "alloc_cr": None,
         "officer": {"name": None, "post": "Municipal Secretary", "source": None},
         "schemes": ["AMRUT", "Housing (3,448 built in 4 yrs)", "Drainage master plan"]}
    ],
    "ledger": [
        {
            "fy": "2023-24 (audited)",
            "scheme": "Kochi Municipal Corporation — civic budget",
            "stream": "intergovernmental_grant",
            "through_dept": "Kochi Municipal Corporation",
            "money_in_cr": 225.0,
            "money_in_basis": "Government grant ₹225 cr of ₹453 cr total revenue (audited FY24, MoHUA CityFinance). Own revenue ₹229 cr; tax revenue ₹184 cr.",
            "intended": "Urban civic services: sanitation, housing, drainage, mosquito/vector control, poverty alleviation across 74 wards.",
            "what_happened": {
                "utilisation_pct": None, "unspent_cr": None, "lapsed": None,
                "audit_flag": None, "cag_para": None, "vendor": None,
                "total_receipt_cr": 453.0, "total_expenditure_cr": 402.0, "own_source_revenue_cr": 229.0,
                "notes": "~50% grant-funded (₹225 cr of ₹453 cr), but a healthy ₹229 cr own-source — better local revenue effort than Kolkata. Near-balanced (exp ₹402 cr < revenue ₹453 cr). Audited figures via MoHUA CityFinance portal."
            },
            "responsible": {"primary": "collector", "secondary": ["police_commissioner"]},
            "source": "https://www.cityfinance.in/municipal-data/city/kochi",
            "source_tier": 2,
            "needs_pdf_upgrade": False,
            "figure_gap": False,
        }
    ],
    "_gaps": [
        "ernakulam_LS_mp_names", "district_judge", "assembly_mlas",
        "department-wise KMC budget split (have totals, not dept breakdown)",
        "central_scheme_flows_to_rural_taluks (MGNREGS/PMAY-G)",
        "plant_employment_headcounts", "taluk-level figures (block drill is name-only)",
    ],
}


def main():
    led = json.load(open(LEDGER, encoding="utf-8"))
    led["states"]["Kerala"]["districts"]["Ernakulam"] = ERNAKULAM

    states = led["states"]
    total = sum(len(s["districts"]) for s in states.values())
    deep = sum(1 for s in states.values() for d in s["districts"].values() if not d.get("baseline"))
    with_money = sum(1 for s in states.values() for d in s["districts"].values()
                     if any(isinstance(r.get("money_in_cr"), (int, float)) for r in d.get("ledger", [])))
    led["_meta"]["coverage"]["districts"] = total
    led["_meta"]["coverage"]["deep_districts"] = deep
    led["_meta"]["coverage"]["baseline_districts"] = total - deep
    led["_meta"]["coverage"]["districts_with_money_figures"] = with_money

    json.dump(led, open(LEDGER, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    print(f"Promoted Ernakulam. {deep} deep / {total} total; {with_money} with money figures.")


if __name__ == "__main__":
    main()
