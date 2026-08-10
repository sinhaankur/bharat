# Mauryan design system — handoff for sinhaankur/bharat

Mockups approved in this project's `Atlas Mockups.dc.html` (turns 1–4). This folder is the
commit-ready core; page HTML stays mockup-only per scope.

## Files
- `theme-mauryan.css` — reversible token layer. Link AFTER `styles.css`, add `class="theme-mauryan"`
  to `<html>` (add `theme-dark` or `.register-dark` for 3D/engines pages). Remove the class to revert.
  CTAs keep the house `--accent` #cc8900 (hover #a06b00).
- `mauryan-icons.svg` — SVG sprite: chakra, pillar, lotus, lotus-bell, edict, punch-coin, lion,
  elephant, bull, horse, stupa, torana, jali + the four punch-marked-coin symbols (sun, six-armed,
  chaitya hill, tree-in-railing), plus `#jali-tile` and `#floral-band` patterns.
  Original stylised drawings — never the official State Emblem.

## Register discipline (ASHOKA_DESIGN.md)
- Mauryan (stone + sky) = skeleton: nav, map, data, structure.
- Gupta (red sandstone + Ajanta) = soul: long-form, heritage, culture.
- Dark temple-interior (maroon + gold-leaf) = 3D pages and the engines hub.
- Photographs stay grayscale; rules stay 2px incised; corners stay tight.

## Suggested commit
1. Add both files to repo root.
2. Opt pages in one at a time via the `theme-mauryan` class.
3. Replace emoji icons in `nav-data.js` / home cards with sprite refs.
4. Rebuild `design-system.html` on the atomic tiers (mock 3a).
