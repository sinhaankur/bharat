#!/usr/bin/env python3
"""
geo_utils.py — shared geometry helpers for the geo-processing scripts.

Consolidates the point-in-polygon / centroid / bbox / ring / RDP-simplify code that
was copy-pasted across build_subdistricts.py, link_subdistricts_to_districts.py and
add_district_elevation.py. One place to fix a bug, one place to reason about.

Pure Python, no dependencies. GeoJSON geometries are Polygon / MultiPolygon dicts.
"""


def rings_of(geom):
    """Yield each polygon's OUTER ring (list of [x, y]) for Polygon / MultiPolygon."""
    t, c = geom["type"], geom["coordinates"]
    if t == "Polygon":
        yield c[0]
    elif t == "MultiPolygon":
        for poly in c:
            yield poly[0]


def all_coords(geom):
    """Yield every [x, y] vertex across all rings (outer only)."""
    for ring in rings_of(geom):
        yield from ring


def bbox_of(geom):
    """(minx, miny, maxx, maxy) over the geometry's outer rings; zeros if empty."""
    xs, ys = [], []
    for x, y in all_coords(geom):
        xs.append(x); ys.append(y)
    return (min(xs), min(ys), max(xs), max(ys)) if xs else (0, 0, 0, 0)


def centroid(geom):
    """Vertex-average centroid (lon, lat) over outer rings; (None, None) if empty.

    A cheap representative point — good enough for point-in-polygon assignment and
    elevation sampling, which is all these scripts need.
    """
    xs = ys = n = 0
    for x, y in all_coords(geom):
        xs += x; ys += y; n += 1
    return (xs / n, ys / n) if n else (None, None)


def point_in_ring(x, y, ring):
    """Ray-casting point-in-polygon for a single ring."""
    inside = False
    n = len(ring)
    j = n - 1
    for i in range(n):
        xi, yi = ring[i]
        xj, yj = ring[j]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi + 1e-15) + xi):
            inside = not inside
        j = i
    return inside


def point_in_geom(x, y, geom):
    """True if (x, y) is inside any outer ring of the geometry."""
    return any(point_in_ring(x, y, ring) for ring in rings_of(geom))


def rdp(points, tol):
    """Ramer-Douglas-Peucker simplification, ITERATIVE (rings can have thousands of
    points; recursion would blow the stack). Returns the kept subset of `points`."""
    n = len(points)
    if n < 3:
        return points
    keep = [False] * n
    keep[0] = keep[n - 1] = True
    stack = [(0, n - 1)]
    while stack:
        a, b = stack.pop()
        if b <= a + 1:
            continue
        x0, y0 = points[a]
        x1, y1 = points[b]
        dx, dy = x1 - x0, y1 - y0
        denom = (dx * dx + dy * dy) ** 0.5 or 1e-15
        dmax, idx = 0.0, a
        for i in range(a + 1, b):
            px, py = points[i]
            d = abs(dy * px - dx * py + x1 * y0 - y1 * x0) / denom
            if d > dmax:
                dmax, idx = d, i
        if dmax > tol:
            keep[idx] = True
            stack.append((a, idx))
            stack.append((idx, b))
    return [points[i] for i in range(n) if keep[i]]
