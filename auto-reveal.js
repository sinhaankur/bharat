/* auto-reveal.js — give every page the house scroll-reveal without hand-tagging.
   It walks a short list of common content blocks (section headings, cards, stats,
   heroes, rows) and adds the same data-reveal / stagger attributes motion.js reads,
   THEN lets motion.js animate them. Opt-out with data-no-reveal on an element or any
   ancestor. Fully reduce-motion safe (motion.js shows everything instantly then).

   Load order: this file FIRST, motion.js SECOND — so the attributes exist before
   motion.js boots and wires its IntersectionObserver. */
(function () {
  "use strict";

  // Respect the same reduce-motion contract as motion.js — if reduced, do nothing
  // (leave the DOM untouched; everything stays visible).
  function reduced() {
    if (document.documentElement.getAttribute("data-reduce-motion") === "1") return true;
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // Content blocks worth revealing, in rough document order. Kept conservative so we
  // never animate layout chrome (nav, legend, map) — only editorial content.
  var SELECTORS = [
    "main section",
    "section > h1", "section > h2", "section > h3",
    ".card", ".tile", ".stat", ".story", ".band",
    ".feature", ".module", ".entry", ".accordion"
  ];

  // Never touch these (chrome, interactive widgets, things that must paint instantly).
  function isExcluded(el) {
    if (el.closest("[data-no-reveal]")) return true;
    if (el.closest("#site-nav, #india-map-wrap, .leaflet-container, nav, header.site-header")) return true;
    if (el.hasAttribute("data-reveal")) return true;         // already hand-tagged
    return false;
  }

  function enhance() {
    if (reduced() || !("IntersectionObserver" in window)) return;

    var seen = new Set();
    SELECTORS.forEach(function (sel) {
      var nodes;
      try { nodes = document.querySelectorAll(sel); } catch (e) { return; }
      nodes.forEach(function (el) {
        if (seen.has(el) || isExcluded(el)) return;
        seen.add(el);
        el.setAttribute("data-reveal", "");
        // Stagger siblings within the same parent so groups cascade, not snap.
        var parent = el.parentElement;
        if (parent) {
          var idx = Array.prototype.indexOf.call(parent.children, el);
          var delay = Math.min(idx, 6) * 70;                 // cap the cascade
          if (delay) el.setAttribute("data-reveal-delay", String(delay));
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhance);
  } else {
    enhance();
  }
})();
