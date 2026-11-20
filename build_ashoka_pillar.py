#!/usr/bin/env python3
"""
build_ashoka_pillar.py  —  the complete Ashokan stambha, from its documented parts.

Builds the Lion Capital of Ashoka (Sarnath) + its pillar to the REAL, published
dimensions, part by part, then exports GLBs + construction stages exactly like
build_temple_forms.py.

Documented dimensions used (sources: Wikipedia "Lion Capital of Ashoka" &
"Ashoka pillar", ASI / Sarnath Museum descriptions):

    Shaft        15.25 m tall, monolithic Chunar sandstone, gentle taper
                 Ø 0.71 m at base → Ø 0.56 m at top, set straight in the earth
                 with NO base/pedestal (shaft "grows from the ground").
    Capital      2.1 m tall overall, one block, Mauryan mirror polish. Parts:
      · Bell      inverted lotus (padma) bell, ~0.61 m high
      · Abacus    round drum, Ø 0.86 m, 0.34 m high — in relief: the four
                  animals (lion W, elephant E, bull S, horse N by tradition)
                  each separated by a 24-spoke Dharmachakra
      · Lions     four addorsed Asiatic lions, ~1.1 m, facing the four quarters
      · Chakra    the great crowning 32-spoke Dharmachakra (now LOST — the
                  abacus top has a square dowel slot for it); reconstructed here
                  and clearly flagged as a reconstruction.

Outputs (assets/temples-3d/):
    ashoka_pillar.glb         the whole stambha (shaft + capital + crowning wheel)
    ashoka_pillar_s1..sN.glb  construction stages (watch it rise)
    ashoka_capital.glb        just the Lion Capital (the State-Emblem object)
    ashoka_chakra.glb         the crowning Dharmachakra alone

Reproducible — run headless (does NOT touch the current scene's other work; it
wipes into a fresh throwaway scene per the temple-forms pattern):

    /Applications/Blender.app/Contents/MacOS/Blender --background \
        --python build_ashoka_pillar.py -- [targets...]

Targets: pillar | capital | chakra | all   (default: all)

NOTE this is ORIGINAL geometry inspired by the real monument for educational
3D use — it is NOT a scan and NOT the official State Emblem artwork.
"""

import bpy, bmesh, math, sys, os
import mathutils


def mathutils_rot_x(rad):
    """4×4 rotation matrix about X — used to stand lathed rings vertical."""
    return mathutils.Matrix.Rotation(rad, 4, 'X')


HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "assets", "temples-3d")
os.makedirs(OUT, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# scene / material helpers  (same conventions as build_temple_forms.py)
# ─────────────────────────────────────────────────────────────────────────────
_MATS = {}


def wipe():
    if bpy.context.object and bpy.context.object.mode != "OBJECT":
        bpy.ops.object.mode_set(mode="OBJECT")
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()
    for block in (bpy.data.meshes, bpy.data.curves):
        for b in list(block):
            if b.users == 0:
                block.remove(b)


def mat(name, rgb, rough=0.85, metal=0.0, emit=None):
    key = (name, rgb, rough, metal, emit)
    if key in _MATS:
        return _MATS[key]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*rgb, 1.0)
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metal
    if emit is not None:
        ecol, estr = emit
        bsdf.inputs["Emission Color"].default_value = (*ecol, 1.0)
        bsdf.inputs["Emission Strength"].default_value = estr
    _MATS[key] = m
    return m


# Chunar buff sandstone with the famous Mauryan mirror polish → lowish roughness.
# The capital is the same stone but reads a touch lighter/polished; the lost
# crowning wheel we render as a weathered gilt-bronze reconstruction.
SANDSTONE  = lambda: mat("chunar_sandstone", (0.82, 0.69, 0.47), 0.42)
POLISH     = lambda: mat("mauryan_polish",   (0.86, 0.74, 0.53), 0.26)
POLISH_DK  = lambda: mat("polish_shadow",    (0.72, 0.58, 0.40), 0.38)
RECON_GOLD = lambda: mat("recon_bronze",     (0.80, 0.62, 0.30), 0.35, 0.8,
                         emit=((0.9, 0.68, 0.28), 0.25))


