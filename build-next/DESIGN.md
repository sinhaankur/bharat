# Bharat — design and build handover

Version of 21 November 2026. This file is the brief for whoever (or whichever coding agent) merges this work into `github.com/sinhaankur/bharat`.

## 1. What is in this package

| Path | What it is |
| --- | --- |
| `site/` | The built site: 242 HTML pages, `css/site.css`, `js/site.js`, `js/nav.js`, `js/base.js`, `js/districts.js`, `sitemap.xml`, `robots.txt`. Static; open `site/index.html` over any web server. |
| `src/gen.py` | The generator. Reads the repo's JSON and writes every page except the front page's WebGL code. |
| `src/temples.py` | Measured temple drawings (SVG) from `temple_dims.json`. |
| `src/dsys.py` | Design-system plates, palette roles, contrast maths, pattern sketches. |
| `src/cluster.py` | Groups `news-feed.json` items into stories with lean counts, chains and relations. Writes `src/inputs/stories.json`. |
| `src/atlas_data.py` | Projects state outlines, rivers, heritage, edicts, quakes and news points. Writes `atlas.json`. |
| `src/css/site.css`, `src/js/site.js` | The shared stylesheet and script (the design system in code). |
| `src/inputs/` | Prepared inputs: `atlas.json`, `stories.json`, `tribes.json`, `disputed.geojson` (Natural Earth), `index.source.html` (the front page). |
| `assets/` | `seal.svg` (logo), `icons.svg` (12 Mauryan icons), `tokens.json`, `tokens.css`. |
| `IDEAS.md` | Backlog of ideas, in priority order. |

### Rebuild

```bash
cd src
BHARAT_REPO=/path/to/bharat BHARAT_OUT=../site python3 gen.py
# refresh news stories first when the feed changes:
BHARAT_REPO=/path/to/bharat python3 cluster.py
```

Python 3.10+, standard library only. The build prints a broken-link count and a count of encyclopedia links; both must be 0.

### Deploy without breaking the live site

Many filenames here match existing pages (`ancient-india.html`, `feed.html`, `tribes.html`…). Put `site/` in a subfolder (suggested: `next/`) until the 20 entrance-only pages are rebuilt. Those pages link to the existing interactives at `https://sinhaankur.github.io/bharat/<page>`; `LIVE` at the top of `gen.py` sets that base. When this replaces the root, move the old interactives to `legacy/` and change `LIVE` to match.

## 2. Rules the build must keep

1. **Sourced, or it is a gap.** No number is estimated to fill a hole. Gaps render as a dashed amber chip (`.chip`).
2. **Fact and framing stay apart.** Commentary is labelled (`framing`, `commentary`, "the atlas's own analysis").
3. **Source tiers:** T1 government PDF, T2 government web, T3 encyclopedia (discovery only, never linked), T4 news. `src()` in `gen.py` strips any wiki URL and prints the name only.
4. **No emoji on branded surfaces.** `clean()` strips them from data.
5. **Independent, non-commercial, not affiliated with any government body** — in the footer of every page.
6. **One name and one home per page.** `DOORS` in `gen.py` is the single source for header, menus, search, footer, site map, breadcrumbs and `sitemap.xml`.

## 3. Information architecture

Six doors, each a question. 53 named views, plus generated detail pages.

### Today — "What is happening, and who is telling it?" (`today.html`, icon `i-edict`)

| Page | Name | Status |
| --- | --- | --- |
| `news-journey.html` | The News Journey | rebuilt from data |
| `feed.html` | Today's news | rebuilt from data |
| `feed.html#bias` | The spin check | rebuilt from data |
| `timeline.html` | How it built up | rebuilt from data |
| `articles.html` | Analysis | rebuilt from data |

### Money and power — "Where does public money go, and who answers for it?" (`money.html`, icon `i-bull`)

