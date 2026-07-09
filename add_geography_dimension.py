#!/usr/bin/env python3
"""
add_geography_dimension.py — attach the GEOGRAPHY dimension to all 594 districts.

The editorial thesis (user, 2026-07-08): "rains and floods and CRZ zone ...
actual waterways and hindered development ... no clear urban planning and missing
sewage ... also terrain". The physical geography of a place — its terrain, its
rivers, whether it floods, whether the Coastal Regulation Zone legally caps what
can be built — is a real constraint on development. We show that constraint SIDE
BY SIDE with the money flow so the reader can see the development–environment
feedback loop:

    rains fall  ->  but encroached waterways + missing drainage/sewage +
    CRZ-ignoring / unplanned construction  ->  floods  ->  which HINDER further
    development (relief spend crowds out capital spend; land is un-buildable).

Same iron rules as every other dimension (dimensions-schema.md):
  * SOURCED-OR-GAP. Reliable list-level facts are populated; district-level
    figures (CRZ category from the district CZMP, annual flood-damage ₹) are
    left as explicit _gaps — NEVER fabricated.
  * `level` on every block ("state" / "district" / "state-proxy") so a state
    fact is never passed off as a district measurement.
  * COMPARATIVE, not declarative. We do not compute a "development-hindrance
    score" (that would be an editorial verdict dressed as data). We show terrain
    + flood + CRZ + urban-planning gap next to the money and let the reader infer.

What is reliably sourceable now (and IS filled):
  * on_coast  — the coastal states/UTs are a closed, well-known list. CRZ (the
    Coastal Regulation Zone notification, MoEFCC 2019) applies to every coastal
    district. Whether a specific stretch is CRZ-I/II/III/IV needs the district
    Coastal Zone Management Plan (CZMP) map -> district GAP.
  * flood_prone — the chronically flood-affected states are named by CWC / NDMA
    / the Rashtriya Barh Ayog (National Flood Commission). We flag the state; the
    per-district flood-hazard micro-zone and annual damage ₹ -> district GAP.
  * terrain — the dominant physiographic type of a state is well established
    (Himalayan / plateau / plains / coastal-plain / desert / island). Intra-state
    variation (a hill district inside a plains state) -> refined per-district GAP.
  * major_rivers — the principal river system(s) crossing a state. The exact set
    of rivers touching one district -> district GAP.

What is a GAP everywhere (needs a per-district gov PDF / portal, not fabricated):
  * crz.category (I/II/III/IV) — district CZMP map
  * flood_damage_cr / area_flooded — state relief-dept / CWC annual memoranda
  * sewage_treatment_gap — CPCB sewage inventory is city-level, not all districts
  * drainage_master_plan status — municipal, not centrally published

Sources (tier per _meta.source_tiers): MoEFCC CRZ Notification 2019 (tier 1),
CWC/NDMA flood lists & Rashtriya Barh Ayog (tier 1), Census / physiography
standard references + India-WRIS river basins (tier 2 for the broad-brush
terrain/river classing), CPCB for the sewage-gap framing (tier 1, but city-level).

Idempotent. Run: python3 add_geography_dimension.py
"""
import json
import sys

LEDGER = "district-ledger.json"

CRZ_SRC = "https://moef.gov.in/wp-content/uploads/2019/03/CRZ-Notification-2019.pdf"
FLOOD_SRC = "https://cwc.gov.in/flood-forecasting"          # CWC flood forecasting
NDMA_SRC = "https://ndma.gov.in/Natural-Hazards/Floods"     # NDMA floods
CPCB_SRC = "https://cpcb.nic.in/status-of-stps/"            # CPCB STP / sewage status
WRIS_SRC = "https://indiawris.gov.in/wris/"                 # India-WRIS river basins
# Open, license-free change-over-time sources (NOT Google Earth — that imagery is
# licensed and cannot be redistributed). These CAN live in an open-data repo.
JRC_SRC = "https://global-surface-water.appspot.com/"       # JRC Global Surface Water (1984-now)
BHUVAN_SRC = "https://bhuvan.nrsc.gov.in/"                  # ISRO Bhuvan LULC change
SENTINEL_SRC = "https://dataspace.copernicus.eu/"          # Copernicus Sentinel-2

# ---------------------------------------------------------------------------
# TIMELINE PILOT — districts where water-body / built-up change is DOCUMENTED in
# published sources. Every point carries year + metric + value + source. Figures
# below are real published values (verified 2026-07, sources cited). Estimates
# legitimately VARY by wetland-boundary definition and study endpoints, so each
# subject carries a `range_note` making that spread explicit rather than implying
# false precision. Every OTHER district gets an empty timeline flagged as a gap.
#
# Sources are peer-reviewed / encyclopaedic / major-press, tier 2-3 (not a single
# gov PDF). Where an open-satellite (JRC/Bhuvan) figure isn't independently pinned,
# the point still cites the study it came from — never invented.
# ---------------------------------------------------------------------------
WIRE_EKW = "https://thewire.in/environment/a-30-year-journey-of-the-east-kolkata-wetlands-degraded-and-diminished"
WIKI_EKW = "https://en.wikipedia.org/wiki/East_Calcutta_Wetlands"
WIKI_PALLIKARANAI = "https://en.wikipedia.org/wiki/Pallikaranai_Marsh"
IISC_BLR = "https://en.wikipedia.org/wiki/Lakes_in_Bengaluru"          # IISc lake count
WIKI_BELLANDUR = "https://en.wikipedia.org/wiki/Bellandur_Lake"
FLOODLIST_MITHI = "https://floodlist.com/asia/mumbai-floods-mithi-river"
NRSC_HYD = "https://sandrp.in/2026/02/17/hyderabad-lakes-2025-degradation-continues-amid-hydraa-efforts/"
CAG_DAL = "https://kashmirobserver.net/2026/04/10/cag-flags-over-10-shrinkage-in-dal-lakes-open-water-area/"
SANDRP_YAMUNA = "https://sandrp.in/2024/07/04/yamuna-manthan-040724-a-year-after-historic-floods-where-is-river-governance/"
WIKI_DEEPOR = "https://testbook.com/articles/deepor-beel"
QOC_AHMEDABAD = "https://questionofcities.org/flooded-realities-of-smart-city-ahmedabad/"
SANDRP_PUNE = "https://sandrp.in/2024/08/30/flood-lines-riverfront-development-and-citizen-heroes-story-of-pune-floods/"
HITAVADA_BHOJ = "https://www.thehitavada.com/Encyc/2026/4/30/ngt-warns-bmc-over-silent-stance-on-bhoj-wetland-encroachments.html"
SANDRP_VADODARA = "https://sandrp.in/2024/09/16/drp-nb-160924-urban-flood-lessons-from-vadodara-vijaywada/"
WIKI_VIJAYAWADA = "https://en.wikipedia.org/wiki/2024_Vijayawada_floods"
NGT_GURUGRAM = "https://questionofcities.org/gurugram-navigating-the-waters-between-urban-planning-and-floods/"

