# District dimensions — multi-layer data model

**Goal (from user):** grow each district "pixel" beyond money + chain-of-command
into a **multi-dimensional India atlas** — crime, economy, language, politics,
geopolitics — so the project can "slice and dice" and reveal **human bias and
economic incentives** across layers. India-only (the US stays as a comparison
reference, not a co-equal country).

**The editorial thesis is comparative, not declarative.** We don't *assert*
"this is biased." We *juxtapose sourced layers* (e.g. spending × crime × ruling
party × dominant language) and let the reader infer. Asserting bias is an
opinion (defamation surface); showing sourced layers side by side is journalism.
This keeps the "human bias" angle defensible — see `about.html`.

> Same iron rule as the ledger: **sourced or it's a gap.** Every dimension field
> carries `source` + `source_tier`; unsourced stays `null` and is listed in
> `_gaps`. Adding 5 dimensions × 594 districts = many honest gaps at first. Fine —
> structure everywhere, figures where sourced. NEVER fabricate to look complete.

---

## Where it attaches

A new `dimensions` object on each district in `district-ledger.json` (or a
sibling `district-dimensions.json` if size demands — decide at build time). Keyed
by dimension. Each metric is `{ value, year, unit, source, source_tier }`.

```jsonc
"dimensions": {
  "crime":      { ... },
  "economy":    { ... },
  "language":   { ... },
  "politics":   { ... },
  "geopolitics":{ ... },
  "_gaps": ["crime.rate_2023", "economy.gddp", ...]
}
```

---

## 1. Crime  — source: NCRB "Crime in India" (ncrb.gov.in)

NCRB publishes at STATE and metro-city level annually; district-level is partial
(some states publish district SCRB data). So expect city/state values + gaps.

```jsonc
"crime": {
  "ipc_total":        { "value": null, "year": null, "source": null, "source_tier": null },
  "rate_per_lakh":    { "value": null, "year": null, "note": "cognizable IPC crimes per 100k" },
  "crimes_women":     { "value": null, "year": null },
  "level":            "city|district|state-proxy",   // honesty: what level the figure is really at
  "source": "https://www.ncrb.gov.in/", "source_tier": 1
}
```
Bias/economics angle: crime rate × per-capita spend × utilisation — does money
follow need, or follow politics?

## 2. Economy — sources: MoSPI district domestic product, RBI Handbook of
Statistics on Indian States, state DES (Directorate of Economics & Statistics)

```jsonc
"economy": {
  "gddp_cr":          { "value": null, "year": null, "note": "Gross District Domestic Product" },
  "per_capita_income":{ "value": null, "year": null },
  "sector_split":     { "primary": null, "secondary": null, "tertiary": null, "year": null },
  "workforce_pct":    { "agri": null, "industry": null, "services": null },
  "source": null, "source_tier": null
}
```
Note: GDDP is published by some states, not all → gaps. Already have state-level
GSDP in `india-fiscal.json` — reuse as state-proxy where district missing,
clearly labelled `level: "state-proxy"`.

## 3. Language — source: Census of India 2011, C-16/C-17 (mother tongue)

The most completely-sourced dimension (Census is district-level, tier-1).

