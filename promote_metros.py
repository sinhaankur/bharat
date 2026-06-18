#!/usr/bin/env python3
"""Promote Mumbai, Chennai, Lucknow from baseline to deep, sourced entries.
Adds 3 new states (Maharashtra, Tamil Nadu, Uttar Pradesh) with REAL civic-budget
money figures — taking the money-map from 3 to 6 districts with rupee flows.
Idempotent. PDF-cited where possible; gaps recorded, nothing fabricated.
"""
import json, os

ROOT = os.path.dirname(os.path.abspath(__file__))
LEDGER = os.path.join(ROOT, "district-ledger.json")


def grant_ledger_row(fy, scheme, dept, money, basis, total_recv, total_exp, own, notes, source, tier, primary="collector", secondary=None):
    return {
        "fy": fy, "scheme": scheme, "stream": "intergovernmental_grant", "through_dept": dept,
        "money_in_cr": money, "money_in_basis": basis,
        "intended": "Urban civic services (water, sanitation, roads, health, infrastructure).",
        "what_happened": {
            "utilisation_pct": None, "unspent_cr": None, "lapsed": None, "audit_flag": None,
            "cag_para": None, "vendor": None,
            "total_receipt_cr": total_recv, "total_expenditure_cr": total_exp, "own_source_revenue_cr": own,
            "notes": notes,
        },
        "responsible": {"primary": primary, "secondary": secondary or []},
        "source": source, "source_tier": tier, "needs_pdf_upgrade": tier >= 3, "figure_gap": False,
    }


