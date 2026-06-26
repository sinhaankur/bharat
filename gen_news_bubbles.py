#!/usr/bin/env python3
"""
gen_news_bubbles.py — precompute map bubble points for districts that have
news/fiscal activity, so the map can show a 'where's the news' layer without
loading every district geojson.

Reads fiscal-events.json (story chains + events) and approved-news.json, finds
each district with activity, computes its centroid from districts/<State>.geojson,
and writes news-bubbles.json: [{state, district, lat, lon, events, news,
flagged, top_title}]. Honest: only districts that actually have events appear —
no fabricated activity. Re-run whenever events/news change.

Idempotent. Run: python3 gen_news_bubbles.py
"""
import json
import os
import glob

EVENTS = "fiscal-events.json"
APPROVED = "approved-news.json"
DIST_DIR = "districts"
OUT = "news-bubbles.json"


def load(path, default=None):
    if not os.path.exists(path):
        return default
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def ring_centroid(coords):
    """Polygon centroid (area-weighted) from an exterior ring [[lon,lat],...]."""
    a = cx = cy = 0.0
    n = len(coords)
    for i in range(n - 1):
        x0, y0 = coords[i][0], coords[i][1]
        x1, y1 = coords[i + 1][0], coords[i + 1][1]
        cross = x0 * y1 - x1 * y0
        a += cross
        cx += (x0 + x1) * cross
        cy += (y0 + y1) * cross
    if a == 0:
        # degenerate — fall back to mean of points
        xs = [p[0] for p in coords]; ys = [p[1] for p in coords]
        return sum(xs) / len(xs), sum(ys) / len(ys)
    a *= 0.5
    return cx / (6 * a), cy / (6 * a)


def feature_centroid(geom):
    t = geom["type"]
    if t == "Polygon":
        lon, lat = ring_centroid(geom["coordinates"][0])
        return lat, lon
    if t == "MultiPolygon":
        # use the largest ring by point count
        best = max(geom["coordinates"], key=lambda poly: len(poly[0]))
        lon, lat = ring_centroid(best[0])
        return lat, lon
    return None


# cache one state's geojson centroids on first use
_state_cache = {}


def centroid_for(state, district):
    if state not in _state_cache:
        # geojson filenames use underscores for spaces
        fname = os.path.join(DIST_DIR, state.replace(" ", "_").replace("&", "and") + ".geojson")
        idx = {}
        g = load(fname)
        if g:
            for f in g.get("features", []):
                dn = f.get("properties", {}).get("DISTRICT")
                c = feature_centroid(f["geometry"])
                if dn and c:
                    idx[dn] = c
        _state_cache[state] = idx
    return _state_cache[state].get(district)


def main():
    ev = load(EVENTS, {"story_chains": [], "fiscal_events": []})
    approved = load(APPROVED, {"news_items": []})

    # tally activity per (state, district)
    agg = {}
    for ch in ev.get("story_chains", []):
        g = ch.get("geo", {})
        key = (g.get("state"), g.get("district"))
        if not key[0] or not key[1]:
            continue
        a = agg.setdefault(key, {"events": 0, "news": 0, "flagged": False, "top_title": None})
        a["events"] += len(ch.get("event_ids", []))
        if a["top_title"] is None:
            a["top_title"] = ch.get("title")
        # flag if any event in this chain is a delay/freeze/shortfall/audit stage
        for eid in ch.get("event_ids", []):
            e = next((x for x in ev.get("fiscal_events", []) if x.get("id") == eid), None)
            if e and e.get("stage") in ("delay", "shortfall", "audit_flag", "cag_para", "investigation"):
                a["flagged"] = True

    for n in approved.get("news_items", []):
        g = n.get("geo", {})
        key = (g.get("state"), g.get("district"))
        if not key[0] or not key[1]:
            continue
        a = agg.setdefault(key, {"events": 0, "news": 0, "flagged": False, "top_title": None})
        a["news"] += 1

    bubbles = []
    missing = []
    for (state, district), a in agg.items():
        c = centroid_for(state, district)
        if not c:
            missing.append(f"{district}, {state}")
            continue
        bubbles.append({
            "state": state, "district": district,
            "lat": round(c[0], 4), "lon": round(c[1], 4),
            "events": a["events"], "news": a["news"],
            "flagged": a["flagged"], "top_title": a["top_title"],
        })

    bubbles.sort(key=lambda b: -(b["events"] + b["news"]))
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump({
            "_meta": {
                "purpose": "Precomputed map bubbles for districts with news/fiscal activity. Centroids from districts/*.geojson. Only districts with real events/news appear.",
                "count": len(bubbles),
            },
            "bubbles": bubbles,
        }, f, ensure_ascii=False, indent=2)

    print(f"wrote {OUT}: {len(bubbles)} bubbles")
    for b in bubbles:
        print(f"  {b['district']}, {b['state']}: {b['events']} ev, {b['news']} news, "
              f"flagged={b['flagged']} @ ({b['lat']},{b['lon']})")
    if missing:
        print("  centroid not found (check geojson name):", missing)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
