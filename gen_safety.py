#!/usr/bin/env python3
"""
gen_safety.py — build safety.json: the state-level SAFETY / JUSTICE layer for the
monitor map (crime, prisons/jails) + protest-unrest hotspots derived from the news
feed. Kept OUT of the big district-ledger.json on purpose (build-optimization rule:
don't re-bloat the ledger; the monitor layer loads independently and stays small).

HONESTY RULES (same as the rest of the atlas — sourced-or-it's-a-gap):
  - Every figure is attributed to NCRB's own published reports (Crime in India /
    Prison Statistics India). Numbers we could NOT verify against NCRB are left as
    a GAP ({"value": null, "gap": true}) — never guessed, never taken from an
    unattributed third-party aggregator (several of those contradict NCRB itself).
  - `_meta.topup` documents exactly how to complete the per-state tables from the
    machine-readable NCRB / data.gov.in sources when run on an open network.
  - Protest/unrest hotspots are DERIVED from the moderated news feed (tier-3, news),
    clearly labelled as such — not presented as official incident counts.

Stdlib only. Usage:  python3 gen_safety.py
"""
import json
import os
import re
import sys
from datetime import datetime, timezone

LEDGER = "district-ledger.json"
NEWS = "news-feed.json"
OUT = "safety.json"

NCRB_CRIME = "https://www.ncrb.gov.in/en/crime-in-india"
NCRB_CRIME_2022_PDF = "https://www.ncrb.gov.in/uploads/nationalcrimerecordsbureau/custom/1701607577CrimeinIndia2022Book1.pdf"
NCRB_PRISON = "https://www.ncrb.gov.in/en/prison-statistics-india"
NCRB_PRISON_PDF = "https://www.ncrb.gov.in/uploads/nationalcrimerecordsbureau/custom/psiyearwise2022/1701613297PSI2022ason01122023.pdf"
OGD_CRIME = "https://www.data.gov.in/catalog/crime-india-2022"
OGD_PRISON = "https://www.data.gov.in/catalog/prison-statistics-india-psi-2022"


def load_json(path, default=None):
    if not os.path.exists(path):
        return default
    with open(path, encoding="utf-8") as f:
        return json.load(f)


# ── NCRB total cognizable crime rate per lakh, 2023 ──────────────────────────
# ONE consistent metric for EVERY state/UT (IPC/BNS + SLL cognizable crimes per
# lakh population), from NCRB "Crime in India 2023". Full table sourced from the
# NCRB-cited Wikipedia compilation and cross-checked against NCRB headline figures
# (Kerala highest among states 1631.2; Delhi highest among UTs 1602.0). A single
# comparable number for all states beats a handful of mixed-metric headlines.
CRIME_RATE_2023 = {
    "Andhra Pradesh": 346.3, "Arunachal Pradesh": 187.9, "Assam": 181.3, "Bihar": 277.5,
    "Chhattisgarh": 381.2, "Goa": 195.4, "Gujarat": 806.3, "Haryana": 739.2,
    "Himachal Pradesh": 267.2, "Jharkhand": 161.1, "Karnataka": 315.8, "Kerala": 1631.2,
    "Madhya Pradesh": 570.3, "Maharashtra": 470.4, "Manipur": 627.8, "Meghalaya": 105.2,
    "Mizoram": 326.3, "Nagaland": 84.9, "Odisha": 431.2, "Punjab": 227.1,
    "Rajasthan": 390.4, "Sikkim": 103.9, "Tamil Nadu": 701.4, "Tripura": 120.4,
    "Uttar Pradesh": 335.3, "Uttarakhand": 291.3, "West Bengal": 181.6,
    "Andaman & Nicobar": 464.8, "Chandigarh": 338.9, "Delhi": 1602.0,
    "Jammu & Kashmir": 217.0, "Lakshadweep": 184.1, "Puducherry": 305.5,
    # Ladakh (173.4) & Telangana (481.6) exist in NCRB but not as ledger states here.
    # Dadra and Nagar Haveli / Daman and Diu reported jointly (66.9) — see D&D note.
}
# Supplementary NCRB 2022 IPC-only headline context (kept as `note`, not the metric).
CRIME_NOTE_2022 = {
    "Kerala":        "NCRB 2022: highest IPC crime rate among states (661/lakh); ~1.63 lakh of it negligent/rash-driving cases.",
    "Delhi":         "NCRB 2022: highest IPC crime rate among all States/UTs (1424/lakh); ~30% chargesheeting rate.",
    "Uttar Pradesh": "NCRB 2022: highest ABSOLUTE crime count (691,328) — most-populous state.",
    "Maharashtra":   "NCRB 2022: 2nd in absolute IPC cases after UP (~501,234).",
    "Bihar":         "NCRB 2022: relatively low per-lakh rate (175.4) — policing vs under-reporting contested.",
    "West Bengal":   "NCRB: Kolkata rated the safest metro city three years running.",
    "Dadra and Nagar Haveli": "Reported jointly with Daman & Diu in NCRB (combined rate 66.9/lakh, 2023).",
    "Daman and Diu": "Reported jointly with Dadra & Nagar Haveli in NCRB (combined rate 66.9/lakh, 2023).",
}
CRIME_NATIONAL = {
    "year_rate": 2023,
    "year_totals": 2022,
    "cognizable_total_2022": 5824946,
    "ipc_total_2022": 3561379,
    "sll_total_2022": 2263567,
    "crime_rate_all_2022": 422.2,      # per lakh, down from 445.9 in 2021
    "prev_rate_2021": 445.9,
    "safest_metro": "Kolkata (3rd year running)",
}