```jsonc
"language": {
  "dominant":      { "value": null, "pct": null, "year": 2011 },
  "top3":          [ { "lang": null, "pct": null } ],
  "linguistic_diversity_index": null,
  "source": "https://censusindia.gov.in/", "source_tier": 1
}
```
Bias/economics angle: does linguistic-minority status correlate with lower
spend / worse utilisation? (juxtapose, don't assert).

## 4. Politics — source: Election Commission of India (eci.gov.in) results

```jsonc
"politics": {
  "lok_sabha_seat":  { "constituency": null, "party": null, "mp": null, "year": null },
  "assembly_seats":  [ { "constituency": null, "party": null, "mla": null } ],
  "ruling_state_party": null,
  "alignment_with_centre": null,   // same party as Union / not — the federal-friction axis
  "source": "https://results.eci.gov.in/", "source_tier": 1
}
```
Bias/economics angle: the big one — **does a district held by the Union's party
get more/faster central money?** Juxtapose `politics.alignment_with_centre` with
ledger devolution/CSS flow + the MGNREGS-freeze story (already in the data, a
live example of centre-state fund friction). Some roster data already overlaps
(MP/MLA in roster) — reuse, don't duplicate.

## 5. Geopolitics — sources: MHA (border/LWE notifications), MoDoNER, Aspirational
Districts (NITI Aayog), ISFR (forest)

```jsonc
"geopolitics": {
  "border_district":     { "value": null, "neighbour_country": null, "source": null },
  "aspirational":        { "value": null, "source": "https://www.niti.gov.in/" },  // NITI Aayog ADP
  "lwe_affected":        { "value": null, "source": null },   // Left-Wing Extremism (MHA list)
  "strategic_assets":    [],   // ports, defence PSUs (reuse plants[] where present)
  "source": null, "source_tier": null
}
```
Bias/economics angle: border/LWE/aspirational districts get special central funds
— does the money arrive and get spent? (ties straight back to the ledger).

---

## Build order (when greenlit)
1. This schema → 2. **Language first** (Census = fully district-level, tier-1, we
   already load `district-pop.json` from the same source) → 3. **Politics**
   (highest editorial payoff: alignment-with-centre × money flow) → 4. Crime →
   5. Economy → 6. Geopolitics.
2. Each dimension: a generator script (like `gen_baseline_ledger.py`) that fills
   what's sourced, lists the rest in `_gaps`; then surface in the panel as a new
   collapsible section + a new `explore.html` ranking/section + a new map layer
   toggle (recolour choropleth by any sourced dimension).
3. The "slice & dice" payoff = cross-dimension views: pick X (e.g. crime rate)
   vs Y (per-capita spend), colour by Z (ruling party). That's the bias-revealing
   surface — built on `explore.html`/compare once 2+ dimensions are sourced.

## Honesty guardrails specific to these dimensions
- **`level` field** on crime/economy: never pass a state figure off as district.
- **No composite "bias score."** A single number would be an editorial verdict
  dressed as data. Show the components; let the reader judge.
- **Politics is factual** (who won, which party) — sourced from ECI. Correlations
  are shown, causation is never asserted.
- Census is 2011 (the latest full count) — always show the year; don't imply current.

## 6. Geography — sources: MoEFCC CRZ Notification 2019, CWC/NDMA flood lists,
India-WRIS river basins, physiography references, CPCB (sewage), JRC Global
Surface Water / ISRO Bhuvan / Copernicus Sentinel (change-over-time)

Added 2026-07-08 (`add_geography_dimension.py`, commit follows). The physical
constraints on development — shown beside money so the reader sees the loop:
**rain → floodplain/water-body encroachment + missing sewage/drainage +
unplanned/CRZ-ignoring construction → floods → hinders further development.**

```jsonc
"geography": {
  "terrain": "himalayan-hill|northeast-hill|plateau|indo-gangetic-plain|coastal-plain|desert-arid|island",
  "on_coast": bool, "flood_prone": bool, "major_rivers": [ ... ],
  "crz":       { "applies": bool, "category": null, "restricts_dev": bool },   // I/II/III/IV = district CZMP gap
  "flood_risk":{ "state_flood_prone": bool, "flood_damage_cr": null },          // annual ₹ = state relief-memo gap
  "urban_planning": { "sewage_treatment_gap_pct": null, "drainage_master_plan": null }, // CPCB city-level = gap
  "encroachment":   { "documented": null, "cases": [] },  // flag+gap; pin cases w/ NGT/court/CAG citation
  "timeline":  { "subject": null, "points": [ {year, metric, value, source} ] }, // OPEN satellite only
  "cadastral": { "civilian_vs_govt_land": null },         // for a 'no govt land' GLB — NOT openly sourceable
  "hinders_dev_note": "...", "level": "state-proxy", "source_tier": 2
}
```

**Sourced now (list-level):** coastal states → CRZ applies (closed list, MoEFCC);
flood-prone states (CWC/NDMA/Rashtriya Barh Ayog); dominant terrain per state
physiography; state river systems (India-WRIS). **District gaps (never faked):**
CRZ category (CZMP), annual flood ₹, sewage %, per-district terrain, encroachment
cases, change-timeline series.

**Change over the years (`timeline`)** uses **open, redistributable** sources only —
JRC Global Surface Water (1984→now), ISRO Bhuvan LULC, Copernicus Sentinel-2.
**Google Earth imagery is licensed and is NOT copied/redistributed;** we use open
equivalents (or link out to Earth Engine if ever needed). Pilot districts: Kolkata
(East Kolkata Wetlands shrinkage), Chennai (lake/marsh loss → 2015 flood). Exact
open ha figures to be pinned; left as `figure_gap` until then.

**3D GLB — BUILT (`build_india_glb.py` → `india.glb` + `atlas-3d.html`).** Standalone
pure-Python glTF-2.0 writer (numpy only; does NOT touch any running Blender session).
Extrudes `india-states.geojson`: height = sourced constraint index (base + coastal/
CRZ + flood-prone + terrain), colour = constraint class. 36 states, ~78.6k tris.
Viewed in `atlas-3d.html` (three.js orbit). **Civilian-only / no-govt-land cut is
NOT applied** — no open cadastral ownership layer exists for India — and that
exclusion is recorded in `india-glb-meta.json` + a page callout, not silently
dropped. Height is a documented SUM of constraint flags, NOT a hindrance score.

**Timeline + encroachment — REAL sourced pilot pinned** (not just schema): Kolkata
East Kolkata Wetlands 65→41 km² (1991→2021, ~36% loss, range_note flags 36–63%
spread); Chennai Pallikaranai 5,500 ha (1965)→593 ha (2002) + 2015 flood.
Encroachment = documented NGT cases only (Kolkata 2017 'Temple of Knowledge'
demolition, Sapui v. WB; Chennai NGT O.A.91/2023 Sep-2025 approval freeze + Jan-2024
eviction/70 houses). Every point/case cites its source; other districts stay gaps.

**Map + panel:** new "Flood & coast" district-layer toggle in app.js (`geoColor`/
`dimGeoFor`/`geoClass`) recolours by constraint class (coast+flood > flood > coast
> terrain); panel shows terrain/flood/CRZ tags + rivers + over-time points +
encroachment + the hinders-dev note. Comparative, **no hindrance "score."**

---

Part of the project: see `officials-schema.md` (money ledger),
`news-timeline-schema.md` (events), `project-thesis-pixels` framing,
`_meta.protocol_layers` (governance).
```
```
