#!/usr/bin/env python3
"""
apply_curation.py — merge a curator export (from curate.html) into the
committable site data.

It does two things:
  1. Writes approved news items into approved-news.json (the ONLY news file the
     public timeline.html loads). Rejected/pending items are dropped — nothing
     unmoderated reaches the site.
  2. Writes corroborating_news links back into fiscal-events.json, so each
     fiscal_event's coverage bar reflects the approved outlets that reported it.

Aggregation-safety preserved: only link + snippet are carried; lean keeps its
lean_source; everything here was human-approved in the curator.

Idempotent. Usage:  python3 apply_curation.py curation-export.json
"""
import json
import sys
from datetime import datetime, timezone

EVENTS = "fiscal-events.json"
APPROVED = "approved-news.json"


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def main(argv):
    if len(argv) < 2:
        print("usage: python3 apply_curation.py <curation-export.json>", file=sys.stderr)
        return 2
    export = load(argv[1])
    decisions = export.get("decisions", [])
    approved = [d for d in decisions if d.get("moderation") == "approved"]
    rejected = [d for d in decisions if d.get("moderation") == "rejected"]

    # 1. build approved-news.json (link + snippet only) ---------------------
    news_items = []
    for d in approved:
        news_items.append({
            "id": d["id"],
            "headline": d.get("headline"),
            "outlet": d.get("outlet"),
            "outlet_lean": d.get("outlet_lean", "unknown"),
            "lean_source": d.get("lean_source"),
            "outlet_type": d.get("outlet_type"),
            "language": d.get("language", "en"),
            "url": d.get("url"),
            "snippet": d.get("snippet"),
            "published_at": d.get("published_at"),
            "geo": d.get("geo") or {},
            "scheme_ref": d.get("scheme_ref"),
            "fiscal_event_ids": d.get("fiscal_event_ids") or [],
            "moderation": "approved",
        })
    now = datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")
    with open(APPROVED, "w", encoding="utf-8") as f:
        json.dump({
            "_meta": {
                "purpose": "Human-approved, anchored news items — the only news the public timeline loads. Produced by apply_curation.py from a curate.html export.",
                "generated_at": now,
                "count": len(news_items),
                "safety": "Link + snippet only; attributed; lean carries lean_source; all items human-approved.",
            },
            "news_items": news_items,
        }, f, ensure_ascii=False, indent=2)

    # 2. write corroborating_news back into fiscal-events.json --------------
    ev_doc = load(EVENTS)
    by_id = {e["id"]: e for e in ev_doc.get("fiscal_events", [])}
    links_added = 0
    for n in news_items:
        for ev_id in n["fiscal_event_ids"]:
            ev = by_id.get(ev_id)
            if not ev:
                print(f"  ! news {n['id']} links unknown event {ev_id} — skipped")
                continue
            cn = ev.setdefault("corroborating_news", [])
            if n["id"] not in cn:
                cn.append(n["id"])
                links_added += 1
    with open(EVENTS, "w", encoding="utf-8") as f:
        json.dump(ev_doc, f, ensure_ascii=False, indent=2)

    print(f"curation applied")
    print(f"  approved news     : {len(news_items)} -> {APPROVED}")
    print(f"  rejected (dropped): {len(rejected)}")
    print(f"  event links added : {links_added} -> {EVENTS}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
