#!/usr/bin/env python3
"""Add structured `founded` year + `era` to each plant in the deep districts, so
the drill-down can render an industrial-heritage timeline ('how this district
industrialised'). Idempotent: matches plants by name substring.

Eras (Indian industrial history):
  pre_colonial   pre-1757 (before EIC dominance)
  colonial       1757-1947 (EIC / colonial managing agencies / Raj)
  nehruvian_psu  1947-1991 (public-sector / planned-economy build-out)
  liberalisation 1991-     (post-reform private & PSU expansion)
"""
import json, os

ROOT = os.path.dirname(os.path.abspath(__file__))
LEDGER = os.path.join(ROOT, "district-ledger.json")


def era_for(year):
    if year is None:
        return None
    if year < 1757:
        return "pre_colonial"
    if year < 1947:
        return "colonial"
    if year < 1991:
        return "nehruvian_psu"
    return "liberalisation"


# plant-name substring -> (founded_year, era_note source-tier 3 unless noted)
HERITAGE = {
    # Jamshedpur
    "Tata Steel Jamshedpur": (1907, "Asia's first integrated steel plant; founded by Jamsetji Tata's vision, built by Dorabji Tata."),
    "Tata Motors Jamshedpur": (1945, "Founded as TELCO (Tata Engineering & Locomotive Co); CV manufacturing from 1954 via Daimler JV."),
    # Begusarai
    "Barauni Refinery": (1964, "Built with Soviet/Romanian collaboration; dedicated to the nation 1965."),
    "Barauni Thermal": (1962, "Russian collaboration; transferred from Bihar state to NTPC in 2018."),
    "HURL Barauni": (1976, "Original HFCL plant 1976; shut 1999; revived by HURL (~₹9,512 cr), urea restarted 2022."),
    # Munger
    "ITC Cigarette Factory": (1907, "Asia's first cigarette production; ITC's (then Imperial Tobacco) oldest unit."),
    "Jamalpur Locomotive Workshop": (1862, "Founded 8 Feb 1862 by the East India Company; Asia's oldest railway workshop."),
    "Munger Gun Factories": (1762, "Arms-making since 1762 (Mir Qasim era); among India's oldest surviving arms units."),
    # Ernakulam / Kochi
    "Cochin Shipyard": (1972, "Incorporated 29 Apr 1972 as a GoI company; first phase 1982; built INS Vikrant."),
    "BPCL Kochi Refinery": (1966, "Inaugurated 23 Sep 1966 (as Cochin Refineries, Phillips Petroleum JV); now BPCL."),
    "Cochin International Airport": (1999, "First Indian airport on a public-private-shareholder model; world's first fully solar-powered airport."),
    # Mumbai
    "Bombay Stock Exchange": (1875, "Founded 9 Jul 1875 by Premchand Roychand as 'The Native Share & Stock Brokers' Association' — Asia's oldest stock exchange."),
    "Bollywood": (1913, "Indian cinema dates to Dadasaheb Phalke's Raja Harishchandra (1913); Bombay became its hub."),
    # Chennai
    "Chennai auto cluster": (1948, "Anchored by Ashok Leyland (1948) & later Hyundai (1996); the 'Detroit of India' belt."),
    "Chennai Port": (1881, "Chennai (Madras) Port commissioned 1881 under the Raj; the OMR IT corridor is post-2000."),
    # Lucknow
    "Government / administrative": (1775, "Lucknow became the Awadh Nawabi capital ~1775; UP state capital post-1947."),
    "HAL Lucknow": (1970, "HAL Accessories Division Lucknow established ~1970; part of the UP defence corridor today."),
}


def main():
    led = json.load(open(LEDGER, encoding="utf-8"))
    touched = 0
    for st, sd in led["states"].items():
        for dn, o in sd.get("districts", {}).items():
            if o.get("baseline"):
                continue
            for p in o.get("plants", []):
                name = p.get("name", "")
                for key, (yr, note) in HERITAGE.items():
                    if key.lower() in name.lower():
                        p["founded"] = yr
                        p["era"] = era_for(yr)
                        if not p.get("heritage_note"):
                            p["heritage_note"] = note
                        touched += 1
                        break
    json.dump(led, open(LEDGER, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    print(f"Added founded+era to {touched} plants.")


if __name__ == "__main__":
    main()