TIMELINE_PILOT = {
    # East Kolkata Wetlands — Ramsar site (12,500 ha designated). Documented ~36%
    # areal loss over ~30 yrs; a Landsat/ML study reports a steeper 63% on a wider
    # boundary. Both shown via range_note. Encroachment + real-estate is the driver.
    ("West Bengal", "Kolkata"): {
        "subject": "East Kolkata Wetlands (Ramsar site, 12,500 ha) — India's largest "
                   "natural sewage-treatment + fishery belt, shrinking under real-"
                   "estate encroachment as the city expands east",
        "range_note": "Estimates vary by boundary: ~65 km²→~41 km² (~36% loss, "
                      "1991–2021, The Wire/Wikipedia) up to 91.2 km²→33.4 km² "
                      "(~63% loss, 1991–2025, Landsat/ML study). Direction is "
                      "unambiguous; the exact ha depends on the boundary drawn.",
        "points": [
            {"year": 1991, "metric": "wetland_area_km2", "value": 65,
             "note": "≈65 km² extent (The Wire / Wikipedia, ~36%-loss series baseline)",
             "source": WIRE_EKW},
            {"year": 2021, "metric": "wetland_area_km2", "value": 41,
             "note": "≈41 km² — ~36% loss over 30 yrs; driver = illegal land "
                     "conversion for real estate as Kolkata expanded east",
             "source": WIKI_EKW},
        ],
        "source": WIRE_EKW,
    },
    # Pallikaranai marsh, Chennai — collapse from ~5,000-6,000 ha to ~593 ha by 2002;
    # corporation dumpyard grew 56 ha (2002) → 136 ha (2007). Loss of this + feeder
    # lakes is a cited factor in the Dec-2015 Chennai flood.
    ("Tamil Nadu", "Chennai"): {
        "subject": "Pallikaranai marsh — Chennai's last major wetland, collapsed "
                   "from ~5,000–6,000 ha to a few hundred ha; its loss + encroached "
                   "feeder lakes cited in the December 2015 flood",
        "range_note": "Original extent cited as 5,000 ha (Wikipedia) to 6,000 ha "
                      "(Bhaskar et al 2017) depending on marsh-vs-watershed "
                      "definition; core marsh ~593 ha by 2002, ~695 ha (Ramsar "
                      "core) by 2021 after partial protection.",
        "points": [
            {"year": 1965, "metric": "marsh_area_ha", "value": 5500,
             "note": "≈5,500 ha original expanse (Wikipedia, citing 1965)",
             "source": WIKI_PALLIKARANAI},
            {"year": 2002, "metric": "marsh_area_ha", "value": 593,
             "note": "shrunk to ≈593 ha by 2002 — encroachment + dumping + built-up",
             "source": WIKI_PALLIKARANAI},
            {"year": 2007, "metric": "dumpyard_area_ha", "value": 136,
             "note": "corporation dumpyard grew 56 ha (2002) → 136 ha (2007), "
                     "eating into the marsh",
             "source": WIKI_PALLIKARANAI},
            {"year": 2015, "metric": "flood_event", "value": True,
             "note": "Dec 2015 Chennai flood — loss of Pallikaranai + encroached "
                     "feeder lakes/drainage a widely-cited factor",
             "source": NDMA_SRC},
        ],
        "source": WIKI_PALLIKARANAI,
    },
    # Bengaluru — "city of lakes" collapse; broken tank cascade → chronic flooding.
    ("Karnataka", "Bangalore Urban"): {
        "subject": "Bengaluru's lake collapse — the broken tank cascade whose "
                   "stormwater drains, once encroached, now flood the city",
        "range_note": "IISc: ~1,452 lakes (1960s) → ~194 today. A 2021 House "
                      "committee found 837 lakes vanished in Bengaluru Urban, 88 "
                      "fully gone (528 ha). Bellandur (~360 ha, largest surviving) "
                      "+ Begur + Hulimavu lost ~90% to encroachment 2000–2021.",
        "points": [
            {"year": 1960, "metric": "lake_count", "value": 1452,
             "note": "~1,452 lakes in the 1960s (IISc)", "source": IISC_BLR},
            {"year": 2024, "metric": "lake_count", "value": 194,
             "note": "~194 remain; stormwater drains at valley lows built over → "
                     "floods (NGT-supervised Bellandur restoration ongoing)",
             "source": IISC_BLR},
        ],
        "source": IISC_BLR,
    },
    # Mumbai — Mithi river narrowed by reclamation/encroachment; 2005 deluge.
    ("Maharashtra", "Greater Bombay"): {
        "subject": "Mithi river — narrowed by BKC reclamation, mangrove loss and "
                   "slum encroachment; the choke that drowned Mumbai on 26 July 2005",
        "range_note": "SC-appointed committee: 620 ha reclaimed for Bandra-Kurla "
                      "Complex; ~50% river-width reduction and built-up up from 29% "
                      "(1966) to 70% (2005); Mumbai lost ~40% of mangroves 1995–2005.",
        "points": [
            {"year": 1966, "metric": "builtup_pct", "value": 29,
             "note": "built-up 29% of Mithi catchment (1966)", "source": FLOODLIST_MITHI},
            {"year": 2005, "metric": "builtup_pct", "value": 70,
             "note": "built-up 70%; ~50% width loss + mangrove loss → 26 Jul 2005 "
                     "flood killed 900+", "source": FLOODLIST_MITHI},
            {"year": 2005, "metric": "flood_event", "value": True,
             "note": "26 July 2005 Mumbai deluge — Mithi couldn't carry Powai "
                     "overflow; 900+ dead", "source": FLOODLIST_MITHI},
        ],
        "source": FLOODLIST_MITHI,
    },
    # Hyderabad — lakes down 61% (NRSC 1979→2024); Oct-2020 flood; HYDRAA reclaim.
    ("Andhra Pradesh", "Hyderabad"): {
        "subject": "Hyderabad's lakes — 61% shrinkage (NRSC 1979→2024); FTL/nala "
                   "encroachment behind the Oct-2020 flood; HYDRAA reclaiming beds",
        "range_note": "NRSC: lake extent −61% (1979–2024); ~185 lakes remain; "
                      "HYDRAA: >61% of lakes encroached, >30,000 nala encroachments.",
        "points": [
            {"year": 1979, "metric": "lake_extent_index", "value": 100,
             "note": "1979 baseline (NRSC remote sensing)", "source": NRSC_HYD},
            {"year": 2024, "metric": "lake_extent_index", "value": 39,
             "note": "−61% lake extent by 2024; FTL/nala encroachment → Oct-2020 "
                     "flood; HYDRAA formed Jul-2024 to demolish FTL encroachments",
             "source": NRSC_HYD},
            {"year": 2020, "metric": "flood_event", "value": True,
             "note": "Oct 13–14 2020 Hyderabad flood — encroached lake beds/nalas",
             "source": NRSC_HYD},
        ],
        "source": NRSC_HYD,
    },
    # Srinagar — Wular/Dal/Hokersar shrinkage destroyed the valley flood buffer; 2014.
    ("Jammu & Kashmir", "Srinagar"): {
        "subject": "Kashmir's flood-buffer wetlands (Wular, Dal, Hokersar, Anchar) "
                   "shrunk away — the lost sponge behind the September 2014 deluge",
        "range_note": "Wular open water 89.59 km² (1911) → 15.73 km² (2013); Dal "
                      "15.40 km² (2007) → 12.91 km² (2020, CAG); >half of Srinagar "
                      "wetland area (1971) gone by 2010; ~20 wetlands lost to colonies.",
        "points": [
            {"year": 1911, "metric": "wular_openwater_km2", "value": 89.59,
             "note": "Wular open-water 89.59 km² (1911)", "source": CAG_DAL},
            {"year": 2013, "metric": "wular_openwater_km2", "value": 15.73,
             "note": "Wular 15.73 km²; wetland collapse → 2014 Jhelum flood (~300 "
                     "dead) as lost sponges pushed water into Srinagar", "source": CAG_DAL},
            {"year": 2014, "metric": "flood_event", "value": True,
             "note": "Sept 2014 Kashmir flood — wetland loss a cited cause",
             "source": CAG_DAL},
        ],
        "source": CAG_DAL,
    },
    # Delhi — Yamuna floodplain (O-zone) ~75% encroached; July-2023 flood.
    ("Delhi", "Delhi"): {
        "subject": "Yamuna floodplain (the protected 'O-zone') ~75% encroached by "
                   "roads, colonies and casting yards — exposed by the July-2023 flood",
        "range_note": "~75% of Delhi's floodplain reportedly encroached; NGT: ~230k "
                      "O-zone households not on a sewer; DDA has run ≥15 demolition "
                      "drives since the mid-2000s under NGT/court orders.",
        "points": [
            {"year": 2023, "metric": "flood_event", "value": True,
             "note": "July 2023 Yamuna flood — floodplain encroachment + siltation "
                     "+ barrage operation amplified it; forced a DDA master-plan "
                     "rethink (NGT O.A. 537/2023)", "source": SANDRP_YAMUNA},
        ],
        "source": SANDRP_YAMUNA,
    },
    # Guwahati — Deepor Beel (Assam's only Ramsar) shrinking → lost stormwater sponge.
    ("Assam", "Kamrup"): {
        "subject": "Deepor Beel — Assam's only Ramsar wetland and Guwahati's natural "
                   "stormwater reservoir, shrinking under encroachment + waste dumping",
        "range_note": "Once a Brahmaputra channel; 4.14 km² notified as bird "
                      "sanctuary (1989). Water-storage capacity down sharply; municipal "
                      "dumping at Boragaon + colony encroachment; NGT flagged pollution "
                      "(Jan 2026) and pushed an Eco-Sensitive-Zone notification.",
        "points": [
            {"year": 2002, "metric": "ramsar_designated", "value": True,
             "note": "Deepor Beel declared a Ramsar site (2002)", "source": WIKI_DEEPOR},
            {"year": 2026, "metric": "shrinkage_flagged", "value": True,
             "note": "storage capacity fallen; NGT flagged pollution/degradation; "
                     "shrinkage raises Guwahati flash-flood risk", "source": WIKI_DEEPOR},
        ],
        "source": WIKI_DEEPOR,
    },
    # Ahmedabad — Sabarmati floodplain reclaimed for the riverfront; blue cover ~2.2%.
    ("Gujarat", "Ahmadabad"): {
        "subject": "Sabarmati floodplain reclaimed + lakes lost — the riverfront "
                   "narrowed the channel; the lower promenade itself floods each monsoon",
        "range_note": "Ahmedabad's 'blue' (water-body) cover down to ~2.2% of area; "
                      "Sabarmati riverfront reclaimed floodplain and channelised the "
                      "river; Vasna barrage opened (27 gates, >1.2 lakh cusecs) "
                      "submerged the riverfront in 2025.",
        "points": [
            {"year": 2005, "metric": "riverfront_started", "value": True,
             "note": "Sabarmati Riverfront construction began — embankments +"
                     " floodplain reclamation", "source": QOC_AHMEDABAD},
            {"year": 2025, "metric": "flood_event", "value": True,
             "note": "riverfront lower promenade submerged; blocked drains + lost "
                     "lakes (~2.2% blue cover) worsen urban flooding", "source": QOC_AHMEDABAD},
        ],
        "source": QOC_AHMEDABAD,
    },
    # Pune — Mula-Mutha red-line 46% encroached; 2024 flood at HALF the design flow.
    ("Maharashtra", "Pune"): {
        "subject": "Mula-Mutha floodplain — 46% of the red-line zone encroached and "
                   "the river channelised for the riverfront; 2024 flood came at half "
                   "the design discharge",
        "range_note": "PRDP DMP: 437 ha (46%) of the red-line area encroached; river "
                      "capacity down >50%. 2024 flood at ~35,570 cusecs — below the "
                      "60,000-cusec blue line — where 67,000 (2014) & 90,000 (1997) "
                      "hadn't flooded. Bombay HC (26 Jun) ordered scientific floodlines.",
        "points": [
            {"year": 1997, "metric": "safe_discharge_cusecs", "value": 90000,
             "note": "90,000 cusecs passed without significant flooding (1997)",
             "source": SANDRP_PUNE},
            {"year": 2024, "metric": "flood_event", "value": True,
             "note": "flooded at only ~35,570 cusecs — encroachment + riverfront "
                     "channelisation cut capacity >50%; NGT/Bombay-HC litigated",
             "source": SANDRP_PUNE},
        ],
        "source": SANDRP_PUNE,
    },
    # Bhopal — Upper Lake (Bhoj Wetland, Ramsar) catchment eaten by construction.
    ("Madhya Pradesh", "Bhopal"): {
        "subject": "Bhoj Wetland (Upper Lake, Ramsar) — 11th-century lake supplying "
                   "40% of Bhopal's water, its catchment choked by illegal construction",
        "range_note": "Upper Lake ~36 km² (361 km² catchment), supplies 40% of the "
                      "city's water to ~1.8M people; ~125 ha of catchment lost to "
                      "construction. NGT ordered demolition within 50 m of the FTL "
                      "(Bhoj Wetland Rules); drives razed encroachments 2026.",
        "points": [
            {"year": 2002, "metric": "ramsar_designated", "value": True,
             "note": "Bhoj Wetland designated a Ramsar site (Nov 2002)",
             "source": HITAVADA_BHOJ},
            {"year": 2026, "metric": "encroachment_ha", "value": 125,
             "note": "~125 ha of Upper Lake catchment lost to construction; NGT-"
                     "ordered demolitions within the 50 m FTL zone", "source": HITAVADA_BHOJ},
        ],
        "source": HITAVADA_BHOJ,
    },
    # Vadodara — Vishwamitri floodplain built over; 2024 flood + crocodiles in streets.
    ("Gujarat", "Vadodara"): {
        "subject": "Vishwamitri floodplain built over — the 2024 flood put 440+ "
                   "crocodiles' river into the streets; NGT directive (2021) unactioned",
        "range_note": "IIT-Gn: 2024 flooding driven by development in flood-prone "
                      "areas + clogged drainage; the Vishwamitri hosts 440+ crocodiles "
                      "(24 rescued from homes). Activist NGT case since 2016; 2021 NGT "
                      "directive on encroachment not acted on (per petitioner).",
        "points": [
            {"year": 2016, "metric": "ngt_case_filed", "value": True,
             "note": "Paryavaran Suraksha Samiti took VMC to NGT over choked "
                     "drains / floodplain (2016)", "source": SANDRP_VADODARA},
            {"year": 2024, "metric": "flood_event", "value": True,
             "note": "Aug–Sep 2024 flood; floodplain encroachment + Ajwa dam release "
                     "put 24 crocodiles into residential areas", "source": SANDRP_VADODARA},
        ],
        "source": SANDRP_VADODARA,
    },
    # Vijayawada (Krishna district) — Budameru floodplain settled; 2024 deluge.
    ("Andhra Pradesh", "Krishna"): {
        "subject": "Budameru rivulet ('Sorrow of Vijayawada') — floodplain settled by "
                   "lakhs since 2011; the 2024 deluge killed 35 and hit 2.7 lakh people",
        "range_note": "Budameru peaked at 990 m³/s vs the 200 m³/s diversion-canal "
                      "capacity; ~lakhs settled on flood banks 2011–2024; Prakasam "
                      "barrage discharged a record 1.18M cusecs. 'Operation Budameru' "
                      "launched to clear encroachments (state lacks encroachment data).",
        "points": [
            {"year": 2011, "metric": "settlement_started", "value": True,
             "note": "large-scale settlement of Budameru flood banks/plains began "
                     "(2011 onward)", "source": WIKI_VIJAYAWADA},
            {"year": 2024, "metric": "flood_event", "value": True,
             "note": "Sep 2024 Budameru flood — 35 dead, ~2.7 lakh affected; canal "
                     "capacity 200 m³/s vs 990 m³/s inflow; encroached floodplain",
             "source": WIKI_VIJAYAWADA},
        ],
        "source": WIKI_VIJAYAWADA,
    },
    # Gurugram — 640 water bodies (1956) → 251; Ghata lake 370 ac → ~2 ac; 'Gurujam'.
    ("Haryana", "Gurgaon"): {
        "subject": "Gurugram's vanished lakes & drains — 389 water bodies lost since "
                   "1956; Ghata lake 370 ac → ~2 ac; the natural drainage that never "
                   "flooded now floods every monsoon",
        "range_note": "Admin study to NGT: 640 water bodies (1956) → 251 today (389 "
                      "lost). Ghata lake ~370 ac (to early 2000s) → ~2 ac; Basai "
                      "wetland ~25% of original by 2022; Badshahpur storm-drain "
                      "encroached. No floods reported till 1998; 'Gurujam' from 2016.",
        "points": [
            {"year": 1956, "metric": "water_bodies", "value": 640,
             "note": "640 water bodies recorded (1956)", "source": NGT_GURUGRAM},
            {"year": 2024, "metric": "water_bodies", "value": 251,
             "note": "251 remain — 389 lost; Ghata lake 370 ac → ~2 ac; encroached "
                     "Badshahpur drain → recurring 'Gurujam' floods", "source": NGT_GURUGRAM},
        ],
        "source": NGT_GURUGRAM,
    },
}