MUMBAI = {
    "admin_model": "split",
    "system_notes": [
        {"note": "BMC (Brihanmumbai Municipal Corporation) is India's richest civic body. Its 2025-26 budget of ₹74,427 cr is the largest in its history — bigger than the annual budget of several Indian STATES, and ~25× Kolkata's KMC. Over a decade BMC allocated ₹2.19 lakh cr. The 'money flowing through one district' here dwarfs most state-level flows.",
         "kind": "structural", "source": "https://www.mcgm.gov.in/irj/go/km/docs/documents/MCGM%20Department%20List/Chief%20Accountant%20(Finance)/Budget/Budget%20Estimate%202025-2026/1-%20MC's%20Speech/BUDGET%20A,B,G/ENGLISH%20SPEECH.pdf",
         "source_tier": 1, "needs_pdf_upgrade": False},
        {"note": "Like Kolkata, Mumbai's civic governance has run WITHOUT an elected body since March 2022 — the ₹74,427 cr budget was presented to a state-appointed administrator (BMC Commissioner Bhushan Gagrani), not an elected council. Elections were finally held in Jan 2026. A democratic-deficit dysfunction in the country's richest municipality.",
         "kind": "governance_deficit", "source": "https://en.wikipedia.org/wiki/Brihanmumbai_Municipal_Corporation",
         "source_tier": 3, "needs_pdf_upgrade": True},
    ],
    "roster": {
        "municipal_commissioner": {"name": "Bhushan Gagrani", "post": "Municipal Commissioner & Administrator, BMC", "service": "IAS", "as_of": "2025", "source": "https://en.wikipedia.org/wiki/Brihanmumbai_Municipal_Corporation", "source_tier": 3, "needs_pdf_upgrade": True},
        "collector": {"name": None, "post": "District Collector (Mumbai City / Suburban — revenue only)", "service": "IAS", "as_of": None, "source": None, "source_tier": None, "note": "Mumbai is split into City & Suburban revenue districts; civic power sits with BMC + Police Commissioner, not a single DM."},
        "district_judge": {"name": None, "post": "Principal District & Sessions Judge", "service": "Judicial", "as_of": None, "source": None, "source_tier": None},
    },
    "legislature": {"lok_sabha": [{"constituency": "Mumbai (6 LS seats across the metro)", "name": None, "party": None, "term": "18th LS (2024-)", "source": None, "source_tier": None}], "assembly": []},
    "plants": [
        {"name": "Bombay Stock Exchange / financial sector", "sector": "Finance", "ownership": "Mixed (BSE + banks + RBI HQ)", "capacity": "India's financial capital; RBI, SEBI, BSE, NSE, most banks/MFs HQ'd here", "employment_note": "Largest white-collar financial workforce in India.", "significance": "Mumbai contributes a disproportionate share of India's direct-tax collection and corporate HQs.", "source": "https://en.wikipedia.org/wiki/Economy_of_Mumbai", "source_tier": 3, "needs_pdf_upgrade": True},
        {"name": "Bollywood / media & entertainment", "sector": "Media & entertainment", "ownership": "Private", "capacity": "World's largest film-production base by output", "employment_note": None, "significance": "Hindi film industry + broadcast/OTT hub.", "source": "https://en.wikipedia.org/wiki/Economy_of_Mumbai", "source_tier": 3, "needs_pdf_upgrade": True},
    ],
    "plants_note": "Mumbai's 'economic base' is services (finance, media, ports, real estate), not factories — so much of its tax origin is corporate/financial and HQ-attributed. This is why district-level tax-origin is hard to pin to geography.",
    "departments": [],
    "ledger": [grant_ledger_row(
        "2025-26 (BE)", "BMC civic budget", "Brihanmumbai Municipal Corporation",
        74427.0, "BMC Budget Estimate 2025-26 total outlay ₹74,427 cr — largest in its history (+14.19% YoY). Capex ₹43,166 cr (58%).",
        74427.0, None, None,
        "India's largest municipal budget — ₹74,427 cr through ONE metro. Capex ₹43,166 cr (58%) incl. ₹26,356 cr infrastructure. 15th FC gave ₹992 cr for electric buses (BEST). Presented to an administrator, not an elected council (no elected body Mar 2022–Jan 2026).",
        "https://www.mcgm.gov.in/irj/go/km/docs/documents/MCGM%20Department%20List/Chief%20Accountant%20(Finance)/Budget/Budget%20Estimate%202025-2026/1-%20MC's%20Speech/BUDGET%20A,B,G/ENGLISH%20SPEECH.pdf",
        1, primary="municipal_commissioner")],
    "_gaps": ["mumbai_LS_mp_names", "collector_names_city_and_suburban", "district_judge", "assembly_mlas",
              "grant_vs_own_source_split_of_BMC_budget (have total, not breakdown)", "central_scheme_flows", "plant_employment"],
}