def apply(obj, material):
    obj.data.materials.clear()
    obj.data.materials.append(material)


def join(objs, name):
    objs = [o for o in objs if o is not None]
    if not objs:
        return None
    if len(objs) == 1:
        objs[0].name = name
        return objs[0]
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    objs[0].name = name
    return objs[0]


# ─────────────────────────────────────────────────────────────────────────────
# primitive builders
# ─────────────────────────────────────────────────────────────────────────────
def _new(mesh_name):
    me = bpy.data.meshes.new(mesh_name)
    ob = bpy.data.objects.new(mesh_name, me)
    bpy.context.collection.objects.link(ob)
    return ob, me


def cyl(r, h, z=0.0, x=0.0, y=0.0, seg=64, material=None, cap=True):
    ob, me = _new("cyl")
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=cap, segments=seg, radius1=r, radius2=r, depth=h)
    for v in bm.verts:
        v.co.z += h / 2 + z
        v.co.x += x; v.co.y += y
    bm.to_mesh(me); bm.free()
    if material: apply(ob, material)
    return ob


def cone(r1, r2, h, z=0.0, x=0.0, y=0.0, seg=64, material=None, cap=True):
    ob, me = _new("cone")
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=cap, segments=seg, radius1=r1, radius2=r2, depth=h)
    for v in bm.verts:
        v.co.z += h / 2 + z
        v.co.x += x; v.co.y += y
    bm.to_mesh(me); bm.free()
    if material: apply(ob, material)
    return ob


def box(sx, sy, sz, z=0.0, x=0.0, y=0.0, rz=0.0, material=None):
    ob, me = _new("box")
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= sx; v.co.y *= sy; v.co.z *= sz
        v.co.z += sz / 2 + z
    bm.to_mesh(me); bm.free()
    ob.location = (x, y, 0)
    ob.rotation_euler = (0, 0, rz)
    if material: apply(ob, material)
    return ob


def profile_solid(profile, z=0.0, seg=96, material=None):
    """Lathe a (radius, height) profile about Z. profile sampled bottom→top."""
    ob, me = _new("profile")
    bm = bmesh.new()
    verts = [bm.verts.new((max(r, 1e-4), 0, h + z)) for (r, h) in profile]
    for a, b in zip(verts, verts[1:]):
        bm.edges.new((a, b))
    geom = bm.verts[:] + bm.edges[:]
    bmesh.ops.spin(bm, geom=geom, angle=math.radians(360), steps=seg,
                   axis=(0, 0, 1), cent=(0, 0, 0))
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
    bmesh.ops.contextual_create(bm, geom=bm.edges[:])
    bm.normal_update()
    bm.to_mesh(me); bm.free()
    if material: apply(ob, material)
    return ob


def sphere(r, z=0.0, x=0.0, y=0.0, seg=28, material=None, squash=1.0):
    ob, me = _new("sph")
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=seg // 2, radius=r)
    for v in bm.verts:
        v.co.z *= squash
        v.co.z += z
        v.co.x += x; v.co.y += y
    bm.to_mesh(me); bm.free()
    if material: apply(ob, material)
    return ob


