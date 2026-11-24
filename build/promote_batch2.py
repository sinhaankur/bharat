#!/usr/bin/env python3
"""Promote Surat, Ludhiana, Jaipur, Kamrup(Guwahati) from baseline to deep.
Adds 4 new states (Gujarat, Punjab, Rajasthan, Assam — first NE district) and
4 distinct economic types (diamonds/textiles, MSME, gems/tourism, tea/oil).
Idempotent. Plants get founded+era+lineage inline so the heritage/lineage UI
works immediately. Sourced, tier-tagged; gaps recorded.
"""
import json, os

ROOT = os.path.dirname(os.path.abspath(__file__))
LEDGER = os.path.join(ROOT, "district-ledger.json")


def era_for(y):
    return ("pre_colonial" if y < 1757 else "colonial" if y < 1947
            else "nehruvian_psu" if y < 1991 else "liberalisation")


def plant(name, sector, ownership, founded, significance, founder, control_type, lineage, source, tier=3, capacity=None, emp=None):
    return {"name": name, "sector": sector, "ownership": ownership, "capacity": capacity,
            "employment_note": emp, "significance": significance, "source": source,
            "source_tier": tier, "needs_pdf_upgrade": tier >= 3,
            "founded": founded, "era": era_for(founded), "heritage_note": significance,
            "founder": founder, "control_type": control_type, "lineage": lineage,
            "lineage_source": source, "lineage_source_tier": tier}


def civic_row(fy, scheme, dept, money, basis, total_recv, total_exp, own, notes, source, tier, primary="collector"):
    return {"fy": fy, "scheme": scheme, "stream": "intergovernmental_grant", "through_dept": dept,
            "money_in_cr": money, "money_in_basis": basis,
            "intended": "Urban civic services (water, sanitation, roads, health, infrastructure).",
            "what_happened": {"utilisation_pct": None, "unspent_cr": None, "lapsed": None, "audit_flag": None,
                              "cag_para": None, "vendor": None, "total_receipt_cr": total_recv,
                              "total_expenditure_cr": total_exp, "own_source_revenue_cr": own, "notes": notes},
            "responsible": {"primary": primary, "secondary": []},
            "source": source, "source_tier": tier, "needs_pdf_upgrade": tier >= 3, "figure_gap": False}


SURAT = {
    "admin_model": "split",
    "system_notes": [
        {"note": "Surat is the world's diamond-cutting capital — ~90% of the world's natural diamonds and ~25% of lab-grown diamonds are polished here, across ~6,000 units (70% MSMEs). It's also 'Manchester of India': ~65,000 textile factories, ~40% of national man-made fabric, ~90% of synthetic fabric. An MSME-driven export economy uniquely exposed to global shocks (e.g. demonetisation hit it hard).",
         "kind": "structural", "source": "https://en.wikipedia.org/wiki/Surat", "source_tier": 3, "needs_pdf_upgrade": True},
    ],
    "roster": {
        "collector": {"name": "Tejas Parmar", "post": "District Collector & Magistrate", "service": "IAS", "as_of": "2026-05", "source": "https://surat.nic.in/whoswho/", "source_tier": 2, "needs_pdf_upgrade": False},
        "municipal_commissioner": {"name": "Shalini Agarwal", "post": "Municipal Commissioner, SMC", "service": "IAS", "as_of": "2025", "source": "https://www.suratmunicipal.gov.in/", "source_tier": 2, "needs_pdf_upgrade": False},
        "district_judge": {"name": None, "post": "Principal District & Sessions Judge", "service": "Judicial", "as_of": None, "source": None, "source_tier": None},
    },
    "legislature": {"lok_sabha": [{"constituency": "Surat", "name": None, "party": None, "term": "18th LS (2024-)", "source": None, "source_tier": None}], "assembly": []},
    "plants": [
        plant("Surat diamond-cutting cluster", "Diamonds (cutting & polishing)", "Private MSME (~6,000 units)", 1960,
              "Polishes ~90% of the world's natural diamonds; Surat Diamond Bourse (2023) is among the world's largest office buildings.",
              "Migrant Kathiawadi entrepreneurs (mid-20th c.)", "private", "Family MSME units → organised via Surat Diamond Bourse (2023)",
              "https://en.wikipedia.org/wiki/Surat", capacity="~90% of world's natural diamonds; ~6,000 units"),
        plant("Surat textile cluster", "Textiles (man-made fabric)", "Private (~65,000 factories)", 1900,
              "'Silk City' / 'Manchester of India'; ~40% of India's man-made fabric, ~90% of synthetic fabric.",
              "Colonial-era trade port; powerloom boom post-1960s", "private", "Colonial trading port → powerloom/synthetic-fabric MSME hub",
              "https://en.wikipedia.org/wiki/Surat", capacity="~40% of India's man-made fabric"),
    ],
    "plants_note": "Surat's base is overwhelmingly PRIVATE MSME (diamonds + textiles) — millions of jobs, export-driven, little PSU presence. A bottom-up entrepreneurial economy, the opposite of Begusarai's top-down PSU base.",
    "departments": [], "ledger": [civic_row(
        "2025-26 (approved)", "Surat Municipal Corporation civic budget", "Surat Municipal Corporation",
        10004.0, "SMC Standing Committee approved ₹10,004 cr (draft ₹9,603 cr); revenue target ₹5,500 cr; no tax hike.",
        10004.0, None, None,
        "₹10,004 cr — among India's largest civic budgets, larger than Chennai's. ₹4,562 cr for development; ₹130 cr for bridges ('City of Bridges'). Funds a fast-growing MSME megacity.",
        "https://deshgujarat.com/2025/03/21/rs-10004-crore-budget-of-smc-gets-standing-committee-approval/", 4, primary="municipal_commissioner")],
    "_gaps": ["surat_LS_mp_name", "district_judge", "assembly_mlas", "grant_vs_own_split_of_SMC_budget", "central_scheme_flows", "diamond_textile_employment_exact"],
}

