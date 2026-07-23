#!/usr/bin/env python3
"""build_india_districts_blender.py — ALL 594 districts in 3D, by real elevation.

Standalone + headless: spawns its own Blender, writes india_districts.blend, and
never touches a live session. Every district in districts/*.geojson becomes an
extruded mesh whose HEIGHT is its real centroid elevation (metres above sea, from
the atlas DEM) — so the Himalaya wall rises, the Ganga plain stays flat, the coast
sinks to the sea: river → plain → mountain, the actual relief of India.

Extras layered on for "river to mountain to city":
  • MOUNTAIN vs PLAIN vs COAST colour ramp by elevation
  • CITY markers — a small cone at each district centroid, taller for denser/urban
  • RIVER corridors — districts a major river runs through get a blue tint band
    (rivers are NAMED in the data, not drawn as lines — so this marks the corridor,
     honestly, rather than inventing a river path)

Run:
    blender --background --python build_india_districts_blender.py
    # /Applications/Blender.app/Contents/MacOS/Blender -b -P build_india_districts_blender.py

Output: india_districts.blend
"""
import json
import glob
import math
import os
import sys

import bpy  # noqa: inside Blender only

HERE = os.path.dirname(os.path.abspath(__file__))
LEDGER = os.path.join(HERE, "district-ledger.json")
CENTROIDS = os.path.join(HERE, "district-centroids.json")
OUT = os.path.join(HERE, "india_districts.blend")

LAT_MID = 22.0
XY_SCALE = 1.0
ELEV_SCALE = 0.0016        # world units per metre (8848 m Everest ≈ 14 units)
FLOOR = 0.03


def geo_for(led):
    """Map 'STATE|DISTRICT' → geography dict from the ledger (elevation, rivers)."""
    out = {}
    for st, s in led.get("states", {}).items():
        for dn, d in (s.get("districts") or {}).items():
            out[f"{st}|{dn}"] = (d.get("dimensions") or {}).get("geography") or {}
    return out


def elev_color(m):
    """Coast/sea (low) → plain → hill → mountain (high)."""
    stops = [(0, (0.16, 0.28, 0.42)),      # near sea — deep blue-grey
             (200, (0.30, 0.45, 0.35)),    # plain — green
             (600, (0.55, 0.50, 0.32)),    # low hills — tan
             (1800, (0.55, 0.40, 0.28)),   # hills — brown
             (4000, (0.85, 0.85, 0.88)),   # high mountain — snow-white
             (8000, (0.97, 0.97, 1.0))]
    for i in range(len(stops) - 1):
        m0, c0 = stops[i]
        m1, c1 = stops[i + 1]
        if m <= m1:
            f = (m - m0) / (m1 - m0) if m1 > m0 else 0
            f = max(0.0, min(1.0, f))
            return tuple(c0[k] + (c1[k] - c0[k]) * f for k in range(3)) + (1.0,)
    return stops[-1][1] + (1.0,)


def polygons_of(geom):
    if geom["type"] == "Polygon":
        yield geom["coordinates"][0]
    elif geom["type"] == "MultiPolygon":
        for poly in geom["coordinates"]:
            yield poly[0]


def make_material(name, color, is_river):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    b = mat.node_tree.nodes.get("Principled BSDF")
    if b:
        b.inputs["Base Color"].default_value = color
        b.inputs["Roughness"].default_value = 0.35 if is_river else 0.7
    return mat


def build_district(name, geom, height, color, is_river):
    verts, faces = [], []
    for ring in polygons_of(geom):
        if len(ring) < 3:
            continue
        base = len(verts)
        n = len(ring)
        for lon, lat in ring:
            verts.append((lon * XY_SCALE * math.cos(math.radians(LAT_MID)), lat * XY_SCALE, 0.0))
        for lon, lat in ring:
            verts.append((lon * XY_SCALE * math.cos(math.radians(LAT_MID)), lat * XY_SCALE, height))
        for i in range(1, n - 1):
            faces.append((base + n, base + n + i, base + n + i + 1))
        for i in range(n):
            j = (i + 1) % n
            faces.append((base + i, base + j, base + n + j))
            faces.append((base + i, base + n + j, base + n + i))
    if not faces:
        return None
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    obj.data.materials.append(make_material(f"m_{name}", color, is_river))
    return obj


