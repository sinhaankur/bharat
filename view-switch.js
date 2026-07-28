/* view-switch.js — the "view this data as…" format switcher, shared across the map,
   the globe and the 3D terrain. The 2D map is the default; the globe and terrain are
   optional formats for deeper exploration. Include this on any of the three pages and it
   inserts a small segmented control (fixed, top-right) with the current view marked active.

   Suppressed in embed mode (?embed=1) — the hero has its own rail. No dependencies. */
(function () {
  if (new URLSearchParams(location.search).get("embed") === "1") return;   // hero provides its own nav

  var VIEWS = [
    { view: "2d",      href: "index.html",     icon: "🗺", label: "2D map",  title: "The classic 2D fiscal map — every district" },
    { view: "globe",   href: "hero.html",      icon: "🌍", label: "Globe",   title: "Explore India as a real-Earth 3D globe" },
    { view: "terrain", href: "terrain-3d.html", icon: "🏔", label: "Terrain", title: "Explore the real 3D terrain — relief, rivers, flood plains" },
  ];
  // which page am I? (map = index; globe = india-3d OR hero; terrain = terrain-3d)
  var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  var current = here === "index.html" ? "2d"
    : (here === "hero.html" || here === "india-3d.html") ? "globe"
    : (here === "terrain-3d.html") ? "terrain" : null;
  if (current === null) return;   // only show on the three view pages

  function injectCSS() {
    if (document.getElementById("vsw-css")) return;
    var css = ""
      + "#vsw{position:fixed;top:64px;right:14px;z-index:1200;display:inline-flex;border-radius:8px;overflow:hidden;border:1px solid var(--border-strong);background:oklch(0.14 0.005 240 / 0.94);backdrop-filter:blur(6px);box-shadow:0 2px 10px oklch(0 0 0 / 0.45)}"
      + "#vsw a{display:inline-flex;align-items:center;gap:0.3rem;padding:0 11px;height:32px;font-family:var(--font-mono);font-size:11.5px;color:var(--muted-foreground);text-decoration:none;border-right:1px solid var(--border);transition:color .15s,background .15s}"
      + "#vsw a:last-child{border-right:0}"
      + "#vsw a:hover{color:var(--foreground);background:oklch(0.2 0.01 240)}"
      + "#vsw a.on{color:oklch(0.92 0.05 90);background:oklch(0.28 0.07 78)}"
      + "#vsw .vsw-lead{color:var(--muted-foreground);font-size:10px;padding:0 8px 0 10px;display:inline-flex;align-items:center;letter-spacing:0.03em;opacity:0.8;border-right:1px solid var(--border);pointer-events:none}"
      + "@media (max-width:640px){#vsw{top:auto;bottom:14px;right:10px}#vsw .vsw-lead{display:none}#vsw a[data-v=terrain]{display:none}}";
    var s = document.createElement("style"); s.id = "vsw-css"; s.textContent = css;
    document.head.appendChild(s);
  }

  function mount() {
    if (document.getElementById("vsw")) return;
    injectCSS();
    var nav = document.createElement("nav");
    nav.id = "vsw"; nav.setAttribute("aria-label", "View format");
    var html = '<span class="vsw-lead">View as</span>';
    VIEWS.forEach(function (v) {
      var on = v.view === current;
      html += '<a data-v="' + v.view + '" href="' + v.href + '"' + (on ? ' class="on" aria-current="page"' : "") + ' title="' + v.title + '">' + v.icon + " " + v.label + "</a>";
    });
    nav.innerHTML = html;
    document.body.appendChild(nav);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