LUDHIANA = {
    "admin_model": "standard",
    "system_notes": [
        {"note": "Ludhiana is the 'Manchester of India' for a different reason than Surat — a diversified MSME manufacturing powerhouse: >1.5 lakh registered MSMEs, ~50% of India's bicycles, dominant in woollen hosiery/knitwear, plus auto-parts, hand tools, machine tools. A multi-cluster, risk-diversified industrial economy built bottom-up — Punjab's largest city & industrial hub.",
         "kind": "structural", "source": "https://en.wikipedia.org/wiki/Economy_of_Ludhiana", "source_tier": 3, "needs_pdf_upgrade": True},
    ],
    "roster": {
        "collector": {"name": "Himanshu Jain", "post": "Deputy Commissioner cum District Magistrate", "service": "IAS", "as_of": "2026", "source": "https://ludhiana.nic.in/whoswho/deputy-commissioner-ludhiana/", "source_tier": 2, "needs_pdf_upgrade": False, "note": "2017 batch; ex-DC Rupnagar, ex-Addl Principal Secy to CM."},
        "municipal_commissioner": {"name": None, "post": "Commissioner, Municipal Corporation Ludhiana", "service": "IAS", "as_of": None, "source": None, "source_tier": None},
        "district_judge": {"name": None, "post": "District & Sessions Judge", "service": "Judicial", "as_of": None, "source": None, "source_tier": None},
    },
    "legislature": {"lok_sabha": [{"constituency": "Ludhiana", "name": None, "party": None, "term": "18th LS (2024-)", "source": None, "source_tier": None}], "assembly": []},
    "plants": [
        plant("Ludhiana bicycle & hosiery cluster", "Manufacturing (MSME)", "Private (>1.5 lakh MSMEs)", 1950,
              "~50% of India's bicycles + dominant woollen hosiery/knitwear; plus auto-parts, hand tools, machine tools.",
              "Post-Partition Punjabi entrepreneurs", "private", "Post-1947 refugee enterprise → multi-cluster MSME hub (Hero Cycles etc.)",
              "https://en.wikipedia.org/wiki/Economy_of_Ludhiana", capacity="~50% of India's bicycles; >1.5 lakh MSMEs"),
    ],
    "plants_note": "Ludhiana is a textbook DIVERSIFIED MSME economy — bicycles, hosiery, auto-parts, tools evolved together, so no single sector dominates (a naturally hedged risk profile). Like Surat, bottom-up and private, not PSU.",
    "departments": [], "ledger": [civic_row(
        "recent", "Municipal Corporation Ludhiana civic budget", "Municipal Corporation Ludhiana",
        900.0, "MC Ludhiana budget has crossed ~₹900 cr (was ₹50 cr in 1970) — figure approximate, exact year-budget pending official portal.",
        900.0, None, None,
        "~₹900 cr civic budget for Punjab's largest industrial city — modest relative to its MSME output, a common ULB under-resourcing pattern. (Approximate; awaiting exact SMC budget doc.)",
        "https://ludhiana.nic.in/departments/state-govt/municipal-corporation/", 3, primary="collector")],
    "_gaps": ["exact_MC_budget_year_and_figure", "mc_commissioner_name", "LS_mp_name", "district_judge", "assembly_mlas", "central_scheme_flows", "msme_employment_exact"],
}

