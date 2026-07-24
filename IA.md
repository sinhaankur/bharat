# Information Architecture — India District Atlas

The whole project, in one map. **Single source of truth for structure:** the nav lives
in `site-nav.js` (edit there, every page + the sitemap footer update); the crawlable
list is `sitemap.xml`. This doc is the human overview.

---

## The spine: 5 top-level nav groups

```
Engines · Explore · 3D · Data · About
```

### 1. Engines — the 7 lenses the atlas reads India through
The conceptual spine (see `ENGINES.md`). `engines.html` is the hub.
- Survey (origin) · Country · Development · Climate · Land-Zoning · Corruption · News
- Each `engine-<slug>.html` renders from `engines-data.js` via `engine.js` (one template).

### 2. Explore — the views & tools
- **Map** (`index.html`) — the flat Leaflet atlas; state choropleth + district drill,
  layers panel (basemaps/overlays/colour-by), view-ranking side panel.
- Explore / query · The feed · Timeline · Analysis · The mesh · Chain of command
- **Built where water returns** (`encroachment-atlas.html`) — the 16 encroachment cases.
- History race · India vs world · Share

### 3. 3D — the three-dimensional views
- **India in 3D — states & rivers** (`india-3d.html`) — the **GLOBE** (see layers below).
- 3D topography (`terrain-3d.html`) — real elevation surface + sea-level slider + flood sim.
- India by constraint (`atlas-3d.html`) — states extruded by development constraint.
- Flood explorer (`flood-3d.html`) — raise water over any district's terrain.

### 4. Data — get it & audit it
- Knowledge base · Data & API · Sources (`references.html`) · Provenance ledger · For organisations

### 5. About — the project
- How it works · Methodology & disclaimer · Privacy & policy · Site map · Compare: US · GitHub

---

## The globe (`india-3d.html`) — layer stack

Everything is on ONE real-Earth globe; each layer sourced-or-a-declared-gap.

| Layer | Control | Source | Status |
|---|---|---|---|
| Real Earth (day/night/clouds) | always on | Solar System Scope / NASA (CC BY 4.0) | real imagery |
| World country outlines | always on | Natural Earth 110m | real |
| India states (raised by data) | Colour by / Height | india-states.geojson + india-fiscal.json | real |
| Rivers | Rivers | india-rivers.geojson (NE 10m) | real |
| Seasonal river flow | Month | IMD monsoon calendar | timing real, magnitude illustrative |
| Highways | Highways | india-roads.geojson (NE) | real |
| Railways | Railways | india-railways.geojson (NE) | real |
| Lakes | Lakes | india-lakes.geojson (NE) | real |
| Zones (CRZ/flood/unsafe/…) | Zones | india-zones.json | real flags, centroid placement |
| Major cities | Cities | 15 metros | real |
| Illegal habitation | Illegal habitation | encroachment-cases.json (16) | real, sourced cases |
| Air quality (PM2.5) | Air quality / live AQI | india-aqi.json + WAQI (opt-in key) | annual real; live opt-in |
| Impact simulator | Impact | sealevel-exposure.json (DEM) | real elevation, bathtub model |

**Declared gaps (not shown, not faked):** agriculture zones · zoning history 1900→now ·
per-river discharge · physics-grade flooding · full universe of land-litigation cases.

---

## Data files → what uses them
- `district-ledger.json` (8.7 MB) — the money/dimension spine; loaded background, not first paint.
- `india-fiscal.json` / `india-extras.json` — state fiscal + governance (first-paint critical).
- `*.geojson` — boundaries (states, districts/, subdistricts/) + globe vectors (rivers/roads/rail/lakes/world).
- `safety.json` · `sealevel-exposure.json` · `india-zones.json` · `india-aqi.json` · `encroachment-cases.json`
- Generators: `gen_*.py` / `build_*.py` (each output regenerable; heavy artifacts gitignored).

## Rules that hold everywhere
- **Sourced-or-a-gap** — every figure cites a source or is a declared gap; never invented.
- **One nav source** — `site-nav.js`; don't hardcode nav in pages.
- **Open-or-keyed** — free/open data ships; anything paid/live (Mapbox HD, live AQI) is
  opt-in with the user's own key, stored in-browser, never committed.
- **Full claimed boundary** — India maps include PoK + Aksai Chin (state geojson).
