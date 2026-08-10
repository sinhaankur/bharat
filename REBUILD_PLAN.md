# Rebuild plan — Atlas, from the Amazing (Modernist × Mauryan) handoff

**Source of truth:** `~/Downloads/amazing/project/` (Atlas Mockups.dc.html + Atlas
Home/Header/Footer + `_ds/modernist-*/`). Screen map in `github.md`.

**Decisions locked with user:**
- Park current app → done: branch `archive/mauryan-app` (pushed). `main` stays live until cutover.
- New Next.js app, **replaces** current `interactive-vercel-ship-26-i-2` as `/bharat/app`.
- Identity = **build 1a exactly**: Modernist grid skeleton (2px rules, flush-left,
  0 radius, Archivo) + Mauryan **stone/sky/gold** palette (stone `#e9ddc7`, ink
  `#2a2018`, sky `#3078c0`, gold `#cc8900`, terracotta `#a8452a`) + chakra + jali.
- Keep the classic 2D fiscal map (`classic.html`, all 594 districts) as the real
  map the home links open — do NOT replace it with a placeholder.

## Design tokens (from _ds + turn 1a)
- Type: **Archivo** (400/600/800) UI; Fraunces + Instrument Serif + JetBrains Mono
  kept for the "house register" ledger (1b) only.
- Color roles: bg stone `#e9ddc7` / surface `#dcccae` / ink `#2a2018` / muted
  `#6b5c48`; accents sky `#3078c0` (data), gold `#cc8900` (action), terracotta
  `#a8452a` (warnings). Radius 0. Rules: 2px section, 1px sub. Elevation = offset
  hard shadow `6px 6px 0 rgba(42,32,24,.2)` (mockup) not soft blur.
- SVG defs to port: chakra, seal-ring, jali/jali-dark/floral patterns, the 12
  Mauryan stroke icons (lotus/pillar/stupa/lion/elephant/bull/horse/edict/jali/
  coin/torana/bell + sun/sixarm/chaitya/tree). All exist in the mockup + repo.

## Build phases (plan-first, then bulk)

**Phase 0 — Scaffold (foundation)**
1. New Next.js app dir `atlas-app/` (Next 16, static export, basePath `/bharat/app`,
   the sharp/symlink build fixes already learned). Reuse deploy-app.yml pointed at it.
2. `app/globals.css` = port `_ds/modernist styles.css` tokens + the turn-1a palette
   overlay + SVG-symbol sprite. Archivo/Fraunces/etc. via next/font.
3. Shared chrome: `SiteHeader` (chakra + BHARAT + Engines/Explore/3D/Data/About +
   gold "Open the map" → classic map) and `SiteFooter` (4-col, 2px top rule).
   Both use next/link + basePath-aware SmartLink (carry over that fix).

**Phase 1 — The home (1a "Sunlit Monument")** ← first reviewable screen
- Full atlas home: header, jali hero ("Money, land, and law — side by side for 594
  districts" + sourced-or-gap kicker + 35/594/6800/7 stat row), then the 280px
  "colour the map by" rail (8 dimensions) + the map panel with the floating
  district card, footer register strip. Real interactive state map (port existing
  india-map, restyled) with "Open the map" → the classic 594-district fiscal map.

**Phase 2 — The four registers / key screens (turn 1 + 7)**
- 1b Edict Ledger (district detail, house Fraunces register) — Birbhum template,
  wired to district-ledger.json.
- 1c Engines hub (dark maroon register, gilded chakra) — engines-data.
- 1d Explore/query (strict red Modernist grid) — query-engine.
- 7a revenue dashboard, 7b industrialisation timeline, 7c command palette (/) +
  a11y panel (this is the REAL search — fixes "search is broken").

**Phase 3 — The five page shells (turn 4) covering all 58 pages**
- 4a editorial (home/hero/about/how-it-works/for-organisations)
- 4b study/edict Gupta (ashoka/vedas/scripts/languages/heritage/temple-forms/…)
- 4c 3D dark canvas (india-3d/terrain/flood/… — reuse existing R3F)
- 4d feed (feed/articles/story/timeline/atrocities)
- 4e data/provenance table shell (data/references/provenance/knowledge/sitemap)
- Migrate content page-by-page into the right shell (screen map in github.md).

**Phase 4 — System + polish (turns 2,3,5,6)**
- Icon set (2), atomic design-system page (3a) + page map (3b), IA/sitemap (5a),
  motion layer (5c, honour reduce-motion), forms + states + **mobile 390px**
  (6a/6b/6c: drawer, map sheet, bottom nav, ≥44px targets).

**Phase 5 — Cutover**
- Point deploy-app.yml at `atlas-app/`, verify all routes 200 + link scan clean
  (reuse the broken-link scan), then merge to main. `archive/mauryan-app` remains
  the rollback.

## Review cadence
Build a screen → show you → iterate → next. Home (Phase 1) is the first gate:
if the look is right there, the rest follows the same system fast.
