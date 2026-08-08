# ─────────────────────────────────────────────────────────────────────────
# render_ornaments.py  —  headless Blender render of temple-derived ornaments
#
#   Run:  /Applications/Blender.app/Contents/MacOS/Blender -b -P render_ornaments.py
#
# Builds THREE real Mauryan/Gupta ornament forms procedurally and renders each
# as a soft, raking-lit sandstone relief on transparent bg → PNG (→ webp later):
#   1. capital  — a lotiform (bell) capital, the head of an Ashokan stambha
#   2. torana   — a gateway arch frame (Sanchi-style), makara-tail curl
#   3. rosette  — a full lotus rosette medallion (ceiling padma)
# Light + dark variants (warm sandstone / warm temple-interior stone).
# EEVEE, raking key light, orthographic front — matches the shikhara/lotus set.
# ─────────────────────────────────────────────────────────────────────────
import bpy, math, os

OUT = os.path.join(os.path.dirname(bpy.data.filepath) or
                   "/Users/sinhaankur/Documents/GitHub/india-fiscal-map/interactive-vercel-ship-26-i-2",
                   "public", "backgrounds")
os.makedirs(OUT, exist_ok=True)

# ── palettes (linear-ish sRGB, warm) ────────────────────────────────────
STONE_LIGHT = (0.82, 0.66, 0.42)   # warm sandstone
STONE_DARK  = (0.34, 0.24, 0.15)   # temple-interior umber stone
KEY_LIGHT   = 6.0
KEY_DARK    = 3.2


def wipe():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.curves):
        for b in list(block):
            block.remove(b)


