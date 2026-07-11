/* map-ui.js — small on-map UX helpers: the deep-zoom resolution note + a live
 * zoom-level / approximate-scale readout. Factored out of app.js (lean principle):
 * app.js owns map state, this owns two self-contained DOM widgets that only need
 * the map + a "which basemap is active" lookup.
 *
 * Deep zoom over India is an HONEST UPSCALE past ~z19-20 (no open sub-metre basemap
 * exists — see the deep-zoom research). These widgets make that legible: they tell
 * the user their zoom level, the rough ground scale, and when the image is upscaled
 * beyond the source's real resolution.
 *
 * Loaded as a plain <script> after Leaflet; exposes window.MapUI.setup(map, opts).
 *   opts.getActiveBasemap() → the currently-shown L.tileLayer (for its maxNativeZoom)
 *   opts.hostId             → id of the map container (default 'india-map-wrap')
 */
(function (global) {
  'use strict';

  // Approximate metres-per-pixel at the equator for a given zoom (Web-Mercator).
  // Good enough for a "you're looking at ~N m across" hint; not a survey scale.
  function metresPerPixel(zoom, lat) {
    const latRad = (lat || 0) * Math.PI / 180;
    return 156543.03392 * Math.cos(latRad) / Math.pow(2, zoom);
  }

  // Human-friendly scale bar length: pick a round distance ~120 px wide.
  function niceScale(mPerPx) {
    const target = mPerPx * 120;                 // metres across ~120 px
    const pow = Math.pow(10, Math.floor(Math.log10(target)));
    const candidates = [1, 2, 5, 10].map(m => m * pow);
    const dist = candidates.reduce((a, b) => (Math.abs(b - target) < Math.abs(a - target) ? b : a));
    const px = dist / mPerPx;
    const label = dist >= 1000 ? `${(dist / 1000).toLocaleString('en-IN')} km` : `${Math.round(dist)} m`;
    return { px: Math.round(px), label };
  }

  function setup(map, opts) {
    opts = opts || {};
    const hostId = opts.hostId || 'india-map-wrap';
    const host = document.getElementById(hostId);
    if (!map || !host) return null;
    const getActive = typeof opts.getActiveBasemap === 'function' ? opts.getActiveBasemap : () => null;

    // --- Deep-zoom note (upscaled past the source's real resolution) ---
    const note = document.createElement('div');
    note.id = 'deep-zoom-note';
    note.className = 'deep-zoom-note';
    note.style.display = 'none';
    host.appendChild(note);

    // --- Zoom + scale readout (bottom-centre, above the note) ---
    const readout = document.createElement('div');
    readout.id = 'zoom-readout';
    readout.className = 'zoom-readout';
    readout.innerHTML =
      '<span class="zr-scale"><i class="zr-bar"></i><span class="zr-scale-lbl"></span></span>' +
      '<span class="zr-z"></span>';
    host.appendChild(readout);
    const barEl = readout.querySelector('.zr-bar');
    const scaleLblEl = readout.querySelector('.zr-scale-lbl');
    const zEl = readout.querySelector('.zr-z');

    function refresh() {
      const z = map.getZoom();
      const active = getActive();
      const native = active && active.options ? (active.options.maxNativeZoom ?? active.options.maxZoom ?? z) : z;
      const past = z > native;

      // scale bar
      const mpp = metresPerPixel(z, map.getCenter().lat);
      const sc = niceScale(mpp);
      barEl.style.width = sc.px + 'px';
      scaleLblEl.textContent = sc.label;
      zEl.textContent = `z${z.toFixed(z % 1 ? 1 : 0)}`;
      zEl.classList.toggle('zr-z--past', past);

      // deep-zoom note
      note.style.display = past ? 'block' : 'none';
      if (past) {
        const gained = z - native;
        note.innerHTML =
          `ⓘ zoomed ${gained >= 1 ? gained.toFixed(0) + ' level' + (gained >= 2 ? 's' : '') : ''} past ` +
          `max open detail — image upscaled (no open sub-metre imagery for India; finer needs LIDAR/licensed)`;
      }
    }

    map.on('zoom zoomend move moveend', refresh);
    refresh();
    return { refresh, note, readout };
  }

  global.MapUI = { setup, metresPerPixel, niceScale };
})(typeof window !== 'undefined' ? window : this);
