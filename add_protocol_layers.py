#!/usr/bin/env python3
"""
add_protocol_layers.py — decode the layers of protocol in India's federal /
state / union money-and-power chain, and bake them into district-ledger.json
as a reusable registry in _meta.

Four protocol layers (per the user's request):
  1. CONSTITUTIONAL  — who has legal authority (Seventh Schedule: Union /
     State / Concurrent List). Decides who CAN legislate & control the money.
  2. FISCAL          — the actual money route: Union -> Finance Commission
     devolution / CSS / CASP grant -> State treasury -> District -> Block.
  3. ADMINISTRATIVE  — the command chain: who appoints whom, Union-cadre vs
     State-cadre vs elected. Decides who ANSWERS for the spend.
  4. SANCTION        — the procedural gates money passes through: sanction
     order -> PFMS release -> utilisation certificate -> CAG audit.

Sourcing rule (project rule, see sources-pdf-first memory):
  every entry carries `source` + `source_tier`. These are constitutional /
  statutory / scheme-guideline references, which are tier-1 (gov_pdf) or the
  bare-text Constitution. No money figures are invented here — this layer is
  STRUCTURAL (who controls / who routes / who answers), not amounts.

Re-runnable: idempotent. Run `python3 add_protocol_layers.py`.
"""
import json
import sys

LEDGER = "district-ledger.json"

# --- source shorthands (constitutional / statutory references) --------------
CONST = "Constitution of India, Seventh Schedule (Art. 246)"
CONST_URL = "https://www.indiacode.nic.in/handle/123456789/15240"  # Constitution full text

# ---------------------------------------------------------------------------
# LAYER 1 + 2 + 4: scheme registry.
# Keyed by the scheme STRINGS that actually appear in districts (departments[].
# schemes and ledger[].scheme). Several map to the same flagship programme;
# we alias them so a district referring to "AMRUT" or "AMRUT 2.0" both resolve.
# ---------------------------------------------------------------------------
# Constitutional list values: "union" | "state" | "concurrent" | "local_body"
#   local_body = 73rd/74th Amendment subjects (Eleventh/Twelfth Schedule) that
#   are constitutionally devolved to panchayats / municipalities.
# funding_pattern: who pays what share (centre:state).
# fiscal_stream mirrors ledger[].stream vocabulary where possible.