def stone_mat(name, rgb):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*rgb, 1)
    bsdf.inputs["Roughness"].default_value = 0.85
    # a touch of noise-driven bump for carved-stone grain
    nt = m.node_tree
    tex = nt.nodes.new("ShaderNodeTexNoise")
    tex.inputs["Scale"].default_value = 40
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.08
    nt.links.new(tex.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return m


def apply(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)


# ── 1. LOTIFORM (BELL) CAPITAL ───────────────────────────────────────────
def build_capital():
    # the bell/lotus profile revolved — a spun campaniform capital
    prof = []
    # (r, z) profile from base of neck up to abacus
    pts = [(0.55, 0.0), (0.62, 0.15), (0.72, 0.35), (0.68, 0.5),
           (0.55, 0.62), (0.42, 0.72), (0.5, 0.8), (0.7, 0.9),
           (0.78, 0.92), (0.78, 1.05)]
    curve = bpy.data.curves.new("capProf", 'CURVE')
    curve.dimensions = '3D'
    sp = curve.splines.new('POLY')
    sp.points.add(len(pts) - 1)
    for i, (r, z) in enumerate(pts):
        sp.points[i].co = (r, 0, z, 1)
    ob = bpy.data.objects.new("capProf", curve)
    bpy.context.collection.objects.link(ob)
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.convert(target='MESH')
    m = bpy.context.active_object
    # spin it into a solid of revolution
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.spin(steps=64, angle=math.radians(360), axis=(0, 0, 1), center=(0, 0, 0))
    bpy.ops.mesh.remove_doubles(threshold=0.001)
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    # a ring of 16 vertical lotus flutes on the bell (subtle relief)
    return m


# ── 2. TORANA ARCH FRAME ─────────────────────────────────────────────────
def build_torana():
    verts = []
    # two uprights + a stepped architrave with an arched inner top
    # build as a flat relief plate then solidify
    # left post
    def box(x0, x1, z0, z1):
        base = len(verts)
        verts.extend([(x0, 0, z0), (x1, 0, z0), (x1, 0, z1), (x0, 0, z1)])
        return [(base, base + 1, base + 2, base + 3)]
    faces = []
    faces += box(-1.1, -0.85, -1.2, 1.1)   # left post
    faces += box(0.85, 1.1, -1.2, 1.1)     # right post
    faces += box(-1.25, 1.25, 1.1, 1.35)   # lintel 1
    faces += box(-1.15, 1.15, 1.4, 1.6)    # lintel 2
    faces += box(-1.0, 1.0, 1.65, 1.82)    # lintel 3
    me = bpy.data.meshes.new("toranaM")
    me.from_pydata(verts, [], faces)
    me.update()
    ob = bpy.data.objects.new("torana", me)
    bpy.context.collection.objects.link(ob)
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    # solidify to give depth (a relief, not paper)
    sol = ob.modifiers.new("sol", 'SOLIDIFY')
    sol.thickness = 0.18
    bev = ob.modifiers.new("bev", 'BEVEL')
    bev.width = 0.02
    bev.segments = 2
    bpy.ops.object.modifier_apply(modifier="sol")
    bpy.ops.object.modifier_apply(modifier="bev")
    # add an inner gavaksha arch as a torus half-ring sitting in the opening.
    # torus in the X-Z plane (rotate 90° about X), centred at z=0.1 so the
    # spring-line of the arch sits low and the crown reaches up into the opening.
    bpy.ops.mesh.primitive_torus_add(major_radius=0.72, minor_radius=0.07,
                                     major_segments=48, minor_segments=10,
                                     location=(0, -0.02, 0.1),
                                     rotation=(math.radians(90), 0, 0))
    arch = bpy.context.active_object
    bpy.ops.object.mode_set(mode='OBJECT')
    # keep only the upper half (crown of the arch): delete verts below the centre z
    below = [v for v in arch.data.vertices if v.co.z < 0.12]
    if below and len(below) < len(arch.data.vertices):
        for v in arch.data.vertices:
            v.select = (v.co.z < 0.12)
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.delete(type='VERT')
        bpy.ops.object.mode_set(mode='OBJECT')
    # join arch into the frame (guard against an emptied mesh)
    ob.select_set(True)
    if len(arch.data.vertices) > 0:
        arch.select_set(True)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.join()
    return ob


# ── 3. LOTUS ROSETTE MEDALLION ───────────────────────────────────────────
def build_rosette():
    # A flat lotus medallion facing the camera. Camera looks down -Y, so the
    # medallion lives in the X-Z plane and its relief depth pushes toward -Y.
    # Concentric rings of tapered-cone petals, radiating outward in X-Z.
    layers = [(0.35, 8, 0.30, 0.10), (0.62, 12, 0.36, 0.13), (0.92, 16, 0.42, 0.15)]
    objs = []
    for ri, (rad, count, plen, prad) in enumerate(layers):
        offset = (math.pi / count) if ri % 2 else 0.0
        for i in range(count):
            ang = (i / count) * 2 * math.pi + offset
            # a cone whose local +Z is the petal tip; default points +Z (up).
            bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=prad, radius2=0.0,
                                            depth=plen, location=(0, 0, 0))
            p = bpy.context.active_object
            # lay it into the X-Z plane pointing +X, then spin around Y by ang.
            #   rot X by -90° → local +Z (tip) now points +Y ... we want it in X-Z,
            #   so instead rotate around Y so tips fan within X-Z:
            p.rotation_euler = (math.radians(-90), 0, 0)   # tip now points +Y? no →
            # Simpler: point the cone along +X, then rotate about Y (the view axis).
            p.rotation_euler = (0, math.radians(90), 0)    # tip → +X
            p.rotation_euler = (0, math.radians(90) - ang, 0)  # fan around Y
            p.location = (math.cos(ang) * rad, -0.03, math.sin(ang) * rad)
            p.scale = (1.0, 0.5, 1.0)   # flatten depth (toward camera) → relief
            objs.append(p)
    # center boss (a low dome facing the camera)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.24, location=(0, -0.10, 0))
    boss = bpy.context.active_object
    boss.scale = (1.0, 0.5, 1.0)
    objs.append(boss)
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    ob = bpy.context.active_object
    ob.name = "rosette"
    return ob