# ---------------------------------------------------------------------------
# ENCROACHMENT — DOCUMENTED cases only, each pinned to a specific NGT/court order
# (name + date + case ref where available). No blanket per-district numbers. These
# are the mechanism that turns rain into flood: filling/encroaching water bodies
# and floodplains destroys the natural drainage + flood buffer.
# ---------------------------------------------------------------------------
NGT_SRC = "https://greentribunal.gov.in/"

ENCROACHMENT_CASES = {
    ("West Bengal", "Kolkata"): [
        {"type": "wetland-fill (real estate)",
         "water_body": "East Kolkata Wetlands (Ramsar site)",
         "order_ref": "NGT Eastern Zone, 25 Oct 2017 — 'Temple of Knowledge'",
         "detail": "NGT ordered demolition of a 60-ft illegal structure built by "
                   "filling wetland (Vedic Dharma Sansthan Trust); EKWMA directed "
                   "to demolish. Petition by PUBLIC (2016). Post-2006-Act filling "
                   "held wholly illegal.",
         "year": 2017, "status": "demolition ordered", "source": NGT_SRC},
        {"type": "wetland-fill (godowns/warehouses)",
         "water_body": "East Kolkata Wetlands (Ramsar site)",
         "order_ref": "NGT EZ, Ranjit Kumar Sapui v. State of WB (2023–)",
         "detail": "NGT directed EKWMA to clear illegal structures/godowns and "
                   "restore filled land to water body; reports of ~88.5 acres "
                   "illegally filled (Nazirabad).",
         "year": 2023, "status": "restoration directed", "source": NGT_SRC},
    ],
    ("Tamil Nadu", "Chennai"): [
        {"type": "marsh encroachment (institutional + private)",
         "water_body": "Pallikaranai marsh (Ramsar site)",
         "order_ref": "NGT Southern Bench, O.A. 91/2023 (SZ) suo motu; order 24 Sep 2025",
         "detail": "NGT froze ALL building approvals inside the Ramsar boundary + "
                   "1-km influence zone; CMDA implemented via Office Order 07/2025 "
                   "(9 Oct 2025). DGPS survey: 38% of the marsh occupied (GCC 173.56 "
                   "ha, ELCOT 163.25 ha, Railways 46.92 ha, IT park 5.85 ha).",
         "year": 2025, "status": "approvals frozen", "source": NGT_SRC},
        {"type": "illegal housing eviction",
         "water_body": "Pallikaranai marsh",
         "order_ref": "NGT Southern Bench, Jan 2024 eviction direction",
         "detail": "NGT directed eviction of illegal structures to retrieve marsh; "
                   "Forest Dept + GCC demolished 70 encroaching houses (Mahalakshmi "
                   "Nagar) Nov 2024; families resettled via TNUHDB.",
         "year": 2024, "status": "70 houses demolished", "source": NGT_SRC},
    ],
    ("Karnataka", "Bangalore Urban"): [
        {"type": "lakebed encroachment (builders)",
         "water_body": "Bellandur / Agara / Kundanahalli lakes",
         "order_ref": "NGT 2015–2016; SC 2017 (buffer)",
         "detail": "NGT ordered demolitions in Bellandur/Kundanahalli (2016) and "
                   "a 75-m lake buffer; SC (2017) trimmed the buffer but upheld "
                   "₹139 cr fines on builders Mantri & Coremind (2015) for "
                   "construction on Agara lake / stormwater drains.",
         "year": 2016, "status": "demolitions + ₹139 cr fines", "source": NGT_SRC},
    ],
    ("Maharashtra", "Greater Bombay"): [
        {"type": "floodplain reclamation + mangrove loss",
         "water_body": "Mithi river / Bandra-Kurla Complex",
         "order_ref": "SC-appointed fact-finding committee (post-2005)",
         "detail": "SC-appointed committee found 620 ha reclaimed for BKC and "
                   "bridge bottlenecks narrowed the Mithi; Bombay HC/court-driven "
                   "mangrove-protection orders followed. 2017 committee: encroachment "
                   "removal 'not totally satisfactory'.",
         "year": 2006, "status": "committee findings; partial removal", "source": FLOODLIST_MITHI},
    ],
    ("Andhra Pradesh", "Hyderabad"): [
        {"type": "FTL/nala encroachment (real estate)",
         "water_body": "Hussain Sagar + city lakes/nalas",
         "order_ref": "HYDRAA (est. 19 Jul 2024); GHMC show-cause; NGT/FTL rules",
         "detail": "HYDRAA razed encroachments within lake FTL/buffer from Aug 2024 "
                   "(Khanapur, Gandipet, Shankerpally); GHMC show-cause to Pradeep "
                   "Constructions for a 17-storey tower found inside Hussain Sagar "
                   "FTL (2026). >30,000 nala encroachments identified.",
         "year": 2024, "status": "demolitions ongoing", "source": NRSC_HYD},
    ],
    ("Jammu & Kashmir", "Srinagar"): [
        {"type": "wetland/lake encroachment",
         "water_body": "Dal Lake / Wular / Hokersar",
         "order_ref": "CAG audit (2026); NGT/High Court monitoring",
         "detail": "CAG flagged >10% Dal open-water shrinkage (2007–2020) from "
                   "encroachment (Mir Behri, Lati Mohalla, Nandapora) + floating "
                   "gardens; Wular encroachment/siltation eroded the valley flood "
                   "buffer. New colonies (Nowgam, Bemina) sit on former wetland.",
         "year": 2026, "status": "audit-flagged; conservation ordered", "source": CAG_DAL},
    ],
    ("Delhi", "Delhi"): [
        {"type": "floodplain (O-zone) encroachment",
         "water_body": "Yamuna floodplain",
         "order_ref": "NGT O.A. 537/2023; DDA action plan; ≥15 demolition drives",
         "detail": "NGT directed DDA to remove floodplain encroachments and restore "
                   "the O-zone after the July-2023 flood; DDA issued eviction notices "
                   "(e.g. 310 families, Yamuna Bazar) and began wetland restoration "
                   "(Asita, Yamuna Vanasthali) — rehabilitation criticised as partial.",
         "year": 2023, "status": "restoration + evictions ordered", "source": SANDRP_YAMUNA},
    ],
    ("Assam", "Kamrup"): [
        {"type": "Ramsar wetland encroachment + dumping",
         "water_body": "Deepor Beel (Ramsar site)",
         "order_ref": "NGT (Eco-Sensitive-Zone direction; Jan-2026 pollution notice)",
         "detail": "NGT directed Assam to notify an Eco-Sensitive Zone around Deepor "
                   "Beel and took note of pollution/degradation (Jan 2026); Kamrup "
                   "(Metro) admin banned community fishing/excavation/construction. "
                   "Municipal dumping at Boragaon + railway-corridor tree-felling.",
         "year": 2026, "status": "ESZ directed; activity banned", "source": WIKI_DEEPOR},
    ],
    ("Gujarat", "Ahmadabad"): [
        {"type": "floodplain reclamation (riverfront)",
         "water_body": "Sabarmati river / floodplain + city lakes",
         "order_ref": "PIL/NGT critique of riverfront model (Paryavaran Suraksha Samiti)",
         "detail": "Sabarmati Riverfront reclaimed floodplain and channelised the "
                   "river; critics (who took Gujarat civic bodies to NGT) link "
                   "narrowing + blocked drains + lost lakes (~2.2% blue cover) to "
                   "worsening urban flooding; lower promenade submerged 2025.",
         "year": 2025, "status": "contested; riverfront submerged", "source": QOC_AHMEDABAD},
    ],
    ("Maharashtra", "Pune"): [
        {"type": "riverbed road / floodplain encroachment",
         "water_body": "Mula-Mutha river",
         "order_ref": "NGT Jul-2013 (+ Jan-2015 contempt); Bombay HC 26-Jun-2024",
         "detail": "NGT ordered realignment of an illegal 2.3 km riverbed road (2013) "
                   "and again its removal (2015 contempt). Bombay HC (Jun 2024) "
                   "ordered scientific floodlines + removal of construction PMC "
                   "permitted on the floodplain; RFD stayed on 8 of 11 stretches.",
         "year": 2024, "status": "HC-ordered floodline redraw", "source": SANDRP_PUNE},
    ],
    ("Madhya Pradesh", "Bhopal"): [
        {"type": "Ramsar catchment construction",
         "water_body": "Bhoj Wetland — Upper Lake (Ramsar)",
         "order_ref": "NGT (Bhoj Wetland Rules; 50 m FTL); demolition drives 2026",
         "detail": "NGT warned BMC over inaction and ordered removal of construction "
                   "within 50 m of the Upper Lake FTL (Bhoj Wetland Rules 2018 / "
                   "Wetlands Rules). Drives razed encroachments (e.g. Lalghati: 63 "
                   "identified, 44 private + 17 govt) 2026; focus now on Lower Lake.",
         "year": 2026, "status": "demolitions ongoing", "source": HITAVADA_BHOJ},
    ],
    ("Gujarat", "Vadodara"): [
        {"type": "river floodplain encroachment",
         "water_body": "Vishwamitri river",
         "order_ref": "NGT (2016 case; 2021 directive) — Paryavaran Suraksha Samiti",
         "detail": "Paryavaran Suraksha Samiti took VMC to NGT (2016) over choked "
                   "drains and floodplain encroachment; per the petitioner VMC did "
                   "not act on the 2021 NGT directive. Mega-highways/bullet-train "
                   "alignments also cited as obstructing the natural river system.",
         "year": 2021, "status": "directive unactioned (per petitioner)", "source": SANDRP_VADODARA},
    ],
    ("Andhra Pradesh", "Krishna"): [
        {"type": "floodplain settlement (Budameru)",
         "water_body": "Budameru rivulet / Kolleru–Upputeru system",
         "order_ref": "'Operation Budameru' (state); encroachment data still lacking",
         "detail": "Lakhs settled on Budameru flood banks/plains (2011–2024), cutting "
                   "capacity; Kolleru lake + the Upputeru outlet to the sea also "
                   "encroached. After the 2024 deluge (35 dead) the state launched "
                   "Operation Budameru to clear encroachments — but still lacks "
                   "comprehensive encroachment data.",
         "year": 2024, "status": "clearance launched; data gap", "source": WIKI_VIJAYAWADA},
    ],
    ("Haryana", "Gurgaon"): [
        {"type": "water-body + storm-drain encroachment",
         "water_body": "Ghata / Basai / Najafgarh jheel + Badshahpur drain",
         "order_ref": "NGT (admin water-body study); SC/INTACH on Najafgarh (Jul-2023)",
         "detail": "A Gurugram admin study to the NGT found 389 water bodies lost "
                   "since 1956 (640→251); Ghata lake shrank ~370 ac → ~2 ac; Basai "
                   "wetland ~25% of original by 2022; Badshahpur storm-drain "
                   "encroached. INTACH moved the SC (Jul 2023) over the Najafgarh "
                   "embankment; matter before the NGT.",
         "year": 2023, "status": "before NGT/SC; ₹100 cr bundh revival", "source": NGT_GURUGRAM},
    ],
}