| Page | Name | Status |
| --- | --- | --- |
| `money-map.html` | The money map | rebuilt from data |
| `state-of-india.html` | Which states carry the country | rebuilt from data |
| `explore.html` | Ask your own question | entrance only: links out to the existing interactive |
| `command-chain.html` | Who's in charge | rebuilt from data |
| `officials.html` | Officials to track | rebuilt from data |
| `mesh.html` | How it all connects | entrance only: links out to the existing interactive |
| `engines.html` | The 7 engines | entrance only: links out to the existing interactive |
| `global.html` | India vs the world | rebuilt from data |
| `geopolitical-chess.html` | The geopolitical board | rebuilt from data |
| `usa.html` | Compare with the US | entrance only: links out to the existing interactive |
| `hero.html` | The whole atlas on one screen | entrance only: links out to the existing interactive |

### Land and water — "What is the ground like, and where is it unsafe to build?" (`land.html`, icon `i-tree`)

| Page | Name | Status |
| --- | --- | --- |
| `encroachment-atlas.html` | Built where water returns | rebuilt from data |
| `terrain-3d.html` | The land in 3D | entrance only: links out to the existing interactive |
| `flood-3d.html` | Raise the water | entrance only: links out to the existing interactive |
| `quake-tsunami.html` | Earthquakes and tsunamis | rebuilt from data |
| `atlas-3d.html` | India by constraint | entrance only: links out to the existing interactive |
| `india-3d.html` | The globe | entrance only: links out to the existing interactive |
| `globe-map.html` | Globe to flat map | entrance only: links out to the existing interactive |

### The long story — "How did we get here?" (`story.html`, icon `i-lion`)

| Page | Name | Status |
| --- | --- | --- |
| `ancient-india.html` | 5,000 years, one timeline | rebuilt from data |
| `ashoka.html` | Ashoka's empire | rebuilt from data |
| `heritage-atlas.html` | Temples and sacred ground | rebuilt from data |
| `temple-forms.html` | How temples are shaped | rebuilt from data |
| `cave-walk.html` | Walk inside a temple | entrance only: links out to the existing interactive |
| `heritage-3d.html` | Temples in 3D | entrance only: links out to the existing interactive |
| `deep-history.html` | Who we are, in DNA | rebuilt from data |
| `social-fabric.html` | The social fabric | entrance only: links out to the existing interactive |
| `atrocities.html` | History's deadliest events | rebuilt from data |
| `history.html` | History race | entrance only: links out to the existing interactive |

### Words and craft — "How do we speak, write and make?" (`words.html`, icon `i-lotus`)

| Page | Name | Status |
| --- | --- | --- |
| `languages.html` | Languages and scripts of Bharat | rebuilt from data |
| `journey.html` | The journey of a word | entrance only: links out to the existing interactive |
| `scripts.html` | The script family tree | rebuilt from data |
| `vedas.html` | One text, many tongues | rebuilt from data |
| `library.html` | Reading room | rebuilt from data |
| `tribes.html` | The tribes that made it | rebuilt from data |
| `indic-design-systems.html` | Indic design systems | rebuilt from data |
| `design-systems.html` | India by design systems | rebuilt from data |
| `design-system.html` | Atomic reference | entrance only: links out to the existing interactive |
| `canvas.html` | The canvas | entrance only: links out to the existing interactive |

### Receipts — "How do you know?" (`receipts.html`, icon `i-jali`)

| Page | Name | Status |
| --- | --- | --- |
| `how-it-works.html` | How it works | rebuilt from data |
| `about.html` | Methodology and honesty | rebuilt from data |
| `knowledge.html` | The data and sources | rebuilt from data |
| `provenance.html` | Every figure to its source | rebuilt from data |
| `references.html` | Sources | rebuilt from data |
| `data.html` | Get the data | rebuilt from data |
| `for-organisations.html` | For organisations | entrance only: links out to the existing interactive |
| `share.html` | Share | entrance only: links out to the existing interactive |
| `privacy-policy.html` | Privacy and policy | entrance only: links out to the existing interactive |
| `sitemap.html` | Site map | rebuilt from data |