JAIPUR = {
    "admin_model": "standard",
    "system_notes": [
        {"note": "Jaipur is Rajasthan's capital and a gems & tourism economy. Rajasthan does ~17.5% of India's gems & jewellery exports, ~90% of meenakari and ~60% of kundan exports; Jaipur processes 300+ gemstone varieties. District GDP ~₹192,668 cr (~US$20bn). Tourism is a major pillar — the 2026-27 state budget built a tourism push (Special Tourism Zones, heritage conservation).",
         "kind": "structural", "source": "https://en.wikipedia.org/wiki/Jaipur", "source_tier": 3, "needs_pdf_upgrade": True},
    ],
    "roster": {
        "collector": {"name": "Sandesh Nayak", "post": "District Collector & Magistrate, Jaipur", "service": "IAS", "as_of": "2026-04", "source": "https://en.wikipedia.org/wiki/Jaipur_district", "source_tier": 3, "needs_pdf_upgrade": True, "note": "Apr-2026 reshuffle; replaced Dr J.K. Soni (moved to CMO)."},
        "municipal_commissioner": {"name": "Om Prakash Kasera", "post": "Commissioner, Jaipur Municipal Corporation", "service": "IAS", "as_of": "2026", "source": "https://en.wikipedia.org/wiki/Jaipur_Municipal_Corporation", "source_tier": 3, "needs_pdf_upgrade": True, "note": "JMC Greater + Heritage merged by state govt in 2025."},
        "district_judge": {"name": None, "post": "District & Sessions Judge", "service": "Judicial", "as_of": None, "source": None, "source_tier": None},
    },
    "legislature": {"lok_sabha": [{"constituency": "Jaipur", "name": None, "party": None, "term": "18th LS (2024-)", "source": None, "source_tier": None}], "assembly": []},
    "plants": [
        plant("Jaipur gems & jewellery cluster", "Gems & jewellery", "Private (~112 factories in state)", 1727,
              "Founded with the planned city (1727); world hub for coloured-gemstone cutting; 300+ gemstone varieties; meenakari/kundan crafts.",
              "Maharaja Sawai Jai Singh II (planned city, 1727)", "pre_colonial_state",
              "Royal craft workshops (1727) → modern gem-export cluster; planned 'Gem Bourse' (~1 lakh jobs)",
              "https://en.wikipedia.org/wiki/Jaipur", capacity="~17.5% of India's gems & jewellery exports"),
        plant("Jaipur heritage tourism", "Tourism / hospitality", "Mixed (private + state heritage)", 1727,
              "Amber Fort, City Palace, Hawa Mahal; the 'Pink City' is a UNESCO World Heritage city (2019) and a tourism mainstay.",
              "Sawai Jai Singh II (1727)", "state",
              "Princely heritage (1727) → UNESCO World Heritage City (2019) → state tourism economy",
              "https://en.wikipedia.org/wiki/Jaipur", capacity="UNESCO World Heritage City (2019)"),
    ],
    "plants_note": "Jaipur's base is gems + tourism — craft-and-heritage industries rooted in the 1727 planned royal city, now a major export + services economy. District GDP ~₹192,668 cr.",
    "departments": [], "ledger": [civic_row(
        "recent", "Jaipur Municipal Corporation civic budget", "Jaipur Municipal Corporation (Greater + Heritage, merged 2025)",
        6945.6, "Jaipur city budget ~₹6,945.60 cr (per encyclopaedic figure); JMC Greater & Heritage merged by the state in 2025.",
        6945.6, None, None,
        "~₹6,946 cr civic budget for a city with ~₹192,668 cr district GDP. JMC was split into Greater + Heritage, then re-merged in 2025 — a governance-structure churn.",
        "https://en.wikipedia.org/wiki/Jaipur", 3, primary="municipal_commissioner")],
    "_gaps": ["exact_JMC_budget_source (encyclopaedic figure; need official doc)", "LS_mp_name", "district_judge", "assembly_mlas", "central_scheme_flows", "gems_tourism_employment"],
}

