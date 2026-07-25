# Source research — deeper open data + reference (2026-07-25)

A verified catalog of the best open sources to (a) deepen the maps/globe with higher-detail
geodata, (b) fill the atlas's declared gaps with real accountability data, and (c) reference
how others build the hard parts. Every source below was checked for existence + license.
Grab discipline stays: **open-licensed + attributed, or it's a gap** — nothing scraped that a
site's terms forbid.

---

## A. Higher-detail open GEODATA (deepen the maps)

| Layer | Best source | Format | License | Notes |
|---|---|---|---|---|
| Districts/taluks (official) | **Survey of India** DVD (OVSF/1M/6,7) | Shapefile | Govt, ₹0 | 1:1M generalised; authoritative boundary |
| Districts (community, quick) | **DataMeet** (projects.datameet.org/maps) | SHP/GeoJSON | CC BY 2.5 IN | what most repos use; some pre-delimitation |
| **Unified, modern formats** ⭐ | **`github.com/yashveeeeeeer/india-geodata`** | Parquet / GeoJSONL / PMTiles / SHP | CC BY 4.0 | 14 categories, ~1,800 files: admin, water, roads, rail, **forests, land-use, buildings, health, education**. GitHub Releases (`gh release download`) |
| ADM0–3 (global consistency) | GADM | SHP/GPKG | GADM licence | no history; cross-check for India |
| Detailed rivers | **HydroRIVERS** (WWF HydroSHEDS) | SHP | open + attribution | analysis-ready; clip continent→India |
| Lakes/ponds | **HydroLAKES** (WWF) | SHP | open + attribution | ~1.4M lakes global |
| Official rivers/basins | India-WRIS + data.gov.in | SHP / ArcGIS REST | NDSAP | WRIS = `arc.indiawris.gov.in/server/rest/services` (pyesridump) |
| Most-granular named waterways/roads/buildings | **OpenStreetMap** (Geofabrik India extract, Overpass) | PBF/GeoJSON | ODbL | the "everything" layer; already streamed on the globe fly-down |
| 30 m India DEM | **CartoDEM** (Bhuvan/ISRO) | GeoTIFF | free | 1 arc-sec, ~8 m vertical; India-only |
| Global DEM | SRTM (Bhuvan/USGS) | GeoTIFF | free | already used (AWS Terrain Tiles) |

**Highest leverage:** `india-geodata` (GitHub) — it bundles land-use / forests / buildings /
health / education in GeoJSON+Parquet, CC BY 4.0. This can fill the atlas's **agriculture/
land-use gap** (currently declared empty) and add real building/facility layers.

## B. Accountability data (fill the declared GAPS)

| Gap | Real source | Access | Verdict |
|---|---|---|---|
| **Court / land cases (full universe)** | **AWS Open Data — Indian High Court + Supreme Court judgments** (25 HCs + SC 1950–now) | S3 bulk, JSON+Parquet, **CC-BY-4.0** | ✅ real bulk corpus for SC/HC |
| NGT (environmental) judgments | greentribunal.gov.in (per-case) · Indian Kanoon API (₹500 free credit) | portal / API | ⚠️ thin in open bulk — NGT NOT fully in AWS/NJDG. **Confirms atlas gap is honest.** |
| Case pendency/disposal stats | **NJDG** (njdg.ecourts.gov.in) | dashboard, no bulk-text API | stats only |
| Live case status | eCourtsIndia API (3rd-party, paid) / official eCourts (captcha) | API / manual | keyed/paid |
| Judgment full-text search | **Indian Kanoon API** (30M+ docs, SC/HC/tribunals) | API, needs "Powered by IKanoon" | keyed |
| Land-use / agriculture zones | `india-geodata` Environment cat. + Bhuvan LULC | GeoJSON / WMS | ✅ fills the agriculture-zone gap |
| Per-river monthly discharge | India-WRIS gauge data | ArcGIS REST, largely restricted | ⚠️ still a gap (matches what the globe says) |

**Takeaway:** SC/HC judgments ARE openly bulk-available (AWS, CC-BY-4.0) — a land-dispute
layer could grow from real cases. NGT + WRIS discharge stay genuine gaps — the atlas's honesty
holds.

## C. Code / technique reference (how the hard parts are built)

| Technique | Reference | Note |
|---|---|---|
| Globe → 3D | CesiumJS · three-globe · deck.gl | the fly-down/globe patterns (not novel; our combo is) |
| Google photoreal 3D | `createGooglePhotorealistic3DTileset` (Cesium) | already wired in `earth-3d.html` (BYO key) |
| ArcGIS REST scraping (WRIS) | `pyesridump` | for India-WRIS river/basin extraction |
| eCourts scraping | Open Justice India (PyPi lib) · `vanga/indian-supreme-court-judgments` | maintained scrapers |
| PMTiles (serve big vectors cheap) | protomaps/PMTiles | how `india-geodata` ships buildings/land-use |

---

## Recommended next grabs (in order of value)
1. **`india-geodata` land-use / forests** → fill the agriculture-zone gap on the globe (real, CC BY 4.0).
2. **HydroRIVERS India clip** → replace the Natural Earth rivers with denser, analysis-grade courses.
3. **AWS SC/HC judgments** → seed a real land-dispute case layer beyond the 16 hand-sourced ones.
4. **`india-geodata` buildings (PMTiles)** → real building footprints on the globe fly-down.

## Sources
- [india-geodata (GitHub)](https://github.com/yashveeeeeeer/india-geodata) · [site](https://yashveeeeeeer.github.io/india-geodata/)
- [DataMeet maps](https://projects.datameet.org/maps/districts/) · [Survey of India](https://onlinemaps.surveyofindia.gov.in/Digital_Product_Show.aspx) · [data.gov.in admin](https://www.data.gov.in/catalog/admin-boundaries)
- [HydroSHEDS/HydroRIVERS](https://www.hydrosheds.org/) · [CartoDEM (Bhuvan)](https://bhuvan-app3.nrsc.gov.in/data/download/) · [India-WRIS](https://indiawris.gov.in/)
- [Indian High Court Judgments (AWS Open Data)](https://registry.opendata.aws/indian-high-court-judgments/) · [Open Justice India](https://openjustice-in.github.io/) · [NJDG](https://njdg.ecourts.gov.in/) · [NGT](https://www.greentribunal.gov.in/) · [Indian Kanoon API](https://api.indiankanoon.org/)