# ---------------------------------------------------------------------------
# Coastal states/UTs — CRZ (MoEFCC Coastal Regulation Zone Notification, 2019)
# applies to every district with a sea coast. This is a closed, uncontested list.
# ---------------------------------------------------------------------------
COASTAL_STATES = {
    "Gujarat", "Maharashtra", "Goa", "Karnataka", "Kerala", "Tamil Nadu",
    "Andhra Pradesh", "Odisha", "West Bengal",
    # UTs with coastline
    "Puducherry", "Daman and Diu", "Andaman & Nicobar", "Lakshadweep",
}

# ---------------------------------------------------------------------------
# COASTAL DISTRICTS — the districts that ACTUALLY touch the sea (so CRZ applies at
# district level, not just state level). Names match the ledger's Census-2011
# spellings exactly. Inland districts of a coastal state are NOT here → CRZ=false
# for them, which is the honest per-district position. This is well-established
# geography (Survey of India / district coastlines); MoEFCC CZMPs are prepared
# only for these coastal districts.
# ---------------------------------------------------------------------------
COASTAL_DISTRICTS = {
    "Gujarat": {"Kachchh", "Jamnagar", "Porbandar", "Junagadh", "Amreli",
                "Bhavnagar", "Anand", "Bharuch", "Surat", "Navsari", "Valsad",
                "Ahmadabad"},
    "Maharashtra": {"Greater Bombay", "Thane", "Raigarh", "Ratnagiri", "Sindhudurg"},
    "Goa": {"North Goa", "South Goa"},
    "Karnataka": {"Uttar Kannand", "Udupi", "Dakshin Kannad"},
    "Kerala": {"Kasaragod", "Kannur", "Kozhikode", "Malappuram", "Thrissur",
               "Ernakulam", "Alappuzha", "Kollam", "Thiruvananthapuram"},
    "Tamil Nadu": {"Thiruvallur", "Chennai", "Kancheepuram", "Cuddalore",
                   "Nagapattinam", "Thiruvarur", "Thanjavur", "Pudukkottai",
                   "Ramanathapuram", "Thoothukudi", "Tirunelveli Kattabo",
                   "Kanniyakumari", "Villupuram"},
    "Andhra Pradesh": {"Srikakulam", "Vizianagaram", "Vishakhapatnam",
                       "East Godavari", "West Godavari", "Krishna", "Guntur",
                       "Prakasam", "Nellore"},
    "Odisha": {"Baleshwar", "Bhadrak", "Kendrapara", "Jagatsinghpur", "Puri",
               "Ganjam"},
    "West Bengal": {"North 24 Parganas", "South 24 Parganas", "East Midnapore",
                    "Haora", "Kolkata"},
    "Puducherry": {"Puducherry", "Karaikal", "Yanam", "Mahe"},
    "Daman and Diu": {"Daman", "Junagadh"},   # Diu is administratively "Junagadh" here
    "Andaman & Nicobar": {"Andaman Islands", "Nicobar Islands"},
    "Lakshadweep": {"Kavaratti"},
}

