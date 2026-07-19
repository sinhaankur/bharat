# India District Atlas

> The repo and in-app nav are branded **India Fiscal Map**; the public site is positioned as the **India District Atlas**. Same project — the name grew as the scope did.

An open, per-district atlas of India that puts **money, land, and law side by side** for all **35 states/UTs and 594 districts**: where public money flows, how the physical geography (floods, coastal CRZ zoning, terrain, rainfall) shapes what can be built, and — beside the money — the **health and wealth** of the people who live there.

Everything is **sourced or it's an explicit gap** — never fabricated. A number with no public source stays blank and is *shown* as a gap rather than guessed.

**Live:** https://sinhaankur.github.io/india-fiscal-map/

---

## What it is

A single-screen Leaflet map of India you can recolor by different **layers**, drill from state → district → sub-district, and filter across all 594 districts with a client-side query engine — no backend.

The unifying idea: **break India into pixels of money + chain of command**, then add the layers that explain each pixel — the land under it, the law over it, and the wealth and health around it.

### Map layers (recolor the district polygons)

| Layer | What it shows | Source |
|---|---|---|
| **💰 Money flow** | Headline ₹ into each deep district + a ⚠ ring for fund-freeze / audit flags | District ledger (see below) |
| **Population** | Census 2011 district population | Census 2011 |
| **⚖ Geography & zoning** | "What can be built here" — CRZ, flood-hazard, unsafe/no-development, palaeochannel, encroachment zones, elevation, rainfall band, and a stacked-risk **vulnerability** count | MoEFCC CRZ 2019, CWC/NDMA, SRTM, IMD, NGT/CAG |
| **🩺 Health** | Infant mortality (IMR), stunting, institutional births, immunisation | NFHS-5 (2019–21), state-level |
| **₹ Wealth** | Per-capita net state domestic product + income tier | RBI Handbook of Statistics on Indian States |
| **Language** | Dominant mother tongue / state official language | Census language tables |
| **Politics** | Alignment of the state government with the Union | Public record |
| **📊 Data coverage** | How much of each district is pinned to sources vs still a gap (0–100%) | Derived (`coverage.js`) |

Health and wealth are shown **state-level**, labelled as such; per-district figures are an explicit gap, not invented. Three small UTs (Lakshadweep, Daman & Diu, Dadra & Nagar Haveli) have **no** published NSDP series — the atlas says so rather than omitting the row.

### Explore & query — ask cross-cutting questions

`explore.html` + the map's query panel flatten all 594 districts into one row each and let you **AND / OR** facets to answer questions the map alone can't, e.g.:

> *Coastal Regulation Zone **AND** flood-chronic **AND** fund-freeze* — where do legal risk, physical risk, and money dysfunction overlap?

Facets span legal/zoning (CRZ, unsafe, encroachment zone), flood & water (flood-chronic, monsoon, palaeochannel), terrain (low-lying, high-rain), risk stack (3+ signals), money (fund-freeze, has-ledger), source coverage (well-sourced vs thin), and health & wealth (high IMR, high stunting, lower-income, **income-gap**). Selections are shareable via URL.

---

## The engines

The whole atlas is framed as a set of composable **engines** — each reads the same country through one lens, and they *mix*. This is a framing layer over data that already exists; it invents nothing. See **[ENGINES.md](ENGINES.md)** for the architecture, and **[engines.html](engines.html)** for the hub (each card has a *Deep dive →* into `engine-<slug>.html`).

| # | Engine | Reads |
|---|--------|-------|
| 00 | **Survey** (origin) | The Great Trigonometrical Survey that first mapped India — its heirs (boundaries, DEM, area) still power the map. Mapped the land to tax it; we turn the instrument toward accountability. |
| 01 | **Country** | How India is constituted — Union/State/UT/local, who answers to whom. |
| 02 | **Development** | Money in → what it was for → what got built. |
| 03 | **Climate** | Flood / monsoon / low-lying exposure over the real open DEM. |
| 04 | **Land-Zoning** | What can legally be built here (CRZ, encroachment, cadastral). |
| 05 | **Corruption** | Established findings only — CAG paras, court-ordered arrears, prison overcrowding. **Facts, never accusations.** |
| 06 | **News** | The moderated, attributed feed + the homepage "What's new" strip. |

**One source of truth:** `engines-data.js` describes all seven once; `engine.js` renders each deep page; `engines.html` renders the hub — both read the same data, so editing an engine updates everywhere.

