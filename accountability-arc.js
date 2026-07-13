/* accountability-arc.js — one renderer for the story-chain accountability unit:
   PROMISE (entity's own quoted words + source) → RESULT (documented, sourced) →
   ACTUAL COST (total ₹ + ₹ per resident, each cited, scope-labelled) → HUMAN
   IMPACT (plain "for people" effect). A structured, sourced record — a different
   source of truth from a news channel's claims.

   Shared by app.js (map panel), story.html, timeline.html so the arc lives in ONE
   place. Dependency-free; exposes window.AccountabilityArc.render(chain) → HTML string.
   Defensible by construction: promise is quoted + cited, motive is never inferred,
   cost scope is always shown. See fiscal-events.json _meta.accountability_rules. */
(function (global) {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function num(n) { return Number(n).toLocaleString('en-IN'); }
  const confCls = c => ({ documented: 'pos', reported: 'warm', alleged: 'bad' }[c] || 'warm');

  // A tiny source footnote (⧉ tierN → outbound link). Kept self-contained so the
  // module needs nothing from the host page.
  function srcFoot(s) {
    if (!s || !s.url) return '';
    const tier = s.source_tier != null ? `T${esc(s.source_tier)}` : 'src';
    const title = esc(s.title || s.url);
    return ` <a class="acc-src" href="${esc(s.url)}" target="_blank" rel="noopener" title="${title}">⧉ ${tier}</a>`;
  }

  function render(c) {
    if (!c || !(c.promise || c.result || c.actual_cost || c.human_impact)) return '';
    const rows = [];

    if (c.promise) {
      rows.push(`<div class="acc-row acc-row--promise">
        <span class="acc-key">Promised</span>
        <span class="acc-val">${c.promise.entity ? `<b>${esc(c.promise.entity)}</b>: ` : ''}${esc(c.promise.stated)}${srcFoot(c.promise.source)}</span></div>`);
    }
    if (c.result) {
      rows.push(`<div class="acc-row acc-row--result">
        <span class="acc-key">Result</span>
        <span class="acc-val">${esc(c.result.stated)}${c.result.confidence ? ` <span class="acc-conf acc-conf--${confCls(c.result.confidence)}">${esc(c.result.confidence)}</span>` : ''}</span></div>`);
    }
    if (c.actual_cost) {
      const ac = c.actual_cost;
      const pc = ac.per_capita_inr != null
        ? `<span class="acc-percap">₹${num(ac.per_capita_inr)}<span class="acc-percap-unit">/resident</span></span>`
        : (ac.figure_gap ? '<span class="acc-gap">per-capita: gap</span>' : '');
      const tot = ac.amount_cr != null
        ? `<span class="acc-total">(₹${num(ac.amount_cr)} cr${ac.scope ? `, ${esc(ac.scope)}-wide` : ''})</span>` : '';
      rows.push(`<div class="acc-row acc-row--cost">
        <span class="acc-key">Actual cost</span>
        <span class="acc-val">${pc} ${tot}${srcFoot(ac.source)}${ac.per_capita_note ? `<br><span class="acc-note">${esc(ac.per_capita_note)}</span>` : ''}</span></div>`);
    }
    if (c.human_impact) {
      rows.push(`<div class="acc-row acc-row--impact">
        <span class="acc-key">For people</span>
        <span class="acc-val">${esc(c.human_impact)}</span></div>`);
    }
    return `<div class="acc-arc">${rows.join('')}</div>`;
  }

  global.AccountabilityArc = { render };
})(typeof window !== 'undefined' ? window : this);
