/* dem.js — shared open-DEM helpers (Terrarium terrain-RGB decode + elevation ramp).
 *
 * One home for the elevation logic that was duplicated in app.js (2-D map tint) and
 * terrain-3d.html (3-D relief): the Terrarium pixel decode, the metres-above-sea
 * colour ramp, and the open tile-URL template. Both consumers load this as a plain
 * <script> and read window.DEM (app.js is a classic IIFE, so no ES-module churn).
 *
 * Source: AWS Terrain Tiles (Terrarium encoding), open SRTM/NASADEM. 30 m — not
 * LIDAR (no open nationwide LIDAR for India).
 */
(function (global) {
  'use strict';

  // Terrarium encoding: elevation(m) = R*256 + G + B/256 - 32768.
  function decode(r, g, b) {
    return r * 256 + g + b / 256 - 32768;
  }

  // Open Terrarium tile URL for z/x/y.
  function tileUrl(z, x, y) {
    return `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;
  }

  // Elevation colour ramp (metres → [r,g,b] 0-255): blue lowland → green → tan →
  // brown → white peaks. Single source of truth for both the 2-D tint and 3-D relief.
  const RAMP = [
    [-50, [40, 60, 95]], [0, [50, 90, 130]], [200, [70, 130, 95]], [600, [120, 150, 80]],
    [1200, [175, 160, 100]], [2500, [150, 115, 80]], [4000, [200, 195, 185]], [6000, [255, 255, 255]],
  ];

  // → [r,g,b] in 0-255 (for canvas / CSS).
  function rampRGB(m) {
    for (let i = 1; i < RAMP.length; i++) {
      if (m <= RAMP[i][0]) {
        const [m0, c0] = RAMP[i - 1], [m1, c1] = RAMP[i];
        const t = (m - m0) / (m1 - m0 || 1);
        return c0.map((c, k) => Math.round(c + (c1[k] - c) * t));
      }
    }
    return [255, 255, 255];
  }

  // → [r,g,b] in 0-1 (for three.js vertex colours).
  function rampUnit(m) {
    return rampRGB(m).map(v => v / 255);
  }

  global.DEM = { decode, tileUrl, RAMP, rampRGB, rampUnit };
})(typeof window !== 'undefined' ? window : this);
