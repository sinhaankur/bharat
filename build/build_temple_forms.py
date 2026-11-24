#!/usr/bin/env python3
"""
build_temple_forms.py  —  procedural, math-accurate 3D temple archetypes.

Builds every archetype shown on temple-forms.html to the *exact* math the page
describes (curvilinear shikhara power-curve, vimana linear taper, stupa
hemisphere, ziggurat receding terraces, etc.), assigns stone/marble/gold
materials, and exports:

    assets/temples-3d/<id>.glb            finished form
    assets/temples-3d/<id>_s1..sN.glb     construction stages (watch-it-built)
    assets/temples-3d/<id>_cut.glb        cutaway (for the forms that have one)

Reproducible — run headless:

    /Applications/Blender.app/Contents/MacOS/Blender --background \
        --python build_temple_forms.py -- [id1 id2 ...]

With no ids after `--` it builds everything. Pass ids to rebuild a subset.
"""

import bpy, bmesh, math, sys, os, json

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "assets", "temples-3d")
os.makedirs(OUT, exist_ok=True)

# real, sourced dimensions of a canonical example per form (see temple_dims.json)
try:
    DIMS = json.load(open(os.path.join(HERE, "temple_dims.json")))["forms"]
except Exception as _e:
    print("warn: temple_dims.json not loaded:", _e)
    DIMS = {}

# ─────────────────────────────────────────────────────────────────────────────
# scene / material helpers
# ─────────────────────────────────────────────────────────────────────────────

_MATS = {}

def wipe():
    """Empty the scene so each form is built fresh."""
    if bpy.context.object and bpy.context.object.mode != "OBJECT":
        bpy.ops.object.mode_set(mode="OBJECT")
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()
    for block in (bpy.data.meshes, bpy.data.curves):
        for b in list(block):
            if b.users == 0:
                block.remove(b)


def mat(name, rgb, rough=0.85, metal=0.0, emit=None):
    """A cached Principled material. `emit` = (rgb, strength) for the gold finial."""
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


# palette (sandstone / marble / granite / gold / dark cella …)
SANDSTONE  = lambda: mat("sandstone",  (0.80, 0.62, 0.42), 0.9)
REDSTONE   = lambda: mat("redstone",   (0.72, 0.36, 0.26), 0.9)
GRANITE    = lambda: mat("granite",    (0.55, 0.54, 0.52), 0.8)
MARBLE     = lambda: mat("marble",     (0.93, 0.93, 0.95), 0.35)
DARKSTONE  = lambda: mat("darkstone",  (0.30, 0.29, 0.30), 0.9)
BASALT     = lambda: mat("basalt",     (0.22, 0.22, 0.24), 0.85)
MUDBRICK   = lambda: mat("mudbrick",   (0.66, 0.48, 0.34), 0.95)
LIMESTONE  = lambda: mat("limestone",  (0.86, 0.82, 0.72), 0.8)
GOLD       = lambda: mat("gold",       (1.00, 0.78, 0.22), 0.25, 0.9, emit=((1.0, 0.72, 0.2), 1.2))
GRASS      = lambda: mat("grass",      (0.30, 0.40, 0.22), 1.0)
CELLA_DARK = lambda: mat("cella",      (0.08, 0.07, 0.07), 1.0)


def apply(obj, material):
    obj.data.materials.clear()
    obj.data.materials.append(material)


def join(objs, name):
    """Join a list of objects into one, return the joined object."""
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
# primitive builders (return a mesh object, material applied)
# ─────────────────────────────────────────────────────────────────────────────

def _new(mesh_name):
    me = bpy.data.meshes.new(mesh_name)
    ob = bpy.data.objects.new(mesh_name, me)
    bpy.context.collection.objects.link(ob)
    return ob, me


def box(sx, sy, sz, z=0.0, x=0.0, y=0.0, material=None):
    """Axis-aligned box; z is the BOTTOM of the box (sits on z)."""
    ob, me = _new("box")
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= sx; v.co.y *= sy; v.co.z *= sz
        v.co.z += sz / 2 + z
        v.co.x += x; v.co.y += y
    bm.to_mesh(me); bm.free()
    if material: apply(ob, material)
    return ob


def cyl(r, h, z=0.0, x=0.0, y=0.0, seg=48, material=None, cap=True):
    ob, me = _new("cyl")
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=cap, segments=seg,
                          radius1=r, radius2=r, depth=h)
    for v in bm.verts:
        v.co.z += h / 2 + z
        v.co.x += x; v.co.y += y
    bm.to_mesh(me); bm.free()
    if material: apply(ob, material)
    return ob


def cone(r1, r2, h, z=0.0, x=0.0, y=0.0, seg=48, material=None, cap=True):
    ob, me = _new("cone")
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=cap, segments=seg,
                          radius1=r1, radius2=r2, depth=h)
    for v in bm.verts:
        v.co.z += h / 2 + z
        v.co.x += x; v.co.y += y
    bm.to_mesh(me); bm.free()
    if material: apply(ob, material)
    return ob


def profile_solid(profile, z=0.0, seg=64, material=None, square=False):
    """
    Lathe / extrude a (radius, height) profile about Z.
    profile: list of (r, h) sampled bottom→top (h is height ABOVE z base).
    square=True builds a square-plan pyramid stack instead of round (spin).
    """
    if square:
        return _square_loft(profile, z, material)
    ob, me = _new("profile")
    bm = bmesh.new()
    # build one edge-strip of the profile, then spin it
    verts = [bm.verts.new((max(r, 1e-4), 0, h + z)) for (r, h) in profile]
    for a, b in zip(verts, verts[1:]):
        bm.edges.new((a, b))
    geom = bm.verts[:] + bm.edges[:]
    bmesh.ops.spin(bm, geom=geom, angle=math.radians(360), steps=seg,
                   axis=(0, 0, 1), cent=(0, 0, 0))
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
    # cap top & bottom
    bmesh.ops.contextual_create(bm, geom=bm.edges[:])
    bm.normal_update()
    bm.to_mesh(me); bm.free()
    if material: apply(ob, material)
    return ob


