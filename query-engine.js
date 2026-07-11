/* query-engine.js — client-side query/filter engine over all 594 districts.
 *
 * No backend: it flattens the district-ledger into one row per district with a small
 * set of boolean/numeric FACETS (legal zone, flood, CRZ, unsafe, palaeochannel,
 * encroachment, monsoon, low-elevation, high-rain, vulnerability count, fund-freeze
 * flag, grant dependence, population). The UI then AND/ORs chosen facets to answer
 * cross-cutting questions like "CRZ AND flood-chronic AND fund-freeze".
 *
 * Sourced-or-gap honesty carries through: a facet is TRUE only where the source is
 * pinned; false/absent can mean "not flagged" OR "gap" — never asserted as safe.
 *
 * Loaded as a plain <script>; exposes window.QueryEngine.
 *   QE.build(ledger) → { rows, facets, run(activeKeys, mode) }
 *     rows        — [{state, district, ...facet booleans/numbers}]
 *     facets      — ordered [{key, label, group, test(row), describe}]
 *     run(keys, mode='AND') → filtered rows (mode 'AND' | 'OR')
 */
(function (global) {
  'use strict';

  // Fund-freeze / dysfunction flag — mirrors app.js districtMoneyHeadline so the
  // engine and the map agree on what "flagged" means.
  function ledgerFlagged(dist) {
    const rows = (dist.ledger && Array.isArray(dist.ledger)) ? dist.ledger : [];
    const rowFlag = rows.some(r => {
      const w = r.what_happened || {};
      return w.audit_flag === 'fund_release_frozen' || w.lapsed === true ||
        w.audit_flag === 'zero_completion' || (typeof r.money_in_cr === 'number' && r.money_in_cr === 0);
    });
    const noteFlag = (dist.system_notes || []).some(n => /freeze|frozen|withh/i.test((n.kind || '') + ' ' + (n.note || '')));
    return rowFlag || noteFlag;
  }

  function headlineMoney(dist) {
    const vals = ((dist.ledger && Array.isArray(dist.ledger)) ? dist.ledger : [])
      .map(r => r.money_in_cr).filter(v => typeof v === 'number');
    return vals.length ? Math.max(...vals) : null;
  }

  // Vulnerability signal count — reuse window.Vuln if present, else compute inline.
  function vulnCount(g) {
    if (global.Vuln && typeof global.Vuln.signals === 'function') return global.Vuln.signals(g).count;
    let n = 0;
    if (g.flood_level === 'district-chronic') n++;
    const e = g.elevation && g.elevation.centroid_m;
    if (typeof e === 'number' && e < 100) n++;
    if (/high/.test((g.rainfall && g.rainfall.band) || '')) n++;
    if (g.encroachment && g.encroachment.cases && g.encroachment.cases.length) n++;
    if (g.paleochannel && g.paleochannel.documented) n++;
    if (g.unsafe_zone && g.unsafe_zone.documented) n++;
    if (g.monsoon_inundation && g.monsoon_inundation.documented) n++;
    if (g.encroachment_zone && g.encroachment_zone.documented) n++;
    return n;
  }

  function build(ledger, opts) {
    opts = opts || {};
    const newsCounts = opts.newsCounts || {};   // "State|District" → count (optional)
    const rows = [];
    for (const [sn, s] of Object.entries((ledger && ledger.states) || {})) {
      for (const [dn, dist] of Object.entries(s.districts || {})) {
        const g = (dist.dimensions && dist.dimensions.geography) || {};
        const elev = g.elevation && typeof g.elevation.centroid_m === 'number' ? g.elevation.centroid_m : null;
        const covPct = (global.Coverage && typeof global.Coverage.score === 'function')
          ? global.Coverage.score(dist, { newsCount: newsCounts[sn + '|' + dn] || 0 }).pct : 0;
        rows.push({
          state: sn, district: dn,
          crz: !!(g.crz && g.crz.applies) || !!g.on_coast,
          flood_chronic: g.flood_level === 'district-chronic',
          flood_state: g.flood_level === 'state-flood-prone',
          unsafe: !!(g.unsafe_zone && g.unsafe_zone.documented),
          paleo: !!(g.paleochannel && g.paleochannel.documented),
          encroach: !!(g.encroachment && g.encroachment.cases && g.encroachment.cases.length),
          enc_zone: !!(g.encroachment_zone && g.encroachment_zone.documented),
          monsoon: !!(g.monsoon_inundation && g.monsoon_inundation.documented),
          low_elev: elev != null && elev < 100,
          high_rain: /high/.test((g.rainfall && g.rainfall.band) || ''),
          vuln: vulnCount(g),
          flagged: ledgerFlagged(dist),
          money: headlineMoney(dist),
          has_ledger: !!(dist.ledger && dist.ledger.length),
          cov_pct: covPct,
          elev,
        });
      }
    }

    // Facet catalogue — key, human label, group, and a predicate.
    const facets = [
      { key: 'crz', group: 'Legal / zoning', label: 'Coastal Regulation Zone (CRZ)', test: r => r.crz,
        describe: 'Touches the sea → CRZ 2019 caps near-shore construction' },
      { key: 'unsafe', group: 'Legal / zoning', label: 'Declared unsafe / no-development', test: r => r.unsafe,
        describe: 'An authority declared it unsafe / no-development' },
      { key: 'enc_zone', group: 'Legal / zoning', label: 'Delineated encroachment zone', test: r => r.enc_zone,
        describe: 'Inside a published floodplain / FTL / buffer line' },
      { key: 'flood_chronic', group: 'Flood & water', label: 'Flood-chronic (CWC/NDMA)', test: r => r.flood_chronic,
        describe: 'Repeatedly flooded per CWC/NDMA/Bhuvan' },
      { key: 'monsoon', group: 'Flood & water', label: 'Monsoon seasonal inundation', test: r => r.monsoon,
        describe: 'Floods specifically in the monsoon (Bhuvan/IMD)' },
      { key: 'paleo', group: 'Flood & water', label: "On a river's old bed (palaeochannel)", test: r => r.paleo,
        describe: 'Built over a river\'s natural historic course' },
      { key: 'encroach', group: 'Flood & water', label: 'Documented encroachment case', test: r => r.encroach,
        describe: 'A pinned NGT/court/CAG encroachment case' },
      { key: 'low_elev', group: 'Terrain', label: 'Low-lying (<100 m)', test: r => r.low_elev,
        describe: 'SRTM centroid elevation under 100 m' },
      { key: 'high_rain', group: 'Terrain', label: 'High rainfall band (IMD)', test: r => r.high_rain,
        describe: 'IMD climate band is high / very-high' },
      { key: 'vuln3', group: 'Risk stack', label: '3+ risk signals stack', test: r => r.vuln >= 3,
        describe: 'Three or more sourced risk signals overlap' },
      { key: 'flagged', group: 'Money', label: '⚠ Fund freeze / audit flag', test: r => r.flagged,
        describe: 'A frozen/lapsed/zero-completion row or freeze note in the ledger' },
      { key: 'has_ledger', group: 'Money', label: 'Has a money-flow ledger', test: r => r.has_ledger,
        describe: 'A deep-dive fiscal ledger is pinned for this district' },
      { key: 'cov_deep', group: 'Source coverage', label: 'Well-sourced (deep/partial)', test: r => r.cov_pct >= 30,
        describe: 'At least 30% of this district is pinned to sources (not a baseline skeleton)' },
      { key: 'cov_thin', group: 'Source coverage', label: 'Thin / baseline (a gap-heavy)', test: r => r.cov_pct < 30,
        describe: 'Under 30% sourced — mostly structure-only, figures still a gap' },
    ];
    const facetByKey = Object.fromEntries(facets.map(f => [f.key, f]));

    function run(activeKeys, mode) {
      const keys = (activeKeys || []).filter(k => facetByKey[k]);
      if (!keys.length) return rows.slice();
      const tests = keys.map(k => facetByKey[k].test);
      return rows.filter(r => mode === 'OR' ? tests.some(t => t(r)) : tests.every(t => t(r)));
    }

    return { rows, facets, facetByKey, run };
  }

  global.QueryEngine = { build };
})(typeof window !== 'undefined' ? window : this);