---

## The state-revenue dashboard

The original layer: a state choropleth of **revenue, corruption, and GSDP** across India's states + UTs, FY15 → FY24, with a 10-year time slider straddling the 13th, 14th, and 15th Finance Commission periods.

Selectable views: **Own revenue · Corruption % · GSDP · GDP/person · Revenue/GSDP · Net flow · Devolution in · Contribution out · FC share.**

Click a state for its 10-year sparkline, governance footprint (IAS cadre strength, state employees, CMS-2019 bribe-paid %), department split (back-office vs public-facing), and structural pros / cons.

**Sources:** Finance Commission XIV & XV, RBI Handbook of Statistics on Indian States, MoSPI advance estimates, Union Budget receipts, CBDT / GST Council, CMS-India Corruption Study 2019, DoPT Civil List, Datameet boundaries. Full list + caveats: [references.html](references.html).

> FC horizontal shares are exact; per-state per-year fiscal figures are ±10% approximations, smoothed for year-on-year readability. Contribution-to-Centre is necessarily an estimate (most central tax incidence is destination-blind). Corruption % is 2019, pre-COVID — directional, not current.

---

## District money-flow accountability ledger

Beyond the choropleth, the atlas drills into a **per-district money-flow ledger**: for each district, *who is responsible*, *what money flows in*, *what happened to it*, and *how the system functions or dysfunctions* — plus the **industrial base** (the plants that anchor jobs and tax).

Data lives in [`district-ledger.json`](district-ledger.json); per-post cost-to-government in [`pay-scales.json`](pay-scales.json); the model is documented in [`officials-schema.md`](officials-schema.md) and [`dimensions-schema.md`](dimensions-schema.md).

### Source tiers — *PDF-cited or it's a gap*

Every named figure carries a `source` and a `source_tier`. In the UI, a ⚠ marks tier 3–4 figures awaiting upgrade to a government PDF.

| Tier | Source | Examples |
|---|---|---|
| **1** | government PDF | Pay Commission, gazette, CAG, Finance Commission, PIB |
| **2** | government HTML | official `.nic.in` / `.gov.in` district & corporation portals |
| **3** | Wikipedia | discovery only — flagged for upgrade |
| **4** | news | corroborated reporting — flagged for upgrade |

### Deep vs baseline

- **Deep districts** (12 so far) are fully researched — money flows, named officials, and industrial base. They surface as cards on the landing screen and light up on the **Money-flow** map view.
- **Baseline districts** (the remaining ~582) are honest **skeletons**: real structure (admin-model classification, the chain of command, the schemes that flow through), with every unsourced figure listed as an explicit gap. Generated by [`gen_baseline_ledger.py`](gen_baseline_ledger.py); a deep-dive simply *promotes* one (see `promote_*.py`).

The **📊 Data coverage** layer makes this visible: it scores each district 0–100% by how much is pinned to sources, so "sourced-or-gap" is something you can *see and filter on*, not just a promise.

The deep exemplars span every region (incl. the Northeast) and many governance / economic models on purpose:

