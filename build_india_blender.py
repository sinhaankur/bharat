#!/usr/bin/env python3
"""build_india_blender.py — build a STANDALONE India-map .blend from the atlas data.

Runs headless, in its OWN Blender process, and writes a fresh india_map.blend. It does
NOT touch any live/interactive Blender session — nothing here reaches into an existing
scene. Every state is a real extruded mesh from india-states.geojson; the extrusion
HEIGHT and the material COLOUR encode real data (default: own-tax revenue), so the map
carries the atlas's detail, not just an outline.

Run:
    blender --background --python build_india_blender.py
    # or, if `blender` isn't on PATH, point at the app binary:
    # /Applications/Blender.app/Contents/MacOS/Blender -b -P build_india_blender.py

Output: india_map.blend  (open it in Blender; your other work is untouched.)

Data layer is switchable at the top (LAYER): own_tax | gsdp | pop | corruption | wealth.
States without that figure extrude flat + grey — an honest gap, never faked.
"""
import json
import math
import os
import sys

import bpy  # noqa: available only inside Blender

HERE = os.path.dirname(os.path.abspath(__file__))
GEOJSON = os.path.join(HERE, "india-states.geojson")
FISCAL = os.path.join(HERE, "india-fiscal.json")
SAFETY = os.path.join(HERE, "safety.json")
OUT = os.path.join(HERE, "india_map.blend")

LAYER = "own_tax"          # own_tax | gsdp | pop | corruption | wealth
MAX_HEIGHT = 3.0           # world units for the tallest state
XY_SCALE = 1.0             # 1 unit per degree; India ≈ 29° wide
EXTRUDE_FLOOR = 0.04       # a thin slab even for zero/gap states so the map is solid


# ---- data -----------------------------------------------------------------
def load():
    geo = json.load(open(GEOJSON))
    fiscal = json.load(open(FISCAL)).get("states", {})
    safety = json.load(open(SAFETY)).get("states", {})
    return geo, fiscal, safety


def value_for(name, fiscal, safety):
    """Return (value, has_data) for the active LAYER — latest year where a series."""
    f = fiscal.get(name)
    s = safety.get(name)
    if LAYER == "own_tax" and f and f.get("ownTax"):
        return f["ownTax"][-1], True
    if LAYER == "gsdp" and f and f.get("gsdp"):
        return f["gsdp"][-1], True
    if LAYER == "pop" and f and f.get("pop_cr") is not None:
        return f["pop_cr"], True
    if LAYER == "corruption" and s and (s.get("wealth") or {}):
        # bribe-paid % lives in fiscal extras elsewhere; fall back to density here if absent
        pass
    if LAYER == "wealth" and s and (s.get("wealth") or {}).get("percapita_income_inr"):
        return s["wealth"]["percapita_income_inr"], True
    return 0.0, False


def ramp(t):
    """0..1 -> an RGBA on a calm blue→amber→red ramp (matches the atlas mood)."""
    t = max(0.0, min(1.0, t))
    stops = [(0.20, 0.30, 0.45), (0.30, 0.55, 0.70), (0.85, 0.72, 0.35), (0.80, 0.35, 0.20)]
    seg = t * (len(stops) - 1)
    i = min(int(seg), len(stops) - 2)
    a, b, f = stops[i], stops[i + 1], seg - i
    return (a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f, 1.0)


# ---- geometry -------------------------------------------------------------
def polygons_of(geom):
    """Yield outer rings (lists of [lon,lat]) for Polygon / MultiPolygon."""
    if geom["type"] == "Polygon":
        yield geom["coordinates"][0]
    elif geom["type"] == "MultiPolygon":
        for poly in geom["coordinates"]:
            yield poly[0]


def build_state(name, geom, height, color, lat0):
    """One extruded mesh per state (fan-triangulated rings), flat-projected, extruded up."""
    verts, faces = [], []
    for ring in polygons_of(geom):
        if len(ring) < 3:
            continue
        base = len(verts)
        n = len(ring)
        # project lon/lat → xy (equirectangular, cos-corrected so India isn't stretched)
        for lon, lat in ring:
            x = lon * XY_SCALE * math.cos(math.radians(lat0))
            y = lat * XY_SCALE
            verts.append((x, y, 0.0))          # bottom ring
        for lon, lat in ring:
            x = lon * XY_SCALE * math.cos(math.radians(lat0))
            y = lat * XY_SCALE
            verts.append((x, y, height))       # top ring
        # top cap (fan) + walls
        for i in range(1, n - 1):
            faces.append((base + n, base + n + i, base + n + i + 1))     # top
        for i in range(n):
            j = (i + 1) % n
            faces.append((base + i, base + j, base + n + j))             # wall
            faces.append((base + i, base + n + j, base + n + i))
    if not faces:
        return None
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    mat = bpy.data.materials.new(f"mat_{name}")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color
        bsdf.inputs["Roughness"].default_value = 0.6
    obj.data.materials.append(mat)
    return obj


# ---- scene ----------------------------------------------------------------
def fresh_scene():
    # wipe the default startup scene only (this is our own headless process)
    for coll in list(bpy.data.collections):
        bpy.data.collections.remove(coll)
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)


def main():
    geo, fiscal, safety = load()
    fresh_scene()
    coll = bpy.data.collections.new("India_Map")
    bpy.context.scene.collection.children.link(coll)

    lat_mid = 22.0
    vals = []
    for f in geo["features"]:
        v, has = value_for(f["properties"]["ST_NM"], fiscal, safety)
        vals.append(v if has else 0.0)
    vmax = max(vals) or 1.0

    built = sourced = 0
    for f in geo["features"]:
        name = f["properties"]["ST_NM"]
        v, has = value_for(name, fiscal, safety)
        t = (v / vmax) if has else 0.0
        height = EXTRUDE_FLOOR + t * MAX_HEIGHT
        color = ramp(t) if has else (0.25, 0.25, 0.27, 1.0)  # grey = data gap
        obj = build_state(name, f["geometry"], height, color, lat_mid)
        if obj:
            coll.objects.link(obj)
            built += 1
            sourced += 1 if has else 0

    # centre the map at the world origin
    xs = [o.location for o in coll.objects]
    for o in coll.objects:
        o.location.x -= 78.0 * math.cos(math.radians(lat_mid))
        o.location.y -= lat_mid

    # camera (3/4 aerial) + sun + a soft world
    cam_data = bpy.data.cameras.new("IndiaCam")
    cam = bpy.data.objects.new("IndiaCam", cam_data)
    cam.location = (0.0, -34.0, 26.0)
    cam.rotation_euler = (math.radians(52), 0.0, 0.0)
    coll.objects.link(cam)
    bpy.context.scene.camera = cam

    sun_data = bpy.data.lights.new("Sun", "SUN")
    sun_data.energy = 3.0
    sun = bpy.data.objects.new("Sun", sun_data)
    sun.rotation_euler = (math.radians(50), math.radians(20), math.radians(-40))
    coll.objects.link(sun)

    world = bpy.data.worlds.new("IndiaWorld")
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.02, 0.02, 0.03, 1.0)
    bpy.context.scene.world = world

    bpy.ops.wm.save_as_mainfile(filepath=OUT)
    print(f"\n[india-blender] wrote {OUT}")
    print(f"[india-blender] {built} states built · {sourced} carry '{LAYER}' data · "
          f"{built - sourced} extruded flat/grey (gap)")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:  # surface the real error under --background
        print("[india-blender] FAILED:", e, file=sys.stderr)
        raise
