# Mauryan → Gupta · Indic Design System — research & spec

A design language spanning the two eras where much of India's visual grammar was set:
the **Mauryan / Ashokan world (3rd c. BCE)** — austere, polished, imperial — and the
**Gupta "golden age" (c. 320–550 CE)** — ornate, serene, devotional, where the free-standing
Hindu temple, refined floral ornament, and the Brahmi→Nagari script line crystallised.
Every element is **sourced from the real artefacts**, then translated into design tokens.

*Status: RESEARCH SPEC. The Mauryan layer is BUILT & applied; the Gupta layer is specced below.*

## 0. The design SPECTRUM — Mauryan ⇄ Gupta

Our two eras are the two ends of one dial. Pick the register per context.

| | **MAURYAN** (imperial) | **GUPTA** (classical/devotional) |
|---|---|---|
| **Feel** | austere, monumental, singular | refined, serene, ornate, warm |
| **Surface** | mirror-polish, smooth | faceted, carved, floral-scrolled |
| **Ornament** | minimal — the lion, the chakra | rich foliate scroll, ornate halos, lotus thrones |
| **Figure** | columnar, impersonal | idealised, tilted, diaphanous drapery, meditative |
| **Architecture** | monolithic pillar | the first stone TEMPLE — Nagara verticality begins |
| **Script** | Brahmi (edicts) | Gupta Brahmi → early Nāgarī |
| **Palette** | buff Chunar stone, chakra blue | Mathura **red/pink sandstone**, Ajanta fresco ochres/reds |
| **Use it for** | data, structure, mastheads, the wordmark | long-form reading, heritage/culture, ornamental frames |

*Sources: Wikipedia — Gupta art; Pillars of Ashoka; Lion Capital; Jali.*

---

## 1. The source material (sourced facts)

### The Pillars of Ashoka
*(Wikipedia: Pillars of Ashoka)*
- **Stone:** polished **Chunar sandstone** — a **buff / tan** hard sandstone with small black
  spots; some pillars in **spotted red-and-white** Mathura sandstone.
- **The "Mauryan polish":** a famous **mirror-like, highly reflective** finish — extraordinary
  precision. → design cue: *smooth, burnished surfaces; subtle sheen, not matte.*
- **Form:** monolithic shafts, **12–15 m** tall, up to 50 tons, **circular, smooth, slightly
  tapering upward.** → *tall, upright, tapering; a sense of the monumental and singular.*
- **Inscriptions:** **Brahmi** script edicts cover the shafts (Prakrit dialects).

### The Capitals
- **Lotiform base:** an **inverted lotus bell** (the "bell base"). → *the lotus/bell as a
  foundational motif.*
- **Abacus:** square-plain or **circular-decorated**, carrying animals + wheels.
- **Crowning animals:** **lion, bull, elephant, horse** — realistic, carved from single stone.
- **Lion Capital of Sarnath:** four lions seated **back-to-back** → adopted as **India's State
  Emblem (1950).** → *the four-fold radial symmetry; the lion as the mark.*

### The Dharmachakra (the wheel)
- **24 spokes**; symbol of dharma / cosmic order / law. It is the wheel on the **Indian flag**.
  → *a precise 24-spoke radial motif — dividers, loaders, section marks, the "live" dot.*

### Jali — Indic lattice geometry
*(Wikipedia: Jali)*
- **Perforated stone screens:** interlocking, **repeating geometric units**, high symmetry;
  later **floral / tree-of-life** patterns (Taj Mahal, Sidi Saiyyed).
- **Light is the material:** jali **filters and softens light** into shifting dappled shadow.
  → *use pattern as a light, low-contrast texture — screens, section backgrounds, card fills.*

### Broader Indic motifs (to draw on sparingly)
- **Lotus** (padma) — purity, the bell base. **Paisley / boteh** (mango) — the classic curved
  droplet. **Rangoli / kolam** — radial floor patterns of dots + lines. **Mandala** — concentric
  radial order. **Pietra-dura** inlay — fine geometric/floral stone inlay.

---

## 2. Palette — EXTRACTED from the user's reference photos

Colour-sampled from the reference images (Mauryan architecture + "house style in India").
The signature is **golden sandstone against a strong Indian-sky blue**, with deep interior
maroons and airy neutrals — how heritage monuments actually photograph.

| Token | Hex | Source (sampled) |
|---|---|---|
| `--stone` (paper) | `#e9ddc7` | sandstone monument surface (warm, sunlit) |
| `--stone-2` (panel) | `#dcccae` | stone in shadow |
| `--stone-ink` (text) | `#2a2018` | deep interior / carved shadow |
| `--sky` (accent) | `#3078c0` | **Indian sky blue** — dominant across refs 8/10/14 |
| `--sky-deep` | `#245c98` | deeper blue — hovers |
| `--ochre` (secondary) | `#a8794a` | warm tan / sandstone highlight |
| `--maroon` | `#301818` | temple interior / deep sindoor red (refs 11–13) |
| `--terracotta` | `#a8452a` | fired clay |
| `--blush` | `#f0c0a8` | the peach/blush neutral from the "house style" ref 15 |
| `--sky-mist` | `#d8f0f0` | airy pale sky (ref 15) — light section fills |
| `--gold-leaf` | `#c9a227` | gilding highlight, used rarely |
| `--polish` (sheen) | `rgba(255,252,244,0.55)` | the Mauryan-polish edge highlight |