# ---------------------------------------------------------------------------
# Chronically flood-prone states — CWC / NDMA / Rashtriya Barh Ayog. We flag the
# STATE; the per-district flood micro-zone + annual damage ₹ stays a district gap.
# ---------------------------------------------------------------------------
FLOOD_PRONE_STATES = {
    "Assam", "Bihar", "West Bengal", "Uttar Pradesh", "Odisha", "Andhra Pradesh",
    "Kerala", "Punjab", "Jammu & Kashmir", "Uttarakhand", "Himachal Pradesh",
    "Arunachal Pradesh", "Tripura", "Manipur", "Meghalaya",
}

# ---------------------------------------------------------------------------
# CHRONICALLY FLOOD-AFFECTED DISTRICTS — the districts repeatedly named in
# CWC/NDMA situation reports, state DMA lists, and the ISRO-Bhuvan Flood Hazard
# Atlases (per-district hazard). Names match the ledger's Census-2011 spellings.
# A district here = "on the chronic flood list" (district-precise). A district of
# a flood-prone state NOT here inherits only the state flag (state-level), flagged
# honestly as such — not silently promoted to district-chronic. Not exhaustive;
# extend as Flood Hazard Atlases are parsed. Sources: CWC, NDMA, ASDMA/FMISC,
# Bhuvan Flood Hazard Atlas (Bihar/Assam).
# ---------------------------------------------------------------------------
# Names below are reconciled to the ledger's exact Census-2011 spellings.
FLOOD_PRONE_DISTRICTS = {
    "Bihar": {  # Kosi/Gandak/Bagmati/Ghaghara belts — Bihar WRD/FMISC + CWC
        "Supaul", "Madhepura", "Saharsa", "Araria", "Purnia", "Katihar",
        "Sitamarhi", "Sheohar", "Madhubani", "Darbhanga", "Khagaria",
        "Muzaffarpur", "Gopalganj", "Saran", "Siwan", "Vaishali",
        "Pashchim Champaran", "Purba Champaran", "Samastipur", "Begusarai",
    },
    "Assam": {  # Brahmaputra + Barak + Kopili — ASDMA/NDRF-NRSC
        "Dhuburi", "Barpeta", "Darrang", "Marigaon", "Nagaon", "Cachar",
        "Dhemaji", "Lakhimpur", "Jorhat", "Sonitpur", "Goalpara", "Bongaigaon",
        "Nalbari", "Kamrup", "Golaghat", "Sibsagar", "Tinsukia", "Dibrugarh",
        "Hailakandi", "Karimganj",
    },
    "Uttar Pradesh": {  # Ghaghara/Rapti/Gandak Terai belt + Ganga-Yamuna
        "Bahraich", "Shravasti", "Balrampur", "Gonda", "Sant Kabir Nagar",
        "Gorakhpur", "Kushinagar", "Deoria", "Ballia", "Bara Banki", "Sitapur",
        "Lakhimpur Kheri", "Faizabad", "Azamgarh", "Siddharth Nagar",
    },
    "West Bengal": {  # Ganga-Damodar-Teesta + Sundarban tidal
        "Maldah", "Murshidabad", "North 24 Parganas", "South 24 Parganas",
        "East Midnapore", "Haora", "Hugli", "Nadia", "Jalpaiguri", "Kochbihar",
    },
    "Odisha": {  # Mahanadi-Brahmani-Baitarani delta
        "Puri", "Kendrapara", "Jagatsinghpur", "Cuttack", "Jajpur", "Bhadrak",
        "Baleshwar", "Khordha", "Ganjam",
    },
    "Kerala": {  # 2018/2019 floods — CWC/state
        "Alappuzha", "Kottayam", "Ernakulam", "Thrissur", "Pattanamtitta",
        "Idukki", "Wayanad", "Kozhikode",
    },
    "Andhra Pradesh": {  # Godavari-Krishna delta
        "East Godavari", "West Godavari", "Krishna", "Guntur", "Nellore",
    },
}

