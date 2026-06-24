#!/usr/bin/env python3
"""
ingest_news.py — fetch news feeds and turn them into anchored `news_item`s for
the fiscal-news layer. See news-timeline-schema.md.

Honest design notes:
  - Stdlib only (urllib + xml.etree) — no new dependencies.
  - LINK + SHORT SNIPPET only. Never stores full article text (aggregation-safety
    rule #1). Snippet = the feed's own <description>, truncated.
  - Idempotent: dedup by URL. Re-running merges, never duplicates.
  - Auto-suggests a scheme/district anchor from district-ledger.json's
    _meta.scheme_registry + the state/district names, marked
    anchor_confidence='auto_suggested' for a human to confirm later.
  - moderation defaults to 'pending' — nothing is shown on the site until a human
    approves (aggregation-safety: facts vs allegations, defamation surface).

Runs standalone on a machine with open network (the agent sandbox blocks browser
net; urllib may also be blocked here — this is meant to run on the user's box,
like scrape_mplads.mjs). Usage:  python3 ingest_news.py
"""
import json
import os
import re
import sys
import html
import urllib.request
from datetime import datetime, timezone
from xml.etree import ElementTree as ET

FEEDS = "feeds.json"
LEDGER = "district-ledger.json"
OUT = "news-feed.json"
SNIPPET_WORDS = 40
USER_AGENT = "india-fiscal-map news aggregator (+https://github.com/sinhaankur/india-fiscal-map)"


def load_json(path, default=None):
    if not os.path.exists(path):
        return default
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def build_anchor_vocab(ledger):
    """Return (scheme_terms, district_terms, state_terms) for naive matching."""
    meta = (ledger or {}).get("_meta", {})
    reg = meta.get("scheme_registry", {})
    aliases = meta.get("scheme_aliases", {})
    schemes = {}
    for key, entry in reg.items():
        if key.startswith("_"):
            continue
        schemes[key.lower()] = key
        fl = (entry.get("flagship") or "").lower()
        if fl:
            schemes[fl] = key
    for alias, target in aliases.items():
        schemes[alias.lower()] = target
    districts, states = {}, {}
    for sname, s in (ledger or {}).get("states", {}).items():
        states[sname.lower()] = sname
        for dname in s.get("districts", {}):
            districts[dname.lower()] = (sname, dname)
    return schemes, districts, states


def suggest_anchor(text, schemes, districts, states):
    t = text.lower()
    scheme_ref = next((v for k, v in schemes.items() if k and k in t), None)
    geo = {"state": None, "district": None}
    for k, (sname, dname) in districts.items():
        if k and re.search(r"\b" + re.escape(k) + r"\b", t):
            geo = {"state": sname, "district": dname}
            break
    if not geo["state"]:
        for k, sname in states.items():
            if k and re.search(r"\b" + re.escape(k) + r"\b", t):
                geo["state"] = sname
                break
    return scheme_ref, geo


def snippet_from(desc):
    if not desc:
        return ""
    txt = re.sub(r"<[^>]+>", "", html.unescape(desc)).strip()
    words = txt.split()
    return " ".join(words[:SNIPPET_WORDS]) + ("…" if len(words) > SNIPPET_WORDS else "")


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read()


def parse_rss(raw):
    """Yield (title, link, description, pubdate) from RSS or Atom."""
    root = ET.fromstring(raw)
    # RSS 2.0
    for item in root.iter("item"):
        yield (
            (item.findtext("title") or "").strip(),
            (item.findtext("link") or "").strip(),
            item.findtext("description") or "",
            (item.findtext("pubDate") or "").strip(),
        )
    # Atom
    ns = "{http://www.w3.org/2005/Atom}"
    for entry in root.iter(ns + "entry"):
        link_el = entry.find(ns + "link")
        link = link_el.get("href") if link_el is not None else ""
        yield (
            (entry.findtext(ns + "title") or "").strip(),
            (link or "").strip(),
            entry.findtext(ns + "summary") or "",
            (entry.findtext(ns + "updated") or "").strip(),
        )


def mk_id(feed_id, link):
    slug = re.sub(r"[^a-z0-9]+", "_", link.lower())[-40:].strip("_")
    return f"ni_{feed_id}_{slug}"


def main():
    feeds_doc = load_json(FEEDS)
    if not feeds_doc:
        print(f"ERROR: {FEEDS} missing.", file=sys.stderr)
        return 2
    ledger = load_json(LEDGER, {})
    schemes, districts, states = build_anchor_vocab(ledger)

    existing = load_json(OUT, {"_meta": {}, "news_items": []})
    by_url = {n.get("url"): n for n in existing.get("news_items", []) if n.get("url")}

    now = datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")
    added, skipped, failed = 0, 0, 0

    for feed in feeds_doc.get("feeds", []):
        try:
            raw = fetch(feed["url"])
        except Exception as e:  # network blocked / feed down — report, continue
            failed += 1
            print(f"  ! {feed['id']}: fetch failed ({e})")
            continue
        try:
            items = list(parse_rss(raw))
        except Exception as e:
            failed += 1
            print(f"  ! {feed['id']}: parse failed ({e})")
            continue

        for title, link, desc, pub in items:
            if not link or link in by_url:
                skipped += 1
                continue
            scheme_ref, geo = suggest_anchor(f"{title} {desc}", schemes, districts, states)
            anchored = bool(scheme_ref or geo.get("district") or geo.get("state"))
            item = {
                "id": mk_id(feed["id"], link),
                "headline": title,
                "outlet": feed.get("outlet"),
                "outlet_lean": feed.get("outlet_lean", "unknown"),
                "lean_source": feed.get("lean_source"),
                "outlet_type": feed.get("outlet_type"),
                "language": feed.get("language", "en"),
                "url": link,
                "snippet": snippet_from(desc),
                "published_at": pub or None,
                "ingested_at": now,
                "ingest_source": f"rss:{feed['id']}",
                "geo": geo,
                "scheme_ref": scheme_ref,
                "official_ref": None,
                "fiscal_event_ids": [],
                "anchor_confidence": "auto_suggested" if anchored else "unanchored",
                "paywalled": False,
                "moderation": "pending",
            }
            by_url[link] = item
            added += 1

    out = {
        "_meta": {
            "purpose": "Aggregated news_items (link + snippet only). moderation=pending until a human approves; auto anchors must be confirmed. See news-timeline-schema.md.",
            "generated_at": now,
            "count": len(by_url),
            "safety": "Link-don't-republish; always attributed; lean is third-party aggregation (lean_source); nothing shown until moderation=approved.",
        },
        "news_items": sorted(by_url.values(), key=lambda n: n.get("published_at") or "", reverse=True),
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print(f"ingest complete → {OUT}")
    print(f"  added: {added} | skipped(existing/no-link): {skipped} | feeds failed: {failed}")
    print(f"  total stored: {len(by_url)}")
    print("  NOTE: all moderation=pending; auto anchors need human confirmation before display.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
