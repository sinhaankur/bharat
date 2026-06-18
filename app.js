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

  const ui = { state: { view: 'ownTax', yearIdx: 9, selected: null, hover: null, mode: 'states', drillState: null, drillDistrict: null, districtMode: 'population' } };

  let DATA = null, EXTRAS = null, GEO = null, DISTRICT_POP = null, BLOCKS = null, LEDGER = null, PAY = null;
  let map = null, geoLayer = null, districtLayer = null;
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

  function fillStyle(name) {
    const view = VIEWS[ui.state.view];
    const r = rowFor(name, ui.state.yearIdx);
    if (!r) return { color: 'oklch(0.985 0 0 / 0.18)', weight: 0.5, fillColor: 'oklch(0.22 0 0)', fillOpacity: 0.55, className: 'india-state-path no-data' };
    const v = view.compute(r, extFor(name));
    return {
      color: 'oklch(0.985 0 0 / 0.22)',
      weight: 0.5,
      fillColor: colorFor(v, view, ui._domain),
      fillOpacity: 0.92,
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

    districtLayer = L.geoJSON(geo, {
      style: f => {
        const dn = f.properties.DISTRICT;
        if (showMoney) {
          const m = moneyByDistrict.get(dn);
          if (!m) return { className: 'india-state-path', color: 'oklch(0.985 0 0 / 0.2)', weight: 0.5, fillColor: 'oklch(0.2 0 0)', fillOpacity: 0.3 };
          if (m.noFigure) {
            // Data present but no public money figure (e.g. off-books civic spend).
            return { className: 'india-state-path', color: 'oklch(0.72 0.13 250)', weight: 1.5, dashArray: '2 2', fillColor: 'oklch(0.32 0.06 250)', fillOpacity: 0.7 };
          }
          const t = Math.log10(Math.max(1, m.headline + 1)) / Math.max(0.001, logMax);
          return {
            className: 'india-state-path',
            // Flagged (freeze/dysfunction) districts get a red-orange ring; others gold.
            color: m.flagged ? 'oklch(0.65 0.22 25)' : 'oklch(0.85 0.16 80)',
            weight: m.flagged ? 2 : 1.2,
            dashArray: m.flagged ? '4 2' : null,
            fillColor: seqColor(0.2 + 0.75 * t),
            fillOpacity: 0.92
          };
        }
        const pop = getDistrictPop(stateName, dn)?.population;
        const t = pop != null ? (pop - popMin) / Math.max(1, popMax - popMin) : 0;
        return {
          className: 'india-state-path',
          color: 'oklch(0.985 0 0 / 0.45)',
          weight: 0.6,
          fillColor: pop == null ? 'oklch(0.22 0 0)' : seqColor(t),
          fillOpacity: pop == null ? 0.45 : 0.9
        };
      },
      onEachFeature: (feature, layer) => {
        const dn = feature.properties.DISTRICT;
        districtPathByName.set(dn, layer);
        layer.on('mouseover', () => {
          layer.setStyle({ weight: 1.6, color: 'oklch(0.985 0 0)' });
          if (showMoney) updateDistrictMoneyReadout(dn, stateName, moneyByDistrict.get(dn));
          else updateDistrictReadout(dn, stateName, getDistrictPop(stateName, dn)?.population);
        });
        layer.on('mouseout', () => {
          if (ui.state.drillDistrict !== dn) {
            const m = showMoney ? moneyByDistrict.get(dn) : null;
            if (m) layer.setStyle({ weight: m.flagged ? 2 : 1.2, color: m.flagged ? 'oklch(0.65 0.22 25)' : 'oklch(0.85 0.16 80)' });
            else layer.setStyle({ weight: 0.6, color: showMoney ? 'oklch(0.985 0 0 / 0.2)' : 'oklch(0.985 0 0 / 0.45)' });
          }
          updateReadout();
        });
        layer.on('click', () => selectDistrict(dn, stateName));
      }
    }).addTo(map);

    renderDistrictModeToggle(stateName, moneyVals.length);

    try { map.fitBounds(districtLayer.getBounds(), { padding: [30, 30] }); } catch (e) {}
  }

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

  // Toggle: population view ↔ money-flow view for the district layer.
  function renderDistrictModeToggle(stateName, moneyCount) {
    const host = $ind('#india-detail');
    if (!host) return;
    let bar = $ind('#district-mode-toggle');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'district-mode-toggle';
      bar.className = 'district-mode-toggle';
      host.parentNode.insertBefore(bar, host);
    }
    const mode = ui.state.districtMode || 'population';
    const legend = (mode === 'money' && moneyCount) ? `
      <div class="dmt-legend">
        <span class="dmt-leg-item"><span class="dmt-chip" style="background:${seqColor(0.3)}"></span>low</span>
        <span class="dmt-leg-item"><span class="dmt-chip" style="background:${seqColor(0.95)}"></span>high ₹ in <span class="dmt-leg-note">(log scale)</span></span>
        <span class="dmt-leg-item"><span class="dmt-chip dmt-chip--flag"></span>⚠ fund freeze / non-delivery</span>
        <span class="dmt-leg-item"><span class="dmt-chip" style="background:oklch(0.32 0.06 250);border:1.5px dashed oklch(0.72 0.13 250)"></span>data, no public ₹ figure</span>
        <span class="dmt-leg-item"><span class="dmt-chip" style="background:oklch(0.2 0 0);border:1px solid oklch(0.985 0 0 / 0.2)"></span>no data yet</span>
      </div>` : '';
    bar.innerHTML = `
      <div class="dmt-row">
        <span class="dmt-label">Colour districts by</span>
        <button class="dmt-btn ${mode === 'population' ? 'on' : ''}" data-m="population">Population</button>
        <button class="dmt-btn ${mode === 'money' ? 'on' : ''}" data-m="money" ${moneyCount ? '' : 'disabled title="No district money data in this state yet"'}>Money flow ${moneyCount ? `· ${moneyCount}` : ''}</button>
      </div>
      ${legend}`;
    bar.querySelectorAll('.dmt-btn').forEach(b => b.addEventListener('click', () => {
      if (b.disabled) return;
      ui.state.districtMode = b.dataset.m;
      const geo = districtGeoCache.get(stateName);
      if (geo) renderDistrictLayer(geo, stateName);
    }));
  }

  function updateDistrictReadout(district, state, pop) {
    $ind('.readout-label').textContent = `District · ${state}`;
    $ind('.readout-name').textContent = district;
    const valEl = $ind('.readout-value');
    valEl.textContent = pop != null ? `Pop ${pop.toLocaleString('en-IN')} (Census 2011)` : 'Population data pending';
    valEl.style.color = 'oklch(0.78 0.16 70)';
    valEl.style.fontSize = '12.5px';
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
      try { map.fitBounds(selLayer.getBounds(), { padding: [40, 40], maxZoom: 9 }); } catch (e) {}
    }
    renderDistrictDetail(district, state);
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

      ${renderLedgerSection(state, district)}

      ${renderBlockSection(state, district)}

      <div class="india-caveat">
        Census 2011 totals are persons (not lakh / crore). Sex / household figures from the same Census round. IAS Collector posting changes ~every 2–3 years; the current DM's name isn't in this dashboard (no central machine-readable list — would have to scrape state DOPT sites). ${ledgerForDistrict(state, district)?.admin_model === 'split' ? 'Note: this district does <strong>not</strong> follow the one-DM model — see the money-flow section above.' : 'What IS structural: every district has exactly one DM, and that\'s the state\'s only routine IAS field deployment outside the secretariat.'}
      </div>
    `;
    detail.querySelector('#india-back-to-districts')?.addEventListener('click', () => {
      ui.state.drillDistrict = null;
      const geo = districtGeoCache.get(state);
      if (geo) renderDistrictPanel(state, geo);
      districtPathByName.forEach(layer => layer.setStyle({ weight: 0.6, color: 'oklch(0.985 0 0 / 0.45)' }));
      // Zoom back out from the single district to the whole state's districts.
      if (districtLayer && districtLayer.getBounds) {
        try { map.fitBounds(districtLayer.getBounds(), { padding: [30, 30] }); } catch (e) {}
      }
    });
    detail.querySelector('#india-back-to-state')?.addEventListener('click', () => exitDrill(state));
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
      return `
        <div class="india-detail-section-title">Money flow &amp; accountability${adminLabel}</div>
        <div class="ledger-baseline">
          <div class="ledger-baseline-eyebrow">Baseline coverage — not yet deep-sourced</div>
          <p>This district has a structured ledger slot but its money flows, named officials,
          and industrial base haven't been sourced yet. It's classified as a
          <b>${esc(L.admin_model || 'standard')}</b> administration.</p>
          <p class="ledger-baseline-note">Deep, PDF-cited exemplars so far: <b>Kolkata</b> (split metro),
          <b>Birbhum</b> (rural fund-freeze), <b>Jamshedpur</b> (company township). The structure here
          is ready to be filled the same way — nothing is fabricated in the meantime.</p>
          <details class="ledger-gaps"><summary>${(L._gaps || []).length} fields awaiting sourcing</summary><ul>${(L._gaps || []).map(g => `<li>${esc(g)}</li>`).join('')}</ul></details>
        </div>`;
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
          <div class="ledger-row-body">
            <span class="ledger-cell"><b>In</b> ${fmtCr(r.money_in_cr)}</span>
            <span class="ledger-cell"><b>Spent</b> ${fmtCr(w.spent_cr)}</span>
            <span class="ledger-cell"><b>Util</b> ${util}</span>
            ${done ? `<span class="ledger-cell"><b>Done</b> ${esc(done)}</span>` : ''}
          </div>
          <div class="ledger-channel">via ${esc(r.through_dept || '—')} ${srcFootnote(r.source, r.source_tier)}</div>
          ${w.notes ? `<div class="ledger-rownote">${esc(w.notes)}</div>` : ''}
        </div>`;
    }).join('');

    // Roster — who is responsible — with cost-to-government joined from pay-scales.json.
    const roster = L.roster || {};
    const rosterRows = Object.values(roster).filter(o => o && o.name).map(o => {
      const pay = payForPost(o.post) || payForPost((o.post || '').split(' (')[0]);
      const cost = pay?.annual_cost_to_govt_est
        ? `<span class="roster-cost" title="Est. annual cost-to-government for this post (pay-scales.json)">~₹${(pay.annual_cost_to_govt_est / 1e7).toFixed(2)} cr/yr</span>` : '';
      return `<div class="roster-row"><span class="roster-name">${esc(o.name)}</span><span class="roster-post">${esc(o.post)}</span>${cost}${srcFootnote(o.source, o.source_tier)}</div>`;
    }).join('');

    const mps = (L.legislature?.lok_sabha || []).filter(m => m.name).map(m =>
      `<div class="roster-row"><span class="roster-name">${esc(m.name)}</span><span class="roster-post">MP · ${esc(m.constituency || '')} (${esc(m.party || '')})</span>${srcFootnote(m.source, m.source_tier)}</div>`
    ).join('');

    const gapsHtml = (L._gaps && L._gaps.length)
      ? `<details class="ledger-gaps"><summary>${L._gaps.length} known data gaps (recorded, not estimated)</summary><ul>${L._gaps.map(g => `<li>${esc(g)}</li>`).join('')}</ul></details>`
      : '';

    // Industrial plants — the district's economic base (jobs / tax origin).
    const plants = L.plants || [];
    const plantsHtml = plants.length ? `
      <div class="india-detail-section-title" style="margin-top:0.8rem">Industrial base — major plants</div>
      <div class="plants-list">
        ${plants.map(p => `
          <div class="plant-row">
            <div class="plant-head">
              <span class="plant-name">${esc(p.name)}</span>
              <span class="plant-sector">${esc(p.sector || '')}</span>
            </div>
            <div class="plant-meta">
              <span class="plant-tag">${esc(p.ownership || '')}</span>
              ${p.capacity ? `<span class="plant-tag plant-tag--cap">${esc(p.capacity)}</span>` : ''}
              ${p.site_acres ? `<span class="plant-tag">${p.site_acres.toLocaleString('en-IN')} acres</span>` : ''}
              ${srcFootnote(p.source, p.source_tier)}
            </div>
            ${p.significance ? `<div class="plant-note">${esc(p.significance)}</div>` : ''}
            ${p.employment_note ? `<div class="plant-note plant-note--emp">👷 ${esc(p.employment_note)}</div>` : ''}
          </div>`).join('')}
      </div>
      ${L.plants_note ? `<p class="india-caveat">${esc(L.plants_note)}</p>` : ''}` : '';

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

      <div class="india-caveat">
        Block name from Census 2011 sub-district directory. Population, MGNREGA delivery, and PMAY-G performance data not yet integrated for this level — Census PDFs need parsing; MGNREGA's nrega.nic.in lacks a clean open API. Source: <a href="https://censusindia.gov.in" target="_blank" rel="noopener" style="color:oklch(0.78 0.16 70)">censusindia.gov.in</a> directory of sub-districts, cross-checked with state revenue department websites.
      </div>`;
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
    $ind('#district-mode-toggle')?.remove();
    if (districtLayer) { districtLayer.remove(); districtLayer = null; districtPathByName.clear(); }
    // Restore state layer styling
    if (geoLayer) geoLayer.eachLayer(layer => layer.setStyle(fillStyle(layer.feature.properties.ST_NM)));
    if (stateName) selectState(stateName);
    try { map.fitBounds(geoLayer.getBounds(), { padding: [10, 10] }); } catch (e) {}
  }

  function renderEmptyState() {
    $ind('#district-mode-toggle')?.remove();
    const detail = $ind('#india-detail');
    const view = VIEWS[ui.state.view];
    detail.innerHTML = `
      <div class="india-detail-empty">
        <div class="eyebrow">Active view: ${esc(view.shortLabel)} · ${esc(DATA._meta.yearLabels[ui.state.yearIdx])}</div>
        <p class="india-detail-empty-body">Click any state for its 10-year history, governance footprint (IAS · employees · bribe-paid %), departments split (back-office vs public-facing), and structural pros / cons.</p>
        <div id="india-summary" class="india-summary-inline"></div>
      </div>`;
    renderSummary();
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
      worldCopyJump: false,
      minZoom: 4,
      maxZoom: 7,
    }).setView([22.5, 80], 4.5);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      attribution: '&copy; OSM, &copy; CARTO',
      maxZoom: 7,
    }).addTo(map);

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
  }

  async function bootstrap() {
    try {
      const [geoRes, dataRes, extrasRes, popRes, blocksRes, ledgerRes, payRes] = await Promise.all([
        fetch('india-states.geojson'),
        fetch('india-fiscal.json'),
        fetch('india-extras.json'),
        fetch('district-pop.json'),
        fetch('india-blocks.json'),
        fetch('district-ledger.json'),
        fetch('pay-scales.json')
      ]);
      if (!geoRes.ok) throw new Error('GeoJSON HTTP ' + geoRes.status);
      if (!dataRes.ok) throw new Error('Fiscal JSON HTTP ' + dataRes.status);
      GEO = await geoRes.json();
      DATA = await dataRes.json();
      if (extrasRes.ok) EXTRAS = await extrasRes.json();
      else console.warn('india-extras.json missing — proceeding without governance footprint');
      if (popRes.ok) DISTRICT_POP = await popRes.json();
      else console.warn('district-pop.json missing — district drill-down will show names only');
      if (blocksRes.ok) BLOCKS = await blocksRes.json();
      else console.warn('india-blocks.json missing — block list will be skipped');
      if (ledgerRes.ok) LEDGER = await ledgerRes.json();
      else console.warn('district-ledger.json missing — money-flow ledger will be skipped');
      if (payRes.ok) PAY = await payRes.json();
      else console.warn('pay-scales.json missing — cost-to-govt join will be skipped');

      ui.state.yearIdx = DATA._meta.years.length - 1;
      // Compute the color domain BEFORE building the map: Leaflet's GeoJSON layer
      // synchronously invokes the style callback for every feature during construction,
      // which calls fillStyle → colorFor(domain). Without this, domain is undefined and
      // colorFor crashes on the first paint.
      ui._domain = computeDomain(VIEWS[ui.state.view], ui.state.yearIdx);
      wireControls();
      buildMap();
      repaint();
    } catch (err) {
      console.error('Bootstrap failed:', err);
      const wrap = $ind('#india-map-wrap');
      if (wrap) {
        wrap.innerHTML = `<div style="padding:2rem;color:var(--muted-foreground);font-family:var(--font-mono);font-size:12px"><strong style="color:var(--foreground)">Bootstrap failed.</strong><br/><br/><code style="display:block;background:oklch(0.18 0 0);padding:0.5rem;border-radius:4px;color:oklch(0.7 0.18 30)">${esc(err.message)}</code><br/>If you're opening the HTML file directly (file://), serve it over HTTP instead:<br/><code>python3 -m http.server 8000</code></div>`;
      }
    }
  }

  bootstrap();
})();
