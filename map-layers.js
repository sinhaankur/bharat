/* map-layers.js — tile-layer definitions for the map (basemaps + overlays).
 *
 * Factors the static Leaflet tile-layer construction out of app.js's buildMap, so
 * the layer catalogue (URLs, attributions, zoom caps) lives in one place. app.js
 * keeps the wiring (which layer is active, the layers panel, weather refresh) since
 * that's coupled to app state. Loaded as a plain <script>; exposes window.MapLayers.
 *
 * All sources are free/attribution and redistributable. Google/licensed imagery is
 * NOT used; Sentinel-2 is the open near-real-time equivalent.
 */
(function (global) {
  'use strict';

  // How deep the map can zoom. Past a layer's maxNativeZoom, Leaflet UPSCALES the
  // last sharp tile instead of showing blanks — "as deep as allowed" without
  // pretending to resolution that isn't there (see deep-zoom research 2026-07-11:
  // no OPEN sub-metre basemap exists for India, so beyond native = honest upscale).
  const MAX_ZOOM = 21;

  // Switchable basemaps (name → Leaflet tileLayer). 'Dark map' is the default.
  // maxZoom = MAX_ZOOM everywhere (lets you keep zooming); maxNativeZoom = the
  // source's REAL ceiling (probed 2026-07-11 over India): CARTO 20, Esri 19,
  // OpenTopo 17, Sentinel-2 16. Deep-zoom note fires when zoom > native.
  function basemaps(L) {
    return {
      'Light map': L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd', attribution: '&copy; OSM, &copy; CARTO', maxZoom: MAX_ZOOM, maxNativeZoom: 20,
      }),
      'Dark map': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd', attribution: '&copy; OSM, &copy; CARTO', maxZoom: MAX_ZOOM, maxNativeZoom: 20,
      }),
      'Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics', maxZoom: MAX_ZOOM, maxNativeZoom: 19,
      }),
      'Terrain': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        subdomains: 'abc', attribution: 'Map data: &copy; OpenTopoMap (CC-BY-SA), SRTM', maxZoom: MAX_ZOOM, maxNativeZoom: 17,
      }),
      // Sharper topographic base — stays crisp to z19 (roads, contours, water, labels),
      // where OpenTopoMap upscales past z17. Better when you zoom right into a town.
      'Terrain HD': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Topo &copy; Esri, USGS, NGA, NASA, CGIAR, GEBCO', maxZoom: MAX_ZOOM, maxNativeZoom: 19,
      }),
      'Recent satellite (Sentinel-2)': L.tileLayer('https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg', {
        attribution: 'Sentinel-2 cloudless &copy; EOX / ESA Copernicus (open, ~10 m)', maxZoom: MAX_ZOOM, maxNativeZoom: 16,
      }),
    };
  }

  // OPTIONAL "Satellite HD" — real 50 cm imagery to z21+ over India, but Mapbox is
  // COMMERCIAL: it needs the USER's own access token. We ship NO key. Returns null
  // unless a token is supplied (via ?mapbox_token=, localStorage, or window). The
  // token stays on the user's device; nothing is committed to the repo.
  function mapboxToken() {
    try {
      const qs = new URLSearchParams(location.search).get('mapbox_token');
      if (qs) { localStorage.setItem('mapbox_token', qs); return qs; }
      return localStorage.getItem('mapbox_token') || (global.MAPBOX_TOKEN || '') || '';
    } catch (e) { return global.MAPBOX_TOKEN || ''; }
  }
  function satelliteHD(L, token) {
    token = token || mapboxToken();
    if (!token) return null;   // no key → layer simply isn't offered
    return L.tileLayer(
      `https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.jpg90?access_token=${token}`, {
        attribution: 'Imagery &copy; Mapbox / Maxar (licensed — user-supplied token; ~50 cm in India)',
        maxZoom: MAX_ZOOM, maxNativeZoom: 21, tileSize: 512, zoomOffset: -1,
      });
  }

  // Panes: index.html's buildMap creates terrainPane (350, under the data colours),
  // weatherPane (450, over them) and labelsPane (590, under marker pins) so the
  // stack is deterministic. These layers name their pane here.

  // Place-labels overlay (keeps names legible on imagery basemaps).
  function labels(L) {
    return L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd', attribution: '', maxZoom: MAX_ZOOM, maxNativeZoom: 20, opacity: 0.9, pane: 'labelsPane',
    });
  }

  // Hillshade relief (open 30 m DEM — SRTM/CartoDEM class; NOT LIDAR).
  function hillshade(L) {
    return L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Hillshade &copy; Esri, USGS, NASA SRTM (open 30 m DEM)', maxZoom: MAX_ZOOM, maxNativeZoom: 16, opacity: 0.55, pane: 'terrainPane',
    });
  }

  // Live-weather tile layers (RainViewer). URLs are empty until setupWeatherLayer
  // points them at the latest timestamped frame (free, keyless, ~10-min updates).
  function weather(L) {
    return {
      rain: L.tileLayer('', { opacity: 0.6, maxZoom: MAX_ZOOM, attribution: 'Rain radar &copy; RainViewer (live)', pane: 'weatherPane' }),
      clouds: L.tileLayer('', { opacity: 0.5, maxZoom: MAX_ZOOM, attribution: 'Clouds (infrared) &copy; RainViewer', pane: 'weatherPane' }),
    };
  }

  global.MapLayers = { basemaps, labels, hillshade, weather, satelliteHD, mapboxToken, MAX_ZOOM };
})(typeof window !== 'undefined' ? window : this);