def _square_loft(profile, z, material):
    """Loft a square cross-section along a (halfwidth, height) profile."""
    ob, me = _new("loft")
    bm = bmesh.new()
    rings = []
    for (r, h) in profile:
        r = max(r, 1e-4)
        ring = [bm.verts.new((sx * r, sy * r, h + z))
                for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
        rings.append(ring)
    for lo, hi in zip(rings, rings[1:]):
        for i in range(4):
            j = (i + 1) % 4
            bm.faces.new((lo[i], lo[j], hi[j], hi[i]))
    bm.faces.new(rings[0][::-1])   # bottom cap
    bm.faces.new(rings[-1])        # top cap
    bm.normal_update()
    bm.to_mesh(me); bm.free()
    if material: apply(ob, material)
    return ob


def disc(r, h, z=0.0, seg=48, material=None, ribs=0):
    """A flat disc (amalaka). ribs>0 gives a torus-ish fluted profile."""
    prof = [(r * 0.7, 0), (r, h * 0.5), (r * 0.7, h)]
    o = profile_solid(prof, z=z, seg=seg, material=material)
    return o


def sphere(r, z=0.0, x=0.0, y=0.0, seg=32, material=None, squash=1.0):
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


def wheel(radius, thick, spokes=16, z=0.0, x=0.0, y=0.0, material=None):
    """A chariot wheel standing in the X-plane (rolls along Y). Rim + spokes."""
    parts = []
    # rim = a torus rotated to stand vertical (axis along X)
    ob, me = _new("rim")
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=False, segments=40,
                          radius1=radius, radius2=radius, depth=thick)
    bm.to_mesh(me); bm.free()
    ob.rotation_euler = (0, math.radians(90), 0)
    parts.append(ob)
    hub = cyl(radius * 0.16, thick * 1.2, seg=20, material=material)
    hub.rotation_euler = (0, math.radians(90), 0)
    parts.append(hub)
    for k in range(spokes):
        a = 2 * math.pi * k / spokes
        sp = box(thick * 0.5, radius * 0.92, thick * 0.35, material=material)
        sp.location = (0, 0, radius * 0)  # centered
        sp.rotation_euler = (a, math.radians(90), 0)
        parts.append(sp)
    w = join(parts, "wheel")
    if material: apply(w, material)
    w.location = (x, y, z)
    bpy.context.view_layer.update()
    return w


# ─────────────────────────────────────────────────────────────────────────────
# finishing: normalise + export
# ─────────────────────────────────────────────────────────────────────────────

def normalise(obj, target_h=10.0):
    """Center on origin in XY, drop to Z=0, scale to ~target_h tall."""
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    # bounding box in world space
    xs = [v.co.x for v in obj.data.vertices]
    ys = [v.co.y for v in obj.data.vertices]
    zs = [v.co.z for v in obj.data.vertices]
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    zmin = min(zs)
    h = max(max(zs) - zmin, 1e-3)
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
    bpy.ops.export_scene.gltf(
        filepath=path, export_format="GLB",
        use_selection=True, export_yup=True,
        export_apply=True, export_extras=False,
    )
    print("  exported", name + ".glb")


def build_form(spec):
    """
    spec = {
      "id": str,
      "parts": [ (part_name, builder_fn), ... ]   # stages
      "cumulative": bool (default True),          # False = each fn is a full stage
      "cut": optional builder_fn -> object        # cutaway
    }
    Cumulative (additive) forms: stage k = parts[:k] joined (watch it rise).
    Non-cumulative (subtractive) forms: stage k = parts[k]() is the WHOLE model
    at that step — used for rock-cut forms where earlier rock is REMOVED.
    Builds stages _s1.._sN, the finished <id>.glb, and _cut.glb.
    """
    fid = spec["id"]
    parts = spec["parts"]
    cumulative = spec.get("cumulative", True)
    n = len(parts)
    print(f"building {fid}  ({n} stages{'' if cumulative else ', subtractive'})")

    for k in range(1, n + 1):
        wipe()
        objs = []
        chosen = parts[:k] if cumulative else [parts[k - 1]]
        for (_, fn) in chosen:
            r = fn()
            if isinstance(r, (list, tuple)):
                objs.extend(r)
            elif r is not None:
                objs.append(r)
        whole = join(objs, fid)
        normalise(whole)
        if k == n:
            export(whole, fid)          # finished form
        else:
            export(whole, f"{fid}_s{k}")  # stage

    # cutaway
    if spec.get("cut"):
        wipe()
        r = spec["cut"]()
        objs = r if isinstance(r, (list, tuple)) else [r]
        whole = join([o for o in objs if o], fid + "_cut")
        normalise(whole)
        export(whole, fid + "_cut")


# ═════════════════════════════════════════════════════════════════════════════
#  FORMS — each returns a spec.  Math annotations match temple-forms.html STAGES.
# ═════════════════════════════════════════════════════════════════════════════

def f_nagara():
    """
    Curvilinear shikhara:  w = W·(1 − t)^1.35  as height fraction t → 1.
    Amalaka radius ≈ 1/5 of base. East-facing mandapa porch.
    """
    W, H = 2.0, 7.0  # base half-width, tower height

    def jagati():
        return box(6.4, 6.4, 0.8, z=0.0, material=SANDSTONE())

    def garbha():
        # small dark cube sanctum, sits inside base of tower
        return box(2.0, 2.0, 2.2, z=0.8, material=SANDSTONE())

    def shikhara():
        # Nagara curvilinear beehive: stays wide low, then curves sharply in near
        # the top. w = W·(1 − t^e) with e = curve_exponent gives the convex bulge
        # (a plain (1−t)^e is too conical). Small waviness = the bhumi ribs.
        e = DIMS.get("nagara", {}).get("curve_exponent", 1.35)
        steps = 60
        prof = []
        for i in range(steps + 1):
            t = i / steps
            w = W * (1 - t ** (1 / e)) ** 0.9      # convex profile → beehive bulge
            w *= 1 + 0.02 * math.cos(t * math.pi * 12)  # faint ribbing
            prof.append((max(w, 0.05), t * H))
        # 12-gon spin gives the characteristic vertical faceting (ratha offsets)
        tower = profile_solid(prof, z=1.0, seg=24, material=SANDSTONE())
        return tower

    def amalaka_kalasha():
        parts = []
        aR = W / 5 * 2.0  # amalaka radius ~1/5 base (base full width = 2W)
        amk = disc(aR, 0.5, z=1.0 + H - 0.1, seg=24, material=SANDSTONE())
        parts.append(amk)
        # kalasha pot finial (gold)
        pot = sphere(aR * 0.55, z=1.0 + H + 0.45, squash=1.15, material=GOLD())
        tip = cone(aR * 0.3, 0.02, 0.6, z=1.0 + H + 0.75, seg=16, material=GOLD())
        parts += [pot, tip]
        return parts

    def mandapa():
        # pillared porch on the EAST (+Y) axis, lower pyramidal roof
        parts = []
        base = box(4.4, 3.4, 0.6, z=0.8, y=4.2, material=SANDSTONE())
        parts.append(base)
        for sx in (-1.4, 0, 1.4):
            for sy in (3.0, 5.4):
                p = cyl(0.28, 3.0, z=1.4, x=sx, seg=12, material=SANDSTONE())
                p.location.y = sy
                parts.append(p)
        # tiered pyramid roof over mandapa
        roof = _square_loft([(2.6, 0), (1.8, 1.0), (0.9, 2.0), (0.2, 2.7)],
                            z=4.4, material=SANDSTONE())
        roof.location.y = 4.2
        parts.append(roof)
        return parts

    return {
        "id": "nagara",
        "parts": [
            ("Jagati (plinth)", jagati),
            ("Garbhagriha", garbha),
            ("Shikhara", shikhara),
            ("Amalaka + kalasha", amalaka_kalasha),
            ("Mandapa", mandapa),
        ],
        "cut": lambda: _nagara_cut(),
    }


