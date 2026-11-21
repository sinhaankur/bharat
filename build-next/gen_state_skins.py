#!/usr/bin/env python3
"""
gen_state_skins.py — turn the 6 canvas state-skin token sets (Kashmir, Tamil, Kerala,
Assam, Nagaland, Rajasthan) into real theme-<state>.css files for our 15-skin switcher.

Each canvas Skin-*.dc.html exposes a palette (accent/surface/ink/bg/band). We map those
onto our canonical tokens (--background/--foreground/--card/--accent/--border/--gold-leaf),
with a light register (the canvas values) and a derived dark register, so the skin works in
both theme-light and theme-dark like our dynasty skins.

Run as a module:  from gen_state_skins import write_state_skins; write_state_skins(out_css_dir)
"""
import os, re

HERE = os.path.dirname(os.path.abspath(__file__)) + "/"
CANVAS = HERE + "canvas/"

STATE_SKINS = {
    "kashmir":  "Skin-Kashmir",
    "tamil":    "Skin-Tamil",
    "kerala":   "Skin-Kerala",
    "assam":    "Skin-Assam",
    "naga":     "Skin-Naga",
    "rajasthan":"Skin-Rajasthan",
}


def _palette(f):
    h = open(CANVAS + f + ".dc.html", encoding="utf-8").read()
    v = {}
    for key in ("accent", "surface", "ink", "bg", "band"):
        m = re.search(key + r'["\']?\s*:\s*["\']?(#[0-9a-fA-F]{3,8})', h)
        v[key] = m.group(1) if m else None
    return v


def _css(slug, p):
    acc, surf, ink, bg, band = p["accent"], p["surface"], p["ink"], p["bg"], p["band"]
    cls = "theme-" + slug
    # LIGHT register = the canvas values; DARK = a derived deep ground keeping the accent.
    return f"""/* theme-{slug}.css — state skin, from the canvas Skin page's palette.
   REVERSIBLE: link after site.css; add class="{cls}" to <html>. Light + dark registers. */
html.{cls} {{
  --accent: {acc}; --gold-leaf: {acc};
  --background: {bg}; --surface: {surf}; --card: {surf};
  --foreground: {ink}; --muted-foreground: color-mix(in oklab, {ink} 62%, {surf});
  --border: color-mix(in oklab, {ink} 22%, transparent);
  --border-strong: color-mix(in oklab, {ink} 40%, transparent);
  --indigo: {band};
}}
html.{cls}.theme-dark {{
  --background: color-mix(in oklab, {ink} 86%, #000);
  --surface: color-mix(in oklab, {ink} 78%, #000);
  --card: color-mix(in oklab, {ink} 78%, #000);
  --foreground: color-mix(in oklab, {surf} 92%, #fff);
  --muted-foreground: color-mix(in oklab, {surf} 60%, {ink});
  --border: color-mix(in oklab, {acc} 26%, transparent);
  --border-strong: color-mix(in oklab, {acc} 46%, transparent);
  --accent: color-mix(in oklab, {acc} 86%, #fff);
}}
"""


def write_state_skins(out_css_dir):
    """Write theme-<state>.css for each state skin; return the list of slugs."""
    os.makedirs(out_css_dir, exist_ok=True)
    slugs = []
    for slug, f in STATE_SKINS.items():
        p = _palette(f)
        if not p.get("accent"):
            continue
        open(os.path.join(out_css_dir, f"theme-{slug}.css"), "w").write(_css(slug, p))
        slugs.append(slug)
    return slugs


if __name__ == "__main__":
    import tempfile
    d = tempfile.mkdtemp()
    s = write_state_skins(d)
    print("wrote", len(s), "state skins:", s)
    print(open(os.path.join(d, "theme-kashmir.css")).read()[:400])