# ── scene / lighting / camera ────────────────────────────────────────────
def setup_scene(dark):
    scn = bpy.context.scene
    scn.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in \
        [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
    scn.render.film_transparent = True
    scn.render.resolution_x = 1200
    scn.render.resolution_y = 1200
    scn.render.image_settings.file_format = 'PNG'
    scn.render.image_settings.color_mode = 'RGBA'
    # camera: orthographic, front
    cam_d = bpy.data.cameras.new("cam")
    cam_d.type = 'ORTHO'
    cam_d.ortho_scale = 3.0
    cam = bpy.data.objects.new("cam", cam_d)
    cam.location = (0, -6, 0.4)
    cam.rotation_euler = (math.radians(90), 0, 0)
    bpy.context.collection.objects.link(cam)
    scn.camera = cam
    # raking key light (upper-left) + soft fill
    kd = bpy.data.lights.new("key", 'SUN')
    kd.energy = KEY_DARK if dark else KEY_LIGHT
    kd.angle = math.radians(3)
    k = bpy.data.objects.new("key", kd)
    k.rotation_euler = (math.radians(58), math.radians(8), math.radians(35))
    bpy.context.collection.objects.link(k)
    fd = bpy.data.lights.new("fill", 'SUN')
    fd.energy = (KEY_DARK if dark else KEY_LIGHT) * 0.25
    f = bpy.data.objects.new("fill", fd)
    f.rotation_euler = (math.radians(70), 0, math.radians(-120))
    bpy.context.collection.objects.link(f)


def render_one(builder, name, dark):
    wipe()
    setup_scene(dark)
    ob = builder()
    apply(ob, stone_mat(name + "_mat", STONE_DARK if dark else STONE_LIGHT))
    # frame it: shade smooth, recenter
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.shade_smooth()
    suffix = "dark" if dark else "light"
    path = os.path.join(OUT, f"{name}_{suffix}.png")
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print(f"  ✓ rendered {path}")


# ── 4. JALI SCREEN PANEL ─────────────────────────────────────────────────
def build_jali():
    # a pierced stone lattice: a slab with a grid of star/lozenge holes.
    # build the slab, then boolean-cut a repeating diamond+circle pattern.
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
    slab = bpy.context.active_object
    slab.scale = (1.15, 0.08, 1.4)   # thin upright panel
    bpy.ops.object.transform_apply(scale=True)
    cutters = []
    cols, rows = 6, 8
    for r in range(rows):
        for c in range(cols):
            x = (c - (cols - 1) / 2) * 0.34
            z = (r - (rows - 1) / 2) * 0.32
            # a rotated cube = diamond hole
            bpy.ops.mesh.primitive_cube_add(size=1, location=(x, 0, z))
            d = bpy.context.active_object
            d.scale = (0.11, 0.3, 0.11)
            d.rotation_euler = (0, math.radians(45), 0)
            bpy.ops.object.transform_apply(scale=True, rotation=True)
            cutters.append(d)
            # a small round hole offset between diamonds
            if c < cols - 1 and r < rows - 1:
                bpy.ops.mesh.primitive_cylinder_add(radius=0.05, depth=0.4,
                    location=(x + 0.17, 0, z + 0.16),
                    rotation=(math.radians(90), 0, 0), vertices=16)
                cutters.append(bpy.context.active_object)
    # join cutters, boolean-difference from the slab
    for cu in cutters:
        cu.select_set(True)
    bpy.context.view_layer.objects.active = cutters[0]
    bpy.ops.object.join()
    allcut = bpy.context.active_object
    bpy.context.view_layer.objects.active = slab
    bm = slab.modifiers.new("cut", 'BOOLEAN')
    bm.operation = 'DIFFERENCE'
    bm.object = allcut
    bpy.ops.object.modifier_apply(modifier="cut")
    bpy.data.objects.remove(allcut, do_unlink=True)
    # bevel the pierced edges so light catches them
    slab.select_set(True)
    bpy.context.view_layer.objects.active = slab
    bev = slab.modifiers.new("bev", 'BEVEL')
    bev.width = 0.012
    bev.segments = 2
    bpy.ops.object.modifier_apply(modifier="bev")
    return slab


# ── 5. PURNA-KALASHA (overflowing pot of plenty) ─────────────────────────
def build_kalasha():
    # a pot profile revolved, topped with a spray of leaves + a coconut.
    pts = [(0.0, -0.9), (0.35, -0.88), (0.5, -0.75), (0.58, -0.5),
           (0.6, -0.2), (0.5, 0.05), (0.32, 0.2), (0.28, 0.3),
           (0.42, 0.4), (0.42, 0.48), (0.3, 0.52), (0.0, 0.53)]
    curve = bpy.data.curves.new("potProf", 'CURVE')
    curve.dimensions = '3D'
    sp = curve.splines.new('POLY')
    sp.points.add(len(pts) - 1)
    for i, (r, z) in enumerate(pts):
        sp.points[i].co = (r, 0, z, 1)
    ob = bpy.data.objects.new("potProf", curve)
    bpy.context.collection.objects.link(ob)
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.convert(target='MESH')
    pot = bpy.context.active_object
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.spin(steps=56, angle=math.radians(360), axis=(0, 0, 1), center=(0, 0, 0))
    bpy.ops.mesh.remove_doubles(threshold=0.001)
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    parts = [pot]
    # a ring of mango leaves fanning from the mouth
    for i in range(9):
        ang = (i / 9) * 2 * math.pi
        bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=0.12, radius2=0.0,
                                        depth=0.5, location=(0, 0, 0))
        leaf = bpy.context.active_object
        leaf.scale = (1.0, 0.18, 1.0)
        leaf.rotation_euler = (math.radians(28), 0, ang)
        leaf.location = (math.cos(ang) * 0.34, math.sin(ang) * 0.34, 0.62)
        parts.append(leaf)
    # the coconut on top
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.16, location=(0, 0, 0.78))
    parts.append(bpy.context.active_object)
    for p in parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = pot
    bpy.ops.object.join()
    return pot


