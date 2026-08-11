/* related.js — a consistent "Related — read next" block on every classic page.
   Curated cross-links (not just same-section) so a reader can follow a thread across the
   atlas. Reads window.ATLAS_NAV (via SiteNav) for each target's real title + hint, so a
   related link can never drift from the page it points to. Drop <div id="related"></div>
   in a page, or this self-appends before the footer. */
(function () {
  // page (filename) → the 3–4 pages that genuinely connect to it (cross-topic on purpose).
  var RELATED = {
    "feed.html":            ["officials.html", "timeline.html", "atrocities.html", "provenance.html"],
    "timeline.html":        ["feed.html", "command-chain.html", "provenance.html", "state-of-india.html"],
    "atrocities.html":      ["heritage-atlas.html", "ancient-india.html", "deep-history.html", "feed.html"],
    "index.html":           ["state-of-india.html", "explore.html", "command-chain.html", "encroachment-atlas.html"],
    "state-of-india.html":  ["index.html", "explore.html", "global.html", "command-chain.html"],
    "explore.html":         ["index.html", "state-of-india.html", "knowledge.html", "provenance.html"],
    "command-chain.html":   ["officials.html", "timeline.html", "index.html", "provenance.html"],
    "provenance.html":      ["references.html", "knowledge.html", "officials.html", "data.html"],
    "encroachment-atlas.html": ["terrain-3d.html", "flood-3d.html", "quake-tsunami.html", "index.html"],
    "terrain-3d.html":      ["encroachment-atlas.html", "flood-3d.html", "india-3d.html", "quake-tsunami.html"],
    "flood-3d.html":        ["terrain-3d.html", "encroachment-atlas.html", "quake-tsunami.html", "india-3d.html"],
    "quake-tsunami.html":   ["flood-3d.html", "terrain-3d.html", "encroachment-atlas.html", "index.html"],
    "ancient-india.html":   ["ashoka.html", "heritage-atlas.html", "deep-history.html", "scripts.html"],
    "ashoka.html":          ["ancient-india.html", "heritage-atlas.html", "scripts.html", "atrocities.html"],
    "heritage-atlas.html":  ["ancient-india.html", "cave-walk.html", "heritage-3d.html", "temple-forms.html"],
    "cave-walk.html":       ["heritage-atlas.html", "temple-forms.html", "heritage-3d.html", "ancient-india.html"],
    "deep-history.html":    ["ancient-india.html", "scripts.html", "languages.html", "atrocities.html"],
    "languages.html":       ["scripts.html", "journey.html", "vedas.html", "deep-history.html"],
    "journey.html":         ["languages.html", "scripts.html", "vedas.html", "ancient-india.html"],
    "scripts.html":         ["languages.html", "journey.html", "ashoka.html", "vedas.html"],
    "vedas.html":           ["languages.html", "scripts.html", "journey.html", "ancient-india.html"],
    "india-3d.html":        ["globe-map.html", "terrain-3d.html", "mesh.html", "heritage-3d.html"],
    "globe-map.html":       ["india-3d.html", "index.html", "mesh.html", "terrain-3d.html"],
    "heritage-3d.html":     ["temple-forms.html", "cave-walk.html", "heritage-atlas.html", "india-3d.html"],
    "temple-forms.html":    ["heritage-3d.html", "cave-walk.html", "heritage-atlas.html", "india-3d.html"],
    "mesh.html":            ["command-chain.html", "india-3d.html", "officials.html", "knowledge.html"],
    "design-system.html":   ["knowledge.html", "references.html", "about.html"],
    "knowledge.html":       ["provenance.html", "references.html", "officials.html", "data.html"],
    "officials.html":       ["provenance.html", "command-chain.html", "feed.html", "knowledge.html"],
    "data.html":            ["knowledge.html", "references.html", "provenance.html", "engines.html"],
    "references.html":      ["provenance.html", "knowledge.html", "data.html", "about.html"],
    "engines.html":         ["knowledge.html", "index.html", "provenance.html", "global.html"],
    "global.html":          ["state-of-india.html", "index.html", "engines.html", "knowledge.html"],
    "about.html":           ["how-it-works.html", "references.html", "provenance.html", "for-organisations.html"],
    "how-it-works.html":    ["about.html", "provenance.html", "references.html", "knowledge.html"],
    "geopolitical-chess.html": ["global.html", "state-of-india.html", "atrocities.html", "command-chain.html"]
  };

  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); };

  function here() { return (location.pathname.split("/").pop() || "index.html").toLowerCase() || "index.html"; }

  // find a target's real title + hint from the nav catalog, so links can't drift
  function meta(href) {
    var nav = (window.SiteNav && window.SiteNav.NAV) || (window.ATLAS_NAV) || [];
    for (var i = 0; i < nav.length; i++) {
      var items = nav[i].items || [];
      for (var j = 0; j < items.length; j++) {
        if ((items[j].href || "").toLowerCase() === href.toLowerCase()) return { text: items[j].text, hint: items[j].hint || "", icon: items[j].icon || "" };
      }
    }
    return null;
  }

  function render() {
    var rel = RELATED[here()];
    if (!rel || !rel.length) return;
    var cards = rel.map(function (href) {
      var m = meta(href) || { text: href.replace(".html", "").replace(/-/g, " "), hint: "", icon: "" };
      return '<a class="rel-card" href="' + esc(href) + '">' +
        (m.icon ? '<span class="rel-ico">' + m.icon + "</span>" : "") +
        '<span class="rel-body"><span class="rel-t">' + esc(m.text) + '</span>' +
        (m.hint ? '<span class="rel-h">' + esc(m.hint) + "</span>" : "") + "</span>" +
        '<span class="rel-arrow">&#8594;</span></a>';
    }).join("");
    var host = document.getElementById("related");
    var html = '<section class="rel-sec" aria-label="Related pages">' +
      '<div class="rel-head"><span class="rel-kicker">Related · read next</span></div>' +
      '<div class="rel-grid">' + cards + "</div></section>";
    if (host) host.innerHTML = html;
    else {
      // insert before the footer, or at the end of <main>, or body end
      var foot = document.getElementById("sfoot") || document.getElementById("site-footer");
      var main = document.querySelector("main");
      var el = document.createElement("div"); el.innerHTML = html;
      if (main) main.appendChild(el.firstChild);
      else if (foot && foot.parentNode) foot.parentNode.insertBefore(el.firstChild, foot);
      else document.body.appendChild(el.firstChild);
    }
    injectCSS();
  }

  function injectCSS() {
    if (document.getElementById("rel-css")) return;
    var css =
      ".rel-sec{max-width:1040px;margin:2.5rem auto 0;padding:1.6rem var(--pad-x,1.5rem) 0;border-top:2px solid var(--foreground,#2a2018)}" +
      ".rel-kicker{font-family:var(--font-mono,monospace);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent,#cc8900)}" +
      ".rel-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:.7rem;margin-top:.9rem}" +
      ".rel-card{display:flex;align-items:flex-start;gap:.6rem;padding:.8rem .9rem;border:1px solid var(--border,#d7d3d3);border-radius:var(--radius-sm,4px);background:var(--card,#fff);text-decoration:none;color:inherit;transition:transform .12s,border-color .12s,box-shadow .12s}" +
      ".rel-card:hover{transform:translateY(-2px);border-color:var(--accent,#cc8900);box-shadow:0 6px 18px rgba(0,0,0,.07)}" +
      ".rel-ico{font-size:1.1rem;flex:none;line-height:1.2}" +
      ".rel-body{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}" +
      ".rel-t{font-family:var(--font-display,Georgia,serif);font-weight:600;font-size:.95rem;color:var(--foreground,#2a2018)}" +
      ".rel-h{font-size:.76rem;color:var(--muted-foreground,#6b5c48);line-height:1.4}" +
      ".rel-arrow{color:var(--accent,#cc8900);flex:none;font-size:.9rem}";
    var s = document.createElement("style"); s.id = "rel-css"; s.textContent = css;
    document.head.appendChild(s);
  }

  // render after the nav catalog is ready (so titles/hints resolve)
  function start() {
    if (window.SiteNav && window.SiteNav.ready) window.SiteNav.ready(render);
    else if (window.ATLAS_NAV) render();
    else window.addEventListener("SiteNavReady", render, { once: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