# ---------------------------------------------------------------------------
# Dominant physiographic terrain per state/UT (standard India physiography).
# One of: himalayan-hill, northeast-hill, plateau, indo-gangetic-plain,
# coastal-plain, desert-arid, island. Intra-state variation -> per-district gap.
# ---------------------------------------------------------------------------
STATE_TERRAIN = {
    "Jammu & Kashmir": "himalayan-hill",
    "Ladakh": "himalayan-hill",
    "Himachal Pradesh": "himalayan-hill",
    "Uttarakhand": "himalayan-hill",
    "Sikkim": "himalayan-hill",
    "Arunachal Pradesh": "northeast-hill",
    "Nagaland": "northeast-hill",
    "Manipur": "northeast-hill",
    "Mizoram": "northeast-hill",
    "Meghalaya": "northeast-hill",
    "Tripura": "northeast-hill",
    "Assam": "indo-gangetic-plain",           # Brahmaputra/Barak valley plains
    "Punjab": "indo-gangetic-plain",
    "Haryana": "indo-gangetic-plain",
    "Delhi": "indo-gangetic-plain",
    "Chandigarh": "indo-gangetic-plain",
    "Uttar Pradesh": "indo-gangetic-plain",
    "Bihar": "indo-gangetic-plain",
    "West Bengal": "indo-gangetic-plain",     # + coastal south (per-district gap)
    "Jharkhand": "plateau",
    "Chhattisgarh": "plateau",
    "Madhya Pradesh": "plateau",
    "Telangana": "plateau",
    "Karnataka": "plateau",                   # Deccan + Western Ghats + coast
    "Maharashtra": "plateau",                 # Deccan + Ghats + Konkan coast
    "Odisha": "coastal-plain",                # coast + Eastern Ghats interior
    "Andhra Pradesh": "coastal-plain",
    "Tamil Nadu": "coastal-plain",
    "Kerala": "coastal-plain",                # coast + Western Ghats
    "Goa": "coastal-plain",
    "Gujarat": "coastal-plain",               # coast + Kutch arid + Kathiawar
    "Rajasthan": "desert-arid",
    "Puducherry": "coastal-plain",
    "Daman and Diu": "coastal-plain",
    "Dadra and Nagar Haveli": "plateau",
    "Andaman & Nicobar": "island",
    "Lakshadweep": "island",
}

# ---------------------------------------------------------------------------
# Principal river system(s) per state (India-WRIS basins). The exact rivers
# touching a single district -> per-district gap.
# ---------------------------------------------------------------------------
STATE_RIVERS = {
    "Jammu & Kashmir": ["Jhelum", "Chenab", "Indus"],
    "Ladakh": ["Indus"],
    "Himachal Pradesh": ["Sutlej", "Beas", "Ravi", "Chenab"],
    "Punjab": ["Sutlej", "Beas", "Ravi"],
    "Haryana": ["Yamuna", "Ghaggar"],
    "Delhi": ["Yamuna"],
    "Chandigarh": ["Ghaggar"],
    "Uttarakhand": ["Ganga", "Yamuna", "Alaknanda", "Bhagirathi"],
    "Uttar Pradesh": ["Ganga", "Yamuna", "Ghaghara", "Gomti"],
    "Bihar": ["Ganga", "Kosi", "Gandak", "Bagmati", "Sone"],
    "Jharkhand": ["Subarnarekha", "Damodar", "Koel"],
    "West Bengal": ["Ganga (Hooghly)", "Teesta", "Damodar"],
    "Assam": ["Brahmaputra", "Barak"],
    "Arunachal Pradesh": ["Brahmaputra", "Siang", "Lohit"],
    "Nagaland": ["Doyang", "Dhansiri"],
    "Manipur": ["Barak", "Imphal"],
    "Mizoram": ["Tlawng", "Barak"],
    "Meghalaya": ["Brahmaputra tributaries", "Barak"],
    "Tripura": ["Gomati", "Barak"],
    "Sikkim": ["Teesta", "Rangit"],
    "Rajasthan": ["Chambal", "Banas", "Luni", "Ghaggar"],
    "Gujarat": ["Narmada", "Tapi", "Sabarmati", "Mahi"],
    "Madhya Pradesh": ["Narmada", "Chambal", "Betwa", "Sone", "Tapi"],
    "Maharashtra": ["Godavari", "Krishna", "Tapi", "Bhima"],
    "Goa": ["Mandovi", "Zuari"],
    "Karnataka": ["Krishna", "Kaveri", "Tungabhadra", "Sharavathi"],
    "Kerala": ["Periyar", "Bharathapuzha", "Pamba"],
    "Tamil Nadu": ["Kaveri", "Vaigai", "Thamirabarani"],
    "Andhra Pradesh": ["Godavari", "Krishna", "Penna"],
    "Telangana": ["Godavari", "Krishna"],
    "Odisha": ["Mahanadi", "Brahmani", "Baitarani"],
    "Chhattisgarh": ["Mahanadi", "Indravati", "Sone"],
    "Puducherry": ["Sankaraparani"],
    "Daman and Diu": ["Daman Ganga"],
    "Dadra and Nagar Haveli": ["Daman Ganga"],
    "Andaman & Nicobar": [],
    "Lakshadweep": [],
}

