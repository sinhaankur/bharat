#!/usr/bin/env python3
"""Add ownership lineage to each plant: founder + the controlling entity
(managing-agency house, colonial parent, or post-1947 PSU ministry).

Captures the colonial MANAGING-AGENCY SYSTEM that controlled ~3/4 of Indian
industry by WWI (abolished by the Indira Gandhi govt in April 1970), plus the
post-Independence shift to central public-sector control.

Idempotent: matches plants by name substring. Sourced, tier-tagged.
"""
import json, os

ROOT = os.path.dirname(os.path.abspath(__file__))
LEDGER = os.path.join(ROOT, "district-ledger.json")

# plant-name substring -> lineage dict
LINEAGE = {
    "Tata Steel Jamshedpur": {
        "founder": "Jamsetji Tata (vision) / Dorabji Tata (built)",
        "control_type": "indian_managing_agency",
        "lineage": "Tata Sons managing agency (est. 1887) → Tata Steel Ltd (public, post-agency reforms 1970)",
        "source": "https://en.wikipedia.org/wiki/Jamsetji_Tata", "source_tier": 3,
    },
    "Tata Motors Jamshedpur": {
        "founder": "J. R. D. Tata (as TELCO, 1945)",
        "control_type": "indian_managing_agency",
        "lineage": "Tata Sons agency → Tata Engineering & Locomotive Co (TELCO) → Tata Motors Ltd (2003)",
        "source": "https://en.wikipedia.org/wiki/Tata_Motors", "source_tier": 3,
    },
    "ITC Cigarette Factory": {
        "founder": "Imperial Tobacco Co. of India (1910), subsidiary of British American Tobacco",
        "control_type": "british_colonial_parent",
        "lineage": "Imperial Tobacco (British, 1910) → India Tobacco Co (1970) → ITC Ltd (1974); BAT still ~29.4%",
        "source": "https://www.itcportal.com/about-itc/profile/history-and-evolution.aspx", "source_tier": 2,
    },
    "Jamalpur Locomotive Workshop": {
        "founder": "East India Company (1862)",
        "control_type": "colonial_state",
        "lineage": "East India Company (1862) → Raj-era railways → Indian Railways (govt, post-1947)",
        "source": "https://en.wikipedia.org/wiki/Jamalpur,_Munger", "source_tier": 3,
    },
    "Munger Gun Factories": {
        "founder": "Nawab Mir Qasim of Bengal (1762)",
        "control_type": "pre_colonial_state",
        "lineage": "Nawabi arsenal (1762) → colonial ordnance → today licensed private units on BIADA land",
        "source": "https://en.wikipedia.org/wiki/Munger", "source_tier": 3,
    },
    "Cochin Shipyard": {
        "founder": "Government of India (incorporated 1972)",
        "control_type": "central_psu",
        "lineage": "GoI company (1972) under Ministry of Ports, Shipping & Waterways; listed PSU (IPO 2017)",
        "source": "https://en.wikipedia.org/wiki/Cochin_Shipyard", "source_tier": 3,
    },
    "BPCL Kochi Refinery": {
        "founder": "Cochin Refineries Ltd (Phillips Petroleum JV, 1966)",
        "control_type": "central_psu",
        "lineage": "Cochin Refineries (US JV, 1966) → nationalised → Kochi Refineries → merged into BPCL (central PSU)",
        "source": "https://en.wikipedia.org/wiki/Kochi_Refineries", "source_tier": 3,
    },
    "Cochin International Airport": {
        "founder": "V. J. Kurian IAS (promoter) / CIAL (1999)",
        "control_type": "public_private_shareholder",
        "lineage": "CIAL — first PPP airport in India; Kerala govt + NRIs/public as shareholders (1999)",
        "source": "https://en.wikipedia.org/wiki/Cochin_International_Airport", "source_tier": 3,
    },
    "Bombay Stock Exchange": {
        "founder": "Premchand Roychand (1875)",
        "control_type": "private_association",
        "lineage": "'Native Share & Stock Brokers' Association' (1875) → BSE Ltd (demutualised 2005, listed 2017)",
        "source": "https://en.wikipedia.org/wiki/Bombay_Stock_Exchange", "source_tier": 3,
    },
    "Bollywood": {
        "founder": "Dadasaheb Phalke (Indian cinema, 1913)",
        "control_type": "private",
        "lineage": "Studio era → independent producers → corporatised studios + OTT (post-2000)",
        "source": "https://en.wikipedia.org/wiki/Cinema_of_India", "source_tier": 3,
    },
    "Chennai auto cluster": {
        "founder": "Ashok Leyland (1948) anchored the cluster",
        "control_type": "private",
        "lineage": "Ashok Leyland (1948, Hinduja) → MNC entrants (Hyundai 1996, Ford, etc.) — the 'Detroit of India'",
        "source": "https://en.wikipedia.org/wiki/Economy_of_Chennai", "source_tier": 3,
    },
    "Chennai Port": {
        "founder": "British Raj (Madras Port, 1881)",
        "control_type": "colonial_state",
        "lineage": "Madras Port (Raj, 1881) → Chennai Port Authority (Union govt); OMR IT corridor is private, post-2000",
        "source": "https://en.wikipedia.org/wiki/Chennai_Port", "source_tier": 3,
    },
    "Government / administrative": {
        "founder": "Nawabs of Awadh (capital ~1775)",
        "control_type": "state",
        "lineage": "Awadh Nawabi capital (~1775) → British annexation (1856) → UP state capital (post-1947)",
        "source": "https://en.wikipedia.org/wiki/Lucknow", "source_tier": 3,
    },
    "HAL Lucknow": {
        "founder": "Hindustan Aeronautics Ltd (Accessories Div, ~1970)",
        "control_type": "central_psu",
        "lineage": "HAL (central defence PSU) Accessories Division, Lucknow (~1970); part of UP defence corridor",
        "source": "https://en.wikipedia.org/wiki/Hindustan_Aeronautics_Limited", "source_tier": 3,
    },
    "Barauni Refinery": {
        "founder": "Indian Oil Corporation (Soviet/Romanian collab, 1964)",
        "control_type": "central_psu",
        "lineage": "Built 1964 with USSR/Romania aid → Indian Oil Corporation Ltd (central PSU)",
        "source": "https://en.wikipedia.org/wiki/Barauni_Refinery", "source_tier": 3,
    },
    "Barauni Thermal": {
        "founder": "Bihar State Electricity Board (Russian collab, 1962)",
        "control_type": "central_psu",
        "lineage": "Bihar SEB (1962, Russian collab) → transferred to NTPC Ltd (central PSU) in 2018",
        "source": "https://en.wikipedia.org/wiki/Barauni_Thermal_Power_Station", "source_tier": 3,
    },
    "HURL Barauni": {
        "founder": "Hindustan Fertilizer Corp (1976) → revived by HURL (2018-22)",
        "control_type": "central_psu",
        "lineage": "HFCL plant (1976, shut 1999) → HURL JV of NTPC/IOCL/CIL/FCIL (~₹9,512 cr revival, 2022)",
        "source": "https://en.wikipedia.org/wiki/HURL_Barauni", "source_tier": 3,
    },
    "Bombay Stock Exchange / financial": {  # fallback alias
        "founder": "Premchand Roychand (1875)",
        "control_type": "private_association",
        "lineage": "Native Share & Stock Brokers' Association (1875) → BSE Ltd",
        "source": "https://en.wikipedia.org/wiki/Bombay_Stock_Exchange", "source_tier": 3,
    },
}

