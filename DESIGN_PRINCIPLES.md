# India Fiscal Map — Design Language & Editorial Principles

Our own house style, distilled from the best of explainer journalism (Vox), the
open-knowledge tradition (Wikipedia), and multi-source news framing (Ground News).
We reference their *conventions and UX principles* — never their assets, code, or content.

---

## 1. Brand — aligned to **sinhaankur.com**

The atlas is an extension of the **sinhaankur.com** design framework (Ankur Sinha ·
Design × Engineering × AI): warm off-white paper, an **amber-gold** accent, and a
serif-forward type system. The gold reads as turmeric/marigold — at once the
personal brand and unmistakably Indian. Ink is the voice; gold is the accent.
**The live reference is [`design-system.html`](design-system.html) — browse it; it renders from the real stylesheet.**

**Core color tokens** (defined once in `styles.css` `:root`; the whole site re-skins here):

| Token | Value | Use |
|---|---|---|
| `--brand` | `#262320` warm ink | headlines, links, primary brand voice |
| `--brand-ink` | `#0a0a0a` near-black | hovers, deep headlines |
| `--accent` | `#cc8900` amber-gold (turmeric) | calls-to-action, emphasis, links, live/alert |
| `--accent-ink` | `#a06b00` deep amber | accent hovers |
| `--accent-tint` | `#f7ecd2` | pale gold wash |
| `--background` | `#f6f5f1` warm off-white | page paper (matches sinhaankur.com) |
| `--foreground` | `#1a1917` near-black | body ink |
| `--card` / `--surface` | `#fbfaf7` | cards, chips, menus |
| `--muted` | `#ece9e2` | panels |
| `--muted-foreground` | `#6b665e` | secondary text |
| `--border` / `--border-strong` | `#d6d0cb` / `#c3bcb2` | warm hairlines |
| `--positive` | `#00bb7f` emerald | positive / good |
| `--indigo` | `#1447e6` blue | secondary data hue |

Dark mode (`html.theme-dark`) matches sinhaankur.com: **near-black** paper
(`#0a0a0a`), off-white ink (`#fafafa`), amber-gold glow (`#efa810`).

**Type (matches sinhaankur.com):** display serif **Fraunces** (`--font-display`)
for headlines, **Instrument Serif** (`--font-italic`) for italic display, clean sans
**Inter** (`--font-sans`) for body, **JetBrains Mono** (`--font-mono`) for
labels/eyebrows/data. Use the **type scale** (`--fs-3xs … --fs-3xl`, ~1.2 ratio) —
never ad-hoc px. Reading measure `--measure: 42rem`.

**Scales (all in `:root`):** spacing `--sp-1 … --sp-12` (4px base) · radius
`--radius-sm/‑/‑lg/‑full` · elevation `--shadow-xs … --shadow-xl` (cards rest at
`xs`, lift to `lg` on hover) · motion `--ease-out`/`--dur-1…4`.

**Discipline:** one accent, warm whitespace, hairline rules, few borders. Colour
carries meaning (**teal = us/navigation, terracotta = action/alert**) — never decoration.
Every control gets a `:focus-visible` ring; every animation honours reduce-motion.

---

## 2. Explainer principles (the Vox lesson: *clarity over cleverness*)

1. **Lead with the question the reader actually has.** Headline = the thing they'd Google.
2. **One idea per section.** A kicker (eyebrow) names it; the H2 states it; the lede answers it.
3. **Show, then tell.** Chart/map first, prose second. Every figure is annotated.
4. **Card-based discovery.** The homepage is a grid of story cards (image + tag + headline),
   each a doorway. No walls of links.
5. **Progressive depth.** Skimmable top → detail on demand (hover, expand, deep-link).
6. **Plain language.** Short sentences. Define jargon inline. Numbers in context (per-capita, share).

## 3. Verifiability principles (the Wikipedia lesson: *cite or it didn't happen*)

1. **Sourced, or it's a gap.** Every figure links to a government/court/peer-reviewed source,
   or is explicitly marked a gap. Never fabricate to fill a cell. (Existing project rule.)
2. **Neutral point of view.** Present the record; label framing as framing. Multi-actor, not one-sided.
3. **Attribution over assertion.** "The NCRB reports X" beats "X is true."
4. **A visible provenance trail.** provenance.html / references.html — the reader can audit us.
5. **Corrections are first-class.** When we're wrong, we fix it and say so.

## 4. Multi-source news principles (the Ground News lesson: *who's telling you, and what's missing*)

1. **Bias is shown, not hidden.** A media-lean bar (left/centre/right) on clustered coverage.
2. **Blindspot detection.** Flag stories one side is ignoring.
3. **Facts vs framing, side by side.** Spin-proof numbers next to the contested narrative.
4. **Cluster by event/place**, not by outlet — the reader compares.
5. **Ownership & funding transparency** for outlets we aggregate.

---

## 5. Component vocabulary (in styles.css, `ed-` prefix)

- `.ed-hero` / `.ed-hero-grid` — split hero (copy + art)
- `.ed-kicker` — teal eyebrow with a clay tick
- `.ed-h1 / .ed-h2 / .ed-lede` — editorial headline scale
- `.ed-cards` + `.ed-card` — the story-card grid (art / tag / headline / meta arrow)
- `.ed-feature` — asymmetric big-feature card
- `.ed-stats` / `.ed-stat` — by-the-numbers strip
- `.ed-pullquote` — display-serif pull quote with a clay rule
- `.ed-article` — reading-measure article body
- `.ed-btn` (`--primary` clay / `--ghost` / `--dark` teal) — buttons

## 6. Data-viz / map style ("map everything in that style")

- Light paper canvas, teal land / mist panels, clay for the active/selected series.
- Circle area ∝ magnitude; colour = one honest dimension (region, category, or value ramp).
- Hairline graticule, serif value labels, a legend that names the colour axis.
- Selection **highlights across every view** (map + list + chart stay in sync).
- The atrocities world map is the reference implementation.

## 7. Motion (page animation assets)

- Purposeful, not decorative: reveal on scroll, gentle pin-pulses, number count-ups.
- **Always honour `prefers-reduced-motion`** (the a11y panel can force it off).
- SVG/CSS-first (no heavy JS libs); animations degrade to static gracefully.

---

## 8. What we borrow vs. what stays ours

We borrow **conventions** (grid, card patterns, bias bars, citation discipline, explainer
structure). We do **not** copy their logos, typefaces-as-trademark, colour marks, article
text, or code. The identity — the sinhaankur.com framework (warm paper, amber-gold,
Fraunces + Inter + JetBrains Mono), the wordmark, the voice — is ours.
