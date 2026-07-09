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

  // Switchable basemaps (name → Leaflet tileLayer). 'Dark map' is the default.
  function basemaps(L) {
    return {
      'Dark map': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd', attribution: '&copy; OSM, &copy; CARTO', maxZoom: 20,
      }),
      'Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics', maxZoom: 19,
      }),
      'Terrain': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        subdomains: 'abc', attribution: 'Map data: &copy; OpenTopoMap (CC-BY-SA), SRTM', maxZoom: 17,
      }),
      'Recent satellite (Sentinel-2)': L.tileLayer('https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg', {
        attribution: 'Sentinel-2 cloudless &copy; EOX / ESA Copernicus (open)', maxZoom: 16,
      }),
    };
  }

  // Place-labels overlay (keeps names legible on imagery basemaps).
  function labels(L) {
    return L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd', attribution: '', maxZoom: 20, opacity: 0.9,
    });
  }

  // Hillshade relief (open 30 m DEM — SRTM/CartoDEM class; NOT LIDAR).
  function hillshade(L) {
    return L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Hillshade &copy; Esri, USGS, NASA SRTM (open 30 m DEM)', maxZoom: 16, opacity: 0.55,
    });
  }

  // Live-weather tile layers (RainViewer). URLs are empty until setupWeatherLayer
  // points them at the latest timestamped frame (free, keyless, ~10-min updates).
  function weather(L) {
    return {
      rain: L.tileLayer('', { opacity: 0.6, maxZoom: 19, attribution: 'Rain radar &copy; RainViewer (live)', pane: 'overlayPane' }),
      clouds: L.tileLayer('', { opacity: 0.5, maxZoom: 19, attribution: 'Clouds (infrared) &copy; RainViewer', pane: 'overlayPane' }),
    };
  }

  global.MapLayers = { basemaps, labels, hillshade, weather };
})(typeof window !== 'undefined' ? window : this);
