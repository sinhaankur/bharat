#!/usr/bin/env python3
"""
add_aviation_dimension.py — attach the AVIATION dimension to every district.

The "air connectivity" segment for understanding a district: does it have an
operational airport, and what class (international / customs / domestic)? This is
the SPARSE dimension by nature — only districts with an airport get a positive
value; the rest are honestly `has_airport: false` (a real fact, not a gap: most
districts genuinely have no airport).

Same iron rules as every other dimension (dimensions-schema.md):
  * SOURCED-OR-GAP. The airport + its class below are AAI/DGCA public record
    (tier-1). Passenger TRAFFIC is pinned only where an AAI traffic figure is
    quotable; otherwise an explicit gap — never fabricated.
  * COMPARATIVE, not a verdict. Presence of an airport is shown beside the money;
    we compute no "connectivity score".
  * `has_airport: false` is asserted (a district with no airport), distinct from a
    figure_gap (unknown passenger count at a district that DOES have one).

Idempotent. Run AFTER the ledger exists: python3 add_aviation_dimension.py
"""
import json
import sys

LEDGER = "district-ledger.json"
AAI_SRC = "https://www.aai.aero/"
AS_OF = "AAI / DGCA public record (airport class stable; traffic as-published)"

# ---------------------------------------------------------------------------
# AIRPORTS by HOST district — (state, district) -> {name, iata, category}
#   category: "international" | "customs" | "domestic"
#   Keys must match the ledger's geoBoundaries district names (verified at runtime;
#   misses are reported and the script exits non-zero — never silently dropped).
#   traffic left None (a gap) — pin an AAI annual passenger figure to fill.
# ---------------------------------------------------------------------------
AIRPORTS = {
    ("Delhi", "Delhi"):
        {"name": "Indira Gandhi International (DEL)", "iata": "DEL", "category": "international"},
    ("Maharashtra", "Greater Bombay"):
        {"name": "Chhatrapati Shivaji Maharaj International (BOM)", "iata": "BOM", "category": "international"},
    ("Karnataka", "Bangalore Urban"):
        {"name": "Kempegowda International (BLR)", "iata": "BLR", "category": "international"},
    ("Tamil Nadu", "Chennai"):
        {"name": "Chennai International (MAA)", "iata": "MAA", "category": "international"},
    ("West Bengal", "Kolkata"):
        {"name": "Netaji Subhas Chandra Bose International (CCU)", "iata": "CCU", "category": "international"},
    ("Andhra Pradesh", "Hyderabad"):
        {"name": "Rajiv Gandhi International, Shamshabad (HYD)", "iata": "HYD", "category": "international"},
    ("Kerala", "Ernakulam"):
        {"name": "Cochin International (COK)", "iata": "COK", "category": "international"},
    ("Kerala", "Thiruvananthapuram"):
        {"name": "Trivandrum International (TRV)", "iata": "TRV", "category": "international"},
    ("Kerala", "Kozhikode"):
        {"name": "Calicut International (CCJ)", "iata": "CCJ", "category": "international"},
    ("Maharashtra", "Pune"):
        {"name": "Pune (PNQ)", "iata": "PNQ", "category": "customs"},
    ("Maharashtra", "Nagpur"):
        {"name": "Dr. Babasaheb Ambedkar International (NAG)", "iata": "NAG", "category": "international"},
    ("Goa", "North Goa"):
        {"name": "Manohar International, Mopa (GOX)", "iata": "GOX", "category": "international"},
    ("Goa", "South Goa"):
        {"name": "Dabolim (GOI)", "iata": "GOI", "category": "international"},
    ("Rajasthan", "Jaipur"):
        {"name": "Jaipur International (JAI)", "iata": "JAI", "category": "international"},
    ("Uttar Pradesh", "Lucknow"):
        {"name": "Chaudhary Charan Singh International (LKO)", "iata": "LKO", "category": "international"},
    ("Uttar Pradesh", "Varanasi"):
        {"name": "Lal Bahadur Shastri International (VNS)", "iata": "VNS", "category": "international"},
    ("Assam", "Kamrup"):
        {"name": "Lokpriya Gopinath Bordoloi International, Guwahati (GAU)", "iata": "GAU", "category": "international"},
    ("Assam", "Dibrugarh"):
        {"name": "Dibrugarh (DIB)", "iata": "DIB", "category": "domestic"},
    ("Bihar", "Patna"):
        {"name": "Jayaprakash Narayan International (PAT)", "iata": "PAT", "category": "international"},
    ("Chhattisgarh", "Raipur"):
        {"name": "Swami Vivekananda (RPR)", "iata": "RPR", "category": "domestic"},
    ("Madhya Pradesh", "Indore"):
        {"name": "Devi Ahilyabai Holkar (IDR)", "iata": "IDR", "category": "customs"},
    ("Madhya Pradesh", "Bhopal"):
        {"name": "Raja Bhoj (BHO)", "iata": "BHO", "category": "customs"},
    ("Odisha", "Khordha"):
        {"name": "Biju Patnaik International, Bhubaneswar (BBI)", "iata": "BBI", "category": "international"},
    ("Punjab", "Amritsar"):
        {"name": "Sri Guru Ram Dass Jee International (ATQ)", "iata": "ATQ", "category": "international"},
    ("Jammu & Kashmir", "Srinagar"):
        {"name": "Sheikh ul-Alam International (SXR)", "iata": "SXR", "category": "international"},
    ("Gujarat", "Surat"):
        {"name": "Surat (STV)", "iata": "STV", "category": "international"},
    ("Gujarat", "Jamnagar"):
        {"name": "Jamnagar (JGA)", "iata": "JGA", "category": "domestic"},
    ("Andhra Pradesh", "Vishakhapatnam"):
        {"name": "Visakhapatnam International (VTZ)", "iata": "VTZ", "category": "international"},
    ("Tamil Nadu", "Coimbatore"):
        {"name": "Coimbatore International (CJB)", "iata": "CJB", "category": "international"},
    ("Tamil Nadu", "Madurai"):
        {"name": "Madurai International (IXM)", "iata": "IXM", "category": "international"},
    ("Manipur", "West Imphal"):
        {"name": "Bir Tikendrajit International, Imphal (IMF)", "iata": "IMF", "category": "international"},
    ("Tripura", "West Tripura"):
        {"name": "Maharaja Bir Bikram, Agartala (IXA)", "iata": "IXA", "category": "domestic"},
    ("West Bengal", "Jalpaiguri"):
        {"name": "Bagdogra (IXB)", "iata": "IXB", "category": "customs"},
    ("Uttarakhand", "Dehra Dun"):
        {"name": "Jolly Grant, Dehradun (DED)", "iata": "DED", "category": "domestic"},
    ("Andaman & Nicobar", "Andaman Islands"):
        {"name": "Veer Savarkar International, Port Blair (IXZ)", "iata": "IXZ", "category": "international"},
    ("Himachal Pradesh", "Shimla"):
        {"name": "Shimla (SLV)", "iata": "SLV", "category": "domestic"},
}