**Two ways to run it:**
- **Light "sunlit monument":** `--stone` paper, `--sky` accent, `--stone-ink` text, `--sky-mist` section fills.
- **Dark "temple interior":** `--maroon`/`#181818` ground, warm bone ink, `--sky` lifted to `#5f9fd6`, ochre glow.

*(The earlier sandstone-only guess is replaced by this photo-sampled palette. Blue is the signature, not gold.)*

---

## 2b. Gupta palette & motifs (the classical layer)

Where Mauryan is stone-and-sky, **Gupta is warm red sandstone + Ajanta fresco jewel-tones** —
a devotional, ornamented register for long-form and heritage/culture content.

| Token | Hex | Source |
|---|---|---|
| `--gupta-stone` | `#c8664a` | **Mathura red/pink sandstone** — the Gupta Buddha/Vishnu figures |
| `--gupta-rose` | `#d98a6a` | softened red sandstone |
| `--ajanta-ochre` | `#c68a2e` | Ajanta fresco ochre |
| `--ajanta-red` | `#9e3b2e` | Ajanta fresco red (iron oxide) |
| `--ajanta-green` | `#4f6b45` | Ajanta terre-verte |
| `--ajanta-lapis` | `#2a4a7a` | rare blue in the frescoes |
| `--ajanta-ivory` | `#efe3cc` | lime-plaster ground |
| `--halo-gold` | `#cba233` | the ornate radiating halo |

**Gupta motifs → UI**
- **Ornate halo (prabhāvali):** a floral/gem radiating ring — for featured cards, the wordmark surround, avatars.
- **Foliate scroll:** running vine/leaf borders (richer than the Mauryan floral band) — heritage section frames, pull-quotes.
- **Lotus throne:** a seat/plinth ornament under hero blocks and big numbers.
- **Temple superstructure (shikhara):** a tapering, tiered silhouette — a loading/heading motif, the timeline spine, section caps.
- **Ceiling medallion (from Ajanta):** a concentric radial ornament — page-top or footer centrepiece.
- **Diaphanous layering:** soft, translucent overlaps (low-opacity plates) — the "thin drapery" translated to UI depth.

**Register discipline:** Mauryan for the *skeleton* (nav, data, structure), Gupta for the *soul*
(reading, culture, ornament). Never both loud at once.

## 3. Type
- **Display:** keep **Fraunces** (high-contrast serif reads as inscribed/carved). Consider tight
  tracking + small caps for section labels (edict-like).
- **Body:** **Inter** (unchanged) — legibility over flourish.
- **Script accent:** our self-hosted **Brahmi (Noto Sans Brahmi)** for true period flavour, and
  Devanagari where a living script suits — used as *ornament/eyebrows*, never body.
- **Mono:** JetBrains Mono for data (unchanged).

---

## 4. Motifs → components (how the history becomes UI)

| Motif | Where it's used |
|---|---|
| **24-spoke Dharmachakra** | a small SVG wheel as the section divider / loading spinner / the "live" dot / bullet marks |
| **Lion Capital** | the wordmark/brand mark (stylised 4-lion or single lion silhouette, our own drawing) |
| **Lotus bell** | card-corner ornament, footer cap, the base of hero blocks |
| **Jali lattice** | a faint repeating geometric SVG pattern behind panels / section backgrounds — low-contrast, like light through a screen |
| **Pillar / column** | tall vertical rules, the nav underline, timeline spine (a fluted column) |
| **Brahmi glyphs** | eyebrows / kickers / decorative section tags |
| **Edict layout** | long-form pages set like an inscription: justified, ruled margins, carved headers |
| **Mauryan polish** | a subtle top-edge highlight (`--polish`) on cards/buttons for the burnished look |

---

## 5. Texture & finish
- **Grain:** a faint sandstone paper grain (very low-opacity noise) on the background.
- **Edges:** cards/buttons get a 1px `--polish` top highlight + warm shadow = carved-stone feel.
- **Corners:** keep tight radius (0.25rem) — stone, not soft plastic.
- **Lines:** hairline rules in `--stone-ink` at low opacity = incised lines.

---

## 6. Honesty / usage discipline (keep it dignified)
- The Lion Capital & Ashoka Chakra are **India's national emblems** — use respectfully, stylised
  as **our own drawings**, never the official emblem itself (its use is legally restricted).
- Motifs are **ornament and wayfinding**, not decoration-for-decoration — one per context.
- Indic patterns drawn from **multiple eras/traditions** are labelled as *inspired-by*, not
  claimed as a single authentic style.

---

## 7. What to build from this (once approved)
1. `design-system.html` (or a `/design` route) → a **living Ashokan style guide** page.
2. A token block (`--stone / --ochre / --chakra …`) — swap-in via a `theme-ashoka` class so it's
   reversible.
3. SVG assets: the **24-spoke chakra**, a **lion mark**, a **jali tile** (repeating), a **lotus
   bell** — all original drawings.
4. Apply to the Next app (or the static atlas) as an opt-in theme first, then decide.

**Sources:** Wikipedia — *Pillars of Ashoka*, *Lion Capital of Ashoka*, *Ashoka Chakra*, *Jali*;
our own `ashoka-edicts.json` (25 edict sites, the Sarnath capital, Brahmi).