CHENNAI = {
    "admin_model": "split",
    "system_notes": [
        {"note": "Chennai is a split-admin metro: civic services run by the Greater Chennai Corporation (GCC), law-and-order by a Police Commissioner (not a district SP). GCC's 2025-26 budget projects ₹5,145 cr revenue against ₹5,214 cr expenditure — a small planned deficit. Property tax + stamp duty dominate own revenue (property tax alone >₹2,000 cr).",
         "kind": "structural", "source": "https://chennaicorporation.gov.in/gcc/budget/", "source_tier": 2, "needs_pdf_upgrade": False},
    ],
    "roster": {
        "police_commissioner": {"name": "A. Amalraj", "post": "Commissioner of Greater Chennai Police", "service": "IPS", "as_of": "2026-05", "source": "https://www.thenewsminute.com/tamil-nadu/a-amalraj-appointed-as-chennai-police-commissioner", "source_tier": 4, "needs_pdf_upgrade": True, "note": "Appointed under the new TN govt (May 2026), replacing Abhin Dinesh Modak."},
        "collector": {"name": None, "post": "District Collector, Chennai", "service": "IAS", "as_of": None, "source": "https://chennai.nic.in/about-district/whos-who/", "source_tier": 2, "needs_pdf_upgrade": False},
        "mayor": {"name": "R. Priya", "post": "Mayor, Greater Chennai Corporation", "service": "Political", "as_of": "2026", "source": "https://www.thenewsminute.com/tamil-nadu/chennai-corporation-budget-2025-26-focus-remains-on-swds-roads-infrastructure", "source_tier": 4, "needs_pdf_upgrade": True},
        "district_judge": {"name": None, "post": "Principal District & Sessions Judge", "service": "Judicial", "as_of": None, "source": None, "source_tier": None},
    },
    "legislature": {"lok_sabha": [{"constituency": "Chennai (3 LS seats: North/Central/South)", "name": None, "party": None, "term": "18th LS (2024-)", "source": None, "source_tier": None}], "assembly": []},
    "plants": [
        {"name": "Chennai auto cluster ('Detroit of India')", "sector": "Automotive manufacturing", "ownership": "Private (Hyundai, Ford ex-, Ashok Leyland, etc.)", "capacity": "One of India's largest auto-manufacturing & export hubs", "employment_note": "Large manufacturing workforce in the metro & periphery.", "significance": "Major share of India's car exports originate from the Chennai region.", "source": "https://en.wikipedia.org/wiki/Economy_of_Chennai", "source_tier": 3, "needs_pdf_upgrade": True},
        {"name": "Chennai Port + IT corridor (OMR)", "sector": "Ports / IT services", "ownership": "Mixed (govt port + private IT)", "capacity": "Major container port + the OMR IT corridor", "employment_note": None, "significance": "Trade gateway + one of India's largest IT/ITeS employment belts.", "source": "https://en.wikipedia.org/wiki/Economy_of_Chennai", "source_tier": 3, "needs_pdf_upgrade": True},
    ],
    "plants_note": "Chennai pairs heavy manufacturing (autos) with services (IT, port) — a more balanced industrial+services base than Mumbai's finance-heavy one.",
    "departments": [],
    "ledger": [grant_ledger_row(
        "2025-26 (BE)", "Greater Chennai Corporation civic budget", "Greater Chennai Corporation",
        5145.52, "GCC Budget 2025-26 projected revenue ₹5,145.52 cr; expenditure ₹5,214 cr. Capex ₹3,190.61 cr.",
        5145.52, 5214.0, None,
        "₹5,146 cr revenue vs ₹5,214 cr expenditure — small planned deficit. Capex ₹3,191 cr: SWD ₹1,032 cr, roads ₹628 cr, buildings ₹413 cr, SWM ₹352 cr. Property tax projected >₹2,000 cr (strong own-source).",
        "https://www.dtnext.in/news/chennai/chennai-corporation-budget-over-rs-5000-cr-revenue-expected-in-2025-26-fiscal-826943",
        4, primary="mayor", secondary=["collector", "police_commissioner"])],
    "_gaps": ["chennai_collector_name", "LS_mp_names", "district_judge", "assembly_mlas", "grant_share_of_GCC_budget", "central_scheme_flows", "plant_employment"],
}

