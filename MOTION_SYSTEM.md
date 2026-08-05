# Bharat Atlas — Motion System

Magazine-grade motion for every interaction, graph and map. Our house rules,
distilled from widely-taught motion principles (Material Design's motion guidance,
restrained editorial data-viz, and gesture-forward feed UIs). We reference the
*principles* — never any product's assets, code, or proprietary motion curves.

---

## 1. Principles
1. **Motion has meaning.** Every animation explains a change — where a thing came
   from, what just happened, what to look at next. No motion for decoration alone.
2. **Fast in, gentle out.** Elements enter quickly and settle softly (ease-out).
   Exits are quicker still. Nothing lingers.
3. **One focal change at a time.** Choreograph: the important element leads, others
   follow with a small stagger. Never animate everything at once.
4. **Respect the reader.** All motion honours `prefers-reduced-motion` and the a11y
   panel; under reduce-motion everything snaps to its final state instantly.
5. **Consistent physics.** One shared set of durations + easings across the whole site,
   so the product feels like one hand made it.

## 2. Tokens (the shared physics)
```
--ease-out:    cubic-bezier(.2, .7, .2, 1)     /* enter / settle */
--ease-in-out: cubic-bezier(.4, 0, .2, 1)      /* move between two states */
--ease-spring: cubic-bezier(.2, .9, .3, 1.15)  /* playful pop (chips, pins) */
--dur-1: 120ms   /* micro: press, hover */
--dur-2: 220ms   /* standard: reveal, card */
--dur-3: 400ms   /* emphasis: hero, chart draw */
--dur-4: 800ms   /* graph draw-in, count-up */
--stagger: 60ms  /* between siblings */
```

## 3. Interaction catalogue (every interaction gets one)
| Interaction | Motion |
|---|---|
| Button hover | lift 1–2px + shadow bloom (dur-1, ease-out) |
| Button press | scale .98 + inset (dur-1) + tap **ripple** from pointer |
| Card hover | lift 3px + image scale 1.08 + arrow nudge 3px |
| Chip toggle | spring fill + label weight (ease-spring) |
| Link hover | underline **sweep** left→right (dur-2) |
| Tab / view switch | crossfade + underline slide to the active tab |
| Section enter | rise-in + fade (dur-2), staggered children |
| Number | **count-up** with ease-out (dur-4) |
| Drawer / panel | slide from edge + scrim fade (dur-3) |
| Tooltip | fade + 4px rise (dur-1) |

## 4. Graph motion
- **Bars** grow from baseline (`scaleY 0→1`, ease-out, staggered by --stagger).
- **Lines** draw on via `stroke-dashoffset` (dur-4).
- **Donuts / arcs** sweep in via dash-offset; value label counts up in sync.
- **Scatter / bubbles** pop in (spring) staggered, largest last so small stay on top.
- **Axis + gridlines** fade in first (dur-2), then the data draws — context before content.
- On **filter change**, bars/points *tween* to new values (FLIP-style), never hard-cut.
- Everything triggers on **scroll-into-view** (IntersectionObserver), once.

## 5. Map motion
- **Pins/markers** drop + settle (translateY + spring), staggered across the field.
- **Choropleth** fills fade region-by-region on load; on view-change, colours **cross-tween**.
- **Selection**: the chosen region lifts (subtle scale/stroke) and the rest dims — synced
  across map + list + chart (the "highlight everywhere" rule).
- **Pan/zoom** eased, never instant. Hover on a region: quick tint + tooltip rise.
- **Zoom-to**: camera eases to the target (ease-in-out), label fades in on arrival.

## 6. Implementation
- CSS carries hover/press/transition states (automatic, cheap).
- `motion.js` drives scroll-triggered work: reveal, count-up, parallax, **animated graphs**
  (`ag-bar/ag-line/ag-donut/ag-fade` via a `--draw` 0→1 variable), and the tap **ripple**.
- SVG graphs opt in by adding the `ag-*` classes; the map layers hook the same tokens.
- The **video pipeline** (india-fiscal-studio) reuses these same easings + choreography, so
  on-site motion and the YouTube explainers share one motion language.

## 7. Do / Don't
- ✅ Ease-out on enter · stagger siblings · draw context before data · tween on change.
- ❌ Linear easing · animate 20 things at once · loops that never stop · motion that blocks reading.