def _nagara_cut():
    """Half the tower removed to reveal the tiny dark garbhagriha within."""
    W, H = 2.0, 7.0
    parts = []
    parts.append(box(6.4, 6.4, 0.8, z=0.0, material=SANDSTONE()))
    # tower, then boolean-cut the front half away
    steps = 40
    prof = [(max(W * (1 - i / steps) ** 1.35, 0.06), (i / steps) * H)
            for i in range(steps + 1)]
    tower = profile_solid(prof, z=1.0, seg=32, material=SANDSTONE())
    cutter = box(8, 8, 16, z=-1, y=4)      # remove +Y half
    _boolean(tower, cutter, "DIFFERENCE")
    parts.append(tower)
    # the revealed tiny dark cella
    cella = box(1.4, 1.4, 1.8, z=1.0, y=-0.2, material=CELLA_DARK())
    parts.append(cella)
    # a small glowing lingam/deity marker
    parts.append(cyl(0.28, 0.7, z=1.0, y=-0.2, seg=16, material=GOLD()))
    return parts


def _boolean(target, cutter, op):
    # cutter must not be part of the render; hide it and use FAST solver on the
    # (manifold) primitive boxes. Ensure correct active/selection state for apply.
    m = target.modifiers.new("bool", "BOOLEAN")
    m.operation = op
    m.solver = "EXACT"
    m.object = cutter
    bpy.context.view_layer.update()
    bpy.ops.object.select_all(action="DESELECT")
    target.select_set(True)
    bpy.context.view_layer.objects.active = target
    bpy.ops.object.modifier_apply(modifier=m.name)
    bpy.data.objects.remove(cutter, do_unlink=True)