| District | State | Model | Money figure | Notable |
|---|---|---|---|---|
| **Greater Bombay** | Maharashtra | split-admin metro | ₹74,427 cr BMC budget (T1) | India's largest civic budget — ~25× Kolkata |
| **Surat** | Gujarat | split-admin metro | ₹10,004 cr SMC budget | Diamond-polishing capital + ~40% of India's man-made fabric |
| **Jaipur** | Rajasthan | standard (capital) | ₹6,946 cr JMC budget | 1727 planned city; gems + heritage tourism |
| **Ludhiana** | Punjab | standard | ~₹900 cr MC budget | Diversified MSME hub — ~50% of India's bicycles |
| **Kamrup** (Guwahati) | Assam | standard | (off public books) | Gateway to NE India; tea + India's 1st PSU refinery (1962) |
| **Chennai** | Tamil Nadu | split-admin metro | ₹5,146 cr GCC revenue (T2) | Auto + port + IT; property tax >₹2,000 cr |
| **Lucknow** | Uttar Pradesh | standard (capital) | ₹4,305 cr LMC budget | Own revenue just ₹295 cr — heavily grant-funded |
| **Kolkata** | West Bengal | split-admin metro | ₹2,897 cr KMC grant (T1) | No conventional DM; 52% grant-funded |
| **Ernakulam** | Kerala | standard | ₹225 cr KMC grant (T2) | ~50% grant; healthy own-source; full taluk drill |
| **Birbhum** | West Bengal | standard rural | ₹0 (MGNREGS frozen) | 4-yr central fund freeze; ₹3,038 cr+ dues |
| **Purba Singhbhum** (Jamshedpur) | Jharkhand | company township | off-books | India's only major city with no elected municipality |
| **Munger** | Bihar | standard | heritage industry | ITC 1907 (Asia's 1st cigarette factory), 1762 gun trade |

Coverage also extends one level down to **~6,800 sub-district / block polygons** across 36 state files (BDO + Tehsildar chain, the schemes that disburse there), again as honest skeletons.

### Industrial heritage

Each deep district's plants carry a `founded` year and an `era` (`pre_colonial` · `colonial` 1757–1947 · `nehruvian_psu` 1947–91 · `liberalisation` 1991–), rendered as a **"how this district industrialised"** timeline. Each plant also carries an **ownership lineage** — capturing the colonial **managing-agency system** (which controlled ~¾ of Indian industry until it was abolished in 1970) and the post-1947 shift to central PSUs. Munger alone spans three regimes in one district: Nawabi (1762) → East India Company (1862) → British-owned Imperial Tobacco (1907).

> **Caveat:** the district ledger is a young, opinionated dataset. Named officials rotate; most districts are baseline, not deep; only a handful have real money figures. It is built to be *honest about what it doesn't know* rather than to look complete.

---

## Running locally

The pages fetch JSON / GeoJSON, so they need a static server (not `file://`):

```bash
cd india-fiscal-map
python3 -m http.server 8000
# open http://localhost:8000
```

Any static server works (`npx serve`, `caddy file-server`, etc.).

## Project structure

```
india-fiscal-map/
├── index.html              # Single-screen map: layers, drill-down, query panel
├── explore.html            # Full-page Explore / query over all 594 districts
├── references.html         # Sources + methodology + caveats
├── about.html              # Methodology & disclaimer
├── styles.css              # All styles (no framework)
│
├── app.js                  # Main map: choropleth, drill-down, dimension layers, panels
├── query-engine.js         # Client-side AND/OR facet query over all districts
├── coverage.js             # 0–100% source-density score per district
├── vulnerability.js        # Stacked-risk signal count (not a composite "score")
├── map-layers.js/map-ui.js # Basemaps + deep-zoom scale readout
├── time-scrubber.js        # Year scrubber (water-body / floodplain timelines)
├── site-nav.js             # Shared header + footer + SEO (edit nav in ONE place)
├── whats-new.js            # Homepage "What's new" strip (data-updates + news)
│
├── engines.html            # The engines hub (grid of 7 cards)
├── engine-*.html × 7       # Deep pages — thin shells (see ENGINES.md)
├── engines-data.js         # THE source of truth: all 7 engines described once
├── engine.js               # Shared deep-page renderer (reads a slug)
│
├── provenance.html         # Auditable "every figure → its citation" (from gen_provenance.py)
├── updates.json            # Curated data-change changelog (feeds the What's-new strip)
│
├── district-ledger.json    # The atlas: 594 districts × {ledger, dimensions, _gaps, ...}
├── india-fiscal.json       # State × 10 years fiscal series
├── india-extras.json       # Per-state governance footprint
├── india-states.geojson    # State polygons (Datameet)
├── districts/*.geojson      # Per-state district polygons
└── subdistricts/*.geojson   # Per-state sub-district / block polygons (~6,800)
```

Data-build scripts (`add_*_dimension.py`, `gen_baseline_ledger.py`, `promote_*.py`) are idempotent and re-runnable against `district-ledger.json`.

## Design principles

- **Sourced-or-gap.** Every figure is pinned to a source or shown as an explicit gap — never guessed. A false is "not flagged" *or* a gap; it is never asserted as "safe."
- **Comparative, not a verdict.** Layers sit *beside* each other so patterns are visible; the atlas computes no composite "wellbeing" or "bias" score. Correlation is not causation.
- **State-level figures are labelled as such** wherever per-district data is a gap.

## License

MIT for the code. Underlying data belongs to its respective sources (Finance Commission, RBI, MoSPI, NFHS/IIPS, MoEFCC, CWC/NDMA, Census, CMS-India, Datameet) and is used under fair-use / open-data terms.