IMD_SRC = "https://mausam.imd.gov.in/responsive/rainfallinformation.php"

# ---------------------------------------------------------------------------
# RAINFALL — IMD publishes district-wise ANNUAL NORMAL rainfall (LPA, 1971-2020),
# but only via a DYNAMIC portal query (mausam.imd.gov.in), not a single bulk table
# we can honestly ingest for all 594. So: (a) a climate BAND per state (broad, from
# IMD's own zone maps) gives every district context; (b) a small set of WELL-
# DOCUMENTED anchor figures (national extremes) carry real mm; (c) the precise
# per-district normal stays an explicit GAP → IMD portal. No 594 rainfall numbers
# are fabricated. Same portal-blocker honesty as the MGNREGA MIS case.
#
# Band (mm/yr, broad IMD climatic zones): arid <400, semi-arid 400-750,
# moderate 750-1150, high 1150-2000, very-high >2000.
# ---------------------------------------------------------------------------
STATE_RAIN_BAND = {
    "Rajasthan": "arid-to-semiarid", "Gujarat": "semiarid-to-moderate",
    "Haryana": "semiarid", "Punjab": "semiarid-to-moderate", "Delhi": "semiarid",
    "Chandigarh": "moderate", "Uttar Pradesh": "moderate",
    "Madhya Pradesh": "moderate", "Bihar": "moderate-to-high",
    "Jharkhand": "moderate-to-high", "Chhattisgarh": "high",
    "West Bengal": "high", "Odisha": "high", "Telangana": "moderate",
    "Andhra Pradesh": "moderate-to-high", "Karnataka": "moderate-to-high",
    "Tamil Nadu": "moderate", "Kerala": "very-high", "Goa": "very-high",
    "Maharashtra": "moderate-to-high", "Himachal Pradesh": "high",
    "Uttarakhand": "high", "Jammu & Kashmir": "moderate",
    "Ladakh": "arid", "Sikkim": "very-high", "Assam": "very-high",
    "Arunachal Pradesh": "very-high", "Meghalaya": "very-high",
    "Nagaland": "very-high", "Manipur": "high", "Mizoram": "very-high",
    "Tripura": "very-high", "Puducherry": "moderate",
    "Andaman & Nicobar": "very-high", "Lakshadweep": "high",
    "Dadra and Nagar Haveli": "high", "Daman and Diu": "moderate",
}
# Documented anchor figures — real IMD-cited annual normals (mm) for a few
# well-known districts (the national extremes + reference points). These carry a
# value; everything else is band + gap.
RAIN_ANCHORS = {
    ("Meghalaya", "East Khasi Hills"): (11000, "Mawsynram/Cherrapunji — world's "
        "wettest (East Khasi Hills); ~11,000 mm/yr", IMD_SRC),
    ("Rajasthan", "Jaisalmer"): (210, "Thar desert — among India's driest; IMD "
        "normal ~160-210 mm/yr (revised upward recently)", IMD_SRC),
}

TERRAIN_DEV_NOTE = {
    "himalayan-hill": "Steep Himalayan terrain: high per-km infrastructure cost, "
        "landslide + glacial-lake-outburst-flood (GLOF) exposure, seismic zone.",
    "northeast-hill": "Hilly, high-rainfall Northeast: landslides, riverine flooding, "
        "and remoteness raise the cost and slow the pace of development.",
    "plateau": "Deccan/plateau: mineral-rich but undulating; water scarcity in parts, "
        "flash floods along river valleys.",
    "indo-gangetic-plain": "Flat, densely-settled river plain: fertile but chronically "
        "flood-exposed where drainage/embankments and urban planning lag.",
    "coastal-plain": "Coastal plain: CRZ caps near-shore construction; cyclone + storm-surge "
        "+ sea-level exposure; saline ingress. Development is legally and physically bounded.",
    "desert-arid": "Arid/semi-arid: water scarcity is the binding constraint; flash floods "
        "in cloudbursts despite low annual rainfall.",
    "island": "Island territory: CRZ + fragile ecology tightly cap construction; everything "
        "imported; tsunami/cyclone exposure.",
}


def geo_block(state):
    """Build the state-level and per-district geography facts for one state."""
    coastal = state in COASTAL_STATES
    flood = state in FLOOD_PRONE_STATES
    terrain = STATE_TERRAIN.get(state)
    rivers = STATE_RIVERS.get(state, [])
    return coastal, flood, terrain, rivers


def hinders_note(coastal, flood, terrain, rivers):
    """The comparative 'why development is constrained here' line — descriptive,
    sourced-list based, never a computed score."""
    bits = []
    if terrain and terrain in TERRAIN_DEV_NOTE:
        bits.append(TERRAIN_DEV_NOTE[terrain])
    if flood:
        bits.append("State is on the CWC/NDMA chronically flood-prone list — "
                    "recurrent flood relief spending competes with capital "
                    "(development) spending.")
    if coastal:
        bits.append("Coastal: the CRZ Notification (MoEFCC 2019) legally restricts "
                    "construction, industry and reclamation near the shore.")
    if rivers:
        bits.append(f"Crossed by {', '.join(rivers[:3])}"
                    + (" and others" if len(rivers) > 3 else "")
                    + " — floodplain encroachment + missing storm-water drainage "
                    "and sewage turn heavy rain into urban flooding.")
    bits.append("Shown beside the money flow to reveal the development–environment "
                "loop; not a causal claim and no hindrance 'score' is computed.")
    return " ".join(bits)


