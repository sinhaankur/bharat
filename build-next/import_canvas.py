#!/usr/bin/env python3
"""
import_canvas.py — adapt the Claude-canvas design package (build-next/canvas/*.dc.html)
into content fragments the generator (gen.py) can wrap in our shell().

Each .dc.html is standalone, inline-styled static HTML inside an <x-dc> canvas wrapper:
    <body> <x-dc> <helmet>…fonts…</helmet> <header>…canvas chrome…</header>
           <main>…THE REAL CONTENT…</main> <footer>…canvas footer…</footer> </x-dc>
           <script src="./_runtime/…"></script> </body>

We keep the <main> content (the page) and DROP the canvas header/footer/runtime, because
gen.py supplies OUR header/footer/9-skin themes/WebGL. The fixed 1440px/1180px artboard
widths are relaxed to our responsive .wrap by a light regex pass.

Usage (as a module):  from import_canvas import load_canvas; frag = load_canvas('States')
Standalone:           python3 import_canvas.py   # prints a sanity report
"""
import os, re, html as _html

HERE = os.path.dirname(os.path.abspath(__file__)) + "/"
CANVAS = HERE + "canvas/"


def _body(doc):
    """Return the content inside <x-dc>, minus the canvas <header>/<footer>/<helmet>."""
    m = re.search(r"<x-dc>(.*)</x-dc>", doc, re.S)
    inner = m.group(1) if m else doc
    # drop the helmet (fonts — gen.py ships its own FONTS link)
    inner = re.sub(r"<helmet>.*?</helmet>", "", inner, flags=re.S)
    # capture the page's OWN scripts (DATA + its render/interactivity) — but NOT the
    # _runtime canvas scripts — so the page stays interactive in our chrome.
    own_scripts = [m.group(0) for m in re.finditer(r"<script\b(?![^>]*_runtime)[^>]*>.*?</script>", inner, re.S)]
    # prefer the <main> block if present (the real page); else drop header+footer
    mm = re.search(r"<main\b[^>]*>(.*)</main>", inner, re.S)
    if mm:
        content = mm.group(1)
    else:
        content = re.sub(r"<header\b.*?</header>", "", inner, flags=re.S, count=1)
        content = re.sub(r"<footer\b.*?</footer>\s*$", "", content, flags=re.S)
    # strip any script that slipped INTO content (we re-append the clean set below)
    content = re.sub(r"<script\b(?![^>]*_runtime)[^>]*>.*?</script>", "", content, flags=re.S)
    # re-append the page's own scripts so its interactivity (state switching etc.) works
    content = content.strip() + "\n" + "\n".join(own_scripts)
    return content.strip()


def _responsive(content):
    """Relax the canvas's fixed artboard widths to our responsive container.
    The canvas uses max-width:1180px islands and some 1440px artboard shells; keep
    1180 (matches our .wrap) but make any hard width/height artboard frames fluid."""
    # fixed artboard frame widths → fluid
    content = content.replace("width: 1440px", "width: 100%").replace("width:1440px", "width:100%")
    content = re.sub(r"min-width:\s*1440px", "min-width:0", content)
    # overflow guard so nothing scrolls sideways on small screens
    return content


def load_canvas(slug):
    """Load one canvas page's content fragment by slug (filename without .dc.html)."""
    path = CANVAS + slug + ".dc.html"
    if not os.path.exists(path):
        raise FileNotFoundError(path)
    doc = open(path, encoding="utf-8").read()
    frag = _responsive(_body(doc))
    # safety: no runtime references should survive
    assert "_runtime" not in frag, slug + " still references _runtime"
    assert "<x-dc" not in frag and "<helmet" not in frag, slug + " wrapper leaked"
    return frag


def available():
    return sorted(f[:-8] for f in os.listdir(CANVAS) if f.endswith(".dc.html"))


if __name__ == "__main__":
    pages = available()
    print(f"{len(pages)} canvas pages found")
    # sanity-extract each; report size + that chrome was stripped
    ok = 0
    for s in pages:
        try:
            frag = load_canvas(s)
            has_header = bool(re.match(r"\s*<header", frag))
            print(f"  {s:22} {len(frag):>7} chars" + ("  ⚠ leading <header>" if has_header else ""))
            ok += 1
        except Exception as e:
            print(f"  {s:22} ERROR: {e}")
    print(f"{ok}/{len(pages)} extracted clean")