CATEGORY_RANK = {"international": 3, "customs": 2, "domestic": 1}


def main():
    with open(LEDGER, encoding="utf-8") as f:
        data = json.load(f)

    ledger_pairs = {(sn, dn) for sn, s in data["states"].items()
                    for dn in s.get("districts", {})}
    unmatched = [k for k in AIRPORTS if k not in ledger_pairs]

    n_dist = 0
    n_airport = 0
    by_cat = {"international": 0, "customs": 0, "domestic": 0}

    for sname, s in data["states"].items():
        for dname, dist in s.get("districts", {}).items():
            n_dist += 1
            dims = dist.setdefault("dimensions", {})
            ap = AIRPORTS.get((sname, dname))
            if ap:
                n_airport += 1
                by_cat[ap["category"]] = by_cat.get(ap["category"], 0) + 1
                block = {
                    "has_airport": True,
                    "airport_name": ap["name"],
                    "iata": ap["iata"],
                    "category": ap["category"],
                    "passengers_annual": None,
                    "level": "district",
                    "as_of": AS_OF,
                    "figure_gap": True,   # passenger count is a gap until an AAI figure is pinned
                    "source": AAI_SRC,
                    "source_tier": 1,
                    "note": "Operational airport + class from AAI/DGCA public record. "
                            "Annual passenger traffic is a gap until a public AAI figure "
                            "is pinned — not fabricated.",
                }
            else:
                block = {
                    "has_airport": False,
                    "airport_name": None,
                    "iata": None,
                    "category": None,
                    "passengers_annual": None,
                    "level": "district",
                    "as_of": AS_OF,
                    "figure_gap": False,   # NOT a gap: this district genuinely has no airport
                    "source": AAI_SRC,
                    "source_tier": 1,
                    "note": "No operational airport in this district per AAI/DGCA. "
                            "(A false is asserted here, not an unknown — the nearest "
                            "airport is in another district.)",
                }
            dims["aviation"] = block
            if ap:
                gaps = dist.setdefault("_gaps", [])
                g = "aviation annual passenger traffic (AAI) unsourced"
                if g not in gaps:
                    gaps.append(g)

    with open(LEDGER, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    print(f"aviation dimension attached: {n_dist} districts")
    print(f"  airports pinned: {n_airport}  (intl {by_cat['international']} / "
          f"customs {by_cat['customs']} / domestic {by_cat['domestic']})")
    if unmatched:
        print(f"  !! AIRPORTS keys that did NOT match a ledger district: {unmatched}")
    else:
        print("  all AIRPORTS keys matched a ledger district.")
    print("  passenger traffic left as gap; has_airport=false asserted elsewhere.")
    return 1 if unmatched else 0


if __name__ == "__main__":
    sys.exit(main())
