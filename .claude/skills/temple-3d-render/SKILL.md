---
name: "temple-3d-render"
description: "Use when building, extending or improving a sourced 3D WebGL model of an Indian or South Asian temple, stepwell, stupa or monument, including research, staged build, stone, trees, walk mode and notes."
---

# Rendering a temple in 3D, sourced

This is the method behind the Bharat atlas temple models: about 40 forms drawn from numbers, not scans. A model can be built stone by stone, cut open, walked through and exported. Every figure is either sourced or labelled as drawn by eye.

## 1. House rules (apply to every model)

- **Sourcing:** every figure has a source, or is shown as a gap (dashed amber, "no source linked"). Keep fact apart from framing.
- **Source tiers:** T1 primary data. T2 government, UNESCO or ASI pages. T3 encyclopedias, which are leads only: never linked, and no figure rests on one. T4 papers, museums, newspapers and books.
- **No Wikipedia links. No emoji.** Write plain, short sentences.
- **The eye note:** each model says what is sourced and what is drawn by eye, e.g. "Sourced: the plan, the tower height, the date. Drawn by eye: the hall sizes, the roofs."
  - When a commonly quoted figure can't be traced, say it isn't used.
  - When two sources disagree, say so.
- **Conjecture:** draw lost or restored parts pale, as a separate last stage, and label them conjecture.
- **Trees and grass:** say they are "kinds common to the region, placed by eye, not surveyed".
- **Building treatises:** don't claim a temple followed a particular text unless a source says so. Name the regional treatise, note whether its date fits, and say "which text, if any, its builders used is not recorded".

## 2. Research first, build second

Collect, with a tiered source for each item:

- plan size, tower or vimana height, number of pillars, cells and storeys, platform heights
- orientation (which way the entrance faces), and the parts in order from the gate to the sanctum
- material and stone type, finish (plaster, paint, gilding), and what is ruined or lost
- how the art sits on the stone: friezes, niches, plaques, inlay, painted plaster, tool marks
- how it was built: quarries, wedge holes, ramps, iron clamps, top-down carving, moulded tiles
- the books: the regional treatise and its date (see the table in 6), and the stone rule in 7

Good places to look:

- UNESCO listings and tentative lists, ASI, state tourism and district sites, indianculture.gov.in
- museum catalogues and university papers; archive photos (the British Library's 19th-century prints show ramps and ruins)

Decide the stages up front: 4 to 7 per form, ground first, then plinth, walls, roof or tower, halls, outer shrines, and conjecture last.

## 3. Engine architecture (WebGL2, one self-contained function)

`templeStage(host)` builds meshes lazily (one form at a time, evicting old ones) and draws them.

### Vertex and stage data

- **Vertex:** 15 floats: `pos3, normal3, COL3, S0 (stage in), S1 (stage out), BASE (base y for the rise), dark (interior), EMI (flame), MAT`.
- **MAT packing:** MAT carries the stone type in its fraction: `MAT + STN*0.01`. In the shader, `mat=floor(v+0.001)` and `stn=floor(fract(v+0.001)*100+0.5)`.
- **Stage reveal:** a stage rises from BASE. Within a stage, blocks appear course by course using a hash per block, which gives the stone-by-stone look.

### Units and conventions

- Metres, y up. The entrance is on +x by default. If east is not +x, set `m.east=[x,z]`.
- **Places:** `m.places={id:[x,y,z,yaw,pitch]}`. Yaw PI/2 faces -x, -PI/2 faces +x, 0 faces -z, PI faces +z. Positive pitch looks up.
- **Per-form settings:** `m.view=[x0,x1,z0,z1,height]` frames the outside camera. `m.court=-1000` turns off the default court.

### Materials

| MAT | Use |
|---|---|
| 0 | Ashlar or masonry: courses from per-form block size `blk=[course height, block length]` plus the stone type |
| 1 | Metal or water |
| 2 | Ground |
| 3 | Marble |
| 4 | Rough rock or bark |
| 5 | Figure-niche friezes |
| 6 | Dravida pilasters and kudu arches |
| 7 | Panel and lotus reliefs |
| 8 | Scroll bands |
| 9 | Polished stone |
| 10 | Terracotta plaques (figures and rosettes) |
| 11 | Leaf cards |
| 12 | Grass cards |

Relief materials (5 to 8, 10) compute a height pattern `hg` in wall space `(u along the wall, hy above the base)`:

- Turn `hg` into a normal with screen-space derivatives.
- Darken low areas (dirt in recesses) and lift the high ones (worn highlights).
- Fade the pattern with `fwidth` at a distance so it doesn't flicker.

### Stone types

Set per form with `host.stone[k]=[type, weather 0..1, edge wear 0..1, grain scale, irregular coursing 0/1]`. Override per part with `STN=n` around the part, then restore it.

| Type | What it looks like |
|---|---|
| 1 granite | crystal speckles, rare glints |
| 2 sandstone | bedding and cross-bedding, iron bands, salt honeycomb near the ground |
| 3 marble | veins, warm patina, a soft glow from light passing through |
| 4 basalt | fine grain, gas-bubble pits |
| 5 limestone | pitting, fossils, orange lichen spots |
| 6 laterite | red and purple mottling, worm-holes |
| 7 brick | 0.085 x 0.24 m running bond, recessed mortar, over-fired headers |
| 8 soapstone | fine and smooth, with a sheen |
| 9 rubble | Voronoi stones in mortar |
| 10 plaster | smooth, uneven, flaking patches; also used for tile, timber or metal roofs |
| 11 pebble diaper | big Voronoi stones with small pebble cells in the gaps |

Masonry details, all in the shader:

- **Courses:** alternating course heights and varied block lengths when irregular. Joints measured in metres and anti-aliased.
- **Blocks:** bevelled (pillowed) edges that tilt the normal along the wall tangent and up, chipped arrises scaled by wear, faint chisel marks that fade at a distance.
- **Weathering:** rain drips, lichen, a damp splash zone up to about 2.4 m, and dirt on tops, all scaled by weather.

Hill and terrain take the site's natural rock type (granite, sandstone, basalt, limestone or laterite), never a built finish.

### Lighting

Sun with a 3x3 PCF shadow map, a sky and ground hemisphere, interior zones that darken and use lamp light, fog, and ACES tone mapping. Leaves add transmission when lit from behind.

## 4. Geometry helpers (keep these signatures)

- **Boxes and walls:**
  - `box(x,y,z,sx,sy,sz,ry)`, where y is the bottom.
  - `solid(...)` registers a wall collider; `floor(...)` registers a walkable floor.
  - `walls4(cx,cz,sx,sz,y,h,t,{e,w,n,s})` takes gap widths per side.
  - `room(x,y,z,sx,sy,sz,{t,doors:[{s:'e'|'w'|'n'|'s',w,h,off}],open,ceil,dark})`.
  - `zone(x0,x1,y0,y1,z0,z1,dark)` marks an interior.
- **Turned shapes:**
  - `lathe(x,y,z,profile,seg,rot,caps,rf)` (rf varies the radius by angle, for ribs) and `smooth(fn)` for smooth normals.
  - `ell`, `limb(p0,p1,r0,r1,seg)`, `dome`, `domeIn` (a concave carved ceiling).
  - `square(x,y,z,profile)` (a pyramid) and `kalasha`, `amalaka`.
- **Towers and roofs:**
  - `spire(x,y,z,hw,h,e,seg)` (curved rekha tower), `pidha` (tiered Kalinga roof), `dvimana` (Dravida storeys), `minirekha`.
  - `phamsana`, `hip`, `chala` (Bengal curved roof), `pitched`, `kshrine` (Kashmir shrine with gabled porches).
- **Parts and fittings:** `stairs(x0,z0,dir,width,y0,H,n)`, `pillar(x,y,z,r,h,seg,kind)`, `vault`, `wheel`, `tube` (inward-facing well shaft), `water`, `lamp`, `linga`, `nandi`, `elephant`, `rotY`.
- **Terrain:**
  - `hill({x0,x1,z0,z1,g,lines,H,keep,lawn,dryness,grass,bush,bushMin,bushOk,mouth,rock,dark,streak,green})` draws a heightfield with sheer quarried faces wherever `keep` is false.
  - It registers no colliders, so add `reg('f',...)` for raised ground.
  - Stepwells and tanks need raised ground: lift the plateau with the hill, leave the cut as a hole, and add a plug `st(0,1,0)` that shows only at stage 0.
  - For caves, use the `mouth` option plus a `room(...,{open:'s'})` behind it.

## 5. Trees, grass and sound

### Leaf cards

Leaves are leaf cards: quads whose COL holds `(u, v, kind code)`. The fragment shader cuts single leaves out of each card and discards the rest; the shadow pass discards the same pixels. Leaf kinds:

| Code | Kind |
|---|---|
| 0 | small oval |
| 1 | broad glossy |
| 2 | peepal heart with a drip tip |
| 3 | chinar lobed |
| 4 | needles |
| 5 | acacia leaflets |
| 6, 7, 8 | coconut, date and areca fronds |
| 9 | palmyra fan |
| 10 | banana |
| 11 | bamboo |
| 12 | narrow |
| 13 | shrub |
| 14 | green grass |
| 15 | dry grass |

- **Tint:** a tint of 0.94 makes a dead, brown leaf.
- **Distance:** grow leaf size and density with `fwidth`, so crowns stay full instead of thinning to specks.

### Species and planting

Species functions include: neem, tamarind, mango, teak, sal, cashew, ber, peepal, chinar, willow, banyan (with aerial roots), poplar, ashoka, deodar, casuarina, acacia/khejri, coconut, date, areca, palmyra, banana, bamboo and shrub.

Suggested species by region:

| Region | Species |
|---|---|
| Kerala, Goa, Bengal | coconut, areca, banana, mango |
| Tamil coast | coconut, palmyra, casuarina, neem |
| Deccan | neem, tamarind, acacia, teak |
| Gujarat, Rajasthan | neem, babul/khejri, date |
| Ganga plains | peepal, mango, ashoka, neem |
| Kashmir | chinar, poplar, willow, deodar |
| Assam | bamboo, areca, banana, sal |
| Balochistan | date, acacia |

- **Plant last:** hills record their ground; after the whole form is built, `plant(k)` scatters trees and about 2,000 grass tufts within 64 m.
- **Keep clear:** trees and tufts stay out of every wall and floor collider above ground, every interior zone and every pool. Trees are kept apart from each other.
- **Flat lawns:** these get trees even when `bushMin` is set for hills.

### Sound

When "Build it stone by stone" plays, a WebAudio knock fires every 0.03 of stage progress: a sine thump plus band-passed noise.

- A low thud with rumble marks the end of each stage.
- Rock-cut forms use chisel taps instead.
- Create the AudioContext inside the button click (a user gesture), and give it a Sound on/off toggle.

## 6. Form data (one entry per temple)

- **FORMS:** `k`, `name` (the type), `region`, `col`, `example` (the real temple), `built`, `line` (one plain sentence), `stats [(label, value)]`, `stages`, `eye`, `art` ("the stone, and how the art sits on it"), and `links [(title, url, tier)]`.
- **EXTRA:** `blk`, `built [(text, source title, url or None)]`, and `places [(id, name, one line)]`. The ids must match `m.places`.
- **Also set:** a short place name, the facing note, a card subtitle, the lineup order (small to tall) with label and height, the starting yaw (`yaw0`), stone and trees.
- **Build notes:** `how [(text, src, url)]` and `texts [(text, src, url)]`, shown in the "How it was built" panel.

Regional treatises to name, with dates:

| Treatise | Region and date |
|---|---|
| Mayamata | South |
| Manasara | South |
| Samarangana Sutradhara | attributed to Bhoja, 11th c., Malwa |
| Aparajitaprccha | Gujarat, under Bhima II, 1178 to 1240 |
| Shilpa Prakasha | Odisha, medieval |
| Vastusara | Thakkura Pheru, 1315, Jain |
| Prasadamandana | Mandana, Mewar, under Rana Kumbha |
| Tantrasamuccaya | Kerala, 1428 |

## 7. The stone rule

This appears as a note on the page, not as a claim about any one temple. In Mandana's Devatamurti-prakarana:

- **Masculine stone:** one colour, dense and smooth, rings like a bell. Used for lingas and images of gods.
- **Feminine stone:** thick at the base, slim at the tip, rings like a bronze cymbal. Used for pedestals and goddesses.
- **Neuter stone:** slim at the base, silent. Used for foundation stones, temple bases and tanks.

## 8. Checks before publishing

1. **Syntax:** run `node --check` on the engine, and the page's own checker.
2. **Headless renders:** Playwright with Chrome flags `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`. SwiftShader runs at about 1 fps, so wait 30 to 60 s per view and run 2 to 3 workers in parallel.
3. **What to shoot:** the outside view with auto-turn paused, each walk-in place, one stage midway, and the panel text.
4. **Watch for these problems:**
   - **Terrain blocking the camera:** the camera orbits at a distance of about `(view width)*1.35 + 30` and a height of about `0.24 * D`, so terrain must stay below that line from every side. Make mountains ridges, not walls.
   - **Coplanar faces:** a wall face that sits exactly on a hill's sheer face flickers. Inset the wall by 0.1 m.
   - **Stair gaps:** set `x0 = edge + n*run`, where `run = max(0.28, rise*1.05)`.
   - **Ceilings:** a slab across a carved dome hides it; use a frame with a hole.
   - **Roofs:** tile, timber or metal roofs must not get stone grain (set plaster type 10).
   - **Name clashes:** a helper named `T` in a data file can overwrite the theme dict `T`.
5. **Publish or export:** keep the standalone export (an OBJ download button plus the full engine) in sync with the page.