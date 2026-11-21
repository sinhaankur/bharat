#!/usr/bin/env python3
"""
gen_fiscal_events.py — grow the News Journey from the anchored news.

Reads the scheme-anchored items in news-feed.json and clusters them into
`story_chain`s (sanction → … → outcome) in fiscal-events.json, so the News
Journey (news-journey.html) grows on its own. Runs on a cron (see
.github/workflows/gen-fiscal-events.yml), stdlib only, idempotent.

HONESTY (same discipline as the ledger — see fiscal-events.json _meta.rules):
  * Generated events are confidence="reported", source_tier=4 (news only). Only a
    government document earns "documented" — this bot NEVER claims that.
  * amount_cr stays null unless a figure is literally in the text (figure_gap=true).
  * Every generated record is marked generated=true + carries the outlet + link.
  * The hand-authored CURATED chains/events are PRESERVED — merged by id, never
    clobbered. Curated wins on any id collision.
  * No event is fabricated: each maps to a real, dated, outlet-attributed news item.

Run:  python3 gen_fiscal_events.py
"""

import json, os, re, sys, datetime, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
NEWS = os.path.join(HERE, "news-feed.json")
EVENTS = os.path.join(HERE, "fiscal-events.json")
LEDGER = os.path.join(HERE, "district-ledger.json")

STAGE_ORDER = ["sanction", "release", "delay", "implementation", "shortfall",
               "audit_flag", "cag_para", "investigation", "action", "outcome"]

# Headline/snippet keyword → lifecycle stage. Conservative: order matters (first
# match wins), and an item with NO stage keyword is skipped (we don't guess).
STAGE_KEYWORDS = [
    ("cag_para",       [r"\bcag\b", r"comptroller", r"\bpac\b", r"public accounts committee"]),
    ("audit_flag",     [r"\baudit", r"auditor", r"flagged", r"irregularit", r"discrepanc"]),
    ("investigation",  [r"\bfir\b", r"\bprobe", r"\bcbi\b", r"\bed \b", r"enforcement directorate",
                        r"vigilance", r"\bacb\b", r"raid", r"arrest", r"charge ?sheet", r"\bscam\b", r"embezzl"]),
    ("action",         [r"recover(y|ed)", r"suspend", r"terminat", r"prosecut", r"blacklist",
                        r"refund", r"penalt", r"disciplinary", r"show ?cause"]),
    ("outcome",        [r"complet(ed|ion)", r"inaugurat", r"resolved", r"handed over",
                        r"delivered", r"commission(ed|ing)", r"restored", r"resum(e|ed|ption)"]),
    ("shortfall",      [r"unspent", r"laps(e|ed)", r"under ?utilis", r"under ?utiliz",
                        r"surrender(ed)? funds", r"shortfall", r"pending dues", r"not spent", r"idle funds"]),
    ("delay",          [r"delay", r"stall", r"frozen|freeze|froze", r"withheld", r"halt",
                        r"on hold", r"stuck", r"blocked", r"non-?release", r"not released"]),
    ("release",        [r"releas(e|ed)", r"disburs", r"sanction amount of", r"transferr?ed",
                        r"\bcredited\b", r"first instal", r"funds? (of|worth)"]),
    ("sanction",       [r"sanction", r"approv(e|ed|al)", r"allocat", r"\bnod\b", r"cleared",
                        r"earmark", r"green ?light", r"budget(ed)? for"]),
    ("implementation", [r"underway", r"ongoing", r"progress", r"work (begins|started|began)",
                        r"construction", r"laying", r"tender", r"foundation stone"]),
]
_STAGE_RE = [(st, [re.compile(p, re.I) for p in pats]) for st, pats in STAGE_KEYWORDS]

# ₹ figure in the text? only then do we record an amount (else figure_gap).
_AMT_RE = re.compile(r"(?:₹|rs\.?|inr)\s?([\d,]+(?:\.\d+)?)\s?(cr|crore|lakh|lakhs)", re.I)


def classify_stage(text):
    for st, regs in _STAGE_RE:
        if any(r.search(text) for r in regs):
            return st
    return None


def extract_amount_cr(text):
    """Return amount in ₹ crore ONLY if explicitly stated, else None."""
    m = _AMT_RE.search(text or "")
    if not m:
        return None
    try:
        val = float(m.group(1).replace(",", ""))
    except ValueError:
        return None
    unit = m.group(2).lower()
    if unit.startswith("lakh"):
        val = val / 100.0   # 100 lakh = 1 crore
    return round(val, 2)


def load_json(path, default=None):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def parse_date(iso):
    if not iso:
        return None
    # news published_at may be RFC822 or ISO; keep just the date part robustly
    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.datetime.strptime(iso[:19], fmt).date().isoformat()
        except ValueError:
            pass
    # RFC822 (e.g. "Wed, 04 Nov 2026 23:05:31 +0530")
    try:
        from email.utils import parsedate_to_datetime
        return parsedate_to_datetime(iso).date().isoformat()
    except Exception:
        return None


def sid(*parts):
    return hashlib.sha1("|".join(str(p) for p in parts).encode("utf-8")).hexdigest()[:10]


