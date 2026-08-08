/* command-palette.js — a Ctrl/Cmd-K command palette over the whole atlas.
   "Immediate context, no onboarding": press ⌘K / Ctrl-K anywhere to jump to any
   of the 594 districts, any state, any map layer, any story chain, or any page.

   Dependency-free. Drives window.AtlasAPI (exposed by app.js) when present, and
   falls back to deep-link URLs (index.html?state=…&district=…) on other pages —
   so the SAME palette works site-wide. Exposes window.CommandPalette.

   Index sources (best-effort, all optional):
     - AtlasAPI.listPlaces()  → states + districts (on the map page)
     - AtlasAPI.getEvents()   → story chains
     - a built-in list of map layers + site pages
*/
(function (global) {
  'use strict';

  const LAYERS = [
    ['money', '💰 Money flow'], ['population', 'Population'],
    ['geography', '⚖ Geography & zoning'], ['health', '🩺 Health'],
    ['economy', '₹ Wealth'], ['language', 'Language'], ['politics', 'Politics'],
    ['coverage', '📊 Data coverage'],
  ];
  // Fallback page list + richer labels. The ACTUAL list comes from SiteNav.NAV
  // (the one place the site's pages are declared) so new pages appear here for free.
  const PAGES = [
    ['index.html', 'Map — the atlas'], ['explore.html', 'Explore / query all districts'],
    ['knowledge.html', 'Knowledge base'], ['timeline.html', 'Timeline & story chains'],
    ['feed.html', 'The feed'], ['story.html', 'Story chains'],
    ['how-it-works.html', 'How it works'], ['command-chain.html', 'Chain of command'],
    ['history.html', 'History race'], ['data.html', 'Data & API'],
    ['references.html', 'Sources'], ['about.html', 'Methodology & disclaimer'],
    ['global.html', 'India vs world'],
    ['geopolitical-chess.html', 'Geopolitical chess — the dollar is the board (a framing)'],
    // the engines: hub + 7 deep pages
    ['engines.html', 'The engines — all 7'],
    ['engine-survey.html', 'Engine: Survey (origin — the map that mapped India)'],
    ['engine-country.html', 'Engine: Country (how India is constituted)'],
    ['engine-development.html', 'Engine: Development (money in → what got built)'],
    ['engine-climate.html', 'Engine: Climate (flood / exposure)'],
    ['engine-zoning.html', 'Engine: Land-Zoning (what can be built here)'],
    ['engine-corruption.html', 'Engine: Corruption (sourced facts, no accusations)'],
    ['engine-news.html', 'Engine: News (moderated, attributed feed)'],
  ];
  // Synonyms / plain-language terms → so "temples", "money", "flood" all route.
  // Each key maps to extra searchable words folded into a page's index text.
  const SYNONYMS = {
    money: 'fiscal budget spending finance cash rupees funds cost',
    temple: 'temples mandir heritage sacred shrine worship religion',
    flood: 'water inundation monsoon drown submerge climate',
    quake: 'earthquake seismic tremor disaster',
    language: 'languages tongue script alphabet linguistic mother-tongue',
    dna: 'genetics ancestry ancestor origin migration blood',
    history: 'historical past ancient old ago timeline',
    ruler: 'king emperor empire reign dynasty government',
    map: 'atlas geography where location place',
    news: 'media press headlines journalism current',
    source: 'sources citation evidence reference proof provenance receipts',
    start: 'begin home intro overview guide help lost where',
  };
  // The site nav (window.ATLAS_NAV) is the authoritative catalog. We fold each
  // item's text + hint + keywords (and its group label) into ONE search string.
  function sitePages() {
    const nav = (global.SiteNav && global.SiteNav.NAV) || global.ATLAS_NAV;
    if (!nav) return PAGES.map(p => [p[0], p[1], '']);
    const labels = Object.fromEntries(PAGES);
    const out = [];
    for (const g of nav) for (const i of g.items) {
      if (i.ext || /^https?:/.test(i.href)) continue;   // palette jumps stay on-site
      const label = labels[i.href] || i.text.replace(/^[★☆]\s*/, '');
      // searchable extra text: hint + keywords + group + expanded synonyms
      let extra = [i.hint || '', i.keywords || '', g.label || ''].join(' ').toLowerCase();
      for (const key in SYNONYMS) if (extra.includes(key)) extra += ' ' + SYNONYMS[key];
      out.push([i.href, label, extra]);
    }
    const seen = new Set(out.map(p => p[0]));
    for (const p of PAGES) if (!seen.has(p[0])) out.push([p[0], p[1], '']);
    return out.length ? out : PAGES.map(p => [p[0], p[1], '']);
  }

  let items = [];         // the searchable index: {label, hint, kind, run()}
  let root, input, list;  // DOM
  let active = 0, filtered = [];
  const onMap = () => !!(global.AtlasAPI && typeof global.AtlasAPI.goTo === 'function');

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // Build (or rebuild) the index from whatever data is available right now.
  function buildIndex() {
    const out = [];
    // Map layers (only meaningful on the map page)
    if (onMap()) {
      for (const [mode, label] of LAYERS)
        out.push({ label, hint: 'layer', kind: 'layer', key: 'layer ' + label,
          run: () => { global.AtlasAPI.setLayer(mode); close(); } });
      // State lenses (VIEWS): fiscal + safety/justice (crime, jails, unrest, …).
      if (typeof global.AtlasAPI.listViews === 'function') {
        try {
          for (const v of global.AtlasAPI.listViews())
            out.push({ label: 'Lens: ' + v.label, hint: v.group === 'safety' ? 'safety lens' : 'state lens',
              kind: 'layer', key: 'lens ' + v.label + ' ' + v.key,
              run: () => { global.AtlasAPI.setView(v.key); close(); } });
        } catch (e) {}
      }
    }
    // States + districts
    let places = [];
    if (onMap()) { try { places = global.AtlasAPI.listPlaces() || []; } catch (e) {} }
    for (const p of places) {
      if (p.type === 'state') {
        out.push({ label: p.state, hint: 'state', kind: 'place', key: 'state ' + p.state,
          run: () => { global.AtlasAPI.goTo(p.state); close(); } });
      } else {
        out.push({ label: p.district, hint: p.state, kind: 'place',
          key: 'district ' + p.district + ' ' + p.state,
          run: () => { global.AtlasAPI.goTo(p.state, p.district); close(); } });
      }
    }
    // Story chains
    let events = null;
    if (onMap()) { try { events = global.AtlasAPI.getEvents(); } catch (e) {} }
    for (const c of (events && events.story_chains) || []) {
      out.push({ label: c.title, hint: 'story chain', kind: 'chain', key: 'chain ' + c.title,
        run: () => { location.href = 'story.html?chain=' + encodeURIComponent(c.id); } });
    }
    // Pages (always available) — `extra` holds hint + keywords + synonyms so
    // plain-language queries ("temples", "money", "flood") route correctly.
    for (const [href, label, extra] of sitePages())
      out.push({ label, hint: 'page', kind: 'page', key: 'page ' + label,
        words: (label + ' ' + (extra || '')).toLowerCase(),
        run: () => { location.href = href; } });

    items = out;
  }

  // Tiny subsequence fuzzy score: all query chars appear in order; earlier + tighter = better.
  function score(q, text) {
    q = q.toLowerCase(); text = text.toLowerCase();
    if (!q) return 0.001;
    let ti = 0, first = -1, last = -1, hits = 0;
    for (let qi = 0; qi < q.length; qi++) {
      const ch = q[qi];
      let found = -1;
      for (; ti < text.length; ti++) { if (text[ti] === ch) { found = ti; ti++; break; } }
      if (found === -1) return -1;
      if (first === -1) first = found;
      last = found; hits++;
    }
    const spread = last - first + 1;
    return (hits / spread) + (first === 0 ? 0.6 : 0) - first * 0.002;
  }

  // Common words we ignore in natural-language queries ("where does the money go").
  const STOP = new Set(['the','a','an','of','to','in','on','is','are','and','or','for',
    'do','does','how','what','where','which','who','me','my','i','show','find','go','goes',
    'get','see','this','that','it','with','about','india','indian','bharat']);
  // Whole-word match score over a bag of words (label + keywords + synonyms).
  // Rewards exact word / prefix / substring hits so "temple" finds "Sacred ground".
  // Ignores stopwords, and matches if MOST meaningful terms hit (not necessarily all).
  function wordScore(q, words) {
    if (!q || !words) return -1;
    const all = q.toLowerCase().split(/\s+/).filter(Boolean);
    const terms = all.filter(t => !STOP.has(t));
    const use = terms.length ? terms : all;   // if query is all stopwords, keep them
    let s = 0, hit = 0;
    for (const term of use) {
      if (words.includes(' ' + term + ' ') || words.startsWith(term + ' ') || words.endsWith(' ' + term)) { s += 2.2; hit++; }
      else if (words.includes(' ' + term)) { s += 1.4; hit++; }
      else if (words.includes(term)) { s += 0.7; hit++; }
    }
    if (!hit) return -1;
    // require a majority of meaningful terms to match (so unrelated words don't route)
    if (hit < Math.ceil(use.length / 2)) return -1;
    return s / use.length;
  }

  function search(q) {
    const scored = [];
    for (const it of items) {
      let s;
      if (!q) { s = (it.kind === 'layer' ? 0.5 : 0.1); }
      else {
        // best of: keyword/word match (smart) OR fuzzy subsequence on the key
        const w = it.words ? wordScore(q, it.words) : -1;
        const f = score(q, it.key);
        s = Math.max(w >= 0 ? w + 1 : -1, f);   // +1 so a real word hit beats a loose fuzzy hit
      }
      if (s >= 0) scored.push([s, it]);
    }
    scored.sort((a, b) => b[0] - a[0]);
    return scored.slice(0, 60).map(x => x[1]);
  }

  const KIND_ICON = { place: '📍', layer: '🗺', chain: '🔗', page: '📄' };

  function render() {
    const q = input.value.trim();
    filtered = search(q);
    if (active >= filtered.length) active = Math.max(0, filtered.length - 1);
    list.innerHTML = filtered.length ? filtered.map((it, i) => `
      <li class="cp-item ${i === active ? 'is-active' : ''}" data-i="${i}" role="option" aria-selected="${i === active}">
        <span class="cp-ic">${KIND_ICON[it.kind] || '•'}</span>
        <span class="cp-label">${esc(it.label)}</span>
        <span class="cp-hint">${esc(it.hint || '')}</span>
      </li>`).join('') : `<li class="cp-empty">No matches for “${esc(q)}”</li>`;
    const el = list.querySelector('.is-active');
    if (el) el.scrollIntoView({ block: 'nearest' });
  }

  function open() {
    if (!root) build();
    buildIndex();               // refresh (data may have loaded since last open)
    root.hidden = false;
    input.value = ''; active = 0;
    render();
    input.focus();
    document.documentElement.style.overflow = 'hidden';
  }
  function close() {
    if (!root) return;
    root.hidden = true;
    document.documentElement.style.overflow = '';
  }
  function toggle() { root && !root.hidden ? close() : open(); }

  function build() {
    root = document.createElement('div');
    root.className = 'cp-overlay'; root.id = 'command-palette'; root.hidden = true;
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Command palette');
    root.innerHTML = `
      <div class="cp-box" role="combobox" aria-expanded="true">
        <input class="cp-input" type="text" placeholder="Search anything — “temples”, “flood”, “money”, a district, a page…" aria-label="Search" autocomplete="off" spellcheck="false" />
        <ul class="cp-list" role="listbox"></ul>
        <div class="cp-foot"><span><b>↑↓</b> navigate</span><span><b>↵</b> open</span><span><b>esc</b> close</span><span class="cp-brand">⌘K anywhere</span></div>
      </div>`;
    document.body.appendChild(root);
    input = root.querySelector('.cp-input');
    list = root.querySelector('.cp-list');

    input.addEventListener('input', () => { active = 0; render(); });
    root.addEventListener('mousedown', e => { if (e.target === root) close(); });
    list.addEventListener('mousemove', e => {
      const li = e.target.closest('.cp-item'); if (li) { active = +li.dataset.i; render(); }
    });
    list.addEventListener('click', e => {
      const li = e.target.closest('.cp-item'); if (li) { filtered[+li.dataset.i]?.run(); }
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(filtered.length - 1, active + 1); render(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(0, active - 1); render(); }
      else if (e.key === 'Enter') { e.preventDefault(); filtered[active]?.run(); }
      else if (e.key === 'Escape') { e.preventDefault(); close(); }
    });
  }

  // Global hotkey: ⌘K / Ctrl-K (and "/" when not typing in a field).
  document.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if ((e.metaKey || e.ctrlKey) && k === 'k') { e.preventDefault(); toggle(); return; }
    if (k === '/' && !/^(input|textarea|select)$/i.test((e.target.tagName || '')) && (!root || root.hidden)) {
      e.preventDefault(); open();
    }
  });

  global.CommandPalette = { open, close, toggle };
})(typeof window !== 'undefined' ? window : this);
