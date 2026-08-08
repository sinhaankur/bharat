#!/usr/bin/env python3
"""
render_temple_bg.py — Blender-rendered Mauryan/Gupta temple BACKGROUNDS for the
Bharat app (real 3D, not flat SVG vectors).

Design principle: the GARBHAGRIHA / center-of-focus — Hindu temple design (then and
now) radiates from a sacred centre with vertical aspiration (the shikhara). So each
plate is a CENTERED, symmetrical composition: a carved sandstone shikhara + lotus,
lit like a monument, on a soft ground — subtle enough to sit BEHIND content.

Renders (EEVEE, headless):
    public/backgrounds/shikhara_light.webp   — Mauryan: sandstone + sky
    public/backgrounds/shikhara_dark.webp    — Gupta interior: red stone + ochre glow
    public/backgrounds/lotus_light.webp      — a carved lotus medallion, top-down
    public/backgrounds/lotus_dark.webp

Run:
    /Applications/Blender.app/Contents/MacOS/Blender --background --python render_temple_bg.py
"""
import bpy, math, os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "interactive-vercel-ship-26-i-2", "public", "backgrounds")
os.makedirs(OUT, exist_ok=True)


def wipe():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()
    for c in (bpy.data.meshes, bpy.data.materials, bpy.data.lights, bpy.data.cameras):
        for b in list(c):
            c.remove(b)


def mat(name, rgb, rough=0.8, emit=None, emit_str=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (*rgb, 1)
    b.inputs["Roughness"].default_value = rough
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = emit_str
    return m


def profile_solid(profile, seg=96, material=None):
    """Lathe a 2D profile [(r,z)…] around Z — the temple silhouette of revolution."""
    verts, faces = [], []
    n = len(profile)
    for i in range(seg):
        a = 2 * math.pi * i / seg
        ca, sa = math.cos(a), math.sin(a)
        for (r, z) in profile:
            verts.append((r * ca, r * sa, z))
    for i in range(seg):
        i2 = (i + 1) % seg
        for j in range(n - 1):
            a = i * n + j
            b = i * n + j + 1
            c = i2 * n + j + 1
            d = i2 * n + j
            faces.append((a, b, c, d))
    me = bpy.data.meshes.new("prof")
    me.from_pydata(verts, [], faces)
    me.update()
    ob = bpy.data.objects.new("prof", me)
    bpy.context.collection.objects.link(ob)
    if material:
        ob.data.materials.append(material)
    # smooth
    for p in ob.data.polygons:
        p.use_smooth = True
    return ob


def shikhara_profile():
    """Nagara curvilinear shikhara: w = W·(1−t)^1.35, on a plinth. Center-focused,
    vertical aspiration — the temple pointing to the sky over the garbhagriha."""
    prof = [(0.0, 0.0)]
    # plinth (jagati)
    prof += [(2.6, 0.0), (2.6, 0.5), (2.2, 0.6)]
    # the tower
    H, W = 6.0, 2.0
    steps = 26
    for i in range(steps + 1):
        t = i / steps
        w = W * (1 - t) ** 1.35 + 0.12
        z = 0.6 + H * t
        prof.append((w, z))
    # amalaka (the ribbed crown) + finial
    prof += [(0.7, 0.6 + H + 0.15), (0.9, 0.6 + H + 0.4), (0.5, 0.6 + H + 0.7), (0.15, 0.6 + H + 1.2), (0.0, 0.6 + H + 1.3)]
    return prof


def lotus(cx=0, cy=0, z=0, petals=16, material=None):
    """A carved lotus medallion — the sacred center, radial symmetry."""
    objs = []
    for ring, (rad, tilt, scale) in enumerate([(1.0, 0.5, 1.0), (1.7, 0.35, 1.15), (2.5, 0.22, 1.3)]):
        for i in range(petals):
            a = 2 * math.pi * i / petals + (ring * math.pi / petals)
            bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.55 * scale, location=(cx + math.cos(a) * rad, cy + math.sin(a) * rad, z))
            p = bpy.context.active_object
            p.scale = (0.35, 0.9, 0.28)
            p.rotation_euler = (tilt, 0, a + math.pi / 2)
            if material:
                p.data.materials.append(material)
            objs.append(p)
    # seed pod center
    bpy.ops.mesh.primitive_cylinder_add(radius=0.7, depth=0.4, location=(cx, cy, z + 0.1))
    c = bpy.context.active_object
    if material:
        c.data.materials.append(material)
    return objs