def dharmachakra(radius, thick, spokes, z=0.0, x=0.0, y=0.0,
                 axis="z", material=None, hub_r=None):
    """A Dharmachakra built flat about Z (disc in the XY plane, thickness `thick`
    along Z), centred at origin. Rim = lathed annular ring, hub = short cylinder,
    spokes = thin radial bars made directly in ONE bmesh (no per-spoke object
    transforms — that was the bug). Caller rotates via `axis` and places via x/y/z."""
    hub_r = hub_r if hub_r else radius * 0.16
    half = thick * 0.5
    rim_w = thick * 0.9           # radial width of the rim band
    spoke_w = thick * 0.42        # half-width of a spoke
    spoke_t = thick * 0.42        # half-thickness (along Z) of a spoke

    parts = []
    # --- rim: lathe an annular rectangle cross-section (inner Ro-rimw → Ro) ---
    ro = radius
    ri = radius - rim_w
    rim_prof = [(ri, -half), (ro, -half), (ro, half), (ri, half), (ri, -half)]
    ob, me = _new("rim")
    bm = bmesh.new()
    vs = [bm.verts.new((r, 0, z)) for (r, z) in rim_prof]
    for a, b in zip(vs, vs[1:]):
        bm.edges.new((a, b))
    geom = bm.verts[:] + bm.edges[:]
    bmesh.ops.spin(bm, geom=geom, angle=math.radians(360), steps=96,
                   axis=(0, 0, 1), cent=(0, 0, 0))
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bm.normal_update()
    bm.to_mesh(me); bm.free()
    parts.append(ob)

    # --- hub ---
    parts.append(cyl(hub_r, thick, z=-half, seg=28, material=material))

    # --- spokes: all in one bmesh, each a flat radial bar from hub to rim ---
    ob2, me2 = _new("spokes")
    bm2 = bmesh.new()
    r0 = hub_r * 0.9
    r1 = ri + 1e-3
    for k in range(spokes):
        a = 2 * math.pi * k / spokes
        ca, sa = math.cos(a), math.sin(a)
        # perpendicular direction for the bar's width
        px, py = -sa, ca
        for (rr, zz) in [(r0, 0), (r1, 0)]:
            pass
        # 8 corners of a thin radial box between r0 and r1
        corners = []
        for rr in (r0, r1):
            for wsign in (-1, 1):
                for zsign in (-1, 1):
                    x = ca * rr + px * spoke_w * wsign
                    y = sa * rr + py * spoke_w * wsign
                    z = spoke_t * zsign
                    corners.append(bm2.verts.new((x, y, z)))
        # corners order: [r0(-,-),r0(-,+),r0(+,-),r0(+,+), r1(-,-),r1(-,+),r1(+,-),r1(+,+)]
        c = corners
        faces = [(c[0],c[1],c[3],c[2]), (c[4],c[6],c[7],c[5]),
                 (c[0],c[2],c[6],c[4]), (c[1],c[5],c[7],c[3]),
                 (c[0],c[4],c[5],c[1]), (c[2],c[3],c[7],c[6])]
        for f in faces:
            try: bm2.faces.new(f)
            except ValueError: pass
    bm2.normal_update()
    bm2.to_mesh(me2); bm2.free()
    if material: apply(ob2, material)
    parts.append(ob2)

    w = join(parts, "chakra")
    if material: apply(w, material)
    # orient + place via transforms, then bake
    if axis == "x":
        w.rotation_euler = (0, math.radians(90), 0)
    elif axis == "y":
        w.rotation_euler = (math.radians(90), 0, 0)
    w.location = (x, y, z)
    bpy.context.view_layer.update()
    bpy.ops.object.select_all(action="DESELECT")
    w.select_set(True)
    bpy.context.view_layer.objects.active = w
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    return w


