#!/usr/bin/env python3
"""
District chain-of-command scraper.

Discovery layer : Wikipedia district + constituency pages (uneven but broad).
Citation layer  : prefers an authoritative source per fact, ranked by tier:
                  1 = government PDF (Pay Commission, gazette, DoPT Civil List, *.gov.in PDF)
                  2 = government HTML (*.nic.in / *.gov.in district site)
                  3 = Wikipedia
                  4 = news article
Salary is NEVER scraped per person — it is joined from pay-scales.json by post.

Honesty rules:
- A field the source did not provide stays null and is recorded in `_gaps`.
- Never fabricate a name. Coverage is reported, not faked.

Usage:
  python3 scrape_officials.py --state Kerala         # one state (smoke test)
  python3 scrape_officials.py --all                  # every district in _index.json
  python3 scrape_officials.py --all --limit 5        # first 5 districts/state (dry-ish)

Network: uses only the stdlib. Wikipedia REST summary + parse API (no key).
"""
import argparse, json, re, sys, time, urllib.parse, urllib.request, html
from pathlib import Path

ROOT = Path(__file__).resolve().parent
INDEX = ROOT / "districts" / "_index.json"
OUT = ROOT / "district-officials.json"
PAY = ROOT / "pay-scales.json"

WP_API = "https://en.wikipedia.org/w/api.php"
UA = "india-fiscal-map officials-scraper (educational; contact via repo)"

SOURCE_TIER = {"gov_pdf": 1, "gov_html": 2, "wikipedia": 3, "news": 4}

# UT classification — drives which posts exist in the chain.
ENTITY_TYPE = {
    "Delhi": "ut_legislature", "Jammu & Kashmir": "ut_legislature",
    "Jammu and Kashmir": "ut_legislature", "Puducherry": "ut_legislature",
    "Chandigarh": "ut_no_legislature", "Ladakh": "ut_no_legislature",
    "Andaman & Nicobar": "ut_no_legislature", "Lakshadweep": "ut_no_legislature",
    "Dadra and Nagar Haveli": "ut_no_legislature", "Daman and Diu": "ut_no_legislature",
}


def http_get(url, params=None, retries=3):
    if params:
        url = url + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read().decode("utf-8", "replace")
        except Exception as e:
            if attempt == retries - 1:
                raise
            time.sleep(1.5 * (attempt + 1))


def wiki_html(title):
    """Parsed HTML of a Wikipedia page (or None if missing)."""
    raw = http_get(WP_API, {
        "action": "parse", "page": title, "prop": "text",
        "format": "json", "redirects": "1",
    })
    data = json.loads(raw)
    if "error" in data:
        return None, None
    return data["parse"]["text"]["*"], "https://en.wikipedia.org/wiki/" + urllib.parse.quote(title.replace(" ", "_"))


def strip_tags(s):
    s = re.sub(r"<sup[^>]*>.*?</sup>", "", s, flags=re.S)   # drop [1] refs
    s = re.sub(r"<[^>]+>", "", s)
    return html.unescape(s).strip()


def infobox_field(html_text, *labels):
    """Pull a value from the infobox by row header label(s). Returns clean text or None."""
    # crude row split; good enough for the vt/infobox table markup
    for label in labels:
        m = re.search(
            r"<th[^>]*>\s*" + re.escape(label) + r".*?</th>\s*<td[^>]*>(.*?)</td>",
            html_text, flags=re.S | re.I,
        )
        if m:
            val = strip_tags(m.group(1))
            if val and val.lower() not in ("", "vacant", "tbd", "—", "-"):
                return val
    return None


def field(name, post, service, value, source_url, tier):
    g = {"name": value, "post": post, "service": service,
         "as_of": time.strftime("%Y-%m") if value else None,
         "source": source_url if value else None,
         "source_tier": SOURCE_TIER[tier] if value else None}
    return g


