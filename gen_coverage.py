#!/usr/bin/env python3
"""
gen_coverage.py — the DISTRICT-level companion to gen_provenance.py.

gen_provenance.py answers "is every *figure* attributed?" (the honesty audit).
This answers a different, blunter question the user calls "built vs proven":

  The 594-district frame is BUILT everywhere. WHERE is it actually PROVEN deeply
  (real ledger + geography sub-layers + elevation + officials + located news) vs.
  where does it still ship as a gap-marked skeleton?

It reuses the EXACT scoring in coverage.js (same weights, same bands) so the page,
the map facet and this rollup can never disagree. Two artifacts fall out:

  1. coverage.json      — a small rollup the provenance page fetches to render the
                          "Built vs Proven" panel (bands, component totals, top list).
  2. coverage-gaps.csv  — one row per district: pct, band, and which components are
                          missing, so the gap list can be worked down offline.

Stdlib only. Usage:  python3 gen_coverage.py
"""
import csv
import json
import os
import re
import sys
from collections import defaultdict
from datetime import datetime, timezone

LEDGER = "district-ledger.json"
FEED = "news-feed.json"
COVERAGE_JS = "coverage.js"
OUT_JSON = "coverage.json"
OUT_CSV = "coverage-gaps.csv"


def load_json(path, default=None):
    if not os.path.exists(path):
        return default
    with open(path, encoding="utf-8") as f:
        return json.load(f)


# ── Pull the component weights straight out of coverage.js so the two can't drift.
# coverage.js is the single source of truth for the scoring; we just mirror its
# COMPONENTS table (label + max) by parsing it, then re-implement the same rules.
def load_components():
    src = open(COVERAGE_JS, encoding="utf-8").read()
    comps = []
    for m in re.finditer(r"\{\s*key:\s*'([^']+)',\s*label:\s*'([^']+)',\s*max:\s*(\d+)", src):
        comps.append({"key": m.group(1), "label": m.group(2), "max": int(m.group(3))})
    if not comps:
        print("ERROR: could not parse COMPONENTS from coverage.js", file=sys.stderr)
        sys.exit(1)
    return comps


def news_by_place(feed):
    """{ 'State|District': count } from the feed's {state,district} geo tags."""
    by = defaultdict(int)
    for it in (feed.get("news_items") or []):
        g = it.get("geo") or {}
        s, d = g.get("state"), g.get("district")
        if s and d:
            by[f"{s}|{d}"] += 1
    return by


def score_district(d, news_count, comps):
    """Faithful port of coverage.js score(): returns (points, per-component got)."""
    g = (d.get("dimensions") or {}).get("geography") or {}
    got = {}

    # Ledger depth (0-3): baseline skeleton with no rows = 0; real rows scale up.
    rows = len(d["ledger"]) if isinstance(d.get("ledger"), list) else 0
    got["ledger"] = 0 if (d.get("baseline") and not rows) else min(3, rows)

    # Geography pinned sub-layers (0-3): count DOCUMENTED deep layers.
    geo = 0
    if (g.get("paleochannel") or {}).get("documented"):
        geo += 1
    if (g.get("unsafe_zone") or {}).get("documented"):
        geo += 1
    if (g.get("monsoon_inundation") or {}).get("documented"):
        geo += 1
    if (g.get("encroachment_zone") or {}).get("documented"):
        geo += 1
    if (g.get("encroachment") or {}).get("cases"):
        geo += 1
    if (g.get("timeline") or {}).get("points"):
        geo += 1
    got["geography"] = min(3, geo)

    # Elevation (0-1): real per-district SRTM centroid present.
    elev = g.get("elevation") or {}
    got["elevation"] = 1 if isinstance(elev.get("centroid_m"), (int, float)) else 0

    # Officials roster (0-2): how many named officials.
    named = sum(1 for o in (d.get("roster") or {}).values() if o and o.get("name"))
    got["roster"] = 2 if named >= 3 else 1 if named else 0

    # Located news / events (0-2): from the feed's geo tags.
    nc = news_count
    got["news"] = 2 if nc >= 3 else 1 if nc >= 1 else 0

    points = sum(got.values())
    return points, got