# ─────────────────────────────────────────────────────────────────────────────
#  ONE stylised addorsed lion (seated, facing +X). Built from a few solids so it
#  reads as a lion at a glance without a sculpt — mane as a fluted collar, blocky
#  muzzle, chest, forelegs. Four of these are placed back-to-back (addorsed).
# ─────────────────────────────────────────────────────────────────────────────
def lion(material):
    """One seated Asiatic lion facing +X, built to read clearly in silhouette.
    Origin at the back (haunch) so four lions placed addorsed meet back-to-back
    at the drum centre and their heads/chests face outward. Height ≈ LION_H."""
    P = []
    m = material

    # --- ONE continuous seated body: overlapping masses from haunch (back/low)
    #     up through the barrel to a deep upright chest (front/high). Generous
    #     overlap so it fuses into a single silhouette from every side. ---
    P.append(sphere(0.24, z=0.26, x=-0.04, seg=22, material=m, squash=1.2))   # rump
    body = sphere(0.24, z=0.44, x=0.12, seg=24, material=m)                    # barrel
    body.scale = (1.35, 0.96, 1.3)
    P.append(body)
    low_chest = sphere(0.235, z=0.60, x=0.24, seg=22, material=m)             # belly/chest
    low_chest.scale = (1.1, 0.95, 1.25)
    P.append(low_chest)
    chest = sphere(0.205, z=0.76, x=0.30, seg=22, material=m)                 # upper chest
    chest.scale = (1.05, 0.95, 1.2)
    P.append(chest)

    # --- the MANE: three stacked lathed collars of flame-like locks around the
    #     neck (Mauryan convention). Each collar is a lathed star-ridged ring,
    #     built reliably in one bmesh so nothing scatters. ---
    neck_z, neck_x = 0.95, 0.34
    P.append(sphere(0.165, z=neck_z, x=neck_x, seg=18, material=m))     # neck core
    for (cz, cr, teeth, tl) in [(0.84, 0.20, 18, 0.05),
                                (0.97, 0.21, 20, 0.055),
                                (1.09, 0.185, 18, 0.05)]:
        ob, me = _new("mane")
        bm = bmesh.new()
        inner = []
        outer = []
        for i in range(teeth):
            a = 2 * math.pi * i / teeth
            inner.append(bm.verts.new((math.cos(a) * cr, math.sin(a) * cr, 0)))
        for i in range(teeth):
            a = 2 * math.pi * (i + 0.5) / teeth      # tips between inner verts
            outer.append(bm.verts.new((math.cos(a) * (cr + tl),
                                       math.sin(a) * (cr + tl), 0)))
        # top & bottom rings of the band give it thickness
        topv = [bm.verts.new((v.co.x, v.co.y,  0.05)) for v in inner]
        botv = [bm.verts.new((v.co.x, v.co.y, -0.05)) for v in inner]
        for i in range(teeth):
            j = (i + 1) % teeth
            # a pointed tooth face (inner i, tip, inner j) top and bottom
            try: bm.faces.new((topv[i], outer[i], topv[j]))
            except ValueError: pass
            try: bm.faces.new((botv[j], outer[i], botv[i]))
            except ValueError: pass
            # band wall between top and bottom inner rings
            try: bm.faces.new((topv[i], topv[j], botv[j], botv[i]))
            except ValueError: pass
        bm.normal_update()
        bm.to_mesh(me); bm.free()
        # the ring already encircles the vertical neck (lies in XY around Z);
        # just lift it to the collar height and centre on the neck axis.
        ob.location = (neck_x, 0, cz)
        if m: apply(ob, m)
        bpy.context.view_layer.objects.active = ob
        bpy.ops.object.select_all(action="DESELECT"); ob.select_set(True)
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        P.append(ob)

    # --- head, muzzle, jaw facing +x — nestled into the top mane collar ---
    P.append(sphere(0.145, z=1.11, x=0.40, seg=20, material=m))          # skull
    P.append(cone(0.095, 0.07, 0.17, z=1.07, x=0.54, seg=14, material=m))# muzzle
    jaw = box(0.12, 0.15, 0.055, z=1.00, x=0.52, material=m)             # open lower jaw
    P.append(jaw)
    # brow / snarl ridge
    P.append(box(0.07, 0.17, 0.04, z=1.17, x=0.46, material=m))
    # --- ears ---
    for sy in (-1, 1):
        P.append(sphere(0.04, z=1.22, x=0.34, y=0.10*sy, seg=10, material=m))

    # --- forelegs: straight pillars down the front to the paws, aligned ---
    for sy in (-1, 1):
        P.append(cyl(0.058, 0.82, z=0.0, x=0.44, y=0.12*sy, seg=14, material=m))
        paw = sphere(0.072, z=0.03, x=0.46, y=0.12*sy, seg=12, material=m, squash=0.6)
        paw.scale = (1.4, 1.0, 1.0)
        P.append(paw)

    L = join(P, "lion")
    if material: apply(L, material)
    return L


