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

  window.Motion = { countUp, reduced, refresh: init };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