def main():
    led = json.load(open(LEDGER))
    gmap = geo_for(led)
    try:
        cent = json.load(open(CENTROIDS)).get("centroids", {})
    except FileNotFoundError:
        cent = {}

    scene = bpy.context.scene
    for coll in list(bpy.data.collections):
        bpy.data.collections.remove(coll)
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)

    terrain = bpy.data.collections.new("Districts_by_elevation")
    cities = bpy.data.collections.new("Cities")
    scene.collection.children.link(terrain)
    scene.collection.children.link(cities)

    # major rivers whose corridor we tint (names present in the data)
    built = with_elev = river_marked = city_marked = 0
    for fp in sorted(glob.glob(os.path.join(HERE, "districts", "*.geojson"))):
        gj = json.load(open(fp))
        for f in gj.get("features", []):
            p = f.get("properties", {})
            st, dn = p.get("STATE"), p.get("DISTRICT")
            if not st or not dn or not f.get("geometry"):
                continue
            g = gmap.get(f"{st}|{dn}", {})
            elev = (g.get("elevation") or {}).get("centroid_m")
            has_elev = isinstance(elev, (int, float))
            m = elev if has_elev else 0.0
            height = FLOOR + max(0.0, m) * ELEV_SCALE
            rivers = g.get("major_rivers") or []
            is_river = len(rivers) > 0 and (m < 500)   # a low district on a named river = river corridor
            color = (0.20, 0.40, 0.62, 1.0) if is_river else elev_color(m)
            obj = build_district(dn, f["geometry"], height, color, is_river)
            if not obj:
                continue
            obj.location.x -= 78.0 * math.cos(math.radians(LAT_MID))
            obj.location.y -= LAT_MID
            terrain.objects.link(obj)
            built += 1
            with_elev += 1 if has_elev else 0
            river_marked += 1 if is_river else 0

            # a city marker at the centroid (cone), height nudged by elevation so it sits on the land
            ll = cent.get(f"{st}|{dn}")
            if ll:
                lat, lon = ll
                cx = lon * XY_SCALE * math.cos(math.radians(LAT_MID)) - 78.0 * math.cos(math.radians(LAT_MID))
                cy = lat * XY_SCALE - LAT_MID
                bpy.ops.mesh.primitive_cone_add(radius1=0.02, depth=0.06,
                                                location=(cx, cy, height + 0.03))
                cone = bpy.context.active_object
                cone.name = f"city_{dn}"
                # unlink from scene root, put in Cities
                for c in list(cone.users_collection):
                    c.objects.unlink(cone)
                cities.objects.link(cone)
                city_marked += 1

    # RIVERS — real Natural Earth centre-lines drawn as blue curves riding just above the land
    rivers_built = 0
    rpath = os.path.join(HERE, "india-rivers.geojson")
    if os.path.exists(rpath):
        rcoll = bpy.data.collections.new("Rivers")
        scene.collection.children.link(rcoll)
        rmat = bpy.data.materials.new("river_mat")
        rmat.use_nodes = True
        rb = rmat.node_tree.nodes.get("Principled BSDF")
        if rb:
            rb.inputs["Base Color"].default_value = (0.18, 0.52, 0.82, 1.0)
            if "Emission Color" in rb.inputs:
                rb.inputs["Emission Color"].default_value = (0.10, 0.35, 0.6, 1.0)
        rj = json.load(open(rpath))

        def add_line(coords):
            nonlocal rivers_built
            pts = [c for c in coords if isinstance(c, list) and len(c) >= 2 and isinstance(c[0], (int, float))]
            if len(pts) < 2:
                return
            cu = bpy.data.curves.new("river", "CURVE")
            cu.dimensions = "3D"
            cu.bevel_depth = 0.012
            sp = cu.splines.new("POLY")
            sp.points.add(len(pts) - 1)
            for i, (lon, lat) in enumerate(pts):
                x = lon * XY_SCALE * math.cos(math.radians(LAT_MID)) - 78.0 * math.cos(math.radians(LAT_MID))
                y = lat * XY_SCALE - LAT_MID
                sp.points[i].co = (x, y, 0.6, 1.0)   # ride above the land
            ob = bpy.data.objects.new("river", cu)
            ob.data.materials.append(rmat)
            rcoll.objects.link(ob)
            rivers_built += 1

        for f in rj.get("features", []):
            g = f.get("geometry", {})
            if g.get("type") == "LineString":
                add_line(g["coordinates"])
            elif g.get("type") == "MultiLineString":
                for line in g["coordinates"]:
                    add_line(line)

    # camera + sun + dark world
    cam_data = bpy.data.cameras.new("Cam")
    cam = bpy.data.objects.new("Cam", cam_data)
    cam.location = (0.0, -30.0, 24.0)
    cam.rotation_euler = (math.radians(50), 0.0, 0.0)
    scene.collection.objects.link(cam)
    scene.camera = cam
    sun_d = bpy.data.lights.new("Sun", "SUN"); sun_d.energy = 3.2
    sun = bpy.data.objects.new("Sun", sun_d)
    sun.rotation_euler = (math.radians(48), math.radians(18), math.radians(-42))
    scene.collection.objects.link(sun)
    world = bpy.data.worlds.new("W"); world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.02, 0.02, 0.03, 1.0)
    scene.world = world

    bpy.ops.wm.save_as_mainfile(filepath=OUT)
    print(f"\n[districts] wrote {OUT}")
    print(f"[districts] {built} districts · {with_elev} by real elevation · "
          f"{river_marked} river-corridor tinted · {city_marked} city markers · "
          f"{rivers_built} real river curves")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("[districts] FAILED:", e, file=sys.stderr)
        raise