def main():
    news = load_json(NEWS, {}) or {}
    items = news.get("news_items") or news.get("items") or []
    doc = load_json(EVENTS, {}) or {}
    meta = doc.get("_meta", {})
    curated_chains = {c["id"]: c for c in doc.get("story_chains", [])}
    curated_events = {e["id"]: e for e in doc.get("fiscal_events", [])}
    # which chains/events are curated (never overwrite these)
    curated_chain_ids = {cid for cid, c in curated_chains.items() if not c.get("generated")}
    curated_event_ids = {eid for eid, e in curated_events.items() if not e.get("generated")}

    # --- cluster scheme-anchored, moderation-approved items by (scheme_ref, state) ---
    clusters = {}   # key -> list of (date, item)
    for it in items:
        scheme = it.get("scheme_ref")
        if not scheme:
            continue
        if it.get("moderation") == "rejected":
            continue
        text = f"{it.get('headline','')} {it.get('snippet','')}"
        stage = classify_stage(text)
        if not stage:
            continue                       # no fund-lifecycle signal → skip (don't guess)
        date = parse_date(it.get("published_at"))
        if not date:
            continue
        geo = it.get("geo") or {}
        state = geo.get("state")
        key = (scheme, state or "")
        clusters.setdefault(key, []).append((date, stage, it))

    gen_chains, gen_events = {}, {}
    for (scheme, state), rows in clusters.items():
        # dedup by url; order by date
        seen_urls, uniq = set(), []
        for date, stage, it in sorted(rows, key=lambda r: r[0]):
            u = it.get("url") or it.get("id")
            if u in seen_urls:
                continue
            seen_urls.add(u)
            uniq.append((date, stage, it))
        if not uniq:
            continue
        chain_id = "sc_gen_" + sid(scheme, state)
        if chain_id in curated_chain_ids:
            continue                       # a curated chain already owns this story
        event_ids = []
        for seq, (date, stage, it) in enumerate(uniq, 1):
            eid = "fe_gen_" + sid(it.get("url") or it.get("id"))
            if eid in curated_event_ids:
                event_ids.append(eid); continue
            text = f"{it.get('headline','')} {it.get('snippet','')}"
            amt = extract_amount_cr(text)
            gen_events[eid] = {
                "id": eid, "date": date, "date_precision": "day", "stage": stage,
                "title": it.get("headline", "").strip(),
                "summary": (it.get("snippet") or it.get("headline") or "").strip(),
                "geo": {"state": state or None, "district": (it.get("geo") or {}).get("district")},
                "scheme_ref": scheme, "official_ref": it.get("official_ref"),
                "ledger_row_ref": None,
                "amount_cr": amt, "figure_gap": amt is None,
                "chain_id": chain_id, "chain_seq": seq,
                "primary_source": {
                    "type": "news", "title": it.get("outlet", "news"),
                    "url": it.get("url"), "source_tier": 4,
                },
                "corroborating_news": [it.get("id")] if it.get("id") else [],
                "confidence": "reported",      # news-only — NEVER "documented"
                "needs_pdf_upgrade": True,
                "severity": None,
                "generated": True,
                "ingest_source": "gen_fiscal_events.py",
            }
            event_ids.append(eid)
        if not event_ids:
            continue
        dates = [d for d, _, _ in uniq]
        has_outcome = any(s == "outcome" for _, s, _ in uniq)
        gen_chains[chain_id] = {
            "id": chain_id,
            "title": f"{scheme}" + (f" in {state}" if state else "") + " — a developing story (from the news)",
            "geo": {"state": state or None, "district": None},
            "scheme_ref": scheme,
            "status": "resolved" if has_outcome else "open",
            "event_ids": event_ids,
            "started_at": min(dates), "last_event_at": max(dates),
            "one_line": f"{len(event_ids)} report" + ("" if len(event_ids) == 1 else "s") +
                        f" on {scheme}" + (f" in {state}" if state else "") +
                        f", {min(dates)} → {max(dates)}. News-derived; reported, not documented.",
            "generated": True,
        }

    # --- merge: curated FIRST (wins), then generated that don't collide ---
    out_events = dict(curated_events)
    for eid, e in gen_events.items():
        out_events.setdefault(eid, e)
    out_chains = dict(curated_chains)
    for cid, c in gen_chains.items():
        out_chains.setdefault(cid, c)

    meta["as_of"] = datetime.date.today().isoformat()
    meta["generated_note"] = ("story_chains/fiscal_events with generated=true are auto-derived "
                              "from scheme-anchored news by gen_fiscal_events.py — confidence "
                              "'reported' (news only), never documented; figures only if cited.")

    doc_out = {
        "_meta": meta,
        "story_chains": sorted(out_chains.values(),
                               key=lambda c: (0 if not c.get("generated") else 1, c.get("last_event_at") or "", c["id"]),
                               reverse=False),
        "fiscal_events": sorted(out_events.values(), key=lambda e: (e.get("chain_id", ""), e.get("chain_seq", 0))),
    }
    with open(EVENTS, "w", encoding="utf-8") as f:
        json.dump(doc_out, f, ensure_ascii=False, indent=2)

    n_gen_ch = sum(1 for c in doc_out["story_chains"] if c.get("generated"))
    n_cur_ch = len(doc_out["story_chains"]) - n_gen_ch
    print(f"fiscal-events.json: {n_cur_ch} curated + {n_gen_ch} generated chains, "
          f"{len(out_events)} events total")


if __name__ == "__main__":
    main()