# ═════════════════════════════════════════════════════════════════════════════
#  PART BUILDERS — each returns object(s). Dimensions in METRES, to the sources.
# ═════════════════════════════════════════════════════════════════════════════
# capital assembly sits with its BELL base at z=0; the shaft is built below it.

BELL_H    = 0.61      # inverted lotus bell height
ABA_H     = 0.34      # abacus drum height
ABA_R     = 0.43      # abacus radius (Ø0.86 m)
LION_H    = 1.10      # lion height
CAP_TOP   = BELL_H + ABA_H + LION_H   # ≈ 2.05 m → matches the ~2.1 m capital
SHAFT_H   = 15.25
R_BASE    = 0.355     # Ø0.71 m
R_TOP     = 0.28      # Ø0.56 m


def p_bell(z0=0.0):
    """The campaniform inverted-lotus (padma) bell. Its NARROW neck is at the
    BOTTOM, meeting the shaft; it flares in a smooth concave sweep UP and OUT to
    a wide lip that seats the abacus — a downturned lotus. A beaded cable-necking
    torus cinches the join to the shaft (a Mauryan signature)."""
    neck = R_TOP * 0.92          # tight neck just above the shaft
    lip = ABA_R * 0.98           # wide rim under the abacus
    # concave campaniform sweep: slow at the neck, accelerating outward to the lip
    prof = []
    N = 10
    for i in range(N + 1):
        t = i / N                               # 0=neck(bottom) → 1=lip(top)
        # ease-out power curve gives the lotus's concave flare
        r = neck + (lip - neck) * (t ** 1.7)
        h = BELL_H * t
        prof.append((r, h))
    # a small everted lip ring right at the top (the lotus edge)
    prof[-1] = (lip, BELL_H - 0.03)
    prof.append((lip * 0.97, BELL_H))
    bell = profile_solid(prof, z=z0, seg=96, material=POLISH())

    extras = [bell]
    # three lotus-petal ridges banding the flare (shallow relief rings)
    for frac in (0.45, 0.62, 0.80):
        rr = neck + (lip - neck) * (frac ** 1.7)
        ring = profile_solid([(rr * 1.0, 0), (rr * 1.035, 0.018), (rr * 1.0, 0.036)],
                             z=z0 + BELL_H * frac, seg=96, material=POLISH_DK())
        extras.append(ring)
    # beaded cable-necking torus where bell meets shaft
    cable = profile_solid([(neck * 1.05, 0), (neck * 1.18, 0.045),
                           (neck * 1.05, 0.09)], z=z0 - 0.02, seg=96, material=POLISH_DK())
    extras.append(cable)
    return extras


def p_abacus(z0):
    """Round abacus drum, Ø0.86, 0.34 high, with two relief rules round the
    bottom (as recorded) and the four 24-spoke chakras standing proud in relief."""
    parts = []
    drum = cyl(ABA_R, ABA_H, z=z0, seg=96, material=POLISH())
    parts.append(drum)
    # two parallel relief rules near the bottom
    for zz in (z0 + 0.05, z0 + 0.10):
        parts.append(profile_solid([(ABA_R * 1.002, 0), (ABA_R * 1.03, 0.012),
                                     (ABA_R * 1.002, 0.024)], z=zz, seg=96, material=POLISH_DK()))
    # four 24-spoke chakras in relief around the drum, between the four animals
    for k in range(4):
        a = math.pi / 4 + k * math.pi / 2     # offset so animals take the axes
        wheel = dharmachakra(0.11, 0.05, 24, material=POLISH_DK())
        wheel.rotation_euler = (math.radians(90), 0, a)   # stand vertical, face out
        wheel.location = (math.cos(a) * (ABA_R + 0.012),
                          math.sin(a) * (ABA_R + 0.012), z0 + ABA_H * 0.55)
        bpy.context.view_layer.objects.active = wheel
        bpy.ops.object.select_all(action="DESELECT"); wheel.select_set(True)
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        parts.append(wheel)
    # the four animals in relief on the axes (simple blocked forms, read at scale)
    parts += p_abacus_animals(z0)
    return parts