def band_of(pct):
    # Same thresholds as coverage.js (deep >=60, partial >=30, else baseline).
    return "deep" if pct >= 60 else "partial" if pct >= 30 else "baseline"


def build():
    ledger = load_json(LEDGER)
    if not ledger:
        print(f"ERROR: {LEDGER} not found", file=sys.stderr)
        sys.exit(1)
    feed = load_json(FEED, {})
    comps = load_components()
    max_points = sum(c["max"] for c in comps)
    news = news_by_place(feed)

    rows = []
    bands = {"deep": 0, "partial": 0, "baseline": 0}
    comp_got = defaultdict(int)
    comp_max = defaultdict(int)
    pct_sum = 0

    for state, sd in ledger.get("states", {}).items():
        for dname, d in (sd.get("districts") or {}).items():
            nc = news.get(f"{state}|{dname}", 0)
            points, got = score_district(d, nc, comps)
            pct = round(points / max_points * 100)
            b = band_of(pct)
            bands[b] += 1
            pct_sum += pct
            for c in comps:
                comp_got[c["key"]] += got[c["key"]]
                comp_max[c["key"]] += c["max"]
            # which components are still a gap (got 0)?
            missing = [c["label"] for c in comps if got[c["key"]] == 0]
            rows.append({
                "state": state, "district": dname,
                "pct": pct, "band": b, "points": points, "max": max_points,
                "got": got, "missing": missing, "news": nc,
            })

    n = len(rows) or 1
    rows.sort(key=lambda r: (-r["pct"], r["state"], r["district"]))

    top = [{"place": f"{r['state']} · {r['district']}", "pct": r["pct"], "band": r["band"]}
           for r in rows[:15]]

    components = [{
        "key": c["key"], "label": c["label"], "max_each": c["max"],
        "got": comp_got[c["key"]], "possible": comp_max[c["key"]],
        "pct": round(100 * comp_got[c["key"]] / comp_max[c["key"]]) if comp_max[c["key"]] else 0,
    } for c in comps]

    out = {
        "_meta": {
            "purpose": "District-level 'built vs proven' rollup — the whole 594-district "
                       "frame is built; this shows where it is proven deeply vs. still a "
                       "gap-marked skeleton. Companion to provenance.json (figure-level).",
            "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "how_built": "gen_coverage.py reuses coverage.js scoring over district-ledger.json "
                         "+ news-feed.json geo tags.",
            "scoring": "Same weights/bands as coverage.js. deep>=60%, partial>=30%, else baseline.",
        },
        "totals": {
            "districts": len(rows),
            "avg_pct": round(pct_sum / n, 1),
            "bands": bands,
            "max_points": max_points,
        },
        "components": components,
        "top": top,
    }
    return out, rows, comps


def write_csv(rows, comps):
    fields = (["state", "district", "coverage_pct", "band", "points", "max_points"]
              + [f"{c['key']}_pts" for c in comps]
              + ["located_news", "missing_components"])
    with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(fields)
        for r in rows:
            w.writerow([
                r["state"], r["district"], r["pct"], r["band"], r["points"], r["max"],
                *[r["got"][c["key"]] for c in comps],
                r["news"], "; ".join(r["missing"]),
            ])


def main():
    out, rows, comps = build()
    # coverage.json is generated + fetched client-side → minified (build-opt rule).
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    write_csv(rows, comps)

    t = out["totals"]
    print(f"✓ wrote {OUT_JSON} and {OUT_CSV}")
    print(f"  districts        : {t['districts']}")
    print(f"  avg coverage     : {t['avg_pct']}%")
    print(f"  bands            : deep {t['bands']['deep']} · "
          f"partial {t['bands']['partial']} · baseline {t['bands']['baseline']}")
    print("  components pinned :")
    for c in out["components"]:
        print(f"    {c['label']:<24} {c['got']}/{c['possible']} ({c['pct']}%)")
    print("  top proven        :")
    for d in out["top"][:5]:
        print(f"    {str(d['pct'])+'%':>4}  {d['band']:<8} {d['place']}")


if __name__ == "__main__":
    main()