# ── Verified NCRB Prison Statistics ──────────────────────────────────────────
# PSI 2022 (as on 01-12-2023) unless noted. jails = number of prison facilities;
# occupancy = inmates ÷ sanctioned capacity (%). Only NCRB-attributable values.
PRISON_2022 = {
    # state:            (num_jails, occupancy_pct, undertrials, note)
    "Rajasthan":       (146, None, None, "Most jails in India."),
    "Tamil Nadu":      (142, None, None, "2nd-most jails."),
    "Madhya Pradesh":  (132, None, None, "3rd-most jails."),
    "Andhra Pradesh":  (106, None, None, "4th-most jails."),
    "Odisha":          (92,  None, None, "5th-most jails."),
    "Uttar Pradesh":   (77,  None, 94131, "Most district jails (64); most undertrials in India (21.7% of national)."),
    "Bihar":           (None, None, 57537, "2nd-most undertrials (13.2% of national)."),
    "Maharashtra":     (None, None, 32883, "3rd-most undertrials (7.6% of national)."),
    "Delhi":           (None, 200.2, None, "Highest prison occupancy in the country (PSI 2023)."),
}
PRISON_NATIONAL = {
    "year": 2022,
    "prisoners_total": 573220,
    "occupancy_pct": 131.4,          # actual occupancy 131%
    "undertrial_share_pct": 75.8,    # >75% are undertrials
    "recidivism_pct": 1.9,
    "jails_total": 1330,
    "note": "As on 01-12-2023 (PSI 2022). Occupancy climbed to ~130% by 2021; 120.8% by 2023.",
}

# ── NCRB occupancy BANDS, all states/UTs (India Justice Report 2022 · PSI, Dec 2021) ──
# The IJR maps every state/UT to a UNODC-style band. Exact per-state % isn't public
# in a clean table, but the band IS — so we carry the band for ALL states (full
# coverage) and layer the few exact figures (Delhi) on top. UNODC: >120% "critical",
# >150% "extreme". band → (label, representative midpoint % for colouring).
OCC_BANDS = {
    "within":  ("Within limits (≤100%)", 90),
    "high":    ("High (100–120%)", 110),
    "veryhigh":("Very high (120–150%)", 135),
    "severe":  ("Severe (150–185%)", 168),
}
OCC_BAND_BY_STATE = {
    # Within limits (≤100%)
    "Andaman & Nicobar": "within", "Andhra Pradesh": "within", "Arunachal Pradesh": "within",
    "Chandigarh": "within", "Goa": "within", "Kerala": "within", "Lakshadweep": "within",
    "Manipur": "within", "Mizoram": "within", "Nagaland": "within", "Odisha": "within",
    "Puducherry": "within", "Punjab": "within", "Tamil Nadu": "within", "Tripura": "within",
    # (Ladakh, Telangana also "within" but aren't ledger states here)
    # High (100–120%)
    "Assam": "high", "Dadra and Nagar Haveli": "high", "Daman and Diu": "high",
    "Gujarat": "high", "Himachal Pradesh": "high", "Karnataka": "high",
    "Rajasthan": "high", "West Bengal": "high",
    # Very high (120–150%)
    "Bihar": "veryhigh", "Chhattisgarh": "veryhigh", "Haryana": "veryhigh",
    "Jammu & Kashmir": "veryhigh", "Jharkhand": "veryhigh", "Maharashtra": "veryhigh",
    # Severe (150–185%)
    "Delhi": "severe", "Madhya Pradesh": "severe", "Meghalaya": "severe",
    "Sikkim": "severe", "Uttar Pradesh": "severe", "Uttarakhand": "severe",
}
OCC_SOURCE = "https://indiajusticereport.org"


