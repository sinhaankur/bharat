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

---

## Phase 3 — Refractive Dharmachakra jewel (advanced rendering)

**What I'm learning.** igloo's "ice" is `MeshPhysicalMaterial` with **transmission** — the
renderer renders the scene to a backbuffer and the material *refracts* that texture through
the mesh (the FBO trick), bent by `ior`/`thickness`; `dispersion` splits it into spectral
fringes; `attenuationColor`/`Distance` tint the glass volume; `clearcoat` adds a wet sheen.
Transmission is expensive (an extra scene render), so it needs a perf fallback.

**The Bharat build.** `buildJewel()` makes a **24-spoke Dharmachakra** (rim torus + hub +
24 box spokes) in a transmission physical material (ior 1.6, dispersion 2.2, gold
attenuation), floating above India as the crest, turning slowly in its own plane, growing in
at the top and receding as the descent begins. Low-perf devices (`LOW_PERF`) get a matte
gold wheel instead — same silhouette, no transmission cost. The tilt lays it back toward the
high camera so all 24 spokes read as a clear chakra, not an edge-on ellipse.

**Before / after.** Before: the hero had no focal emblem. After: a glass Ashoka wheel crowns
the composition — the refractive "jewel" moment, as our national symbol.

---

## Phase 4 — Particle morph: India ↔ chakra ↔ cities (the capstone effect)

**What I'm learning.** igloo's particle morph gives each particle several *target positions*
and interpolates between them. The pure-GPGPU way ping-pongs position textures through
`GPUComputationRenderer` with curl noise; a lighter, robust way (used here) bakes the targets
as **vertex attributes** and lerps them in the **vertex shader** by a `uMorph` uniform — same
visual payoff, no simulation framebuffers. `MeshSurfaceSampler` scatters points evenly over a
mesh's surface (barycentric sampling weighted by triangle area) — that gives the "India" form.

**The Bharat build.** `buildMorph()` makes 30k motes (9k on low-perf), each carrying three
targets: **aA** = India's surface (via `MeshSurfaceSampler` on the GLB), **aB** = a 24-spoke
chakra ring above the land, **aC** = clusters around the great-city points. The shader lerps
A→B→C by `uMorph` (0..2), adds a cheap swirl drift, sizes points by depth, and glows hotter
(gold→white) where the morph moves fastest. Scroll maps: India through the early acts → the
**chakra** at the Mauryan beat → the **cities** at the living-atlas end. Additive, perf-tiered,
reduced-motion = static form.

**Before / after.** Before: static district/city dots. After: a living field that reforms
India into the national wheel and then into its cities as you travel the timeline — the
roadmap's capstone effect, told as Bharat's own story. (Point size reads best on real GPUs;
SwiftShader under-renders it, so a real-browser tuning pass is noted.)

---

## Phase 5 — Assemble + the capstone (GLB bake, perf, push)

**What I'm learning.** The capstone is *assembly + pipeline*: sequence the demos into one
scroll so each act reveals one effect, and squeeze the 3D data for the web (igloo's "custom
exporters"). Our pipeline analog is the Python GLB builder — bake the good look into the
asset instead of fixing it client-side every load.

**The Bharat build.** (1) Choreography already falls out of the shared `scrollProg`: Lenis
scroll throughout; the jewel crowns the intro; the transition wipe fires at each boundary;
the particle morph runs India→chakra→cities across the descent. (2) Rebuilt `india.glb` via
`build_india_solid_glb.py` with a **baked bronze→gold height palette** (default; the old
flood-risk class colours remain behind `INDIA_GLB_PALETTE=class`), so the base is good
everywhere — the client-side override is now just a refinement. (3) Perf: device-tiered
particle count + transmission (`LOW_PERF`), all layers reduced-motion safe. Pushed live.

**Before / after.** Before: five separate ideas + a muddy base GLB. After: one cohesive,
igloo-grade Bharat hero on a warm baked landmass — smooth scroll, gold-ink transitions,
a glass chakra crest, and a particle field that tells the country's story, live.

---

## Where this maps to igloo's actual skill set
(from the igloo.inc teardown the user shared)
- **Real-time graphics (Three.js, GLSL):** our transition pass, fresnel rim, glass
  transmission, particle shader, scramble text — Phases 2–4. ✓
- **Procedural 3D (Houdini/Blender):** our Blender Ashoka pillar + the Python GLB bake. ✓
- **Pipeline/exporters:** `build_*_glb.py` squeezing geometry to web GLB. ✓
- **Front-end (scroll/timelines/perf):** Lenis, the act choreography, perf tiers. ✓
- **Sound synced to motion:** the hero's synth drone exists; syncing it to the particle
  morph is the next natural step (noted for a follow-up).