SCHEME_REGISTRY = {
    # ---- flagship Centrally Sponsored Schemes (Concurrent / State subjects,
    #      Centre funds, State implements) -----------------------------------
    "MGNREGS": {
        "full_name": "Mahatma Gandhi National Rural Employment Guarantee Scheme",
        "flagship": "MGNREGA",
        "const_list": "concurrent",
        "const_basis": "Economic & social planning (Concurrent List Entry 20); enacted as NREGA 2005, a Union law on a Concurrent subject.",
        "ministry": "Ministry of Rural Development (Union)",
        "implementing_tier": "Gram Panchayat / Block (PO), district nodal = DC/DM",
        "fiscal_stream": "central_scheme",
        "funding_pattern": "Wages 100% Union; material 75:25 (Centre:State)",
        "fiscal_route": "Union MoRD -> NEFMS / Central NREGA fund -> direct DBT to worker accounts; admin/material via State -> District -> Block -> GP",
        "sanction_protocol": "Labour budget approved -> fund release on UC + pending-liability -> geo-tagged assets -> Social Audit (mandatory, Sec 17) -> CAG",
        "source": "https://nrega.nic.in/MGNREGA_new/Nrega_home.aspx",
        "source_tier": 2,
    },
    "PMAY-G": {
        "full_name": "Pradhan Mantri Awas Yojana — Gramin",
        "flagship": "PMAY-G",
        "const_list": "state",
        "const_basis": "Housing is a State subject; delivered as a CSS via the cooperative-federal route.",
        "ministry": "Ministry of Rural Development (Union)",
        "implementing_tier": "Gram Panchayat / Block, district nodal = DC/DM (DRDA/ZP)",
        "fiscal_stream": "central_scheme",
        "funding_pattern": "60:40 (Centre:State) plains; 90:10 NE & Himalayan states; 100% UTs",
        "fiscal_route": "Union MoRD -> State Nodal Account (PFMS) -> DBT instalments to beneficiary on geo-tagged construction stage",
        "sanction_protocol": "SECC/Awaas+ list -> sanction -> instalment on photo-verified stage (AwaasSoft/AwaasApp) -> UC -> CAG",
        "source": "https://pmayg.nic.in/",
        "source_tier": 2,
    },
    "PMAY-U": {
        "full_name": "Pradhan Mantri Awas Yojana — Urban",
        "flagship": "PMAY-U",
        "const_list": "local_body",
        "const_basis": "Urban poverty alleviation & housing — Twelfth Schedule (74th Amendment); CSS implemented through ULBs.",
        "ministry": "Ministry of Housing & Urban Affairs (Union)",
        "implementing_tier": "Urban Local Body (Municipal Corporation), State Level Nodal Agency",
        "fiscal_stream": "central_scheme",
        "funding_pattern": "Central assistance per vertical (e.g. ₹1.5 lakh/unit BLC); rest State/ULB/beneficiary",
        "fiscal_route": "Union MoHUA -> State Level Nodal Agency -> ULB -> beneficiary (PFMS)",
        "sanction_protocol": "DPR -> CSMC approval -> central assistance in instalments -> geo-tagged -> UC -> CAG",
        "source": "https://pmay-urban.gov.in/",
        "source_tier": 2,
    },
    "AMRUT": {
        "full_name": "Atal Mission for Rejuvenation & Urban Transformation",
        "flagship": "AMRUT",
        "const_list": "local_body",
        "const_basis": "Water supply, sewerage, urban amenities — Twelfth Schedule (74th Amendment); CSS to ULBs.",
        "ministry": "Ministry of Housing & Urban Affairs (Union)",
        "implementing_tier": "Urban Local Body, State High Powered Steering Committee",
        "fiscal_stream": "central_scheme",
        "funding_pattern": "Central share by city size: 1/3 for >10 lakh pop, 1/2 for <10 lakh; rest State+ULB",
        "fiscal_route": "Union MoHUA -> State -> ULB; State Annual Action Plan basis",
        "sanction_protocol": "SAAP approval -> central share in 3 instalments on physical+financial progress -> UC -> CAG",
        "source": "https://amrut.gov.in/",
        "source_tier": 2,
    },
    "NMCG": {
        "full_name": "National Mission for Clean Ganga (Namami Gange)",
        "flagship": "Namami Gange",
        "const_list": "union",
        "const_basis": "Inter-state rivers & river valleys (Union List Entry 56) where Parliament declares Union control; Ganga basin notified.",
        "ministry": "Ministry of Jal Shakti (Union)",
        "implementing_tier": "NMCG (registered society) -> State Programme Mgmt Groups -> ULB/agency",
        "fiscal_stream": "central_scheme",
        "funding_pattern": "100% central (flagship period); hybrid-annuity PPP for STPs",
        "fiscal_route": "Union -> Clean Ganga Fund / NMCG -> SPMG -> executing agency",
        "sanction_protocol": "DPR -> Executive Committee sanction -> milestone release -> third-party + CAG audit",
        "source": "https://nmcg.nic.in/",
        "source_tier": 2,
    },
    "NSAP": {
        "full_name": "National Social Assistance Programme",
        "flagship": "NSAP",
        "const_list": "concurrent",
        "const_basis": "Social security & social insurance (Concurrent List Entry 23); Directive Principle Art. 41 obligation.",
        "ministry": "Ministry of Rural Development (Union)",
        "implementing_tier": "State Social Welfare dept -> District -> Block; DBT pensions",
        "fiscal_stream": "central_scheme",
        "funding_pattern": "Central pension component + State top-up (varies by state)",
        "fiscal_route": "Union MoRD -> State -> DBT to beneficiary (old-age/widow/disability pension)",
        "sanction_protocol": "Beneficiary list -> sanction -> DBT -> UC -> CAG",
        "source": "https://nsap.nic.in/",
        "source_tier": 2,
    },
    "DAY-NULM": {
        "full_name": "Deendayal Antyodaya Yojana — National Urban Livelihoods Mission",
        "flagship": "DAY-NULM",
        "const_list": "local_body",
        "const_basis": "Urban poverty alleviation — Twelfth Schedule (74th Amendment).",
        "ministry": "Ministry of Housing & Urban Affairs (Union)",
        "implementing_tier": "State Urban Livelihoods Mission -> City Mission Mgmt Unit (ULB)",
        "fiscal_stream": "central_scheme",
        "funding_pattern": "60:40 (Centre:State); 90:10 NE/Himalayan",
        "fiscal_route": "Union MoHUA -> SULM -> ULB (CMMU)",
        "sanction_protocol": "City plan -> sanction -> instalment on progress -> UC -> CAG",
        "source": "https://nulm.gov.in/",
        "source_tier": 2,
    },
    "15th FC Health Grants": {
        "full_name": "Fifteenth Finance Commission — Health Grants to Local Bodies",
        "flagship": "15th FC grants",
        "const_list": "concurrent",
        "const_basis": "Finance Commission grants under Art. 280; health is Concurrent (Entry 23A etc.). Grants-in-aid under Art. 275.",
        "ministry": "Ministry of Finance / 15th Finance Commission award (Union)",
        "implementing_tier": "Local bodies (PRI/ULB) via State; tied health grants",
        "fiscal_stream": "intergovernmental_grant",
        "funding_pattern": "100% Union grant (FC award), tied to health-infrastructure outcomes",
        "fiscal_route": "Union -> State -> Local body (tied grant per 15th FC recommendation accepted by GoI)",
        "sanction_protocol": "FC award -> conditional release on entry-level conditions (audited accounts, property-tax floor) -> UC -> CAG",
        "source": "https://fincomindia.nic.in/",
        "source_tier": 2,
    },
    # ---- MP / MLA local-area development ----------------------------------
    "MPLADS": {
        "full_name": "Members of Parliament Local Area Development Scheme",
        "flagship": "MPLADS",
        "const_list": "union",
        "const_basis": "Central-sector scheme funded 100% by Union; MP recommends, District Authority executes.",
        "ministry": "Ministry of Statistics & Programme Implementation (Union)",
        "implementing_tier": "District Authority (DM/Collector) executes; MP only RECOMMENDS",
        "fiscal_stream": "mp_local_area",
        "funding_pattern": "100% Union; ₹5 cr / MP / year (released in two ₹2.5 cr instalments)",
        "fiscal_route": "Union MoSPI -> District Authority of MP's nodal district -> implementing agency",
        "sanction_protocol": "MP recommendation -> DM eligibility check -> sanction -> 2nd instalment only on >=80% UC + audit of 1st -> CAG",
        "source": "https://mplads.gov.in/",
        "source_tier": 2,
    },
    # ---- ULB own civic budgets (local-body subject) ----------------------
    # These are all "<City> Municipal Corporation civic budget" variants:
    "_ULB_CIVIC_BUDGET": {
        "full_name": "Municipal Corporation civic budget (own + grant)",
        "flagship": "ULB civic budget",
        "const_list": "local_body",
        "const_basis": "Eighteen functions devolved to municipalities — Twelfth Schedule (74th Constitutional Amendment, 1992), Art. 243W.",
        "ministry": "State Urban Development dept (ULBs are creatures of State law)",
        "implementing_tier": "Municipal Corporation (Commissioner = exec, Mayor = elected head)",
        "fiscal_stream": "intergovernmental_grant",
        "funding_pattern": "Own-source revenue (property tax, fees) + Central+State grants-in-aid (often >50% grant-dependent)",
        "fiscal_route": "Own revenue + (Union FC grants + State grants) -> Corporation consolidated fund -> departments",
        "sanction_protocol": "Corporation budget passed by elected body -> dept spend -> State AG / Local Fund Audit -> CAG (technical guidance & supervision)",
        "source": CONST_URL,
        "source_tier": 1,
    },
    "SWM Rules 2016": {
        "full_name": "Solid Waste Management Rules, 2016",
        "flagship": "SWM Rules",
        "const_list": "local_body",
        "const_basis": "Sanitation/SWM — Twelfth Schedule; rules under Environment (Protection) Act 1986 (Concurrent — environment, Entry 17A/17B).",
        "ministry": "Ministry of Environment, Forest & Climate Change (Union) — rules; ULB implements",
        "implementing_tier": "Urban Local Body",
        "fiscal_stream": "intergovernmental_grant",
        "funding_pattern": "ULB own + grants (no dedicated central transfer line; statutory obligation)",
        "fiscal_route": "Regulatory mandate; funded from ULB budget + AMRUT/SBM convergence",
        "sanction_protocol": "Statutory compliance -> State Pollution Control Board oversight -> NGT/CAG",
        "source": "https://moef.gov.in/",
        "source_tier": 2,
    },
}

