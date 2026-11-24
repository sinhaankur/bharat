#!/usr/bin/env python3
"""
gen_kolkata_terrain_stl.py — watertight terrain solid for FluidX3D from the
open Kolkata DEM (/tmp/kolkata_dem.npy, see fetch_kolkata_dem.py).

Mesh units: 1 unit = 1 DEM pixel horizontally (~33 m after 2x downsample);
z = metres * VEXAG_MESH. That makes the TRUE vertical exaggeration
VEXAG_MESH * 33 — Kolkata's relief is only ~0-30 m over 14 km, so an
unexaggerated mesh would voxelize to a flat plate. The exaggeration factor is
printed and must be labelled wherever renders are published.

Writes: <FluidX3D>/stl/kolkata_terrain.stl (binary STL)
Run: python3 gen_kolkata_terrain_stl.py
"""
import struct

import numpy as np

DEM = "/tmp/kolkata_dem.npy"
OUT = "/Users/sinhaankur/Documents/GitHub/FluidX3D/stl/kolkata_terrain.stl"
DOWNSAMPLE = 2
VEXAG_MESH = 1.0      # mesh z units per metre of elevation
BASE_Z = -6.0         # bottom plate depth (mesh units) — keeps the solid watertight
CLIP_LO = 0.0         # metres; SRTM noise below sea level clipped to 0


def box_blur(a):
    p = np.pad(a, 1, mode="edge")
    return (p[:-2, :-2] + p[:-2, 1:-1] + p[:-2, 2:] +
            p[1:-1, :-2] + p[1:-1, 1:-1] + p[1:-1, 2:] +
            p[2:, :-2] + p[2:, 1:-1] + p[2:, 2:]) / 9.0


def main():
    elev = np.load(DEM)[::DOWNSAMPLE, ::DOWNSAMPLE].astype(np.float64)
    hi = float(np.percentile(elev, 99.5))  # kill isolated SRTM spikes
    elev = np.clip(elev, CLIP_LO, hi)
    for _ in range(3):  # SRTM building-noise at 33x v-exag reads as fake mountains; smooth it out
        elev = box_blur(elev)
    H, W = elev.shape
    print(f"grid {H}x{W}, elev clip 0..{hi:.1f} m, true v-exag ~{VEXAG_MESH*33:.0f}x")

    # vertex grid: x=east(cols), y=north(rows, flipped so +y=north), z=exaggerated elev
    xs = np.arange(W, dtype=np.float32)
    ys = np.arange(H, dtype=np.float32)[::-1]
    X, Y = np.meshgrid(xs, ys)
    Z = (elev * VEXAG_MESH).astype(np.float32)
    V = np.stack([X, Y, Z], axis=-1)  # (H, W, 3)

    tris = []

    def quads_to_tris(a, b, c, d):  # arrays of (N,3) corners, ccw
        tris.append(np.stack([a, b, c], axis=1))
        tris.append(np.stack([a, c, d], axis=1))

    # top surface
    a = V[:-1, :-1].reshape(-1, 3); b = V[:-1, 1:].reshape(-1, 3)
    c = V[1:, 1:].reshape(-1, 3);   d = V[1:, :-1].reshape(-1, 3)
    quads_to_tris(a, b, c, d)

    def skirt(edge):  # edge: (N,3) boundary vertices in order; wall down to BASE_Z
        lo = edge.copy(); lo[:, 2] = BASE_Z
        quads_to_tris(edge[:-1], lo[:-1], lo[1:], edge[1:])

    skirt(V[0, :, :]); skirt(V[-1, ::-1, :]); skirt(V[:, 0, :][::-1]); skirt(V[:, -1, :])

    # bottom plate
    b0 = np.array([[0, 0, BASE_Z]], dtype=np.float32)
    b1 = np.array([[W - 1.0, 0, BASE_Z]], dtype=np.float32)
    b2 = np.array([[W - 1.0, H - 1.0, BASE_Z]], dtype=np.float32)
    b3 = np.array([[0, H - 1.0, BASE_Z]], dtype=np.float32)
    quads_to_tris(b0, b3, b2, b1)

    T = np.concatenate(tris, axis=0).astype(np.float32)  # (N, 3, 3)
    n = np.cross(T[:, 1] - T[:, 0], T[:, 2] - T[:, 0])
    n /= np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-12)

    rec = np.zeros((len(T),), dtype=np.dtype([("n", "<3f4"), ("v", "<(3,3)f4"), ("attr", "<u2")]))
    rec["n"] = n.astype(np.float32); rec["v"] = T
    with open(OUT, "wb") as f:
        f.write(b"kolkata_terrain open-DEM (terrain-tiles) v-exag see gen script".ljust(80, b" "))
        f.write(struct.pack("<I", len(T)))
        f.write(rec.tobytes())
    zmax = float(Z.max())
    print(f"STL: {len(T)} tris -> {OUT}")
    print(f"mesh bbox: x 0..{W-1}, y 0..{H-1}, z {BASE_Z}..{zmax:.1f} (longest side {'y' if H>=W else 'x'} = {max(H,W)-1})")


if __name__ == "__main__":
    main()
