# Bharat · Indic Designs

> **Sourced, or it's a gap — never fabricated.**

An open, per-district **atlas of India** — its public money and power, its land and rivers,
its history, scripts, tribes and design — paired with an original family of **Indic design
systems**. Author: **Sinhaankur**. Live: <https://sinhaankur.github.io/bharat/>.

Every figure links to a source with a confidence tier (documented = government source /
reported = news only / alleged). Numbers are never invented; a gap is shown as a gap. Bias
labels are an *aggregation of third-party assessments*, never our own verdict.

---

## Two things live here

1. **The classic atlas** (repo root) — the original static HTML/JS site: the interactive
   fiscal map (`classic.html`, driven by `app.js` + Leaflet), the news feed, the 3D heroes,
   heritage, languages, and the standalone design-system pages. Still live at the root.
2. **The generator rebuild** (`build-next/` → `next/`) — a single Python generator rebuilds
   the whole site (267 pages) from the repo's JSON in one coherent design: our brand chrome,
   the **15-skin Indic theme system**, per-door **WebGL**, and the honesty rules baked in.
   Previewable at `/bharat/next/`. This is the direction the site is moving toward.

The generator rebuild is **non-destructive** — it builds into `next/`, so the live root is
never broken mid-migration. The cutover (`next/` → root) is a deliberate, separate step.

---

## The design system

A family of **original design systems drawn from India's own heritage**, documented on the
five Atomic-Design tiers and painted entirely by tokens, so one component set reskins across
every skin:

- **15 Indic skins** — the 4 dynasties (Mauryan / Gupta / Chola / Rajput, each × light/dark)
  + 6 state skins (Kashmir, Tamil Nadu, Kerala, Assam, Nagaland, Rajasthan) + a House skin —
  switchable live from the header (`theme-*.css` + the switcher in `build-next/js/site.js`).
- **The tribes** — 16 folk design systems (Warli, Gond, Mithila, Pattachitra, Bhil, Saura,
  Sohrai, Khovar, Pithora, Toda, Chakhesang Naga, Kurumba, Jadupatua, Mizo, Bodo) + the full
  **727-entry** Scheduled-Tribe index, searchable.
- **The social fabric** of Ashoka's India (priest / merchant / guild / artisan / farmer /
  soldier / officer), and **Kingdoms & flags** (23 princely-state standards).
- **Custom line-icons** in the Mauryan "incised line" style (`mauryan-icons.svg`) — no emoji
  on branded surfaces. The seal logo + **Bharat.** / **INDIC DESIGNS** wordmark.
- Brand: warm **bronze/gold on dark** (and a light register). Type: Fraunces (display),
  Instrument Serif (italic), Inter (UI), JetBrains Mono (labels), Noto Sans (every Indic script).
  Motion on the house ease `cubic-bezier(.16,1,.3,1)`, reduced-motion safe.

---

## Repo structure

```
/                     the classic atlas (live root) — *.html, app.js, styles.css, data *.json
build-next/           the generator rebuild (stdlib Python, no framework)
  gen.py              the generator — builds every page from the repo's JSON into $BHARAT_OUT
  cluster.py          news-feed.json -> story clusters (for the feed/journey)
  atlas_data.py       projects states/rivers/heritage/edicts/quakes -> inputs/atlas.json
  dsys.py temples.py  design-system plates + measured temple drawings
  import_canvas.py    adapt Claude-canvas .dc.html design pages -> our chrome
  render_discover.py  pre-render Discover-by-state + the 727 index + Kingdoms (static, no React)
  render_map.py       host the classic map engine inside the new design (map.html)
  unpack_final.py     unpack the final Claude-design bundle (gzip+base64) -> real pages
  gen_state_skins.py  the 6 canvas state-skin palettes -> theme-<state>.css
  css/site.css        the rebuild's shared stylesheet (+ the Indic skin bridge)
  js/site.js          chrome builder (header/footer/nav/search + the skin switcher)
  js/webgl.js         the shared per-door WebGL canvas (globe/terrain/chakra/field/edicts)
next/                 the BUILT rebuild (267 pages) — the /bharat/next/ preview (git-tracked for Pages)
atlas-app/            a separate Next.js app, deployed at /bharat/app/
.github/workflows/    the bots (below)
```

## Build the rebuild

```bash
# 1. refresh the news clusters (when news-feed.json changes)
BHARAT_REPO=. python3 build-next/cluster.py
# 2. build every page into next/
BHARAT_REPO=. BHARAT_OUT=next python3 build-next/gen.py
# it asserts 0 broken links and 0 encyclopedia links, and prints the page count.
```

Python 3.10+, standard library only. To re-import the design package after a new Claude-design
export, drop the files in `build-next/canvas/` (or run `unpack_final.py <bundle.html> next`)
and re-run `gen.py` — the whole thing flows through the importer -> pre-render -> chrome ->
15-skin -> WebGL -> sitemap.

## The bots (GitHub Actions — no server)

- **`ingest-news.yml`** — every 6h: `ingest_news.py` fetches permitted RSS feeds (link +
  snippet only, never full text) -> `news-feed.json`.
- **`gen-fiscal-events.yml`** — every 6h: `gen_fiscal_events.py` clusters the scheme-anchored
  news into story-chains (`fiscal-events.json`) so the News Journey grows on its own.
- **`social-post.yml`** — scheduled social posts.
- **`deploy-app.yml`** — builds the Next app and assembles the Pages site (root + `/app` + `/next`).

## The one rule

Facts carry a source and a tier; commentary is labelled; figures only when cited, else a gap.
Independent, non-commercial, not affiliated with any government body.

(c) Sinhaankur · Indic Designs.