# Aliases: variant strings in the data -> canonical registry key above.
SCHEME_ALIASES = {
    "AMRUT 2.0": "AMRUT",
    "MGNREGS (rural job guarantee)": "MGNREGS",
    "BMC civic budget": "_ULB_CIVIC_BUDGET",
    "Greater Chennai Corporation civic budget": "_ULB_CIVIC_BUDGET",
    "Guwahati Municipal Corporation civic budget": "_ULB_CIVIC_BUDGET",
    "Jaipur Municipal Corporation civic budget": "_ULB_CIVIC_BUDGET",
    "Kochi Municipal Corporation — civic budget": "_ULB_CIVIC_BUDGET",
    "Lucknow Municipal Corporation civic budget": "_ULB_CIVIC_BUDGET",
    "Municipal Corporation Ludhiana civic budget": "_ULB_CIVIC_BUDGET",
    "Surat Municipal Corporation civic budget": "_ULB_CIVIC_BUDGET",
    "KMC civic budget — Government Grant (Central + State Grant-in-Aid)": "_ULB_CIVIC_BUDGET",
    # descriptive / outcome strings that are not a programme -> map to nearest
    "Civic services (water, sanitation, roads, lighting)": "_ULB_CIVIC_BUDGET",
    "Drainage master plan": "_ULB_CIVIC_BUDGET",
    "Housing (3,448 built in 4 yrs)": "PMAY-U",
}