# ── 6. KIRTIMUKHA (the glory-face guardian) ──────────────────────────────
def build_kirtimukha():
    # a stylised frontal lion/glory face: brow bar, two eyes, a fanged maw,
    # a mane of scroll-curls — assembled from primitives as a relief plaque.
    parts = []

    def add_sphere(x, z, r, sy=0.5, sx=1.0, szc=1.0):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=(x, -0.05, z))
        o = bpy.context.active_object
        o.scale = (sx, sy, szc)
        parts.append(o)
        return o

    # heavy brow ridge (a stretched torus segment)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.55, minor_radius=0.09,
        major_segments=32, minor_segments=8, location=(0, -0.05, 0.28),
        rotation=(math.radians(90), 0, 0))
    brow = bpy.context.active_object
    for v in brow.data.vertices:
        v.select = (v.co.z < 0.28)
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.delete(type='VERT'); bpy.ops.object.mode_set(mode='OBJECT')
    parts.append(brow)
    # two bulging eyes
    add_sphere(-0.24, 0.12, 0.14)
    add_sphere(0.24, 0.12, 0.14)
    # pupils
    add_sphere(-0.24, 0.13, 0.06, sy=0.4)
    add_sphere(0.24, 0.13, 0.06, sy=0.4)
    # broad snout / nose
    add_sphere(0.0, -0.02, 0.16, sy=0.55, szc=0.8)
    # the gaping maw (a wide flattened dome, lower)
    add_sphere(0.0, -0.34, 0.34, sy=0.5, szc=0.5)
    # fangs — two small cones pointing down from the maw
    for sx in (-0.16, 0.16):
        bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=0.06, radius2=0.0,
            depth=0.22, location=(sx, -0.15, -0.2))
        fang = bpy.context.active_object
        fang.rotation_euler = (math.radians(180), 0, 0)
        fang.scale = (1, 0.5, 1)
        parts.append(fang)
    # mane curls — a ring of small flattened spheres around the top
    for i in range(11):
        ang = math.pi * (0.15 + 0.7 * (i / 10))  # top arc only
        add_sphere(math.cos(ang) * 0.62, 0.18 + math.sin(ang) * 0.5, 0.1, sy=0.45)
    for p in parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    ob = bpy.context.active_object
    ob.name = "kirtimukha"
    return ob


for dark in (False, True):
    render_one(build_capital, "capital", dark)
    render_one(build_torana, "torana", dark)
    render_one(build_rosette, "rosette", dark)
    render_one(build_jali, "jali-panel", dark)
    render_one(build_kalasha, "kalasha", dark)
    render_one(build_kirtimukha, "kirtimukha", dark)

print("DONE — 12 ornament PNGs in", OUT)