def f_dravidian():
    """
    Vimana: linear taper  w = W·(1 − 0.62·t)  (straight-sided pyramid).
    Octagonal cap. Gopuram = same taper, 2–3× taller, barrel-vault roof.
    """
    def plinth():
        return box(9.0, 9.0, 1.0, material=GRANITE())

    def vimana():
        # linear taper square storeys
        W, H = 2.4, 6.0
        prof = [(W * (1 - 0.62 * (i / 6)), (i / 6) * H) for i in range(7)]
        v = _square_loft(prof, z=1.0, material=GRANITE())
        v.location.y = -2.5
        # storey ledges = thin boxes at each tala
        parts = [v]
        for i in range(1, 6):
            t = i / 6
            w = W * (1 - 0.62 * t) + 0.12
            ledge = box(w * 2, w * 2, 0.18, z=1.0 + t * H, y=-2.5, material=SANDSTONE())
            parts.append(ledge)
        return parts

    def octcap():
        # octagonal shikhara cap + kalasha atop the vimana
        W, H = 2.4, 6.0
        top = 1.0 + H
        cap = cone(0.9, 0.35, 1.1, z=top, seg=8, material=GRANITE())
        cap.location.y = -2.5
        pot = sphere(0.32, z=top + 1.3, squash=1.2, material=GOLD())
        pot.location.y = -2.5
        return [cap, pot]

    def gopuram():
        # taller gateway tower on the east wall (+Y), rectangular plan
        Wx, Wy, H = 2.8, 1.6, 9.0
        parts = []
        rings = []
        # build a rectangular loft manually (wider than tall in one axis)
        ob, me = _new("gopuram")
        bm = bmesh.new()
        prof = [(1 - 0.55 * (i / 8), (i / 8) * H) for i in range(9)]
        ring_lists = []
        for (s, h) in prof:
            rx, ry = Wx * s, Wy * s
            ring = [bm.verts.new((sx * rx, sy * ry, h + 1.0))
                    for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
            ring_lists.append(ring)
        for lo, hi in zip(ring_lists, ring_lists[1:]):
            for i in range(4):
                j = (i + 1) % 4
                bm.faces.new((lo[i], lo[j], hi[j], hi[i]))
        bm.faces.new(ring_lists[0][::-1])
        bm.normal_update()
        bm.to_mesh(me); bm.free()
        apply(ob, SANDSTONE())
        ob.location.y = 6.5
        parts.append(ob)
        # storey ledges
        for i in range(1, 8):
            s = 1 - 0.55 * (i / 8)
            ledge = box(Wx * s * 2 + 0.2, Wy * s * 2 + 0.2, 0.16,
                        z=1.0 + (i / 8) * H, y=6.5, material=REDSTONE())
            parts.append(ledge)
        # gateway doorway (dark) at the base
        parts.append(box(0.9, 0.6, 2.6, z=1.0, y=5.6, material=CELLA_DARK()))
        return parts

    def barrel():
        # wagon-vault (half cylinder) crowning the gopuram, with kalasha pots
        top = 1.0 + 9.0
        v = cyl(0.9, 3.4, z=top - 0.9, seg=24, material=SANDSTONE(), cap=True)
        v.rotation_euler = (math.radians(90), 0, 0)
        v.location.y = 6.5
        v.scale.z = 0.7
        parts = [v]
        for x in (-1.3, 0, 1.3):
            parts.append(pot(x, 6.5, top + 0.2))
        return parts

    return {
        "id": "dravidian",
        "parts": [
            ("Plinth", plinth),
            ("Vimana", vimana),
            ("Oct cap + kalasha", octcap),
            ("Gopuram", gopuram),
            ("Barrel vault", barrel),
        ],
        "cut": lambda: _dravidian_cut(),
    }


def _dravidian_cut():
    parts = [box(9.0, 9.0, 1.0, material=GRANITE())]
    W, H = 2.4, 6.0
    prof = [(W * (1 - 0.62 * (i / 6)), (i / 6) * H) for i in range(7)]
    v = _square_loft(prof, z=1.0, material=GRANITE())
    v.location.y = -2.5
    _boolean(v, box(8, 8, 16, z=-1, y=-2.5 + 4), "DIFFERENCE")  # slice front half
    parts.append(v)
    parts.append(box(1.4, 1.4, 1.8, z=1.0, y=-2.7, material=CELLA_DARK()))
    parts.append(cyl(0.28, 0.7, z=1.0, y=-2.7, seg=16, material=GOLD()))
    return parts


def pot(x, y, z, r=0.18):
    p = sphere(r, z=z, x=x, squash=1.3, seg=16, material=GOLD())
    p.location.y = y
    return p


def f_stupa():
    """
    Rotate a profile about a vertical axis. Anda ≈ hemisphere (~0.62 h-ratio).
    Harmika + 3 shrinking chhatra parasols. 4 toranas at cardinal points.
    """
    R = 4.0

    def medhi():
        return cyl(R + 0.8, 0.8, seg=64, material=SANDSTONE())

    def drum():
        return cyl(R * 0.92, 1.2, z=0.8, seg=64, material=SANDSTONE())

    def anda():
        # flattened hemisphere: squash so height ≈ 0.62·R
        dome = sphere(R * 0.92, z=2.0, squash=0.62, seg=48, material=LIMESTONE())
        # keep only the top half
        cutter = box(R * 4, R * 4, R * 4, z=2.0 - R * 4, material=None)
        _boolean(dome, cutter, "DIFFERENCE")
        return dome

    def harmika_chhatra():
        parts = []
        topz = 2.0 + R * 0.62
        parts.append(box(1.4, 1.4, 0.9, z=topz, material=SANDSTONE()))  # harmika
        mast_h = 2.6
        parts.append(cyl(0.12, mast_h, z=topz + 0.9, seg=12, material=SANDSTONE()))
        for i, ru in enumerate([1.4, 1.0, 0.65]):  # 3 shrinking parasols
            zz = topz + 0.9 + 0.7 + i * 0.7
            parts.append(cyl(ru, 0.12, z=zz, seg=32, material=SANDSTONE()))
        return parts

    def toranas():
        # 4 gateways at the cardinal points: two posts + 3 stacked architraves
        parts = []
        for ang in (0, 90, 180, 270):
            a = math.radians(ang)
            # radial outward unit vector (ox,oy); tangential unit (tx,ty)
            ox, oy = math.sin(a), math.cos(a)
            tx, ty = math.cos(a), -math.sin(a)
            cxp, cyp = ox * (R + 1.3), oy * (R + 1.3)
            postH = 3.4
            for off in (-0.75, 0.75):
                px = cxp + tx * off
                py = cyp + ty * off
                post = cyl(0.16, postH, z=0.8, x=px, y=py, seg=10, material=SANDSTONE())
                parts.append(post)
            # three architraves spanning the two posts (a real torana has 3)
            for k, zz in enumerate((0.8 + postH - 0.1, 0.8 + postH + 0.45, 0.8 + postH + 1.0)):
                bar = box(2.1, 0.22, 0.22, z=zz, material=SANDSTONE())
                bar.location.x = cxp
                bar.location.y = cyp
                bar.rotation_euler = (0, 0, math.atan2(ty, tx))
                parts.append(bar)
        return parts

    return {
        "id": "stupa",
        "parts": [
            ("Medhi", medhi),
            ("Drum", drum),
            ("Anda", anda),
            ("Harmika + chhatra", harmika_chhatra),
            ("Toranas", toranas),
        ],
        "cut": lambda: _stupa_cut(),
    }


def _stupa_cut():
    R = 4.0
    parts = []
    parts.append(cyl(R + 0.8, 0.8, seg=48, material=SANDSTONE()))
    parts.append(cyl(R * 0.92, 1.2, z=0.8, seg=48, material=SANDSTONE()))
    dome = sphere(R * 0.92, z=2.0, squash=0.62, seg=40, material=LIMESTONE())
    _boolean(dome, box(R * 4, R * 4, R * 4, z=2.0 - R * 4), "DIFFERENCE")
    _boolean(dome, box(R * 4, R * 4, R * 4, y=R * 4), "DIFFERENCE")  # cut front half
    parts.append(dome)
    # relic casket at the heart
    parts.append(box(0.7, 0.7, 0.7, z=2.0, y=-0.1, material=GOLD()))
    return parts


def f_jain():
    """White marble, domed mandapa on pillar ring, spired shrine. Chaumukha symmetry."""
    def plinth():
        return box(8.0, 8.0, 1.0, material=MARBLE())

    def pillars():
        parts = []
        for k in range(12):
            a = 2 * math.pi * k / 12
            r = 3.0
            p = cyl(0.22, 3.2, z=1.0, x=math.cos(a) * r, seg=10, material=MARBLE())
            p.location.y = math.sin(a) * r
            parts.append(p)
        return parts

    def dome():
        # corbelled dome = stack of shrinking rings (stepped, then a cap)
        parts = []
        z0 = 4.2
        for i in range(6):
            rr = 3.2 * (1 - i / 7)
            parts.append(cyl(rr, 0.28, z=z0 + i * 0.28, seg=40, material=MARBLE()))
        parts.append(sphere(0.5, z=z0 + 6 * 0.28, squash=0.8, material=MARBLE()))
        return parts

    def shrine():
        # small nagara-like spire beside/behind the dome
        W, H = 0.9, 3.2
        prof = [(max(W * (1 - i / 20) ** 1.3, 0.05), (i / 20) * H) for i in range(21)]
        s = profile_solid(prof, z=1.0, seg=20, material=MARBLE())
        s.location = (0, -3.4, 0)
        finial = pot(0, -3.4, 1.0 + H + 0.2, r=0.16)
        return [s, finial]

    return {
        "id": "jain",
        "parts": [
            ("Plinth", plinth),
            ("Pillars", pillars),
            ("Domed mandapa", dome),
            ("Shrine", shrine),
        ],
    }


def f_kashmiri():
    """Tall plinth, square cella, peristyle every 30°, steep two-tier PEAKED (pyramid) roof."""
    def plinth():
        return box(6.0, 6.0, 2.0, material=GRANITE())

    def cella():
        return box(3.0, 3.0, 3.0, z=2.0, material=GRANITE())

    def colonnade():
        parts = []
        for k in range(12):           # every 30°
            a = 2 * math.pi * k / 12
            r = 4.0
            p = cyl(0.24, 3.4, z=2.0, x=math.cos(a) * r, seg=8, material=LIMESTONE())
            p.location.y = math.sin(a) * r
            # flute look via slight scale
            parts.append(p)
        return parts

    def roof():
        # steep two-tier pyramid (4-sided) — the Kashmiri signature
        parts = []
        # lower tier
        r1 = _square_loft([(1.9, 0), (0.05, 2.6)], z=5.0, material=DARKSTONE())
        # upper tier (smaller, stacked)
        r2 = _square_loft([(1.2, 0), (0.05, 2.0)], z=7.0, material=DARKSTONE())
        parts += [r1, r2]
        parts.append(pot(0, 0, 9.0, r=0.2))
        return parts

    return {
        "id": "kashmiri",
        "parts": [
            ("Plinth", plinth),
            ("Cella", cella),
            ("Colonnade", colonnade),
            ("Pyramidal roof", roof),
        ],
    }


def f_sun_temple():
    """
    East-facing chariot. 24 wheels along the sides. Jagamohana pyramid + deul
    curved tower (w = W(1−t)^1.2). 7 horses at the eastern front.
    """
    def terrace():
        return box(6.0, 12.0, 1.4, material=REDSTONE())

    def wheels():
        parts = []
        # 12 per side (24 total), standing wheels along Y
        for side in (-3.1, 3.1):
            for i in range(6):
                yy = -4.5 + i * 1.8
                w = wheel(1.1, 0.4, spokes=8, z=1.5, x=side, y=yy, material=REDSTONE())
                parts.append(w)
        return parts

    def jagamohana():
        # pyramidal audience hall (front / +Y east)
        j = _square_loft([(2.6, 0), (1.9, 1.6), (1.2, 3.0), (0.5, 4.0)],
                        z=1.4, material=REDSTONE())
        j.location.y = 2.5
        return j

    def deul():
        # curved sanctum tower behind (west / −Y)
        W, H = 2.2, 8.0
        prof = [(max(W * (1 - i / 30) ** 1.2, 0.06), (i / 30) * H) for i in range(31)]
        d = profile_solid(prof, z=1.4, seg=24, material=REDSTONE())
        d.location.y = -3.0
        cap = pot(0, -3.0, 1.4 + H + 0.2, r=0.3)
        return [d, cap]

    def horses():
        # 7 horses (Konark) straining at the eastern (+Y) front — larger & clearer
        parts = []
        for i in range(7):
            xx = -3.6 + i * 1.2
            body = box(0.7, 2.0, 1.3, z=1.5, x=xx, y=7.4, material=REDSTONE())
            # arched neck + head reaching forward
            neck = box(0.55, 0.6, 1.6, z=2.6, x=xx, y=8.3, material=REDSTONE())
            neck.rotation_euler = (math.radians(-35), 0, 0)
            head = box(0.5, 0.9, 0.5, z=3.5, x=xx, y=8.9, material=REDSTONE())
            head.rotation_euler = (math.radians(-20), 0, 0)
            # four legs (front pair reaching, rear pair pushing)
            for lx, ly, lean in ((-0.22, 6.7, 10), (0.22, 6.7, 10),
                                 (-0.22, 8.2, -20), (0.22, 8.2, -20)):
                leg = box(0.16, 0.18, 1.6, z=0.7, x=xx + lx, y=ly, material=REDSTONE())
                leg.rotation_euler = (math.radians(lean), 0, 0)
                parts.append(leg)
            parts += [body, neck, head]
        return parts

    return {
        "id": "sun_temple",
        "parts": [
            ("Terrace", terrace),
            ("Chariot wheels", wheels),
            ("Jagamohana", jagamohana),
            ("Deul", deul),
            ("Horses", horses),
        ],
    }


# ── WORLD FORMS ──────────────────────────────────────────────────────────────

def f_egyptian():
    """Twin battered pylons, hypostyle hall of columns, obelisk on the axis."""
    def foundation():
        return box(10.0, 16.0, 0.6, material=SANDSTONE())

    def pylons():
        parts = []
        for side in (-3.6, 3.6):
            # battered trapezoid: loft from wide base to narrower top
            p = _square_loft([(2.2, 0), (1.7, 7.0)], z=0.6, material=SANDSTONE())
            p.scale = (1.0, 0.55, 1.0)
            p.location = (side, 6.5, 0)
            parts.append(p)
        return parts

    def hypostyle():
        parts = []
        for x in (-3, -1, 1, 3):
            for y in (-4, -1.5, 1):
                c = cyl(0.6, 6.0, z=0.6, x=x, seg=16, material=SANDSTONE())
                c.location.y = y
                # papyrus capital
                cap = cone(0.6, 1.0, 0.9, z=6.6, x=x, seg=16, material=SANDSTONE())
                cap.location.y = y
                parts += [c, cap]
        return parts

    def roof_obelisk():
        parts = []
        parts.append(box(9.0, 7.0, 0.5, z=7.6, y=-1.5, material=SANDSTONE()))
        ob = _square_loft([(0.55, 0), (0.28, 8.0)], z=0.6, material=SANDSTONE())
        ob.location = (0, 10.5, 0)
        pyr = _square_loft([(0.28, 0), (0.0, 0.8)], z=8.6, material=GOLD())
        pyr.location = (0, 10.5, 0)
        parts += [ob, pyr]
        return parts

    return {"id": "egyptian", "parts": [
        ("Foundation", foundation), ("Pylons", pylons),
        ("Hypostyle hall", hypostyle), ("Roof + obelisk", roof_obelisk)]}


def f_greek():
    """Stylobate, peripteral colonnade (8×17 Doric), entablature, pediment."""
    def stylobate():
        return box(9.0, 16.0, 1.2, material=MARBLE())

    def colonnade():
        parts = []
        nx, ny = 8, 17
        x0, x1 = -3.6, 3.6
        y0, y1 = -6.8, 6.8
        pts = set()
        for i in range(nx):
            xx = x0 + (x1 - x0) * i / (nx - 1)
            pts.add((round(xx, 3), y0)); pts.add((round(xx, 3), y1))
        for j in range(ny):
            yy = y0 + (y1 - y0) * j / (ny - 1)
            pts.add((x0, round(yy, 3))); pts.add((x1, round(yy, 3)))
        for (xx, yy) in pts:
            c = cyl(0.42, 6.0, z=1.2, x=xx, seg=16, material=MARBLE())
            c.location.y = yy
            parts.append(c)
        return parts

    def entablature():
        return box(8.6, 15.6, 1.3, z=7.2, material=MARBLE())

    def pediment():
        parts = []
        for yy in (-7.2, 7.2):
            # triangular gable prism
            ob, me = _new("ped")
            bm = bmesh.new()
            w, h, d = 4.3, 2.0, 0.6
            vs = [bm.verts.new(p) for p in
                  [(-w, yy - d, 8.5), (w, yy - d, 8.5), (0, yy - d, 8.5 + h),
                   (-w, yy + d, 8.5), (w, yy + d, 8.5), (0, yy + d, 8.5 + h)]]
            bm.faces.new((vs[0], vs[1], vs[2]))
            bm.faces.new((vs[5], vs[4], vs[3]))
            bm.faces.new((vs[0], vs[3], vs[4], vs[1]))
            bm.faces.new((vs[1], vs[4], vs[5], vs[2]))
            bm.faces.new((vs[2], vs[5], vs[3], vs[0]))
            bm.normal_update(); bm.to_mesh(me); bm.free()
            apply(ob, MARBLE())
            parts.append(ob)
        # low roof plane between pediments
        parts.append(box(8.8, 14.4, 0.3, z=8.5, material=MARBLE()))
        return parts

    return {"id": "greek", "parts": [
        ("Stylobate", stylobate), ("Colonnade", colonnade),
        ("Entablature", entablature), ("Pediment", pediment)]}


def f_mesoamerican():
    """Stepped pyramid (talud-tablero), summit temple, steep central staircase."""
    def lower():
        parts = []
        for i in range(3):
            w = 6.0 - i * 1.2
            parts.append(box(w * 2, w * 2, 1.6, z=i * 1.6, material=LIMESTONE()))
        return parts

    def upper():
        parts = []
        for i in range(3, 6):
            w = 6.0 - i * 1.2
            parts.append(box(w * 2, w * 2, 1.6, z=i * 1.6, material=LIMESTONE()))
        return parts

    def temple():
        return box(2.6, 2.6, 2.4, z=6 * 1.6, material=REDSTONE())

    def stair():
        parts = []
        for i in range(18):
            parts.append(box(2.2, 0.4, 0.5, z=i * 0.5, y=6.0 - i * 0.28, material=LIMESTONE()))
        return parts

    return {"id": "mesoamerican", "parts": [
        ("Lower platforms", lower), ("Upper platforms", upper),
        ("Summit temple", temple), ("Staircase", stair)]}


def f_ziggurat():
    """Receding rectangular terraces (~⅔ scaling), triple stairway, high temple."""
    def t1():
        return box(12.0, 9.0, 2.4, material=MUDBRICK())

    def t2():
        return box(8.0, 6.0, 2.2, z=2.4, material=MUDBRICK())

    def t3():
        return box(5.0, 3.6, 2.0, z=4.6, material=MUDBRICK())

    def temple_stairs():
        parts = [box(3.2, 2.4, 2.0, z=6.6, material=REDSTONE())]
        # triple stairway on the front (+Y)
        for off in (-1.6, 0, 1.6):
            for i in range(9):
                parts.append(box(0.9, 0.4, 0.3, x=off, z=i * 0.27,
                                 y=4.5 - i * 0.02 + 0.0, material=MUDBRICK()))
        return parts

    return {"id": "ziggurat", "parts": [
        ("First terrace", t1), ("Second terrace", t2),
        ("Third terrace", t3), ("High temple + stairs", temple_stairs)]}


def f_andean():
    """Terraces into the slope, polygonal-stone buildings, curved solstice wall."""
    def terraces():
        parts = []
        for i in range(5):
            parts.append(box(14 - i * 1.5, 3.0, 1.2, z=i * 1.2,
                             y=i * 1.8, material=GRANITE()))
        return parts

    def buildings():
        parts = []
        for x in (-3, 0, 3):
            b = box(2.0, 2.0, 2.4, z=6.0, x=x, y=8.0, material=GRANITE())
            # trapezoid door (dark)
            parts.append(b)
            parts.append(box(0.5, 0.1, 1.2, z=6.0, x=x, y=7.0, material=CELLA_DARK()))
        # gable roofs
        for x in (-3, 0, 3):
            parts.append(cone(1.4, 0.05, 1.4, z=8.4, x=x, seg=4, material=REDSTONE()))
        for p in parts[-3:]:
            p.location.y = 8.0
        return parts

    def sunwall():
        # curved dressed-stone wall aligned to solstice, with a window
        prof = [(4.0, 0), (4.0, 3.0)]
        w = profile_solid(prof, z=6.5, seg=48, material=LIMESTONE())
        # keep a 140° arc only
        _boolean(w, box(16, 16, 16, y=-8), "DIFFERENCE")
        w.location.y = 12.0
        return [w]

    return {"id": "andean", "parts": [
        ("Terraces", terraces), ("Buildings", buildings), ("Sun-temple wall", sunwall)],
        "cut": lambda: _andean_cut()}


def _andean_cut():
    # Chavín underground gallery + Lanzón
    parts = [box(10, 10, 3, material=GRANITE())]
    _boolean(parts[0], box(2.0, 6.0, 2.0, z=0.6), "DIFFERENCE")  # gallery void
    lanzon = cone(0.6, 0.1, 3.0, z=0.6, seg=4, material=GOLD())
    parts.append(lanzon)
    return parts


def f_moai():
    """Long coastal ahu platform; monolithic moai facing inland."""
    def ahu():
        return box(16.0, 3.0, 1.6, material=BASALT())

    def statues():
        parts = []
        for i in range(5):
            xx = -6 + i * 3.0
            # body
            body = box(1.4, 1.0, 4.0, z=1.6, x=xx, material=DARKSTONE())
            head = box(1.5, 1.1, 2.2, z=5.6, x=xx, material=DARKSTONE())
            # heavy brow (face toward +Y = inland)
            brow = box(1.6, 0.3, 0.5, z=6.6, x=xx, y=0.5, material=DARKSTONE())
            parts += [body, head, brow]
        return parts

    return {"id": "moai", "parts": [("Ahu platform", ahu), ("Raise the moai", statues)]}


def f_ethiopian():
    """Greek-cross church carved DOWN into rock; sits in a sunken pit."""
    def bedrock():
        b = box(14.0, 14.0, 8.0, material=REDSTONE())
        return b

    def carve_cross():
        # start from a solid, carve a pit, leave a cross-shaped monolith
        block = box(14.0, 14.0, 8.0, material=REDSTONE())
        pit = box(11.0, 11.0, 7.0, z=1.0)
        _boolean(block, pit, "DIFFERENCE")
        # cross monolith standing in the pit
        arm1 = box(6.0, 2.2, 6.0, z=1.0, material=BASALT())
        arm2 = box(2.2, 6.0, 6.0, z=1.0, material=BASALT())
        return [block, arm1, arm2]

    def carve_roof():
        # final: the cross-shaped church monolith stands free in a sunken pit.
        # Built from a 4-wall rim (open centre) + the cross — no boolean, robust.
        # This is how Bete Giyorgis reads: a rock cross down inside a trench.
        parts = []
        # pit rim = four low walls of surrounding bedrock, centre left open
        rim, wall, pit = 7.0, 1.4, 5.6
        for (sx, sy, w, d) in ((0, rim, 2 * rim, wall), (0, -rim, 2 * rim, wall),
                               (rim, 0, wall, 2 * rim), (-rim, 0, wall, 2 * rim)):
            parts.append(box(w, d, 2.0, x=sx, y=sy, material=REDSTONE()))
        # the church: a Greek-cross monolith rising from the pit floor
        arm1 = box(6.0, 2.2, 7.0, material=BASALT())
        arm2 = box(2.2, 6.0, 7.0, material=BASALT())
        parts += [arm1, arm2]
        # the famous roof relief: a cross cut into the flat roof
        parts.append(box(6.4, 1.0, 0.4, z=7.0, material=REDSTONE()))
        parts.append(box(1.0, 6.4, 0.4, z=7.0, material=REDSTONE()))
        return parts

    return {"id": "ethiopian", "cumulative": False, "parts": [
        ("The bedrock", bedrock), ("Carve the cross", carve_cross),
        ("Carve the roof", carve_roof)],
        "cut": lambda: _ethiopian_cut()}


def _ethiopian_cut():
    block = box(14.0, 14.0, 8.0, material=REDSTONE())
    _boolean(block, box(11.0, 11.0, 7.0, z=1.0), "DIFFERENCE")
    _boolean(block, box(14, 14, 14, y=7), "DIFFERENCE")
    arm1 = box(6.0, 2.2, 6.0, z=1.0, material=BASALT())
    _boolean(arm1, box(4.0, 4.0, 4.5, z=1.5), "DIFFERENCE")  # hollow interior
    _boolean(arm1, box(14, 14, 14, y=7), "DIFFERENCE")
    return [block, arm1]


def f_petra():
    """Classical facade carved INTO a cliff; upper tholos + urn."""
    def cliff():
        return box(14.0, 4.0, 12.0, y=2.0, material=REDSTONE())

    def facade():
        cliff_ = box(14.0, 4.0, 12.0, y=2.0, material=REDSTONE())
        # recess the facade
        _boolean(cliff_, box(9.0, 2.0, 9.0, z=0.0, y=0.8), "DIFFERENCE")
        parts = [cliff_]
        # lower columns
        for x in (-3.4, -1.7, 1.7, 3.4):
            parts.append(cyl(0.55, 6.0, x=x, y=0.4, seg=16, material=SANDSTONE()))
        parts.append(box(9.0, 1.2, 1.0, z=6.0, y=0.4, material=SANDSTONE()))  # entablature
        # doorway (dark)
        parts.append(box(1.4, 0.6, 4.0, y=0.9, material=CELLA_DARK()))
        return parts

    def tholos():
        parts = []
        # broken pediment halves + round kiosk
        parts.append(cyl(1.4, 3.2, z=7.0, y=0.6, seg=20, material=SANDSTONE()))
        parts.append(cone(1.0, 0.3, 1.4, z=10.2, y=0.6, seg=20, material=SANDSTONE()))
        parts.append(pot(0, 0.6, 11.6, r=0.4))
        for x in (-3.2, 3.2):
            parts.append(box(2.4, 1.2, 0.9, z=7.0, x=x, y=0.6, material=SANDSTONE()))
        return parts

    return {"id": "petra", "parts": [
        ("The cliff", cliff), ("Carve top-down", facade), ("Upper tholos", tholos)],
        "cut": lambda: _petra_cut()}


def _petra_cut():
    cliff_ = box(14.0, 6.0, 12.0, y=2.0, material=REDSTONE())
    _boolean(cliff_, box(4.0, 4.0, 5.0, z=0.0, y=1.0), "DIFFERENCE")  # small chamber
    _boolean(cliff_, box(20, 20, 20, y=-9.0), "DIFFERENCE")  # slice front
    return [cliff_]


def _open_room(w, d, h, wall=1.6, back_y=0.0, mat=None):
    """A rock hall carved into the ground, open on the FRONT (−Y) and partly on
    top so the excavated interior — pillars, back-wall relief — is always visible
    from a 3/4 orbit. Built from boxes (no boolean), so it is robust and readable.
    back_y = the back-wall plane; the hall extends toward −Y from it."""
    mat = mat or BASALT()
    cy = back_y - d / 2         # centre of the room in Y
    lo = h * 0.45               # low side/front walls so the pillared hall is open
    parts = [
        box(w + 2 * wall, d + wall, wall, z=-wall, y=cy, material=mat),          # floor
        box(w + 2 * wall, wall, h, z=0, y=back_y, material=mat),                 # back wall (full)
        box(w + 2 * wall, wall, h + wall, z=0, y=back_y, material=mat),          # back wall cap
        box(wall, d, lo, x=(w / 2 + wall / 2), y=cy, material=mat),              # right low wall
        box(wall, d, lo, x=-(w / 2 + wall / 2), y=cy, material=mat),             # left low wall
    ]
    return parts


def f_elephanta():
    """
    Rock-cut cave temple: an OPEN pillared pavilion (floor + back wall carrying
    the Trimurti + a grid of free-standing pillars holding a flat roof slab),
    open on the front and sides — exactly how the Elephanta Great Cave reads,
    and legible from any orbit angle (no enclosing box, no boolean).
    """
    W, D, H = 12.0, 9.0, 5.6
    BACK = D / 2                              # back wall at +Y, hall opens −Y
    cols_x = (-4.4, -1.5, 1.5, 4.4)
    rows_y = (BACK - 2.0, BACK - 6.0)

    def _hall(with_relief):
        # An open colonnaded hall: a low floor, a forest of free-standing pillars
        # carrying a thin lintel grid, and (finally) the Trimurti panel at the
        # back. Open on every side, so it never reads as a solid block.
        parts = []
        parts.append(box(W + 2, D + 2, 0.7, z=-0.7, material=BASALT()))        # floor plinth
        # thin lintel beams tying the pillar tops (not a solid roof)
        for x in cols_x:
            parts.append(box(1.0, D, 0.7, x=x, z=H, material=BASALT()))
        for x in cols_x:                                                        # pillars LEFT standing
            for yy in rows_y:
                parts.append(cyl(0.55, H, x=x, y=yy, seg=12, material=BASALT()))
                parts.append(cyl(0.8, 0.45, z=H - 0.45, x=x, y=yy, seg=12, material=BASALT()))  # capital
                parts.append(cyl(0.8, 0.45, z=0.0, x=x, y=yy, seg=12, material=BASALT()))        # base
        if with_relief:
            # the Trimurti panel stands as a back screen wall with 3 heads
            parts.append(box(6.0, 0.9, H, z=0, y=BACK + 0.3, material=BASALT()))
            for x in (-1.6, 0, 1.6):
                parts.append(sphere(1.0, z=3.7, x=x, y=BACK - 0.2, seg=18, material=DARKSTONE()))
            parts.append(box(5.2, 0.8, 3.4, z=1.6, y=BACK - 0.1, material=DARKSTONE()))
        return parts

    def solid_hill():
        return box(15.0, 13.0, 8.5, y=0.5, material=BASALT())

    return {"id": "elephanta", "cumulative": False, "parts": [
        ("The hillside", solid_hill),                    # stage 1: solid rock
        ("Free the pillars", lambda: _hall(False)),      # stage 2: rock removed → hall
        ("Reliefs (Trimurti)", lambda: _hall(True))]}    # stage 3: + back-wall relief
    # the finished form is the open hall itself — no separate cutaway needed.


def _place(obj, x=None, y=None, z=None):
    if x is not None: obj.location.x = x
    if y is not None: obj.location.y = y
    if z is not None: obj.location.z = z
    return obj


def _elephanta_cut():
    hill = box(16.0, 12.0, 10.0, y=1.0, material=BASALT())
    _boolean(hill, box(12.0, 9.0, 6.0, z=0.0, y=-1.5), "DIFFERENCE")
    _boolean(hill, box(20, 20, 20, y=9.0), "DIFFERENCE")
    parts = [hill]
    for i, x in enumerate((-1.3, 0, 1.3)):
        parts.append(_place(sphere(0.9, z=3.2, x=x, seg=16, material=DARKSTONE()), y=-4.0))
    return parts


def f_megalithic():
    """Ring of sarsens + lintels, inner trilithon horseshoe, solstice axis."""
    R = 5.0
    def sarsens():
        parts = []
        for k in range(16):
            a = 2 * math.pi * k / 16
            s = box(0.8, 0.5, 4.0, x=math.cos(a) * R, material=GRANITE())
            s.location.y = math.sin(a) * R
            s.rotation_euler = (0, 0, a)
            parts.append(s)
        return parts

    def lintels():
        parts = []
        for k in range(16):
            a = 2 * math.pi * k / 16 + math.pi / 16
            l = box(2.1, 0.5, 0.6, z=4.0, x=math.cos(a) * R, material=GRANITE())
            l.location.y = math.sin(a) * R
            l.rotation_euler = (0, 0, a + math.pi / 2)
            parts.append(l)
        return parts

    def trilithons():
        parts = []
        # inner horseshoe opening toward +Y (solstice axis)
        for ang in (-60, -30, 0, 30, 60):
            a = math.radians(ang + 90)
            r = 2.6
            for off in (-0.55, 0.55):
                dx = math.cos(a + math.pi / 2) * off
                dy = math.sin(a + math.pi / 2) * off
                p = box(0.7, 0.6, 5.2, x=math.cos(a) * r + dx, material=GRANITE())
                p.location.y = math.sin(a) * r + dy
                parts.append(p)
            cap = box(1.8, 0.6, 0.7, z=5.2, x=math.cos(a) * r, material=GRANITE())
            cap.location.y = math.sin(a) * r
            cap.rotation_euler = (0, 0, a + math.pi / 2)
            parts.append(cap)
        return parts

    return {"id": "megalithic_circle", "parts": [
        ("Ring of sarsens", sarsens), ("Lintels", lintels),
        ("Inner trilithons", trilithons)]}


# ─────────────────────────────────────────────────────────────────────────────

ALL = {
    "nagara": f_nagara, "dravidian": f_dravidian, "stupa": f_stupa,
    "jain": f_jain, "kashmiri": f_kashmiri, "sun_temple": f_sun_temple,
    "egyptian": f_egyptian, "greek": f_greek, "mesoamerican": f_mesoamerican,
    "ziggurat": f_ziggurat, "andean": f_andean, "moai": f_moai,
    "ethiopian": f_ethiopian, "petra": f_petra, "elephanta": f_elephanta,
    "megalithic_circle": f_megalithic,
}


def main():
    argv = sys.argv
    ids = argv[argv.index("--") + 1:] if "--" in argv else []
    todo = ids if ids else list(ALL.keys())
    for fid in todo:
        if fid not in ALL:
            print("!! unknown form:", fid); continue
        build_form(ALL[fid]())
    print("done:", ", ".join(todo))


if __name__ == "__main__":
    main()
