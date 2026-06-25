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

Part of the project: see `officials-schema.md` (money ledger),
`news-timeline-schema.md` (events), `project-thesis-pixels` framing,
`_meta.protocol_layers` (governance).
```
```
