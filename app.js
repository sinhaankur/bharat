/* ══════════════════════════════════════════════════════════════════════
   INDIA FISCAL MAP — standalone single-screen dashboard
   Click a state → its 10-year history + governance footprint + pros/cons.
   ══════════════════════════════════════════════════════════════════════ */

(function init() {
  const root = document.getElementById('map');
  if (!root) return;

  const VIEWS = {
    ownTax: {
      label: 'Own tax revenue (₹ \'000 cr)',
      shortLabel: 'Own revenue',
      diverging: false,
      compute: (d, ext) => d.ownTax,
      fmt: v => v.toFixed(1) + ' k cr',
      help: 'Taxes the state collects itself — SGST share, stamp duty, state excise, motor-vehicle tax.'
    },
    corruption: {
      label: 'Households reporting bribe paid in last 12 mo (%)',
      shortLabel: 'Corruption %',
      diverging: false,
      compute: (d, ext) => ext?.corruption_pct ?? null,
      fmt: v => v == null ? '—' : v.toFixed(0) + '%',
      help: 'CMS-India India Corruption Study 2019 — % of households reporting they paid a bribe to access a public service.'
    },
    gsdp: {
      label: 'GSDP (₹ \'000 cr)',
      shortLabel: 'GSDP',
      diverging: false,
      compute: (d, ext) => d.gsdp,
      fmt: v => v.toFixed(0) + ' k cr',
      help: 'Gross State Domestic Product at current prices.'
    },
    ownTaxPctGsdp: {
      label: 'Own tax / GSDP (%)',
      shortLabel: 'Revenue / GSDP',
      diverging: false,
      compute: (d, ext) => (d.ownTax / d.gsdp) * 100,
      fmt: v => v.toFixed(2) + '%',
      help: 'Fiscal effort — what share of the state economy the state captures as own revenue.'
    },
    netFlow: {
      label: 'Net flow (₹ \'000 cr)',
      shortLabel: 'Net flow',
      diverging: true,
      compute: (d, ext) => (d.devolution + d.grants) - d.contribution,
      fmt: v => (v >= 0 ? '+' : '') + v.toFixed(1) + ' k cr',
      help: 'Devolution + grants received minus estimated federal taxes contributed. Positive = net recipient.'
    },
    devolution: {
      label: 'Central tax devolution (₹ \'000 cr)',
      shortLabel: 'Devolution',
      diverging: false,
      compute: (d, ext) => d.devolution,
      fmt: v => v.toFixed(1) + ' k cr',
      help: 'State\'s share of the divisible pool of central taxes per the active Finance Commission.'
    },
    contribution: {
      label: 'Estimated contribution to Center (₹ \'000 cr)',
      shortLabel: 'Contribution',
      diverging: false,
      compute: (d, ext) => d.contribution,
      fmt: v => v.toFixed(1) + ' k cr',
      help: 'Estimated federal taxes (income, corporate, GST/IGST origin, customs) attributable to the state.'
    },
    perCapitaGsdp: {
      label: 'Per-capita GSDP (₹ lakh / yr)',
      shortLabel: 'GDP / person',
      diverging: false,
      compute: (d) => d.meta?.pop_cr ? (d.gsdp * 1000 / d.meta.pop_cr) / 100000 : null,
      fmt: v => v == null ? '—' : '₹' + v.toFixed(2) + ' L',
      help: 'GSDP per resident per year (₹ lakh). State pop is 2024 estimate ≈ Census 2011 projection.'
    },
    fcShare: {
      label: 'Finance Commission horizontal share (%)',
      shortLabel: 'FC share',
      diverging: false,
      compute: (d, ext) => d.fcShare,
      fmt: v => v.toFixed(2) + '%',
      help: 'Percent of the divisible pool allocated to this state under the active Finance Commission.'
    }
  };

  // Source-of-truth registry — surfaced as `↗ Source` links next to each metric.
  const SOURCES = {
    gsdp:           { name: 'MoSPI',                  url: 'https://mospi.gov.in/state-domestic-product' },
    ownTax:         { name: 'RBI State Finances',     url: 'https://www.rbi.org.in/Scripts/AnnualPublications.aspx?head=Handbook+of+Statistics+on+Indian+States' },
    devolution:     { name: 'Union Budget receipts',  url: 'https://www.indiabudget.gov.in/' },
    grants:         { name: 'Union Budget receipts',  url: 'https://www.indiabudget.gov.in/' },
    contribution:   { name: 'CBDT + GST Council (est.)', url: 'https://incometaxindia.gov.in/Pages/Direct-Taxes-Data.aspx' },
    netFlow:        { name: 'Derived from above',     url: 'references.html' },
    ownTaxPctGsdp:  { name: 'RBI ÷ MoSPI',            url: 'https://www.rbi.org.in/' },
    perCapitaGsdp:  { name: 'MoSPI ÷ Census 2011 pop', url: 'https://mospi.gov.in/state-domestic-product' },
    fcShare:        { name: 'FC XIV / XV reports',    url: 'https://fincomindia.nic.in' },
    corruption:     { name: 'CMS India 2019',         url: 'https://www.cmsindia.org/india-corruption-study' },
    ias:            { name: 'DoPT Civil List',        url: 'https://dopt.gov.in/' },
    employees:      { name: 'State finance reports',  url: 'https://doe.gov.in/' },
    districts:      { name: 'Datameet · Census 2011 boundaries', url: 'https://github.com/geohacker/india' },
    population:     { name: 'Census of India 2011',   url: 'https://censusindia.gov.in' }
  };

  const ui = { state: { view: 'ownTax', yearIdx: 9, selected: null, hover: null, mode: 'states', drillState: null, drillDistrict: null, districtMode: 'population', showNews: true, showHazards: true, showHeat: false } };

  let DATA = null, EXTRAS = null, GEO = null, DISTRICT_POP = null, BLOCKS = null, LEDGER = null, PAY = null;
  let EVENTS = null, NEWS = null, BUBBLES = null, NEWS_FEED = null;
  const newsByState = new Map();      // "State" → [items]
  const newsByDistrict = new Map();   // "State|District" → [items]
  let newsBubbleLayer = null;
  let hazardLayer = null;   // clickable hazard/zoning markers at district centroids
  let eventHeatLayer = null;   // news/event density heatmap (event-heatmap.js)
  let map = null, geoLayer = null, districtLayer = null;
  let mapLayers = null;   // { basemaps, labels, hillshade, current } for the unified panel
  let mapUI = null;       // MapUI widget handle (deep-zoom note + zoom/scale readout)
  const pathByName = new Map();
  const districtPathByName = new Map();
  const districtGeoCache = new Map();

  // Census uses older / uppercase state names. Map to standard ST_NM.
  const CENSUS_STATE_MAP = {
    'ORISSA': 'Odisha',
    'PONDICHERRY': 'Puducherry',
    'NCT OF DELHI': 'Delhi',
    'ANDAMAN AND NICOBAR ISLANDS': 'Andaman & Nicobar',
    'JAMMU AND KASHMIR': 'Jammu & Kashmir',
    'UTTARAKHAND': 'Uttarakhand'
  };
  function normalizeStateName(s) {
    const up = s.toUpperCase();
    if (CENSUS_STATE_MAP[up]) return CENSUS_STATE_MAP[up];
    return s.split(/\s+/).map(w => w[0] + w.slice(1).toLowerCase()).join(' ');
  }

  const $ind = s => root.querySelector(s);
  const $$ind = s => root.querySelectorAll(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function oklch(l, c, h, a = 1) { return `oklch(${l} ${c} ${h} / ${a})`; }
  function seqColor(t) {
    t = Math.max(0, Math.min(1, t));
    return oklch(0.22 + 0.50 * t, 0.02 + 0.20 * t, 50);
  }
  function divColor(t) {
    t = Math.max(0, Math.min(1, t));
    if (t < 0.5) {
      const k = 1 - t * 2;
      return oklch(0.30 + 0.40 * k, 0.02 + 0.16 * k, 210);
    }
    const k = (t - 0.5) * 2;
    return oklch(0.30 + 0.45 * k, 0.02 + 0.20 * k, 35);
  }
  function colorFor(value, view, domain) {
    if (value === null || value === undefined || Number.isNaN(value)) return 'oklch(0.22 0 0)';
    if (view.diverging) {
      const max = Math.max(Math.abs(domain.min), Math.abs(domain.max));
      if (max <= 0) return divColor(0.5);
      return divColor(0.5 + (value / max) * 0.5);
    }
    const range = domain.max - domain.min;
    if (range <= 0) return seqColor(0.5);
    return seqColor((value - domain.min) / range);
  }

  function rowFor(stateName, yearIdx) {
    const s = DATA.states[stateName];
    if (!s) return null;
    const year = DATA._meta.years[yearIdx];
    const fcPeriod = DATA._meta.fc_periods.find(p => p.years.includes(year));
    const fcShare = (fcPeriod && fcPeriod.name === '15th FC') ? s.fc15_share : s.fc14_share;
    return {
      stateName, meta: s, year, yearLabel: DATA._meta.yearLabels[yearIdx], fcPeriod,
      gsdp: s.gsdp[yearIdx],
      ownTax: s.ownTax[yearIdx],
      devolution: s.devolution[yearIdx],
      grants: s.grants[yearIdx],
      contribution: s.contribution[yearIdx],
      fcShare
    };
  }
  function extFor(name) { return EXTRAS?.states?.[name] || null; }

  function computeDomain(view, yearIdx) {
    const values = [];
    for (const name of Object.keys(DATA.states)) {
      const r = rowFor(name, yearIdx);
      if (!r) continue;
      const v = view.compute(r, extFor(name));
      if (typeof v === 'number' && !Number.isNaN(v)) values.push(v);
    }
    if (!values.length) return { min: 0, max: 1 };
    return { min: Math.min(...values), max: Math.max(...values) };
  }

  // True when a landscape basemap or terrain overlay is showing, so the choropleth
  // should go translucent (with crisper borders) to let the terrain read through.
  function terrainActive() {
    if (!map || !mapLayers) return false;
    const baseTerrain = mapLayers.current && mapLayers.current !== 'Dark map';
    const overlayOn = (mapLayers.hillshade && map.hasLayer(mapLayers.hillshade)) ||
                      (mapLayers.elevTint && map.hasLayer(mapLayers.elevTint));
    return baseTerrain || overlayOn;
  }
  // As the user zooms IN, fade the data-colour choropleth away so the land/terrain
  // ("India in pixels") shows through. Full colour at country/state scale (z≤6),
  // fully transparent fill by z≥10 — borders stay so districts remain legible.
  function zoomFade() {
    const z = map ? map.getZoom() : 4;
    if (z <= 6) return 1;
    if (z >= 10) return 0;
    return (10 - z) / 4;                 // linear 1→0 across z6–z10
  }

  // Fill opacity + border for choropleth, adapting to terrain-beneath AND zoom.
  // Over terrain we go lighter; as you zoom in the fill fades out entirely.
  function choroStyle(baseFill, baseBorder) {
    const fade = zoomFade();
    const terr = terrainActive();
    const fill = terr ? Math.min(0.28, baseFill * 0.3) : baseFill;
    return {
      fillOpacity: fill * fade,
      borderColor: (terr || fade < 1) ? 'oklch(0.99 0 0 / 0.9)' : baseBorder,
      borderWeight: (terr || fade < 1) ? 1.2 : 0.6,
    };
  }

  // Aggregate a state's geography to a single colour for the India-wide view, so the
  // flood/terrain/vulnerability atlas is visible on first load (no drill needed).
  // Uses the worst/dominant district signal per state (honest: it's a state summary).
  function stateGeoColor(stateName, facet) {
    const sd = LEDGER?.states?.[stateName];
    if (!sd) return null;
    const dists = Object.values(sd.districts || {});
    const geos = dists.map(d => d.dimensions?.geography).filter(Boolean);
    if (!geos.length) {
      // fall back to the state-level geography block if districts lack dimensions
      const g = sd.geography;
      if (!g) return null;
      if (facet === 'flood') return geoFacetColor({ flood_level: g.flood_prone ? 'state-flood-prone' : 'not-flagged' }, 'flood');
      if (facet === 'coastal') return geoFacetColor({ on_coast: g.on_coast }, 'coastal');
      return geoFacetColor(g, facet);
    }
    if (facet === 'vulnerability') {
      const worst = Math.max(...geos.map(g => Vuln.signals(g).count));
      return Vuln.color(worst);
    }
    if (facet === 'flood') {
      const chronic = geos.some(g => g.flood_level === 'district-chronic');
      const state = geos.some(g => g.flood_prone);
      return geoFacetColor({ flood_level: chronic ? 'district-chronic' : state ? 'state-flood-prone' : 'not-flagged' }, 'flood');
    }
    if (facet === 'coastal') return geoFacetColor({ on_coast: geos.some(g => g.on_coast) }, 'coastal');
    if (facet === 'elevation') {
      const els = geos.map(g => g.elevation?.centroid_m).filter(m => typeof m === 'number');
      const mean = els.length ? els.reduce((a, b) => a + b, 0) / els.length : null;
      return geoFacetColor({ elevation: { centroid_m: mean } }, 'elevation');
    }
    if (facet === 'rainfall') return geoFacetColor(geos[0], 'rainfall');   // band is state-level
    return geoFacetColor(geos[0], facet);
  }

  // Restyle whichever layer is active: the drilled district layer, else the India
  // state layer. Used when the user changes the data mode / geography facet.
  function restyleActiveLayer() {
    if (ui.state.drillState) {
      const geo = districtGeoCache.get(ui.state.drillState);
      if (geo) renderDistrictLayer(geo, ui.state.drillState);
    } else if (geoLayer) {
      geoLayer.eachLayer(l => l.setStyle(fillStyle(l.feature.properties.ST_NM)));
    }
  }

  function fillStyle(name) {
    // Geography atlas mode at the India level — colour states by flood/vulnerability/
    // elevation/rainfall/coastal without drilling first.
    if (ui.state.districtMode === 'geography') {
      const facet = ui.state.geoFacet || 'zoning';
      const fc = stateGeoColor(name, facet);
      const cs = choroStyle(0.85, 'oklch(0.985 0 0 / 0.3)');
      return { color: cs.borderColor, weight: cs.borderWeight, fillColor: fc || 'oklch(0.22 0 0)', fillOpacity: cs.fillOpacity, className: 'india-state-path' };
    }
    const view = VIEWS[ui.state.view];
    const r = rowFor(name, ui.state.yearIdx);
    if (!r) return { color: 'oklch(0.985 0 0 / 0.18)', weight: 0.5, fillColor: 'oklch(0.22 0 0)', fillOpacity: terrainActive() ? 0.15 : 0.55, className: 'india-state-path no-data' };
    const v = view.compute(r, extFor(name));
    const cs = choroStyle(0.92, 'oklch(0.985 0 0 / 0.22)');
    return {
      color: cs.borderColor,
      weight: cs.borderWeight,
      fillColor: colorFor(v, view, ui._domain),
      fillOpacity: cs.fillOpacity,
      className: 'india-state-path'
    };
  }

  function updateLegend() {
    const view = VIEWS[ui.state.view];
    $ind('#india-legend-title').textContent = view.label;
    const d = ui._domain;
    const grad = $ind('#india-legend-grad');
    if (view.diverging) {
      const max = Math.max(Math.abs(d.min), Math.abs(d.max));
      grad.style.background = `linear-gradient(90deg, ${divColor(0)} 0%, ${divColor(0.5)} 50%, ${divColor(1)} 100%)`;
      $ind('#india-legend-min').textContent = view.fmt(-max);
      $ind('#india-legend-mid').textContent = view.fmt(0);
      $ind('#india-legend-max').textContent = view.fmt(max);
    } else {
      grad.style.background = `linear-gradient(90deg, ${seqColor(0)} 0%, ${seqColor(0.5)} 50%, ${seqColor(1)} 100%)`;
      $ind('#india-legend-min').textContent = view.fmt(d.min);
      $ind('#india-legend-mid').textContent = view.fmt((d.min + d.max) / 2);
      $ind('#india-legend-max').textContent = view.fmt(d.max);
    }
  }

  function updateReadout() {
    const view = VIEWS[ui.state.view];
    const name = ui.state.hover || ui.state.selected;
    const labelEl = $ind('.readout-label');
    const nameEl = $ind('.readout-name');
    const valEl = $ind('.readout-value');
    if (!name) {
      labelEl.textContent = 'Hover a state';
      nameEl.textContent = '—';
      valEl.textContent = view.help;
      valEl.style.color = 'var(--muted-foreground)';
      valEl.style.fontSize = '11px';
      return;
    }
    const r = rowFor(name, ui.state.yearIdx);
    if (!r) {
      labelEl.textContent = 'No fiscal data';
      nameEl.textContent = name;
      valEl.textContent = 'UT or excluded from this dataset';
      valEl.style.color = 'var(--muted-foreground)';
      valEl.style.fontSize = '12px';
      return;
    }
    labelEl.textContent = `${view.shortLabel} · ${r.yearLabel}`;
    nameEl.textContent = name;
    const v = view.compute(r, extFor(name));
    valEl.textContent = view.fmt(v);
    valEl.style.color = 'oklch(0.78 0.16 70)';
    valEl.style.fontSize = '14px';
  }

  function repaint() {
    ui._domain = computeDomain(VIEWS[ui.state.view], ui.state.yearIdx);
    if (geoLayer) geoLayer.eachLayer(layer => layer.setStyle(fillStyle(layer.feature.properties.ST_NM)));
    updateLegend();
    updateReadout();
    if (ui.state.selected) renderDetail(ui.state.selected);
    else renderEmptyState();
    updateYearMarker();
    // If a map-query is active at the India level, keep the match-glow on top.
    if (typeof reapplyQueryGlow === 'function') reapplyQueryGlow();
  }

  function updateYearMarker() {
    const total = DATA._meta.years.length;
    const pct = (ui.state.yearIdx / (total - 1)) * 100;
    const marker = root.querySelector('#india-fc-strip .fc-marker');
    if (marker) marker.style.left = `calc(${pct}% - 1px)`;
    $ind('#india-year-value').textContent = DATA._meta.yearLabels[ui.state.yearIdx];
  }

  function fmtComma(v) {
    if (Math.abs(v) >= 100) return Math.round(v).toLocaleString('en-IN');
    return v.toFixed(1);
  }

  function renderDetail(name) {
    const detail = $ind('#india-detail');
    const r = rowFor(name, ui.state.yearIdx);
    if (!r) {
      detail.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
          <div class="eyebrow">${esc(name)}</div>
          <button class="india-back-btn" id="india-back">← Back</button>
        </div>
        <p class="india-detail-empty-body">No fiscal data for this UT / excluded entity in the current dataset.</p>`;
      $ind('#india-back')?.addEventListener('click', deselectState);
      return;
    }
    const s = r.meta;
    const ext = extFor(name);
    const totalIn = r.devolution + r.grants;
    const net = totalIn - r.contribution;
    const isDonor = net < 0;
    const ratio = r.contribution > 0 ? (totalIn / r.contribution) : 0;
    const ownTaxPct = (r.ownTax / r.gsdp) * 100;

    const govStrip = ext ? `
      <div class="india-gov-strip">
        <div class="india-gov-cell">
          <div class="label">IAS cadre strength</div>
          <div class="value">${ext.ias}</div>
          <div class="sub">approved · ~25–40% on Central deputation</div>
        </div>
        <div class="india-gov-cell">
          <div class="label">State employees</div>
          <div class="value">${ext.employees_lakh} lakh</div>
          <div class="sub">direct only · excl. contract</div>
        </div>
        <div class="india-gov-cell">
          <div class="label">Bribe-paid %</div>
          <div class="value">${ext.corruption_pct}%</div>
          <div class="sub">CMS 2019 · last 12 mo</div>
        </div>
      </div>` : '';

    const deptBlock = ext ? `
      <div class="india-detail-section-title">Government departments</div>
      <div class="india-depts">
        <div class="india-dept-col back">
          <h4>Back-office (high payroll · low public output)</h4>
          <ul>${ext.dept_back.map(d => `<li><span class="name">${esc(d.name)}</span><span class="note">${esc(d.note)}</span></li>`).join('')}</ul>
        </div>
        <div class="india-dept-col front">
          <h4>Public-facing (citizen interaction)</h4>
          <ul>${ext.dept_public.map(d => `<li><span class="name">${esc(d.name)}</span><span class="note">${esc(d.note)}</span></li>`).join('')}</ul>
        </div>
      </div>
      <p class="india-caveat">IAS counts are cadre approved-strength snapshots; a sizeable share is on Central deputation under DoPT at any given time, so this is a structural cap, not a count of officers physically present in the state.</p>
    ` : '';

    const perCapita = s.pop_cr ? ((r.gsdp * 1000 / s.pop_cr) / 100000) : null;
    const src = (key) => {
      const o = SOURCES[key];
      return o ? `<a class="src-link" href="${esc(o.url)}" target="_blank" rel="noopener" title="Source: ${esc(o.name)}">↗</a>` : '';
    };
    detail.innerHTML = `
      <div class="india-detail-head">
        <div>
          <div class="india-detail-name">${esc(name)}</div>
          <div class="mono" style="font-size:10.5px;letter-spacing:0.04em;color:var(--muted-foreground);text-transform:uppercase;margin-top:2px">${esc(s.region)} · ${esc(s.capital)} · pop ~${s.pop_cr.toFixed(1)} cr</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.4rem">
          <button class="india-back-btn" id="india-back">← Back</button>
          <div class="india-detail-meta">${esc(r.yearLabel)} · <span style="opacity:0.6">${esc(r.fcPeriod?.name ?? '—')}</span></div>
          <button class="india-drill-btn" id="india-drill">Districts ↘</button>
        </div>
      </div>

      <div class="india-stat-grid">
        <div class="india-stat"><div class="label">GSDP ${src('gsdp')}</div><div class="value">₹${fmtComma(r.gsdp)} k cr</div></div>
        <div class="india-stat"><div class="label">Own revenue ${src('ownTax')}</div><div class="value">₹${fmtComma(r.ownTax)} k cr</div></div>
        <div class="india-stat"><div class="label">GDP / person ${src('perCapitaGsdp')}</div><div class="value">${perCapita == null ? '—' : '₹' + perCapita.toFixed(2) + ' L'}</div></div>
        <div class="india-stat"><div class="label">FC share ${src('fcShare')}</div><div class="value">${r.fcShare.toFixed(3)}%</div></div>
        <div class="india-stat"><div class="label">Devolution in ${src('devolution')}</div><div class="value">₹${fmtComma(r.devolution)} k cr</div></div>
        <div class="india-stat"><div class="label">Grants in ${src('grants')}</div><div class="value">₹${fmtComma(r.grants)} k cr</div></div>
        <div class="india-stat"><div class="label">Contrib. to Center (est.) ${src('contribution')}</div><div class="value">₹${fmtComma(r.contribution)} k cr</div></div>
        <div class="india-stat ${isDonor ? 'donor' : 'recipient'}"><div class="label">Net flow ${src('netFlow')}</div><div class="value">${net >= 0 ? '+' : ''}${fmtComma(net)} k cr</div></div>
      </div>

      <div style="display:flex;justify-content:space-between;gap:0.6rem;font-family:var(--font-mono);font-size:11px;color:var(--muted-foreground);margin-bottom:0.85rem;flex-wrap:wrap">
        <span>FC share: <span style="color:var(--foreground)">${r.fcShare.toFixed(3)}%</span></span>
        <span>Revenue / GSDP: <span style="color:var(--foreground)">${ownTaxPct.toFixed(2)}%</span></span>
        <span>In : Out: <span style="color:${isDonor ? 'oklch(0.7 0.18 30)' : 'oklch(0.7 0.17 162)'}">${ratio.toFixed(2)}×</span></span>
      </div>

      ${govStrip}

      <div class="india-detail-section-title">10-year history</div>
      <svg id="india-spark" viewBox="0 0 320 110" preserveAspectRatio="none"></svg>
      <div class="india-spark-legend">
        <span><span class="sw" style="background:oklch(0.7 0.17 162)"></span>Own revenue</span>
        <span><span class="sw" style="background:oklch(0.78 0.16 70)"></span>Devolution + grants</span>
        <span><span class="sw" style="background:oklch(0.65 0.18 250)"></span>Contribution (est.)</span>
      </div>

      ${deptBlock}

      <div class="india-detail-section-title">Pros &amp; Cons</div>
      <div class="india-proscons">
        <div class="india-pc pros"><h4>Pros</h4><ul>${s.pros.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>
        <div class="india-pc cons"><h4>Cons</h4><ul>${s.cons.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>
      </div>
    `;
    drawSpark(s, ui.state.yearIdx);
    $ind('#india-back')?.addEventListener('click', deselectState);
    $ind('#india-drill')?.addEventListener('click', () => drillIntoDistricts(name));
  }

  /* ───────── DISTRICT DRILL-DOWN ───────── */
  async function drillIntoDistricts(stateName) {
    // The ledger loads in the background off the first-paint path; if the user drills
    // before it's here, wait for it so the district panel + hazard pins have data.
    if (!LEDGER && _ledgerPromise) { try { await _ledgerPromise; } catch (e) {} }
    const fname = 'districts/' + stateName.replace(/ /g, '_').replace(/&/g, 'and') + '.geojson';
    try {
      let geo = districtGeoCache.get(stateName);
      if (!geo) {
        const res = await fetch(fname);
        if (!res.ok) throw new Error('HTTP ' + res.status + ' fetching ' + fname);
        geo = await res.json();
        districtGeoCache.set(stateName, geo);
      }
      ui.state.mode = 'districts';
      ui.state.drillState = stateName;
      renderDistrictLayer(geo, stateName);
      buildHazardMarkers(stateName, geo);   // annotate the map with pinned hazards
      renderDistrictPanel(stateName, geo);
    } catch (err) {
      console.error('District drill failed:', err);
      $ind('#india-detail').insertAdjacentHTML('afterbegin',
        `<div style="background:oklch(0.25 0.08 30);padding:0.5rem;border-radius:4px;font-family:var(--font-mono);font-size:11px;margin-bottom:0.5rem">No district file for ${esc(stateName)}: ${esc(err.message)}</div>`);
    }
  }

  function getDistrictPop(stateName, districtName) {
    if (!DISTRICT_POP) return null;
    // Census state names are uppercase + older; build matcher
    for (const [csState, dists] of Object.entries(DISTRICT_POP.states)) {
      const std = normalizeStateName(csState);
      const stdAmp = std.replace(' and ', ' & ').replace('Andaman & Nicobar Islands', 'Andaman & Nicobar');
      if (stdAmp === stateName || std === stateName) {
        // Case-insensitive district match
        for (const [dn, vals] of Object.entries(dists)) {
          if (dn.toLowerCase() === districtName.toLowerCase()) return vals;
        }
      }
    }
    return null;
  }

  // Categorical palette for dimension overlays (language / politics).
  const DIM_LANG_COLORS = {};  // dominant language → stable colour, assigned on demand
  const DIM_PALETTE = ['oklch(0.70 0.15 30)','oklch(0.72 0.14 90)','oklch(0.70 0.15 150)','oklch(0.68 0.14 210)','oklch(0.68 0.16 280)','oklch(0.72 0.15 340)','oklch(0.75 0.12 60)','oklch(0.66 0.13 180)','oklch(0.70 0.14 250)','oklch(0.74 0.13 120)'];
  function langColor(lang) {
    if (!lang) return 'oklch(0.22 0 0)';
    if (!(lang in DIM_LANG_COLORS)) DIM_LANG_COLORS[lang] = DIM_PALETTE[Object.keys(DIM_LANG_COLORS).length % DIM_PALETTE.length];
    return DIM_LANG_COLORS[lang];
  }
  function dimLangFor(state, district) {
    const lang = LEDGER?.states?.[state]?.districts?.[district]?.dimensions?.language;
    // prefer district mother-tongue if ever sourced; else the state official (first listed)
    return lang?.dominant_mother_tongue || (lang?.state_official || [])[0] || null;
  }
  function dimAlignFor(state, district) {
    return LEDGER?.states?.[state]?.districts?.[district]?.dimensions?.politics?.alignment_with_centre || null;
  }
  function alignColor(align) {
    if (!align) return 'oklch(0.22 0 0)';
    if (/aligned with Union/.test(align)) return 'oklch(0.70 0.15 150)';   // green
    if (/opposition/.test(align)) return 'oklch(0.66 0.20 28)';            // red
    return 'oklch(0.60 0.05 250)';                                          // neutral (UT-admin/other)
  }
  // Geography layer: colour by physical-constraint class (coast+flood > flood > coast > terrain).
  function dimGeoFor(state, district) {
    return LEDGER?.states?.[state]?.districts?.[district]?.dimensions?.geography || null;
  }
  // Health facet: colour by IMR (infant mortality) — lower is better (green→red).
  function healthColorFor(state) {
    const h = LEDGER?.states?.[state]?.health;
    if (!h || h.imr == null) return 'oklch(0.24 0.01 250)';
    const t = Math.min(1, Math.max(0, (h.imr - 4) / (50 - 4)));   // 4..50 → 0..1
    // green (low IMR) → amber → red (high IMR)
    return `oklch(${0.74 - 0.12 * t} ${0.13 + 0.08 * t} ${150 - 130 * t})`;
  }
  // Economy facet: colour by per-capita income tier (low→high).
  function economyColorFor(state) {
    const e = LEDGER?.states?.[state]?.economy;
    if (!e || e.percapita_nsdp_inr == null) return 'oklch(0.24 0.01 250)';
    const v = e.percapita_nsdp_inr;
    const t = Math.min(1, Math.max(0, (v - 50000) / (500000 - 50000)));
    return seqColor(0.18 + 0.75 * t);
  }
  // Fill colour for the "Data coverage" district mode (data density, not risk).
  function coverageColorFor(state, district) {
    if (typeof Coverage === 'undefined') return 'oklch(0.22 0 0)';
    const dist = LEDGER?.states?.[state]?.districts?.[district];
    if (!dist) return 'oklch(0.24 0.01 250)';
    return Coverage.color(Coverage.score(dist, { newsCount: newsCountFor(state, district) }).pct);
  }
  function geoClass(g) {
    if (!g) return null;
    if (g.on_coast && g.flood_prone) return 'coast-flood';
    if (g.flood_prone) return 'flood';
    if (g.on_coast) return 'coast';
    return g.terrain || 'other';
  }
  function geoColor(g) {
    const c = geoClass(g);
    return ({
      'coast-flood': 'oklch(0.62 0.20 20)',    // red — coastal CRZ + flood-prone (max constraint)
      'flood': 'oklch(0.66 0.16 250)',         // blue — chronically flood-prone
      'coast': 'oklch(0.72 0.13 200)',         // teal — coastal (CRZ applies)
      'himalayan-hill': 'oklch(0.80 0.05 260)',
      'northeast-hill': 'oklch(0.68 0.10 150)',
      'plateau': 'oklch(0.62 0.08 70)',
      'indo-gangetic-plain': 'oklch(0.82 0.10 110)',
      'coastal-plain': 'oklch(0.74 0.11 195)',
      'desert-arid': 'oklch(0.80 0.12 80)',
      'island': 'oklch(0.70 0.12 210)',
    })[c] || 'oklch(0.22 0 0)';
  }
  // Individual geography facets (each is its own checkbox/sub-layer).
  const GEO_FACETS = ['zoning', 'vulnerability', 'constraint', 'coastal', 'flood', 'elevation', 'rainfall'];

  // Which LEGAL/regulatory zone governs a district — the "what can be built here"
  // layer. Priority order = strongest legal restriction first, so the map answers
  // "is this a regulated/danger zone?" at a glance. Returns { key, label, color, legal }.
  function zoningZone(g) {
    if (!g) return { key: 'none', label: '—', color: 'oklch(0.24 0.01 250)', legal: '' };
    if (g.unsafe_zone?.documented)
      return { key: 'unsafe', label: 'Declared unsafe / no-development', color: 'oklch(0.55 0.24 18)',
        legal: 'An authority has declared this UNSAFE for habitation / no-development (CRZ no-dev, flood-hazard, O-zone, or a sinking/landslide zone). Building here is barred or being cleared.' };
    if (g.crz?.applies || g.on_coast)
      return { key: 'crz', label: 'Coastal Regulation Zone (CRZ)', color: 'oklch(0.66 0.15 210)',
        legal: 'This district touches the sea, so the MoEFCC CRZ Notification 2019 LEGALLY caps near-shore construction. The exact CRZ category (I–IV) needs the district Coastal Zone Management Plan — a gap.' };
    if (g.flood_level === 'district-chronic')
      return { key: 'flood', label: 'Flood-hazard (chronic)', color: 'oklch(0.62 0.19 40)',
        legal: 'Named in CWC/NDMA/state-DMA/Bhuvan as repeatedly flooded — construction on the floodplain here is a documented hazard.' };
    if (g.paleochannel?.documented || g.encroachment_zone?.documented)
      return { key: 'channel', label: 'On a river channel / encroached zone', color: 'oklch(0.72 0.14 75)',
        legal: 'Built over a river\'s natural old bed (palaeochannel) or inside a delineated encroachment zone (floodplain / water-body / FTL line) — the water tends to reclaim it.' };
    if (g.flood_level === 'state-flood-prone')
      return { key: 'flood_state', label: 'Flood-prone (state-level)', color: 'oklch(0.60 0.09 250)',
        legal: 'Inherits the state flood-prone flag (CWC/NDMA); not confirmed hazard at district level.' };
    return { key: 'none', label: 'No flagged legal zone', color: 'oklch(0.30 0.015 250)',
      legal: 'No coastal/flood/unsafe legal restriction is flagged from open sources for this district (absence of a flag is not a guarantee — it can be a gap).' };
  }

  function geoFacetColor(g, facet) {
    if (!g) return 'oklch(0.22 0 0)';
    if (facet === 'zoning') return zoningZone(g).color;
    if (facet === 'constraint') return geoColor(g);
    if (facet === 'vulnerability') return Vuln.color(Vuln.signals(g).count);   // signal stack, not a score
    if (facet === 'coastal')
      return g.on_coast ? 'oklch(0.72 0.13 200)' : 'oklch(0.24 0.01 200)';
    if (facet === 'flood') {
      const lv = g.flood_level;
      if (lv === 'district-chronic') return 'oklch(0.60 0.20 25)';   // red
      if (lv === 'state-flood-prone') return 'oklch(0.68 0.13 250)'; // blue
      return 'oklch(0.26 0.01 250)';                                  // grey — not flagged
    }
    if (facet === 'elevation') {
      const m = g.elevation?.centroid_m;
      if (m == null) return 'oklch(0.22 0 0)';
      // 0..3500 m -> light->dark seq
      const t = Math.min(1, Math.max(0, m / 3500));
      return seqColor(0.15 + 0.8 * t);
    }
    if (facet === 'rainfall') {
      const band = g.rainfall?.band || '';
      if (/very-high/.test(band)) return 'oklch(0.45 0.16 250)';
      if (/high/.test(band)) return 'oklch(0.60 0.14 235)';
      if (/moderate/.test(band)) return 'oklch(0.74 0.11 200)';
      if (/semiarid/.test(band)) return 'oklch(0.80 0.12 90)';
      if (/arid/.test(band)) return 'oklch(0.82 0.14 70)';
      return 'oklch(0.24 0.01 200)';
    }
    return 'oklch(0.22 0 0)';
  }

  function renderDistrictLayer(geo, stateName) {
    // Hide the state layer's other states by drastically reducing their opacity (keep selected state visible underneath as outline)
    if (geoLayer) {
      geoLayer.eachLayer(layer => {
        const isThis = layer.feature.properties.ST_NM === stateName;
        layer.setStyle({ fillOpacity: isThis ? 0.0 : 0.15, weight: isThis ? 1.5 : 0.3, color: isThis ? 'oklch(0.985 0 0)' : 'oklch(0.985 0 0 / 0.15)' });
      });
    }
    if (districtLayer) {
      districtLayer.remove();
      districtPathByName.clear();
    }
    // Domain for district population coloring
    const pops = [];
    for (const f of geo.features) {
      const pop = getDistrictPop(stateName, f.properties.DISTRICT)?.population;
      if (typeof pop === 'number') pops.push(pop);
    }
    const popMax = pops.length ? Math.max(...pops) : 1;
    const popMin = pops.length ? Math.min(...pops) : 0;

    // Money-flow overlay: which districts have ledger data, their headline ₹ in, and any flag.
    const moneyByDistrict = new Map();
    for (const f of geo.features) {
      const dn = f.properties.DISTRICT;
      const m = districtMoneyHeadline(stateName, dn);
      if (m != null) moneyByDistrict.set(dn, m);
    }
    const moneyVals = [...moneyByDistrict.values()];
    // Log scale: headline flows span orders of magnitude (₹14 cr ↔ ₹2,897 cr).
    const logMax = moneyVals.length ? Math.max(1, ...moneyVals.filter(o => o.headline != null).map(o => Math.log10(Math.max(1, o.headline + 1)))) : 1;
    const showMoney = ui.state.districtMode === 'money' && moneyVals.length > 0;

    // Scale district fill opacity down (and brighten borders) when terrain shows through.
    const fo = base => (terrainActive() ? Math.min(0.32, base * 0.35) : base) * zoomFade();
    const bc = base => terrainActive() ? 'oklch(0.99 0 0 / 0.75)' : base;
    districtLayer = L.geoJSON(geo, {
      style: f => {
        const dn = f.properties.DISTRICT;
        if (showMoney) {
          const m = moneyByDistrict.get(dn);
          if (!m) return { className: 'india-state-path', color: bc('oklch(0.985 0 0 / 0.2)'), weight: 0.5, fillColor: 'oklch(0.2 0 0)', fillOpacity: fo(0.3) };
          if (m.noFigure) {
            // Data present but no public money figure (e.g. off-books civic spend).
            return { className: 'india-state-path', color: 'oklch(0.72 0.13 250)', weight: 1.5, dashArray: '2 2', fillColor: 'oklch(0.32 0.06 250)', fillOpacity: fo(0.7) };
          }
          const t = Math.log10(Math.max(1, m.headline + 1)) / Math.max(0.001, logMax);
          return {
            className: 'india-state-path',
            // Flagged (freeze/dysfunction) districts get a red-orange ring; others gold.
            color: m.flagged ? 'oklch(0.65 0.22 25)' : 'oklch(0.85 0.16 80)',
            weight: m.flagged ? 2 : 1.2,
            dashArray: m.flagged ? '4 2' : null,
            fillColor: seqColor(0.2 + 0.75 * t),
            fillOpacity: fo(0.92)
          };
        }
        if (ui.state.districtMode === 'language') {
          return { className: 'india-state-path', color: bc('oklch(0.985 0 0 / 0.35)'), weight: 0.6, fillColor: langColor(dimLangFor(stateName, dn)), fillOpacity: fo(0.85) };
        }
        if (ui.state.districtMode === 'politics') {
          return { className: 'india-state-path', color: bc('oklch(0.985 0 0 / 0.35)'), weight: 0.6, fillColor: alignColor(dimAlignFor(stateName, dn)), fillOpacity: fo(0.85) };
        }
        if (ui.state.districtMode === 'geography') {
          const facet = ui.state.geoFacet || 'zoning';
          return { className: 'india-state-path', color: bc('oklch(0.985 0 0 / 0.35)'), weight: 0.6, fillColor: geoFacetColor(dimGeoFor(stateName, dn), facet), fillOpacity: fo(0.85) };
        }
        if (ui.state.districtMode === 'coverage') {
          return { className: 'india-state-path', color: bc('oklch(0.985 0 0 / 0.35)'), weight: 0.6, fillColor: coverageColorFor(stateName, dn), fillOpacity: fo(0.85) };
        }
        if (ui.state.districtMode === 'health') {
          return { className: 'india-state-path', color: bc('oklch(0.985 0 0 / 0.35)'), weight: 0.6, fillColor: healthColorFor(stateName), fillOpacity: fo(0.85) };
        }
        if (ui.state.districtMode === 'economy') {
          return { className: 'india-state-path', color: bc('oklch(0.985 0 0 / 0.35)'), weight: 0.6, fillColor: economyColorFor(stateName), fillOpacity: fo(0.85) };
        }
        const pop = getDistrictPop(stateName, dn)?.population;
        const t = pop != null ? (pop - popMin) / Math.max(1, popMax - popMin) : 0;
        return {
          className: 'india-state-path',
          color: bc('oklch(0.985 0 0 / 0.45)'),
          weight: 0.6,
          fillColor: pop == null ? 'oklch(0.22 0 0)' : seqColor(t),
          fillOpacity: pop == null ? fo(0.45) : fo(0.9)
        };
      },
      onEachFeature: (feature, layer) => {
        const dn = feature.properties.DISTRICT;
        districtPathByName.set(dn, layer);
        layer.on('mouseover', () => {
          layer.setStyle({ weight: 1.6, color: 'oklch(0.985 0 0)' });
          if (showMoney) updateDistrictMoneyReadout(dn, stateName, moneyByDistrict.get(dn));
          else updateDistrictFacetReadout(dn, stateName);
        });
        layer.on('mouseout', () => {
          if (ui.state.drillDistrict !== dn) {
            if (_queryMatchSet.has(dn)) {
              layer.setStyle({ color: 'oklch(0.90 0.17 90)', weight: 2.4 });   // keep the query ring
            } else {
              const m = showMoney ? moneyByDistrict.get(dn) : null;
              if (m) layer.setStyle({ weight: m.flagged ? 2 : 1.2, color: m.flagged ? 'oklch(0.65 0.22 25)' : 'oklch(0.85 0.16 80)' });
              else layer.setStyle({ weight: 0.6, color: showMoney ? 'oklch(0.985 0 0 / 0.2)' : 'oklch(0.985 0 0 / 0.45)' });
            }
          }
          updateReadout();
        });
        layer.on('click', () => selectDistrict(dn, stateName));
      }
    }).addTo(map);

    renderLayersPanel();   // refresh the unified panel (data modes + legend) for this state

    highlightQueryDistricts(stateName);   // ring the districts matching an active query

    try { map.fitBounds(districtLayer.getBounds(), { padding: [30, 30] }); } catch (e) {}
  }

  // District names matching the active map-query within one state (for the polygon
  // highlight). Empty when no query is active.
  function queryMatchDistricts(stateName) {
    if (!QENGINE || !queryState.keys.size) return new Set();
    return new Set(QENGINE.run([...queryState.keys], queryState.mode)
      .filter(r => r.state === stateName).map(r => r.district));
  }

  // Ring the matching district polygons with a bright halo so the query result is
  // visible at DISTRICT level after you drill in (survives hover via the flag below).
  function highlightQueryDistricts(stateName) {
    const matches = queryMatchDistricts(stateName);
    _queryMatchSet = matches;   // read by the mouseout handler so the ring persists
    districtPathByName.forEach((layer, dn) => {
      if (matches.has(dn)) {
        layer.setStyle({ color: 'oklch(0.90 0.17 90)', weight: 2.4, dashArray: null });
        if (layer.bringToFront) layer.bringToFront();
      }
    });
    if (matches.size) renderQueryHintBadge(stateName, matches.size);
    else removeQueryHintBadge();
  }
  let _queryMatchSet = new Set();

  // Small badge over the drilled state telling the user the query is filtering here.
  function renderQueryHintBadge(stateName, n) {
    const wrap = document.getElementById('india-map-wrap');
    if (!wrap) return;
    let b = document.getElementById('query-hint-badge');
    if (!b) { b = document.createElement('div'); b.id = 'query-hint-badge'; b.className = 'query-hint-badge'; wrap.appendChild(b); }
    b.innerHTML = `🔎 ${n} district${n === 1 ? '' : 's'} in ${esc(stateName)} match your query <span class="qhb-dot"></span>`;
  }
  function removeQueryHintBadge() { document.getElementById('query-hint-badge')?.remove(); }

  // Headline money figure for a district (the biggest ₹-in row in its ledger), or null.
  function districtMoneyHeadline(state, district) {
    const L = ledgerForDistrict(state, district);
    if (!L) return null;
    const vals = (L.ledger || []).map(r => r.money_in_cr).filter(v => typeof v === 'number');
    if (!vals.length) {
      // District has ledger data but no public money figure (e.g. Jamshedpur's
      // off-municipal-books civic spend). Mark it present-but-unquantified.
      const hasContent = (L.ledger || []).length || (L.plants || []).length || (L.system_notes || []).length;
      return hasContent ? { headline: null, flagged: true, admin: L.admin_model, noFigure: true } : null;
    }
    const headline = Math.max(...vals);
    // Dysfunction flag: any frozen/lapsed/zero-completion row, or a system note flagging a freeze.
    const flagged = L.ledger.some(r => {
      const w = r.what_happened || {};
      return w.audit_flag === 'fund_release_frozen' || w.lapsed === true ||
        w.audit_flag === 'zero_completion' || (typeof r.money_in_cr === 'number' && r.money_in_cr === 0);
    }) || (L.system_notes || []).some(n => /freeze|frozen|withh/i.test(n.kind + ' ' + n.note));
    return { headline, flagged, admin: L.admin_model };
  }

  function updateDistrictMoneyReadout(district, state, m) {
    const money = m && typeof m === 'object' ? m.headline : m;
    const flagged = m && typeof m === 'object' ? m.flagged : false;
    const noFigure = m && typeof m === 'object' ? m.noFigure : false;
    $ind('.readout-label').textContent = `District money · ${state}`;
    $ind('.readout-name').textContent = district;
    const valEl = $ind('.readout-value');
    valEl.textContent = noFigure ? 'Data present · no public money figure'
      : money != null ? `₹${money >= 1000 ? (money / 1000).toFixed(2) + 'k' : Math.round(money)} cr headline flow${flagged ? ' · ⚠ flagged' : ''}`
      : 'No ledger data yet';
    valEl.style.color = money != null ? 'oklch(0.82 0.16 75)' : 'var(--muted-foreground)';
    valEl.style.fontSize = '12.5px';
  }

  // (district colour-mode UI moved into the unified #map-layers-panel — see renderLayersPanel)

  function updateDistrictReadout(district, state, pop) {
    $ind('.readout-label').textContent = `District · ${state}`;
    $ind('.readout-name').textContent = district;
    const valEl = $ind('.readout-value');
    valEl.textContent = pop != null ? `Pop ${pop.toLocaleString('en-IN')} (Census 2011)` : 'Population data pending';
    valEl.style.color = 'oklch(0.78 0.16 70)';
    valEl.style.fontSize = '12.5px';
  }

  // Facet-aware hover readout: tell the user the value they're seeing coloured on
  // the map, not always population. Falls back to population for the default facet.
  // '(state)' marks a state-level figure shown on a district (health / economy).
  function updateDistrictFacetReadout(district, state) {
    const mode = ui.state.districtMode;
    let text = null, color = 'oklch(0.78 0.16 70)';
    if (mode === 'health') {
      const h = LEDGER?.states?.[state]?.health;
      if (h && h.imr != null) { text = `IMR ${h.imr}/1k${h.stunting_u5_pct != null ? ` · stunting ${h.stunting_u5_pct}%` : ''} (state, NFHS-5)`; color = healthColorFor(state); }
      else text = 'Health: gap';
    } else if (mode === 'economy') {
      const e = LEDGER?.states?.[state]?.economy;
      if (e && e.percapita_nsdp_inr != null) { text = `₹${e.percapita_nsdp_inr.toLocaleString('en-IN')}/yr${e.income_tier ? ` · ${e.income_tier.replace(/-/g, ' ')}` : ''} (state, RBI)`; color = economyColorFor(state); }
      else text = 'Per-capita income: gap';
    } else if (mode === 'language') {
      const lang = dimLangFor(state, district);
      text = lang ? `Language: ${lang}` : 'Language: gap';
      if (lang) color = langColor(lang);
    } else if (mode === 'politics') {
      const a = dimAlignFor(state, district);
      text = a ? a : 'Political alignment: gap';
      if (a) color = alignColor(a);
    } else if (mode === 'coverage' && typeof Coverage !== 'undefined') {
      const dist = LEDGER?.states?.[state]?.districts?.[district];
      if (dist) { const pct = Coverage.score(dist, { newsCount: newsCountFor(state, district) }).pct; text = `Data coverage ${pct}% (sourced vs gap)`; color = Coverage.color(pct); }
    } else if (mode === 'geography') {
      const g = dimGeoFor(state, district);
      const facet = ui.state.geoFacet || 'zoning';
      if (g) { text = geoReadoutText(g, facet); color = geoFacetColor(g, facet); }
      else text = 'Geography: gap';
    }
    if (text == null) return updateDistrictReadout(district, state, getDistrictPop(state, district)?.population);
    $ind('.readout-label').textContent = `District · ${state}`;
    $ind('.readout-name').textContent = district;
    const valEl = $ind('.readout-value');
    valEl.textContent = text;
    valEl.style.color = color;
    valEl.style.fontSize = '12.5px';
  }

  // Short human summary of a district's geography for the active facet. Reads the
  // same fields the colour logic (geoFacetColor / zoningZone) reads, so the badge
  // and the map agree.
  function geoReadoutText(g, facet) {
    if (facet === 'zoning') return zoningZone(g).label;
    if (facet === 'vulnerability') {
      const n = (typeof Vuln !== 'undefined') ? Vuln.signals(g).count : 0;
      return n ? `${n} overlapping risk signal${n > 1 ? 's' : ''}` : 'No stacked risk signals';
    }
    if (facet === 'coastal') return g.crz?.applies || g.on_coast ? 'Coastal · CRZ applies' : 'Not on coast';
    if (facet === 'flood') {
      if (g.flood_level === 'district-chronic') return 'Flood-hazard (chronic)';
      if (g.flood_level === 'state-flood-prone') return 'Flood-prone (state-level)';
      return 'Not flagged flood-prone';
    }
    if (facet === 'elevation') {
      const m = g.elevation?.centroid_m;
      return m != null ? `Elevation ${m} m${g.elevation?.terrain_band ? ` · ${g.elevation.terrain_band}` : ''}` : 'Elevation: gap';
    }
    if (facet === 'rainfall') return g.rainfall?.band ? `Rainfall band: ${g.rainfall.band}` : 'Rainfall band: gap';
    if (facet === 'constraint') return zoningZone(g).label;
    return 'Geography';
  }

  function selectDistrict(district, state) {
    ui.state.drillDistrict = district;
    const selLayer = districtPathByName.get(district);
    districtPathByName.forEach((layer, n) => {
      if (n === district) layer.setStyle({ weight: 2, color: 'oklch(0.985 0 0)' });
      else layer.setStyle({ weight: 0.6, color: 'oklch(0.985 0 0 / 0.45)' });
    });
    // Zoom into the individual district. maxZoom caps tiny districts (e.g. Kolkata) from over-zooming.
    if (selLayer && selLayer.getBounds) {
      try { map.fitBounds(selLayer.getBounds(), { padding: [40, 40], maxZoom: 11 }); } catch (e) {}
    }
    renderSubdistrictLayer(state);   // reveal taluk/tehsil polygons below the district
    renderLayersPanel();             // enable the sub-districts checkbox
    renderDistrictDetail(district, state);
  }

  // ---- Sub-district (taluk/tehsil/block) polygons — the zoom level BELOW district.
  // Lazy per-state fetch from subdistricts/<State>.geojson (open geoBoundaries ADM3,
  // ODbL, from the govt LGD). Mirrors the districts/ loading convention.
  const subdistrictGeoCache = new Map();
  let subdistrictLayer = null;
  async function renderSubdistrictLayer(stateName) {
    if (subdistrictLayer) { subdistrictLayer.remove(); subdistrictLayer = null; }
    let geo = subdistrictGeoCache.get(stateName);
    if (!geo) {
      const fname = 'subdistricts/' + stateName.replace(/ /g, '_').replace(/&/g, 'and') + '.geojson';
      try {
        const res = await fetch(fname);
        if (!res.ok) return;              // no file for this state — silently skip
        geo = await res.json();
        subdistrictGeoCache.set(stateName, geo);
      } catch (e) { return; }
    }
    if (ui.state.drillState !== stateName && ui.state.drillDistrict == null) return;
    subdistrictLayer = L.geoJSON(geo, {
      style: { className: 'india-subdistrict-path', color: 'oklch(0.85 0.10 200 / 0.55)', weight: 0.5, fillColor: 'oklch(0.6 0.08 200)', fillOpacity: 0.06 },
      onEachFeature: (feature, layer) => {
        const sd = feature.properties.SUBDISTRICT || 'sub-district';
        const parent = feature.properties.DISTRICT;
        const tip = parent ? `${sd} <span style="opacity:.65">· ${parent} dist.</span>` : sd;
        layer.bindTooltip(tip, { sticky: true, className: 'subdistrict-tip', opacity: 0.95 });
        layer.on('mouseover', () => layer.setStyle({ weight: 1.4, color: 'oklch(0.95 0.06 200)', fillOpacity: 0.18 }));
        layer.on('mouseout', () => layer.setStyle({ weight: 0.5, color: 'oklch(0.85 0.10 200 / 0.55)', fillOpacity: 0.06 }));
        // Click a taluk → open its parent district's full panel (everything).
        layer.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          if (parent && ui.state.drillDistrict !== parent) selectDistrict(parent, stateName);
          else if (parent) renderDistrictDetail(parent, stateName);
        });
      }
    }).addTo(map);
  }

  function renderDistrictPanel(stateName, geo) {
    // List districts of this state sorted by population (Census 2011 where available)
    const items = geo.features.map(f => {
      const dn = f.properties.DISTRICT;
      const data = getDistrictPop(stateName, dn);
      return { name: dn, pop: data?.population ?? null, lit: data?.literate ?? null, hh: data?.households ?? null };
    });
    items.sort((a, b) => (b.pop || 0) - (a.pop || 0));
    const totalPop = items.reduce((s, x) => s + (x.pop || 0), 0);
    const src = (key) => {
      const o = SOURCES[key];
      return o ? `<a class="src-link" href="${esc(o.url)}" target="_blank" rel="noopener" title="Source: ${esc(o.name)}">↗</a>` : '';
    };
    const max = items[0]?.pop || 1;
    const detail = $ind('#india-detail');
    detail.innerHTML = `
      <div class="india-detail-head">
        <div>
          <div class="india-detail-name">${esc(stateName)} · districts</div>
          <div class="mono" style="font-size:10.5px;letter-spacing:0.04em;color:var(--muted-foreground);text-transform:uppercase;margin-top:2px">${items.length} districts · total Census 2011 pop ${totalPop.toLocaleString('en-IN')}</div>
        </div>
        <button class="india-back-btn" id="india-back-to-state">← Back to ${esc(stateName)}</button>
      </div>

      <div class="india-caveat" style="margin-bottom:0.6rem">
        Every district is headed by <strong style="color:var(--foreground)">one IAS Collector / District Magistrate</strong> ${src('ias')} — not a varying count. The rest of the state's IAS cadre sits at the state secretariat, on Central deputation, in PSUs, on training, or vacant. Population from Census 2011 ${src('population')} — Census 2021 was deferred; some post-2011 newer districts not in this dataset.
      </div>

      <div class="india-detail-section-title">Districts by population</div>
      <div class="district-list">
        ${items.map((it, i) => `
          <button class="district-row" data-district="${esc(it.name)}">
            <span class="rnk">${String(i + 1).padStart(2, '0')}</span>
            <span class="name">${esc(it.name)}</span>
            <span class="bar-wrap"><span class="bar" style="width:${it.pop ? ((it.pop / max) * 100).toFixed(0) : 0}%"></span></span>
            <span class="val">${it.pop ? (it.pop / 1e6).toFixed(2) + ' M' : '—'}</span>
          </button>
        `).join('')}
      </div>
    `;
    detail.querySelectorAll('.district-row').forEach(row => {
      row.addEventListener('click', () => selectDistrict(row.dataset.district, stateName));
    });
    $ind('#india-back-to-state')?.addEventListener('click', () => exitDrill(stateName));
  }

  function renderDistrictDetail(district, state) {
    const data = getDistrictPop(state, district);
    const src = (key) => {
      const o = SOURCES[key];
      return o ? `<a class="src-link" href="${esc(o.url)}" target="_blank" rel="noopener" title="Source: ${esc(o.name)}">↗</a>` : '';
    };
    const detail = $ind('#india-detail');
    const litRate = data?.literate && data?.population ? (data.literate / data.population * 100).toFixed(1) : null;
    const urbanPct = data?.urban_hh && data?.households ? (data.urban_hh / data.households * 100).toFixed(1) : null;
    detail.innerHTML = `
      <div class="india-detail-head">
        <div>
          <div class="india-detail-name">${esc(district)}</div>
          <div class="mono" style="font-size:10.5px;letter-spacing:0.04em;color:var(--muted-foreground);text-transform:uppercase;margin-top:2px">District of ${esc(state)} · ${ledgerForDistrict(state, district)?.admin_model === 'split' ? 'split admin (no single DM)' : 'headed by 1 IAS Collector'}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.4rem">
          <button class="india-back-btn" id="india-back-to-districts">← All districts</button>
          <button class="india-back-btn" id="india-back-to-state">← ${esc(state)}</button>
        </div>
      </div>
      ${renderCoverageMeter(state, district)}
      ${data ? `
      <div class="india-stat-grid">
        <div class="india-stat"><div class="label">Population (2011) ${src('population')}</div><div class="value">${data.population.toLocaleString('en-IN')}</div></div>
        <div class="india-stat"><div class="label">Literate ${src('population')}</div><div class="value">${litRate ? litRate + '%' : '—'}</div></div>
        <div class="india-stat"><div class="label">Male / Female</div><div class="value">${data.male.toLocaleString('en-IN')} / ${data.female.toLocaleString('en-IN')}</div></div>
        <div class="india-stat"><div class="label">Households ${src('population')}</div><div class="value">${data.households ? data.households.toLocaleString('en-IN') : '—'}</div></div>
        <div class="india-stat"><div class="label">Urban share</div><div class="value">${urbanPct ? urbanPct + '%' : '—'}</div></div>
        <div class="india-stat"><div class="label">Administrative head</div><div class="value" style="font-size:11.5px">1 IAS Collector / DM</div></div>
      </div>
      ` : `<p class="india-detail-empty-body">No Census 2011 record for this district — likely carved out post-2011.</p>`}

      ${renderDistrictDimensions(state, district)}

      ${renderLedgerSection(state, district)}

      ${renderDistrictEvents(state, district)}

      ${renderLocationNews(state, district)}

      ${renderBlockSection(state, district)}

      <div class="india-caveat">
        Census 2011 totals are persons (not lakh / crore). Sex / household figures from the same Census round. IAS Collector posting changes ~every 2–3 years; the current DM's name isn't in this dashboard (no central machine-readable list — would have to scrape state DOPT sites). ${ledgerForDistrict(state, district)?.admin_model === 'split' ? 'Note: this district does <strong>not</strong> follow the one-DM model — see the money-flow section above.' : 'What IS structural: every district has exactly one DM, and that\'s the state\'s only routine IAS field deployment outside the secretariat.'}
      </div>
    `;
    detail.querySelector('#india-back-to-districts')?.addEventListener('click', () => {
      ui.state.drillDistrict = null;
      if (subdistrictLayer) { subdistrictLayer.remove(); subdistrictLayer = null; }
      const geo = districtGeoCache.get(state);
      if (geo) renderDistrictPanel(state, geo);
      districtPathByName.forEach(layer => layer.setStyle({ weight: 0.6, color: 'oklch(0.985 0 0 / 0.45)' }));
      // Zoom back out from the single district to the whole state's districts.
      if (districtLayer && districtLayer.getBounds) {
        try { map.fitBounds(districtLayer.getBounds(), { padding: [30, 30] }); } catch (e) {}
      }
    });
    detail.querySelector('#india-back-to-state')?.addEventListener('click', () => exitDrill(state));
    const covT = detail.querySelector('#cov-toggle');
    if (covT) covT.addEventListener('click', () => {
      const dt = detail.querySelector('#cov-detail');
      const open = dt.hidden;
      dt.hidden = !open; covT.setAttribute('aria-expanded', String(open));
      covT.textContent = open ? '▴' : '▾';
    });
    bindBlockClicks(detail);
    bindLedgerCharts(detail, state, district);
  }

  /* ───────── BLOCK / TALUK level (V1 pilot — Kerala, Goa, Sikkim) ───────── */
  function blockLabelFor(state) {
    const map = BLOCKS?._meta?.block_label_by_state || {};
    return map[state] || map.default || 'Block';
  }
  function blocksForDistrict(state, district) {
    return BLOCKS?.states?.[state]?.districts?.[district] || null;
  }

  /* ───────── MONEY-FLOW ACCOUNTABILITY LEDGER ───────── */
  function ledgerForDistrict(state, district) {
    return LEDGER?.states?.[state]?.districts?.[district] || null;
  }
  // Source footnote: visible link + tier flag (per user: "clear footnote based on public record").
  function srcFootnote(source, tier) {
    if (!source) return '';
    const tierName = LEDGER?._meta?.source_tiers?.[String(tier)] || '';
    const weak = tier >= 3; // wikipedia/news — flag as needing gov-PDF upgrade
    return `<a class="src-link" href="${esc(source)}" target="_blank" rel="noopener" title="Source (tier ${tier}: ${esc(tierName)})">↗</a>${weak ? `<span class="ledger-tier-warn" title="Tier ${tier} (${esc(tierName)}) — pending upgrade to a government PDF source">⚠</span>` : ''}`;
  }
  function payForPost(postName) {
    if (!PAY || !postName) return null;
    // Try exact, then strip a trailing ", <place>" or " (<qualifier>)" to match the generic post key.
    return PAY.posts?.[postName]
      || PAY.posts?.[postName.split(',')[0].trim()]
      || PAY.posts?.[postName.split(' (')[0].trim()]
      || null;
  }
  function fmtCr(v) { return (v == null) ? '—' : `₹${v} cr`; }

  /* ───────── Governance-protocol badges (from _meta protocol layers) ───────── */
  // Constitutional list (Seventh Schedule) → short label + colour class.
  const CONST_LIST_META = {
    union:      { label: 'Union List',      cls: 'cl-union',   title: 'Seventh Schedule, List I — only Parliament may legislate' },
    state:      { label: 'State List',      cls: 'cl-state',   title: 'Seventh Schedule, List II — only the State Legislature' },
    concurrent: { label: 'Concurrent List', cls: 'cl-conc',    title: 'Seventh Schedule, List III — both; Union law prevails (Art. 254)' },
    local_body: { label: 'Local body',      cls: 'cl-local',   title: '11th/12th Schedule (73rd/74th Amendment) — devolved to panchayats/municipalities' },
  };
  // Who appoints a post → colour class by tier (mirrors command-chain.html).
  const AUTH_TIER_CLS = { 1: 'au-union', 2: 'au-state', 3: 'au-state', 4: 'au-elected', 5: 'au-elected' };

  function constBadge(constList, fundingPattern) {
    const m = CONST_LIST_META[constList];
    if (!m) return '';
    const fund = fundingPattern ? `<span class="proto-fund" title="Funding pattern (centre:state share)">${esc(fundingPattern)}</span>` : '';
    return `<span class="proto-badge ${m.cls}" title="${esc(m.title)}">${esc(m.label)}</span>${fund}`;
  }
  function authorityBadge(auth) {
    if (!auth) return '';
    const cls = AUTH_TIER_CLS[auth.tier] || 'au-state';
    // condense "Union (IAS cadre...)" → "Union" for the chip; full detail in tooltip.
    const who = (auth.appointed_by || '').split('(')[0].trim().split(' ')[0] || 'Appointed';
    const tip = `Appointed by: ${auth.appointed_by}\nAnswers to: ${auth.accountable_to}\n${auth.const_basis || ''}`;
    return `<span class="proto-badge ${cls}" title="${esc(tip)}">appt: ${esc(who)}</span>`;
  }

  // District dimensions (language now; crime/economy/politics/geopolitics to follow).
  // Honest: shows sourced facts (state official language) + marks district-level gaps.
  function renderDistrictDimensions(state, district) {
    const dist = LEDGER?.states?.[state]?.districts?.[district];
    const dims = dist?.dimensions;
    if (!dims) return '';
    const rows = [];
    const lang = dims.language;
    if (lang) {
      const official = (lang.state_official || []).join(', ') || '—';
      const dom = lang.dominant_mother_tongue
        ? `${esc(lang.dominant_mother_tongue)}${lang.dominant_pct != null ? ` (${lang.dominant_pct}%)` : ''}`
        : `<span class="dim-gap">district mother-tongue: gap (Census C-16)</span>`;
      rows.push(`
        <div class="dim-row">
          <span class="dim-key">Language</span>
          <span class="dim-val">Official: <b>${esc(official)}</b> · ${dom}
            ${lang.state_official_source ? `<span class="dim-src" title="${esc(lang.state_official_source)}">ⓘ</span>` : ''}</span>
        </div>`);
    }
    const pol = dims.politics;
    if (pol && pol.state_ruling_party) {
      const align = pol.alignment_with_centre || '';
      const alignCls = /aligned with Union/.test(align) ? 'dim-align-yes'
        : /opposition/.test(align) ? 'dim-align-no' : 'dim-align-neutral';
      rows.push(`
        <div class="dim-row">
          <span class="dim-key">Politics</span>
          <span class="dim-val">State govt: <b>${esc(pol.state_ruling_party)}</b>
            <span class="dim-align ${alignCls}" title="Shown to juxtapose with money flow — not a causal claim">${esc(align)}</span>
            · <span class="dim-gap">constituency MP/MLA: gap (ECI)</span></span>
        </div>`);
    }
    const geo = dims.geography;
    if (geo) {
      // HEADLINE: the legal/regulatory zone — "what can be built here". This is the
      // point of the tool (help people understand zoning + the law), so it leads.
      const zone = zoningZone(geo);
      rows.push(`
        <div class="dim-row dim-row--zone">
          <span class="dim-key">Legal zone</span>
          <span class="dim-val">
            <span class="zone-badge" style="--zc:${zone.color}">${esc(zone.label)}</span>
            <div class="zone-legal">${esc(zone.legal)}</div>
          </span>
        </div>`);
      const tags = [];
      if (geo.on_coast) tags.push('<span class="dim-geo-tag dim-geo-coast" title="Coastal Regulation Zone (MoEFCC 2019) restricts near-shore construction — this district touches the sea">coastal · CRZ</span>');
      if (geo.flood_level === 'district-chronic') tags.push('<span class="dim-geo-tag dim-geo-flood" title="Named in CWC/NDMA/state-DMA/Bhuvan Flood Hazard Atlas as repeatedly flooded">flood: chronic</span>');
      else if (geo.flood_level === 'state-flood-prone') tags.push('<span class="dim-geo-tag dim-geo-flood" title="Inherits the state flood-prone flag; not confirmed at district level" style="opacity:0.8">flood: state-level</span>');
      if (geo.terrain) tags.push(`<span class="dim-geo-tag dim-geo-terrain">${esc((geo.terrain || '').replace(/-/g, ' '))}</span>`);
      const rivers = (geo.major_rivers || []).slice(0, 3).join(', ');
      // real per-district stats: elevation (SRTM) + rainfall band (IMD)
      const elev = geo.elevation?.centroid_m;
      const rain = geo.rainfall;
      const stats = [];
      if (elev != null) stats.push(`<span title="District-centroid elevation, open SRTM">elev <b>${elev} m</b></span>`);
      if (rain?.annual_normal_mm != null) stats.push(`<span title="${esc(rain.note || '')}">rain <b>${rain.annual_normal_mm} mm</b></span>`);
      else if (rain?.band) stats.push(`<span title="IMD climate band; precise district mm is a gap (IMD portal)">rain: ${esc(rain.band)} <span class="dim-gap">(mm: gap)</span></span>`);
      rows.push(`
        <div class="dim-row">
          <span class="dim-key">Geography</span>
          <span class="dim-val">${tags.join(' ') || '—'}
            ${rivers ? `· rivers: ${esc(rivers)}` : ''}
            ${stats.length ? `<br><span class="geo-stats">${stats.join(' · ')}</span>` : ''}
            · <span class="dim-gap">district CRZ category / flood ₹ / sewage %: gap</span></span>
        </div>`);
      // Change over the years (open satellite: JRC/Bhuvan/Sentinel — not Google Earth).
      const tl = geo.timeline;
      if (tl && (tl.subject || (tl.points || []).length)) {
        const unitLabel = m => ({
          wetland_area_km2: 'km²', marsh_area_ha: 'ha', dumpyard_area_ha: 'ha dump',
          waterbody_area_ha: 'ha', wetland_area_ha: 'ha',
        }[m] || '');
        const pts = (tl.points || []).map(p => {
          const val = p.value === true ? '<span class="geo-tl-event">⚠ flood</span>'
            : (p.value != null ? `${p.value} <span class="geo-tl-unit">${esc(unitLabel(p.metric))}</span>` : '<span class="dim-gap">fig gap</span>');
          const src = p.source ? `<a class="geo-tl-src" href="${esc(p.source)}" target="_blank" rel="noopener" title="${esc(p.note || '')}">ⓘ</a>` : '';
          return `<span class="geo-tl-pt"><b>${esc(String(p.year))}</b> ${val}${src}</span>`;
        }).join('<span class="geo-tl-arrow">→</span>');
        rows.push(`
        <div class="dim-row dim-row--note">
          <span class="dim-key">Over time</span>
          <span class="dim-val">${tl.subject ? `<span class="geo-tl-subj">${esc(tl.subject)}</span><br>` : ''}${pts}
            ${tl.range_note ? `<br><span class="geo-tl-range">${esc(tl.range_note)}</span>` : ''}
            <br><span class="dim-gap">open satellite — JRC Global Surface Water / ISRO Bhuvan / Sentinel; not Google Earth (licensed)</span></span>
        </div>`);
      }
      // Illegal encroachment — documented NGT/court cases only; gap otherwise.
      const enc = geo.encroachment;
      if (enc && (enc.documented != null || (enc.cases || []).length)) {
        const cases = (enc.cases || []);
        const body = cases.length ? cases.map(c => `
          <div class="geo-enc-case">
            <span class="geo-enc-type">${esc(c.type || 'encroachment')}</span>${c.water_body ? ` · <b>${esc(c.water_body)}</b>` : ''}
            ${c.status ? `<span class="geo-enc-status">${esc(c.status)}</span>` : ''}
            ${c.order_ref ? `<div class="geo-enc-ref">${esc(c.order_ref)}${c.source ? ` <a href="${esc(c.source)}" target="_blank" rel="noopener">↗</a>` : ''}</div>` : ''}
          </div>`).join('') : '<span class="dim-gap">documented cases: gap (NGT/court/CAG)</span>';
        rows.push(`
        <div class="dim-row dim-row--note">
          <span class="dim-key">Encroachment</span>
          <span class="dim-val">${body}</span>
        </div>`);
      }
      // (1) Paleochannel — the river's natural historic bed ("you built on the old bed").
      const pal = geo.paleochannel;
      if (pal && pal.documented) {
        const s1 = pal.source ? `<a href="${esc(pal.source)}" target="_blank" rel="noopener">↗</a>` : '';
        rows.push(`
        <div class="dim-row dim-row--note">
          <span class="dim-key">River's old path</span>
          <span class="dim-val"><span class="geo-paleo-river">${esc(pal.river || '')}</span> ${s1}
            <div class="geo-sub">${esc(pal.old_course || '')}</div>
            ${pal.why_it_floods ? `<div class="geo-why">⚠ ${esc(pal.why_it_floods)}</div>` : ''}
            <span class="dim-gap">palaeochannel — ISRO/Bhuvan/CGWB/GSI; exact channel polygon: gap</span></span>
        </div>`);
      }
      // (2) Official "unsafe for habitation" / no-development zone.
      const uz = geo.unsafe_zone;
      if (uz && uz.documented) {
        const s1 = uz.source ? `<a href="${esc(uz.source)}" target="_blank" rel="noopener">↗</a>` : '';
        rows.push(`
        <div class="dim-row dim-row--note">
          <span class="dim-key">Unsafe zone</span>
          <span class="dim-val"><span class="geo-unsafe-kind">${esc(uz.kind || 'no-development')}</span> · <b>${esc(uz.zone || '')}</b> ${s1}
            ${uz.authority ? `<div class="geo-enc-status">${esc(uz.authority)}</div>` : ''}
            <div class="geo-sub">${esc(uz.basis || '')}</div>
            <span class="dim-gap">official 'do-not-build' line; district CZMP category: gap</span></span>
        </div>`);
      }
      // (3) Monsoon / seasonal inundation — the recurring seasonal flood pattern.
      const mi = geo.monsoon_inundation;
      if (mi && mi.documented) {
        const s1 = mi.source ? `<a href="${esc(mi.source)}" target="_blank" rel="noopener">↗</a>` : '';
        rows.push(`
        <div class="dim-row dim-row--note">
          <span class="dim-key">Monsoon flood</span>
          <span class="dim-val"><span class="geo-monsoon-season">${esc(mi.season || '')}</span> ${s1}
            <div class="geo-sub">${esc(mi.pattern || '')}</div>
            <span class="dim-gap">seasonal extent — ISRO-Bhuvan + IMD; precise area (ha): gap</span></span>
        </div>`);
      }
      // (4) Encroachment ZONE — the delineated boundary (not just the NGT case).
      const ez = geo.encroachment_zone;
      if (ez && ez.documented) {
        const s1 = ez.source ? `<a href="${esc(ez.source)}" target="_blank" rel="noopener">↗</a>` : '';
        rows.push(`
        <div class="dim-row dim-row--note">
          <span class="dim-key">Encroached zone</span>
          <span class="dim-val"><b>${esc(ez.zone_type || '')}</b> ${s1}
            <div class="geo-sub">${esc(ez.delineation || '')}</div>
            ${ez.status ? `<div class="geo-enc-status">${esc(ez.status)}</div>` : ''}
            <span class="dim-gap">boundary official; open GIS polygon geometry: gap</span></span>
        </div>`);
      }
      // Vulnerability signal-stack — WHICH sourced risk signals overlap here.
      if (typeof Vuln !== 'undefined') {
        const vs = Vuln.signals(geo);
        if (vs.count) {
          const max = vs.max || 4;
          const dots = '●'.repeat(vs.count) + '○'.repeat(Math.max(0, max - vs.count));
          rows.push(`
          <div class="dim-row dim-row--note">
            <span class="dim-key">Vulnerability</span>
            <span class="dim-val"><span style="color:${Vuln.color(vs.count)};font-family:var(--font-mono)">${dots}</span> ${vs.count}/${max} risk signals
              <div class="dim-hinder">${vs.active.map(k => esc(Vuln.LABELS[k])).join(' · ')} <span class="dim-gap">— overlapping sourced signals, not a score</span></div></span>
          </div>`);
        }
      }
      if (geo.hinders_dev_note) {
        rows.push(`
        <div class="dim-row dim-row--note">
          <span class="dim-key"></span>
          <span class="dim-val dim-hinder">${esc(geo.hinders_dev_note)}</span>
        </div>`);
      }
    }
    // HEALTH (NFHS-5, state-level) — the "health" half of wealth-and-health.
    const health = dims.health;
    if (health) {
      if (health.imr != null) {
        const stats = [
          `IMR <b>${health.imr}</b><span class="dim-unit">/1k</span>`,
          health.stunting_u5_pct != null ? `stunting <b>${health.stunting_u5_pct}%</b>` : '',
          health.institutional_births_pct != null ? `inst. births <b>${health.institutional_births_pct}%</b>` : '',
          health.full_immunisation_pct != null ? `immunised <b>${health.full_immunisation_pct}%</b>` : '',
        ].filter(Boolean).join(' · ');
        rows.push(`
        <div class="dim-row">
          <span class="dim-key">Health</span>
          <span class="dim-val">${stats}
            <br><span class="dim-gap">NFHS-5 (2019-21), state-level · per-district: gap</span></span>
        </div>`);
      } else {
        // Health block exists but no figure — show it as an explicit gap, not silence.
        rows.push(`
        <div class="dim-row">
          <span class="dim-key">Health</span>
          <span class="dim-val dim-val--gap">no NFHS-5 figure for this state/UT
            <br><span class="dim-gap">sourced-or-gap: not fabricated</span></span>
        </div>`);
      }
    }
    // ECONOMY (RBI, state-level) — the "wealth" half.
    const econ = dims.economy;
    if (econ) {
      if (econ.percapita_nsdp_inr != null) {
        const cr = econ.percapita_nsdp_inr;
        const tier = econ.income_tier ? `<span class="dim-tier dim-tier--${esc(econ.income_tier)}">${esc(econ.income_tier.replace(/-/g, ' '))}</span>` : '';
        rows.push(`
        <div class="dim-row">
          <span class="dim-key">Economy</span>
          <span class="dim-val">per-capita income <b>₹${cr.toLocaleString('en-IN')}</b>/yr ${tier}
            <br><span class="dim-gap">RBI Handbook (NSDP), state-level · per-district: gap</span></span>
        </div>`);
      } else {
        // Small UTs (Lakshadweep, Daman & Diu, D&NH) have no published NSDP series —
        // show the dimension as an explicit gap rather than omitting it silently.
        rows.push(`
        <div class="dim-row">
          <span class="dim-key">Economy</span>
          <span class="dim-val dim-val--gap">no official per-capita NSDP series for this UT
            <br><span class="dim-gap">RBI Handbook has no figure · sourced-or-gap, not fabricated</span></span>
        </div>`);
      }
    }
    // VEHICLES / RTO — the number-plate + Regional Transport Office segment.
    const veh = dims.vehicles;
    if (veh && (veh.rto_codes || veh.plate_prefix)) {
      if (veh.rto_codes && veh.rto_codes.length) {
        const codes = veh.rto_codes.map(c => `<span class="dim-plate">${esc(c)}</span>`).join(' ');
        const count = veh.registered_vehicles != null
          ? ` · <b>${veh.registered_vehicles.toLocaleString('en-IN')}</b> vehicles`
          : '';
        rows.push(`
        <div class="dim-row">
          <span class="dim-key">Vehicles</span>
          <span class="dim-val">${codes}${count}
            ${veh.rto_office ? `<br><span class="dim-hinder">${esc(veh.rto_office)}</span>` : ''}
            <br><span class="dim-gap">RTO code(s) · MoRTH/Vahan${veh.registered_vehicles == null ? ' · count: gap' : ''}</span></span>
        </div>`);
      } else {
        // Fallback: only the state plate prefix is known for this district.
        rows.push(`
        <div class="dim-row">
          <span class="dim-key">Vehicles</span>
          <span class="dim-val">plates start <span class="dim-plate">${esc(veh.plate_prefix)}</span>
            <br><span class="dim-gap">state prefix · district RTO code + count: gap</span></span>
        </div>`);
      }
    }
    // AVIATION — only shown when the district actually has an airport (a false is
    // the norm and would be noise on ~558 districts).
    const av = dims.aviation;
    if (av && av.has_airport) {
      const catCls = av.category ? ` dim-air--${esc(av.category)}` : '';
      const pax = av.passengers_annual != null
        ? ` · <b>${av.passengers_annual.toLocaleString('en-IN')}</b> pax/yr` : '';
      rows.push(`
        <div class="dim-row">
          <span class="dim-key">Aviation</span>
          <span class="dim-val">${esc(av.airport_name || 'airport')}
            ${av.category ? `<span class="dim-air${catCls}">${esc(av.category)}</span>` : ''}${pax}
            <br><span class="dim-gap">AAI/DGCA${av.passengers_annual == null ? ' · traffic: gap' : ''}</span></span>
        </div>`);
    }
    // HOUSING — shown when an official index (RBI HPI / NHB RESIDEX) tracks the
    // district's city; the value itself is a gap (no fabricated price).
    const hou = dims.housing;
    if (hou && hou.tracked) {
      const idx = (hou.indices || []).map(i => `<span class="dim-tier">${esc(i)}</span>`).join(' ');
      const val = hou.index_value != null ? ` · index <b>${esc(String(hou.index_value))}</b>` : '';
      rows.push(`
        <div class="dim-row">
          <span class="dim-key">Housing</span>
          <span class="dim-val">tracked by ${idx}${val}
            <br><span class="dim-gap">official house-price index (city-level)${hou.index_value == null ? ' · value: gap' : ''}</span></span>
        </div>`);
    }
    if (!rows.length) return '';
    return `
      <div class="india-detail-section-title">District dimensions</div>
      <div class="dim-list">${rows.join('')}</div>
      <p class="india-caveat" style="margin-top:0.4rem">Dimensions are shown side-by-side with the money flow so patterns are visible; correlation is not causation, and no "bias score" is computed. State-level values are labelled as such.</p>`;
  }

  // Count location news for a district (district-specific + its state), for coverage.
  function newsCountFor(state, district) {
    if (!NEWS_FEED) return 0;
    let n = (newsByDistrict.get(state + '|' + district) || []).length;
    if (!n) n = (newsByState.get(state) || []).length ? 1 : 0;   // state-level news = partial credit
    return n;
  }

  // Source-coverage meter — makes the sourced-or-gap rule VISIBLE: how much of this
  // district is actually pinned to sources vs. still a gap (a data-density read, not
  // a quality judgement). Expandable to show the component breakdown.
  function renderCoverageMeter(state, district) {
    if (typeof Coverage === 'undefined') return '';
    const dist = LEDGER?.states?.[state]?.districts?.[district];
    if (!dist) return '';
    const cov = Coverage.score(dist, { newsCount: newsCountFor(state, district) });
    const col = Coverage.color(cov.pct);
    const bars = cov.components.map(c => {
      const on = c.got, tot = c.max;
      const pips = Array.from({ length: tot }, (_, i) => `<span class="cov-pip ${i < on ? 'on' : ''}"></span>`).join('');
      return `<div class="cov-comp"><span class="cov-comp-lbl">${esc(c.label)}</span><span class="cov-pips">${pips}</span><span class="cov-comp-note">${esc(c.note)}</span></div>`;
    }).join('');
    return `
      <div class="cov-meter" title="How much of this district is pinned to sources vs. a gap — a data-density read, not a quality score.">
        <div class="cov-top">
          <span class="cov-badge" style="--cc:${col}">${cov.pct}% sourced · ${esc(cov.level)}</span>
          <div class="cov-bar"><div class="cov-fill" style="width:${cov.pct}%;background:${col}"></div></div>
          <button class="cov-toggle" id="cov-toggle" aria-expanded="false" title="Show what's sourced vs. gap">▾</button>
        </div>
        <div class="cov-detail" id="cov-detail" hidden>${bars}
          <div class="cov-foot">Counts what's positively SOURCED (not gap length — deep districts track more explicit gaps). Sourced-or-gap throughout.</div>
        </div>
      </div>`;
  }

  // Index the full news feed by location once, for the per-place news panel.
  function indexNewsByLocation(feed) {
    newsByState.clear(); newsByDistrict.clear();
    for (const n of (feed.news_items || [])) {
      const g = n.geo || {};
      if (!g.state) continue;
      const sArr = newsByState.get(g.state) || []; sArr.push(n); newsByState.set(g.state, sArr);
      if (g.district) {
        const k = g.state + '|' + g.district;
        const dArr = newsByDistrict.get(k) || []; dArr.push(n); newsByDistrict.set(k, dArr);
      }
    }
    const byDate = (a, b) => String(b.published_at || b.ingested_at || '').localeCompare(String(a.published_at || a.ingested_at || ''));
    for (const arr of newsByState.values()) arr.sort(byDate);
    for (const arr of newsByDistrict.values()) arr.sort(byDate);
  }

  // Outlet bias/lean → a small colour for the chip (third-party aggregation, labelled).
  function leanClass(lean) {
    const l = (lean || '').toLowerCase();
    if (/left/.test(l)) return 'lean-left';
    if (/right/.test(l)) return 'lean-right';
    if (/centre|center/.test(l)) return 'lean-centre';
    return 'lean-unknown';
  }
  function prettyDate(s) {
    const d = s ? new Date(s) : null;
    return (d && !isNaN(d)) ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  }

  // Location news panel — recent items for this place (district-specific first, then
  // its state). Legal-safe: outlet + lean + date + LINK only, never republished text.
  function renderLocationNews(state, district) {
    if (!NEWS_FEED) return '';
    let items = [];
    if (district) items = (newsByDistrict.get(state + '|' + district) || []).slice();
    // top up with state-level items (dedup by id)
    const seen = new Set(items.map(i => i.id));
    for (const it of (newsByState.get(state) || [])) { if (!seen.has(it.id)) { items.push(it); seen.add(it.id); } }
    if (!items.length) return '';
    const show = items.slice(0, 8);
    const rows = show.map(n => {
      const lean = n.outlet_lean ? `<span class="ln-lean ${leanClass(n.outlet_lean)}" title="Third-party media-bias classification, not our judgement">${esc(n.outlet_lean)}</span>` : '';
      const d = prettyDate(n.published_at || n.ingested_at);
      return `<a class="ln-item" href="${esc(n.url)}" target="_blank" rel="noopener">
        <div class="ln-head"><span class="ln-outlet">${esc(n.outlet || 'source')}</span>${lean}${d ? `<span class="ln-date">${esc(d)}</span>` : ''}</div>
        <div class="ln-title">${esc(n.headline || '')}</div>
      </a>`;
    }).join('');
    const scope = district ? `${esc(district)} + ${esc(state)}` : esc(state);
    return `
      <div class="india-detail-section-title">📰 In the news · ${scope} <span class="ln-count">${items.length}</span></div>
      <div class="ln-list">${rows}</div>
      ${items.length > show.length ? `<div class="ln-more">+${items.length - show.length} more — headlines link out to the source (bias labels are third-party).</div>` : ''}`;
  }

  // Map-as-hub: a district's story-chain timeline + approved news, inline in the panel.
  // Legal-safe by construction: news shows link + snippet + attribution + confidence
  // label only — never republished text, never an unsourced claim.
  function renderDistrictEvents(state, district) {
    if (!EVENTS) return '';
    const chains = (EVENTS.story_chains || []).filter(c => c.geo?.state === state && c.geo?.district === district);
    const allEv = EVENTS.fiscal_events || [];
    const newsItems = (NEWS?.news_items || []);
    if (!chains.length) return '';

    const stageLabel = s => (s || '').replace(/_/g, ' ');
    const confCls = c => ({ documented: 'pos', reported: 'warm', alleged: 'bad' }[c] || 'warm');

    const chainHtml = chains.map(c => {
      const evs = (c.event_ids || []).map(id => allEv.find(e => e.id === id)).filter(Boolean)
        .sort((a, b) => (a.chain_seq || 0) - (b.chain_seq || 0));
      const rail = evs.map(e => {
        const corr = (e.corroborating_news || []).map(id => newsItems.find(n => n.id === id)).filter(Boolean);
        const newsHtml = corr.length ? `<div class="ev-news">${corr.map(n =>
          `<a class="ev-news-item" href="${esc(n.url)}" target="_blank" rel="noopener" title="${esc(n.outlet)} · ${esc(n.outlet_lean || 'unknown')}">📰 ${esc(n.outlet)}<span class="ev-news-snip">${esc((n.snippet || '').slice(0, 80))}</span></a>`).join('')}</div>` : '';
        const amt = e.amount_cr != null ? `<span class="ev-amt">₹${Number(e.amount_cr).toLocaleString('en-IN')} cr</span>` : (e.figure_gap ? `<span class="ev-gap">figure gap</span>` : '');
        const ps = e.primary_source;
        return `
          <div class="dev-ev dev-stage--${esc(e.stage)}">
            <div class="dev-ev-top"><span class="dev-date">${esc(e.date || '')}</span><span class="dev-stage">${esc(stageLabel(e.stage))}</span></div>
            <div class="dev-title">${esc(e.title)}</div>
            <div class="dev-foot">${amt}<span class="dev-conf dev-conf--${confCls(e.confidence)}">${esc(e.confidence)}</span>${ps && ps.url ? srcFootnote(ps.url, ps.source_tier) : ''}</div>
            ${newsHtml}
          </div>`;
      }).join('');
      return `
        <div class="dev-chain">
          <div class="dev-chain-head"><span class="dev-chain-status dev-chain-status--${esc(c.status)}">${esc(c.status)}</span> ${esc(c.title)}</div>
          ${c.one_line ? `<div class="dev-chain-line">${esc(c.one_line)}</div>` : ''}
          <div class="dev-rail">${rail}</div>
        </div>`;
    }).join('');

    return `
      <div class="india-detail-section-title">Money over time — story chains <a class="dev-more" href="timeline.html">full timeline ↗</a></div>
      ${chainHtml}`;
  }

  function renderLedgerSection(state, district) {
    const L = ledgerForDistrict(state, district);
    if (!L) return '';

    // Baseline (skeleton) district: show structure honestly, not broken empty charts.
    const isBaseline = L.baseline === true &&
      !(L.ledger || []).length && !(L.plants || []).length &&
      !(L.system_notes || []).length &&
      !Object.values(L.roster || {}).some(o => o && o.name);
    if (isBaseline) {
      const adminLabel = L.admin_model && L.admin_model !== 'standard'
        ? ` · <span style="color:oklch(0.78 0.16 70)">${esc(L.admin_model)} admin model</span>` : '';

      // Applicable central schemes — the structural protocol layer, present for every
      // district even before money figures are sourced. Amounts intentionally null.
      const applic = L.applicable_schemes || [];
      const applicHtml = applic.length ? `
        <div class="india-detail-section-title" style="margin-top:0.8rem">Central schemes that reach this district</div>
        <p class="ledger-baseline-note">Structural — these flow to every district of this type. Amounts &amp; utilisation are <b>not shown because no district-level PDF is sourced yet</b> (project rule: PDF-cited or it's a gap).</p>
        <div class="ledger-list">
          ${applic.map(a => `
            <div class="ledger-row ledger-row--applic">
              <div class="ledger-row-head">
                <span class="ledger-scheme">${esc(a.scheme)}</span>
                ${a.full_name ? `<span class="ledger-fy" title="${esc(a.full_name)}">${esc(a.full_name)}</span>` : ''}
              </div>
              <div class="ledger-proto">${constBadge(a.const_list, a.funding_pattern)}</div>
              ${a.fiscal_route ? `<div class="ledger-channel">route: ${esc(a.fiscal_route)} ${srcFootnote(a.source, a.source_tier)}</div>` : ''}
              <div class="ledger-row-body"><span class="ledger-cell ledger-cell--gap"><b>In</b> — <span class="proto-gap">figure gap</span></span></div>
            </div>`).join('')}
        </div>` : '';

      // Appointing-authority chain — present for every district (posts exist even
      // without named officeholders). Shows the Union-vs-State-vs-elected protocol.
      const authPosts = Object.values(L.roster || {}).filter(o => o && o.authority);
      const authHtml = authPosts.length ? `
        <div class="india-detail-section-title" style="margin-top:0.8rem">Who is accountable — and who appoints them</div>
        <div class="roster-list">
          ${authPosts.map(o => `<div class="roster-row"><span class="roster-name roster-name--vacant">${esc(o.post)}</span>${authorityBadge(o.authority)}<span class="roster-namegap">name not sourced</span></div>`).join('')}
        </div>` : '';

      return `
        <div class="india-detail-section-title">Money flow &amp; accountability${adminLabel}</div>
        <div class="ledger-baseline">
          <div class="ledger-baseline-eyebrow">Baseline coverage — structure mapped, figures not yet sourced</div>
          <p>Classified as a <b>${esc(L.admin_model || 'standard')}</b> administration. The
          governance <b>structure</b> below — which schemes apply, their constitutional basis and
          funding split, and who appoints each responsible officer — is mapped for every district.
          The <b>money figures and officer names</b> are not fabricated; they fill in only with a
          government PDF.</p>
        </div>
        ${applicHtml}
        ${authHtml}
        <details class="ledger-gaps"><summary>${(L._gaps || []).length} fields awaiting sourcing</summary><ul>${(L._gaps || []).map(g => `<li>${esc(g)}</li>`).join('')}</ul></details>`;
    }

    // System function/dysfunction notes — the "how the system works" layer.
    const notesHtml = (L.system_notes || []).map(n => `
      <div class="ledger-note ledger-note--${esc(n.kind || 'note')}">
        <span class="ledger-note-tag">${esc((n.kind || 'note').replace(/_/g, ' '))}</span>
        ${esc(n.note)} ${srcFootnote(n.source, n.source_tier)}
      </div>`).join('');

    // Money-flow ledger rows — the timeline of money in vs what happened.
    const ledgerHtml = (L.ledger || []).map(r => {
      const w = r.what_happened || {};
      const util = w.utilisation_pct != null ? `${w.utilisation_pct}%` : '—';
      const done = (w.works_completed != null && w.works_recommended != null)
        ? `${w.works_completed}/${w.works_recommended} works` : '';
      const flag = w.audit_flag ? `<span class="ledger-flag ledger-flag--bad">${esc(w.audit_flag.replace(/_/g, ' '))}</span>` : '';
      return `
        <div class="ledger-row">
          <div class="ledger-row-head">
            <span class="ledger-scheme">${esc(r.scheme)}</span>
            <span class="ledger-fy">${esc(r.fy)}</span>
            ${flag}
          </div>
          ${r.protocol ? `<div class="ledger-proto">${constBadge(r.protocol.const_list, r.protocol.funding_pattern)}</div>` : ''}
          <div class="ledger-row-body">
            <span class="ledger-cell"><b>In</b> ${fmtCr(r.money_in_cr)}</span>
            <span class="ledger-cell"><b>Spent</b> ${fmtCr(w.spent_cr)}</span>
            <span class="ledger-cell"><b>Util</b> ${util}</span>
            ${done ? `<span class="ledger-cell"><b>Done</b> ${esc(done)}</span>` : ''}
          </div>
          <div class="ledger-channel">via ${esc(r.through_dept || '—')} ${srcFootnote(r.source, r.source_tier)}</div>
          ${w.state_context ? `<div class="ledger-statectx"><span class="ledger-statectx-tag">state context</span> ${esc(w.state_context.basis)}</div>` : ''}
          ${w.notes ? `<div class="ledger-rownote">${esc(w.notes)}</div>` : ''}
        </div>`;
    }).join('');

    // Roster — who is responsible — with cost-to-government joined from pay-scales.json.
    const roster = L.roster || {};
    const rosterRows = Object.values(roster).filter(o => o && o.name).map(o => {
      const pay = payForPost(o.post) || payForPost((o.post || '').split(' (')[0]);
      const cost = pay?.annual_cost_to_govt_est
        ? `<span class="roster-cost" title="Est. annual cost-to-government for this post (pay-scales.json)">~₹${(pay.annual_cost_to_govt_est / 1e7).toFixed(2)} cr/yr</span>` : '';
      return `<div class="roster-row"><span class="roster-name">${esc(o.name)}</span><span class="roster-post">${esc(o.post)}</span>${authorityBadge(o.authority)}${cost}${srcFootnote(o.source, o.source_tier)}</div>`;
    }).join('');

    const mps = (L.legislature?.lok_sabha || []).filter(m => m.name).map(m =>
      `<div class="roster-row"><span class="roster-name">${esc(m.name)}</span><span class="roster-post">MP · ${esc(m.constituency || '')} (${esc(m.party || '')})</span>${srcFootnote(m.source, m.source_tier)}</div>`
    ).join('');

    const gapsHtml = (L._gaps && L._gaps.length)
      ? `<details class="ledger-gaps"><summary>${L._gaps.length} known data gaps (recorded, not estimated)</summary><ul>${L._gaps.map(g => `<li>${esc(g)}</li>`).join('')}</ul></details>`
      : '';

    // Industrial plants — the district's economic base (jobs / tax origin).
    const plants = L.plants || [];
    const heritageHtml = renderHeritageTimeline(plants, district);
    const plantsHtml = plants.length ? `
      ${heritageHtml}
      <div class="india-detail-section-title" style="margin-top:0.8rem">Industrial base — major plants</div>
      <div class="plants-list">
        ${plants.map(p => `
          <div class="plant-row">
            <div class="plant-head">
              <span class="plant-name">${esc(p.name)}</span>
              ${p.founded ? `<span class="plant-founded">est. ${p.founded}</span>` : ''}
              <span class="plant-sector">${esc(p.sector || '')}</span>
            </div>
            <div class="plant-meta">
              <span class="plant-tag">${esc(p.ownership || '')}</span>
              ${p.capacity ? `<span class="plant-tag plant-tag--cap">${esc(p.capacity)}</span>` : ''}
              ${p.site_acres ? `<span class="plant-tag">${p.site_acres.toLocaleString('en-IN')} acres</span>` : ''}
              ${srcFootnote(p.source, p.source_tier)}
            </div>
            ${p.significance ? `<div class="plant-note">${esc(p.significance)}</div>` : ''}
            ${p.lineage ? `<div class="plant-lineage">
              ${p.control_type ? `<span class="plant-control plant-control--${esc(p.control_type)}">${esc(controlLabel(p.control_type))}</span>` : ''}
              ${p.founder ? `<span class="plant-founder-by">founded by ${esc(p.founder)}</span>` : ''}
              <span class="plant-lineage-chain">${esc(p.lineage)}</span>
              ${srcFootnote(p.lineage_source, p.lineage_source_tier)}
            </div>` : ''}
            ${p.employment_note ? `<div class="plant-note plant-note--emp">👷 ${esc(p.employment_note)}</div>` : ''}
          </div>`).join('')}
      </div>
      ${L.plants_note ? `<p class="india-caveat">${esc(L.plants_note)}</p>` : ''}
      ${plants.some(p => p.control_type === 'indian_managing_agency' || p.control_type === 'british_colonial_parent') && LEDGER?._meta?.managing_agency_note
        ? `<p class="india-caveat plant-agency-note">📜 ${esc(LEDGER._meta.managing_agency_note)}</p>` : ''}` : '';

    // Interactive charts (drawn after insertion via bindLedgerCharts).
    const hasGrant = (L.ledger || []).some(r => r.stream === 'intergovernmental_grant' && r.money_in_cr);
    const hasDepts = (L.departments || []).some(d => d.alloc_cr);
    const hasSchemeBars = (L.ledger || []).some(r => r.what_happened && (r.what_happened.works_recommended != null || r.what_happened.spent_cr != null));
    const chartsHtml = `
      ${hasGrant ? `<div class="india-detail-section-title">Where the money comes from</div>
        <div class="ledger-chart" id="chart-donut"></div>` : ''}
      ${hasDepts ? `<div class="india-detail-section-title">Where it flows — by department</div>
        <div class="ledger-chart" id="chart-sankey"></div>` : ''}
      ${hasSchemeBars ? `<div class="india-detail-section-title">Allocated → spent → completed</div>
        <div class="ledger-chart" id="chart-bars"></div>` : ''}
      <div class="india-detail-section-title">Money in vs utilised, over time</div>
      <div class="ledger-chart" id="chart-timeline"></div>`;

    return `
      <div class="india-detail-section-title">Money flow &amp; accountability${L.admin_model && L.admin_model !== 'standard' ? ` <span style="font-family:var(--font-mono);font-size:10px;color:oklch(0.78 0.16 70);text-transform:none">· ${esc(L.admin_model)} admin model</span>` : ''}</div>
      ${notesHtml}
      ${chartsHtml}
      ${ledgerHtml ? `<div class="india-detail-section-title" style="margin-top:0.8rem">Ledger detail</div><div class="ledger-list">${ledgerHtml}</div>` : ''}
      ${(rosterRows || mps) ? `<div class="india-detail-section-title" style="margin-top:0.8rem">Who is responsible</div><div class="roster-list">${rosterRows}${mps}</div>` : ''}
      ${plantsHtml}
      ${gapsHtml}
      <p class="india-caveat">Figures are PDF-cited where ⚠ is absent; ⚠ marks tier-3/4 (Wikipedia/news) sources pending upgrade to a government PDF. Salary shown is the per-post cost-to-government estimate, not a person's pay.</p>`;
  }

  /* ───────── Interactive ledger charts (inline SVG, no deps) ───────── */
  let _ledgerTip = null;
  function ledgerTip() {
    if (!_ledgerTip) {
      _ledgerTip = document.createElement('div');
      _ledgerTip.className = 'ledger-tip';
      _ledgerTip.style.display = 'none';
      document.body.appendChild(_ledgerTip);
    }
    return _ledgerTip;
  }
  function showTip(html, evt) {
    const t = ledgerTip();
    t.innerHTML = html;
    t.style.display = 'block';
    const pad = 14;
    let x = evt.clientX + pad, y = evt.clientY + pad;
    const r = t.getBoundingClientRect();
    if (x + r.width > window.innerWidth) x = evt.clientX - r.width - pad;
    if (y + r.height > window.innerHeight) y = evt.clientY - r.height - pad;
    t.style.left = x + 'px'; t.style.top = y + 'px';
  }
  function hideTip() { if (_ledgerTip) _ledgerTip.style.display = 'none'; }
  const crLabel = v => v >= 1000 ? `₹${(v / 1000).toFixed(2)}k cr` : `₹${v.toFixed(v < 10 ? 2 : 0)} cr`;

  function bindLedgerCharts(detail, state, district) {
    const L = ledgerForDistrict(state, district);
    if (!L) return;
    drawDonut(detail.querySelector('#chart-donut'), L);
    drawSankey(detail.querySelector('#chart-sankey'), L);
    drawBars(detail.querySelector('#chart-bars'), L);
    drawTimeline(detail.querySelector('#chart-timeline'), L);
  }

  // (1) Grant-dependence donut: own-source vs govt grant.
  function drawDonut(el, L) {
    if (!el) return;
    const grantRow = (L.ledger || []).find(r => r.stream === 'intergovernmental_grant' && r.money_in_cr);
    if (!grantRow) { el.remove(); return; }
    const grant = grantRow.money_in_cr;
    const own = grantRow.what_happened?.own_source_revenue_cr;
    const total = grantRow.what_happened?.total_receipt_cr || (own != null ? grant + own : grant);
    const segs = [
      { label: 'Govt grant (Central+State)', val: grant, color: 'oklch(0.78 0.16 70)' },
      ...(own != null ? [{ label: 'Own-source revenue', val: own, color: 'oklch(0.7 0.17 162)' }] : [])
    ];
    const sum = segs.reduce((a, s) => a + s.val, 0);
    const W = 320, H = 130, cx = 70, cy = 65, rO = 52, rI = 30;
    let a0 = -Math.PI / 2, paths = '';
    segs.forEach((s, i) => {
      const a1 = a0 + (s.val / sum) * Math.PI * 2;
      const large = (a1 - a0) > Math.PI ? 1 : 0;
      const p = (r, a) => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
      paths += `<path d="M ${p(rI, a0)} L ${p(rO, a0)} A ${rO} ${rO} 0 ${large} 1 ${p(rO, a1)} L ${p(rI, a1)} A ${rI} ${rI} 0 ${large} 0 ${p(rI, a0)} Z"
        fill="${s.color}" stroke="oklch(0.145 0 0)" stroke-width="1.5" class="donut-seg" data-i="${i}" style="cursor:pointer;transition:opacity .15s"/>`;
      a0 = a1;
    });
    const grantPct = Math.round(grant / sum * 100);
    const legend = segs.map((s, i) => `<div class="chart-legend-row" data-i="${i}"><span class="sw" style="background:${s.color}"></span>${esc(s.label)} · <b>${crLabel(s.val)}</b> (${Math.round(s.val / sum * 100)}%)</div>`).join('');
    el.innerHTML = `<div style="display:flex;gap:0.4rem;align-items:center">
      <svg viewBox="0 0 ${W} ${H}" style="width:140px;flex:0 0 140px">${paths}
        <text x="${cx}" y="${cy - 2}" text-anchor="middle" fill="var(--foreground)" font-family="ui-monospace,monospace" font-size="15" font-weight="700">${grantPct}%</text>
        <text x="${cx}" y="${cy + 11}" text-anchor="middle" fill="oklch(0.6 0 0)" font-family="ui-monospace,monospace" font-size="7">grant-funded</text>
      </svg>
      <div style="flex:1">${legend}<div class="chart-note">Total receipts ${crLabel(total)} · ${grantPct}% flows down from higher govts</div></div></div>`;
    el.querySelectorAll('.donut-seg').forEach(seg => {
      const s = segs[+seg.dataset.i];
      seg.addEventListener('mousemove', e => { seg.style.opacity = '0.8'; showTip(`<b>${esc(s.label)}</b><br>${crLabel(s.val)} · ${Math.round(s.val / sum * 100)}% of receipts`, e); });
      seg.addEventListener('mouseleave', () => { seg.style.opacity = '1'; hideTip(); });
    });
  }

  // (2) Department flow — horizontal bars (a readable Sankey-style "where it goes").
  function drawSankey(el, L) {
    if (!el) return;
    const deps = (L.departments || []).filter(d => d.alloc_cr).sort((a, b) => b.alloc_cr - a.alloc_cr);
    if (!deps.length) { el.remove(); return; }
    const max = deps[0].alloc_cr;
    const total = deps.reduce((a, d) => a + d.alloc_cr, 0);
    const rowH = 22, W = 320, labelW = 130, barW = W - labelW - 50;
    let svg = '';
    deps.forEach((d, i) => {
      const y = i * rowH + 4;
      const w = Math.max(2, (d.alloc_cr / max) * barW);
      const hasScheme = d.schemes && d.schemes.length;
      const color = hasScheme ? 'oklch(0.78 0.16 70)' : 'oklch(0.55 0.05 250)';
      svg += `<text x="${labelW - 6}" y="${y + 13}" text-anchor="end" fill="var(--foreground)" font-family="ui-monospace,monospace" font-size="9">${esc(d.dept.length > 20 ? d.dept.slice(0, 19) + '…' : d.dept)}</text>`;
      svg += `<rect x="${labelW}" y="${y + 3}" width="${w}" height="${rowH - 9}" rx="2" fill="${color}" class="dep-bar" data-i="${i}" style="cursor:pointer;transition:opacity .15s"/>`;
      svg += `<text x="${labelW + w + 5}" y="${y + 13}" fill="oklch(0.7 0 0)" font-family="ui-monospace,monospace" font-size="8">${Math.round(d.alloc_cr)}</text>`;
    });
    const H = deps.length * rowH + 8;
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="width:100%">${svg}</svg>
      <div class="chart-note">${deps.length} departments · total ₹${Math.round(total)} cr (KMC 2024-25) · <span style="color:oklch(0.78 0.16 70)">▮</span> carries a named central/state scheme</div>`;
    el.querySelectorAll('.dep-bar').forEach(bar => {
      const d = deps[+bar.dataset.i];
      bar.addEventListener('mousemove', e => { bar.style.opacity = '0.8'; showTip(`<b>${esc(d.dept)}</b><br>${crLabel(d.alloc_cr)} · ${Math.round(d.alloc_cr / total * 100)}% of dept spend${d.schemes && d.schemes.length ? `<br>schemes: ${esc(d.schemes.join(', '))}` : ''}`, e); });
      bar.addEventListener('mouseleave', () => { bar.style.opacity = '1'; hideTip(); });
    });
  }

  // (3) Allocated → spent → completed grouped bars per scheme.
  function drawBars(el, L) {
    if (!el) return;
    const rows = (L.ledger || []).filter(r => r.what_happened && (r.what_happened.works_recommended != null || r.what_happened.spent_cr != null));
    if (!rows.length) { el.remove(); return; }
    const W = 320, padL = 8, padR = 8, padB = 28, groupGap = 14;
    const groupW = (W - padL - padR - groupGap * (rows.length - 1)) / rows.length;
    const H = 130, top = 8, plotH = H - top - padB;
    let svg = '';
    rows.forEach((r, gi) => {
      const w = r.what_happened;
      const inV = r.money_in_cr || 0, spent = w.spent_cr || 0;
      const recd = w.works_recommended, done = w.works_completed;
      const gx = padL + gi * (groupW + groupGap);
      // money bars (left axis = money) and works completion ratio (as % fill)
      const maxMoney = Math.max(inV, spent, 1);
      const bw = groupW / 3 - 2;
      const bars = [
        { label: 'In', v: inV, h: (inV / maxMoney) * plotH, color: 'oklch(0.6 0.05 250)', tip: `Money available: ${crLabel(inV)}` },
        { label: 'Spent', v: spent, h: (spent / maxMoney) * plotH, color: 'oklch(0.78 0.16 70)', tip: `Spent: ${crLabel(spent)} (${Math.round(spent / maxMoney * 100)}% of available)` },
        ...(recd != null ? [{ label: 'Done', v: done, h: (recd ? (done / recd) : 0) * plotH, color: done === 0 ? 'oklch(0.6 0.2 25)' : 'oklch(0.7 0.17 162)', tip: `Works completed: ${done}/${recd}` }] : [])
      ];
      bars.forEach((b, bi) => {
        const x = gx + bi * (bw + 2);
        const y = top + plotH - b.h;
        svg += `<rect x="${x}" y="${y}" width="${bw}" height="${Math.max(1, b.h)}" rx="1.5" fill="${b.color}" class="grp-bar" data-g="${gi}" data-b="${bi}" style="cursor:pointer;transition:opacity .15s"/>`;
        svg += `<text x="${x + bw / 2}" y="${H - padB + 10}" text-anchor="middle" fill="oklch(0.55 0 0)" font-family="ui-monospace,monospace" font-size="6.5">${b.label}</text>`;
      });
      const name = (r.through_dept || r.scheme).split('—')[1]?.trim() || r.scheme;
      svg += `<text x="${gx + groupW / 2}" y="${H - 4}" text-anchor="middle" fill="oklch(0.7 0 0)" font-family="ui-monospace,monospace" font-size="7.5">${esc((name).slice(0, 16))}</text>`;
      r._bars = bars;
    });
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="width:100%">${svg}</svg>
      <div class="chart-note">Per scheme: money available vs spent vs works completed. A tall 'In' with short 'Spent'/'Done' = money that didn't convert to delivery.</div>`;
    el.querySelectorAll('.grp-bar').forEach(bar => {
      const r = rows[+bar.dataset.g], b = r._bars[+bar.dataset.b];
      bar.addEventListener('mousemove', e => { bar.style.opacity = '0.8'; showTip(`<b>${esc(r.scheme.split('—')[0])}</b><br>${esc(b.tip)}`, e); });
      bar.addEventListener('mouseleave', () => { bar.style.opacity = '1'; hideTip(); });
    });
  }

  // (4) Utilisation timeline: money-in vs utilised% across ledger FYs (interactive points).
  function drawTimeline(el, L) {
    if (!el) return;
    // Build a simple per-row series ordered as given; x = scheme/FY, y = money_in, marker = util.
    const rows = (L.ledger || []);
    if (!rows.length) { el.innerHTML = '<div class="chart-note">No ledger rows yet.</div>'; return; }
    const W = 320, H = 120, padL = 34, padR = 10, padT = 10, padB = 26;
    const iw = W - padL - padR, ih = H - padT - padB;
    const max = Math.max(...rows.map(r => r.money_in_cr || 0), 1) * 1.1;
    const x = i => padL + (rows.length === 1 ? iw / 2 : (i / (rows.length - 1)) * iw);
    const y = v => padT + ih - (v / max) * ih;
    let svg = '';
    for (let g = 0; g <= 2; g++) { const v = max * g / 2, yy = y(v); svg += `<line x1="${padL}" x2="${W - padR}" y1="${yy}" y2="${yy}" stroke="oklch(0.985 0 0 / 0.07)"/><text x="${padL - 4}" y="${yy + 3}" text-anchor="end" fill="oklch(0.55 0 0)" font-family="ui-monospace,monospace" font-size="7">${Math.round(v)}</text>`; }
    const pts = rows.map((r, i) => `${x(i)},${y(r.money_in_cr || 0)}`).join(' ');
    if (rows.length > 1) svg += `<polyline points="${pts}" fill="none" stroke="oklch(0.78 0.16 70)" stroke-width="1.4"/>`;
    rows.forEach((r, i) => {
      const util = r.what_happened?.utilisation_pct;
      const col = util == null ? 'oklch(0.55 0 0)' : util < 40 ? 'oklch(0.62 0.2 25)' : util < 75 ? 'oklch(0.78 0.16 70)' : 'oklch(0.7 0.17 162)';
      svg += `<circle cx="${x(i)}" cy="${y(r.money_in_cr || 0)}" r="4" fill="${col}" stroke="oklch(0.145 0 0)" stroke-width="1" class="tl-pt" data-i="${i}" style="cursor:pointer"/>`;
      const lbl = (r.scheme.match(/MPLADS|KMC|MGNREGS|PMAY|AMRUT/i) || [r.scheme])[0];
      svg += `<text x="${x(i)}" y="${H - 4}" text-anchor="middle" fill="oklch(0.6 0 0)" font-family="ui-monospace,monospace" font-size="7">${esc(String(lbl).slice(0, 8))}</text>`;
    });
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="width:100%">${svg}</svg>
      <div class="chart-note">Point height = money in (₹ cr); colour = utilisation (<span style="color:oklch(0.62 0.2 25)">red &lt;40%</span> · <span style="color:oklch(0.78 0.16 70)">amber</span> · <span style="color:oklch(0.7 0.17 162)">green &gt;75%</span>).</div>`;
    el.querySelectorAll('.tl-pt').forEach(pt => {
      const r = rows[+pt.dataset.i], w = r.what_happened || {};
      pt.addEventListener('mousemove', e => showTip(`<b>${esc(r.scheme.split('—')[0])}</b><br>${esc(r.fy)}<br>In: ${crLabel(r.money_in_cr || 0)}${w.utilisation_pct != null ? `<br>Utilised: ${w.utilisation_pct}%` : ''}${w.spent_cr != null ? `<br>Spent: ${crLabel(w.spent_cr)}` : ''}`, e));
      pt.addEventListener('mouseleave', hideTip);
    });
  }
  function renderBlockSection(state, district) {
    if (!BLOCKS) return '';
    const blocks = blocksForDistrict(state, district);
    const label = blockLabelFor(state);
    const isPilotState = BLOCKS.states && BLOCKS.states[state];
    if (!isPilotState) {
      const roadmap = BLOCKS._meta?.roadmap_states || [];
      const inRoadmap = roadmap.includes(state);
      return `
        <div class="india-detail-section-title">${esc(label)}s in ${esc(district)}</div>
        <div class="block-empty">
          <div class="block-empty-eyebrow">Block data: layer in progress</div>
          <p class="block-empty-body">
            Census 2011 sub-district / block tables are locked in per-state PDFs on censusindia.gov.in — not a single open CSV. V1 pilot covers <strong>Kerala (75 taluks)</strong>, <strong>Goa (12 talukas)</strong>, and <strong>Sikkim (10 sub-divisions)</strong>.
            ${inRoadmap ? `<br/><br/>${esc(state)} is on the roadmap.` : ''}
          </p>
        </div>`;
    }
    if (!blocks || !blocks.length) {
      return `
        <div class="india-detail-section-title">${esc(label)}s in ${esc(district)}</div>
        <p class="india-detail-empty-body">No ${esc(label.toLowerCase())}s recorded for this district in the pilot dataset.</p>`;
    }
    return `
      <div class="india-detail-section-title">${esc(label)}s in ${esc(district)} <span style="font-family:var(--font-mono);font-size:10px;color:var(--muted-foreground);text-transform:none;letter-spacing:0.02em">· ${blocks.length} ${esc(label.toLowerCase())}${blocks.length===1?'':'s'}</span></div>
      <div class="block-list">
        ${blocks.map((b, i) => `
          <button class="block-row" data-block="${esc(b)}" data-state="${esc(state)}" data-district="${esc(district)}">
            <span class="rnk">${String(i + 1).padStart(2, '0')}</span>
            <span class="name">${esc(b)}</span>
            <span class="lbl">${esc(label)}</span>
          </button>
        `).join('')}
      </div>
      <p class="india-caveat">
        Each ${esc(label.toLowerCase())} is headed by a Tahsildar (revenue side) and a Block Development Officer (development side) — both typically state civil service, <strong>not IAS</strong>. The cadre rarely deploys below district HQ. Block population from Census 2011 PDF tables pending integration in V2.
      </p>`;
  }
  function bindBlockClicks(detail) {
    detail.querySelectorAll('.block-row').forEach(row => {
      row.addEventListener('click', () => renderBlockDetail(row.dataset.block, row.dataset.district, row.dataset.state));
    });
  }

  // Industrial-heritage timeline — when this district's industry was founded, by era.
  const ERA_META = {
    pre_colonial:   { label: 'Pre-colonial', short: 'pre-1757', color: 'oklch(0.7 0.13 300)' },
    colonial:       { label: 'Colonial era', short: '1757–1947', color: 'oklch(0.7 0.15 50)' },
    nehruvian_psu:  { label: 'Public-sector build-out', short: '1947–1991', color: 'oklch(0.7 0.16 160)' },
    liberalisation: { label: 'Post-liberalisation', short: '1991–', color: 'oklch(0.72 0.16 250)' },
  };
  function controlLabel(ct) {
    return (LEDGER?._meta?.control_labels || {})[ct] || ct.replace(/_/g, ' ');
  }
  function renderHeritageTimeline(plants, district) {
    const dated = (plants || []).filter(p => typeof p.founded === 'number').sort((a, b) => a.founded - b.founded);
    if (dated.length < 2) return '';
    const minY = dated[0].founded, maxY = dated[dated.length - 1].founded;
    const span = Math.max(1, maxY - minY);
    const rows = dated.map(p => {
      const t = (p.founded - minY) / span;
      const em = ERA_META[p.era] || { label: '', color: 'oklch(0.6 0 0)' };
      const tip = `${esc(p.name)} · est. ${p.founded} · ${esc(em.label)}${p.heritage_note ? '\n' + p.heritage_note.replace(/"/g, '') : ''}`;
      return `
        <div class="heritage-row" title="${esc(tip)}">
          <span class="heritage-year" style="color:${em.color}">${p.founded}</span>
          <div class="heritage-track">
            <span class="heritage-dot" style="left:${(t * 100).toFixed(1)}%;background:${em.color}"></span>
          </div>
          <span class="heritage-name">${esc(p.name.split('(')[0].split('/')[0].trim())}</span>
        </div>`;
    }).join('');
    // era legend (only the eras present)
    const present = [...new Set(dated.map(p => p.era))];
    const legend = present.map(e => {
      const m = ERA_META[e]; if (!m) return '';
      return `<span class="heritage-leg"><span class="heritage-sw" style="background:${m.color}"></span>${esc(m.label)} <span class="heritage-leg-yr">${esc(m.short)}</span></span>`;
    }).join('');
    return `
      <div class="india-detail-section-title" style="margin-top:0.8rem">How ${esc(district)} industrialised — ${minY}→${maxY}</div>
      <div class="heritage-timeline">${rows}</div>
      <div class="heritage-legend">${legend}</div>`;
  }

  // Sub-district / block accountability skeleton — the honest level below district.
  // Blocks are where central schemes (MGNREGS, PMAY-G) actually disburse. We have
  // the named place; we do NOT yet have its money figures — shown as explicit gaps.
  function renderBlockLedgerSkeleton(block, district, state, label) {
    const post = (name) => {
      const pay = PAY?.posts?.[name];
      const cost = pay?.annual_cost_to_govt_est
        ? `<span class="roster-cost" title="Per-post cost-to-government (pay-scales.json)">~₹${(pay.annual_cost_to_govt_est / 1e7).toFixed(2)} cr/yr</span>` : '';
      return `<div class="roster-row"><span class="roster-name">${esc(name)}</span><span class="roster-post">${pay ? esc(pay.service) : 'state civil service'}</span>${cost}</div>`;
    };
    // Schemes that flow THROUGH a block (the accountability link to money).
    const schemes = ['MGNREGS (wage employment + assets)', 'PMAY-G (rural housing)', 'PM-KISAN (DBT)', '15th FC tied grants to Gram Panchayats'];

    // Parent-district context: if the district is a deep (sourced) entry, surface it.
    const parent = ledgerForDistrict(state, district);
    const siblingCount = (BLOCKS?.states?.[state]?.districts?.[district] || []).length;
    let parentCtx = '';
    if (parent && parent.baseline !== true) {
      const dm = parent.roster?.collector?.name;
      const plantN = (parent.plants || []).length;
      const bits = [];
      if (dm) bits.push(`DM <b>${esc(dm)}</b> (district level)`);
      if (plantN) bits.push(`${plantN} major plant${plantN === 1 ? '' : 's'} in the parent district`);
      if (parent.admin_model && parent.admin_model !== 'standard') bits.push(`<b>${esc(parent.admin_model)}</b> district admin model`);
      if (bits.length) parentCtx = `<div class="block-parent-ctx">Parent district <b>${esc(district)}</b> is deep-sourced — ${bits.join(' · ')}. ${siblingCount ? `One of ${siblingCount} ${esc(label.toLowerCase())}s.` : ''}</div>`;
    } else if (siblingCount) {
      parentCtx = `<div class="block-parent-ctx">One of ${siblingCount} ${esc(label.toLowerCase())}s in ${esc(district)}.</div>`;
    }

    return `
      ${parentCtx}
      <div class="india-detail-section-title">Who is responsible here</div>
      <div class="roster-list">
        ${post('Block Development Officer')}
        ${post('Tehsildar')}
      </div>
      <div class="india-detail-section-title" style="margin-top:0.7rem">Money that flows through this ${esc(label.toLowerCase())}</div>
      <div class="ledger-baseline">
        <div class="ledger-baseline-eyebrow">Baseline coverage — block-level figures not yet sourced</div>
        <p>The block/${esc(label.toLowerCase())} is where central rural schemes actually disburse — the BDO is the
        accountable officer. Scheme money typically routed through here:</p>
        <ul style="margin:0.3rem 0 0.3rem 1rem;line-height:1.6">${schemes.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
        <details class="ledger-gaps"><summary>5 block-level fields awaiting sourcing</summary><ul>
          <li>BDO &amp; Tehsildar names (state portals, not centrally machine-readable)</li>
          <li>MGNREGS person-days &amp; expenditure (nrega.nic.in MIS — no clean open API)</li>
          <li>PMAY-G houses sanctioned vs completed (pmayg.nic.in)</li>
          <li>Block population &amp; Gram Panchayat count (Census 2011 sub-district PDF)</li>
          <li>15th FC tied/untied grant to local bodies in this block</li>
        </ul></details>
      </div>`;
  }
  function renderBlockDetail(block, district, state) {
    const label = blockLabelFor(state);
    const detail = $ind('#india-detail');
    const src = (key) => {
      const o = SOURCES[key];
      return o ? `<a class="src-link" href="${esc(o.url)}" target="_blank" rel="noopener" title="Source: ${esc(o.name)}">↗</a>` : '';
    };
    detail.innerHTML = `
      <div class="india-detail-head">
        <div>
          <div class="india-detail-name">${esc(block)}</div>
          <div class="mono" style="font-size:10.5px;letter-spacing:0.04em;color:var(--muted-foreground);text-transform:uppercase;margin-top:2px">${esc(label)} of ${esc(district)} · ${esc(state)}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.4rem">
          <button class="india-back-btn" id="block-back-to-district">← ${esc(district)}</button>
          <button class="india-back-btn" id="block-back-to-state">← ${esc(state)}</button>
        </div>
      </div>

      <div class="india-stat-grid">
        <div class="india-stat"><div class="label">${esc(label)} name</div><div class="value" style="font-size:14px">${esc(block)}</div></div>
        <div class="india-stat"><div class="label">Parent district</div><div class="value" style="font-size:13px">${esc(district)}</div></div>
        <div class="india-stat"><div class="label">Parent state</div><div class="value" style="font-size:13px">${esc(state)}</div></div>
        <div class="india-stat"><div class="label">Administrative head</div><div class="value" style="font-size:11px">Tahsildar + BDO</div></div>
        <div class="india-stat" style="grid-column:span 2"><div class="label">IAS deployment ${src('ias')}</div><div class="value" style="font-size:11px">Typically <strong>none</strong> — Tahsildar and BDO are state civil service. IAS cadre stops at district HQ.</div></div>
      </div>

      ${renderBlockLedgerSkeleton(block, district, state, label)}

      <div class="india-caveat">
        Block name from Census 2011 sub-district directory. Population, MGNREGA delivery, and PMAY-G performance data not yet integrated for this level — Census PDFs need parsing; MGNREGA's nrega.nic.in lacks a clean open API. Source: <a href="https://censusindia.gov.in" target="_blank" rel="noopener" style="color:oklch(0.78 0.16 70)">censusindia.gov.in</a> directory of sub-districts, cross-checked with state revenue department websites.
      </div>`;

    // Map zoom: blocks have no polygon geometry, so focus the PARENT DISTRICT (geometry we have).
    const dLayer = districtPathByName.get(district);
    if (dLayer && dLayer.getBounds) {
      try { map.fitBounds(dLayer.getBounds(), { padding: [40, 40], maxZoom: 11 }); } catch (e) {}
    }
    detail.querySelector('#block-back-to-district')?.addEventListener('click', () => {
      // Re-render district detail (which includes the block list)
      renderDistrictDetail(district, state);
      const det = $ind('#india-detail');
      bindBlockClicks(det);
    });
    detail.querySelector('#block-back-to-state')?.addEventListener('click', () => exitDrill(state));
  }

  function exitDrill(stateName) {
    ui.state.mode = 'states';
    ui.state.drillState = null;
    ui.state.drillDistrict = null;
    if (subdistrictLayer) { subdistrictLayer.remove(); subdistrictLayer = null; }
    if (hazardLayer) { hazardLayer.remove(); hazardLayer = null; }
    if (districtLayer) { districtLayer.remove(); districtLayer = null; districtPathByName.clear(); }
    _queryMatchSet = new Set(); removeQueryHintBadge();   // drop the per-district query ring
    // Restore state layer styling
    if (geoLayer) geoLayer.eachLayer(layer => layer.setStyle(fillStyle(layer.feature.properties.ST_NM)));
    if (stateName) selectState(stateName);
    renderLayersPanel();   // drop the district data-modes now we're back at state level
    // Re-apply the India-level query glow if a query is still active.
    if (typeof reapplyQueryGlow === 'function') setTimeout(reapplyQueryGlow, 0);
    try { map.fitBounds(geoLayer.getBounds(), { padding: [10, 10] }); } catch (e) {}
  }

  function renderEmptyState() {
    const detail = $ind('#india-detail');
    const view = VIEWS[ui.state.view];
    detail.innerHTML = `
      <div class="india-detail-empty">
        <div class="eyebrow">Active view: ${esc(view.shortLabel)} · ${esc(DATA._meta.yearLabels[ui.state.yearIdx])}</div>
        <p class="india-detail-empty-body">Click any state for its 10-year history, governance footprint (IAS · employees · bribe-paid %), departments split (back-office vs public-facing), and structural pros / cons.</p>
        ${renderFeaturedDistricts()}
        <div id="india-summary" class="india-summary-inline"></div>
      </div>`;
    bindFeaturedDistricts(detail);
    renderSummary();
  }

  // The deep-sourced districts, surfaced so visitors find them without hunting.
  function deepDistricts() {
    const out = [];
    if (!LEDGER?.states) return out;
    for (const [state, sd] of Object.entries(LEDGER.states)) {
      for (const [district, d] of Object.entries(sd.districts || {})) {
        if (d.baseline === true) continue;
        const money = (d.ledger || []).map(r => r.money_in_cr).filter(v => typeof v === 'number');
        out.push({
          state, district,
          admin: d.admin_model,
          headlineCr: money.length ? Math.max(...money) : null,
          plants: (d.plants || []).length,
          tagline: (d.system_notes && d.system_notes[0]) ? shortTag(d.admin_model) : ''
        });
      }
    }
    return out;
  }
  function shortTag(admin) {
    return ({ split: 'split-admin metro', standard: 'standard model',
      company_township: 'company township' })[admin] || admin || '';
  }

  function renderFeaturedDistricts() {
    const deep = deepDistricts();
    if (!deep.length) return '';
    const card = d => {
      const money = d.headlineCr != null
        ? `₹${d.headlineCr >= 1000 ? (d.headlineCr / 1000).toFixed(1) + 'k' : Math.round(d.headlineCr)} cr`
        : 'no public ₹';
      return `
        <button class="feat-card" data-state="${esc(d.state)}" data-district="${esc(d.district)}">
          <span class="feat-name">${esc(d.district)}</span>
          <span class="feat-sub">${esc(d.state)} · ${esc(shortTag(d.admin))}</span>
          <span class="feat-stats">${money}${d.plants ? ` · ${d.plants} plant${d.plants === 1 ? '' : 's'}` : ''}</span>
        </button>`;
    };
    return `
      <div class="feat-block">
        <div class="feat-head">Deep-sourced districts <span class="feat-count">${deep.length}</span></div>
        <div class="feat-note">Fully researched, PDF-cited exemplars — the rest of the map is honest baseline structure. Click to explore:</div>
        <div class="feat-grid">${deep.map(card).join('')}</div>
        <button class="feat-method" id="feat-method-btn">How this is sourced (tiers &amp; gaps) →</button>
      </div>`;
  }

  function bindFeaturedDistricts(detail) {
    detail.querySelectorAll('.feat-card').forEach(btn => {
      btn.addEventListener('click', async () => {
        const { state, district } = btn.dataset;
        // Select state (so the state context + back buttons are correct), drill, then pick the district.
        selectState(state, true);
        await drillIntoDistricts(state);
        selectDistrict(district, state);
      });
    });
    detail.querySelector('#feat-method-btn')?.addEventListener('click', showMethodology);
  }

  function showMethodology() {
    const m = ledgerMeta();
    const overlay = document.createElement('div');
    overlay.className = 'method-overlay';
    overlay.innerHTML = `
      <div class="method-box">
        <button class="method-close" aria-label="Close">×</button>
        <h2>How this data is sourced</h2>
        <p>This dashboard's goal is to show <b>the flow of money to each district, who's responsible, and how the system functions or dysfunctions</b> — grounded in public records, never invented.</p>
        <h3>Source tiers</h3>
        <p>Every named figure carries a source and a tier. Lower is more authoritative; ⚠ in the panel marks tier&nbsp;3–4 awaiting upgrade to a government PDF.</p>
        <ul class="method-tiers">
          <li><b>Tier 1 — gov PDF</b> · Pay Commission, gazette, CAG, Finance Commission, PIB. Most authoritative.</li>
          <li><b>Tier 2 — gov HTML</b> · official <code>.nic.in</code> / <code>.gov.in</code> district & corporation portals.</li>
          <li><b>Tier 3 — Wikipedia</b> · discovery only; flagged for upgrade.</li>
          <li><b>Tier 4 — news</b> · corroborated reporting; flagged for upgrade.</li>
        </ul>
        <h3>Deep vs baseline</h3>
        <p><b>${m.deep} deep districts</b> are fully researched with money flows, officials, and industrial base. The other <b>${m.baseline}</b> are honest <b>baseline skeletons</b> — real structure (admin model, the chain of command, the schemes that flow) with every unsourced figure listed as an explicit gap. <b>Nothing is fabricated.</b></p>
        <p class="method-rule">Rule: <b>PDF-cited or it's a gap.</b> A number with no public source stays blank and is recorded as missing, rather than guessed.</p>
        <p class="method-foot">Coverage: ${m.total} districts across ${m.states} states/UTs · ${m.withMoney} with real money figures · 2,184 sub-districts/blocks. Open data on <a href="https://github.com/sinhaankur/india-fiscal-map" target="_blank" rel="noopener">GitHub</a>.</p>
      </div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay || e.target.classList.contains('method-close')) overlay.remove(); });
    document.body.appendChild(overlay);
  }
  function ledgerMeta() {
    const c = LEDGER?._meta?.coverage || {};
    return {
      total: c.districts || 0, deep: c.deep_districts || 0,
      baseline: c.baseline_districts || 0, states: LEDGER?.states ? Object.keys(LEDGER.states).length : 0,
      withMoney: c.districts_with_money_figures || 0
    };
  }

  function deselectState() {
    ui.state.selected = null;
    pathByName.forEach(layer => layer._path?.classList.remove('selected'));
    renderEmptyState();
  }

  function drawSpark(s, yearIdx) {
    const svg = $ind('#india-spark');
    if (!svg) return;
    const W = 320, H = 110, padL = 32, padR = 8, padT = 8, padB = 18;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;
    const years = DATA._meta.yearLabels;
    const n = years.length;

    const inFlow = s.devolution.map((d, i) => d + s.grants[i]);
    const series = [
      { name: 'ownTax', vals: s.ownTax, color: 'oklch(0.7 0.17 162)' },
      { name: 'inflow', vals: inFlow, color: 'oklch(0.78 0.16 70)' },
      { name: 'contribution', vals: s.contribution, color: 'oklch(0.65 0.18 250)' }
    ];
    const max = Math.max(...series.flatMap(ser => ser.vals)) * 1.05;
    const x = i => padL + (i / (n - 1)) * innerW;
    const y = v => padT + innerH - (v / max) * innerH;

    let svgContent = '';
    for (let g = 0; g <= 3; g++) {
      const v = (max) * (g / 3);
      const yy = y(v);
      svgContent += `<line x1="${padL}" x2="${W - padR}" y1="${yy}" y2="${yy}" stroke="oklch(0.985 0 0 / 0.07)" stroke-width="1"/>`;
      svgContent += `<text x="${padL - 4}" y="${yy + 3}" text-anchor="end" fill="oklch(0.6 0 0)" font-family="ui-monospace, monospace" font-size="8">${Math.round(v)}</text>`;
    }
    [0, Math.floor((n - 1) / 2), n - 1].forEach(i => {
      svgContent += `<text x="${x(i)}" y="${H - 4}" text-anchor="middle" fill="oklch(0.6 0 0)" font-family="ui-monospace, monospace" font-size="8">${years[i]}</text>`;
    });
    svgContent += `<line x1="${x(yearIdx)}" x2="${x(yearIdx)}" y1="${padT}" y2="${padT + innerH}" stroke="var(--foreground)" stroke-width="0.5" stroke-dasharray="2 2" opacity="0.4"/>`;
    [1, 6].forEach(i => {
      svgContent += `<line x1="${x(i) - (innerW / (n - 1) / 2)}" x2="${x(i) - (innerW / (n - 1) / 2)}" y1="${padT}" y2="${padT + innerH}" stroke="oklch(0.985 0 0 / 0.18)" stroke-width="1" stroke-dasharray="1 3"/>`;
    });
    for (const ser of series) {
      const pts = ser.vals.map((v, i) => `${x(i)},${y(v)}`).join(' ');
      svgContent += `<polyline points="${pts}" fill="none" stroke="${ser.color}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>`;
      svgContent += `<circle cx="${x(yearIdx)}" cy="${y(ser.vals[yearIdx])}" r="3" fill="${ser.color}" stroke="oklch(0.145 0 0)" stroke-width="1"/>`;
    }
    svg.innerHTML = svgContent;
  }

  function renderSummary() {
    const container = $ind('#india-summary');
    if (!container) return;
    const view = VIEWS[ui.state.view];
    const ranked = [];
    for (const name of Object.keys(DATA.states)) {
      const r = rowFor(name, ui.state.yearIdx);
      if (!r) continue;
      const v = view.compute(r, extFor(name));
      if (v == null || Number.isNaN(v)) continue;
      ranked.push({ name, value: v });
    }
    ranked.sort((a, b) => a.value - b.value);

    const renderRow = (item, i) => `
      <div class="india-rank-row" data-state="${esc(item.name)}">
        <span class="rnk">${String(i + 1).padStart(2, '0')}</span>
        <span class="name">${esc(item.name)}</span>
        <span class="val">${view.fmt(item.value)}</span>
      </div>`;

    const isDiv = view.diverging;
    container.innerHTML = `
      <div class="india-summary-card">
        <div class="h">${isDiv ? 'Top net donors' : 'Lowest by ' + view.shortLabel.toLowerCase()}</div>
        <div class="sub">${isDiv ? 'Most negative net flow' : view.label} · ${DATA._meta.yearLabels[ui.state.yearIdx]}</div>
        ${ranked.slice(0, 8).map(renderRow).join('')}
      </div>
      <div class="india-summary-card">
        <div class="h">${isDiv ? 'Top net recipients' : 'Highest by ' + view.shortLabel.toLowerCase()}</div>
        <div class="sub">${isDiv ? 'Most positive net flow' : view.label} · ${DATA._meta.yearLabels[ui.state.yearIdx]}</div>
        ${ranked.slice(-8).reverse().map((it, i) => renderRow(it, i)).join('')}
      </div>
    `;
    container.querySelectorAll('.india-rank-row').forEach(row => {
      row.addEventListener('click', () => selectState(row.dataset.state, true));
    });
  }

  function selectState(name, scrollMap = false) {
    ui.state.selected = name;
    pathByName.forEach((layer, n) => layer._path?.classList.toggle('selected', n === name));
    renderDetail(name);
    if (scrollMap) {
      const layer = pathByName.get(name);
      if (layer && layer.getBounds) {
        try { map.fitBounds(layer.getBounds(), { padding: [40, 40], maxZoom: 6 }); } catch (e) {}
      }
    }
  }

  function setHover(name) {
    ui.state.hover = name;
    pathByName.forEach((layer, n) => layer._path?.classList.toggle('hover', n === name));
    updateReadout();
  }

  function wireControls() {
    $$ind('.ind-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$ind('.ind-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        ui.state.view = btn.dataset.view;
        repaint();
      });
    });
    const slider = $ind('#india-year');
    slider.max = DATA._meta.years.length - 1;
    slider.value = ui.state.yearIdx;
    slider.addEventListener('input', (e) => {
      ui.state.yearIdx = parseInt(e.target.value, 10);
      repaint();
    });

    const fcStrip = $ind('#india-fc-strip');
    fcStrip.innerHTML = `
      <div class="fc-seg fc-13" title="13th Finance Commission · 32% vertical pool · FY15"><span class="fc-label">13th FC</span></div>
      <div class="fc-seg fc-14" title="14th Finance Commission · 42% vertical pool · FY16-FY20"><span class="fc-label">14th FC · 42%</span></div>
      <div class="fc-seg fc-15" title="15th Finance Commission · 41% vertical pool · FY21-FY26"><span class="fc-label">15th FC · 41%</span></div>
      <div class="fc-marker" style="left:0"></div>
    `;
  }

  function buildMap() {
    map = L.map('india-map', {
      attributionControl: true,
      zoomControl: true,
      worldCopyJump: true,
      minZoom: 2,            // zoom right out to the whole globe — no India lock
      maxZoom: MapLayers.MAX_ZOOM,   // deep zoom to locality (honest upscale past native)
      scrollWheelZoom: true,
      zoomSnap: 0.5,         // half-step zoom → smoother, more controllable deep zoom
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 120,      // gentler wheel so you can settle on a level
    }).setView([22.5, 80], 4.5);

    // Tile-layer catalogue lives in map-layers.js (window.MapLayers). app.js keeps
    // the wiring (active layer, panel, weather refresh) + the custom elevation tint.
    const basemaps = MapLayers.basemaps(L);
    // OPTIONAL "Satellite HD" (real 50 cm z21 over India) — only if the user supplied
    // a Mapbox token. Ships no key; licensed, so opt-in only. Added last in the list.
    const hd = MapLayers.satelliteHD(L);
    if (hd) basemaps['Satellite HD (your Mapbox key)'] = hd;
    basemaps['Dark map'].addTo(map);      // default
    const labels = MapLayers.labels(L);
    const hillshade = MapLayers.hillshade(L);
    const elevTint = buildElevationTintLayer();   // custom GridLayer (uses DEM decode)
    const { rain, clouds } = MapLayers.weather(L);
    // Stash for the unified layers panel (replaces the default Leaflet controls).
    mapLayers = { basemaps, labels, hillshade, elevTint, rain, clouds, current: 'Dark map' };
    // Deep-zoom note + zoom/scale readout (map-ui.js) — reads the active basemap's
    // real resolution so it can flag upscaling.
    mapUI = MapUI.setup(map, { getActiveBasemap: () => mapLayers.basemaps[mapLayers.current] });
    buildLayersPanel();
    setupElevationReadout();
    setupWeatherLayer();

    geoLayer = L.geoJSON(GEO, {
      style: f => fillStyle(f.properties.ST_NM),
      onEachFeature: (feature, layer) => {
        const name = feature.properties.ST_NM;
        pathByName.set(name, layer);
        layer.on('mouseover', () => setHover(name));
        layer.on('mouseout', () => setHover(null));
        layer.on('click', () => selectState(name));
      }
    }).addTo(map);

    try { map.fitBounds(geoLayer.getBounds(), { padding: [10, 10] }); } catch (e) {}

    // "Home" control — the map is now global (pan/zoom anywhere), so give an easy
    // one-click way back to India.
    const HomeCtl = L.Control.extend({
      options: { position: 'topright' },
      onAdd() {
        const b = L.DomUtil.create('button', 'map-home-btn');
        b.innerHTML = '⌂ India';
        b.title = 'Reset view to India';
        L.DomEvent.disableClickPropagation(b);
        b.onclick = () => { try { map.fitBounds(geoLayer.getBounds(), { padding: [10, 10] }); } catch (e) {} };
        return b;
      }
    });
    map.addControl(new HomeCtl());

    // Fade the data choropleth in/out as the user zooms (see zoomFade). Restyle the
    // active layer on zoom so the land shows through at deep zoom.
    let lastFade = zoomFade();
    map.on('zoomend', () => {
      const f = zoomFade();
      if (f !== lastFade) {
        lastFade = f;
        // restyle in place (Leaflet re-runs the style fn per feature) — no re-fit,
        // so the user's zoom is preserved while the fill fades.
        if (districtLayer && districtLayer.options.style) districtLayer.setStyle(districtLayer.options.style);
        else if (geoLayer) geoLayer.eachLayer(l => l.setStyle(fillStyle(l.feature.properties.ST_NM)));
      }
      // map-ui.js refreshes the deep-zoom note + scale readout on its own zoom listener.
    });

    buildNewsBubbles();
  }

  // ---- Unified LAYERS panel: one intuitive control for basemap + overlays +
  // "colour districts by". Always visible (top-left of the map), collapsible.
  // Replaces the scattered Leaflet layer control + in-panel district-mode toggle.
  // ---- LIVE weather (RainViewer): real-time rain radar + cloud (IR) tiles.
  // Free, keyless, global; the frame path is timestamped and rotates, so we fetch
  // the latest index and (re)point the tile layers, then refresh every 5 min. This
  // is the "sync to each day's activity" layer — during the monsoon you can see
  // rain actually falling over Pune/Mumbai etc.
  let weatherMeta = null;
  async function setupWeatherLayer() {
    async function refresh() {
      try {
        const j = await (await fetch('https://api.rainviewer.com/public/weather-maps.json', { cache: 'no-store' })).json();
        const host = j.host;
        const past = j.radar?.past || [];
        const nowcast = j.radar?.nowcast || [];
        const frame = (nowcast.length ? nowcast[nowcast.length - 1] : past[past.length - 1]);
        const ir = (j.satellite?.infrared || []);
        const irFrame = ir.length ? ir[ir.length - 1] : null;
        if (!frame) return;
        weatherMeta = { time: frame.time, host };
        // colour scheme 2 (universal blue→red), smooth=1, snow=1
        mapLayers.rain.setUrl(`${host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`);
        if (irFrame) mapLayers.clouds.setUrl(`${host}${irFrame.path}/256/{z}/{x}/{y}/0/0_0.png`);
        // refresh the panel timestamp if the weather section is showing
        const tEl = document.getElementById('mlp-wx-time');
        if (tEl) tEl.textContent = wxAgeLabel();
      } catch (e) { /* offline → layer just stays blank */ }
    }
    await refresh();
    setInterval(refresh, 5 * 60 * 1000);   // every 5 minutes
  }
  function wxAgeLabel() {
    if (!weatherMeta) return 'live radar';
    const mins = Math.max(0, Math.round((Date.now() / 1000 - weatherMeta.time) / 60));
    return mins <= 1 ? 'updated just now' : `updated ${mins} min ago`;
  }

  // Elevation ramp + Terrarium decode live in dem.js (shared with terrain-3d.html).
  const elevRampRGB = m => DEM.rampRGB(m);

  // Custom GridLayer: decode open Terrarium terrain-RGB → coloured elevation tint.
  function buildElevationTintLayer() {
    const TintLayer = L.GridLayer.extend({
      createTile(coords, doneCb) {
        const size = this.getTileSize();
        const tile = document.createElement('canvas');
        tile.width = size.x; tile.height = size.y;
        const ctx = tile.getContext('2d');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          // draw source terrarium tile, decode, repaint as ramp
          const off = document.createElement('canvas');
          off.width = 256; off.height = 256;
          const octx = off.getContext('2d', { willReadFrequently: true });
          octx.drawImage(img, 0, 0, 256, 256);
          let src;
          try { src = octx.getImageData(0, 0, 256, 256); }
          catch (e) { doneCb(null, tile); return; }   // CORS/tainted → skip
          const out = ctx.createImageData(256, 256);
          const s = src.data, o = out.data;
          for (let i = 0; i < s.length; i += 4) {
            const m = DEM.decode(s[i], s[i + 1], s[i + 2]);
            // Only tint LAND (above sea level). Ocean/bathymetry/nodata → transparent,
            // so the tint doesn't wash the seas green (fixes the global-view murk).
            if (m <= 2 || m > 9000) { o[i + 3] = 0; continue; }
            const [r, g, b] = elevRampRGB(m);
            o[i] = r; o[i + 1] = g; o[i + 2] = b;
            o[i + 3] = m < 60 ? 130 : 200;   // near-coast lowland a touch softer
          }
          ctx.putImageData(out, 0, 0);
          doneCb(null, tile);
        };
        img.onerror = () => doneCb(null, tile);
        const z = coords.z, x = coords.x, y = coords.y;
        img.src = DEM.tileUrl(z, x, y);
        return tile;
      }
    });
    return new TintLayer({
      maxNativeZoom: 12, maxZoom: (window.MapLayers?.MAX_ZOOM ?? 21), opacity: 0.72, pane: 'overlayPane',
      attribution: 'Elevation tint: AWS Terrain Tiles (Terrarium, open SRTM/NASADEM)',
    });
  }

  function switchBasemap(name) {
    if (!mapLayers || !mapLayers.basemaps[name]) return;
    Object.values(mapLayers.basemaps).forEach(l => map.removeLayer(l));
    mapLayers.basemaps[name].addTo(map);
    mapLayers.current = name;
    // labels + hillshade sit above the basemap — re-raise if on
    if (map.hasLayer(mapLayers.labels)) mapLayers.labels.bringToFront();
    if (map.hasLayer(mapLayers.hillshade)) mapLayers.hillshade.bringToFront();
    if (mapUI) mapUI.refresh();   // native-max (→ deep-zoom note) differs per basemap
  }
  // Add the optional "Satellite HD" basemap using the user's OWN Mapbox token.
  // We ship no key; the token stays in their browser (localStorage via MapLayers).
  // Real 50 cm imagery to z21 over India — the only way to beat open imagery's ~z19.
  function addSatelliteHD() {
    const existing = MapLayers.mapboxToken();
    const token = (window.prompt(
      'Paste your Mapbox access token for real 50 cm "Satellite HD" imagery.\n\n' +
      'Mapbox imagery is licensed — this is opt-in, we store no key. Your token stays\n' +
      'in this browser (localStorage). Get a free token at account.mapbox.com.',
      existing || '') || '').trim();
    if (!token) return;
    const hd = MapLayers.satelliteHD(L, token);
    if (!hd) return;
    mapLayers.basemaps['Satellite HD (your Mapbox key)'] = hd;
    switchBasemap('Satellite HD (your Mapbox key)');
    renderLayersPanel();
  }

  function toggleOverlay(which, on) {
    const layer = mapLayers[which];
    if (!layer) return;
    if (on) { layer.addTo(map); layer.bringToFront(); }
    else map.removeLayer(layer);
  }

  function buildLayersPanel() {
    const wrap = document.getElementById('india-map-wrap');
    if (!wrap || document.getElementById('map-layers-panel')) return;
    const panel = document.createElement('div');
    panel.id = 'map-layers-panel';
    panel.className = 'mlp';
    wrap.appendChild(panel);
    renderLayersPanel();
  }

  // Data overlays. Geography (flood/vulnerability/terrain) works at BOTH the India
  // level (per-state summary) and drilled-in (per-district) — so the flood atlas is
  // discoverable on first load. Money/population/language/politics need a state drill.
  function dataOverlayModes() {
    const inDistricts = ui.state.drillState != null;
    const geo = [['geography', 'Flood & terrain']];
    const drilled = [['population', 'Population'], ['money', 'Money flow'], ['language', 'Language'], ['politics', 'Politics'], ['health', '🩺 Health'], ['economy', '₹ Wealth'], ['coverage', '📊 Data coverage']];
    return inDistricts ? [...drilled, ...geo] : geo;
  }

  // Human label for the layer currently colouring the map — so the user always
  // knows what they're looking at (answers "which layer shows CRZ / danger?").
  function activeLayerLabel() {
    const mode = ui.state.districtMode;
    if (mode === 'geography') {
      const f = ui.state.geoFacet || 'zoning';
      return ({
        zoning: '⚖ Zoning & legal — what can be built here',
        vulnerability: '⚠ Vulnerability — overlapping risk signals',
        flood: 'Flood risk', coastal: 'Coastal · CRZ', elevation: 'Elevation',
        rainfall: 'Rainfall band', constraint: 'Physical constraint',
      })[f] || 'Geography';
    }
    return ({ money: 'Money flow', population: 'Population', language: 'Language', politics: 'Politics', health: '🩺 Health — infant mortality (NFHS-5)', economy: '₹ Wealth — per-capita income', coverage: '📊 Data coverage — sourced vs gap' })[mode] || 'Map';
  }

  // Paint the always-visible "now showing" badge on the map (top-centre).
  function renderActiveLayerBadge() {
    const wrap = document.getElementById('india-map-wrap');
    if (!wrap) return;
    let el = document.getElementById('active-layer-badge');
    if (!el) {
      el = document.createElement('div');
      el.id = 'active-layer-badge';
      el.className = 'active-layer-badge';
      el.onclick = () => { ui.state.layersCollapsed = false; renderLayersPanel(); };
      el.title = 'The layer currently colouring the map — click to open Layers';
      wrap.appendChild(el);
    }
    el.innerHTML = `<span class="alb-dot"></span><span class="alb-txt">${esc(activeLayerLabel())}</span>`;
  }

  function renderLayersPanel() {
    const panel = document.getElementById('map-layers-panel');
    if (!panel) return;
    renderActiveLayerBadge();
    const collapsed = ui.state.layersCollapsed;
    if (collapsed) {
      panel.innerHTML = `<button class="mlp-toggle" id="mlp-open" title="Layers">▤ Layers</button>`;
      panel.querySelector('#mlp-open').onclick = () => { ui.state.layersCollapsed = false; renderLayersPanel(); };
      return;
    }
    const cur = mapLayers?.current || 'Dark map';
    const shortBase = n => n.replace(' map', '')
      .replace('Recent satellite (Sentinel-2)', 'Recent (S2)')
      .replace('Satellite HD (your Mapbox key)', 'Satellite HD');
    const baseBtns = Object.keys(mapLayers?.basemaps || {}).map(n =>
      `<button class="mlp-base ${cur === n ? 'on' : ''}" data-base="${esc(n)}" title="${esc(n)}">${esc(shortBase(n))}</button>`).join('');
    // Offer to add real sub-metre imagery via the user's OWN Mapbox token (opt-in;
    // we ship no key). Only shown when no HD layer is loaded yet.
    const hasHD = !!(mapLayers?.basemaps && mapLayers.basemaps['Satellite HD (your Mapbox key)']);
    const hdHint = hasHD ? '' :
      `<button class="mlp-hd-add" id="mlp-hd-add" title="Deep zoom over India tops out at ~z19 on open imagery. Paste your own Mapbox token for real 50 cm imagery (licensed; stays on your device).">＋ HD imagery (your key)</button>`;
    const hillOn = mapLayers && map.hasLayer(mapLayers.hillshade);
    const elevOn = mapLayers && mapLayers.elevTint && map.hasLayer(mapLayers.elevTint);
    const labelsOn = mapLayers && map.hasLayer(mapLayers.labels);
    const rainOn = mapLayers && mapLayers.rain && map.hasLayer(mapLayers.rain);
    const cloudsOn = mapLayers && mapLayers.clouds && map.hasLayer(mapLayers.clouds);
    const subOn = subdistrictLayer != null;

    const modes = dataOverlayModes();
    const dataSection = modes.length ? `
      <div class="mlp-sec-h">Colour districts by</div>
      <div class="mlp-data">
        ${modes.map(([k, lbl]) => `<button class="mlp-data-btn ${ui.state.districtMode === k ? 'on' : ''}" data-mode="${k}">${lbl}</button>`).join('')}
      </div>
      ${ui.state.districtMode === 'geography' ? geoFacetChooserHTML() : ''}
      <div class="mlp-legend" id="mlp-legend">${activeOverlayLegend()}</div>` : `
      <div class="mlp-hint">Click a state, then drill to districts to colour by money, flood, elevation…</div>`;

    panel.innerHTML = `
      <div class="mlp-head">
        <span class="mlp-title">▤ Layers</span>
        <button class="mlp-collapse" id="mlp-close" title="Collapse">✕</button>
      </div>
      <div class="mlp-sec-h">Base map</div>
      <div class="mlp-bases">${baseBtns}</div>
      ${hdHint}
      <div class="mlp-sec-h">Overlays</div>
      <label class="mlp-check"><input type="checkbox" id="mlp-hill" ${hillOn ? 'checked' : ''}> Topography (hillshade)</label>
      <label class="mlp-check"><input type="checkbox" id="mlp-elev" ${elevOn ? 'checked' : ''}> Elevation tint (m above sea)</label>
      ${elevOn ? `<div class="mlp-elev-legend">${elevTintLegend()}</div>` : ''}
      ${(elevOn || hillOn) && cur === 'Terrain' ? `<div class="mlp-tip">Tip: elevation tint / hillshade read best over the <b>Dark</b> or <b>Satellite</b> base (Terrain already shades relief).</div>` : ''}
      <label class="mlp-check"><input type="checkbox" id="mlp-labels" ${labelsOn ? 'checked' : ''}> Place labels</label>
      <label class="mlp-check"><input type="checkbox" id="mlp-haz" ${ui.state.showHazards ? 'checked' : ''} ${ui.state.drillState ? '' : 'disabled'}> ⚠ Hazard &amp; zoning pins${ui.state.drillState ? '' : ' <span class="mlp-dim">(drill into a state)</span>'}</label>
      <label class="mlp-check"><input type="checkbox" id="mlp-heat" ${ui.state.showHeat ? 'checked' : ''} ${eventHeatLayer ? '' : 'disabled'}> 🔥 News &amp; event heatmap${eventHeatLayer ? '' : ' <span class="mlp-dim">(loading…)</span>'}</label>
      <label class="mlp-check"><input type="checkbox" id="mlp-sub" ${subOn ? 'checked' : ''} ${ui.state.drillDistrict ? '' : 'disabled'}> Sub-districts (taluk/tehsil)</label>
      <div class="mlp-sec-h">Live weather <span class="mlp-live">● live</span></div>
      <label class="mlp-check"><input type="checkbox" id="mlp-rain" ${rainOn ? 'checked' : ''}> Rain radar <span class="mlp-wx-time" id="mlp-wx-time">${esc(wxAgeLabel())}</span></label>
      <label class="mlp-check"><input type="checkbox" id="mlp-clouds" ${cloudsOn ? 'checked' : ''}> Clouds (infrared)</label>
      ${dataSection}`;

    // wire base
    panel.querySelectorAll('.mlp-base').forEach(b => b.onclick = () => { switchBasemap(b.dataset.base); renderLayersPanel(); });
    // "＋ HD imagery" — take the user's own Mapbox token, add the HD layer, switch to it.
    const hdBtn = panel.querySelector('#mlp-hd-add');
    if (hdBtn) hdBtn.onclick = () => addSatelliteHD();
    // overlays
    panel.querySelector('#mlp-hill').onchange = e => toggleOverlay('hillshade', e.target.checked);
    panel.querySelector('#mlp-elev').onchange = e => { toggleOverlay('elevTint', e.target.checked); renderLayersPanel(); };
    panel.querySelector('#mlp-labels').onchange = e => toggleOverlay('labels', e.target.checked);
    const hazEl = panel.querySelector('#mlp-haz');
    if (hazEl) hazEl.onchange = e => {
      ui.state.showHazards = e.target.checked;
      if (!hazardLayer) return;
      if (e.target.checked) hazardLayer.addTo(map); else hazardLayer.remove();
    };
    const heatEl = panel.querySelector('#mlp-heat');
    if (heatEl) heatEl.onchange = e => {
      ui.state.showHeat = e.target.checked;
      if (!eventHeatLayer) return;
      if (e.target.checked) eventHeatLayer.addTo(map); else eventHeatLayer.remove();
    };
    panel.querySelector('#mlp-rain').onchange = e => toggleOverlay('rain', e.target.checked);
    panel.querySelector('#mlp-clouds').onchange = e => toggleOverlay('clouds', e.target.checked);
    const subEl = panel.querySelector('#mlp-sub');
    if (subEl) subEl.onchange = e => {
      if (e.target.checked && ui.state.drillState) renderSubdistrictLayer(ui.state.drillState);
      else if (subdistrictLayer) { subdistrictLayer.remove(); subdistrictLayer = null; }
    };
    // data mode
    panel.querySelectorAll('.mlp-data-btn').forEach(b => b.onclick = () => {
      ui.state.districtMode = b.dataset.mode;
      if (b.dataset.mode === 'geography' && !ui.state.geoFacet) ui.state.geoFacet = 'zoning';
      restyleActiveLayer();
      renderLayersPanel();
    });
    // geography facet chooser
    panel.querySelectorAll('.mlp-facet').forEach(b => b.onclick = () => {
      ui.state.geoFacet = b.dataset.facet;
      restyleActiveLayer();
      renderLayersPanel();
    });
    panel.querySelector('#mlp-close').onclick = () => { ui.state.layersCollapsed = true; renderLayersPanel(); };
  }

  // Gradient legend for the elevation-tint overlay (metres above sea level).
  function elevTintLegend() {
    const stops = [0, 200, 600, 1200, 2500, 4000];
    const grad = `linear-gradient(90deg, ${stops.map(m => {
      const [r, g, b] = elevRampRGB(m); return `rgb(${r},${g},${b})`;
    }).join(', ')})`;
    return `<div class="mlp-elev-bar" style="background:${grad}"></div>
      <div class="mlp-elev-ticks"><span>0 m</span><span>1.2k</span><span>4k+</span></div>`;
  }

  function geoFacetChooserHTML() {
    const facet = ui.state.geoFacet || 'zoning';
    const facets = [['zoning', '⚖ Zoning & legal'], ['vulnerability', '⚠ Vulnerability'], ['flood', 'Flood'], ['coastal', 'Coastal·CRZ'], ['elevation', 'Elevation'], ['rainfall', 'Rainfall'], ['constraint', 'Constraint']];
    return `<div class="mlp-facets">${facets.map(([k, l]) => `<button class="mlp-facet ${facet === k ? 'on' : ''}" data-facet="${k}">${l}</button>`).join('')}</div>`;
  }

  // Legend for whatever data overlay is active (mirrors the old dmt legends).
  function activeOverlayLegend() {
    const mode = ui.state.districtMode;
    const chip = (bg, txt) => `<span class="mlp-leg"><span class="mlp-chip" style="background:${bg}"></span>${txt}</span>`;
    if (mode === 'money') return chip(seqColor(0.3), 'low') + chip(seqColor(0.95), 'high ₹ in') + `<span class="mlp-leg"><span class="mlp-chip mlp-chip-flag"></span>⚠ freeze/non-delivery</span>`;
    if (mode === 'language') return `<span class="mlp-leg-note">official language per state; district mother-tongue = gap</span>`;
    if (mode === 'politics') return chip('oklch(0.70 0.15 150)', 'aligned') + chip('oklch(0.66 0.20 28)', 'opposition') + chip('oklch(0.60 0.05 250)', 'UT/other');
    if (mode === 'coverage') return chip(Coverage.color(5), 'baseline') + chip(Coverage.color(20), 'thin') + chip(Coverage.color(45), 'partial') + chip(Coverage.color(75), 'deep') + `<span class="mlp-leg-note">how much of each district is pinned to sources vs. a gap — data density, NOT quality or risk</span>`;
    if (mode === 'health') return chip(healthColorFor('Kerala'), 'low IMR (better)') + chip(healthColorFor('Assam'), 'mid') + chip(healthColorFor('Uttar Pradesh'), 'high IMR') + `<span class="mlp-leg-note">infant mortality per 1,000 (NFHS-5, state-level) — juxtaposed, not a verdict</span>`;
    if (mode === 'economy') return chip(economyColorFor('Bihar'), 'lower income') + chip(economyColorFor('Rajasthan'), 'middle') + chip(economyColorFor('Goa'), 'high income') + `<span class="mlp-leg-note">per-capita NSDP (RBI Handbook, state-level) — the 'wealth' axis</span>`;
    if (mode === 'geography') {
      const f = ui.state.geoFacet || 'zoning';
      if (f === 'zoning') {
        const z = k => zoningZone(k);
        return chip(z({ unsafe_zone: { documented: true } }).color, 'unsafe / no-development')
          + chip(z({ on_coast: true }).color, 'CRZ (coastal)')
          + chip(z({ flood_level: 'district-chronic' }).color, 'flood-hazard')
          + chip(z({ paleochannel: { documented: true } }).color, 'river channel / encroached')
          + chip(z({ flood_level: 'state-flood-prone' }).color, 'flood-prone (state)')
          + chip(z({}).color, 'no flagged zone')
          + `<span class="mlp-leg-note">the LEGAL/regulatory zone that governs what can be built here — click a district for the specific rule. Strongest restriction wins where several apply.</span>`;
      }
      if (f === 'vulnerability') return chip(Vuln.color(1), '1') + chip(Vuln.color(2), '2') + chip(Vuln.color(4), '4') + chip(Vuln.color(6), '6') + chip(Vuln.color(Vuln.MAX || 8), `${Vuln.MAX || 8} signals`) + `<span class="mlp-leg-note">count of overlapping sourced risk signals (flood, low-lying, rain, encroachment, palaeochannel, unsafe-zone, monsoon, encroach-zone) — not a score</span>`;
      if (f === 'coastal') return chip(geoFacetColor({ on_coast: true }, 'coastal'), 'coastal · CRZ') + chip(geoFacetColor({ on_coast: false }, 'coastal'), 'inland');
      if (f === 'flood') return chip(geoFacetColor({ flood_level: 'district-chronic' }, 'flood'), 'chronic (CWC/NDMA)') + chip(geoFacetColor({ flood_level: 'state-flood-prone' }, 'flood'), 'state-level') + chip(geoFacetColor({ flood_level: 'not-flagged' }, 'flood'), 'not flagged');
      if (f === 'elevation') return chip(geoFacetColor({ elevation: { centroid_m: 50 } }, 'elevation'), 'lowland') + chip(geoFacetColor({ elevation: { centroid_m: 3200 } }, 'elevation'), 'high mountain') + `<span class="mlp-leg-note">SRTM centroid m</span>`;
      if (f === 'rainfall') return chip(geoFacetColor({ rainfall: { band: 'arid' } }, 'rainfall'), 'arid') + chip(geoFacetColor({ rainfall: { band: 'moderate' } }, 'rainfall'), 'moderate') + chip(geoFacetColor({ rainfall: { band: 'very-high' } }, 'rainfall'), 'very-high');
      return chip(geoColor({ on_coast: true, flood_prone: true }), 'coast+flood') + chip(geoColor({ flood_prone: true }), 'flood') + chip(geoColor({ on_coast: true }), 'coast') + chip(geoColor({ terrain: 'himalayan-hill' }), 'hill');
    }
    return `<span class="mlp-leg-note">population (Census 2011)</span>`;
  }

  // ---- Metres-above-sea-level readout: hover/click any point → its exact MSL
  // from open SRTM (open-elevation API). Point-level, fully zoomable — not the
  // district centroid. Debounced + cached so we don't hammer the free API.
  const elevCache = new Map();          // "lat,lon" (rounded) -> metres
  let elevTimer = null, elevBox = null;
  function setupElevationReadout() {
    elevBox = document.createElement('div');
    elevBox.className = 'msl-readout';
    elevBox.innerHTML = '<span class="msl-ico">⛰</span> hover the map for elevation';
    const host = document.getElementById('india-map');
    if (host) host.appendChild(elevBox);

    const roundKey = (lat, lng) => `${lat.toFixed(3)},${lng.toFixed(3)}`;
    async function lookup(lat, lng) {
      const key = roundKey(lat, lng);
      if (elevCache.has(key)) return elevCache.get(key);
      try {
        const r = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`);
        const j = await r.json();
        const m = j?.results?.[0]?.elevation;
        if (typeof m === 'number') { elevCache.set(key, m); return m; }
      } catch (e) { /* API down → show coords only */ }
      return null;
    }
    function show(lat, lng, m) {
      const coord = `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
      elevBox.innerHTML = (m == null)
        ? `<span class="msl-ico">⛰</span> ${coord} · <span class="msl-gap">elev…</span>`
        : `<span class="msl-ico">⛰</span> ${coord} · <b>${Math.round(m)} m</b> above sea level <span class="msl-src">SRTM</span>`;
    }
    map.on('mousemove', (e) => {
      const { lat, lng } = e.latlng;
      show(lat, lng, elevCache.get(roundKey(lat, lng)) ?? null);
      clearTimeout(elevTimer);
      elevTimer = setTimeout(async () => {
        const m = await lookup(lat, lng);
        // only update if cursor hasn't moved far since
        show(lat, lng, m);
      }, 260);
    });
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      const m = await lookup(lat, lng);
      show(lat, lng, m);
    });
  }

  // News-bubble layer: one circle per district with news/fiscal activity.
  // Size scales with activity; red = a dysfunction flag (freeze/audit). Click →
  // that district + its timeline. Honest: only districts with real events appear.
  function buildNewsBubbles() {
    if (!map || !BUBBLES || !(BUBBLES.bubbles || []).length) return;
    newsBubbleLayer = L.layerGroup();
    // Bubble size = SCALE OF PROBLEM (max severity score 0-12), falling back to
    // raw activity count where severity is absent.
    const useSev = BUBBLES.bubbles.some(b => (b.max_severity || 0) > 0);
    const maxMetric = Math.max(...BUBBLES.bubbles.map(b => useSev ? (b.max_severity || 0) : (b.events + b.news)), 1);
    const SEV_COLOR = { severe: 'oklch(0.64 0.24 25)', high: 'oklch(0.72 0.18 45)', moderate: 'oklch(0.80 0.15 75)', low: 'oklch(0.78 0.13 150)' };
    for (const b of BUBBLES.bubbles) {
      const metric = useSev ? (b.max_severity || 0) : (b.events + b.news);
      const r = 7 + 14 * Math.sqrt(metric / maxMetric);   // area-ish scaling by severity
      const color = b.top_band ? (SEV_COLOR[b.top_band] || 'oklch(0.80 0.16 75)') : (b.flagged ? 'oklch(0.65 0.22 25)' : 'oklch(0.80 0.16 75)');
      const m = L.circleMarker([b.lat, b.lon], {
        radius: r, color, weight: 1.5,
        fillColor: color, fillOpacity: 0.35,
        className: 'news-bubble' + (b.flagged ? ' news-bubble--flag' : ''),
      });
      m.bindTooltip(
        `<b>${esc(b.district)}</b>, ${esc(b.state)}<br>` +
        `${b.events} event${b.events === 1 ? '' : 's'}${b.news ? ` · ${b.news} news` : ''}` +
        `${b.max_severity ? `<br>scale of problem: <b>${esc(b.top_band)}</b> (${b.max_severity}/12)` : ''}` +
        `${b.flagged ? '<br>⚑ flagged (fund freeze / audit)' : ''}` +
        `${b.top_title ? `<br><span style="opacity:.8">${esc(b.top_title)}</span>` : ''}`,
        { direction: 'top', className: 'news-bubble-tip' }
      );
      m.on('click', () => {
        if (b.district) { selectState(b.state, true); drillIntoDistricts(b.state).then(() => selectDistrict(b.district, b.state)); }
        else selectState(b.state, true);   // state-level news bubble
      });
      m.addTo(newsBubbleLayer);
    }
    if (ui.state.showNews) newsBubbleLayer.addTo(map);
    // Event heatmap (density of news+events), built from the same bubbles' weights.
    if (typeof EventHeatmap !== 'undefined') {
      const heatPts = BUBBLES.bubbles
        .filter(b => typeof b.lat === 'number' && (b.weight || b.events || b.news))
        .map(b => ({ lat: b.lat, lon: b.lon, weight: b.weight || (b.events * 1.5 + b.news) || 1 }));
      eventHeatLayer = EventHeatmap.create(heatPts, { radius: 34, refZoom: 5, opacity: 0.7 });
      if (ui.state.showHeat) eventHeatLayer.addTo(map);
    }
    renderNewsToggle();
    renderLayersPanel();   // reflect news/heat toggles now data's here
  }

  // Polygon centroid (average of the outer ring vertices) — good enough to place a
  // marker inside a district. Handles Polygon + MultiPolygon (largest ring).
  function featureCentroid(feature) {
    const g = feature.geometry; if (!g) return null;
    let ring = null;
    if (g.type === 'Polygon') ring = g.coordinates[0];
    else if (g.type === 'MultiPolygon') ring = g.coordinates.map(p => p[0]).sort((a, b) => b.length - a.length)[0];
    if (!ring || !ring.length) return null;
    let x = 0, y = 0; for (const [lon, lat] of ring) { x += lon; y += lat; }
    return [y / ring.length, x / ring.length];   // [lat, lon]
  }

  // HAZARD & ZONING MARKERS — annotate the MAP itself (not just the panel) with the
  // pinned risk data for the drilled state: legal zone (CRZ/unsafe), palaeochannel,
  // encroachment case/zone, flood-chronic. Each marker's tooltip names the specific
  // hazard + its legal note, so zooming into a place shows what's actually there.
  function buildHazardMarkers(stateName, geo) {
    if (hazardLayer) { hazardLayer.remove(); hazardLayer = null; }
    hazardLayer = L.layerGroup();
    let n = 0;
    for (const f of geo.features) {
      const dn = f.properties.DISTRICT;
      const gd = dimGeoFor(stateName, dn);
      if (!gd) continue;
      const items = hazardItems(gd);
      if (!items.length) continue;
      const c = featureCentroid(f);
      if (!c) continue;
      const zone = zoningZone(gd);
      const top = items[0];   // strongest icon drives the marker colour
      const html = `<div class="haz-pin" style="--hc:${zone.color}">${top.icon}${items.length > 1 ? `<span class="haz-pin-n">${items.length}</span>` : ''}</div>`;
      const mk = L.marker(c, {
        icon: L.divIcon({ className: 'haz-divicon', html, iconSize: [26, 26], iconAnchor: [13, 13] }),
      });
      mk.bindTooltip(
        `<b>${esc(dn)}</b> — <span style="color:${zone.color}">${esc(zone.label)}</span>` +
        items.map(it => `<br>${it.icon} ${esc(it.text)}`).join(''),
        { direction: 'top', className: 'haz-tip', opacity: 0.97 });
      mk.on('click', () => selectDistrict(dn, stateName));
      mk.addTo(hazardLayer);
      n++;
    }
    if (ui.state.showHazards && n) hazardLayer.addTo(map);
    return n;
  }

  // The concrete hazards pinned to a district → [{icon, text}], strongest first.
  function hazardItems(g) {
    const out = [];
    if (g.unsafe_zone?.documented) out.push({ icon: '⛔', text: `Unsafe / no-development: ${g.unsafe_zone.zone || ''}` });
    if (g.crz?.applies || g.on_coast) out.push({ icon: '🌊', text: 'Coastal Regulation Zone — near-shore construction legally capped (CRZ 2019)' });
    if (g.flood_level === 'district-chronic') out.push({ icon: '💧', text: 'Flood-chronic (CWC/NDMA/Bhuvan)' });
    if (g.paleochannel?.documented) out.push({ icon: '〰️', text: `On a river\'s old bed: ${g.paleochannel.river || 'palaeochannel'}` });
    if (g.encroachment_zone?.documented) out.push({ icon: '🚧', text: `Encroachment zone: ${g.encroachment_zone.zone_type || ''}` });
    else if (g.encroachment?.cases?.length) out.push({ icon: '🚧', text: `${g.encroachment.cases.length} documented encroachment case${g.encroachment.cases.length > 1 ? 's' : ''} (NGT/court)` });
    if (g.monsoon_inundation?.documented) out.push({ icon: '🌧️', text: `Monsoon inundation: ${g.monsoon_inundation.season || ''}` });
    return out;
  }

  function renderNewsToggle() {
    if (!map || document.getElementById('news-toggle-ctl')) return;
    const Ctl = L.Control.extend({
      options: { position: 'topright' },
      onAdd() {
        const div = L.DomUtil.create('div', 'news-toggle-ctl');
        div.id = 'news-toggle-ctl';
        const n = (BUBBLES?.bubbles || []).length;
        div.innerHTML = `<button class="news-toggle-btn ${ui.state.showNews ? 'on' : ''}" title="Show districts with news / fiscal events">📰 News${n ? ` · ${n}` : ''}</button>`;
        L.DomEvent.disableClickPropagation(div);
        div.querySelector('button').addEventListener('click', () => {
          ui.state.showNews = !ui.state.showNews;
          if (ui.state.showNews) newsBubbleLayer && newsBubbleLayer.addTo(map);
          else newsBubbleLayer && newsBubbleLayer.remove();
          div.querySelector('button').classList.toggle('on', ui.state.showNews);
        });
        return div;
      }
    });
    map.addControl(new Ctl());
  }

  async function bootstrap() {
    try {
      // CRITICAL PATH ONLY — the small files the first paint needs (map + states +
      // fiscal year data). The heavy ~10 MB district-ledger.json is NOT awaited here;
      // it loads in the background (loadLedger) so the map paints immediately.
      const [geoRes, dataRes, extrasRes, popRes] = await Promise.all([
        fetch('india-states.geojson'),
        fetch('india-fiscal.json'),
        fetch('india-extras.json'),
        fetch('district-pop.json'),
      ]);
      if (!geoRes.ok) throw new Error('GeoJSON HTTP ' + geoRes.status);
      if (!dataRes.ok) throw new Error('Fiscal JSON HTTP ' + dataRes.status);
      GEO = await geoRes.json();
      DATA = await dataRes.json();
      if (extrasRes.ok) EXTRAS = await extrasRes.json();
      else console.warn('india-extras.json missing — proceeding without governance footprint');
      if (popRes.ok) DISTRICT_POP = await popRes.json();
      else console.warn('district-pop.json missing — district drill-down will show names only');

      ui.state.yearIdx = DATA._meta.years.length - 1;
      // Compute the color domain BEFORE building the map: Leaflet's GeoJSON layer
      // synchronously invokes the style callback for every feature during construction,
      // which calls fillStyle → colorFor(domain). Without this, domain is undefined and
      // colorFor crashes on the first paint.
      ui._domain = computeDomain(VIEWS[ui.state.view], ui.state.yearIdx);
      wireControls();
      buildMap();
      setupMapExpand();
      repaint();

      // Background (non-blocking): the heavy ledger + secondary data. The map is
      // already interactive; these light up news bubbles, search, scrubber, and the
      // district drill when they arrive.
      const ledgerReady = loadLedgerAndExtras();
      // A deep-link may target a district (needs the ledger) — wait for it in that case.
      if (/[?&](state|district)=/.test(location.search)) await ledgerReady;
      await applyDeepLink();
    } catch (err) {
      console.error('Bootstrap failed:', err);
      const wrap = $ind('#india-map-wrap');
      if (wrap) {
        wrap.innerHTML = `<div style="padding:2rem;color:var(--muted-foreground);font-family:var(--font-mono);font-size:12px"><strong style="color:var(--foreground)">Bootstrap failed.</strong><br/><br/><code style="display:block;background:oklch(0.18 0 0);padding:0.5rem;border-radius:4px;color:oklch(0.7 0.18 30)">${esc(err.message)}</code><br/>If you're opening the HTML file directly (file://), serve it over HTTP instead:<br/><code>python3 -m http.server 8000</code></div>`;
      }
    }
  }

  // Background loader for the heavy ledger + secondary data. Kept OFF the first-paint
  // critical path so the map is interactive immediately; wires up the features that
  // depend on this data (news bubbles, search, time scrubber, block list) once ready.
  // Returns a promise so a district deep-link can await it. Idempotent-ish (guarded).
  let _ledgerPromise = null;
  function loadLedgerAndExtras() {
    if (_ledgerPromise) return _ledgerPromise;
    _ledgerPromise = (async () => {
      const grab = async (url, opt) => { try { const r = await fetch(url); return r.ok ? await r.json() : null; } catch (e) { return null; } };
      const [ledger, blocks, pay, events, news, bubbles, feed] = await Promise.all([
        grab('district-ledger.json'), grab('india-blocks.json'), grab('pay-scales.json'),
        grab('fiscal-events.json'), grab('approved-news.json'), grab('news-bubbles.json'),
        grab('news-feed.json'),
      ]);
      if (ledger) LEDGER = ledger; else console.warn('district-ledger.json missing — money-flow ledger will be skipped');
      if (blocks) BLOCKS = blocks;
      if (pay) PAY = pay;
      if (events) EVENTS = events;
      if (news) NEWS = news;
      if (bubbles) BUBBLES = bubbles;
      if (feed) { NEWS_FEED = feed; indexNewsByLocation(feed); }
      // Now-available features that need the ledger / bubbles:
      buildNewsBubbles();
      setupMapSearch();
      setupTimeScrubber();
      setupMapQuery();
      // If a district panel is already open, re-render it now the ledger's here.
      if (ui.state.drillState && ui.state.selected) renderDetail(ui.state.selected);
    })();
    return _ledgerPromise;
  }

  // (Deep-zoom note + zoom/scale readout now live in map-ui.js → MapUI.setup.)

  // ================= MAP QUERY — turn the map into a cross-India query surface.
  // Pick facets (query-engine.js), AND/OR them, and matching districts light up
  // across ALL states: their state glows, a marker sits at each match, a results
  // tray lists them (click → deep dive into that district), and the query lives in
  // a shareable ?q=crz,flood&mode=AND URL.
  let QENGINE = null, queryMatchLayer = null;
  const queryState = { keys: new Set(), mode: 'AND', open: false };

  function setupMapQuery() {
    if (typeof QueryEngine === 'undefined' || !LEDGER || QENGINE) return;
    // news-count map so the coverage facet is accurate on the map too
    const nc = {};
    for (const [k, arr] of newsByDistrict) nc[k] = arr.length;
    QENGINE = QueryEngine.build(LEDGER, { newsCounts: nc });
    // restore a query from the URL (?q=crz,flood&mode=OR)
    const qs = new URLSearchParams(location.search);
    const q = qs.get('q');
    if (q) {
      q.split(',').map(s => s.trim()).filter(Boolean).forEach(k => { if (QENGINE.facetByKey[k]) queryState.keys.add(k); });
      if ((qs.get('mode') || '').toUpperCase() === 'OR') queryState.mode = 'OR';
      if (queryState.keys.size) queryState.open = true;
    }
    buildMapQueryPanel();
    if (queryState.keys.size) runMapQuery();
  }

  function buildMapQueryPanel() {
    const wrap = document.getElementById('india-map-wrap');
    if (!wrap || document.getElementById('map-query')) return;
    const el = document.createElement('div');
    el.id = 'map-query';
    el.className = 'map-query' + (queryState.open ? '' : ' collapsed');
    wrap.appendChild(el);
    renderMapQueryPanel();
  }

  function mapQueryFacetGroups() {
    const groups = {};
    for (const f of QENGINE.facets) (groups[f.group] = groups[f.group] || []).push(f);
    return groups;
  }

  function renderMapQueryPanel() {
    const el = document.getElementById('map-query');
    if (!el) return;
    if (!queryState.open) {
      const n = queryState.keys.size;
      el.className = 'map-query collapsed';
      el.innerHTML = `<button class="mq-toggle" id="mq-open" title="Query the map — filter all 594 districts">🔎 Query${n ? ` · ${n}` : ''}</button>`;
      el.querySelector('#mq-open').onclick = () => { queryState.open = true; renderMapQueryPanel(); };
      return;
    }
    el.className = 'map-query';
    const groups = mapQueryFacetGroups();
    const groupHtml = Object.entries(groups).map(([g, fs]) => `
      <div class="mq-group"><div class="mq-group-h">${esc(g)}</div>
        ${fs.map(f => `<label class="mq-facet ${queryState.keys.has(f.key) ? 'on' : ''}" title="${esc(f.describe)}">
          <input type="checkbox" data-fkey="${f.key}" ${queryState.keys.has(f.key) ? 'checked' : ''}> ${esc(f.label)}
          <span class="mq-n">${QENGINE.run([f.key], 'AND').length}</span></label>`).join('')}
      </div>`).join('');
    const matches = QENGINE.run([...queryState.keys], queryState.mode);
    el.innerHTML = `
      <div class="mq-head">
        <span class="mq-title">🔎 Query the map</span>
        <button class="mq-x" id="mq-close" title="Collapse">✕</button>
      </div>
      <div class="mq-mode">
        <button class="mq-mode-btn ${queryState.mode === 'AND' ? 'on' : ''}" data-mode="AND">ALL</button>
        <button class="mq-mode-btn ${queryState.mode === 'OR' ? 'on' : ''}" data-mode="OR">ANY</button>
        ${queryState.keys.size ? `<button class="mq-clear" id="mq-clear">clear</button><button class="mq-share" id="mq-share" title="Copy a shareable link to this query">🔗 share</button>` : ''}
      </div>
      <div class="mq-facets">${groupHtml}</div>
      <div class="mq-result-h">${queryState.keys.size ? `<b>${matches.length}</b> match${matches.length === 1 ? '' : 'es'}` : `Pick facets to filter all ${QENGINE.rows.length} districts`}</div>
      <div class="mq-results">${renderMapQueryResults(matches)}</div>`;

    el.querySelectorAll('[data-fkey]').forEach(cb => cb.onchange = () => {
      cb.checked ? queryState.keys.add(cb.dataset.fkey) : queryState.keys.delete(cb.dataset.fkey);
      renderMapQueryPanel(); runMapQuery();
    });
    el.querySelectorAll('.mq-mode-btn').forEach(b => b.onclick = () => { queryState.mode = b.dataset.mode; renderMapQueryPanel(); runMapQuery(); });
    const clr = el.querySelector('#mq-clear'); if (clr) clr.onclick = () => { queryState.keys.clear(); renderMapQueryPanel(); runMapQuery(); };
    const shr = el.querySelector('#mq-share'); if (shr) shr.onclick = () => shareMapQuery(shr);
    el.querySelector('#mq-close').onclick = () => { queryState.open = false; renderMapQueryPanel(); };
    el.querySelectorAll('.mq-res').forEach(r => r.onclick = () => {
      const { st, dn } = r.dataset;
      selectState(st, true); drillIntoDistricts(st).then(() => selectDistrict(dn, st));
    });
  }

  // Results tray — grouped by state, each district clickable for a deep dive.
  function renderMapQueryResults(matches) {
    if (!queryState.keys.size) return '';
    if (!matches.length) return `<div class="mq-empty">No district satisfies all of these together — an honest empty result (try ANY, or drop a facet).</div>`;
    const byState = {};
    for (const r of matches) (byState[r.state] = byState[r.state] || []).push(r);
    const cov = r => typeof Coverage !== 'undefined' ? `<span class="mq-cov" style="color:${Coverage.color(r.cov_pct)}">${r.cov_pct}%</span>` : '';
    return Object.entries(byState).sort((a, b) => b[1].length - a[1].length).map(([st, rs]) => `
      <div class="mq-state"><div class="mq-state-h">${esc(st)} <span class="mq-state-n">${rs.length}</span></div>
        ${rs.slice(0, 30).map(r => `<div class="mq-res" data-st="${esc(st)}" data-dn="${esc(r.district)}">
          <span class="mq-res-dn">${esc(r.district)}</span>
          <span class="mq-res-meta">${r.flagged ? '⚠ ' : ''}⚠${r.vuln} ${cov(r)}</span></div>`).join('')}
      </div>`).join('');
  }

  // Run the query: glow matching states, drop a marker at each match, sync the URL.
  function runMapQuery() {
    syncMapQueryURL();
    if (queryMatchLayer) { queryMatchLayer.remove(); queryMatchLayer = null; }
    // If drilled into a state, re-ring its matching district polygons live.
    if (ui.state.mode === 'districts' && ui.state.drillState) highlightQueryDistricts(ui.state.drillState);
    if (!queryState.keys.size) { restyleQueryStateGlow(new Set()); return; }
    const matches = QENGINE.run([...queryState.keys], queryState.mode);
    // count matches per state
    const perState = {};
    for (const r of matches) perState[r.state] = (perState[r.state] || 0) + 1;
    restyleQueryStateGlow(new Set(Object.keys(perState)));
    const maxCount = Math.max(1, ...Object.values(perState));
    // markers at state centroids sized by match count (India-level overview)
    queryMatchLayer = L.layerGroup();
    for (const [st, count] of Object.entries(perState)) {
      const path = pathByName.get(st); if (!path) continue;
      let c; try { c = path.getBounds().getCenter(); } catch (e) { continue; }
      const r = 9 + 12 * Math.sqrt(count / maxCount);
      const mk = L.circleMarker([c.lat, c.lng], { radius: r, color: 'oklch(0.82 0.16 78)', weight: 2, fillColor: 'oklch(0.82 0.16 78)', fillOpacity: 0.28, className: 'mq-marker' });
      mk.bindTooltip(`<b>${esc(st)}</b> · ${count} match${count === 1 ? '' : 'es'}`, { direction: 'top', className: 'news-bubble-tip' });
      mk.on('click', () => { selectState(st, true); drillIntoDistricts(st); });
      mk.addTo(queryMatchLayer);
    }
    queryMatchLayer.addTo(map);
  }

  // Brighten states that contain a match, dim the rest (India-level spread view).
  function restyleQueryStateGlow(matchStates) {
    if (!geoLayer) return;
    const active = queryState.keys.size > 0;
    geoLayer.eachLayer(layer => {
      const nm = layer.feature.properties.ST_NM;
      if (!active) { layer.setStyle(fillStyle(nm)); return; }
      const hit = matchStates.has(nm);
      layer.setStyle({ fillOpacity: hit ? 0.55 : 0.06, weight: hit ? 1.6 : 0.4, color: hit ? 'oklch(0.86 0.16 78)' : 'oklch(0.985 0 0 / 0.12)' });
    });
  }

  // Re-apply the query glow after a repaint (only meaningful at the India/states level).
  function reapplyQueryGlow() {
    if (!QENGINE || !queryState.keys.size || ui.state.mode === 'districts') return;
    const matches = QENGINE.run([...queryState.keys], queryState.mode);
    restyleQueryStateGlow(new Set(matches.map(r => r.state)));
  }

  function syncMapQueryURL() {
    const u = new URL(location.href);
    if (queryState.keys.size) { u.searchParams.set('q', [...queryState.keys].join(',')); u.searchParams.set('mode', queryState.mode); }
    else { u.searchParams.delete('q'); u.searchParams.delete('mode'); }
    history.replaceState(null, '', u);
  }

  function shareMapQuery(btn) {
    syncMapQueryURL();
    const url = location.href;
    const done = () => { const t = btn.textContent; btn.textContent = '✓ copied'; setTimeout(() => btn.textContent = t, 1400); };
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done); else done();
  }

  // ---- Time scrubber: a "change over the years" slider (time-scrubber.js). As the
  // user drags, we highlight timeline hotspots and label how far each water body /
  // floodplain has shrunk BY that year. Ties change-over-time to the map.
  let timeScrubber = null, timeScrubberYear = null, tsPulseLayer = null;
  function setupTimeScrubber() {
    if (typeof TimeScrubber === 'undefined' || !LEDGER) return;
    timeScrubber = TimeScrubber.build(LEDGER, {
      hostId: 'india-map-wrap',
      onYear: (year, snaps) => { timeScrubberYear = year; renderScrubPulses(year, snaps); },
    });
  }

  // Drop a soft pulse ring on each timeline hotspot sized to how much it has changed
  // by `year` (bigger + redder = more loss). Uses news-bubble coords when available,
  // else the state-centroid fallback via the india-states polygons.
  function renderScrubPulses(year, snaps) {
    if (!map) return;
    if (tsPulseLayer) { tsPulseLayer.remove(); tsPulseLayer = null; }
    if (!snaps || !snaps.length) return;
    tsPulseLayer = L.layerGroup();
    for (const s of snaps) {
      const c = hotspotLatLon(s.state, s.district);
      if (!c) continue;
      const loss = s.pct != null ? Math.min(1, Math.abs(Math.min(0, s.pct)) / 60) : 0;   // 0..1 by up to 60% loss
      const r = 8 + 22 * loss;
      const col = loss > 0 ? `oklch(${0.68 - 0.18 * loss} ${0.14 + 0.1 * loss} ${45 - 25 * loss})` : 'oklch(0.72 0.10 200)';
      const ring = L.circleMarker(c, { radius: r, color: col, weight: 2, fillColor: col, fillOpacity: 0.18, className: 'ts-pulse' });
      ring.bindTooltip(
        `<b>${esc(s.district)}</b> — ${esc((s.subject || '').split(' — ')[0])}<br>` +
        `by <b>${year}</b>: ${s.at ? `${s.at.value} ${esc((s.at.metric || '').replace(/_/g, ' '))}` : '—'}` +
        `${s.pct != null ? ` (<b>${s.pct > 0 ? '+' : ''}${s.pct.toFixed(0)}%</b> since ${s.first.year})` : ''}`,
        { direction: 'top', className: 'haz-tip', opacity: 0.97 });
      ring.on('click', () => { selectState(s.state, true); drillIntoDistricts(s.state).then(() => selectDistrict(s.district, s.state)); });
      ring.addTo(tsPulseLayer);
    }
    tsPulseLayer.addTo(map);
  }

  // Best-effort lat/lon for a hotspot district: news-bubble coord → state polygon centroid.
  function hotspotLatLon(state, district) {
    const b = (BUBBLES?.bubbles || []).find(x => x.state === state && x.district === district);
    if (b) return [b.lat, b.lon];
    const path = pathByName.get(state);
    if (path) { try { const c = path.getBounds().getCenter(); return [c.lat, c.lng]; } catch (e) {} }
    return null;
  }

  // ---- On-map search: type a district/state/place → jump there to view its
  // topography + vulnerability. Reuses selectState/drillIntoDistricts/selectDistrict.
  function setupMapSearch() {
    const input = document.getElementById('map-search-input');
    const box = document.getElementById('map-search-results');
    if (!input || !box || !LEDGER?.states) return;

    // lightweight index: every state + district, with its state for jump-to.
    const IDX = [];
    for (const [sn, sd] of Object.entries(LEDGER.states)) {
      IDX.push({ kind: 'state', name: sn, ctx: `${Object.keys(sd.districts || {}).length} districts`, state: sn });
      for (const dn of Object.keys(sd.districts || {}))
        IDX.push({ kind: 'district', name: dn, ctx: sn, state: sn, district: dn });
    }
    let hits = [], sel = -1;

    function vulnChip(item) {
      const g = LEDGER.states[item.state]?.districts?.[item.district]?.dimensions?.geography;
      if (!g || typeof Vuln === 'undefined') return '';
      const c = Vuln.signals(g).count;
      return c ? ` <span class="msr-vuln" style="color:${Vuln.color(c)}">⚠${c}</span>` : '';
    }
    function render() {
      if (!hits.length) { box.hidden = false; box.innerHTML = `<div class="msr-empty">No match — try a district or state name.</div>`; return; }
      box.hidden = false;
      box.innerHTML = hits.map((h, i) => `
        <div class="msr-item ${i === sel ? 'sel' : ''}" data-i="${i}">
          <span class="msr-kind k-${h.kind}">${h.kind}</span>
          <span class="msr-name">${esc(h.name)}</span>${h.kind === 'district' ? vulnChip(h) : ''}
          <span class="msr-ctx">${esc(h.ctx)}</span>
        </div>`).join('');
      box.querySelectorAll('.msr-item').forEach(el => el.onclick = () => pick(hits[+el.dataset.i]));
    }
    async function pick(h) {
      box.hidden = true; input.value = h.name; sel = -1;
      // switch to the flood/terrain atlas so the user sees topography on arrival
      ui.state.districtMode = 'geography';
      if (!ui.state.geoFacet) ui.state.geoFacet = 'zoning';
      selectState(h.state, true);
      if (h.district) { await drillIntoDistricts(h.state); selectDistrict(h.district, h.state); }
      restyleActiveLayer();
      renderLayersPanel();
    }
    function search(t) {
      t = t.trim().toLowerCase();
      if (!t) { box.hidden = true; hits = []; return; }
      // districts first (more specific), then states; prefix matches rank higher
      hits = IDX.filter(x => x.name.toLowerCase().includes(t) || x.ctx.toLowerCase().includes(t))
        .sort((a, b) => {
          const ap = a.name.toLowerCase().startsWith(t) ? 0 : 1, bp = b.name.toLowerCase().startsWith(t) ? 0 : 1;
          if (ap !== bp) return ap - bp;
          return (a.kind === 'district' ? 0 : 1) - (b.kind === 'district' ? 0 : 1);
        }).slice(0, 25);
      sel = -1; render();
    }
    input.addEventListener('input', () => search(input.value));
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { sel = Math.min(sel + 1, hits.length - 1); render(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { sel = Math.max(sel - 1, 0); render(); e.preventDefault(); }
      else if (e.key === 'Enter' && hits[sel < 0 ? 0 : sel]) { pick(hits[sel < 0 ? 0 : sel]); }
      else if (e.key === 'Escape') { box.hidden = true; input.blur(); }
    });
    document.addEventListener('click', e => { if (!e.target.closest('#map-search')) box.hidden = true; });
  }

  // "India in pixels" — expand the map to near-full-width (collapse the side panel).
  // Leaflet needs invalidateSize after the container resizes so tiles fill the space.
  function setupMapExpand() {
    const btn = document.getElementById('map-expand-btn');
    const shell = document.querySelector('.india-shell');
    if (!btn || !shell) return;
    btn.addEventListener('click', () => {
      const expanded = shell.classList.toggle('map-expanded');
      btn.textContent = expanded ? '⤢' : '⛶';
      btn.title = expanded ? 'Restore panel' : 'Expand map (India in pixels)';
      // let the CSS transition run, then tell Leaflet the container changed size
      setTimeout(() => { if (map) map.invalidateSize({ animate: true }); }, 300);
    });
  }

  // Deep-link: ?state=…&district=… (used by explore.html cross-links).
  // Reuses the featured-district selection sequence so context/back buttons stay correct.
  async function applyDeepLink() {
    try {
      const q = new URLSearchParams(window.location.search);
      const state = q.get('state');
      const district = q.get('district');
      if (!state) return;
      if (!LEDGER?.states?.[state]) return;            // unknown state → ignore, no crash
      selectState(state, true);
      if (district && LEDGER.states[state].districts?.[district]) {
        await drillIntoDistricts(state);
        selectDistrict(district, state);
      }
    } catch (e) { console.warn('Deep-link failed:', e); }
  }

  bootstrap();
})();
