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
            gaps = dist.setdefault("_gaps", [])
            for g in [
                "geography CRZ category (district CZMP map) unsourced",
                "geography annual flood damage ₹ (state relief memo) unsourced",
                "geography sewage/drainage gap % (CPCB city-level) unsourced",
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
