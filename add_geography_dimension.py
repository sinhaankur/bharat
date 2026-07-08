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
# Chronically flood-prone states — CWC / NDMA / Rashtriya Barh Ayog. We flag the
# STATE; the per-district flood micro-zone + annual damage ₹ stays a district gap.
# ---------------------------------------------------------------------------
FLOOD_PRONE_STATES = {
    "Assam", "Bihar", "West Bengal", "Uttar Pradesh", "Odisha", "Andhra Pradesh",
    "Kerala", "Punjab", "Jammu & Kashmir", "Uttarakhand", "Himachal Pradesh",
    "Arunachal Pradesh", "Tripura", "Manipur", "Meghalaya",
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

        for dname, dist in s.get("districts", {}).items():
            n_dist += 1
            dims = dist.setdefault("dimensions", {})
            dims["geography"] = {
                "terrain": terrain,                  # state dominant type
                "on_coast": coastal,                 # coastal state (district may be inland)
                "flood_prone": flood,                # state-level flag
                "major_rivers": rivers,              # state river systems
                "crz": {
                    "applies": coastal,
                    "category": None,                # I/II/III/IV — district CZMP GAP
                    "restricts_dev": coastal,
                    "figure_gap": True,
                    "source": CRZ_SRC,
                },
                "flood_risk": {
                    "state_flood_prone": flood,
                    "flood_damage_cr": None,         # annual — state relief memo GAP
                    "area_flooded_ha": None,         # GAP
                    "figure_gap": True,
                    "source": FLOOD_SRC,
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
                "hinders_dev_note": note,
                "level": "state-proxy",              # honesty: mostly the STATE's geography
                "figure_gap": True,
                "source_tier": 2,
            }
            gaps = dist.setdefault("_gaps", [])
            for g in [
                "geography CRZ category (district CZMP map) unsourced",
                "geography annual flood damage ₹ (state relief memo) unsourced",
                "geography sewage/drainage gap % (CPCB city-level) unsourced",
                "geography per-district terrain refinement (intra-state) unsourced",
            ]:
                if g not in gaps:
                    gaps.append(g)

    with open(LEDGER, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"geography dimension attached: {n_state} states + {n_dist} districts")
    print(f"  coastal states (CRZ applies): {len(COASTAL_STATES)}")
    print(f"  flood-prone states flagged:   {len(FLOOD_PRONE_STATES)}")
    print(f"  states missing terrain class: {sorted(missing_terrain) or 'none'}")
    print("  district CRZ category / flood ₹ / sewage % left as gaps (no fabrication).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