def p_abacus_animals(z0):
    """Lion(W)/Elephant(E)/Bull(S)/Horse(N) — small relief blocks on the axes.
    Kept simple + readable; they ride proud of the drum on the four axes."""
    A = []
    zc = z0 + ABA_H * 0.55
    specs = [(0.0, "horse"), (math.pi / 2, "bull"),
             (math.pi, "elephant"), (3 * math.pi / 2, "lion")]
    for a, kind in specs:
        bx = math.cos(a) * (ABA_R + 0.02)
        by = math.sin(a) * (ABA_R + 0.02)
        body = sphere(0.12, z=zc, x=bx, y=by, seg=16, material=POLISH_DK(), squash=0.62)
        body.scale = (1.5, 0.8, 1.0)
        body.rotation_euler = (0, 0, a)
        A.append(body)
        if kind == "elephant":   # trunk
            A.append(cone(0.03, 0.01, 0.16, z=zc - 0.02,
                          x=bx + math.cos(a) * 0.12, y=by + math.sin(a) * 0.12,
                          seg=10, material=POLISH_DK()))
        if kind == "bull":       # hump
            A.append(sphere(0.05, z=zc + 0.08, x=bx, y=by, seg=10, material=POLISH_DK()))
    return A


def p_lions(z0):
    """Four addorsed Asiatic lions on the abacus, facing the four quarters."""
    L = []
    for k in range(4):
        a = k * math.pi / 2
        lk = lion(POLISH())
        # move the lion out so haunches meet back-to-back at centre
        lk.location = (0, 0, z0)
        lk.rotation_euler = (0, 0, a)
        bpy.context.view_layer.objects.active = lk
        bpy.ops.object.select_all(action="DESELECT"); lk.select_set(True)
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        # nudge outward along its facing so four bodies share the drum
        for v in lk.data.vertices:
            v.co.x += math.cos(a) * 0.14
            v.co.y += math.sin(a) * 0.14
        lk.data.update()
        L.append(lk)
    return L