CONTROL_LABEL = {
    "indian_managing_agency": "Indian managing agency",
    "british_colonial_parent": "British colonial parent co.",
    "colonial_state": "Colonial state",
    "pre_colonial_state": "Pre-colonial state",
    "central_psu": "Central public-sector (PSU)",
    "public_private_shareholder": "Public-private shareholder",
    "private_association": "Private association",
    "private": "Private",
    "state": "State / govt",
}


def main():
    led = json.load(open(LEDGER, encoding="utf-8"))
    led.setdefault("_meta", {})["control_labels"] = CONTROL_LABEL
    led["_meta"]["managing_agency_note"] = (
        "Until April 1970, the colonial 'managing agency' system let a few partners "
        "control ~3/4 of Indian industry via tiny shareholdings. The Indira Gandhi "
        "govt abolished it; post-1947 heavy industry shifted to central PSUs.")
    touched = 0
    for st, sd in led["states"].items():
        for dn, o in sd.get("districts", {}).items():
            if o.get("baseline"):
                continue
            for p in o.get("plants", []):
                name = p.get("name", "")
                for key, lin in LINEAGE.items():
                    if key.lower() in name.lower():
                        p["founder"] = lin["founder"]
                        p["control_type"] = lin["control_type"]
                        p["lineage"] = lin["lineage"]
                        if not p.get("lineage_source"):
                            p["lineage_source"] = lin["source"]
                            p["lineage_source_tier"] = lin["source_tier"]
                        touched += 1
                        break
    json.dump(led, open(LEDGER, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    print(f"Added ownership lineage to {touched} plants.")


if __name__ == "__main__":
    main()
