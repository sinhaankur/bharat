/* a11y.js — a reader-preferences + accessibility panel for the whole atlas.
   One "Aa" button (added next to the nav) opens a panel: font style (incl. a
   dyslexia-friendly option), text size, high-contrast, reduce-motion, and a short
   info/help section. Preferences apply site-wide via CSS custom-properties + body
   classes and persist in localStorage. Loaded on every page (by site-nav.js), so a
   choice made anywhere is remembered everywhere. No dependencies. */
(function (g) {
  var LS = "atlas_a11y";
  var DEFAULTS = { font: "default", size: 100, contrast: false, motion: true, theme: "auto" };
  var state = load();

  // The page's OWN default theme: dark-canvas pages ship class="theme-dark" on <html>.
  // "auto" (the default) honours that; light/dark override it site-wide & persist.
  var PAGE_DEFAULT_THEME = document.documentElement.classList.contains("theme-dark") ? "dark" : "light";

  // 'bundled' fonts are self-hosted (vendor/fonts) and lazy-loaded only when picked.
  var FONTS = {
    default:   { label: "Default", stack: null },   // null → use the page's own --font-sans
    sans:      { label: "Clean sans", stack: "'Helvetica Neue', Arial, system-ui, sans-serif" },
    serif:     { label: "Serif (reading)", stack: "Georgia, 'Iowan Old Style', 'Times New Roman', serif" },
    hyperleg:  { label: "Hyper-legible", stack: "'Atkinson Hyperlegible', system-ui, sans-serif", bundled: true },
    dyslexic:  { label: "Dyslexia-friendly", stack: "'OpenDyslexic', 'Comic Sans MS', sans-serif", bundled: true },
  };

  // load the self-hosted accessibility font-faces once, on demand (path from this script's src)
  function ensureFonts() {
    if (document.getElementById("a11y-fonts")) return;
    var base = "";
    var me = document.currentScript || [].slice.call(document.scripts).find(function (s) { return /a11y\.js/.test(s.src); });
    if (me && me.src) base = me.src.replace(/a11y\.js.*$/, "");
    var l = document.createElement("link");
    l.id = "a11y-fonts"; l.rel = "stylesheet"; l.href = base + "vendor/fonts/fonts.css";
    document.head.appendChild(l);
  }

  function load() {
    try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(LS) || "{}")); }
    catch (e) { return Object.assign({}, DEFAULTS); }
  }
  function save() { try { localStorage.setItem(LS, JSON.stringify(state)); } catch (e) {} }

  // apply the current prefs to the document root
  function apply() {
    var root = document.documentElement;
    var f = FONTS[state.font] || FONTS.default;
    if (f.bundled) ensureFonts();   // lazy-load the self-hosted font only when it's chosen
    if (f.stack) root.style.setProperty("--font-sans", f.stack);
    else root.style.removeProperty("--font-sans");
    // scale the base font-size (html is 14px by default) — everything in rem/em follows
    root.style.fontSize = (14 * (state.size / 100)).toFixed(2) + "px";
    root.classList.toggle("a11y-contrast", !!state.contrast);
    root.classList.toggle("a11y-reduce-motion", !state.motion);
    applyTheme(root);
  }

  // resolve theme: "auto" honours the page's built-in default; light/dark override.
  function applyTheme(root) {
    var eff = state.theme === "auto" ? PAGE_DEFAULT_THEME : state.theme;
    root.classList.toggle("theme-dark", eff === "dark");
    root.classList.toggle("theme-light", eff === "light");
    root.setAttribute("data-theme", eff);
  }

  function injectCSS() {
    if (document.getElementById("a11y-css")) return;
    var css = ""
      // high-contrast: brighter text, stronger borders, remove faint muted greys
      + "html.a11y-contrast{--muted-foreground:#e8e8ea;--border:#7a7a80;--border-strong:#a0a0a8}"
      + "html.a11y-contrast a{text-decoration:underline}"
      + "html.a11y-contrast ::selection{background:#ffd24a;color:#000}"
      // reduce motion: kill animations/transitions + auto-rotate hint (pages read this class)
      + "html.a11y-reduce-motion *,html.a11y-reduce-motion *::before,html.a11y-reduce-motion *::after{animation-duration:0.001ms!important;animation-iteration-count:1!important;transition-duration:0.001ms!important;scroll-behavior:auto!important}"
      // the launcher button + panel
      + ".a11y-btn{width:34px;height:34px;border-radius:999px;border:1px solid var(--border-strong);background:var(--card);color:var(--foreground);font-family:var(--font-display,serif);font-size:15px;cursor:pointer;line-height:1}"
      + ".a11y-btn:hover{border-color:var(--brand)}"
      + ".a11y-overlay{position:fixed;inset:0;z-index:9500;display:grid;place-items:center;background:rgba(10,20,20,0.5);backdrop-filter:blur(5px)}"
      + ".a11y-card{width:min(440px,92vw);max-height:88vh;overflow:auto;background:var(--card);color:var(--foreground);border:1px solid var(--border-strong);border-radius:var(--radius,12px);box-shadow:0 20px 60px rgba(10,20,20,0.35);padding:1.1rem 1.2rem 1.3rem}"
      + ".a11y-head{display:flex;align-items:center;gap:0.6rem;margin-bottom:0.9rem}"
      + ".a11y-title{flex:1;font-family:var(--font-display,serif);font-size:1.15rem}"
      + ".a11y-close{background:var(--muted);border:1px solid var(--border-strong);color:var(--foreground);border-radius:999px;width:28px;height:28px;cursor:pointer;font-size:14px}"
      + ".a11y-row{margin:0 0 1rem}"
      + ".a11y-lbl{font-family:var(--font-mono);font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:var(--muted-foreground);margin-bottom:0.45rem}"
      + ".a11y-opts{display:flex;flex-wrap:wrap;gap:0.4rem}"
      + ".a11y-opt{font-family:var(--font-mono);font-size:12px;padding:6px 12px;border-radius:8px;border:1px solid var(--border-strong);background:var(--muted);color:var(--foreground);cursor:pointer}"
      + ".a11y-opt:hover{border-color:var(--brand)}"
      + ".a11y-opt.on{background:var(--brand);border-color:var(--brand);color:#fff}"
      + ".a11y-size{display:flex;align-items:center;gap:0.7rem}"
      + ".a11y-size input{flex:1}"
      + ".a11y-size .v{font-family:var(--font-mono);font-size:12px;min-width:44px;text-align:right}"
      + ".a11y-info{font-size:0.85rem;line-height:1.6;color:var(--muted-foreground);border-top:1px solid var(--border);padding-top:0.8rem;margin-top:0.4rem}"
      + ".a11y-info a{color:var(--brand)}"
      + ".a11y-reset{font-family:var(--font-mono);font-size:11px;color:var(--muted-foreground);background:none;border:0;cursor:pointer;text-decoration:underline;padding:0}"
      + ".a11y-refresh{border-color:var(--brand);color:var(--brand);font-weight:600}"
      + ".a11y-refresh:hover{background:var(--brand);color:#fff}"
      + ".a11y-refresh[disabled]{opacity:0.6;cursor:progress}";
    var s = document.createElement("style"); s.id = "a11y-css"; s.textContent = css;
    document.head.appendChild(s);
  }

  function segBtns(name, opts, current, onPick) {
    return opts.map(function (o) {
      return '<button class="a11y-opt' + (o.val === current ? " on" : "") + '" data-name="' + name + '" data-val="' + o.val + '">' + o.label + "</button>";
    }).join("");
  }

  function openPanel() {
    injectCSS();
    close();
    var ov = document.createElement("div"); ov.className = "a11y-overlay"; ov.id = "a11y-overlay";
    var fontOpts = Object.keys(FONTS).map(function (k) { return { val: k, label: FONTS[k].label }; });
    ov.innerHTML =
      '<div class="a11y-card" role="dialog" aria-label="Reading &amp; accessibility">'
      + '<div class="a11y-head"><div class="a11y-title">Reading &amp; accessibility</div><button class="a11y-close" id="a11y-close" aria-label="Close">✕</button></div>'
      + '<div class="a11y-row"><div class="a11y-lbl">Theme</div><div class="a11y-opts" id="a11y-theme">'
        + segBtns("theme", [{ val: "light", label: "☀ Light" }, { val: "dark", label: "☾ Dark" }, { val: "auto", label: "◐ Auto" }], state.theme)
        + "</div></div>"
      + '<div class="a11y-row"><div class="a11y-lbl">Font style</div><div class="a11y-opts" id="a11y-font">' + segBtns("font", fontOpts, state.font) + "</div></div>"
      + '<div class="a11y-row"><div class="a11y-lbl">Text size</div><div class="a11y-size"><button class="a11y-opt" id="a11y-minus">A−</button><input type="range" id="a11y-size" min="80" max="150" step="10" value="' + state.size + '"><button class="a11y-opt" id="a11y-plus">A+</button><span class="v" id="a11y-size-v">' + state.size + '%</span></div></div>'
      + '<div class="a11y-row"><div class="a11y-lbl">Display</div><div class="a11y-opts">'
        + '<button class="a11y-opt' + (state.contrast ? " on" : "") + '" id="a11y-contrast">◑ High contrast</button>'
        + '<button class="a11y-opt' + (!state.motion ? " on" : "") + '" id="a11y-motion">⏸ Reduce motion</button>'
      + "</div></div>"
      + '<div class="a11y-row"><div class="a11y-lbl">Trouble?</div><div class="a11y-opts"><button class="a11y-opt a11y-refresh" id="a11y-refresh" title="Clear this device\'s cached copy of the site and reload the newest version. Keeps your reading settings.">↻ <span id="a11y-refresh-t">Clear cache &amp; get latest</span></button></div></div>'
      + '<div class="a11y-info" id="a11y-info"><b>What is this?</b> The India District Atlas traces public money to every district — sourced, or marked a gap — so you can make <em>informed decisions</em> from the record. These controls make it easier to read: pick a font (incl. a dyslexia-friendly one), size the text, boost contrast, or calm the motion. Your choices are saved on this device and apply everywhere. <a href="how-it-works.html">How it works →</a> · <a href="about.html">About &amp; methodology →</a> · <button class="a11y-reset" id="a11y-reset">reset to defaults</button></div>'
      + "</div>";
    document.body.appendChild(ov);

    ov.addEventListener("click", function (e) { if (e.target === ov) close(); });
    document.getElementById("a11y-close").addEventListener("click", close);
    document.addEventListener("keydown", escClose);

    document.getElementById("a11y-theme").addEventListener("click", function (e) {
      var b = e.target.closest(".a11y-opt"); if (!b) return;
      state.theme = b.dataset.val; save(); apply();
      [].forEach.call(this.children, function (c) { c.classList.toggle("on", c === b); });
    });
    document.getElementById("a11y-font").addEventListener("click", function (e) {
      var b = e.target.closest(".a11y-opt"); if (!b) return;
      state.font = b.dataset.val; save(); apply();
      [].forEach.call(this.children, function (c) { c.classList.toggle("on", c === b); });
    });
    var sizeInput = document.getElementById("a11y-size"), sizeV = document.getElementById("a11y-size-v");
    function setSize(v) { state.size = Math.max(80, Math.min(150, v)); sizeInput.value = state.size; sizeV.textContent = state.size + "%"; save(); apply(); }
    sizeInput.addEventListener("input", function () { setSize(+this.value); });
    document.getElementById("a11y-minus").addEventListener("click", function () { setSize(state.size - 10); });
    document.getElementById("a11y-plus").addEventListener("click", function () { setSize(state.size + 10); });
    var cb = document.getElementById("a11y-contrast");
    cb.addEventListener("click", function () { state.contrast = !state.contrast; cb.classList.toggle("on", state.contrast); save(); apply(); });
    var mb = document.getElementById("a11y-motion");
    mb.addEventListener("click", function () { state.motion = !state.motion; mb.classList.toggle("on", !state.motion); save(); apply(); });
    document.getElementById("a11y-reset").addEventListener("click", function () { state = Object.assign({}, DEFAULTS); save(); apply(); close(); openPanel(); });

    // "Clear cache & get latest" — clears this device's cached copy of the site (any
    // service worker + Cache Storage) and hard-reloads the newest deployed version with a
    // cache-busting query param. Keeps reading settings (localStorage is untouched).
    document.getElementById("a11y-refresh").addEventListener("click", function () {
      var btn = this, label = document.getElementById("a11y-refresh-t");
      btn.disabled = true; if (label) label.textContent = "Clearing…";
      var jobs = [];
      try {
        if (window.caches && caches.keys) {
          jobs.push(caches.keys().then(function (keys) { return Promise.all(keys.map(function (k) { return caches.delete(k); })); }));
        }
      } catch (e) {}
      try {
        if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
          jobs.push(navigator.serviceWorker.getRegistrations().then(function (regs) { return Promise.all(regs.map(function (r) { return r.unregister(); })); }));
        }
      } catch (e) {}
      var done = function () {
        // strip any old cache-bust param, add a fresh one, then reload from the network
        var u = new URL(location.href);
        u.searchParams.set("fresh", Date.now().toString(36));
        location.replace(u.toString());
      };
      // don't hang forever if a job stalls
      var t = setTimeout(done, 1500);
      Promise.all(jobs).then(function () { clearTimeout(t); done(); }).catch(function () { clearTimeout(t); done(); });
    });
  }
  function escClose(e) { if (e.key === "Escape") close(); }
  function close() { var o = document.getElementById("a11y-overlay"); if (o) o.remove(); document.removeEventListener("keydown", escClose); }

  // add the "Aa" launcher button into the nav (if present) or float it top-right
  function mountButton() {
    if (document.getElementById("a11y-launch")) return;
    injectCSS();
    var btn = document.createElement("button");
    btn.id = "a11y-launch"; btn.className = "a11y-btn"; btn.type = "button";
    btn.textContent = "Aa"; btn.title = "Reading & accessibility"; btn.setAttribute("aria-label", "Reading and accessibility options");
    btn.addEventListener("click", openPanel);
    // Always a fixed bottom-right FAB (where it was built) — a persistent, reachable
    // reading-options button, not tucked into the nav bar. Sits above the footer.
    btn.style.cssText += ";position:fixed;bottom:16px;right:16px;z-index:8000;width:44px;height:44px;font-size:17px;box-shadow:0 4px 14px rgba(0,0,0,.22)";
    document.body.appendChild(btn);
  }

  function init() { apply(); mountButton(); }
  // apply prefs ASAP (before paint where possible), mount the button once DOM is ready
  apply();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  g.A11y = { open: openPanel, apply: apply, state: state };
})(typeof window !== "undefined" ? window : this);
