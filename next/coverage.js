/* coverage.js — per-district SOURCE-COVERAGE meter.
 *
 * The project's iron rule is sourced-or-gap: a figure is cited or it's an explicit
 * gap, never fabricated. This module makes that HONEST by making it VISIBLE — it
 * scores how much of a district is actually pinned to sources vs. still a gap, as a
 * transparent count of components (NOT a quality/impact judgement).
 *
 * It counts what is POSITIVELY sourced (a deep ledger, real elevation, pinned
 * geography sub-layers, a filled official roster, location news/events). It does NOT
 * penalise by _gaps length — well-covered districts track MORE explicit gaps, so a raw
 * gap count would perversely rank the best-sourced districts lowest.
 *
 * Loaded as a plain <script>; exposes window.Coverage.
 *   Coverage.score(dist, ctx) → { pct, level, points, components:[{key,label,got,max,note}] }
 *     dist — a district object from district-ledger.json
 *     ctx  — optional { newsCount } to fold in location news (from the feed)
 */
(function (global) {
  'use strict';

  // Component weights (max points each). Deliberately simple + inspectable.
  const COMPONENTS = [
    { key: 'ledger', label: 'Money-flow ledger', max: 3 },
    { key: 'geography', label: 'Geography sub-layers', max: 3 },
    { key: 'elevation', label: 'Elevation (SRTM)', max: 1 },
    { key: 'roster', label: 'Officials roster', max: 2 },
    { key: 'news', label: 'Location news / events', max: 2 },
  ];
  const MAX_POINTS = COMPONENTS.reduce((s, c) => s + c.max, 0);   // 11

  function score(dist, ctx) {
    dist = dist || {};
    ctx = ctx || {};
    const g = (dist.dimensions && dist.dimensions.geography) || {};

    // Ledger depth (0-3): baseline skeleton = 0; real rows scale up.
    const rows = Array.isArray(dist.ledger) ? dist.ledger.length : 0;
    const ledgerPts = dist.baseline && !rows ? 0 : Math.min(3, rows);

    // Geography pinned sub-layers (0-3): count the DOCUMENTED deep layers.
    let geoPinned = 0;
    if (g.paleochannel && g.paleochannel.documented) geoPinned++;
    if (g.unsafe_zone && g.unsafe_zone.documented) geoPinned++;
    if (g.monsoon_inundation && g.monsoon_inundation.documented) geoPinned++;
    if (g.encroachment_zone && g.encroachment_zone.documented) geoPinned++;
    if (g.encroachment && g.encroachment.cases && g.encroachment.cases.length) geoPinned++;
    if (g.timeline && g.timeline.points && g.timeline.points.length) geoPinned++;
    const geoPts = Math.min(3, geoPinned);

    // Elevation (0-1): real per-district SRTM centroid present.
    const elevPts = (g.elevation && typeof g.elevation.centroid_m === 'number') ? 1 : 0;

    // Officials roster (0-2): how many named officials.
    const named = Object.values(dist.roster || {}).filter(o => o && o.name).length;
    const rosterPts = Math.min(2, named ? (named >= 3 ? 2 : 1) : 0);

    // Location news / events (0-2): from ctx.newsCount + any pinned fiscal activity.
    const nc = ctx.newsCount || 0;
    const newsPts = Math.min(2, (nc >= 3 ? 2 : nc >= 1 ? 1 : 0));

    const components = [
      { key: 'ledger', label: 'Money-flow ledger', got: ledgerPts, max: 3,
        note: ledgerPts ? `${rows} ledger row${rows === 1 ? '' : 's'}` : 'baseline skeleton (no deep ledger yet)' },
      { key: 'geography', label: 'Geography sub-layers', got: geoPts, max: 3,
        note: geoPinned ? `${geoPinned} pinned (CRZ/flood/palaeochannel/…)` : 'base layer only; deep sub-layers a gap' },
      { key: 'elevation', label: 'Elevation (SRTM)', got: elevPts, max: 1,
        note: elevPts ? 'real centroid elevation' : 'elevation gap' },
      { key: 'roster', label: 'Officials roster', got: rosterPts, max: 2,
        note: named ? `${named} named` : 'roster gap (ECI/portal)' },
      { key: 'news', label: 'Location news / events', got: newsPts, max: 2,
        note: nc ? `${nc} news item${nc === 1 ? '' : 's'}` : 'no pinned news yet' },
    ];

    const points = components.reduce((s, c) => s + c.got, 0);
    const pct = Math.round((points / MAX_POINTS) * 100);
    const level = pct >= 60 ? 'deep' : pct >= 30 ? 'partial' : 'baseline';
    return { pct, level, points, max: MAX_POINTS, components };
  }

  // Colour for a coverage pct — cool grey (thin) → teal → green (deep). This is a
  // DATA-DENSITY scale, distinct from the risk ramp (which is warm/red).
  function color(pct) {
    if (pct >= 60) return 'oklch(0.72 0.15 155)';   // green — deep
    if (pct >= 30) return 'oklch(0.70 0.12 200)';   // teal — partial
    if (pct >= 12) return 'oklch(0.55 0.06 230)';   // slate-blue — thin
    return 'oklch(0.34 0.02 250)';                  // grey — baseline
  }

  global.Coverage = { score, color, COMPONENTS, MAX_POINTS };
})(typeof window !== 'undefined' ? window : this);
