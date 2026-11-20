# WebGL Lab — Bharat hero → igloo.inc-grade

A learning log, one section per phase. Goal: take `hero-3d.html` from "good" to an
igloo.inc-grade scroll experience, applying the techniques from the real-time WebGL
roadmap to our own motifs — India, the Dharmachakra, the Ashoka capital, the rivers,
the great cities. Vanilla Three.js (igloo.inc is vanilla WebGL too).

Reference feel: **igloo.inc** — scroll-driven camera, shader transitions, a refractive
centrepiece, a GPU particle morph, assembled into one cohesive journey.

---

## Phase 1 — Smooth-scroll backbone (Lenis)

**What I'm learning.** igloo's "feel" is a *smooth-damped* scroll, not the browser's raw
`scrollY`. Lenis intercepts wheel/touch and eases a virtual scroll position each frame
(a lerp toward the target). Feeding that smoothed value — instead of `window.scrollY` —
into the camera-journey progress makes the whole descent glide. Our camera already lerps
its pose (`lp`), so Lenis adds the missing *input-side* smoothing. `lerp(a,b,t)=a+(b-a)t`;
Lenis is essentially that on the scroll position, every rAF.

**The Bharat build.** Vendor Lenis (MIT, tiny). In `hero-3d.html`, drive `readScroll()` and
`scrollProg` from Lenis's smoothed scroll; call `lenis.raf(now)` from the existing render
loop. Reduced-motion → Lenis off, fall back to raw scroll (no change for those users).

**Before / after.** Before: scroll jumps act-to-act with the OS scroll steps. After: the
journey eases continuously — the backbone of the igloo feel.

---

## Phase 2 — Shader transition + glyph-scramble title

**What I'm learning.** Two of igloo's signatures. (1) A **full-screen post pass**: after the
scene renders to a texture (`tDiffuse`), a fragment shader resamples that texture with
per-pixel *offsets* — shift R/G/B samples apart for a **chromatic split**, and push the UV
along a **value-noise field** for a displacement "wipe". `fbm`/value-noise is the
procedural-texture workhorse. (2) **Glyph scramble**: cycle random characters per letter,
locking them left→right on an ease-out curve, so text "resolves" like a terminal.

**The Bharat build.** A `ShaderPass` (`TransitionShader`) between bloom and output: at rest
`uAmt=0` (no-op); as scroll crosses an era boundary, `uAmt` bumps up (sin of the fractional
scroll) and the pass adds an **ink-bleed displacement + RGB split + gold flecks** on the
noise ridges — our "turning a page of time", not icy frost. The era name in the HUD uses
`scrambleTo()`, mixing Brahmi/Devanagari + Latin glyphs as it resolves. Reduced-motion: pass
stays at 0, text sets instantly.

**Before / after.** Before: eras cross-fade palette only; titles plain-fade. After: each era
boundary gets a gold ink-bleed chromatic wipe and the era name resolves from scrambled
glyphs — the igloo "transition + text" demo, in Bharat's iconography.
