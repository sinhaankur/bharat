# Rebuild plan — Atlas, from the "amazing 2" (Modernist × INDIC DESIGNS) handoff

> **2026-08-11 — reconciled with reality.** Today's shipped work follows the NEWER
> `amazing 2` handoff (INDIC DESIGNS), not the earlier Mauryan-gold plan. The old
> Mauryan-palette version of this file is retired; the notes below describe what is
> actually built and what remains. See `MAURYAN_HANDOFF.md` for the retired direction.

**Source of truth:** `~/Downloads/amazing 2/project/` — `CLAUDE.md` (authoritative
brief) + `India by Design Systems.dc.html` (flagship, 133KB) + Atlas
Home/Header/Footer + `Bharat Logo.dc.html` + `Bharat Temple 3D.html` +
`three-d-stage.js` + `Atlas Mockups.dc.html` (293KB). This SUPERSEDES the older
`~/Downloads/amazing/` bundle. A copy lives in `atlas-app/handoff/`; screen map in
`atlas-app/handoff/github.md`.

## The system (from amazing 2 CLAUDE.md)
- **Bound chassis = Modernist**: Archivo, red `#ec3013`, 2px section rules / 1px sub,
  flat, 0 radius, offset hard shadows. This is the structural skeleton for atlas
  **content** screens.
- **Program = INDIC DESIGNS**: per-state/culture design systems as **token layers over
  the shared chassis**. Layout never changes per skin — only tokens swap (accent, tint,
  band/motif, script accent), derived in oklch. NE states use loom/longhouse motifs.
- **Global chrome is Indic-skinned** (NOT Modernist-red, NOT Mauryan-gold):
  - Header: stone ground `#ece3cd`, ink `#2a2018`, vermilion `#c1440e`, **Karla**,
    2px bottom rule. Brand = `Bharat Logo`. Nav = Home · Design systems · Temple 3D ·
    Canvas. Search box + vermilion "Open the atlas" CTA.
  - Footer: dark brown `#38221a` ground, cream `#f0e6d0`, gold `#c9862b`. Rozha One
    newsletter, GitHub + Data&API, 8-script band `भ ভ ਭ ભ ଭ భ ಭ ഭ`, "● SOURCED — OR
    IT'S A GAP". ⚠️ Baseline names Ankur Sinha — reconcile with anonymity req before
    shipping that line.
- **Mauryan mockup turns 1–9 = retired.** Kept as history; do NOT restyle to them.
- **Flagship** `India by Design Systems.dc.html` wears its OWN Indic skin (stone
  `#e9e0cb`/`#f6f0e1`, ink `#2a2018`, vermilion `#c1440e`, Rozha One + Karla).

## The app — `atlas-app/` (built, deploying)
Next 16, static export (`output: 'export'`), basePath `/bharat/app`. No Tailwind —
tokens are hand-authored CSS. Fonts (Rozha One + Karla) self-hosted via @fontsource.
Build: `./node_modules/.bin/next build --webpack` (sharp/pnpm gotchas already solved).
**Deploy is already wired**: `deploy-app.yml` builds `atlas-app/out/` into
`_site/app/` on any `atlas-app/**` change — no separate cutover step needed.

### Skin token engine (the interactive core)
- `app/globals.css`: chassis constants in `:root`; skins on `html[data-skin=…]`
  override ground/ink/accent/band/display-font. Default = **gupta**. Skins present:
  chassis (Modernist red), kashmir, rajasthan, tamil, kerala, assam, naga. Legacy vars
  (stone/gold/sky/…) alias onto the active skin so old pages reskin for free.
- `components/skin-switcher.tsx`: sets `html[data-skin]` + localStorage; whole site
  reskins live. Full-page version = the flagship's segment lattice.

## ✅ Shipped (2026-08-10, live on main)
- **Chrome**: `SiteHeader` / `SiteFooter` rebuilt faithful to amazing 2 (Indic skin,
  stone header / dark-brown footer, 8-script band). `BharatLogo` = gold seal-ring +
  cycling 8-script glyph.
- **Home** (`app/page.tsx`): amazing2 Atlas Home — intro splash Bharat/Indic, "Bharat,
  district by district", animated counters (`home-motion.tsx`), entry grid. Enter
  Bharat → classic 594-district map.
- **`/design-systems`**: the flagship "India by Design Systems" — "One chassis / Many
  Indias", ready-skins, region-grouped segment lattice, poster close.
- **`/3d`**: the handoff's `Bharat Temple 3D.html` served as-is from `public/temple3d/`
  (Three.js `<three-d-stage>`, parametric Nagara/Dravida/Kalinga, OBJ/GLB export).
- Route stubs exist for: about, d/[slug], data, design, engines, engines/revenue,
  explore, feed, heritage/[slug], register, sitemap, study/[slug].

## Remaining roadmap (user's stated order)
1. **Finish the handoff-faithful MAIN SITE** — wire the interior pages cleanly onto the
   Indic chassis: engines · explore · data · ledgers (register) · heritage. Optionally
   the full `Atlas Mockups.dc.html` canvas.
2. **Port back the earlier work WITH a storyline** onto this chassis: engines hub, deep
   district ledgers (Kolkata-depth), state-revenue dashboard (7a), industrialisation
   timeline (7b), heritage atlas. See `MAURYAN_HANDOFF.md` / the amazing-handoff-rebuild
   notes for the full list of what exists to migrate.
3. **Polish**: mobile 390px (drawer, map sheet, bottom nav, ≥44px targets), motion layer
   honouring reduce-motion, a11y/command-palette parity with the classic app.

## Keep
- The classic 2D fiscal map (all 594 districts) stays the real map the home links open
  — do NOT replace it with a placeholder. `archive/mauryan-app` remains the rollback.

## Review cadence
Build a screen → show → iterate → next. The flagship `/design-systems` + the skin
switcher are the identity gate: if the reskin reads right there, interior pages follow
the same token system fast.