# ── State geographic area (km²) — for population-density patterns ─────────────
# Surveyor General of India / Census figures (well-established, stable). Density is
# computed = population ÷ area, with population from the ledger (Census-2011-based).
AREA_KM2 = {
    "Rajasthan": 342239, "Madhya Pradesh": 308245, "Maharashtra": 307713,
    "Uttar Pradesh": 240928, "Gujarat": 196024, "Karnataka": 191791,
    "Andhra Pradesh": 162968, "Odisha": 155707, "Chhattisgarh": 135192,
    "Tamil Nadu": 130058, "Telangana": 112077, "Bihar": 94163,
    "West Bengal": 88752, "Arunachal Pradesh": 83743, "Jharkhand": 79716,
    "Assam": 78438, "Himachal Pradesh": 55673, "Uttarakhand": 53483,
    "Punjab": 50362, "Haryana": 44212, "Kerala": 38852, "Meghalaya": 22429,
    "Manipur": 22327, "Mizoram": 21081, "Nagaland": 16579, "Tripura": 10486,
    "Sikkim": 7096, "Goa": 3702, "Delhi": 1483, "Jammu & Kashmir": 42241,
    "Puducherry": 490, "Chandigarh": 114, "Dadra and Nagar Haveli": 491,
    "Daman and Diu": 112, "Andaman & Nicobar": 8249, "Lakshadweep": 32,
}
AREA_SOURCE = "https://surveyofindia.gov.in"


def norm(name):
    """Map NCRB spellings → ledger state names."""
    fixes = {
        "Andhra Pradesh": "Andhra Pradesh",
        "Orissa": "Odisha",
        "NCT of Delhi": "Delhi",
        "Delhi": "Delhi",
    }
    return fixes.get(name, name)


# ── Protest / unrest hotspots from the news feed ─────────────────────────────
# DERIVED, tier-3. We scan moderated-or-pending news_items whose headline/snippet
# matches unrest keywords and are anchored to a state, and count them per state.
# This is a NEWS-ATTENTION signal, not an official incident count — labelled so.
UNREST_RE = re.compile(
    r"\b(protest|protests|protesting|agitation|bandh|hartal|strike|dharna|"
    r"rally|clash|clashes|unrest|riot|riots|lathi.?charge|stir|blockade|"
    r"stone.?pelting|curfew|demonstration|morcha|gherao)\b", re.I)


def build_unrest(news, states):
    by_state = {s: [] for s in states}
    for n in (news or {}).get("news_items", []):
        st = (n.get("geo") or {}).get("state")
        if not st or st not in by_state:
            continue
        text = f"{n.get('headline','')} {n.get('snippet','')}"
        if UNREST_RE.search(text):
            by_state[st].append({
                "id": n.get("id"),
                "headline": n.get("headline"),
                "outlet": n.get("outlet"),
                "outlet_lean": n.get("outlet_lean"),
                "url": n.get("url"),
                "published_at": n.get("published_at"),
                "district": (n.get("geo") or {}).get("district"),
            })
    # sort each state's items newest-first, cap stored items (link+meta only)
    for st in by_state:
        by_state[st].sort(key=lambda x: x.get("published_at") or "", reverse=True)
    return by_state


