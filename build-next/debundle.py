#!/usr/bin/env python3
"""
debundle.py — unpack the Claude-design bundle into STANDALONE responsive pages.

The Claude export wraps its 7 pages in a runtime that renders each into a fixed 1440px <iframe>
— which is why it's desktop-only. But each inner page is self-contained HTML with its OWN
responsive CSS (@media queries, viewport-ready). Served directly (no iframe wrapper), each page
adapts to phone/tablet/desktop. This extracts them and rewrites the .dc.html nav links to real
slugs, so the Claude design becomes adaptive while keeping its exact look + L1/L2 nav.

Run:  python3 build-next/debundle.py <bundle.html> <out_dir>
"""
import sys, os, re, json, base64, gzip

# the bundle page TITLE -> our site slug. index.html is the Discover landing.
TITLE_SLUG = {
    "Discover Bharat, one state at a time": "index.html",
    "Bengal, both sides of the line": "region-bengal.html",
    "Bihar had many tribes": "region-bihar.html",
    "Bihar and Jharkhand": "region-bihar.html",
    "Rajasthan’s twelve": "region-rajasthan.html",
    "Rajasthan's twelve": "region-rajasthan.html",
    "Haryana, before and after 1966": "region-haryana.html",
    "Goa, before and after 1510": "region-goa.html",
    "India by design systems": "design-systems.html",
    "India by colour — one page, dyed 22 ways": "design-systems.html",
}

# .dc.html internal links -> real slugs (matches the generator's page names)
DC_SLUG = {
    "States": "index.html", "Main": "index.html", "Discover": "index.html",
    "Regions": "design-systems.html", "DesignSystem": "design-system.html",
    "Kingdoms": "kingdoms.html", "Tribes": "tribes.html", "Tribes-India": "tribes-india.html",
    "Peoples": "tribes.html", "Today": "today.html", "Story": "story.html",
    "Region-Bengal": "region-bengal.html", "Region-Bihar": "region-bihar.html",
    "Region-Rajasthan": "region-rajasthan.html", "Region-Haryana": "region-haryana.html",
    "Region-Goa": "region-goa.html",
}


def _slug_for(title):
    t = (title or "").strip()
    return TITLE_SLUG.get(t, re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-") + ".html")


def _slug_for_dc(name):
    base = name[:-8] if name.endswith(".dc.html") else name
    if base in DC_SLUG:
        return DC_SLUG[base]
    if base.startswith("Tribe-"):
        return "tribe-" + base[6:].lower() + ".html"
    if base.startswith("Region-"):
        return "region-" + base[7:].lower() + ".html"
    return base.lower() + ".html"


# The Claude export hardcodes some L1 nav links to index.html (it was the bundle's first page).
# Repoint each L1 door's nav link to its REAL hub page, by its data-i18n label. (href and data-i18n
# may carry escaped quotes inside the bundler manifest, so match both \" and " forms.)
NAV_FIX = {
    "story": "story.html",       # was index.html — "the story page is missing" bug
    "discover": "index.html",    # the landing IS the Discover page, so keep Discover -> index.html
    "peoples": "tribes.html",
    "kingdoms": "kingdoms.html",
    "today": "today.html",
    "about": "about.html",
}


def _fix_nav(html):
    """Repoint each L1 nav anchor (identified by its data-i18n label) to the right hub."""
    for label, slug in NAV_FIX.items():
        # <a ... href="SOMETHING" ... data-i18n="LABEL"> — rewrite the href before the label
        html = re.sub(
            r'(href=\\?")[^"\\]*(\\?"[^>]*data-i18n=\\?"' + label + r'\\?")',
            lambda m, s=slug: m.group(1) + s + m.group(2),
            html)
    return html


def _rewrite(html):
    # rewrite every '<Name>.dc.html' (escaped or not) to a real slug
    html = re.sub(r'([A-Za-z][A-Za-z0-9-]*)\.dc\.html',
                  lambda m: _slug_for_dc(m.group(0)), html)
    html = _fix_nav(html)
    # ensure a viewport meta so phones size correctly
    if not re.search(r'<meta[^>]*viewport', html):
        html = re.sub(r'(<head[^>]*>)',
                      r'\1\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
                      html, count=1)
    # phone polish: the Claude pages have no sub-820px breakpoint, so the big display heading +
    # a few labels clip past ~400px. Add a small-screen override that fluid-sizes the hero type
    # and kills any horizontal overflow — WITHOUT touching the desktop design.
    phone_css = (
        "<style>@media (max-width:760px){"
        "html,body{overflow-x:hidden!important;max-width:100vw!important}"
        # the content root + every section the Claude design pins at 1080–1440px → fluid
        "#dc-root,#dc-root *{max-width:100%!important}"
        "#dc-root [style*='width:1180px'],#dc-root [style*='width: 1180px'],"
        "#dc-root [style*='width:1240px'],#dc-root [style*='width: 1240px'],"
        "#dc-root [style*='width:1080px'],#dc-root [style*='width: 1080px'],"
        "#dc-root [style*='width:1440px'],#dc-root [style*='width: 1440px']"
        "{width:100%!important;min-width:0!important}"
        # fluid display type so the big heading never runs off-screen
        "#dc-root h1,#dc-root [style*='font-size: 72px'],#dc-root [style*='font-size:72px'],"
        "#dc-root [style*='font-size: 64px'],#dc-root [style*='font-size: 56px']"
        "{font-size:clamp(30px,8.5vw,52px)!important;line-height:1.1!important;overflow-wrap:anywhere}"
        "img,svg,canvas,iframe{max-width:100%!important;height:auto}"
        "}</style>"
    )
    if "</head>" in html:
        html = html.replace("</head>", phone_css + "</head>", 1)
    return html


def _pages(html):
    m = re.search(r'<script type="__bundler/manifest">(.*?)</script>', html, re.S)
    o = re.search(r'<script type="__bundler/page_order">(.*?)</script>', html, re.S)
    if not m or not o:
        return None
    man = json.loads(m.group(1)); order = json.loads(o.group(1))
    out = []
    for uid in order:
        ent = man[uid]
        raw = (gzip.decompress(base64.b64decode(ent["data"]))
               if ent.get("compressed") else base64.b64decode(ent["data"]))
        out.append(raw.decode("utf-8", "replace"))
    return out


def debundle(bundle_path, out_dir):
    top = open(bundle_path, encoding="utf-8", errors="replace").read()
    pages = _pages(top)
    if not pages:
        print("no bundler manifest found", file=sys.stderr); return []
    os.makedirs(out_dir, exist_ok=True)
    written = []
    for p in pages:
        t = re.search(r"<title>([^<]*)</title>", p)
        title = t.group(1) if t else "page"
        slug = _slug_for(title)
        open(os.path.join(out_dir, slug), "w").write(_rewrite(p))
        written.append((slug, title))
    return written


if __name__ == "__main__":
    b = sys.argv[1] if len(sys.argv) > 1 else "index.html"
    o = sys.argv[2] if len(sys.argv) > 2 else "."
    for slug, title in debundle(b, o):
        print(f"  {slug:26} <- {title}")