KAMRUP = {
    "aka": "Kamrup Metropolitan (HQ: Guwahati)",
    "admin_model": "standard",
    "system_notes": [
        {"note": "Guwahati (Kamrup Metro) is the GATEWAY TO NORTHEAST INDIA — the regional hub for industry, commerce, education and the primary airport for the NE's eight states. Its economy rests on tea (Assam grows >half of India's tea), oil (the Assam-Arakan basin holds ~¼ of India's oil reserves; the Guwahati Refinery is a central PSU), and a fast-growing service/hospitality sector. First NE district in this dataset.",
         "kind": "structural", "source": "https://en.wikipedia.org/wiki/Guwahati", "source_tier": 3, "needs_pdf_upgrade": True},
    ],
    "roster": {
        "collector": {"name": "Swapnil Paul", "post": "District Commissioner (DC), Kamrup Metropolitan", "service": "IAS", "as_of": "2026-01", "source": "https://kamrupmetro.assam.gov.in/district-commissioner-profile", "source_tier": 2, "needs_pdf_upgrade": False, "note": "2018 batch; took charge 5 Jan 2026, ex-DC Tinsukia."},
        "municipal_commissioner": {"name": "Megha Nidhi Dahal", "post": "Commissioner, Guwahati Municipal Corporation", "service": "IAS", "as_of": "2026", "source": "https://gmc.assam.gov.in/", "source_tier": 2, "needs_pdf_upgrade": False},
        "mayor": {"name": "Mrigen Sarania", "post": "Mayor, GMC", "service": "Political", "as_of": "2026", "source": "https://en.wikipedia.org/wiki/Guwahati_Municipal_Corporation", "source_tier": 3, "needs_pdf_upgrade": True},
        "district_judge": {"name": None, "post": "District & Sessions Judge", "service": "Judicial", "as_of": None, "source": None, "source_tier": None},
    },
    "legislature": {"lok_sabha": [{"constituency": "Guwahati", "name": None, "party": None, "term": "18th LS (2024-)", "source": None, "source_tier": None}], "assembly": []},
    "plants": [
        plant("Guwahati Tea Auction Centre (GTAC)", "Tea trade", "Industry body (govt-supported)", 1970,
              "Established 25 Sep 1970; world's 2nd-largest CTC tea auction centre. Assam tea = ~17% of state revenue; ~25 lakh direct jobs statewide.",
              "Indian Tea Association / govt (1970)", "central_psu",
              "Set up 1970 adjacent to the State Secretariat; anchors Assam's tea trade",
              "https://en.wikipedia.org/wiki/Guwahati_Tea_Auction_Centre", capacity="2nd-largest CTC tea auction in the world"),
        plant("Guwahati Refinery (IOCL)", "Petroleum refining", "Central PSU (Indian Oil Corporation)", 1962,
              "India's first public-sector refinery (commissioned 1962); processes Upper Assam crude; meets NE region's fuel needs.",
              "Indian Oil Corporation (1962)", "central_psu",
              "India's FIRST public-sector refinery (1962) → Indian Oil Corporation Ltd",
              "https://en.wikipedia.org/wiki/Guwahati_Refinery", capacity="India's first PSU refinery (1962)"),
    ],
    "plants_note": "Guwahati pairs a resource economy (tea, Assam crude oil via the IOCL refinery — India's FIRST PSU refinery, 1962) with a fast-growing gateway service sector. Strategic NE hub more than a manufacturing centre.",
    "departments": [], "ledger": [civic_row(
        "n/a", "Guwahati Municipal Corporation civic budget", "Guwahati Municipal Corporation (formed 1971)",
        None, "GMC governs 216.79 km² / 31-60 wards; exact 2026 budget figure not surfaced in public reporting (pending gmc.assam.gov.in).",
        None, None, None,
        "GMC's exact budget figure isn't publicly surfaced yet — recorded as a gap. The district's fiscal weight is more about tea/oil revenue and central NE-development transfers than a large civic budget.",
        "https://gmc.assam.gov.in/", 2, primary="municipal_commissioner")],
    "_gaps": ["gmc_exact_budget_figure (not in public reporting; pending official portal)", "LS_mp_name", "district_judge", "assembly_mlas", "ne_special_central_transfers", "tea_oil_revenue_to_district"],
}


def main():
    led = json.load(open(LEDGER, encoding="utf-8"))
    led["states"]["Gujarat"]["districts"]["Surat"] = SURAT
    led["states"]["Punjab"]["districts"]["Ludhiana"] = LUDHIANA
    led["states"]["Rajasthan"]["districts"]["Jaipur"] = JAIPUR
    led["states"]["Assam"]["districts"]["Kamrup"] = KAMRUP

    states = led["states"]
    total = sum(len(s["districts"]) for s in states.values())
    deep = sum(1 for s in states.values() for d in s["districts"].values() if not d.get("baseline"))
    with_money = sum(1 for s in states.values() for d in s["districts"].values()
                     if any(isinstance(r.get("money_in_cr"), (int, float)) and r.get("money_in_cr") for r in d.get("ledger", [])))
    led["_meta"]["coverage"].update({"districts": total, "deep_districts": deep,
                                     "baseline_districts": total - deep, "districts_with_money_figures": with_money})
    json.dump(led, open(LEDGER, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    print(f"Promoted Surat, Ludhiana, Jaipur, Kamrup. {deep} deep / {total} total; {with_money} with money figures.")


if __name__ == "__main__":
    main()