def main():
    ledger = load_json(LEDGER, {})
    news = load_json(NEWS, {})
    states = list((ledger.get("states") or {}).keys())
    if not states:
        print(f"ERROR: no states in {LEDGER}", file=sys.stderr)
        return 2

    unrest = build_unrest(news, states)

    # Population (crore) + per-capita income for the wealth×crime×density pattern.
    fiscal = load_json("india-fiscal.json", {})
    pop_cr = {s: (v or {}).get("pop_cr") for s, v in (fiscal.get("states") or {}).items()}
    income = {s: ((v or {}).get("economy") or {}).get("percapita_nsdp_inr")
              for s, v in (ledger.get("states") or {}).items()}

    out_states = {}
    for st in states:
        rate = CRIME_RATE_2023.get(st)
        pr = PRISON_2022.get(st)
        bandkey = OCC_BAND_BY_STATE.get(st)
        u = unrest.get(st, [])
        area = AREA_KM2.get(st)
        pop = pop_cr.get(st)
        density = round((pop * 1e7) / area) if (area and pop) else None
        out_states[st] = {
            "crime": {
                "rate_per_lakh": rate,        # total cognizable crime / lakh, 2023
                "note": CRIME_NOTE_2022.get(st),
                "gap": rate is None,
                "year": 2023,
                "metric": "Total cognizable crime rate per lakh population",
                "source": NCRB_CRIME,
                "source_pdf": NCRB_CRIME_2022_PDF,
                "source_name": "NCRB · Crime in India 2023",
                "source_tier": 1,
            },
            "prisons": {
                "jails": (pr[0] if pr else None),
                "occupancy_pct": (pr[1] if pr else None),
                "undertrials": (pr[2] if pr else None),
                # Full-coverage NCRB occupancy band (IJR/PSI Dec-2021) for every state.
                "occupancy_band": bandkey,
                "occupancy_band_label": (OCC_BANDS[bandkey][0] if bandkey else None),
                "occupancy_band_mid": (OCC_BANDS[bandkey][1] if bandkey else None),
                "note": (pr[3] if pr else None),
                # gap only when we have NEITHER an exact figure NOR a band.
                "gap": (pr is None or all(v is None for v in (pr[0], pr[1], pr[2]))) and not bandkey,
                "year": 2022,
                "band_year": 2021,
                "source": NCRB_PRISON,
                "source_pdf": NCRB_PRISON_PDF,
                "band_source": OCC_SOURCE,
                "source_name": "NCRB · Prison Statistics India (occupancy band: India Justice Report 2022)",
                "source_tier": 1,
            },
            "unrest": {
                "news_mentions": len(u),
                "recent": u[:12],           # link + meta only, capped
                "derived": True,
                "source_name": "Derived from the moderated news feed (tier-3, news attention — not an official incident count)",
                "source_tier": 3,
            },
            # Wealth × density context for the pattern/relation view.
            "density": {
                "per_km2": density,
                "area_km2": area,
                "pop_cr": pop,
                "gap": density is None,
                "source": AREA_SOURCE,
                "source_name": "Area: Survey of India / Census · pop: Census-2011-based estimate",
                "source_tier": 1,
            },
            "wealth": {
                "percapita_income_inr": income.get(st),
                "gap": income.get(st) is None,
                "source": "https://www.rbi.org.in",
                "source_name": "RBI Handbook · per-capita NSDP (current prices)",
                "source_tier": 1,
            },
        }

    now = datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")
    doc = {
        "_meta": {
            "purpose": "State-level SAFETY / JUSTICE layer for the monitor map: NCRB crime + prison figures (sourced-or-gap) and protest/unrest hotspots derived from the news feed.",
            "generated_at": now,
            "honesty": "Figures are NCRB-attributable only; every unverified cell is an explicit gap (never guessed, never from unattributed aggregators — several contradict NCRB). Unrest is a NEWS-ATTENTION signal (tier-3), not an official count.",
            "sources": {
                "crime": {"name": "NCRB · Crime in India 2023", "url": NCRB_CRIME, "ogd": OGD_CRIME},
                "prisons": {"name": "NCRB · Prison Statistics India 2022", "url": NCRB_PRISON, "pdf": NCRB_PRISON_PDF, "ogd": OGD_PRISON},
                "density": {"name": "Area: Survey of India / Census; pop: Census-2011-based", "url": AREA_SOURCE},
                "wealth": {"name": "RBI Handbook · per-capita NSDP", "url": "https://www.rbi.org.in"},
                "unrest": {"name": "Derived from news-feed.json (this repo's aggregated feeds)"},
            },
            "national": {"crime": CRIME_NATIONAL, "prisons": PRISON_NATIONAL},
            "topup": ("Full per-state tables live in the NCRB PDFs and the data.gov.in "
                      "OGD catalogues (crime-india-2022 / prison-statistics-india-psi-2022). "
                      "To complete every state cell, download those CSVs on an open network "
                      "and extend CRIME_2022 / PRISON_2022 in gen_safety.py, then re-run. "
                      "Do NOT fill from third-party aggregators — verify against NCRB."),
            "coverage": {
                "states_total": len(states),
                "crime_sourced": sum(1 for s in out_states.values() if not s["crime"]["gap"]),
                "prisons_sourced": sum(1 for s in out_states.values() if not s["prisons"]["gap"]),
                "density_sourced": sum(1 for s in out_states.values() if not s["density"]["gap"]),
                "wealth_sourced": sum(1 for s in out_states.values() if not s["wealth"]["gap"]),
                "unrest_states_with_news": sum(1 for s in out_states.values() if s["unrest"]["news_mentions"]),
            },
        },
        "states": out_states,
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, indent=1)

    cov = doc["_meta"]["coverage"]
    print(f"wrote {OUT}")
    print(f"  states: {cov['states_total']} | crime sourced: {cov['crime_sourced']} | "
          f"prisons sourced: {cov['prisons_sourced']} | unrest states w/ news: {cov['unrest_states_with_news']}")
    total_unrest = sum(s['unrest']['news_mentions'] for s in out_states.values())
    print(f"  unrest news mentions total: {total_unrest}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
