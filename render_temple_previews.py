#!/usr/bin/env python3
"""
render_temple_previews.py — import each <id>.glb and render a 3/4 preview PNG
so the rebuilt forms can be eyeballed. Output: assets/temples-3d/_preview/<id>.png

    /Applications/Blender.app/Contents/MacOS/Blender --background \
        --python render_temple_previews.py -- [id ...]
"""
import bpy, math, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
GLB = os.path.join(HERE, "assets", "temples-3d")
OUT = os.path.join(GLB, "_preview")
os.makedirs(OUT, exist_ok=True)

IDS = ["nagara", "dravidian", "stupa", "jain", "kashmiri", "sun_temple",
       "egyptian", "greek", "mesoamerican", "ziggurat", "andean", "moai",
       "ethiopian", "petra", "elephanta", "megalithic_circle"]


def clean():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()
    for c in (bpy.data.meshes, bpy.data.cameras, bpy.data.lights):
        for b in list(c):
            if b.users == 0:
                c.remove(b)


def setup_world():
    w = bpy.context.scene.world or bpy.data.worlds.new("W")
    bpy.context.scene.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes.get("Background")
    bg.inputs[0].default_value = (0.05, 0.05, 0.06, 1)
    bg.inputs[1].default_value = 1.0


def render_one(fid):
    clean()
    path = os.path.join(GLB, fid + ".glb")
    if not os.path.exists(path):
        print("!! missing", fid); return
    bpy.ops.import_scene.gltf(filepath=path)
    # frame all
    objs = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    if not objs:
        print("!! no mesh", fid); return
    xs, ys, zs = [], [], []
    for o in objs:
        for v in o.bound_box:
            wv = o.matrix_world @ __import__("mathutils").Vector(v)
            xs.append(wv.x); ys.append(wv.y); zs.append(wv.z)
    cx, cy, cz = (min(xs)+max(xs))/2, (min(ys)+max(ys))/2, (min(zs)+max(zs))/2
    r = max(max(xs)-min(xs), max(ys)-min(ys), max(zs)-min(zs))

    cam_data = bpy.data.cameras.new("cam")
    cam = bpy.data.objects.new("cam", cam_data)
    bpy.context.collection.objects.link(cam)
    d = r * 1.7
    cam.location = (cx + d*0.75, cy - d*0.9, cz + d*0.55)
    # look at centre
    import mathutils
    dir_ = mathutils.Vector((cx, cy, cz)) - cam.location
    cam.rotation_euler = dir_.to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.camera = cam

    sun = bpy.data.lights.new("sun", "SUN")
    sun.energy = 3.0
    so = bpy.data.objects.new("sun", sun)
    so.rotation_euler = (math.radians(55), math.radians(20), math.radians(40))
    bpy.context.collection.objects.link(so)
    fill = bpy.data.lights.new("fill", "SUN"); fill.energy = 1.0
    fo = bpy.data.objects.new("fill", fill)
    fo.rotation_euler = (math.radians(60), 0, math.radians(-120))
    bpy.context.collection.objects.link(fo)
    # a headlight from the camera so open interiors (caves) are lit, not black
    head = bpy.data.lights.new("head", "SUN"); head.energy = 2.0
    ho = bpy.data.objects.new("head", head)
    ho.rotation_euler = cam.rotation_euler
    bpy.context.collection.objects.link(ho)

    sc = bpy.context.scene
    sc.render.engine = "BLENDER_EEVEE"
    sc.render.resolution_x = 700
    sc.render.resolution_y = 700
    sc.render.film_transparent = False
    sc.render.filepath = os.path.join(OUT, fid + ".png")
    setup_world()
    bpy.ops.render.render(write_still=True)
    print("  rendered", fid + ".png")


def main():
    argv = sys.argv
    ids = argv[argv.index("--")+1:] if "--" in argv else []
    for fid in (ids or IDS):
        render_one(fid)


if __name__ == "__main__":
    main()
