#!/usr/bin/env python3
"""
bundle_noto_fonts.py  —  self-host the Noto fonts for every script family the
atlas displays, so Brahmi / Grantha / Devanagari / Tamil / … specimen lines
ALWAYS render and never show tofu (boxes), on any device.

WHY: the scripts.html specimens (and any Indic text) depend on the visitor
having the right font installed — which most don't for Brahmi & Grantha. We
download the official OFL Noto fonts, subset them to the Unicode ranges we use,
convert to WOFF2, and self-host under assets/fonts/noto/. styles.css then wires
one @font-face + utility class per script.

Reproducible. Requires network + fontTools + brotli (project venv):

    .venv-font/bin/python bundle_noto_fonts.py

Outputs:
    assets/fonts/noto/<Family>-Regular.woff2   (subset, self-hosted)
    assets/fonts/noto/OFL.txt                  (license — all Noto is OFL 1.1)
    assets/fonts/noto/MANIFEST.json            (what we bundled + sizes)

Idempotent: re-running re-downloads and re-subsets.
"""

import os, sys, json, urllib.request, tempfile

try:
    from fontTools import subset
    from fontTools.ttLib import TTFont
except ImportError:
    sys.exit("fontTools/brotli needed. Use: .venv-font/bin/python bundle_noto_fonts.py")

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "assets", "fonts", "noto")
os.makedirs(OUT, exist_ok=True)

BASE = "https://raw.githubusercontent.com/notofonts/notofonts.github.io/main/fonts"

# family -> (noto repo name, css-name, Unicode block ranges to keep)
# ranges are inclusive (lo, hi). We keep the whole relevant block(s) so the
# bundled font is reusable for ANY text in that script, not just our specimen.
FONTS = {
    "brahmi":     ("NotoSansBrahmi",     "Noto Sans Brahmi",     [(0x11000, 0x1107F)]),
    "grantha":    ("NotoSansGrantha",    "Noto Sans Grantha",    [(0x11300, 0x1137F), (0x0964, 0x0965)]),
    "devanagari": ("NotoSansDevanagari", "Noto Sans Devanagari", [(0x0900, 0x097F), (0xA8E0, 0xA8FF)]),
    "tamil":      ("NotoSansTamil",      "Noto Sans Tamil",      [(0x0B80, 0x0BFF)]),
    "telugu":     ("NotoSansTelugu",     "Noto Sans Telugu",     [(0x0C00, 0x0C7F)]),
    "kannada":    ("NotoSansKannada",    "Noto Sans Kannada",    [(0x0C80, 0x0CFF)]),
    "malayalam":  ("NotoSansMalayalam",  "Noto Sans Malayalam",  [(0x0D00, 0x0D7F)]),
    "bengali":    ("NotoSansBengali",    "Noto Sans Bengali",    [(0x0980, 0x09FF)]),
    "gujarati":   ("NotoSansGujarati",   "Noto Sans Gujarati",   [(0x0A80, 0x0AFF)]),
    "gurmukhi":   ("NotoSansGurmukhi",   "Noto Sans Gurmukhi",   [(0x0A00, 0x0A7F)]),
    "odia":       ("NotoSansOriya",      "Noto Sans Oriya",      [(0x0B00, 0x0B7F)]),
    "sinhala":    ("NotoSansSinhala",    "Noto Sans Sinhala",    [(0x0D80, 0x0DFF)]),
    "meitei":     ("NotoSansMeeteiMayek","Noto Sans Meetei Mayek",[(0xABC0, 0xABFF)]),
    "olchiki":    ("NotoSansOlChiki",    "Noto Sans Ol Chiki",   [(0x1C50, 0x1C7F)]),
}

# always also keep space + basic punctuation so mixed strings don't drop them
COMMON = [(0x0020, 0x0040), (0x2000, 0x206F)]


def url_for(repo):
    return f"{BASE}/{repo}/unhinted/ttf/{repo}-Regular.ttf"


def unicodes_for(ranges):
    us = []
    for (lo, hi) in list(ranges) + COMMON:
        us.extend(range(lo, hi + 1))
    return us


def bundle_one(key, repo, cssname, ranges, tmpdir):
    ttf_url = url_for(repo)
    src = os.path.join(tmpdir, f"{repo}.ttf")
    urllib.request.urlretrieve(ttf_url, src)

    out = os.path.join(OUT, f"{repo}-Regular.woff2")
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.desubroutinize = True
    opts.layout_features = ["*"]        # KEEP shaping features — critical for Indic
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    opts.recalc_bounds = True
    opts.drop_tables = []               # keep GSUB/GPOS/GDEF for conjuncts/reordering

    font = subset.load_font(src, opts)
    subsetter = subset.Subsetter(options=opts)
    subsetter.populate(unicodes=unicodes_for(ranges))
    subsetter.subset(font)
    subset.save_font(font, out, opts)

    # count glyphs + size for the manifest
    tf = TTFont(out)
    nglyphs = len(tf.getGlyphOrder())
    size = os.path.getsize(out)
    return {"file": os.path.basename(out), "css_family": cssname, "glyphs": nglyphs, "bytes": size}


OFL_HEADER = """These fonts are the Noto Sans family from the Noto Project (Google),
subset for self-hosting by bundle_noto_fonts.py.

All Noto fonts are licensed under the SIL Open Font License, Version 1.1.
Full text: https://openfontlicense.org/open-font-license-official-text/
Upstream:  https://github.com/notofonts/notofonts.github.io
Copyright  The Noto Project Authors (https://github.com/notofonts).

Subsetting keeps the OpenType layout tables (GSUB/GPOS/GDEF) so that Indic
conjuncts, reordering and vowel-mark positioning render correctly.
"""


def main():
    manifest = {}
    total = 0
    with tempfile.TemporaryDirectory() as tmp:
        for key, (repo, cssname, ranges) in FONTS.items():
            try:
                info = bundle_one(key, repo, cssname, ranges, tmp)
                manifest[key] = info
                total += info["bytes"]
                print(f"  ✓ {key:11} {info['css_family']:24} {info['glyphs']:>4} glyphs  {info['bytes']:>8,} B")
            except Exception as e:
                print(f"  ✗ {key:11} FAILED: {e}")
    with open(os.path.join(OUT, "OFL.txt"), "w") as f:
        f.write(OFL_HEADER)
    with open(os.path.join(OUT, "MANIFEST.json"), "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"\n  bundled {len(manifest)} scripts · {total:,} bytes total · SIL OFL 1.1")
    print(f"  -> {os.path.relpath(OUT, HERE)}/")


if __name__ == "__main__":
    main()
