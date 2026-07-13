#!/usr/bin/env python3
"""
scrape_whoswho.py — harvest district officials from the official .nic.in / .gov.in
district portals ("Who's Who" pages) at scale, into a sourced dataset.

Why this source: India's district portals (mostly the standard S3WaaS template)
publish a "Who's Who" directory of the district's officers — Collector/DM, SP,
ADMs, SDOs, etc. That is a TIER-2 government-HTML source (better than Wikipedia),
and it is exactly where the atlas's existing 26 sourced officials came from.

Honesty rules (same as the whole project):
  * Only REAL extracted names are recorded. No name found → nothing written (a gap).
  * Every record carries the exact page URL it came from + source_tier 2.
  * The portal URL is auto-derived from the standard <district>.nic.in / .gov.in
    pattern, with an override map for the non-standard ones. Unreachable → skipped
    and reported, never faked.

Output: district-whoswho.json  (merge into the roster / officials with a follow-up).

Usage:
  python3 scrape_whoswho.py --districts Birbhum,Munger      # a few (smoke test)
  python3 scrape_whoswho.py --state "West Bengal"            # one state
  python3 scrape_whoswho.py --all --sleep 1.0                # everything (be polite)
  python3 scrape_whoswho.py --all --limit 3                 # 3 districts/state

Network: stdlib only. Be polite: default 1s between requests, clear User-Agent.
"""
import argparse, json, re, sys, time, socket, urllib.request, urllib.parse, html
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LEDGER = ROOT / "district-ledger.json"
OUT = ROOT / "district-whoswho.json"
UA = "india-district-atlas civic-data bot (educational; https://github.com/sinhaankur/india-fiscal-map)"
socket.setdefaulttimeout(20)

# District name (lowercased, spaces→'') → portal base, for the non-standard ones.
# Auto-pattern handles the rest (<slug>.nic.in then <slug>.gov.in).
PORTAL_OVERRIDE = {
    "kolkata": "https://www.kmcgov.in",           # civic body, not a nic.in district
    "jaipur": "https://jaipur.rajasthan.gov.in",
    "greaterbombay": "https://mumbaicity.gov.in",
    "mumbai": "https://mumbaicity.gov.in",
    "bangaloreurban": "https://bengaluruurban.karnataka.gov.in",
    "hyderabad": "https://hyderabad.telangana.gov.in",
}

# Who's-who path candidates appended to the portal base.
WHOSWHO_PATHS = ["/whos-who/", "/who-s-who/", "/whoswho/", "/who's-who/",
                 "/document-category/who-s-who/", "/en/whos-who/"]

# Post keywords → a normalised role + service, so extracted names map to the roster.
POST_MAP = [
    (r"district magistrate|collector|deputy commissioner|dy\.? commissioner|dm & collector|dc cum", "collector", "IAS"),
    (r"superintendent of police|\bsp\b|commissioner of police|police commissioner", "sp", "IPS"),
    (r"additional district magistrate|\badm\b|addl\.? district magistrate", "adm", "IAS"),
    (r"sub-?divisional (officer|magistrate)|\bsdo\b|\bsdm\b", "sdo", "State"),
    (r"chief executive officer|zilla parishad|\bceo\b", "zp_ceo", "IAS"),
    (r"municipal commissioner|corporation commissioner", "municipal_commissioner", "IAS"),
    (r"district (development|panchayat) officer|\bddo\b", "ddo", "State"),
    (r"civil surgeon|chief medical officer|\bcmo\b", "cmo", "State"),
]
HONORIFIC = r"(?:Shri|Sri|Sh|Smt|Kum|Dr|Mr|Ms|Mrs)\.?"
NAME = r"[A-Z][a-zA-Z.]+(?:\s+[A-Z][a-zA-Z.]+){0,3}"


def http_get(url, retries=2):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for i in range(retries + 1):
        try:
            with urllib.request.urlopen(req) as r:
                return r.read().decode("utf-8", "replace"), r.geturl()
        except Exception:
            if i == retries:
                return None, None
            time.sleep(1.2 * (i + 1))