def setup_render(w=1600, h=1000):
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items] else "BLENDER_EEVEE"
    sc.render.resolution_x, sc.render.resolution_y = w, h
    sc.render.film_transparent = False
    sc.render.image_settings.file_format = "WEBP"
    sc.render.image_settings.quality = 82
    try:
        sc.eevee.use_bloom = True
    except Exception:
        pass


def world_color(rgb, strength=1.0):
    w = bpy.context.scene.world or bpy.data.worlds.new("W")
    bpy.context.scene.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes.get("Background")
    bg.inputs[0].default_value = (*rgb, 1)
    bg.inputs[1].default_value = strength


def cam_and_key(loc, look, key_loc, key_energy, key_color=(1, 1, 1), lens=45):
    # an empty at the look-at target + a Track-To constraint = reliable aiming
    bpy.ops.object.empty_add(location=look)
    target = bpy.context.active_object
    bpy.ops.object.camera_add(location=loc)
    cam = bpy.context.active_object
    cam.data.lens = lens
    con = cam.constraints.new(type="TRACK_TO")
    con.target = target
    con.track_axis = "TRACK_NEGATIVE_Z"
    con.up_axis = "UP_Y"
    bpy.context.scene.camera = cam
    bpy.ops.object.light_add(type="AREA", location=key_loc)
    k = bpy.context.active_object
    k.data.energy = key_energy
    k.data.size = 12
    k.data.color = key_color
    # aim the key light at the subject too
    kcon = k.constraints.new(type="TRACK_TO")
    kcon.target = target
    kcon.track_axis = "TRACK_NEGATIVE_Z"
    return cam


def render(path):
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print("  wrote", os.path.relpath(path, HERE))


# ── the four plates ──
def plate_shikhara(dark):
    wipe()
    setup_render()
    if dark:
        world_color((0.11, 0.085, 0.075), 0.6)          # temple-interior dark
        stone = mat("red", (0.63, 0.28, 0.20), rough=0.75)  # Gupta Mathura red sandstone
        glow = (0.85, 0.6, 0.28)
    else:
        world_color((0.62, 0.78, 0.92), 1.0)            # Indian sky
        stone = mat("sand", (0.86, 0.76, 0.58), rough=0.8)  # sandstone
        glow = (1, 0.96, 0.85)
    ob = profile_solid(shikhara_profile(), material=stone)
    # a soft ground plane
    bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, 0))
    bpy.context.active_object.data.materials.append(mat("ground", (0.5, 0.42, 0.32) if not dark else (0.14, 0.1, 0.09), rough=0.95))
    # camera pulled in & tracking the tower's mid-height (center of focus)
    cam_and_key((0, -13, 5.5), (0, 0, 4.5), (7, -7, 12), 1400 if dark else 700, glow, lens=40)
    render(os.path.join(OUT, f"shikhara_{'dark' if dark else 'light'}.webp"))


def plate_lotus(dark):
    wipe()
    setup_render(1400, 1400)
    if dark:
        world_color((0.11, 0.085, 0.075), 0.5)
        stone = mat("red", (0.66, 0.3, 0.22), rough=0.7)
    else:
        world_color((0.42, 0.36, 0.28), 0.7)   # dim ground so carved petals catch shadow
        stone = mat("sand", (0.9, 0.81, 0.62), rough=0.78)
    lotus(0, 0, 0, petals=18, material=stone)
    # a raking side light exaggerates the carving relief
    cam_and_key((0, 0, 12), (0, 0, 0), (9, -3, 5), 1600 if dark else 1100, (0.9, 0.7, 0.4) if dark else (1, 0.98, 0.92))
    render(os.path.join(OUT, f"lotus_{'dark' if dark else 'light'}.webp"))


def main():
    for dark in (False, True):
        plate_shikhara(dark)
        plate_lotus(dark)
    print("done — 4 temple backgrounds in", os.path.relpath(OUT, HERE))


if __name__ == "__main__":
    main()