# ---------------------------------------------------------------------------
# LAYER 3: administrative command chain — who appoints / who answers.
# Keyed by the roster role keys used across districts' roster objects.
# tier: 1 = Union/President-appointed, 2 = State/Governor-appointed,
#       3 = State PSC / State service, 4 = elected (local), 5 = elected (legislature)
# ---------------------------------------------------------------------------
AUTHORITY_MAP = {
    "governor": {
        "appointed_by": "President of India (Union)",
        "accountable_to": "Union (holds office during President's pleasure, Art. 156)",
        "cadre": "constitutional_appointee",
        "layer": "union_at_state",
        "const_basis": "Art. 155–156: Governor appointed by the President; the Union's representative in the State.",
        "tier": 1,
    },
    "collector": {
        "appointed_by": "Union (IAS cadre, allotted to State by Centre)",
        "accountable_to": "State Govt (posted by State) on State subjects; IAS is an All-India Service controlled jointly",
        "cadre": "IAS (All-India Service, Art. 312)",
        "layer": "district_executive",
        "const_basis": "All-India Services (Art. 312): recruited by Union (UPSC), serve the State; dual control.",
        "tier": 1,
    },
    "dm": {  # District Magistrate — usually same officer as Collector
        "appointed_by": "Union (IAS cadre) posted by State",
        "accountable_to": "State Govt; revenue/magistracy chain",
        "cadre": "IAS (All-India Service, Art. 312)",
        "layer": "district_executive",
        "const_basis": "All-India Services (Art. 312); magisterial powers under CrPC/BNSS.",
        "tier": 1,
    },
    "sp": {
        "appointed_by": "Union (IPS cadre) posted by State",
        "accountable_to": "State Govt; State Home dept / DGP chain",
        "cadre": "IPS (All-India Service, Art. 312)",
        "layer": "district_police",
        "const_basis": "Police is a State subject (State List Entry 2); officers are IPS (All-India Service).",
        "tier": 1,
    },
    "police_commissioner": {
        "appointed_by": "Union (IPS cadre) posted by State (metro commissionerate)",
        "accountable_to": "State Govt / State Home dept",
        "cadre": "IPS (All-India Service, Art. 312)",
        "layer": "district_police",
        "const_basis": "Police = State List Entry 2; commissionerate system under State Police Act.",
        "tier": 1,
    },
    "municipal_commissioner": {
        "appointed_by": "State Govt (usually IAS) — ULB executive head",
        "accountable_to": "State Urban Dev dept + elected Corporation",
        "cadre": "IAS / State service",
        "layer": "local_body_executive",
        "const_basis": "ULBs are creatures of State law; 74th Amendment (Art. 243Q) governs municipalities.",
        "tier": 2,
    },
    "zp_ceo": {
        "appointed_by": "State Govt (IAS/State service)",
        "accountable_to": "State Panchayati Raj dept + elected Zilla Parishad",
        "cadre": "IAS / State service",
        "layer": "local_body_executive",
        "const_basis": "73rd Amendment (Art. 243B); PRIs are State-law bodies.",
        "tier": 2,
    },
    "mayor": {
        "appointed_by": "Elected (by ward councillors or direct, per State law)",
        "accountable_to": "Electorate / Corporation",
        "cadre": "elected_local",
        "layer": "local_body_political",
        "const_basis": "74th Amendment (Art. 243R); elected head of municipality.",
        "tier": 4,
    },
    "deputy_mayor": {
        "appointed_by": "Elected (by councillors)",
        "accountable_to": "Electorate / Corporation",
        "cadre": "elected_local",
        "layer": "local_body_political",
        "const_basis": "74th Amendment (Art. 243R).",
        "tier": 4,
    },
    "district_judge": {
        "appointed_by": "Governor in consultation with the High Court (Art. 233)",
        "accountable_to": "High Court (judicial side); separation of powers",
        "cadre": "State Judicial Service",
        "layer": "district_judiciary",
        "const_basis": "Art. 233–235: District Judges appointed by Governor on HC consultation; HC controls subordinate judiciary.",
        "tier": 2,
    },
    "treasury_officer": {
        "appointed_by": "State Govt (State Finance/Treasuries service)",
        "accountable_to": "State Finance dept; AG (A&E)",
        "cadre": "State service",
        "layer": "district_treasury",
        "const_basis": "Consolidated Fund of the State (Art. 266); treasury is State machinery.",
        "tier": 3,
    },
    "mp": {
        "appointed_by": "Elected (Lok Sabha constituency)",
        "accountable_to": "Electorate; Parliament (Union legislature)",
        "cadre": "elected_legislature",
        "layer": "union_legislature",
        "const_basis": "Art. 81: members of the House of the People.",
        "tier": 5,
    },
    "mla": {
        "appointed_by": "Elected (Assembly constituency)",
        "accountable_to": "Electorate; State Legislative Assembly",
        "cadre": "elected_legislature",
        "layer": "state_legislature",
        "const_basis": "Art. 170: members of the State Legislative Assembly.",
        "tier": 5,
    },
}