def p_crowning_chakra(z_top):
    """The great Dharmachakra that once crowned the lions — now LOST; the abacus
    top has a square dowel slot for it. Reconstructed as a 32-spoke wheel standing
    upright on the lions' backs. Flagged visually by the reconstruction material."""
    w = dharmachakra(0.46, 0.08, 32, material=RECON_GOLD())
    # it stood as a horizontal disc crowning the capital (the ASI reconstruction
    # at Sarnath Museum mounts it flat atop the four lions)
    w.location = (0, 0, z_top + 0.06)
    bpy.context.view_layer.objects.active = w
    bpy.ops.object.select_all(action="DESELECT"); w.select_set(True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    # the central square dowel it seated on
    dowel = box(0.14, 0.14, 0.12, z=z_top, material=RECON_GOLD())
    return [w, dowel]


def p_shaft(z_bell_base):
    """The monolithic tapered shaft, built DOWNWARD from the bell base to z=0 of
    the ground. Its top Ø = R_TOP meets the bell neck; base Ø = R_BASE."""
    prof = [(R_BASE, 0.0), (R_TOP, SHAFT_H)]
    shaft = profile_solid(prof, z=0.0, seg=96, material=SANDSTONE())
    # the bell base must sit at SHAFT_H; return shaft already grounded at z=0
    return shaft


# ═════════════════════════════════════════════════════════════════════════════
#  ASSEMBLIES
# ═════════════════════════════════════════════════════════════════════════════
def normalise(obj, target_h=10.0, by="z"):
    """Center in XY, drop to z=0, scale so the chosen dimension == target_h.
    by='z' scales by height (tall objects); by='xy' scales by max footprint
    diameter (flat discs like a lone wheel, which have ~no height)."""
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    xs = [v.co.x for v in obj.data.vertices]
    ys = [v.co.y for v in obj.data.vertices]
    zs = [v.co.z for v in obj.data.vertices]
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    zmin = min(zs)
    h = max(max(zs) - zmin, 1e-3)
    if by == "xy":
        span = max(max(xs) - min(xs), max(ys) - min(ys), 1e-3)
        s = target_h / span
    else:
        s = target_h / h
    for v in obj.data.vertices:
        v.co.x = (v.co.x - cx) * s
        v.co.y = (v.co.y - cy) * s
        v.co.z = (v.co.z - zmin) * s
    obj.data.update()


def export(obj, name):
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    path = os.path.join(OUT, name + ".glb")
    bpy.ops.export_scene.gltf(filepath=path, export_format="GLB",
                              use_selection=True, export_yup=True,
                              export_apply=True, export_extras=False)
    print("  exported", name + ".glb")


def build_capital(z_base=0.0, with_chakra=True):
    """The Lion Capital alone (bell→abacus→lions[→chakra]). Returns list of objs."""
    objs = []
    objs += p_bell(z0=z_base)
    aba_z = z_base + BELL_H
    objs += p_abacus(aba_z)
    lion_z = aba_z + ABA_H
    objs += p_lions(lion_z)
    if with_chakra:
        objs += p_crowning_chakra(lion_z + LION_H)
    return objs


def build_pillar(with_chakra=True):
    objs = [p_shaft(SHAFT_H)]
    objs += build_capital(z_base=SHAFT_H, with_chakra=with_chakra)
    return objs


def do_pillar():
    print("building ashoka_pillar (full stambha, staged)")
    # staged: shaft → +bell → +abacus → +lions → +chakra
    stages = [
        ("shaft",   lambda: [p_shaft(SHAFT_H)]),
        ("bell",    lambda: p_bell(z0=SHAFT_H)),
        ("abacus",  lambda: p_abacus(SHAFT_H + BELL_H)),
        ("lions",   lambda: p_lions(SHAFT_H + BELL_H + ABA_H)),
        ("chakra",  lambda: p_crowning_chakra(SHAFT_H + BELL_H + ABA_H + LION_H)),
    ]
    n = len(stages)
    for k in range(1, n + 1):
        wipe()
        objs = []
        for (_, fn) in stages[:k]:
            objs += fn()
        whole = join(objs, "ashoka_pillar")
        normalise(whole, target_h=12.0)
        export(whole, "ashoka_pillar" if k == n else f"ashoka_pillar_s{k}")


def do_capital():
    # The Lion Capital SURVIVES as the four lions on the abacus & bell — the
    # crowning wheel is lost, and this is also how the State Emblem depicts it.
    # So the capital export is the museum state (no wheel); the reconstructed
    # wheel is the separate ashoka_chakra.glb, and the full pillar shows it in
    # place as a flagged reconstruction.
    print("building ashoka_capital (museum state — four lions, no crowning wheel)")
    wipe()
    objs = build_capital(z_base=0.0, with_chakra=False)
    whole = join(objs, "ashoka_capital")
    normalise(whole, target_h=6.0)
    export(whole, "ashoka_capital")


def do_chakra():
    print("building ashoka_chakra (the crowning Dharmachakra, reconstructed)")
    wipe()
    objs = p_crowning_chakra(0.0)
    whole = join(objs, "ashoka_chakra")
    normalise(whole, target_h=4.0, by="xy")   # a flat disc → scale by diameter
    export(whole, "ashoka_chakra")


def main():
    argv = sys.argv
    targets = argv[argv.index("--") + 1:] if "--" in argv else []
    if not targets or "all" in targets:
        targets = ["pillar", "capital", "chakra"]
    if "pillar" in targets:  do_pillar()
    if "capital" in targets: do_capital()
    if "chakra" in targets:  do_chakra()
    print("done.")


if __name__ == "__main__":
    main()