### Generated detail pages (drill-down)

| Pattern | Count | Built from | Linked from |
| --- | --- | --- | --- |
| `site-<id>.html` | 137 | `heritage-sites.json` | heritage table, map points, temple plates, state pages |
| `state-<name>.html` | 36 | `india-fiscal.json`, `fiscal-events.json`, `officials.json`, `district-ledger.json`, `encroachment-cases.json`, `heritage-sites.json` | state table, state map detail panel, site pages |
| `ds-<name>.html` | 10 | 6 tribes (`tribes.html` data) + 4 `theme-*.css` | `tribes.html`, `design-systems.html` |

Front page: `index.html` (WebGL story of 13 eras, "Vedic and Mauryan India" focus band, map, news, everything index). Its source is `src/inputs/index.source.html`; `gen.py` only rewrites its links and nav.

## 4. Visual system

### Colour tokens (`assets/tokens.css`)

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#120d0a` | page ground |
| `--deep` | `#0b0806` | header, footer, deepest ground |
| `--card` | `rgba(24,16,13,.82)` | cards, tables, panels |
| `--ink` | `#f4efe4` | headings, primary text |
| `--soft` | `#c9b89d` | body text |
| `--gold` | `#f0b429` | links, accents, primary buttons |
| `--gold-deep` | `#cc8900` | seal, rules |
| `--gilt` | `#e4c069` | labels, Indic specimens |
| `--line` | `rgba(201,162,39,.26)` | borders |
| `--hair` | `rgba(244,239,228,.08)` | row dividers |
| `--era` | per door | section accent |

Door accents (`body[data-door="n"]` sets `--era`): Today `#e8dcc0`, Money and power `#f0b429`, Land and water `#6fb7c9`, The long story `#e0764f`, Words and craft `#a9c184`, Receipts `#c9bda6`.

Data colours: sacred sites `#f0b429`, edicts `#5f9fd6`, water cases `#9fd08a`, earthquakes `#e0603f`, news `#e8dcc0`. News lean: left `#5f9fd6`, centre `#d9d2c0`, right `#d9603f`, state media `#9fb37a`, unassessed `#5a5048`. Gap/estimate chip `#e6a35a`; sourced chip `#9fd0ae`. Choropleth ramp `#2a1d15` → `#f0b429`, missing `#1a1310`.

### Type

| Role | Family | Notes |
| --- | --- | --- |
| Display | Fraunces 500 | h1 `clamp(40px,6vw,76px)`/1.02, h2 `clamp(28px,3.6vw,42px)`/1.08, tracking −0.02em |
| Accent word | Instrument Serif italic, gold | one `<em>` per heading, written `*word*` in `TITLES` |
| Text | Inter 400/600 | 17px/1.6; lede 20px/1.5 |
| Labels | JetBrains Mono 500 | 11–12px, uppercase, tracking 0.12–0.14em |
| Devanagari display | Rozha One | front page |
| All scripts | Noto Sans (Devanagari, Bengali, Gurmukhi, Gujarati, Oriya, Tamil, Telugu, Kannada, Malayalam, Sinhala, Brahmi, Grantha) | `--scripts` |

Fonts load from Google Fonts. **To do:** self-host them (the repo already has `assets/fonts/noto` and `vendor/fonts`) so the no-tracking claim holds.

### Layout

Content width 1180px, side padding `max(4vw,16px)`. Radius 4px (6px on plates). Sections `padding:44px 0`. Breakpoints: 1080px (door nav collapses to menu button), 820px (two-column blocks stack). Body and `main` use `overflow-x:clip`. Every page is checked for no sideways scroll at 1280 and 400px.

### Logo and icons

