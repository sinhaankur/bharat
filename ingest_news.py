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
SCRIPT_ALIASES = "script-aliases.json"
OUT = "news-feed.json"
SNIPPET_WORDS = 40
# Some government feeds (PIB) 403 a bare bot UA, so present as a normal browser while
# still declaring the project in a comment-style suffix for auditability/politeness.
USER_AGENT = ("Mozilla/5.0 (compatible; india-fiscal-map news aggregator/1.0; "
              "+https://github.com/sinhaankur/india-fiscal-map)")


def load_json(path, default=None):
    if not os.path.exists(path):
        return default
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def build_anchor_vocab(ledger, script_aliases=None):
    """Return (scheme_terms, district_terms, state_terms, script_terms).

    The first three are Latin/lowercase terms matched with word boundaries.
    script_terms holds Indian-script aliases (Bengali/Hindi/Tamil/…) matched by
    plain substring — .lower() is a no-op and \\b doesn't apply to those scripts.
    """
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

    # Indian-script aliases: substring-matched, kept separate from Latin terms.
    script_terms = {"schemes": {}, "states": {}, "districts": {}}
    sa = script_aliases or {}
    for term, target in (sa.get("schemes") or {}).items():
        script_terms["schemes"][term] = target
    for term, target in (sa.get("states") or {}).items():
        script_terms["states"][term] = target
    for term, pair in (sa.get("districts") or {}).items():
        # stored as [state, district] in JSON
        script_terms["districts"][term] = (pair[0], pair[1])
    return schemes, districts, states, script_terms


def suggest_anchor(text, schemes, districts, states, script_terms=None):
    t = text.lower()
    raw = text  # original case/script for Indian-script substring matching
    geo = {"state": None, "district": None}

    # --- Latin scheme match (lowercased) ---
    scheme_ref = next((v for k, v in schemes.items() if k and k in t), None)

    # --- Indian-script scheme match (substring on original text) ---
    if not scheme_ref and script_terms:
        scheme_ref = next((v for term, v in script_terms["schemes"].items() if term and term in raw), None)

    # --- Latin district / state (word-boundary) ---
    for k, (sname, dname) in districts.items():
        if k and re.search(r"\b" + re.escape(k) + r"\b", t):
            geo = {"state": sname, "district": dname}
            break
    if not geo["state"]:
        for k, sname in states.items():
            if k and re.search(r"\b" + re.escape(k) + r"\b", t):
                geo["state"] = sname
                break

    # --- Indian-script district / state (substring) ---
    if script_terms and not geo["district"]:
        for term, (sname, dname) in script_terms["districts"].items():
            if term and term in raw:
                geo = {"state": sname, "district": dname}
                break
    if script_terms and not geo["state"]:
        for term, sname in script_terms["states"].items():
            if term and term in raw:
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


def _clean_xml_bytes(raw):
    """Some real-world feeds have a BOM or stray whitespace/newlines before the
    `<?xml …?>` declaration (e.g. DD News ships a leading CRLF), which strict
    ElementTree rejects. Trim to the first '<' so the declaration/root is at the
    start of the entity. Returns bytes."""
    if isinstance(raw, bytes):
        raw = raw.lstrip(b"\xef\xbb\xbf").lstrip()  # strip UTF-8 BOM + whitespace
        i = raw.find(b"<")
        return raw[i:] if i > 0 else raw
    raw = raw.lstrip("﻿").lstrip()
    i = raw.find("<")
    return raw[i:] if i > 0 else raw


def parse_rss(raw):
    """Yield (title, link, description, pubdate) from RSS or Atom.

    Tolerant of leading BOM/whitespace. If strict XML parsing fails (a few feeds
    ship malformed markup), fall back to a permissive item-level regex extractor
    so one bad feed doesn't drop the whole run."""
    raw = _clean_xml_bytes(raw)
    try:
        root = ET.fromstring(raw)
    except ET.ParseError:
        yield from _parse_rss_lenient(raw)
        return
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


def _field(block, *tags):
    """First matching tag's inner text from an item/entry block (any of *tags)."""
    for tag in tags:
        m = re.search(rf"<{tag}[^>]*>(.*?)</{tag}>", block, re.S | re.I)
        if m:
            txt = m.group(1)
            cd = re.search(r"<!\[CDATA\[(.*?)\]\]>", txt, re.S)
            return (cd.group(1) if cd else txt).strip()
    return ""


def _parse_rss_lenient(raw):
    """Permissive fallback for feeds whose XML is malformed enough to break
    ElementTree (unescaped ampersands, a stray tag, etc.). We only ever pull
    title/link/description/date, so a regex over each <item>…</item> block is
    safe and can't execute anything. Best-effort — skips items with no link."""
    text = raw.decode("utf-8", "replace") if isinstance(raw, bytes) else raw
    blocks = re.findall(r"<item[^>]*>(.*?)</item>", text, re.S | re.I) \
        or re.findall(r"<entry[^>]*>(.*?)</entry>", text, re.S | re.I)
    for block in blocks:
        link = _field(block, "link", "guid")
        if not link:
            m = re.search(r'<link[^>]*href="([^"]+)"', block, re.I)  # Atom-style
            link = m.group(1).strip() if m else ""
        yield (
            _field(block, "title"),
            link,
            _field(block, "description", "summary", "content:encoded"),
            _field(block, "pubDate", "updated", "published"),
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
    script_aliases = load_json(SCRIPT_ALIASES, {})
    schemes, districts, states, script_terms = build_anchor_vocab(ledger, script_aliases)

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
            scheme_ref, geo = suggest_anchor(f"{title} {desc}", schemes, districts, states, script_terms)
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
