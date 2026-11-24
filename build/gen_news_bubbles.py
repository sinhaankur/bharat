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
NEWS_FEED = "news-feed.json"          # the FULL ingested feed (444 items), state+district geo
STATES_GEOJSON = "india-states.geojson"
DIST_DIR = "districts"
OUT = "news-bubbles.json"

# Recency half-life for weighting news (days): a 30-day-old item counts ~half a
# fresh one, so the heatmap/bubbles lean toward what's happening NOW.
import datetime
RECENCY_HALFLIFE_DAYS = 30.0


def _parse_date(date_str):
    """Parse ISO-8601 OR RFC-822 (email/RSS) dates → naive datetime, or None."""
    if not date_str:
        return None
    # RFC-822 (e.g. 'Wed, 24 Jun 2026 17:45:35 +0530') — the format most RSS feeds use.
    try:
        from email.utils import parsedate_to_datetime
        d = parsedate_to_datetime(date_str)
        return d.replace(tzinfo=None)
    except Exception:
        pass
    # ISO-8601 variants.
    try:
        return datetime.datetime.fromisoformat(date_str.replace("Z", "").split("+")[0].strip())
    except Exception:
        return None


def recency_weight(date_str):
    """1.0 for today, decaying by half every RECENCY_HALFLIFE_DAYS. Robust to junk."""
    d = _parse_date(date_str)
    if d is None:
        return 0.5
    age = max(0, (datetime.datetime.now() - d).days)
    return round(0.5 ** (age / RECENCY_HALFLIFE_DAYS), 4)


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


# State centroids from india-states.geojson (for state-level news, district=null).
_state_centroids = None


def state_centroid(state):
    global _state_centroids
    if _state_centroids is None:
        _state_centroids = {}
        g = load(STATES_GEOJSON)
        if g:
            for f in g.get("features", []):
                nm = f.get("properties", {}).get("ST_NM")
                c = feature_centroid(f["geometry"])
                if nm and c:
                    _state_centroids[nm] = c
    # tolerant match (& vs and, trailing Islands, etc.)
    if state in _state_centroids:
        return _state_centroids[state]
    for k, v in _state_centroids.items():
        if k.lower().replace(" and ", " & ") == state.lower().replace(" and ", " & "):
            return v
    return None


def blank(title=None):
    return {"events": 0, "news": 0, "news_weight": 0.0, "flagged": False,
            "top_title": title, "max_severity": 0, "top_band": "low", "latest": None}


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
        a = agg.setdefault(key, blank())
        a["events"] += len(ch.get("event_ids", []))
        if a["top_title"] is None:
            a["top_title"] = ch.get("title")
        # flag if any event in this chain is a delay/freeze/shortfall/audit stage,
        # and track the MAX severity score so bubble size = scale of problem.
        for eid in ch.get("event_ids", []):
            e = next((x for x in ev.get("fiscal_events", []) if x.get("id") == eid), None)
            if not e:
                continue
            if e.get("stage") in ("delay", "shortfall", "audit_flag", "cag_para", "investigation"):
                a["flagged"] = True
            sev = (e.get("severity") or {}).get("score") or 0
            if sev > a["max_severity"]:
                a["max_severity"] = sev
                a["top_band"] = (e.get("severity") or {}).get("band", "low")

    # Curated approved news (district-tied, high-trust) — count double weight.
    for n in approved.get("news_items", []):
        g = n.get("geo", {})
        key = (g.get("state"), g.get("district"))
        if not key[0] or not key[1]:
            continue
        a = agg.setdefault(key, blank())
        a["news"] += 1
        a["news_weight"] += 2.0 * recency_weight(n.get("published_at") or n.get("ingested_at"))

    # FULL ingested feed (444 items). Location is state (+ optional district). Items
    # with a district heat that district; state-only items heat the STATE centroid.
    feed = load(NEWS_FEED, {"news_items": []})
    for n in feed.get("news_items", []):
        g = n.get("geo") or {}
        st, dist = g.get("state"), g.get("district")
        if not st:
            continue
        key = (st, dist)   # dist may be None → a state-level bubble
        a = agg.setdefault(key, blank(n.get("headline")))
        a["news"] += 1
        w = recency_weight(n.get("published_at") or n.get("ingested_at"))
        a["news_weight"] += w
        if n.get("fiscal_event_ids"):
            a["flagged"] = True
        if a["top_title"] is None:
            a["top_title"] = n.get("headline")
        d = n.get("published_at") or n.get("ingested_at")
        if d and (a["latest"] is None or d > a["latest"]):
            a["latest"] = d
            a["top_title"] = n.get("headline")

    bubbles = []
    missing = []
    for (state, district), a in agg.items():
        level = "district" if district else "state"
        c = centroid_for(state, district) if district else state_centroid(state)
        if not c:
            missing.append(f"{district or '(state)'}, {state}")
            continue
        bubbles.append({
            "state": state, "district": district, "level": level,
            "lat": round(c[0], 4), "lon": round(c[1], 4),
            "events": a["events"], "news": a["news"],
            "weight": round(a["events"] * 1.5 + a["news_weight"], 3),   # heatmap weight
            "flagged": a["flagged"], "top_title": a["top_title"],
            "max_severity": a.get("max_severity", 0), "top_band": a.get("top_band", "low"),
            "latest": a.get("latest"),
        })

    bubbles.sort(key=lambda b: -(b.get("weight", 0)))
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump({
            "_meta": {
                "purpose": "Precomputed map bubbles + heatmap weights for places with "
                           "news/fiscal activity. District items use district centroids "
                           "(districts/*.geojson); state-only news uses the state centroid "
                           "(india-states.geojson). weight = events*1.5 + recency-decayed "
                           "news. Only places with REAL activity appear — no fabrication.",
                "count": len(bubbles),
                "sources": [NEWS_FEED, EVENTS, APPROVED],
                "recency_halflife_days": RECENCY_HALFLIFE_DAYS,
            },
            "bubbles": bubbles,
        }, f, ensure_ascii=False, indent=2)

    nd = sum(1 for b in bubbles if b["level"] == "district")
    ns = sum(1 for b in bubbles if b["level"] == "state")
    print(f"wrote {OUT}: {len(bubbles)} bubbles ({nd} district, {ns} state)")
    for b in bubbles[:15]:
        print(f"  [{b['level']:8}] {b['district'] or b['state']}: {b['events']} ev, "
              f"{b['news']} news, w={b['weight']}, flagged={b['flagged']}")
    if missing:
        print("  centroid not found (check geojson name):", missing)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
