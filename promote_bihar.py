#!/usr/bin/env python3
"""Promote Munger & Begusarai (Bihar) from baseline skeletons to deep, sourced
ledger entries. Idempotent: replaces only these two districts in-place.

All figures carry source + source_tier. Tier-2 = official .nic.in district
portal; tier-3 = Wikipedia; tier-4 = news. Gaps recorded, nothing fabricated.
"""
import json, os

ROOT = os.path.dirname(os.path.abspath(__file__))
LEDGER = os.path.join(ROOT, "district-ledger.json")

BEGUSARAI = {
    "admin_model": "standard",
    "system_notes": [
        {
            "note": "Begusarai is the 'industrial & financial capital of Bihar' — and its heavy industry was BUILT BY CENTRAL PUBLIC MONEY. The Barauni Refinery (IOCL), Barauni Thermal Power (NTPC), and HURL Barauni fertiliser plant are all central PSUs / PSU joint ventures. The district's economic base is, in effect, the Union government's balance sheet made physical.",
            "kind": "structural",
            "source": "https://en.wikipedia.org/wiki/Begusarai_district",
            "source_tier": 3, "needs_pdf_upgrade": True,
        },
        {
            "note": "HURL Barauni revived a defunct 1976 fertiliser plant (shut 1999 as unviable) with ~₹9,512 cr central investment; urea production restarted 18 Oct 2022. A case of public money re-animating dead industrial capacity — contrast with Birbhum's fund-freeze.",
            "kind": "revival",
            "source": "https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=2010953",
            "source_tier": 1, "needs_pdf_upgrade": False,
        },
    ],
    "roster": {
        "collector": {"name": "Shrikant Shastri", "post": "District Magistrate & Collector", "service": "IAS", "as_of": "2026-02", "source": "https://begusarai.nic.in/whoswho/dm-begusarai/", "source_tier": 2, "needs_pdf_upgrade": False},
        "sp": {"name": "Maneesh", "post": "Superintendent of Police", "service": "IPS", "as_of": "2026", "source": "https://begusarai.nic.in/directory/", "source_tier": 2, "needs_pdf_upgrade": False},
        "district_judge": {"name": None, "post": "District & Sessions Judge", "service": "Judicial", "as_of": None, "source": None, "source_tier": None},
    },
    "legislature": {
        "lok_sabha": [{"constituency": "Begusarai", "name": None, "party": None, "term": "18th LS (2024-)", "source": None, "source_tier": None}],
        "assembly": [],
    },
    "plants": [
        {"name": "Barauni Refinery (IOCL)", "sector": "Petroleum refining", "ownership": "Central PSU (Indian Oil Corporation Ltd)",
         "capacity": "6.0 MMTPA crude (expanding to 9.0 MMTPA by ~2026, + polypropylene petrochem)",
         "employment_note": "Large PSU workforce; plant-specific headcount not separately published.",
         "significance": "Commissioned 1964-65 with Soviet/Romanian collaboration; Bihar's only refinery. BR-9 expansion adds petrochemicals.",
         "source": "https://en.wikipedia.org/wiki/Barauni_Refinery", "source_tier": 3, "needs_pdf_upgrade": True,
         "capacity_source": "https://iocl.com/barauni-refinery"},
        {"name": "Barauni Thermal Power Station (NTPC)", "sector": "Thermal power", "ownership": "Central PSU (NTPC Ltd)",
         "capacity": "720 MW installed; ~500 MW operational (Stage-I 220 MW retired 31 Mar 2024)",
         "employment_note": None,
         "significance": "Operational since 1962 (Russian collaboration); transferred from Bihar state to NTPC on 15 Dec 2018.",
         "source": "https://en.wikipedia.org/wiki/Barauni_Thermal_Power_Station", "source_tier": 3, "needs_pdf_upgrade": True},
        {"name": "HURL Barauni Fertiliser Plant", "sector": "Fertiliser (gas-based urea)", "ownership": "Central PSU JV (NTPC/IOCL/CIL/FCIL)",
         "capacity": "12.7 LMTPA urea", "employment_note": None,
         "significance": "~₹9,512 cr revival of a 1976 plant shut since 1999; urea production restarted 18 Oct 2022.",
         "source": "https://en.wikipedia.org/wiki/HURL_Barauni", "source_tier": 3, "needs_pdf_upgrade": True,
         "capacity_source": "https://www.fert.nic.in/fertilizer-projects/hindustan-urvarak-rasayan-ltd-hurl"},
    ],
    "plants_note": "Begusarai's industrial base is overwhelmingly CENTRAL PSU: refinery (IOCL), power (NTPC), fertiliser (HURL JV). The 'companies in the district' are, in effect, instruments of Union fiscal policy — jobs and output here trace back to central capital, not local/state money. Capacity figures from company/PSU sources (upgrade to annual-report/gazette PDFs for tier-1).",
    "departments": [],
    "ledger": [],
    "_gaps": [
        "begusarai_LS_mp_name", "district_judge", "assembly_mlas",
        "central_scheme_flows (MGNREGS/PMAY-G to rural blocks)",
        "plant_employment_headcounts (PSU group figures only)",
        "district_tax_origin (PSU corporate tax HQ-attributed, not district-level)",
        "kmc_style_civic_budget (no single municipal budget sourced yet)",
    ],
}