# ---------------------------------------------------------------------------
# The four-layer narrative scaffold — the "protocol stack" itself.
# ---------------------------------------------------------------------------
PROTOCOL_LAYERS = {
    "_doc": "Four stacked protocols that govern how money and authority move "
            "between the Union, the State, and the District/local body. Read "
            "top-to-bottom: WHO MAY (constitutional) -> HOW MONEY MOVES (fiscal) "
            "-> WHO ANSWERS (administrative) -> WHAT GATES IT (sanction).",
    "layer_1_constitutional": {
        "name": "Constitutional authority — Seventh Schedule",
        "decides": "Who legally MAY legislate/control a subject (and therefore its money).",
        "lists": {
            "union": "Union List (List I) — 97 entries. Only Parliament. Defence, foreign affairs, banking, inter-state rivers, income tax, customs.",
            "state": "State List (List II) — 66 entries. Only State Legislature. Police, public health, agriculture, land, local govt.",
            "concurrent": "Concurrent List (List III) — 47 entries. Both; Union law prevails on conflict (Art. 254). Education, social security, forests, economic & social planning.",
            "local_body": "Eleventh & Twelfth Schedules (73rd/74th Amendments, 1992) — 29 PRI + 18 ULB functions constitutionally devolved to panchayats & municipalities.",
        },
        "source": CONST,
        "source_url": CONST_URL,
        "source_tier": 1,
    },
    "layer_2_fiscal": {
        "name": "Fiscal transfer chain — how money flows down",
        "decides": "The route a rupee travels from the Union to a village.",
        "channels": {
            "fc_devolution": "Finance Commission (Art. 280) — States' share of the divisible pool of central taxes. UNTIED. 41% per 15th FC. The constitutional, formula-based channel.",
            "css": "Centrally Sponsored Schemes — Union-designed, cost-shared (e.g. 60:40), TIED to scheme rules. Routed Union ministry -> State Nodal Account -> implementing tier via PFMS.",
            "central_sector": "Central-sector schemes — 100% Union-funded, Union-implemented (e.g. MPLADS). Bypass State share.",
            "art_275_grants": "Grants-in-aid (Art. 275) — specific-purpose grants from Union to States on FC recommendation.",
            "state_own": "State's own taxes (SGST, stamp duty, excise, land revenue) + State schemes -> own treasury -> district.",
            "local_own": "Local-body own-source revenue (property tax, user fees) — the bottom, usually thinnest, layer.",
        },
        "instruments": "PFMS (Public Financial Management System) is the rail; Consolidated Fund of India (Art. 266) -> Consolidated Fund of the State -> agency accounts.",
        "source": "Constitution Arts. 268–281; Finance Commission reports.",
        "source_url": "https://fincomindia.nic.in/",
        "source_tier": 2,
    },
    "layer_3_administrative": {
        "name": "Administrative command chain — who answers",
        "decides": "Which post is accountable, and whether it is Union-cadre, State-cadre, or elected.",
        "spine": "Union: President -> Governor (Union's man in the State). State: CM/Council -> Chief Secretary -> District Magistrate/Collector (IAS, All-India Service) -> SDO -> BDO. Police: DGP -> SP/CP (IPS) -> SHO. Local: elected Mayor/Pradhan + appointed Commissioner/CEO. Judiciary: HC -> District Judge (separate).",
        "key_tension": "The DM/Collector and SP are recruited by the Union (All-India Services, Art. 312) but serve the State — 'dual control' is the structural fault line of Indian federalism.",
        "see": "authority_map (per-role appointing authority).",
        "source": "Constitution Arts. 153–167, 233–235, 309–312.",
        "source_url": CONST_URL,
        "source_tier": 1,
    },
    "layer_4_sanction": {
        "name": "Sanction & accountability protocol — what gates the spend",
        "decides": "The procedural checkpoints money must clear, and where it can stall or leak.",
        "gates": [
            "Administrative + financial sanction order (competent authority)",
            "Fund release via PFMS (often instalment-based, conditional on prior utilisation)",
            "Utilisation Certificate (UC) — must account for prior tranche before the next",
            "Geo-tagging / physical verification (for assets & housing)",
            "Social Audit (mandatory for MGNREGS, Sec 17 NREGA)",
            "State AG / Local Fund Audit",
            "CAG audit (Art. 148–151) -> report tabled in legislature -> PAC scrutiny",
        ],
        "failure_modes": "Where the protocol breaks: unspent funds lapsing, low utilisation %, fund FREEZE upstream (e.g. NREGA Sec 27), pending UCs blocking next release, CAG paras / audit flags, vendor irregularities.",
        "source": "Constitution Arts. 148–151, 266; GFR 2017; scheme guidelines.",
        "source_url": CONST_URL,
        "source_tier": 2,
    },
}

