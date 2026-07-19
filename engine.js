/* engine.js — the shared renderer for a single engine's DEEP page.
 *
 * A deep page (engine-<slug>.html) is a thin shell: it sets <body data-engine="slug">
 * and includes engines-data.js + this file. This reads the slug, pulls the engine
 * from ENGINES_DATA, and renders the whole page — hero, what-it-maps, how-it-works,
 * a sourced worked example, sources, and links to sibling engines. One renderer,
 * seven pages, zero divergence. See ENGINES.md.
 */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }
  // engine names/ledes carry an intentional <em>; allow it, escape the rest.
  function rich(s) { return esc(s).replace(/&lt;em&gt;/g, '<em>').replace(/&lt;\/em&gt;/g, '</em>'); }

  const TIER_LABEL = { 1: "Gov / primary", 2: "Official aggregate", 3: "News / moderated", 4: "Provisional" };

  function render(e, all) {
    const accent = e.accent;
    const relCards = (e.related || []).map(slug => {
      const r = ENGINES_DATA.get(slug); if (!r) return '';
      return `<a class="en-rel" href="engine-${r.slug}.html" style="--en-accent:${r.accent}">
        <span class="en-rel-icon">${r.icon}</span>
        <span class="en-rel-body"><b>${rich(r.name)}</b><span>${esc(r.tagline)}</span></span>
      </a>`;
    }).join('');

    const maps = e.maps.map(m =>
      `<li class="en-map"><b>${esc(m.label)}</b><span>${esc(m.note)}</span></li>`).join('');

    const how = e.how.map((s, i) =>
      `<section class="en-how-row">
        <div class="en-how-num">${String(i + 1).padStart(2, '0')}</div>
        <div class="en-how-body"><h3>${esc(s.h)}</h3><p>${esc(s.p)}</p></div>
      </section>`).join('');

    const views = e.views.map(v =>
      `<a class="en-view" href="${esc(v.href)}">${esc(v.text)} <span class="en-arrow">→</span></a>`).join('');

    const sources = e.sources.map(s =>
      `<li><span class="en-tier en-tier-${s.tier}">T${s.tier}</span>${esc(s.name)}
        <span class="en-tier-label">${esc(TIER_LABEL[s.tier] || '')}</span></li>`).join('');

    // position in the engine sequence (prev / next)
    const idx = all.findIndex(x => x.slug === e.slug);
    const prev = all[(idx - 1 + all.length) % all.length];
    const next = all[(idx + 1) % all.length];

    return `
    <div class="en-wrap" style="--en-accent:${accent}">
      <a class="en-back" href="engines.html">← All engines</a>

      <header class="en-hero">
        <div class="en-hero-badge">
          <span class="en-hero-icon">${e.icon}</span>
          <span class="en-hero-num">ENGINE ${e.num}${e.origin ? ' · ORIGIN' : ''}</span>
        </div>
        <h1 class="en-hero-name">${rich(e.name)}</h1>
        <p class="en-hero-tag">${esc(e.tagline)}</p>
        <p class="en-hero-lede">${esc(e.lede)}</p>
        ${e.facts_only ? `<div class="en-factsonly">⚖️ Facts, never accusations — only what an audit, court or RTI has <em>already</em> established.</div>` : ''}
        <div class="en-hero-stat">
          <span class="en-stat-value">${esc(e.stat.value)}</span>
          <span class="en-stat-label">${esc(e.stat.label)}</span>
        </div>
      </header>

      <section class="en-section">
        <h2 class="en-h2"><span class="en-h2-k">What it maps</span></h2>
        <ul class="en-maps">${maps}</ul>
      </section>

      <section class="en-section">
        <h2 class="en-h2"><span class="en-h2-k">How it works</span></h2>
        <div class="en-how">${how}</div>
      </section>

      <section class="en-section en-example">
        <div class="en-example-k">Worked example — sourced, not invented</div>
        <h3 class="en-example-title">${esc(e.example.title)}</h3>
        <p class="en-example-body">${esc(e.example.body)}</p>
      </section>

      <section class="en-section">
        <h2 class="en-h2"><span class="en-h2-k">See it in the atlas</span></h2>
        <div class="en-views">${views}</div>
      </section>

      <section class="en-section en-two">
        <div>
          <h2 class="en-h2"><span class="en-h2-k">Sources</span></h2>
          <ul class="en-sources">${sources}</ul>
          <a class="en-prov" href="provenance.html">Audit every figure on the provenance ledger →</a>
        </div>
        <div>
          <h2 class="en-h2"><span class="en-h2-k">Mixes with</span></h2>
          <div class="en-rels">${relCards}</div>
        </div>
      </section>

      <nav class="en-seq">
        <a class="en-seq-prev" href="engine-${prev.slug}.html">
          <span class="en-seq-k">← Engine ${prev.num}</span><b>${rich(prev.name)}</b></a>
        <a class="en-seq-next" href="engine-${next.slug}.html">
          <span class="en-seq-k">Engine ${next.num} →</span><b>${rich(next.name)}</b></a>
      </nav>
    </div>`;
  }

  function boot() {
    const slug = document.body.getAttribute('data-engine');
    const e = window.ENGINES_DATA && ENGINES_DATA.get(slug);
    const host = document.getElementById('engine-root') || document.body;
    if (!e) {
      host.insertAdjacentHTML('afterbegin',
        `<div class="en-wrap"><a class="en-back" href="engines.html">← All engines</a>
         <p style="color:var(--muted-foreground);font-family:var(--font-mono);margin-top:2rem">
         Unknown engine "${esc(slug)}". <a href="engines.html">See all engines →</a></p></div>`);
      return;
    }
    // set the document title + description for SEO before site-nav injects cards
    document.title = `${e.name.replace(/<\/?em>/g, '')} — India Fiscal`;
    let desc = document.querySelector('meta[name="description"]');
    if (!desc) { desc = document.createElement('meta'); desc.name = 'description'; document.head.appendChild(desc); }
    desc.setAttribute('content', `${e.tagline} ${e.lede}`.slice(0, 300));

    host.innerHTML = render(e, ENGINES_DATA.ENGINES);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
