# ─────────────────────────────────────────────────────────────────────────
# render_mandala_ceiling.py — an AUTHENTIC deep-relief temple CEILING MANDALA
# (padma-shila / lotus ceiling medallion) + a carved VINE FRIEZE, rendered in
# Blender to real carved stone with a gold catch-light (Tanjore feel).
#
#   /Applications/Blender.app/Contents/MacOS/Blender -b -P render_mandala_ceiling.py
#
# The mandala is many concentric carved bands (like a real Gupta/Chalukya ceiling
# rosette): a raised central lotus seed → petal ring → beaded torus → gavaksha
# arch band → lotus-petal band → dentil ring → outer lotus. Lit top-down with a
# warm key so the relief reads as depth. Output: public/backgrounds/*.webp-source PNG.
# ─────────────────────────────────────────────────────────────────────────
import bpy, math, os

OUT = os.path.join(os.path.dirname(bpy.data.filepath) or
                   "/Users/sinhaankur/Documents/GitHub/india-fiscal-map/interactive-vercel-ship-26-i-2",
                   "public", "backgrounds")
os.makedirs(OUT, exist_ok=True)

STONE_LIGHT = (0.80, 0.63, 0.40)
STONE_DARK  = (0.30, 0.21, 0.13)
GOLD        = (0.83, 0.62, 0.26)


def wipe():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.curves):
        for b in list(block):
            block.remove(b)


def carved_mat(name, rgb, gold=False):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*rgb, 1)
    bsdf.inputs["Roughness"].default_value = 0.45 if gold else 0.8
    if gold and "Metallic" in bsdf.inputs:
        bsdf.inputs["Metallic"].default_value = 0.7
    # carved-stone grain
    tex = nt.nodes.new("ShaderNodeTexNoise")
    tex.inputs["Scale"].default_value = 60
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.06
    nt.links.new(tex.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return m


def cylinder(r, z0, z1, verts=96, name="ring"):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=(z1 - z0), vertices=verts,
                                         location=(0, 0, (z0 + z1) / 2))
    return bpy.context.active_object


def petal_ring(count, rad, length, width, z, tilt=0.0):
    """a ring of cone-petals lying flat (a lotus band), tips outward."""
    objs = []
    for i in range(count):
        ang = (i / count) * 2 * math.pi
        bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=width, radius2=0.0,
                                        depth=length, location=(0, 0, 0))
        p = bpy.context.active_object
        # lay flat, point outward (+X then rotate around Z)
        p.rotation_euler = (math.radians(90) + tilt, 0, ang + math.pi / 2)
        p.location = (math.cos(ang) * rad, math.sin(ang) * rad, z)
        p.scale = (1.0, 1.0, 0.5)
        objs.append(p)
    return objs


def bead_ring(count, rad, r, z):
    objs = []
    for i in range(count):
        ang = (i / count) * 2 * math.pi
        bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=(math.cos(ang) * rad, math.sin(ang) * rad, z))
        objs.append(bpy.context.active_object)
    return objs


def build_ceiling_mandala():
    parts = []
    # base disc (the ceiling slab)
    parts.append(cylinder(1.55, -0.10, 0.02, name="slab"))
    # outer lotus-petal band (24)
    parts += petal_ring(24, 1.30, 0.42, 0.10, 0.06)
    # dentil / bead ring
    parts += bead_ring(48, 1.02, 0.045, 0.09)
    # gavaksha-like arch band — small torus segments (use flattened tori)
    for i in range(16):
        ang = (i / 16) * 2 * math.pi
        bpy.ops.mesh.primitive_torus_add(major_radius=0.09, minor_radius=0.03,
                                         major_segments=16, minor_segments=8,
                                         location=(math.cos(ang) * 0.86, math.sin(ang) * 0.86, 0.09))
        t = bpy.context.active_object
        t.rotation_euler = (math.radians(90), 0, ang)
        parts.append(t)
    # mid lotus-petal band (16), raised
    parts += petal_ring(16, 0.66, 0.36, 0.11, 0.12)
    # inner bead ring
    parts += bead_ring(24, 0.42, 0.04, 0.14)
    # central raised lotus seed (a dome) + 8 inner petals
    parts += petal_ring(8, 0.20, 0.24, 0.09, 0.16)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.16, location=(0, 0, 0.17))
    dome = bpy.context.active_object
    dome.scale = (1, 1, 0.6)
    parts.append(dome)
    # join
    for o in parts:
        o.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    ob = bpy.context.active_object
    bpy.ops.object.shade_smooth()
    return ob