def slug(name):
    return re.sub(r"[^a-z0-9]", "", name.lower())


def portal_for(district):
    s = slug(district)
    if s in PORTAL_OVERRIDE:
        return [PORTAL_OVERRIDE[s]]
    return [f"https://{s}.nic.in", f"https://{s}.gov.in"]


def find_whoswho(base):
    """Return (html, url) of a reachable who's-who page under base, or (None,None)."""
    for path in WHOSWHO_PATHS:
        h, url = http_get(base.rstrip("/") + path)
        if h and re.search(r"who.?s.?who|designation|officer", h, re.I):
            return h, url
    # fall back to the homepage (some list officers there)
    h, url = http_get(base)
    return (h, url) if h else (None, None)


def normalise_post(text):
    t = text.lower()
    for pat, role, service in POST_MAP:
        if re.search(pat, t):
            return role, service
    return None, None


def _clean_cell(c):
    return html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", c))).strip()


SERVICE_RE = r"I\.?A\.?S|I\.?P\.?S|I\.?F\.?o?S|I\.?R\.?S|W\.?B\.?C\.?S|P\.?C\.?S|H\.?C\.?S|R\.?A\.?S|State Civil|\(?Exe\)?"
# Words that mean a cell is a designation/label, not a person's name.
NOT_A_NAME = re.compile(r"\b(magistrate|collector|commissioner|officer|dclr|sadar|designation|"
                        r"police|superintendent|deputy|district|division|office|department|"
                        r"development|panchayat|revenue|circle|block|sub|zilla)\b", re.I)


def _parse_name_service(cell):
    """'Shri Dhaval Jain, I.A.S' → ('Dhaval Jain', 'IAS'); 'Sh. Himanshu Jain IAS' →
    ('Himanshu Jain','IAS'). Returns (None,None) if it doesn't look like a real name."""
    raw = html.unescape(cell).strip()
    svc = None
    ms = re.search(r"\b(" + SERVICE_RE + r")\b", raw)
    if ms:
        s = re.sub(r"[.\s()]", "", ms.group(1)).upper()
        svc = {"IAS": "IAS", "IPS": "IPS", "IFOS": "IFoS", "IFS": "IFoS", "IRS": "IRS"}.get(s, "State")
    # cut anything from the first comma or the service token onward
    name_part = re.split(r",|\bI\.?A\.?S|\bI\.?P\.?S|\bW\.?B\.?C\.?S|\bP\.?C\.?S|\bH\.?C\.?S|\bR\.?A\.?S|\(", raw)[0]
    # strip leading honorifics (Shri/Sri/Smt/Sh./Dr./Mr./Ms./Mrs./Kum)
    name_part = re.sub(r"^\s*(?:" + HONORIFIC + r"|Sh|Smt|Kum)\.?\s+", "", name_part).strip(" .")
    m = re.match(r"^(" + NAME + r")$", name_part)
    if not m:
        return None, None
    name = m.group(1).strip(" .")
    if len(name) < 4 or " " not in name:          # require at least first + last
        return None, None
    if NOT_A_NAME.search(name):                    # reject designation-like cells
        return None, None
    return name, svc


