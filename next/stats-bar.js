/* stats-bar.js — WorldMonitor-style live stats + source-transparency bar.
   Computes REAL counts from the loaded data (never hardcoded, so they can't drift):
   states · districts · dimensions · sourced figures · gaps logged · deep ledgers ·
   story chains · news items · last updated. The "gaps logged" figure is shown on
   purpose — it makes the sourced-or-gap discipline visible and quantified, which is
   what makes the project authoritative rather than just dense.

   Dependency-free; exposes window.StatsBar:
     StatsBar.compute(ledger, events, news) → {stats object}
     StatsBar.render(stats, opts) → HTML string (a row of stat chips)
     StatsBar.mount(elId, {ledger, events, news, updated}) → compute + inject
   */
(function (global) {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  const fmt = n => Number(n || 0).toLocaleString('en-IN');

  function compute(ledger, events, news, officials) {
    const states = (ledger && ledger.states) || {};
    let nStates = 0, nDist = 0, deep = 0, blocks = 0, sourced = 0, gaps = 0;
    const dims = new Set();
    for (const s of Object.values(states)) {
      nStates++;
      for (const dist of Object.values(s.districts || {})) {
        nDist++;
        if (Array.isArray(dist.ledger) && dist.ledger.length) deep++;
        gaps += (dist._gaps || []).length;
        const dd = dist.dimensions || {};
        for (const k of Object.keys(dd)) dims.add(k);
        for (const dim of Object.values(dd)) {
          if (dim && typeof dim === 'object') {
            blocks++;
            if (dim.source && !dim.figure_gap) sourced++;
          }
        }
      }
    }
    const chains = ((events && events.story_chains) || []).length;
    const evCount = ((events && events.fiscal_events) || []).length;
    const newsCount = ((news && (news.news_items || news)) || []).length || 0;
    const officialsCount = ((officials && officials.officials) || []).length;
    // sourced-density: share of dimension blocks that carry a source with a real figure
    const density = blocks ? Math.round((sourced / blocks) * 100) : 0;
    return { nStates, nDist, nDims: dims.size, blocks, sourced, gaps, deep,
             chains, evCount, newsCount, officialsCount, density };
  }

  // Ordered stat definitions → chips. `hint` explains the number on hover.
  function render(st, opts) {
    opts = opts || {};
    const updated = opts.updated ? `<span class="sb-updated" title="Data last built">⟳ ${esc(opts.updated)}</span>` : '';
    const chips = [
      ['States / UTs', fmt(st.nStates), 'States and Union Territories mapped'],
      ['Districts', fmt(st.nDist), 'Every district in India'],
      ['Data layers', fmt(st.nDims), 'Dimensions per district: money, geography, health, wealth, language, politics, vehicles, aviation, housing'],
      ['Sourced figures', fmt(st.sourced), 'Dimension figures pinned to a cited source'],
      ['Gaps logged', fmt(st.gaps), 'Unsourced figures recorded as explicit gaps — never fabricated. This number is the discipline, made visible.'],
      ['Deep ledgers', fmt(st.deep), 'Districts with a full money-flow accountability ledger'],
      ['Story chains', fmt(st.chains), 'Promise → result → per-capita cost → human-impact accountability chains'],
      ['Officials', fmt(st.officialsCount), 'Named office-holders with sourced postings — facts only, never an accusation'],
      ['News tracked', fmt(st.newsCount), 'Aggregated, attributed, link-only news items'],
    ];
    const body = chips.map(([label, val, hint]) =>
      `<span class="sb-chip" title="${esc(hint)}"><b class="sb-num">${val}</b><span class="sb-lab">${esc(label)}</span></span>`
    ).join('');
    return `<div class="sb-bar" role="group" aria-label="Live coverage stats">
      <span class="sb-live" title="Computed live from the loaded data"><span class="sb-dot"></span>SOURCED-OR-GAP</span>
      ${body}
      <span class="sb-density" title="Share of dimension blocks with a cited source and a real figure (the rest are honest gaps)">${st.density}% <span class="sb-lab">source density</span></span>
      ${updated}
    </div>`;
  }

  function mount(elId, data) {
    const el = typeof elId === 'string' ? document.getElementById(elId) : elId;
    if (!el) return null;
    const st = compute(data.ledger, data.events, data.news, data.officials);
    el.innerHTML = render(st, { updated: data.updated });
    return st;
  }

  global.StatsBar = { compute, render, mount };
})(typeof window !== 'undefined' ? window : this);
