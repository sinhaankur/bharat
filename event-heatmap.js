/* event-heatmap.js — a dependency-free news/event heatmap for Leaflet.
 *
 * Rather than pull in leaflet.heat (a CDN dependency), this is a tiny custom
 * L.Layer that paints radial gradients onto one full-map <canvas>, weighted by each
 * point's `weight` (from news-bubbles.json — events*1.5 + recency-decayed news). It
 * redraws on move/zoom. Honest: only places with REAL activity contribute — the heat
 * is where news/events actually cluster, not a fabricated field.
 *
 * Loaded as a plain <script> after Leaflet; exposes window.EventHeatmap.
 *   EventHeatmap.create(points, opts) → an L.Layer you addTo(map)/removeFrom(map)
 *     points — [{lat, lon, weight}]
 *     opts.radius (px @ the reference zoom), opts.max (weight→1.0 cap)
 */
(function (global) {
  'use strict';
  var L = global.L;
  if (!L) return;

  // Blue → cyan → green → amber → red ramp (like a classic heatmap).
  var GRADIENT = [
    [0.0, [30, 60, 170, 0]],
    [0.25, [40, 120, 200, 140]],
    [0.45, [40, 190, 160, 180]],
    [0.65, [230, 200, 60, 210]],
    [0.85, [240, 130, 40, 230]],
    [1.0, [220, 40, 40, 245]],
  ];

  function rampLUT() {
    // Precompute a 256-entry RGBA lookup table from the gradient stops.
    var lut = new Uint8ClampedArray(256 * 4);
    for (var i = 0; i < 256; i++) {
      var t = i / 255, a = GRADIENT[0], b = GRADIENT[GRADIENT.length - 1];
      for (var s = 0; s < GRADIENT.length - 1; s++) {
        if (t >= GRADIENT[s][0] && t <= GRADIENT[s + 1][0]) { a = GRADIENT[s]; b = GRADIENT[s + 1]; break; }
      }
      var span = (b[0] - a[0]) || 1, f = (t - a[0]) / span;
      for (var c = 0; c < 4; c++) lut[i * 4 + c] = a[1][c] + (b[1][c] - a[1][c]) * f;
    }
    return lut;
  }
  var LUT = rampLUT();

  var HeatLayer = L.Layer.extend({
    initialize: function (points, opts) {
      this._points = points || [];
      this._opts = Object.assign({ radius: 34, max: null, refZoom: 6, opacity: 0.72 }, opts || {});
    },
    onAdd: function (map) {
      this._map = map;
      var c = this._canvas = L.DomUtil.create('canvas', 'event-heatmap-canvas');
      c.style.position = 'absolute'; c.style.pointerEvents = 'none'; c.style.opacity = this._opts.opacity;
      map.getPanes().overlayPane.appendChild(c);
      map.on('moveend zoomend resize', this._redraw, this);
      this._reset(); this._redraw();
    },
    onRemove: function (map) {
      map.off('moveend zoomend resize', this._redraw, this);
      if (this._canvas && this._canvas.parentNode) this._canvas.parentNode.removeChild(this._canvas);
      this._canvas = null;
    },
    setPoints: function (points) { this._points = points || []; this._redraw(); },
    _reset: function () {
      var size = this._map.getSize();
      this._canvas.width = size.x; this._canvas.height = size.y;
      L.DomUtil.setPosition(this._canvas, this._map.containerPointToLayerPoint([0, 0]));
    },
    _redraw: function () {
      if (!this._map || !this._canvas) return;
      this._reset();
      var ctx = this._canvas.getContext('2d');
      var W = this._canvas.width, H = this._canvas.height;
      ctx.clearRect(0, 0, W, H);
      var pts = this._points; if (!pts.length) return;

      // radius scales with zoom so clusters merge sensibly as you zoom out/in.
      var zoom = this._map.getZoom();
      var r = Math.max(12, this._opts.radius * Math.pow(1.35, zoom - this._opts.refZoom));
      r = Math.min(r, 140);
      var maxW = this._opts.max || Math.max.apply(null, pts.map(function (p) { return p.weight || 1; })) || 1;

      // 1) accumulate greyscale intensity (alpha) with additive radial gradients.
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var ll = this._map.latLngToContainerPoint([p.lat, p.lon]);
        if (ll.x < -r || ll.x > W + r || ll.y < -r || ll.y > H + r) continue;
        var intensity = Math.min(1, (p.weight || 1) / maxW);
        var grd = ctx.createRadialGradient(ll.x, ll.y, 0, ll.x, ll.y, r);
        grd.addColorStop(0, 'rgba(0,0,0,' + (0.28 + 0.6 * intensity) + ')');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(ll.x, ll.y, r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      // 2) colourise by the accumulated alpha via the ramp LUT.
      var img = ctx.getImageData(0, 0, W, H), d = img.data;
      for (var j = 0; j < d.length; j += 4) {
        var a = d[j + 3];
        if (!a) continue;
        var idx = a * 4;
        d[j] = LUT[idx]; d[j + 1] = LUT[idx + 1]; d[j + 2] = LUT[idx + 2];
        d[j + 3] = LUT[idx + 3];
      }
      ctx.putImageData(img, 0, 0);
    },
  });

  global.EventHeatmap = { create: function (points, opts) { return new HeatLayer(points, opts); } };
})(typeof window !== 'undefined' ? window : this);
