/* whats-new.js — the homepage "What's new" strip.
   Merges TWO streams into one time-sorted ticker at the top of the map:
     1. SOURCED data-changes (updates.json) — what the atlas newly knows / cited / fixed
     2. Moderated NEWS headlines (news-feed.json) — attributed, link-only press items
   Data-updates are badged distinctly from news so the two are never confused
   (the project's whole credibility rests on that line).

   Dependency-free; self-mounting. Exposes window.WhatsNew.
     WhatsNew.mount(elId, { updates, news, max }) → renders the strip
   If called with no data, it fetches updates.json + news-feed.json itself. */
(function (global) {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // Parse either an ISO date (updates) or an RSS date string (news) → epoch ms.
  function toTime(s) {
    if (!s) return 0;
    const t = Date.parse(s);
    return isNaN(t) ? 0 : t;
  }

  function relDate(ms) {
    if (!ms) return '';
    const d = Math.floor((Date.now() - ms) / 86400000);
    if (d <= 0) return 'today';
    if (d === 1) return 'yesterday';
    if (d < 7) return d + 'd ago';
    if (d < 30) return Math.floor(d / 7) + 'w ago';
    const dt = new Date(ms);
    return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  const KIND_LABEL = { data: 'DATA', source: 'SOURCE', correction: 'FIX', feature: 'NEW' };

  // Normalise both streams into one shape: {t, kind, tag, title, place, href, ext}.
  // Data-updates are the POINT of this strip — they get guaranteed slots up front,
  // then recent news fills the rest. Both stay time-sorted within their group.
  function normalise(updates, news, max) {
    max = max || 24;

    const upd = ((updates && updates.updates) || []).map(u => ({
      t: toTime(u.date), stream: 'update',
      tag: KIND_LABEL[u.kind] || 'DATA',
      title: u.title, place: u.scope || '',
      href: u.link || u.source || '#', ext: /^https?:/.test(u.link || ''),
    })).sort((a, b) => b.t - a.t);

    // News: only ANCHORED, approved items make the homepage strip (unanchored
    // national noise stays off the front door).
    const nitems = (news && (news.news_items || news)) || [];
    const nws = [];
    for (const n of nitems) {
      const mod = n.moderation || {};
      if (mod.status && mod.status !== 'approved' && mod.status !== 'auto') continue;
      const geo = n.geo || {};
      const place = geo.district && geo.state ? `${geo.state} · ${geo.district}`
        : geo.state || (n.outlet_type === 'national' ? '' : '');
      const anchored = place || n.scheme_ref || (n.fiscal_event_ids || []).length;
      if (!anchored) continue;
      nws.push({
        t: toTime(n.published_at), stream: 'news',
        tag: 'NEWS', title: n.headline, place: place,
        href: n.url || '#', ext: true, outlet: n.outlet || '',
      });
    }
    nws.sort((a, b) => b.t - a.t);

    // reserve up to ~1/3 of the strip for data-updates, fill the rest with news
    const updSlots = Math.min(upd.length, Math.max(3, Math.floor(max / 3)));
    const kept = upd.slice(0, updSlots).concat(nws.slice(0, max - updSlots));
    // final ordering: updates first (they're the highlight), then news by recency
    return kept;
  }

  function itemHTML(it) {
    const cls = it.stream === 'update' ? 'wn-item wn-update' : 'wn-item wn-news';
    const tagCls = 'wn-tag wn-tag-' + it.tag.toLowerCase();
    const ext = it.ext ? ' target="_blank" rel="noopener"' : '';
    const place = it.place ? `<span class="wn-place">${esc(it.place)}</span>` : '';
    const outlet = it.outlet ? `<span class="wn-outlet">${esc(it.outlet)}</span>` : '';
    const when = it.t ? `<span class="wn-when">${relDate(it.t)}</span>` : '';
    return `<a class="${cls}" href="${esc(it.href)}"${ext}>
      <span class="${tagCls}">${esc(it.tag)}</span>
      ${place}<span class="wn-title">${esc(it.title)}</span>${outlet}${when}
    </a>`;
  }

  function render(items) {
    if (!items.length) return '';
    const track = items.map(itemHTML).join('');
    return `<div class="wn-strip" role="region" aria-label="What's new">
      <button class="wn-label" aria-label="What's new — sourced updates and news">
        <span class="wn-live-dot"></span>WHAT'S NEW
      </button>
      <div class="wn-viewport"><div class="wn-track">${track}</div></div>
      <a class="wn-more" href="feed.html" title="The full feed">All updates →</a>
      <button class="wn-close" aria-label="Hide">×</button>
    </div>`;
  }

  function wire(host) {
    const close = host.querySelector('.wn-close');
    close && close.addEventListener('click', () => {
      host.classList.add('wn-hidden');
      try { sessionStorage.setItem('wn-hidden', '1'); } catch (e) {}
    });
    // pause the marquee on hover/focus for readability
    const track = host.querySelector('.wn-track');
    const vp = host.querySelector('.wn-viewport');
    if (track && vp) {
      const pause = () => track.style.animationPlayState = 'paused';
      const play = () => track.style.animationPlayState = 'running';
      vp.addEventListener('mouseenter', pause);
      vp.addEventListener('mouseleave', play);
      vp.addEventListener('focusin', pause);
      vp.addEventListener('focusout', play);
    }
  }

  function paint(el, updates, news, opts) {
    const items = normalise(updates, news, opts && opts.max);
    if (!items.length) return;
    el.innerHTML = render(items);
    const host = el.querySelector('.wn-strip');
    if (host) {
      try { if (sessionStorage.getItem('wn-hidden')) host.classList.add('wn-hidden'); } catch (e) {}
      wire(host);
    }
  }

  function mount(elId, data) {
    const el = typeof elId === 'string' ? document.getElementById(elId) : elId;
    if (!el) return;
    data = data || {};
    if (data.updates || data.news) { paint(el, data.updates, data.news, data); return; }
    // fetch both streams ourselves; render whatever arrives (news is optional)
    Promise.allSettled([
      fetch('updates.json').then(r => r.json()),
      fetch('news-feed.json').then(r => r.json()),
    ]).then(([u, n]) => {
      paint(el, u.status === 'fulfilled' ? u.value : null,
                n.status === 'fulfilled' ? n.value : null, data);
    });
  }

  global.WhatsNew = { mount, normalise, render };
})(typeof window !== 'undefined' ? window : this);
