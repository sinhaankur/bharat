/* motion.js — tiny, dependency-free page-animation helpers.
   Purposeful motion only, and it ALWAYS honours reduce-motion
   (OS setting OR the site a11y panel's data-reduce-motion flag).
   Opt in with data-attributes:
     data-reveal            → fade/rise in when scrolled into view
     data-reveal="left"     → slide from left (also "right","scale")
     data-reveal-delay="120"→ ms stagger
     data-count="27" [data-count-suffix="M"] → count up to the number on reveal
   Exposes window.Motion for manual use. Plain script, no modules. */
(function () {
  "use strict";
  function reduced() {
    if (document.documentElement.getAttribute("data-reduce-motion") === "1") return true;
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function countUp(el) {
    const target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;
    const suffix = el.getAttribute("data-count-suffix") || "";
    const dec = (String(target).split(".")[1] || "").length;
    if (reduced()) { el.textContent = target.toFixed(dec) + suffix; return; }
    const dur = 900, t0 = performance.now();
    function step(now) {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(step); else el.textContent = target.toFixed(dec) + suffix;
    }
    requestAnimationFrame(step);
  }

  function init() {
    const items = Array.from(document.querySelectorAll("[data-reveal], [data-count]"));
    if (!items.length) return;

    // reduced motion: just show everything immediately
    if (reduced() || !("IntersectionObserver" in window)) {
      items.forEach(el => { el.classList.add("is-revealed"); if (el.hasAttribute("data-count")) countUp(el); });
      return;
    }
    items.forEach(el => el.classList.add("will-reveal"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const delay = parseInt(el.getAttribute("data-reveal-delay") || "0", 10);
        setTimeout(() => {
          el.classList.add("is-revealed");
          if (el.hasAttribute("data-count")) countUp(el);
        }, delay);
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    items.forEach(el => io.observe(el));
  }

  // ---- PARALLAX: elements with data-parallax drift as you scroll ----
  // data-parallax="0.3" → moves at 30% of scroll speed (negative = opposite). Disabled under reduce-motion.
  function initParallax() {
    var els = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
    if (!els.length || reduced()) return;
    var ticking = false;
    function frame() {
      var vh = window.innerHeight;
      els.forEach(function (el) {
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.2;
        var r = el.getBoundingClientRect();
        var center = r.top + r.height / 2;
        var offset = (center - vh / 2) * -speed;   // distance from viewport centre × speed
        el.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
      });
      ticking = false;
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    frame();
  }

  // ---- ANIMATED GRAPHS: draw bars/lines/donuts in when they enter view ----
  // Any element with class ag-bar / ag-line / ag-donut / ag-fade animates via its
  // --draw variable (0→1). We just flip --draw to 1 when it scrolls into view.
  function initGraphs() {
    var els = Array.prototype.slice.call(document.querySelectorAll(".ag-bar, .ag-line, .ag-donut, .ag-fade"));
    if (!els.length) return;
    if (reduced() || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.style.setProperty("--draw", "1"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var d = parseInt(el.getAttribute("data-graph-delay") || "0", 10);
        setTimeout(function () { el.style.setProperty("--draw", "1"); }, d);
        io.unobserve(el);
      });
    }, { threshold: 0.25 });
    els.forEach(function (el) { el.style.setProperty("--draw", "0"); io.observe(el); });
  }

  // ---- TAP RIPPLE: buttons/cards with class .ripple get a material-style ripple ----
  function initRipple() {
    if (reduced()) return;
    document.addEventListener("pointerdown", function (e) {
      var host = e.target.closest && e.target.closest(".ripple");
      if (!host) return;
      var r = host.getBoundingClientRect();
      var rip = document.createElement("span");
      rip.className = "rip";
      var size = Math.max(r.width, r.height);
      rip.style.width = rip.style.height = size + "px";
      rip.style.left = (e.clientX - r.left - size / 2) + "px";
      rip.style.top = (e.clientY - r.top - size / 2) + "px";
      host.appendChild(rip);
      setTimeout(function () { rip.remove(); }, 520);
    }, { passive: true });
  }

  function boot() { init(); initParallax(); initGraphs(); initRipple(); }
  window.Motion = { countUp: countUp, reduced: reduced, refresh: boot };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