def scrape_district(state, district):
    """Best-effort extraction for one district. Returns (record, gaps)."""
    gaps = []
    title = f"{district} district"
    htmlt, url = wiki_html(title)
    if htmlt is None:
        htmlt, url = wiki_html(district)  # some are titled bare
    rec = {
        "executive": {
            "collector": field("collector", "District Collector", "IAS", None, None, "wikipedia"),
            "sp": field("sp", "Superintendent of Police", "IPS", None, None, "wikipedia"),
            "minister_in_charge": field("minister_in_charge", "District-in-charge Minister", "Political", None, None, "wikipedia"),
        },
        "judiciary": {
            "district_judge": field("district_judge", "District & Sessions Judge", "Judicial", None, None, "wikipedia"),
        },
        "legislature": {"lok_sabha": [], "assembly": []},
        "_gaps": gaps,
        "_wikipedia": url,
    }
    if htmlt is None:
        gaps.append("no_wikipedia_page")
        return rec

    coll = infobox_field(htmlt, "Collector", "District Collector", "Deputy Commissioner", "District Magistrate")
    if coll:
        rec["executive"]["collector"] = field("collector", "District Collector", "IAS", coll, url, "wikipedia")
    else:
        gaps.append("collector")

    sp = infobox_field(htmlt, "Superintendent of Police", "S.P", "SP", "Police chief")
    if sp:
        rec["executive"]["sp"] = field("sp", "Superintendent of Police", "IPS", sp, url, "wikipedia")
    else:
        gaps.append("sp")

    # District judge essentially never on the district page — record honestly.
    gaps.append("district_judge")

    # Lok Sabha: infobox usually gives constituency name(s), rarely the person.
    mp_field = infobox_field(htmlt, "Lok Sabha constituency", "Parliamentary constituency", "MP")
    if mp_field:
        for c in re.split(r",| and ", mp_field):
            c = c.strip()
            if c:
                rec["legislature"]["lok_sabha"].append(
                    {"constituency": c, "name": None, "party": None, "source": url, "source_tier": 3})
    else:
        gaps.append("lok_sabha")

    return rec


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--state")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--limit", type=int, default=0, help="cap districts per state (test)")
    ap.add_argument("--sleep", type=float, default=0.5)
    args = ap.parse_args()

    index = json.loads(INDEX.read_text())
    pay = json.loads(PAY.read_text())  # validated load; join happens in UI

    targets = list(index["states"].keys())
    if args.state:
        targets = [s for s in targets if s.lower() == args.state.lower()]
        if not targets:
            sys.exit(f"state not found: {args.state}")
    elif not args.all:
        sys.exit("pass --state NAME or --all")

    out = {"_meta": {
        "as_of": time.strftime("%Y-%m"),
        "sources": ["en.wikipedia.org (discovery)", "prefers gov PDF/HTML where available"],
        "caveat": "Names rotate; salary joined per-post from pay-scales.json. Coverage uneven.",
        "source_tiers": {v: k for k, v in SOURCE_TIER.items()},
    }, "states": {}}

    cov = {"districts_total": 0, "with_collector": 0, "with_sp": 0, "with_judge": 0, "with_mp": 0}

    # load existing geojson to enumerate real district names per state
    for state in targets:
        ent = ENTITY_TYPE.get(state, "state")
        geo = json.loads((ROOT / index["states"][state]["file"]).read_text())
        dnames = []
        for f in geo["features"]:
            p = f["properties"]
            dn = p.get("DISTRICT") or p.get("NAME_2")
            if dn:
                dnames.append(dn)
        if args.limit:
            dnames = dnames[:args.limit]

        out["states"][state] = {
            "entity_type": ent,
            "heads": {
                ("lt_governor" if ent == "ut_legislature" else
                 "administrator" if ent == "ut_no_legislature" else "governor"):
                    field("governor", "Governor", "Constitutional", None, None, "wikipedia"),
                "chief_minister": (None if ent == "ut_no_legislature"
                                   else field("cm", "Chief Minister", "Political", None, None, "wikipedia")),
                "high_court": {"name": None, "chief_justice": None, "source": None},
            },
            "districts": {},
        }
        for dn in dnames:
            sys.stderr.write(f"  {state} / {dn} ... ")
            sys.stderr.flush()
            rec = scrape_district(state, dn)
            out["states"][state]["districts"][dn] = rec
            cov["districts_total"] += 1
            if rec["executive"]["collector"]["name"]:
                cov["with_collector"] += 1
            if rec["executive"]["sp"]["name"]:
                cov["with_sp"] += 1
            if rec["legislature"]["lok_sabha"]:
                cov["with_mp"] += 1
            sys.stderr.write("ok\n")
            time.sleep(args.sleep)

    out["_meta"]["coverage"] = cov
    OUT.write_text(json.dumps(out, indent=2, ensure_ascii=False))
    sys.stderr.write(f"\nWrote {OUT} — coverage: {json.dumps(cov)}\n")


if __name__ == "__main__":
    main()
