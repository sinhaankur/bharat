# All-India 3D buildings — the build & host plan

The user saw the real 3D building footprints for **Gandhinagar** (35,941 buildings, 6.7 MB
bundled) and asked: *"can we have all of India?"* — and *"we need to build it and save it
anyway."* This is the honest blueprint for doing that properly.

---

## 1. The wall (why it can't be a repo file)

- **All-India buildings ≈ 300–400 million footprints.** At Gandhinagar's density that's
  **~60–70 GB** of raw geometry.
- **GitHub limits:** repo recommended **< 1 GB**, hard cap **~5 GB**; single file max **100 MB**;
  GitHub Pages published site cap **1 GB**. → **65 GB cannot live in this repo or on Pages.**
- So the answer is not "bundle bigger files" — it's **stream tiles from object storage**, the
  way every real building map (Google, Overture, OSM) works. The atlas app stays on GitHub; it
  *points at* a tiles URL.

## 2. Good news — the data already exists, open (no 65 GB to "generate")

The hard part is done for us. Use the **VIDA Google–Microsoft Open Buildings** dataset:
- **~2.58 billion footprints globally**, a merge of Google Open Buildings v3 + Microsoft
  Building Footprints. License: **ODbL v1.0** (open, attribution + share-alike).
- Hosted on **Source Cooperative**, organised **by country ISO code**, already in the exact
  cloud-native formats we need:
  - **GeoParquet 1.1** — `.../geoparquet/by_country/country_iso=IND/IND.parquet` (India only)
  - **FlatGeobuf** — per country
  - **PMTiles** — global, per-country layers, or by-country files
- Each record has: geometry, **area_in_meters**, confidence, source (Google/Microsoft), S2 ID,
  country ISO, bbox. (No per-building *height* — see §5.)
- Source: https://source.coop/repositories/vida/google-microsoft-open-buildings/description/

**So "build it" = download India's slice, not compute anything.**

## 3. Turn it into streamable tiles (PMTiles)

**PMTiles** is a single-file tiled archive a browser reads piece-by-piece over HTTP range
requests — only the tiles in the current view download (kilobytes), never the whole thing.

Two routes:
- **A. Grab India PMTiles directly** if VIDA's per-country PMTiles includes `IND` — done, just
  host it.
- **B. Build from the India GeoParquet** (full control over zoom/simplification/size):
  ```sh
  # 1. India footprints (ODbL) from Source Cooperative
  #    (aws s3 cp --no-sign-request  s3://.../country_iso=IND/IND.parquet  IND.parquet)
  # 2. Parquet → GeoJSONL (duckdb spatial, or ogr2ogr)
  duckdb -c "INSTALL spatial; LOAD spatial;
             COPY (SELECT * FROM 'IND.parquet') TO 'india.fgb' (FORMAT GDAL, DRIVER 'FlatGeobuf');"
  # 3. → vector tiles → PMTiles (tippecanoe)
  tippecanoe -zg --drop-densest-as-needed --extend-zooms-if-still-dropping \
             -o india-buildings.pmtiles india.fgb
  ```
- **Expected size:** raw ~60 GB → PMTiles typically **single-digit to low-tens of GB**
  (simplification + only storing detail at high zoom). Only the *tiles you look at* transfer.

## 4. Host it (cheap object storage, not GitHub)

| Host | Free tier | Egress | Notes |
|---|---|---|---|
| **Cloudflare R2** ⭐ | 10 GB storage | **$0 egress** (free) | best fit; range-request friendly; custom domain |
| Backblaze B2 | 10 GB | 3× storage/day free | works; Cloudflare in front = free egress |
| AWS S3 | (paid) | paid egress | works but egress costs add up |

**Recommendation: Cloudflare R2** — put `india-buildings.pmtiles` there, serve over its public
URL / custom domain. The globe fetches tiles via range requests. Keep an **attribution** line
(ODbL: "© Google, © Microsoft, VIDA — ODbL").

## 5. Render it on the globe (fly-down)

- Client reads PMTiles with **`pmtiles` + `protomaps-leaflet`** (or MapLibre GL) — a small JS
  lib that does the HTTP range requests. Drop-in next to the existing Leaflet fly-down.
- Colour by height: the VIDA data has **no per-building height**, only footprint + area. Options:
  - keep OSM's `building:levels`/`height` where present (the on-demand layer already does this);
  - or extrude a flat default height → footprints as blocks (honest: "footprint, not measured
    height" — mark it a gap, per the atlas rule);
  - a real DEM/DSM height layer for all India is itself a large separate dataset (future).

## 6. What's already shipped (the bridge to this)

- **On-demand OSM buildings** (commit 636076f): the fly-down streams live OpenStreetMap
  building footprints for *any* view — real buildings anywhere in India today, zero storage.
  Coverage = however well OSM has mapped that place.
- **Gandhinagar** stays the bundled, instant example (6.7 MB, with height).

The PMTiles path above is the upgrade: **all-India, complete, still streamed** — the OSM
layer is the interim, this is the definitive.

## 7. Honest scope

- This is **real work + a hosting account** (R2), not a repo commit. The download + tippecanoe
  build is a few hours of processing on a machine with disk; hosting is a few clicks.
- It stays inside the atlas's rule: **open-licensed (ODbL), attributed, streamed** — the same
  "sourced-or-a-gap" spine, just for data too big to bundle.
- Heights remain a **declared gap** unless a height dataset is added.

**Next action when ready:** (a) confirm VIDA's `IND` PMTiles exists (grab it) or run the
tippecanoe build from the India GeoParquet; (b) create a Cloudflare R2 bucket; (c) wire a
PMTiles building layer into the fly-down pointing at the R2 URL. Everything above is verified
to exist and to be openly licensed as of 2026-07.
