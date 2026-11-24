#!/usr/bin/env python3
"""
gen_global_indicators.py — fetch country-level economic indicators from the World
Bank open API (no key needed, openly licensed CC-BY-4.0) and write
global-indicators.json. The data layer for the India-vs-world comparison + the
future standalone global atlas.

Indicators (all World Bank, latest available year per country):
  GDP (current US$), GNI per capita (Atlas, US$), population,
  industry/agriculture/services as % of GDP.

Sourced or it's a gap: a country with no value for an indicator stays null.
World Bank is tier-1 open data; every figure is attributable to wbdata + year.

Runs on a machine with network (the agent sandbox allows curl/urllib here).
Idempotent. Usage: python3 gen_global_indicators.py
"""
import json
import sys
import urllib.request

OUT = "global-indicators.json"
WB = "https://api.worldbank.org/v2"
UA = "india-fiscal-map global-indicators (+https://github.com/sinhaankur/india-fiscal-map)"

INDICATORS = {
    "gdp_usd":        "NY.GDP.MKTP.CD",
    "gni_per_capita": "NY.GNP.PCAP.CD",
    "population":     "SP.POP.TOTL",
    "industry_pct":   "NV.IND.TOTL.ZS",
    "agri_pct":       "NV.AGR.TOTL.ZS",
    "services_pct":   "NV.SRV.TOTL.ZS",
}


def fetch_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.loads(r.read())


def latest_by_country(indicator_code):
    """Most recent non-null value per country for one indicator (last ~8 yrs)."""
    out = {}
    page = 1
    while True:
        url = (f"{WB}/country/all/indicator/{indicator_code}"
               f"?format=json&per_page=2000&date=2016:2024&page={page}")
        data = fetch_json(url)
        if not isinstance(data, list) or len(data) < 2 or not data[1]:
            break
        meta, rows = data[0], data[1]
        for r in rows:
            iso = r.get("countryiso3code")
            val = r.get("value")
            if not iso or val is None:
                continue
            yr = int(r["date"])
            # keep the most recent year seen
            if iso not in out or yr > out[iso]["year"]:
                out[iso] = {"value": val, "year": yr, "country": r["country"]["value"]}
        if page >= meta.get("pages", 1):
            break
        page += 1
    return out


def main():
    print("fetching World Bank indicators (latest per country)…")
    by_ind = {}
    for name, code in INDICATORS.items():
        try:
            by_ind[name] = latest_by_country(code)
            print(f"  {name:16} {code:16} → {len(by_ind[name])} countries")
        except Exception as e:
            print(f"  ! {name} ({code}) failed: {e}", file=sys.stderr)
            by_ind[name] = {}

    # merge into per-country records (skip WB aggregate rows like 'World','High income')
    AGG_PREFIXES = ("WLD", "HIC", "LIC", "LMC", "MIC", "UMC", "EAS", "ECS", "LCN",
                    "MEA", "NAC", "SAS", "SSF", "EUU", "OED", "ARB", "CEB", "EAP",
                    "ECA", "EMU", "FCS", "HPC", "IBD", "IBT", "IDA", "IDB", "IDX",
                    "LDC", "LMY", "LTE", "MNA", "PRE", "PST", "SSA", "SST", "TEA",
                    "TEC", "TLA", "TMN", "TSA", "TSS", "INX", "OSS", "PSS")
    countries = {}
    for name, table in by_ind.items():
        for iso, rec in table.items():
            if iso in AGG_PREFIXES:
                continue
            c = countries.setdefault(iso, {"iso3": iso, "name": rec["country"]})
            c[name] = round(rec["value"], 2) if isinstance(rec["value"], float) else rec["value"]
            c[name + "_year"] = rec["year"]

    rows = sorted(countries.values(), key=lambda c: -(c.get("gdp_usd") or 0))
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump({
            "_meta": {
                "purpose": "Country-level economic indicators for the India-vs-world comparison + global atlas.",
                "source": "World Bank Open Data (api.worldbank.org), CC-BY-4.0",
                "indicators": INDICATORS,
                "note": "Latest available year per country (2016–2024 window). Null = no value (gap), never estimated.",
                "count": len(rows),
            },
            "countries": rows,
        }, f, ensure_ascii=False, indent=2)

    ind = next((c for c in rows if c["iso3"] == "IND"), None)
    print(f"\nwrote {OUT}: {len(rows)} countries")
    if ind:
        print(f"  India: GDP ${ (ind.get('gdp_usd') or 0)/1e12:.2f}T · GNI/capita ${ind.get('gni_per_capita')} · "
              f"industry {ind.get('industry_pct')}% · services {ind.get('services_pct')}%")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
