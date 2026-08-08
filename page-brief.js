/* page-brief.js — the EDITORIAL CONTRACT block.
   Every page in this India data-magazine carries a consistent orchestration of
   its key information, so a reader always knows: what this is, how it was made,
   what it's sourced from, and where to read the method.

   The editor's standard, in four fields:
     • Explainer     — one line: what this page is / the question it answers
     • Research      — how it was made (method, dataset, model, honesty note)
     • References    — the sources (links or a page like references.html)
     • Documentation — a link to the fuller method / how-it-works

   USAGE — add near the end of a page's <body>:
     <script src="page-brief.js"></script>
     <script>
       PageBrief.set({
         section: "History",
         explainer: "5,000 years of India on one spine…",
         research: "Built from peer-reviewed ancient-DNA papers and Ashoka's edicts; contested points flagged.",
         references: [ {label:"Narasimhan 2019", href:"https://…"}, {label:"All sources", href:"references.html"} ],
         docs: "how-it-works.html",
         updated: "2026-08-06"
       });
     </script>

   It renders into #page-brief if present, else appends before the footer.
   Exposes window.PageBrief. Dependency-free. Honours the sourced-or-gap credo:
   if a field is missing, it says so honestly rather than hiding it. */
(function (global) {
  "use strict";
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function linksHTML(refs) {
    if (!refs) return `<span class="pb-gap">references not yet attached — a gap, not hidden</span>`;
    if (typeof refs === "string") return `<a href="${esc(refs)}">${esc(refs)}</a>`;
    if (!refs.length) return `<span class="pb-gap">references not yet attached</span>`;
    return refs.map(r => {
      const ext = /^https?:/.test(r.href) ? ' target="_blank" rel="noopener"' : "";
      return `<a href="${esc(r.href)}"${ext}>${esc(r.label)}${ext ? " ↗" : ""}</a>`;
    }).join('<span class="pb-sep">·</span>');
  }

  function render(cfg) {
    cfg = cfg || {};
    const rows = [
      { k: "Explainer", ic: "◆", v: cfg.explainer, cls: "pb-explain" },
      { k: "Research",  ic: "⚗", v: cfg.research },
      { k: "References", ic: "❝", v: null, refs: cfg.references },
      { k: "Documentation", ic: "▤", v: null, refs: cfg.docs ? [{ label: "How this was built", href: cfg.docs }, { label: "Methodology", href: "about.html" }] : "about.html" },
    ];
    const body = rows.map(r => `
      <div class="pb-row ${r.cls || ""}">
        <div class="pb-k"><span class="pb-ic">${r.ic}</span>${esc(r.k)}</div>
        <div class="pb-v">${r.refs !== undefined ? linksHTML(r.refs) : (r.v ? esc(r.v) : `<span class="pb-gap">not stated — a gap</span>`)}</div>
      </div>`).join("");
    const meta = [
      cfg.section ? `<span class="pb-section">${esc(cfg.section)}</span>` : "",
      cfg.updated ? `<span class="pb-updated">updated ${esc(cfg.updated)}</span>` : "",
      `<span class="pb-credo">Sourced, or it's a gap.</span>`
    ].filter(Boolean).join("");
    return `<aside class="page-brief" aria-label="About this page">
      <div class="pb-head"><span class="pb-eyebrow">The editorial brief</span>${meta}</div>
      <div class="pb-rows">${body}</div>
    </aside>`;
  }

  function mount(cfg) {
    if (document.getElementById("__page_brief_done")) return;
    const html = render(cfg);
    const host = document.getElementById("page-brief");
    if (host) { host.innerHTML = html; }
    else {
      // insert before the footer if present, else at end of <main>, else body end
      const foot = document.getElementById("sfoot") || document.getElementById("site-footer");
      const main = document.querySelector("main");
      const tmp = document.createElement("div");
      tmp.innerHTML = html;
      const node = tmp.firstElementChild;
      if (foot && foot.parentNode) foot.parentNode.insertBefore(node, foot);
      else if (main) main.appendChild(node);
      else document.body.appendChild(node);
    }
    const flag = document.createElement("span");
    flag.id = "__page_brief_done"; flag.hidden = true;
    document.body.appendChild(flag);
  }

  let pending = null, explicit = false;
  function set(cfg) {
    pending = cfg; explicit = true;
    whenReady(() => mount(pending));
  }
  function whenReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  // AUTO mode: if a page just includes the script (no explicit set()), look up
  // its own filename in page-briefs.json and render that. Explicit set() wins.
  function autoLoad() {
    if (explicit) return;                       // page provided its own brief
    const here = (location.pathname.split("/").pop() || "index.html").toLowerCase() || "index.html";
    const base = (function () {
      const me = document.currentScript || [...document.scripts].find(s => /page-brief\.js/.test(s.src));
      return (me && me.src) ? me.src.replace(/page-brief\.js.*$/, "") : "";
    })();
    fetch(base + "page-briefs.json").then(r => r.ok ? r.json() : null).then(d => {
      if (explicit || !d || !d.briefs) return;  // set() may have fired meanwhile
      const cfg = d.briefs[here];
      if (cfg) whenReady(() => { if (!explicit) mount(cfg); });
    }).catch(function () {/* no brief → nothing, honestly */});
  }
  // give any inline PageBrief.set() a tick to run first, then try auto
  whenReady(function () { setTimeout(autoLoad, 0); });

  global.PageBrief = { set, render };
})(typeof window !== "undefined" ? window : this);
