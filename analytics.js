/* analytics.js — privacy-friendly analytics + a visible visitor count.
 *
 * ONE lightweight, cookie-less service (GoatCounter) gives BOTH:
 *   · a visit count (shown in the footer)
 *   · visitor locations (country/region — visible in your GoatCounter dashboard)
 * No cookies, no personal data, no consent banner needed. Free for this scale.
 *
 * TO ENABLE:
 *   1. Make a free site at https://www.goatcounter.com  → you get a code like "bharat".
 *   2. Set GC_CODE below to that code (replace the placeholder).
 *   3. That's it — this file is loaded site-wide by site-nav.js. Location data appears
 *      in your GoatCounter dashboard (Settings → "Show location"); the live count shows
 *      in the footer via the public count API.
 *
 * Nothing loads while GC_CODE is the placeholder, so it's inert until you flip it.
 */
(function () {
  var GC_CODE = "YOUR_GOATCOUNTER_CODE";   // ← your GoatCounter site code (e.g. "bharat")
  var ENABLED = GC_CODE && GC_CODE !== "YOUR_GOATCOUNTER_CODE";

  // ---- 1. send the pageview (cookieless) ----
  function loadGoatCounter() {
    window.goatcounter = { no_onload: false };
    var s = document.createElement("script");
    s.async = true;
    s.setAttribute("data-goatcounter", "https://" + GC_CODE + ".goatcounter.com/count");
    s.src = "https://gc.zgo.at/count.js";
    document.head.appendChild(s);
  }

  // ---- 2. show the total visitor count in the footer ----
  function showCount() {
    // find (or create) the count host in the footer baseline
    var base = document.querySelector(".sfoot-base") || document.querySelector(".af-base");
    if (!base || document.getElementById("visit-count")) return;
    var span = document.createElement("span");
    span.id = "visit-count";
    span.style.cssText = "font-family:var(--font-mono,monospace);font-size:11px;opacity:.75";
    span.textContent = "· visitors: …";
    base.appendChild(span);

    // GoatCounter's public JSON count endpoint (total hits for the site)
    fetch("https://" + GC_CODE + ".goatcounter.com/counter/TOTAL.json")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d && (d.count || d.count_unique)) {
          var n = (d.count_unique || d.count).toLocaleString("en-IN");
          span.textContent = "· " + n + " visitors";
        } else { span.textContent = ""; }
      })
      .catch(function () { span.textContent = ""; });
  }

  function start() {
    if (!ENABLED) return;   // inert until you set GC_CODE
    loadGoatCounter();
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", showCount);
    else setTimeout(showCount, 400);   // let site-nav.js render the footer first
  }
  start();
})();
