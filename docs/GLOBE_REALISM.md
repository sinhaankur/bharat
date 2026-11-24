# Making the globe more real — roadmap & sources

A checklist for taking `india-3d.html` from a clean vector globe toward "as real as
you can get" — roads, rivers, ponds, buildings. Ordered by **effort vs. payoff**.

**The honest ceiling first:** a true *every-road-every-building* globe is Google Earth —
tens of GB of tiles streamed from a server farm. It is not a file you ship. Everything
below gets you most of the way with free/open data, and the last row names the one paid
path that reaches Google-Earth grade.

---

## The checklist

### ✅ Done (already on the globe)
- [x] Sphere globe + atmosphere halo + starfield
- [x] India states raised (revenue / GSDP / population)
- [x] Rivers — Natural Earth 10 m centre-lines (72 named)
- [x] World country outlines — Natural Earth 110 m (177)
- [x] Major cities (15 pins) + illegal-habitation pins (16 encroachment cases)
- [x] Rising sea-level water shell (today → +70 m, tied to district counts)

### 1. Real Earth textures — biggest realism jump, low effort ✅ DONE
- [x] Day texture (2k Blue-Marble-derived, Solar System Scope CC BY 4.0)
- [x] Night texture as EMISSIVE map — city lights glow on the dark side
- [x] Cloud layer — translucent shell, drifts slowly
- [ ] Higher-res 8k textures + a bump/normal map for terrain relief (future polish)
- Shipped in vendor/earth/ (~1.6 MB total). Attribution on the page + LICENSE.txt.

### 2. More open vector detail on the globe — medium effort
- [ ] Major roads — **Natural Earth 10 m roads** (highways only; light) as gold lines
- [ ] Lakes & reservoirs / big ponds — **Natural Earth 10 m lakes** + HydroLAKES for more
- [ ] Coastline + bathymetry tint from Natural Earth
- [ ] Railways — Natural Earth 10 m railroads
- Cost: each is a small clipped geojson like the rivers file. Still fast, still a globe.

### 3. Stream real slippy tiles (roads/ponds/buildings, zoom to street) — ✅ DONE
- [x] "Drop to street level" — zoom the globe in and a 🔻 prompt appears; click it and a real
      **OpenStreetMap** Leaflet map opens at exactly the point you were looking at (raycast to
      the sphere → lon/lat), with roads/labels/buildings. "↑ back to globe" returns you.
- [x] Reuses the self-hosted Leaflet + CARTO/OSM tiles. Tiles stream on demand.
- Shipped on india-3d.html. Not a *globe* at that zoom — a real street map, which is the point.

### 4. Google-Earth-grade photoreal 3D (buildings + terrain) — the paid path
- [ ] **CesiumJS + Google Photorealistic 3D Tiles** — actual 3D buildings/terrain globe
- [ ] Or **Cesium World Terrain + Bing/Sentinel imagery** (Cesium ion free tier)
- Cost: needs a Google Maps Platform API key (has a free monthly tier, then paid). This is
      the only row that is a *service*, not a file. Opt-in, user-supplied key — same
      posture as the existing "Satellite HD (your Mapbox key)" option, never shipped.

---

## Known sources (all verified / standard)

| Layer | Source | License | Notes |
|---|---|---|---|
| Day/night Earth texture | [NASA Blue Marble NG](https://visibleearth.nasa.gov/images/73580) · [Black Marble](https://www.earthdata.nasa.gov/data/projects/black-marble/data-access-tools) | Public domain (credit NASA/GSFC SVS) | 500 m/px; 8k or 21600×10800 tiled |
| CC-BY texture pack (3D-ready) | [Solar System Scope](https://www.solarsystemscope.com/textures/) | CC BY 4.0 | Blue-Marble-derived, sphere-ready |
| Country / river / road / lake vectors | [Natural Earth](https://www.naturalearthdata.com/) | Public domain | 10 m / 50 m / 110 m tiers |
| Lakes & ponds (detailed) | HydroLAKES / HydroSHEDS (WWF) | Free, attribution | ~1.4 M lakes globally |
| Roads/ponds/buildings (everything) | [OpenStreetMap](https://www.openstreetmap.org/) | ODbL (attribution + share-alike) | streamed tiles, not a file |
| Terrain (elevation) | AWS Terrain Tiles (SRTM/NASADEM) | Open | already used by terrain-3d.html |
| Photoreal 3D tiles | Google Photorealistic 3D Tiles (via CesiumJS) | **Paid** (free tier) | needs a Google API key |

**Rule that still holds:** open-or-a-gap. Free layers ship; anything paid/keyed is opt-in
with the user's own key (like the existing Mapbox HD option) and never committed.

---

*Recommendation:* do **row 1 (NASA textures)** first — it's the single biggest realism
jump for a few MB and no key. Then **row 2** (open roads/lakes) for detail on the globe.
Rows 3–4 are for "zoom to the actual street", which is a different mode, not the globe.