- `assets/seal.svg`: gold rings, 24 sun rays, a centre glyph that cycles भ ভ ਭ ભ ଭ భ ಭ ഭ every 1.4s, two curved lines. Wordmark "Bharat" with a gold full stop, then "INDIC DESIGNS" in mono caps (hidden under 1380px).
- `assets/icons.svg`: `i-chakra i-bull i-sun i-tree i-bell i-jali i-lotus i-lion i-edict i-pillar i-stupa i-torana`. `site.js` inlines them (do not use `<use href>`; it rendered as dots in at least one browser).

## 5. Components (class names in `site.css`)

| Component | Class | Notes |
| --- | --- | --- |
| Header | `.hd`, `.dn`, `.menu`, `.lang`, `.hbtn` | sticky; shrinks after 30px; door menus on hover/focus |
| Search overlay | `.ov`, `.ovgrid` | opens on Search, the menu button, or `/`; Esc closes |
| Page hero | `.crumb`, `.hero`, `.kick`, `.lede`, `.how`, `.rule` | `.how` is the "How we know" aside from `page-briefs.json` |
| Section | `section.b`, `.sub`, `h2`, `.p`, `.note` | built by `sec()` |
| Stat tiles | `.tiles`, `.tile`, `.tile.gap` | `data-n` counts up on reveal |
| Card | `.card`, `.k`, `.f`, `.go` | link cards lift 2px |
| Chips | `.chip` (gap), `.chip.t` (tier), `.chip.ok` (sourced) | |
| Table | `.tblw`, `table.sort`, `input.filter` | click a header to sort; `data-v` holds the numeric sort value |
| Point map | `[data-map]`, `.mapsvg`, `.pt`, `.detail`, `.chips` | layers as JSON in a child `<script>`; uses `window.BASE` |
| Area map | `[data-choro]`, `.st.ch`, `.legend` | states or districts (`geo:"DIST"`), metric chips |
| Held areas | `.held` | hatched; drawn on every map from `BASE.held` |
| Timeline spine | `.spine`, `.era`, `.facets` | facets are `<details>` with evidence |
| Story rail | `.rail`, `.two`, `ol` | promise/result/cost/impact, then dated steps |
| News stories | `[data-stories]`, `.story`, `.bias`, `.cov`, `.daybars`, `.nbar` | rendered client-side from inline JSON |
| Temple plate | `.tplate`, `svg.pl`, `.ln .fine .gh .dim .lead` | `.dim` blue = measured; `.gh` dashed = lost/estimated |
| Design-system plate | `.dsp`, `.sysc`, `.band` | themed with `--pg --pi --pa --p3` |
| Tree | `.tree`, `.nd`, `.nd.dead` | languages and scripts |
| Verse | `.verse`, `.dv`, `.ia`, `.tr` | |
| Next/previous | `.nextprev` | within a door |
| Footer | `.fcols`, `.saw`, `.base` | six door columns, saw-tooth rule, script baseline |

## 6. Motion

Easing `cubic-bezier(.16,1,.3,1)` everywhere. All motion is off under `prefers-reduced-motion`.

**Micro:** reading-progress line (`.prog`, `--sp`); cursor-following glow on cards/tiles (`--mx`,`--my`); 0.97 press scale on buttons; links underline by drawing in; menu items stagger 18ms; selected map point pings once; detail panel fades in (`.flash`); bias bars and day bars grow in.

**Deep (scroll-linked, set by one rAF handler writing `--sp`, `--sy`, `--hy`, `--fill`):** door emblem behind the hero (`.sigil`, 7% opacity, `z-index:-1`) draws in and drifts; hero eases away; spine and story rails fill with light; map areas fade in north to south (`--w`); heading accent word gets a gold underline sweep; background lamps (2D canvas, 34 motes at three depths) shift with scroll and pointer.

**Page change:** 180ms fade out, 450ms fade in (`.wipe`).

**Front page only:** Three.js r128 with `GPUComputationRenderer` (128² particles, 96² on phones), thirteen target shapes, per-era tint, post pass with gold ink-bleed. See the "Code deep dive" doc for the pipeline. The inner pages do not use WebGL yet.

