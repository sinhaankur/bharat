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
  ];
  function sitePages() {
    const nav = global.SiteNav && global.SiteNav.NAV;
    if (!nav) return PAGES;
    const labels = Object.fromEntries(PAGES);
    const out = [];
    for (const g of nav) for (const i of g.items) {
      if (i.ext || /^https?:/.test(i.href)) continue;   // palette jumps stay on-site
      out.push([i.href, labels[i.href] || i.text]);
    }
    // pages the palette knows but the nav doesn't surface (e.g. story.html)
    const seen = new Set(out.map(p => p[0]));
    for (const p of PAGES) if (!seen.has(p[0])) out.push(p);
    return out.length ? out : PAGES;
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
    // Pages (always available)
    for (const [href, label] of sitePages())
      out.push({ label, hint: 'page', kind: 'page', key: 'page ' + label,
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

  function search(q) {
    const scored = [];
    for (const it of items) {
      const s = q ? score(q, it.key) : (it.kind === 'layer' ? 0.5 : 0.1);
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
        <input class="cp-input" type="text" placeholder="Jump to a district, layer, story or page…  (Esc to close)" aria-label="Search" autocomplete="off" spellcheck="false" />
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