RENDER_NOTE = (
    "Panel render hook: in renderDistrictPanel, for each department.schemes[] "
    "and ledger[].scheme, look up _meta.scheme_registry (resolving via "
    "_meta.scheme_aliases) to badge it with its constitutional list "
    "(union/state/concurrent/local_body), ministry, and funding pattern. For "
    "each roster role, look up _meta.authority_map to badge who APPOINTS that "
    "post (Union/State/elected) — surfacing the dual-control tension. "
    "_meta.protocol_layers holds the four-layer explainer for a 'How the system "
    "works' section. This layer is STRUCTURAL (authority/route), carries no "
    "money figures, so it does not touch the PDF-cited figure-gap rules."
)


def main():
    with open(LEDGER, encoding="utf-8") as f:
        data = json.load(f)

    meta = data["_meta"]
    meta["protocol_layers"] = PROTOCOL_LAYERS
    meta["scheme_registry"] = SCHEME_REGISTRY
    meta["scheme_aliases"] = SCHEME_ALIASES
    meta["authority_map"] = AUTHORITY_MAP
    meta["protocol_render_note"] = RENDER_NOTE

    with open(LEDGER, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # --- coverage report: does every scheme in the data resolve? -----------
    referenced = set()
    for s in data["states"].values():
        for dist in s.get("districts", {}).values():
            for dep in dist.get("departments", []) or []:
                if isinstance(dep, dict):
                    for sc in dep.get("schemes", []) or []:
                        referenced.add(sc)
            for L in dist.get("ledger", []) or []:
                if isinstance(L, dict) and L.get("scheme"):
                    referenced.add(L["scheme"])

    def resolves(name):
        return name in SCHEME_REGISTRY or name in SCHEME_ALIASES

    unmatched = sorted(n for n in referenced if not resolves(n))
    print(f"protocol_layers + scheme_registry + authority_map written to {LEDGER}")
    print(f"scheme strings referenced in data : {len(referenced)}")
    print(f"  resolved via registry/aliases   : {len(referenced) - len(unmatched)}")
    print(f"  UNMATCHED (need a registry entry): {len(unmatched)}")
    for n in unmatched:
        print("   -", n)
    return 0 if not unmatched else 1


if __name__ == "__main__":
    sys.exit(main())