def extract_officials(html_text, url):
    """TABLE-FIRST extraction: the S3WaaS who's-who is a <table> of
    [Name+service, Designation, email, address]. Parse rows → map designation to a
    role. Falls back to a conservative text scan only if there's no usable table.
    Honest: only real names recorded; ambiguous rows skipped."""
    found = {}
    rows = re.findall(r"<tr[^>]*>(.*?)</tr>", html_text, flags=re.S | re.I)
    for r in rows:
        cells = [_clean_cell(c) for c in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", r, flags=re.S | re.I)]
        cells = [c for c in cells if c]
        if len(cells) < 2:
            continue
        # find the designation cell + the name cell among the first few cells
        desig_idx = name_idx = None
        for i, c in enumerate(cells[:4]):
            if desig_idx is None and normalise_post(c)[0]:
                desig_idx = i
            if name_idx is None and re.search(HONORIFIC + r"\s+" + NAME, c):
                name_idx = i
        if desig_idx is None:
            continue
        role, service = normalise_post(cells[desig_idx])
        ncell = cells[name_idx] if name_idx is not None else (cells[0] if desig_idx != 0 else None)
        if not ncell:
            continue
        name, svc = _parse_name_service(ncell)
        if name and role and role not in found:
            found[role] = {"name": name, "post_text": cells[desig_idx][:60],
                           "service": svc or service}
    if found:
        return found

    # Fallback: conservative free-text scan (only when no table yielded anything).
    text = re.sub(r"<[^>]+>", " ", html_text)
    text = re.sub(r"\s+", " ", html.unescape(text))
    for pat, role, service in POST_MAP:
        m = re.search(pat, text, re.I)
        if not m:
            continue
        window = text[max(0, m.start() - 80): m.start() + 120]
        nm = re.search(HONORIFIC + r"\s+(" + NAME + r")", window)
        if nm and role not in found:
            name = nm.group(1).strip(" .")
            if len(name) >= 4:
                found[role] = {"name": name, "post_text": " ".join(window.split()[:6]), "service": service}
    return found


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--state")
    ap.add_argument("--districts", help="comma-separated district names")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--sleep", type=float, default=1.0)
    args = ap.parse_args()

    led = json.loads(LEDGER.read_text())
    # build the (state, district) worklist
    work = []
    for sn, s in led["states"].items():
        if args.state and sn.lower() != args.state.lower():
            continue
        dists = list(s.get("districts", {}).keys())
        if args.limit:
            dists = dists[:args.limit]
        for dn in dists:
            work.append((sn, dn))
    if args.districts:
        want = {d.strip().lower() for d in args.districts.split(",")}
        work = [(s, d) for (s, d) in work if d.lower() in want]
    if not (args.all or args.state or args.districts):
        sys.exit("pass --districts A,B | --state NAME | --all")

    out = {"_meta": {
        "as_of": time.strftime("%Y-%m-%d"),
        "source": "official .nic.in / .gov.in district portals (Who's Who) — tier 2",
        "rules": "Only real extracted names recorded, each cited to the page URL. No match → a gap. Portal URLs auto-derived (override map for non-standard). Nothing fabricated.",
        "source_tier": 2,
    }, "districts": {}}
    cov = {"tried": 0, "portal_found": 0, "any_official": 0, "officials": 0}

    for sn, dn in work:
        cov["tried"] += 1
        sys.stderr.write(f"  {sn} / {dn} ... "); sys.stderr.flush()
        found_rec = None
        for base in portal_for(dn):
            h, wurl = find_whoswho(base)
            if h:
                cov["portal_found"] += 1
                officials = extract_officials(h, wurl or base)
                found_rec = {"portal": base, "whoswho_url": wurl or base,
                             "officials": officials}
                break
        key = f"{sn}|{dn}"
        if found_rec and found_rec["officials"]:
            cov["any_official"] += 1
            cov["officials"] += len(found_rec["officials"])
            out["districts"][key] = found_rec
            sys.stderr.write(f"{len(found_rec['officials'])} official(s)\n")
        elif found_rec:
            out["districts"][key] = dict(found_rec, _gap="portal reachable, no officials parsed")
            sys.stderr.write("portal ok, 0 parsed\n")
        else:
            out["districts"][key] = {"_gap": "no reachable portal"}
            sys.stderr.write("no portal\n")
        time.sleep(args.sleep)

    out["_meta"]["coverage"] = cov
    OUT.write_text(json.dumps(out, indent=2, ensure_ascii=False))
    sys.stderr.write(f"\nWrote {OUT}\n  coverage: {json.dumps(cov)}\n")


if __name__ == "__main__":
    main()