def build_vine_frieze():
    """a running carved foliate scroll: a full-torus S-vine (kept whole) with
    alternating lotus buds + leaves above/below — a temple lintel band."""
    parts = []
    # backing band
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, -0.06))
    band = bpy.context.active_object
    band.scale = (3.2, 0.5, 0.05)
    bpy.ops.object.transform_apply(scale=True)
    parts.append(band)
    # a run of overlapping full tori = a continuous rope/vine (no vertex deletion)
    x = -2.8
    up = True
    while x <= 2.8:
        bpy.ops.mesh.primitive_torus_add(major_radius=0.30, minor_radius=0.055,
                                         major_segments=28, minor_segments=10,
                                         location=(x, 0.0, 0.0),
                                         rotation=(math.radians(90), 0, 0))
        parts.append(bpy.context.active_object)
        # a lotus bud (cone) alternately up / down at each node
        zc = 0.30 if up else -0.30
        bpy.ops.mesh.primitive_cone_add(vertices=10, radius1=0.14, radius2=0.0, depth=0.34,
                                        location=(x, 0.0, zc))
        bud = bpy.context.active_object
        bud.rotation_euler = (math.radians(0 if up else 180), 0, 0)
        bud.scale = (1, 0.45, 1)
        parts.append(bud)
        # two small side leaves
        for dx in (-0.16, 0.16):
            bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=0.07, radius2=0.0, depth=0.18,
                                            location=(x + dx, 0.0, zc * 0.45))
            lf = bpy.context.active_object
            lf.rotation_euler = (math.radians(90), 0, math.radians(90 if dx > 0 else -90))
            lf.scale = (1, 0.4, 1)
            parts.append(lf)
        up = not up
        x += 0.62
    for o in parts:
        o.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    ob = bpy.context.active_object
    bpy.ops.object.shade_smooth()
    return ob


def setup_scene(dark, top_down=False, wide=False):
    scn = bpy.context.scene
    engines = [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items]
    scn.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in engines else 'BLENDER_EEVEE'
    scn.render.film_transparent = True
    scn.render.resolution_x = 1600 if wide else 1400
    scn.render.resolution_y = 500 if wide else 1400
    scn.render.image_settings.file_format = 'PNG'
    scn.render.image_settings.color_mode = 'RGBA'
    cam_d = bpy.data.cameras.new("cam")
    cam_d.type = 'ORTHO'
    cam_d.ortho_scale = 6.6 if wide else 3.3
    cam = bpy.data.objects.new("cam", cam_d)
    if top_down:
        cam.location = (0, 0, 8)
        cam.rotation_euler = (0, 0, 0)
    else:
        cam.location = (0, -8, 1.2)
        cam.rotation_euler = (math.radians(82), 0, 0)
    bpy.context.collection.objects.link(cam)
    scn.camera = cam
    # warm raking key + gold rim
    kd = bpy.data.lights.new("key", 'SUN'); kd.energy = 3.0 if dark else 5.5; kd.angle = math.radians(4)
    k = bpy.data.objects.new("key", kd)
    k.rotation_euler = (math.radians(35), math.radians(12), math.radians(40))
    bpy.context.collection.objects.link(k)
    fd = bpy.data.lights.new("fill", 'SUN'); fd.energy = (3.0 if dark else 5.5) * 0.28
    f = bpy.data.objects.new("fill", fd); f.rotation_euler = (math.radians(60), 0, math.radians(-130))
    bpy.context.collection.objects.link(f)


def render_one(builder, name, dark, top_down=False, wide=False):
    wipe()
    setup_scene(dark, top_down=top_down, wide=wide)
    ob = builder()
    from_mat = carved_mat(name + "_mat", STONE_DARK if dark else STONE_LIGHT)
    ob.data.materials.clear(); ob.data.materials.append(from_mat)
    suffix = "dark" if dark else "light"
    path = os.path.join(OUT, f"{name}_{suffix}.png")
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print(f"  ✓ {path}")


for dark in (False, True):
    render_one(build_ceiling_mandala, "mandala_ceiling", dark, top_down=True)
    render_one(build_vine_frieze, "vine_frieze", dark, top_down=True, wide=True)

print("DONE — 4 authentic ornament PNGs in", OUT)
