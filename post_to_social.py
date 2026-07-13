#!/usr/bin/env python3
"""
post_to_social.py — auto-post story chains to X/Twitter (and optionally Meta),
run on YOUR OWN machine. A static site (GitHub Pages) cannot auto-post — there's
no server for keys or a scheduler — so this is a standalone script, like
ingest_news.py / scrape_mplads.mjs.

SECURITY: keys come from environment variables, NEVER the repo (the repo is
public). Set them in your shell or a local .env that is gitignored.

Setup required (one-time, by you):
  X / Twitter:
    - Create a developer account at developer.x.com (the posting API is a PAID
      tier as of 2025+). Create an app, generate: API key/secret + access
      token/secret (OAuth 1.0a) OR an OAuth2 bearer with write scope.
    - pip install tweepy
    - export X_API_KEY=... X_API_SECRET=... X_ACCESS_TOKEN=... X_ACCESS_SECRET=...
  Meta (Facebook Page / Instagram) — heavier:
    - Facebook Developer app + Page access token (Graph API); business
      verification + app review for publish_to_groups/pages_manage_posts.
    - Instagram requires a Business/Creator account linked to a FB Page + the
      Content Publishing API. Set META_PAGE_ID, META_PAGE_TOKEN, IG_USER_ID.

Idempotent: records posted chain ids in .social_posted.json (gitignored) so a
chain isn't posted twice. Dry-run by default — pass --post to actually send.

Usage:
  python3 post_to_social.py            # dry run: print what WOULD post
  python3 post_to_social.py --post     # actually post (needs keys)
  python3 post_to_social.py --post --platform x   # only X
"""
import argparse
import json
import os
import sys

EVENTS = "fiscal-events.json"
STATE = ".social_posted.json"
BASE = "https://sinhaankur.github.io/india-fiscal-map"


def load(path, default=None):
    if not os.path.exists(path):
        return default
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def max_sev(ev_doc, chain):
    best = None
    for eid in chain.get("event_ids", []):
        e = next((x for x in ev_doc.get("fiscal_events", []) if x["id"] == eid), None)
        s = (e or {}).get("severity")
        if s and (best is None or (s.get("score") or 0) > best["score"]):
            best = {"score": s.get("score") or 0, "band": s.get("band")}
    return best


def top_amount(ev_doc, chain):
    amt = 0
    for eid in chain.get("event_ids", []):
        e = next((x for x in ev_doc.get("fiscal_events", []) if x["id"] == eid), None)
        a = (e or {}).get("amount_cr")
        if isinstance(a, (int, float)):
            amt = max(amt, a)
    return amt or None


def compose_x(ev_doc, c):
    loc = f"{c.get('geo',{}).get('district','')}, {c.get('geo',{}).get('state','')}".strip(", ")
    sev = max_sev(ev_doc, c)
    amt = top_amount(ev_doc, c)
    url = f"{BASE}/story.html?chain={c['id']}"
    tags = "#IndiaFiscalMap #PublicMoney"
    # Prefer the hand-vetted, defensible social_line; else the neutral one_line.
    bits = [c.get("social_line") or c.get("one_line") or c.get("title")]
    line2 = []
    # Human per-capita hook leads the metric line when present.
    pc = (c.get("actual_cost") or {}).get("per_capita_inr")
    if isinstance(pc, (int, float)):
        line2.append(f"🧍 ₹{int(pc):,}/resident")
    if amt:
        line2.append(f"💰 ₹{int(amt):,} cr")
    if sev:
        line2.append(f"⚠ {sev['band'].upper()} {sev['score']}/12")
    if line2:
        bits.append("  ".join(line2))
    if loc:
        bits.append(f"📍 {loc}")
    bits.append(f"{tags}\n{url}")
    text = "\n\n".join(bits)
    return text[:279]


def post_x(text):
    try:
        import tweepy
    except ImportError:
        print("  ! tweepy not installed (pip install tweepy)"); return False
    keys = ("X_API_KEY", "X_API_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_SECRET")
    if not all(os.environ.get(k) for k in keys):
        print(f"  ! missing env keys: {[k for k in keys if not os.environ.get(k)]}"); return False
    client = tweepy.Client(
        consumer_key=os.environ["X_API_KEY"], consumer_secret=os.environ["X_API_SECRET"],
        access_token=os.environ["X_ACCESS_TOKEN"], access_token_secret=os.environ["X_ACCESS_SECRET"],
    )
    client.create_tweet(text=text)
    return True


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument("--post", action="store_true", help="actually post (default: dry run)")
    ap.add_argument("--platform", default="x", choices=["x"], help="platform (x supported; meta = manual setup)")
    args = ap.parse_args(argv[1:])

    ev = load(EVENTS, {"story_chains": [], "fiscal_events": []})
    posted = set(load(STATE, {"posted": []}).get("posted", []))

    todo = [c for c in ev.get("story_chains", []) if c["id"] not in posted]
    if not todo:
        print("nothing new to post (all chains already posted)."); return 0

    for c in todo:
        text = compose_x(ev, c)
        print(f"\n--- {c['id']} ({'POST' if args.post else 'dry-run'}) ---\n{text}")
        if args.post:
            ok = post_x(text) if args.platform == "x" else False
            if ok:
                posted.add(c["id"])
                print("  ✓ posted")
            else:
                print("  ✗ not posted (see message above)")

    if args.post:
        with open(STATE, "w", encoding="utf-8") as f:
            json.dump({"posted": sorted(posted)}, f, indent=2)
    else:
        print("\n(dry run — re-run with --post and your API keys set to actually publish)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
