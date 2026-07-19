# The Engines

The atlas is framed as a set of composable **engines**. Each one reads the same
country — all 35 states/UTs and 594 districts — through a single lens, and they
**mix**: one figure can belong to several at once. A flood-prone ward (Climate) that
sits in a no-build coastal zone (Land-Zoning) where a civic budget was still spent
(Development) and an audit later flagged it (Corruption), reported the next morning
(News), on ground the Survey first measured.

This is a **framing layer** over data and views that already exist — it invents
nothing. Every engine obeys the project's iron rule: **sourced, or it's a gap**
(audit every figure on [`provenance.html`](provenance.html)).

---

## The seven engines

| # | Engine | Reads | Powered by |
|---|--------|-------|-----------|
| 00 | **Survey** (origin) | The map that mapped India — Great Trigonometrical Survey → boundaries, DEM, area | `atlas-3d`, `terrain-3d`, geography dimension |
| 01 | **Country** | How India is constituted; who answers to whom | `command-chain`, protocol layers, `mesh` |
| 02 | **Development** | Money in → what it was for → what got built | money-flow ledger, map views, economy/vehicles/aviation/housing |
| 03 | **Climate** | Where the water goes, and what it takes | `flood-3d`, geography flood/monsoon/low-lying |
| 04 | **Land-Zoning** | What can legally be built here | zoning map facet, CRZ/encroachment/cadastral |
| 05 | **Corruption** | Established findings only — facts, never accusations | accountability arc, delayed-pay/pension chains, prison overcrowding, officials |
| 06 | **News** | What's being said, anchored to place & money | `feed`, "What's new" strip, `timeline` |

**Engine 00 is the ancestor.** The Survey of India / Great Trigonometrical Survey
(1802–1871) triangulated the subcontinent into measurable lines *in order to tax and
govern it*. This atlas is the descendant instrument, turned the other way — mapping
the country to hold that apparatus accountable.

---

## Architecture (how to change it)

Three files, one source of truth. **Edit an engine in one place and it updates
everywhere** — the hub and all deep pages render from the same data.

```
engines-data.js   ← THE source of truth: all 7 engines described once
engine.js         ← shared renderer for a deep page (reads a slug, renders the page)
engines.html      ← the hub (grid of cards) — also reads engines-data.js
engine-<slug>.html ← 7 thin shells; each just sets <body data-engine="slug">
styles.css        ← .eng-* (hub) and .en-* (deep page) blocks
```

### `engines-data.js` — the data

Exposes `window.ENGINES_DATA = { ENGINES, BY_SLUG, get(slug) }`. Each engine object:

| field | purpose |
|---|---|
| `slug`, `num`, `icon`, `accent` | identity. `accent` is an `oklch(...)` colour string used across the card + deep page. |
| `name`, `tagline` | `name` may contain a single `<em>…</em>` (rendered in the accent colour). |
| `origin` | `true` only for the Survey engine (adds the "· ORIGIN" tag + full-width hub card). |
| `lede` | one paragraph — the deep-page hero copy. |
| `maps: [{label, note}]` | **what it maps** — the mechanisms/fields the engine covers. |
| `how: [{h, p}]` | **how it works** — the numbered deep-page sections. |
| `example: {title, body}` | a **real, sourced** worked example. Never invent one. |
| `stat: {value, label}` | one honest headline number. |
| `views: [{href, text}]` | links into the **existing** views that already power the engine. |
| `sources: [{name, tier}]` | source discipline. `tier`: 1 gov/primary · 2 official aggregate · 3 news/moderated · 4 provisional. |
| `related: [slug, …]` | sibling engines it mixes with (rendered as "Mixes with" cards). |
| `facts_only` | set `true` on Corruption — adds the "facts, never accusations" banner. |

### `engine.js` — the renderer

A deep page is a **thin shell**:

```html
<body data-engine="corruption">
  <div id="engine-root"></div>
  <script src="engines-data.js"></script>
  <script src="engine.js"></script>
  <script src="command-palette.js"></script>
  <script src="site-nav.js"></script>
</body>
```

`engine.js` reads the `data-engine` slug, pulls the engine from `ENGINES_DATA`, sets
the page `<title>`/description for SEO, and renders the whole page: hero (with the
accent glow + stat), *what it maps*, *how it works*, the worked example, *see it in
the atlas* (view links), *sources* + *mixes with*, and prev/next sequence nav.
Unknown slug → a graceful "unknown engine" fallback linking back to the hub.

---

## Adding or editing an engine

1. **Edit the data** in `engines-data.js` (add an object to `ENGINES`, or change one).
   Keep the worked `example` a real, cited fact — this is an accountability project.
2. **Add a deep page** (only if it's a new engine): copy any `engine-<slug>.html`
   shell and change `data-engine`. No other code.
3. **Wire discovery**: add the URL to `sitemap.xml`, `sitemap.html`, and the `PAGES`
   list in `command-palette.js`. The hub picks up the new card automatically.
4. **Verify**: `python3 -m http.server` then open the hub + the new deep page. The
   hub card and the deep page must agree, because they read the same data.

---

## The rules every engine obeys

- **Sourced, or it's a gap.** No engine invents a number. Audit them on
  [`provenance.html`](provenance.html) — as of the last build: ~4,900 claims, ~27%
  pinned, **0 unattributed**.
- **The Corruption engine is facts-only.** It never calls a person corrupt. It
  surfaces only what an audit (CAG), a court order, or an RTI reply has **already**
  established — and links to that primary finding. This is a deliberate defamation
  posture, not a limitation of data.
- **News is link-only and attributed.** Headlines link back to the outlet; political
  lean labels are third-party aggregation, explicitly not the project's judgement.

See also: [README.md](README.md), [references.html](references.html) (source
narrative), [`provenance.html`](provenance.html) (machine-walked audit trail).