def main():
    with open(LEDGER, encoding="utf-8") as f:
        data = json.load(f)

    n_state = 0
    n_dist = 0
    missing_terrain = set()

    for sname, s in data["states"].items():
        coastal, flood, terrain, rivers = geo_block(sname)
        if terrain is None:
            missing_terrain.add(sname)
        note = hinders_note(coastal, flood, terrain, rivers)

        # State-level geography block (sibling to politics/heads).
        s["geography"] = {
            "on_coast": coastal,
            "crz_applies": coastal,
            "flood_prone": flood,
            "terrain": terrain,
            "major_rivers": rivers,
            "hinders_dev_note": note,
            "level": "state",
            "as_of": "2026-07",
            "sources": {
                "crz": CRZ_SRC,
                "flood": FLOOD_SRC,
                "ndma": NDMA_SRC,
                "rivers": WRIS_SRC,
                "sewage": CPCB_SRC,
            },
            "source_tier": 2,
            "note": "State-level physical-geography facts (coastal/flood/terrain/"
                    "rivers). District CRZ category, annual flood damage ₹, and the "
                    "sewage/drainage master-plan status are district gaps until a "
                    "per-district gov PDF/portal (CZMP, state relief memo, CPCB) is "
                    "sourced. Comparative, not a hindrance score.",
        }
        n_state += 1

        coastal_dists = COASTAL_DISTRICTS.get(sname, set())
        chronic_flood_dists = FLOOD_PRONE_DISTRICTS.get(sname, set())
        for dname, dist in s.get("districts", {}).items():
            n_dist += 1
            # Per-district coastal: only districts that actually touch the sea.
            # For coastal states we have a district list → precise true/false.
            # For non-coastal states every district is simply false.
            dist_coastal = dname in coastal_dists
            # Per-district flood: is this district on the CHRONIC list, or does it
            # only inherit the state flood-prone flag? Three honest levels.
            if dname in chronic_flood_dists:
                dist_flood, flood_level = True, "district-chronic"
            elif flood:
                dist_flood, flood_level = True, "state-flood-prone"
            else:
                dist_flood, flood_level = False, "not-flagged"
            dims = dist.setdefault("dimensions", {})
            tl = TIMELINE_PILOT.get((sname, dname))
            # Preserve the elevation block if add_district_elevation.py already ran —
            # it's expensive (live SRTM API) and independent of this generator.
            prev_elev = dims.get("geography", {}).get("elevation")
            dims["geography"] = {
                "terrain": terrain,                  # state dominant type
                "on_coast": dist_coastal,            # PER-DISTRICT: touches the sea?
                "on_coast_level": "district",        # honesty: this flag is district-precise
                "flood_prone": dist_flood,           # PER-DISTRICT (chronic list) or state-inherited
                "flood_level": flood_level,          # district-chronic | state-flood-prone | not-flagged
                "major_rivers": rivers,              # state river systems
                "crz": {
                    "applies": dist_coastal,
                    "category": None,                # I/II/III/IV — district CZMP GAP
                    "restricts_dev": dist_coastal,
                    "level": "district",
                    "figure_gap": True,
                    "source": CRZ_SRC,
                },
                "flood_risk": {
                    "state_flood_prone": flood,
                    "district_chronic": dname in chronic_flood_dists,
                    "level": flood_level,            # district-chronic | state-flood-prone | not-flagged
                    "flood_damage_cr": None,         # annual — state relief memo GAP
                    "area_flooded_ha": None,         # GAP
                    "figure_gap": True,
                    "source": FLOOD_SRC,
                    "note": "district-chronic = named in CWC/NDMA/state-DMA/Bhuvan "
                            "Flood Hazard Atlas as repeatedly affected; state-flood-"
                            "prone = only inherits the state flag (not district-"
                            "confirmed); not-flagged = neither.",
                },
                "rainfall": {
                    "annual_normal_mm": (RAIN_ANCHORS.get((sname, dname)) or (None,))[0],
                    "band": STATE_RAIN_BAND.get(sname),   # broad IMD climatic zone
                    "level": "district" if (sname, dname) in RAIN_ANCHORS else "state-band",
                    "figure_gap": (sname, dname) not in RAIN_ANCHORS,
                    "note": (RAIN_ANCHORS[(sname, dname)][1] if (sname, dname) in RAIN_ANCHORS
                             else "Precise district annual-normal rainfall is on the "
                                  "IMD portal (dynamic query, not a bulk table) — gap. "
                                  "Band is the broad state climatic zone. Ties to "
                                  "rains→floods: high-rain + flood-prone + poor "
                                  "drainage = urban flooding."),
                    "source": IMD_SRC,
                },
                "urban_planning": {
                    "sewage_treatment_gap_pct": None,  # CPCB inventory is city-level GAP
                    "drainage_master_plan": None,      # municipal, unpublished GAP
                    "figure_gap": True,
                    "note": "Missing sewage/storm-water drainage + unplanned "
                            "floodplain construction is a key reason rain becomes "
                            "flood; per-district figures need CPCB/municipal data.",
                    "source": CPCB_SRC,
                },
                # Illegal encroachment — flag + gap only (user 2026-07-08). No blanket
                # per-district number is invented; specific cases get pinned later with
                # an NGT/court/CAG citation. Encroachment on floodplains/water bodies/
                # CRZ is the mechanism that turns rain into flood.
                "encroachment": {
                    "documented": bool(ENCROACHMENT_CASES.get((sname, dname))),
                    "cases": ENCROACHMENT_CASES.get((sname, dname), []),
                    "figure_gap": not ENCROACHMENT_CASES.get((sname, dname)),
                    "note": "Floodplain / water-body / CRZ encroachment alters land + "
                            "terrain and worsens flooding. Cases here are pinned to a "
                            "specific NGT/court order; districts without a pinned case "
                            "are a gap, not zero — not bulk-guessed.",
                    "source": NGT_SRC,
                },
                # Change over the years — OPEN satellite sources only (JRC Global
                # Surface Water / ISRO Bhuvan / Copernicus Sentinel). NOT Google Earth
                # imagery (licensed, non-redistributable). Pilot districts carry real
                # documented change subjects; everyone else = empty timeline (gap).
                "timeline": {
                    "subject": tl["subject"] if tl else None,
                    "range_note": tl.get("range_note") if tl else None,
                    "points": tl["points"] if tl else [],
                    "figure_gap": not tl,
                    "note": "Water-body / built-up change from open satellite sources "
                            "(JRC Global Surface Water 1984-now, ISRO Bhuvan LULC, "
                            "Copernicus Sentinel-2). Google Earth imagery is licensed "
                            "and NOT redistributed — we use open equivalents. Most "
                            "districts have an empty timeline until a series is pinned.",
                    "sources": {"jrc": JRC_SRC, "bhuvan": BHUVAN_SRC, "sentinel": SENTINEL_SRC},
                },
                # Civilian-vs-government land split (for a 'no govt land' 3D/GLB model)
                # is NOT openly sourceable — per-state revenue/cadastral records, mostly
                # not machine-readable. Logged honestly rather than faked.
                "cadastral": {
                    "civilian_vs_govt_land": None,
                    "figure_gap": True,
                    "note": "A civilian-only (no govt land) 3D/GLB model needs a "
                            "cadastral ownership layer that isn't openly available "
                            "(per-state revenue records). GLB deferred; gap logged.",
                    "source": None,
                },
                "hinders_dev_note": hinders_note(dist_coastal, dist_flood, terrain, rivers),
                "level": "mixed",                    # coastal+flood=district-precise; terrain=state-proxy
                "figure_gap": True,
                "source_tier": 2,
            }
            # keep previously-fetched SRTM elevation (don't clobber it on rerun)
            if prev_elev is not None:
                dims["geography"]["elevation"] = prev_elev
            gaps = dist.setdefault("_gaps", [])
            for g in [
                "geography CRZ category (district CZMP map) unsourced",
                "geography annual flood damage ₹ (state relief memo) unsourced",
                "geography sewage/drainage gap % (CPCB city-level) unsourced",
                "geography per-district annual rainfall mm (IMD portal, dynamic) unsourced",
                "geography per-district terrain refinement (intra-state) unsourced",
                "geography illegal-encroachment cases (NGT/court/CAG) unpinned",
                "geography change-over-time series (JRC/Bhuvan/Sentinel) unpinned",
                "geography civilian-vs-govt cadastral split (for GLB) unavailable openly",
            ]:
                if g not in gaps:
                    gaps.append(g)

    with open(LEDGER, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    n_coastal_dist = sum(len(v) for v in COASTAL_DISTRICTS.values())
    print(f"geography dimension attached: {n_state} states + {n_dist} districts")
    print(f"  coastal states (CRZ applies): {len(COASTAL_STATES)}")
    print(f"  coastal DISTRICTS (per-district CRZ): {n_coastal_dist}")
    print(f"  flood-prone states flagged:   {len(FLOOD_PRONE_STATES)}")
    print(f"  chronic-flood DISTRICTS (per-district): {sum(len(v) for v in FLOOD_PRONE_DISTRICTS.values())}")
    print(f"  states missing terrain class: {sorted(missing_terrain) or 'none'}")
    print(f"  timeline pilot districts:     {len(TIMELINE_PILOT)} ({', '.join(d for _, d in TIMELINE_PILOT)})")
    print(f"  encroachment cases pinned:    {sum(len(v) for v in ENCROACHMENT_CASES.values())} "
          f"across {len(ENCROACHMENT_CASES)} districts (NGT-cited)")
    print("  remaining district CRZ / flood ₹ / sewage % / other-district encroachment")
    print("  + timeline left as gaps (no fabrication). GLB deferred: cadastral not open.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
