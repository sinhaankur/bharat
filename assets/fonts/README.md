# Bharati Inspired — an original display font

**What it is.** An original geometric display typeface, procedurally built by
`build_bharati_font.py`, and *inspired by* the design principles of the
**Bharati link-script** (V. Srinivasa Chakravarthy & team, IIT Madras): an even
monoline stroke, open humanist counters, and — deliberately — **no
Devanagari-style top headline bar** (the *shirorekha*), for a clean, Latin-like
baseline that reads as a bridge between scripts.

**What it is NOT.** It is **not** a copy of the IIT Madras Bharati glyphs (which
are not released as an open font). Every outline here is drawn from scratch in
the build script. We label it *Bharati-inspired* honestly, the same way the rest
of this project separates an established fact from an interpretation.

**Coverage.** Basic Latin: space, A–Z, a–z, 0–9, and common punctuation. This is
a proof-of-concept set designed on a 1000 upm grid; it can be extended toward the
Devanagari/Brahmic ranges later.

**License.** SIL Open Font License 1.1 — see `OFL.txt`. Free to use, study,
modify and redistribute.

**Rebuild.**
```
python3 -m venv .venv-font
.venv-font/bin/pip install fonttools brotli
.venv-font/bin/python build_bharati_font.py
```
Outputs `BharatiInspired-Regular.ttf` and `.woff2` in this folder.
