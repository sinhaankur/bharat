/* interactions.js — the house "alive" layer: cursor effects + hover life + a
   vertical→horizontal scroll primitive. Dependency-free, opt-in, and ALWAYS
   reduce-motion safe (does nothing when the user or the a11y panel asks for calm).

   Opt in with data-attributes / classes:
     .lift            → card lifts + a soft gilt shadow on hover
     .tilt            → card tilts slightly toward the cursor (3D parallax)
     .magnetic        → button/link drifts toward the cursor, springs back
     [data-hscroll]   → a section whose inner row scrolls HORIZONTALLY as you
                        scroll the page vertically (premium gallery/timeline feel)
   A soft cursor spotlight follows the pointer site-wide (behind content). */
(function () {
  "use strict";

  function reduced() {
    if (document.documentElement.getAttribute("data-reduce-motion") === "1") return true;
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  // coarse pointer (touch) → skip cursor/hover effects, keep hscroll (it's scroll-driven)
  var COARSE = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

  // ---- cursor spotlight: a warm radial glow that trails the pointer ----
  function cursorGlow() {
    if (reduced() || COARSE) return;
    var el = document.createElement("div");
    el.id = "cursor-glow"; el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);
    var x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
    addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function frame() {
      x += (tx - x) * 0.12; y += (ty - y) * 0.12;
      el.style.transform = "translate(" + x + "px," + y + "px)";
      requestAnimationFrame(frame);
    })();
  }

  // ---- magnetic: element drifts toward the pointer within its padding, springs back ----
  function magnetic() {
    if (reduced() || COARSE) return;
    document.querySelectorAll(".magnetic").forEach(function (el) {
      var strength = parseFloat(el.getAttribute("data-magnetic")) || 0.3;
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var mx = e.clientX - (r.left + r.width / 2);
        var my = e.clientY - (r.top + r.height / 2);
        el.style.transform = "translate(" + (mx * strength).toFixed(1) + "px," + (my * strength).toFixed(1) + "px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }

  // ---- tilt: card rotates slightly toward the cursor (parallax depth) ----
  function tilt() {
    if (reduced() || COARSE) return;
    document.querySelectorAll(".tilt").forEach(function (el) {
      var max = parseFloat(el.getAttribute("data-tilt")) || 6; // degrees
      el.style.transformStyle = "preserve-3d";
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(800px) rotateY(" + (px * max).toFixed(2) + "deg) rotateX(" + (-py * max).toFixed(2) + "deg)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }

  // ---- vertical → horizontal scroll: a [data-hscroll] section pins while its
  //      inner .hscroll-row translates sideways across the section's scroll length. ----
  function hscroll() {
    var sections = Array.prototype.slice.call(document.querySelectorAll("[data-hscroll]"));
    if (!sections.length) return;
    if (reduced()) return; // leave as a normal (vertical/overflow) list

    sections.forEach(function (sec) {
      var row = sec.querySelector(".hscroll-row");
      if (!row) return;
      // the section is made tall (= row width) so there's vertical distance to map.
      function layout() {
        var extra = Math.max(0, row.scrollWidth - sec.clientWidth);
        sec.style.height = (extra + sec.clientHeight) + "px";   // room to scroll through
        sec.dataset._extra = extra;
      }
      layout();
      addEventListener("resize", layout, { passive: true });

      var ticking = false;
      function frame() {
        var extra = parseFloat(sec.dataset._extra) || 0;
        var r = sec.getBoundingClientRect();
        // progress 0..1 while the sticky inner is pinned in view
        var total = sec.offsetHeight - sec.clientHeight;
        var scrolled = Math.min(Math.max(-r.top, 0), total);
        var p = total > 0 ? scrolled / total : 0;
        row.style.transform = "translate3d(" + (-p * extra).toFixed(1) + "px,0,0)";
        ticking = false;
      }
      addEventListener("scroll", function () {
        if (!ticking) { ticking = true; requestAnimationFrame(frame); }
      }, { passive: true });
      frame();
    });
  }

  function boot() { cursorGlow(); magnetic(); tilt(); hscroll(); }
  window.Interactions = { refresh: boot, reduced: reduced };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
