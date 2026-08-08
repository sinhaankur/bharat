# Bharat — Next.js migration tracker

Re-platforming the ~55 static atlas pages into this Next.js app (app router),
page by page. Test each → looks good → deploy. Build with
`./node_modules/.bin/next build` (the pnpm wrapper fails on `sharp`).

## Pattern (proven on ancient-india)
- `app/<page>/page.tsx` — server component: `<PageShell brief={…}>` + the content component. Metadata here.
- `app/<page>/<name>.tsx` — `'use client'` component for the interactive UI.
- Data: copy the JSON to `app/<page>/data.json` and `import data from './data.json'`.
- Shared: `components/page-shell.tsx` (header+main+brief+footer), `components/editorial-brief.tsx`.
- Fonts: `.f-*` Indic classes + `@font-face` already in `app/globals.css`; data/fonts in `public/`.
- Links to not-yet-migrated pages point at the static `/foo.html` for now.

## Tiers (easiest → hardest)

### Tier 1 — content pages (JSON + DOM; no map/3D)   ← DO THESE FIRST
- [x] ancient-india      (timeline + interrogation)  ✅ DONE — the template
- [x] deep-history       (DNA population-shift timeline)  ✅ DONE
- [ ] scripts            (family trees SVG + specimen + fonts)
- [ ] vedas              (verses + gloss + translations)
- [ ] journey            (scrollytelling — IntersectionObserver)
- [ ] languages          (hub cards + lang table)
- [ ] atrocities         (SVG bubble timeline)  [borderline tier 2]
- [ ] command-chain, history, mesh, global, geopolitical-chess, engines
- [ ] about, how-it-works, references, provenance, knowledge, data, for-organisations, privacy, sitemap, share, design-system

### Tier 2 — Leaflet map pages (react-leaflet or embed)
- [ ] index (THE map — biggest), feed, ashoka, heritage-atlas, quake-tsunami, encroachment-atlas, state-of-india, explore, terrain-3d, flood-3d

### Tier 3 — Three.js / R3F (R3F already in deps)
- [ ] india-3d, globe-map, cave-walk, heritage-3d, temple-forms, atlas-3d, earth-3d

### Home
- [x] `/` — ship-26 magazine home, Bharat content (links out to static pages)  ✅

## Notes
- The static atlas still lives at repo root and is the fallback; the Next app links into it.
- Decide hosting: Next app + static atlas as one deployment (rewrites), or migrate fully then retire the static site.
