#!/usr/bin/env python3
"""
unpack_final.py — unpack the final Claude-design bundle (the self-contained HTML dump) into
real, standalone .html pages, and rewrite its .dc.html nav links to our real slugs so the
L1/L2/L3 navigation works across the site.

The bundle is a single HTML file with a __bundler/manifest (gzip+base64 pages) and a
__bundler/page_order. Each page is already self-contained (inline CSS, bundled @font-face,
custom WebGL). We just: decompress → slugify → rewrite links.

Run:  python3 unpack_final.py <bundle.html> <out_dir>
"""
import sys, os, re, json, base64, gzip

# the final bundle's page TITLE → our site slug (the primary pages)
TITLE_SLUG = {
    "Discover Bharat, one state at a time": "discover.html",
    "Bengal, both sides of the line": "region-bengal.html",
    "Bihar had many tribes": "region-bihar.html",
    "Rajasthan’s twelve": "region-rajasthan.html",
    "Rajasthan's twelve": "region-rajasthan.html",
    "Haryana, before and after 1966": "region-haryana.html",
    "Goa, before and after 1510": "region-goa.html",
    "India by design systems": "design-systems.html",
    "Bharat, from the first villages to today": "index.html",
    "Learn Bharat, era by era": "learn.html",
}

# the bundle's internal .dc.html hrefs → our real slugs (links to the 7 finals + our built pages)
DC_SLUG = {
    "Main.dc.html": "index.html",
    "States.dc.html": "discover.html",
    "Regions.dc.html": "design-systems.html",
    "Region-Bengal.dc.html": "region-bengal.html",
    "Region-Bihar.dc.html": "region-bihar.html",
    "Region-Rajasthan.dc.html": "region-rajasthan.html",
    "Region-Haryana.dc.html": "region-haryana.html",
    "Region-Goa.dc.html": "region-goa.html",
    "Kingdoms.dc.html": "kingdoms.html",
    "Tribes.dc.html": "tribes.html",
    "Tribes-India.dc.html": "tribes-india.html",
    "DesignSystem.dc.html": "design-system.html",
    "Learn.dc.html": "learn.html",
}


def _slug_for(title):
    return TITLE_SLUG.get(title.strip(), re.sub(r"[^a-z0-9]+", "-", title.strip().lower()).strip("-") + ".html")


def _slug_for_dc(name):
    """A single '<Name>.dc.html' → our real slug. Works for both header links and the
    escaped JSON data blobs (where links live as "href":"Tribe-Gond.dc.html")."""
    if name in DC_SLUG:
        return DC_SLUG[name]
    base = name[:-8] if name.endswith(".dc.html") else name
    if base.startswith("Tribe-"):
        return "tribe-" + base[6:].lower() + ".html"
    if base.startswith("Region-"):
        return "region-" + base[7:].lower() + ".html"
    if base.startswith("Skin-"):
        return "skin-" + base[5:].lower() + ".html"
    return base.lower() + ".html"


def _rewrite_links(html):
    # Replace EVERY '<Name>.dc.html' occurrence (header hrefs AND escaped JSON data) with our
    # real slug. Matching the bare token is safe: the only '.dc.html' strings are page links.
    return re.sub(r'([A-Za-z][A-Za-z0-9-]*)\.dc\.html', lambda m: _slug_for_dc(m.group(0)), html)


def unpack(bundle_path, out_dir):
    h = open(bundle_path, encoding="utf-8", errors="replace").read()
    order = json.loads(re.search(r'<script type="__bundler/page_order">(.*?)</script>', h, re.S).group(1))
    man = json.loads(re.search(r'<script type="__bundler/manifest">(.*?)</script>', h, re.S).group(1))
    os.makedirs(out_dir, exist_ok=True)
    out = []
    for uid in order:
        ent = man[uid]
        raw = gzip.decompress(base64.b64decode(ent["data"])) if ent.get("compressed") else base64.b64decode(ent["data"])
        page = raw.decode("utf-8", errors="replace")
        m = re.search(r"<title>([^<]*)</title>", page)
        title = m.group(1) if m else uid
        slug = _slug_for(title)
        page = _rewrite_links(page)
        open(os.path.join(out_dir, slug), "w").write(page)
        out.append((slug, title))
    return out


if __name__ == "__main__":
    bundle = sys.argv[1] if len(sys.argv) > 1 else "/tmp/final2.html"
    outd = sys.argv[2] if len(sys.argv) > 2 else "/tmp/final_unpacked"
    pages = unpack(bundle, outd)
    print(f"unpacked {len(pages)} pages to {outd}:")
    for slug, title in pages:
        print(f"  {slug:28} {title}")