LUCKNOW = {
    "admin_model": "standard",
    "system_notes": [
        {"note": "Lucknow Municipal Corporation's 2025-26 budget jumped ~50% to ₹4,304.53 cr (from ₹2,865 cr) — but its own tax/fee revenue is only ₹295 cr, i.e. the civic budget is overwhelmingly grant/transfer-funded, not locally raised. A heavy grant-dependence typical of north-Indian ULBs, contrasting with Kochi's healthier own-source share. ~₹600 cr earmarked for sanitation after poor Swachh rankings.",
         "kind": "structural", "source": "https://en.wikipedia.org/wiki/Lucknow_Municipal_Corporation", "source_tier": 3, "needs_pdf_upgrade": True},
    ],
    "roster": {
        "collector": {"name": "Vishak G Iyer", "post": "District Magistrate, Lucknow", "service": "IAS", "as_of": "2025-01", "source": "https://lucknow.nic.in/dm-profile/vishak-g/", "source_tier": 2, "needs_pdf_upgrade": False, "note": "2011 batch; Oxford MPP; ex-DM Kanpur/Aligarh."},
        "municipal_commissioner": {"name": None, "post": "Municipal Commissioner, LMC", "service": "IAS", "as_of": None, "source": None, "source_tier": None},
        "district_judge": {"name": None, "post": "District & Sessions Judge", "service": "Judicial", "as_of": None, "source": None, "source_tier": None},
    },
    "legislature": {"lok_sabha": [{"constituency": "Lucknow", "name": None, "party": None, "term": "18th LS (2024-)", "source": None, "source_tier": None}], "assembly": []},
    "plants": [
        {"name": "Government / administrative sector", "sector": "Government & services", "ownership": "Public (UP state capital)", "capacity": "Seat of UP govt — India's most populous state (~240 mn)", "employment_note": "Large public-sector & administrative workforce.", "significance": "Capital of Uttar Pradesh; the state secretariat and most state PSUs/HQs.", "source": "https://en.wikipedia.org/wiki/Lucknow", "source_tier": 3, "needs_pdf_upgrade": True},
        {"name": "HAL Lucknow + defence/aerospace", "sector": "Defence / aerospace", "ownership": "Central PSU (Hindustan Aeronautics)", "capacity": "Accessories & avionics division", "employment_note": None, "significance": "HAL accessories complex; part of the UP defence-corridor push.", "source": "https://en.wikipedia.org/wiki/Lucknow", "source_tier": 3, "needs_pdf_upgrade": True},
    ],
    "plants_note": "Lucknow's base is government + services + some defence PSU (HAL) — a capital-city economy rather than an industrial one.",
    "departments": [],
    "ledger": [grant_ledger_row(
        "2025-26", "Lucknow Municipal Corporation civic budget", "Lucknow Municipal Corporation",
        4304.53, "LMC budget 2025-26 ₹4,304.53 cr (up ~50% from ₹2,865 cr). Own tax/fee revenue only ₹295.42 cr; capital grants + water charges ₹111.92 cr.",
        4304.53, None, 295.42,
        "Budget ₹4,305 cr but own revenue just ₹295 cr — heavily grant/transfer-funded, a sharp contrast to Kochi's healthy own-source effort. ~₹600 cr for sanitation after poor Swachh Survekshan rankings.",
        "https://en.wikipedia.org/wiki/Lucknow_Municipal_Corporation",
        3, primary="collector")],
    "_gaps": ["lmc_municipal_commissioner_name", "LS_mp_name", "district_judge", "assembly_mlas", "exact_grant_total (own ₹295 cr known; grant remainder inferred)", "central_scheme_flows", "plant_employment"],
}


def main():
    led = json.load(open(LEDGER, encoding="utf-8"))
    led["states"]["Maharashtra"]["districts"]["Greater Bombay"] = MUMBAI
    led["states"]["Tamil Nadu"]["districts"]["Chennai"] = CHENNAI
    led["states"]["Uttar Pradesh"]["districts"]["Lucknow"] = LUCKNOW

    states = led["states"]
    total = sum(len(s["districts"]) for s in states.values())
    deep = sum(1 for s in states.values() for d in s["districts"].values() if not d.get("baseline"))
    with_money = sum(1 for s in states.values() for d in s["districts"].values()
                     if any(isinstance(r.get("money_in_cr"), (int, float)) and r.get("money_in_cr") for r in d.get("ledger", [])))
    led["_meta"]["coverage"].update({"districts": total, "deep_districts": deep,
                                     "baseline_districts": total - deep, "districts_with_money_figures": with_money})
    json.dump(led, open(LEDGER, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    print(f"Promoted Mumbai, Chennai, Lucknow. {deep} deep / {total} total; {with_money} with money figures.")


if __name__ == "__main__":
    main()