MUNGER = {
    "admin_model": "standard",
    "system_notes": [
        {
            "note": "Munger's economy rests on three HERITAGE industries, each a national 'first/oldest': ITC's cigarette factory (1907 — Asia's first cigarette production), the gun/arms factories (est. 1762, Mir Qasim era), and the Jamalpur Railway Workshop (1862 — Asia's oldest & among its largest). 2nd-highest per-capita income in Bihar after Patna (₹42,793, FY21). Contrast with Begusarai's central-PSU heavy industry.",
            "kind": "structural",
            "source": "https://en.wikipedia.org/wiki/Munger",
            "source_tier": 3, "needs_pdf_upgrade": True,
        },
        {
            "note": "The arms tradition has a dark fiscal side: alongside ~37 licensed BIADA gun factories, Munger became a notorious hub of ILLEGAL country-made firearms (pistols to Kalashnikovs). A licit heritage industry shadowed by an untaxed, criminal one — a governance/revenue leakage story.",
            "kind": "informal_economy",
            "source": "https://en.wikipedia.org/wiki/Munger",
            "source_tier": 3, "needs_pdf_upgrade": True,
        },
    ],
    "roster": {
        "collector": {"name": "Arvind Kumar Verma", "post": "District Magistrate & Collector", "service": "IAS", "as_of": "2026", "source": "https://munger.nic.in/collector-district-magistrate/", "source_tier": 2, "needs_pdf_upgrade": False},
        "sp": {"name": "Syed Imran Masood", "post": "Superintendent of Police", "service": "IPS", "as_of": "2026", "source": "https://munger.nic.in/superintendent-of-police/", "source_tier": 2, "needs_pdf_upgrade": False, "note": "March-2026 report names Manavjeet Singh Dhillon as incoming SP; official portal still showed Masood."},
        "district_judge": {"name": None, "post": "District & Sessions Judge", "service": "Judicial", "as_of": None, "source": None, "source_tier": None},
    },
    "legislature": {
        "lok_sabha": [{"constituency": "Munger", "name": "Rajiv Ranjan Singh (Lalan Singh)", "party": "JD(U)", "term": "18th LS (2024-)", "source": "https://en.wikipedia.org/wiki/Munger_(Lok_Sabha_constituency)", "source_tier": 3, "needs_pdf_upgrade": True}],
        "assembly": [],
    },
    "plants": [
        {"name": "ITC Cigarette Factory, Munger", "sector": "Tobacco / FMCG", "ownership": "Private (ITC Ltd; orig. Imperial Tobacco 1910)",
         "capacity": "~17.4-acre campus; one of India's largest tobacco factories",
         "employment_note": "Major local employer; tobacco is the district's leading export.",
         "significance": "Asia's first cigarette production (1907); ITC's oldest manufacturing unit.",
         "source": "https://en.wikipedia.org/wiki/Munger", "source_tier": 3, "needs_pdf_upgrade": True},
        {"name": "Jamalpur Locomotive Workshop", "sector": "Railways (rolling stock)", "ownership": "Government (Indian Railways)",
         "capacity": "Asia's oldest & among largest railway workshops; 50+ acres",
         "employment_note": "Major employer of the local population.",
         "significance": "Founded 8 Feb 1862 by the East India Company; produces inserts, brake blocks, BOX wagons, cranes.",
         "source": "https://en.wikipedia.org/wiki/Jamalpur,_Munger", "source_tier": 3, "needs_pdf_upgrade": True},
        {"name": "Munger Gun Factories (BIADA)", "sector": "Small arms", "ownership": "Private (licensed) + historic Ordnance",
         "capacity": "~37 licensed gun factories across ~8 acres (BIADA land)",
         "employment_note": "Generational craft; supplied arms to the Indian Army in WWI & 1962.",
         "significance": "Arms-making since 1762 (Mir Qasim era); among India's oldest surviving arms units.",
         "source": "https://en.wikipedia.org/wiki/Munger", "source_tier": 3, "needs_pdf_upgrade": True},
    ],
    "plants_note": "Munger's base is HERITAGE/colonial-era industry (private ITC + govt Railways + licensed arms), not modern central PSUs — a different economic-origin story than Begusarai. Plant figures are from encyclopaedic sources; upgrade to company/Railways reports for tier-1.",
    "departments": [],
    "ledger": [],
    "_gaps": [
        "district_judge", "assembly_mlas",
        "central_scheme_flows (MGNREGS/PMAY-G to rural blocks)",
        "itc_munger_employment_and_output", "jamalpur_workshop_headcount",
        "illegal_arms_revenue_leakage (by nature unmeasured)",
        "district_tax_origin", "kmc_style_civic_budget",
    ],
}


def main():
    led = json.load(open(LEDGER, encoding="utf-8"))
    bihar = led["states"]["Bihar"]
    bihar["districts"]["Begusarai"] = BEGUSARAI
    bihar["districts"]["Munger"] = MUNGER

    # refresh coverage
    states = led["states"]
    total = sum(len(s["districts"]) for s in states.values())
    deep = sum(1 for s in states.values() for d in s["districts"].values() if not d.get("baseline"))
    led["_meta"]["coverage"]["districts"] = total
    led["_meta"]["coverage"]["deep_districts"] = deep
    led["_meta"]["coverage"]["baseline_districts"] = total - deep

    json.dump(led, open(LEDGER, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    print(f"Promoted Munger + Begusarai. Now {deep} deep / {total} total districts.")


if __name__ == "__main__":
    main()
