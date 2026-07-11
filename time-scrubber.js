/* time-scrubber.js — "change over the years" slider for the map.
 *
 * The geography dimension carries documented water-body / flood timelines (East
 * Kolkata Wetlands 1991→2021, Pallikaranai marsh 1965→2002, etc.) as year-tagged
 * points. This module renders ONE slider spanning every timeline's year range and,
 * as the user scrubs, reports each hotspot's value AT (or last-known BEFORE) the
 * chosen year — so you watch the wetlands shrink as you drag.
 *
 * Lean-principle module (like map-layers.js / map-ui.js): app.js owns map state,
 * this owns the scrubber DOM + the year math. Loaded as a plain <script>; exposes
 * window.TimeScrubber.
 *
 *   TimeScrubber.build(ledger, { hostId, onYear })  → { setYear, destroy, years }
 *     ledger  — the district-ledger object (states → districts → dimensions.geography.timeline)
 *     onYear(year, snapshots) — called on every scrub; snapshots = per-hotspot
 *                               { state, district, subject, at, first, last, pct }
 */
(function (global) {
  'use strict';

  // Collect every timeline series into a flat list of hotspots with sorted points.
  function collectSeries(ledger) {
    const out = [];
    const states = (ledger && ledger.states) || {};
    for (const [sn, s] of Object.entries(states)) {
      for (const [dn, dist] of Object.entries(s.districts || {})) {
        const tl = dist?.dimensions?.geography?.timeline;
        if (!tl || !Array.isArray(tl.points) || !tl.points.length) continue;
        const pts = tl.points
          .filter(p => typeof p.year === 'number' && p.value != null && p.value !== true)
          .sort((a, b) => a.year - b.year);
        if (pts.length < 1) continue;
        out.push({ state: sn, district: dn, subject: tl.subject || dn, range_note: tl.range_note || '', points: pts });
      }
    }
    return out;
  }

  // Value at-or-before `year` for one series (step function — last known value).
  function valueAt(series, year) {
    let v = null;
    for (const p of series.points) { if (p.year <= year) v = p; else break; }
    return v;   // {year, value, metric, ...} or null if before the first point
  }

  function snapshot(series, year) {
    const at = valueAt(series, year);
    const first = series.points[0];
    const last = series.points[series.points.length - 1];
    const pct = (at && first && first.value) ? ((at.value - first.value) / first.value) * 100 : null;
    return { state: series.state, district: series.district, subject: series.subject,
      metric: (at || last).metric, at, first, last, pct };
  }

  function build(ledger, opts) {
    opts = opts || {};
    const host = document.getElementById(opts.hostId || 'india-map-wrap');
    if (!host) return null;
    const series = collectSeries(ledger);
    if (!series.length) return null;

    // Year range across ALL series (usually ~1911..2026, but scrub focuses recent).
    let minY = Infinity, maxY = -Infinity;
    for (const s of series) { for (const p of s.points) { if (p.year < minY) minY = p.year; if (p.year > maxY) maxY = p.year; } }
    // Start the slider at a readable recent window; keep full range reachable.
    let year = maxY;

    const el = document.createElement('div');
    el.id = 'time-scrubber';
    el.className = 'time-scrubber collapsed';
    el.innerHTML =
      `<button class="ts-toggle" title="Watch water bodies / floodplains change over the years">🕑 Time</button>` +
      `<div class="ts-body">` +
        `<div class="ts-head"><span class="ts-title">Change over the years</span>` +
          `<span class="ts-year" id="ts-year">${maxY}</span>` +
          `<button class="ts-play" id="ts-play" title="Play through the years">▶</button>` +
          `<button class="ts-close" id="ts-close" title="Hide">✕</button></div>` +
        `<input type="range" id="ts-range" min="${minY}" max="${maxY}" step="1" value="${maxY}" />` +
        `<div class="ts-caption" id="ts-caption"></div>` +
      `</div>`;
    host.appendChild(el);

    const range = el.querySelector('#ts-range');
    const yearEl = el.querySelector('#ts-year');
    const capEl = el.querySelector('#ts-caption');
    const playBtn = el.querySelector('#ts-play');
    let playing = null;

    function emit() {
      const snaps = series.map(s => snapshot(s, year)).filter(s => s.at);
      yearEl.textContent = year;
      // Caption: the biggest documented change visible at this year.
      const withPct = snaps.filter(s => s.pct != null).sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
      if (withPct.length) {
        const t = withPct[0];
        const unit = (t.metric || '').replace(/_/g, ' ').replace(/ km2/, ' km²').replace(/ ha$/, ' ha');
        capEl.innerHTML = `<b>${t.district}</b>: ${t.subject.split(' — ')[0]} — ` +
          `${t.first.value}→${t.at.value} ${unit} ` +
          `<span class="ts-delta ${t.pct <= 0 ? 'down' : 'up'}">${t.pct > 0 ? '+' : ''}${t.pct.toFixed(0)}%</span> ` +
          `<span class="ts-since">since ${t.first.year}</span>`;
      } else {
        capEl.textContent = `before the earliest documented point (${minY})`;
      }
      if (typeof opts.onYear === 'function') opts.onYear(year, snaps);
    }

    function setYear(y) { year = Math.max(minY, Math.min(maxY, y | 0)); range.value = year; emit(); }

    range.addEventListener('input', () => setYear(+range.value));
    el.querySelector('.ts-toggle').addEventListener('click', () => { el.classList.toggle('collapsed'); if (!el.classList.contains('collapsed')) emit(); });
    el.querySelector('#ts-close').addEventListener('click', () => el.classList.add('collapsed'));
    playBtn.addEventListener('click', () => {
      if (playing) { clearInterval(playing); playing = null; playBtn.textContent = '▶'; return; }
      playBtn.textContent = '⏸';
      if (year >= maxY) setYear(minY);
      playing = setInterval(() => {
        if (year >= maxY) { clearInterval(playing); playing = null; playBtn.textContent = '▶'; return; }
        setYear(year + 1);
      }, 420);
    });

    emit();
    return { setYear, destroy() { if (playing) clearInterval(playing); el.remove(); }, years: [minY, maxY], series };
  }

  global.TimeScrubber = { build, collectSeries, valueAt, snapshot };
})(typeof window !== 'undefined' ? window : this);
