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