## 7. Data mapping (page → repo files)

| Page | Reads |
| --- | --- |
| `feed.html`, `today.html` | `news-feed.json` via `cluster.py`, `outlets.json`, `news-bubbles.json` |
| `news-journey.html`, `timeline.html` | `fiscal-events.json` |
| `money-map.html` | `districts/*.geojson`, `district-pop.json`, `district-ledger.json`, `india-fiscal.json`, `officials.json`, `encroachment-cases.json`, `coverage.json` |
| `state-of-india.html`, `state-*.html` | `india-fiscal.json` plus the files above |
| `command-chain.html` / `officials.html` | `pay-scales.json` / `officials.json` |
| `global.html`, `geopolitical-chess.html` | `global-indicators.json`, `geopolitics.json` |
| `encroachment-atlas.html`, `quake-tsunami.html` | `encroachment-cases.json`, `india-earthquakes.json`, `tsunamis.json` |
| `ancient-india.html`, `ashoka.html` | `ancient-india.json`, `ashoka-edicts.json` |
| `heritage-atlas.html`, `site-*.html` | `heritage-sites.json` |
| `temple-forms.html` | `temple_dims.json` |
| `deep-history.html`, `atrocities.html` | `dna-shifts.json`, `atrocities.json` |
| `languages.html`, `scripts.html`, `vedas.html` | `scripts.json`, `etymologies.json`, `vedas.json` |
| `tribes.html`, `ds-*.html` | `TRIBES` array in the repo's `tribes.html`, `theme-*.css` |
| `indic-design-systems.html` | `colour-stories.json` |
| `provenance.html`, `references.html`, `knowledge.html`, `about.html` | `provenance.json`, `coverage.json` |
| every page hero | `page-briefs.json`, `nav-data.js` |
| all maps | `india-states.geojson`, `india-rivers.geojson`, Natural Earth disputed areas |

## 8. Decisions the owner still has to make

1. **News approval rule.** `feed.html` shows headlines from `news-feed.json` that no curator has approved; the repo's rule says nothing shows until `moderation == "approved"`. The page carries a "not yet reviewed" notice. Either keep that, or filter `cluster.py` to approved items.
2. **Hindi wording** in `HI` (top of `site.js`) was written by the model and needs a native review. Only the interface is translated, not page content.
3. **The 22 scheduled languages table** on `languages.html` uses family and script from general reference, not from a repo data file. Add a sourced file or remove the columns.
4. **Territory section.** Figures (78,000 / 38,000 / 5,180 sq km) and the position quoted are from Lok Sabha replies by the Ministry of External Affairs (Unstarred Q.1740 of 27 July 2016; Q.2793 of 11 August 2010). Outlines are Natural Earth's, approximate, and overrun the repo's own state outline slightly.

## 9. Known gaps and limits

- 20 pages are entrance-only (listed above); their interactives are not rebuilt.
- News grouping is English only and by headline matching; some groupings will be wrong. No images. Snapshot to 18 November 2026; not scheduled.
- About 75 districts have no population match (name differences between `districts/*.geojson` and `district-pop.json`).
- Health and income on the district map are state figures repeated per district, as in the ledger.
- Temple outlines are schematic; only the blue dimensions are measured. Martand and Ranakpur have counts only.
- Tribe pattern panels are original sketches, not reproductions. 16 further traditions are listed as named gaps.
- Tested in headless Chrome at 1280 and 400px only. Not tested in Safari or Firefox. The test browser lacked the web fonts.
- Bringing the original design-system pages in (iframes of `design-system.html`, `ds-chola.html` etc. under `orig/`) works: run `EMBED=1 python3 gen.py`. It was not published.

## 10. Wiring it to update itself

In `.github/workflows` after `ingest_news.py`: run `src/cluster.py`, then `src/gen.py`, commit `next/`. `atlas_data.py` only needs re-running when heritage, edict, quake or boundary files change.
