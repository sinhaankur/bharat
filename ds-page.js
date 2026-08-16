/* ds-page.js — shared behaviour for every Indic design-system page.
   Author: Sinhaankur.
   - renders token swatches/scales live from the REAL computed stylesheet
   - copy-to-clipboard on every code block
   - skin switcher: reskins the whole gallery by swapping the theme class,
     proving the atomic system is reusable across Indic design systems
   - TOC scrollspy
   All optional: a page uses only the hooks (data-attrs / ids) it declares. */
(function () {
  "use strict";
  var root = document.documentElement;
  var cs = function () { return getComputedStyle(root); };
  var val = function (v) { return cs().getPropertyValue(v).trim(); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  // which Indic system is this page? (also used by the colour-stories below)
  function sysOf() {
    var m = (root.className || "").match(/theme-(mauryan|gupta|chola|rajput)/);
    return m ? m[1] : "mauryan";
  }

  /* ---------- HERO ORNAMENT: imperial seal + heritage-motif watermark ----------
     Each system's title wall carries (a) a drawn imperial seal medallion and
     (b) a full-bleed heritage-motif watermark, both original line-drawings on
     currentColor so they reskin with the accent. NEVER the official State Emblem.
     Very low opacity; no motion → reduce-motion safe by construction. */
  var SEAL = {
    // a radial "coin/seal" medallion — concentric rules, a ring of ticks, a mark
    mauryan: '<circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
      '<circle cx="60" cy="60" r="44" fill="none" stroke="currentColor" stroke-width="1"/>' +
      '<g stroke="currentColor" stroke-width="1.4">' + ticks(60, 60, 48, 24) + '</g>' +
      '<circle cx="60" cy="60" r="8" fill="none" stroke="currentColor" stroke-width="1.4"/>' +
      '<path d="M60 30 L60 90 M30 60 L90 60" stroke="currentColor" stroke-width="1"/>',
    gupta: '<circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
      '<g stroke="currentColor" stroke-width="1.2" fill="none">' + petals(60, 60, 30, 52, 16) + '</g>' +
      '<circle cx="60" cy="60" r="10" fill="none" stroke="currentColor" stroke-width="1.4"/>',
    chola: '<circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
      '<circle cx="60" cy="60" r="40" fill="none" stroke="currentColor" stroke-width="1"/>' +
      '<g stroke="currentColor" stroke-width="1.3">' + ticks(60, 60, 47, 32) + '</g>' +
      '<path d="M60 40 L72 78 L48 78 Z" fill="none" stroke="currentColor" stroke-width="1.4"/>',
    rajput: '<circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
      '<path d="M60 12 A48 48 0 0 1 108 60 L60 60 Z" fill="none" stroke="currentColor" stroke-width="1"/>' +
      '<g stroke="currentColor" stroke-width="1.2" fill="none">' + petals(60, 60, 22, 46, 12) + '</g>' +
      '<circle cx="60" cy="60" r="7" fill="none" stroke="currentColor" stroke-width="1.4"/>'
  };
  // full-bleed motif watermarks (drawn large, tiled or radial)
  function motifSVG(sys) {
    if (sys === "mauryan") {   // jali lattice
      return '<defs><pattern id="dsJali" width="46" height="46" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
        '<path d="M23 0 V46 M0 23 H46" stroke="currentColor" stroke-width="1" fill="none"/>' +
        '<circle cx="23" cy="23" r="10" fill="none" stroke="currentColor" stroke-width="1"/>' +
        '</pattern></defs><rect width="100%" height="100%" fill="url(#dsJali)"/>';
    }
    if (sys === "gupta") {     // radiating halo / prabhāvali
      return '<g stroke="currentColor" stroke-width="1.1" fill="none" transform="translate(760,150)">' +
        [0.5, 0.7, 0.85, 1].map(function (r) { return '<circle cx="0" cy="0" r="' + (120 * r) + '"/>'; }).join("") +
        petals(0, 0, 90, 150, 32) + '</g>';
    }
    if (sys === "chola") {     // tiered gopuram silhouette
      var tiers = "";
      for (var i = 0; i < 7; i++) {
        var w = 150 - i * 16, y = 40 + i * 30;
        tiers += '<rect x="' + (-w / 2) + '" y="' + y + '" width="' + w + '" height="22" rx="2" fill="none" stroke="currentColor" stroke-width="1.2"/>';
      }
      return '<g transform="translate(770,60)">' + tiers + '<path d="M-14 40 Q0 8 14 40 Z" fill="none" stroke="currentColor" stroke-width="1.2"/></g>';
    }
    // rajput — jharokha arches
    var arches = "";
    for (var c = 0; c < 4; c++) {
      var x = 560 + c * 70;
      arches += '<path d="M' + x + ' 300 V150 Q' + x + ' 90 ' + (x + 35) + ' 90 Q' + (x + 70) + ' 90 ' + (x + 70) + ' 150 V300" fill="none" stroke="currentColor" stroke-width="1.2"/>';
    }
    return '<g>' + arches + '</g>';
  }
  // helper: N radial ticks around a circle
  function ticks(cx, cy, r, n) {
    var out = "";
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2, x1 = cx + Math.cos(a) * r, y1 = cy + Math.sin(a) * r,
        x2 = cx + Math.cos(a) * (r - 5), y2 = cy + Math.sin(a) * (r - 5);
      out += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '"/>';
    }
    return out;
  }
  // helper: N teardrop petals radiating from a centre (a halo/lotus ring)
  function petals(cx, cy, r0, r1, n) {
    var out = "";
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
      var x0 = cx + ca * r0, y0 = cy + sa * r0, x1 = cx + ca * r1, y1 = cy + sa * r1;
      var pa = a + 0.11, ma = a - 0.11;
      var xa = cx + Math.cos(pa) * (r0 + (r1 - r0) * 0.5), ya = cy + Math.sin(pa) * (r0 + (r1 - r0) * 0.5);
      var xb = cx + Math.cos(ma) * (r0 + (r1 - r0) * 0.5), yb = cy + Math.sin(ma) * (r0 + (r1 - r0) * 0.5);
      out += '<path d="M' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' Q' + xa.toFixed(1) + ' ' + ya.toFixed(1) + ' ' + x1.toFixed(1) + ' ' + y1.toFixed(1) +
        ' Q' + xb.toFixed(1) + ' ' + yb.toFixed(1) + ' ' + x0.toFixed(1) + ' ' + y0.toFixed(1) + 'Z"/>';
    }
    return out;
  }
  (function ornamentHero() {
    var head = document.querySelector(".ds-head");
    if (!head) return;
    var sys = sysOf();
    // motif watermark (full-bleed, behind everything)
    var motif = document.createElement("div");
    motif.className = "ds-motif"; motif.setAttribute("aria-hidden", "true");
    motif.innerHTML = '<svg viewBox="0 0 960 360" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">' + motifSVG(sys) + '</svg>';
    head.insertBefore(motif, head.firstChild);
    // seal medallion (top-right)
    var seal = document.createElement("div");
    seal.className = "ds-seal"; seal.setAttribute("aria-hidden", "true");
    seal.innerHTML = '<svg viewBox="0 0 120 120" width="100%" height="100%">' + (SEAL[sys] || SEAL.mauryan) + '</svg>';
    head.appendChild(seal);
  })();

  /* ---------- SKIN SWITCHER ---------- */
  // The full family of Indic skins. `id` must be unique; `cls` is the <html>
  // class list to apply; `needs` is the theme-*.css file that must be linked for
  // the skin to actually paint. A page only offers skins whose CSS it loads —
  // declare that with data-ds-skins="mauryan,gupta,…" (default: all).
  var ALL_SKINS = [
    { id: "mauryan",      label: "Mauryan · stone",    cls: "theme-mauryan theme-light", needs: "theme-mauryan.css", family: "mauryan" },
    { id: "mauryan-dark", label: "Mauryan · temple",   cls: "theme-mauryan theme-dark",  needs: "theme-mauryan.css", family: "mauryan" },
    { id: "gupta",        label: "Gupta · plaster",    cls: "theme-gupta theme-light",   needs: "theme-gupta.css",   family: "gupta" },
    { id: "gupta-dark",   label: "Gupta · cave",       cls: "theme-gupta theme-dark",    needs: "theme-gupta.css",   family: "gupta" },
    { id: "chola",        label: "Chola · granite",    cls: "theme-chola theme-light",   needs: "theme-chola.css",   family: "chola" },
    { id: "chola-dark",   label: "Chola · sanctum",    cls: "theme-chola theme-dark",    needs: "theme-chola.css",   family: "chola" },
    { id: "rajput",       label: "Rajput · wasli",     cls: "theme-rajput theme-light",  needs: "theme-rajput.css",  family: "rajput" },
    { id: "rajput-dark",  label: "Rajput · sheesh",    cls: "theme-rajput theme-dark",   needs: "theme-rajput.css",  family: "rajput" },
    { id: "house",        label: "House · gold",       cls: "theme-light",               needs: null,                family: "house" }
  ];
  // which theme-*.css files are actually linked on this page?
  var linked = {};
  Array.prototype.forEach.call(document.querySelectorAll('link[rel="stylesheet"]'), function (l) {
    var m = (l.getAttribute("href") || "").match(/theme-[a-z]+\.css/);
    if (m) linked[m[0]] = true;
  });
  function applySkin(cls) {
    root.className = cls;
    // re-render any live token galleries after the skin changes
    renderTokens();
  }
  var skinHost = document.querySelector("[data-ds-skins]");
  if (skinHost) {
    var initial = root.className.trim();
    // page can restrict to certain families; otherwise offer every linked skin
    var only = (skinHost.getAttribute("data-ds-skins") || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    var SKINS = ALL_SKINS.filter(function (s) {
      if (s.needs && !linked[s.needs]) return false;           // its CSS isn't on the page
      if (only.length && only.indexOf(s.family) === -1 && only.indexOf(s.id) === -1) return false;
      return true;
    });
    skinHost.innerHTML = '<span class="lbl">Skin</span>' + SKINS.map(function (s) {
      // match the longest id so "mauryan-dark" wins over "mauryan"
      var on = (" " + initial + " ").indexOf(" " + s.cls + " ") > -1 ? ' is-on' : '';
      return '<button class="ds-chip' + on + '" data-skin="' + esc(s.cls) + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + esc(s.label) + '</button>';
    }).join("");
    skinHost.addEventListener("click", function (e) {
      var b = e.target.closest("[data-skin]"); if (!b) return;
      applySkin(b.getAttribute("data-skin"));
      skinHost.querySelectorAll(".ds-chip").forEach(function (c) {
        var on = c === b; c.classList.toggle("is-on", on); c.setAttribute("aria-pressed", on ? "true" : "false");
      });
    });
  }

  /* ---------- COPY TO CLIPBOARD ---------- */
  document.querySelectorAll("[data-ds-copy]").forEach(function (block) {
    var pre = block.querySelector("pre");
    if (!pre) return;
    var btn = document.createElement("button");
    btn.className = "ds-copy"; btn.type = "button"; btn.textContent = "Copy";
    btn.addEventListener("click", function () {
      var text = pre.innerText;
      var done = function () { btn.textContent = "Copied"; btn.classList.add("done");
        setTimeout(function () { btn.textContent = "Copy"; btn.classList.remove("done"); }, 1400); };
      if (navigator.clipboard) { navigator.clipboard.writeText(text).then(done, done); }
      else { var t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select();
        try { document.execCommand("copy"); } catch (e) {} document.body.removeChild(t); done(); }
    });
    block.appendChild(btn);
  });

  /* ---------- COLOUR ORIGIN STORIES ----------
     Each colour in India has a story. We load colour-stories.json once, index it
     by CSS token, and if a swatch's token has a story, the swatch becomes
     expandable — click to reveal where the colour came from + a reference. */
  var STORIES = null, STORY_BY_TOKEN = {};
  // which Indic system is this page? read it off the <html> theme class.
  function currentSystem() {
    var m = (root.className || "").match(/theme-(mauryan|gupta|chola|rajput)/);
    return m ? m[1] : null;
  }
  // build the token→story index SCOPED to this system: the same token
  // (e.g. --background) is a different pigment per system, so a story only
  // applies if the current system is listed in its `systems`. Exact-system
  // stories win over multi-system ones.
  function indexStories() {
    STORY_BY_TOKEN = {};
    var sys = currentSystem();
    (STORIES || []).forEach(function (s) {
      var scope = s.systems || [];
      if (sys && scope.length && scope.indexOf(sys) === -1) return;   // not this system's colour
      (s.tokens || []).forEach(function (t) {
        var prev = STORY_BY_TOKEN[t];
        // prefer a story whose FIRST listed system is exactly this page's system
        if (!prev || (scope[0] === sys && (prev.systems || [])[0] !== sys)) STORY_BY_TOKEN[t] = s;
      });
    });
  }
  function loadStories() {
    if (STORIES) { indexStories(); return Promise.resolve(STORIES); }
    return fetch("colour-stories.json").then(function (r) { return r.json(); }).then(function (d) {
      STORIES = d.colours || [];
      indexStories();
      return STORIES;
    }).catch(function () { STORIES = []; return STORIES; });
  }
  function storyHTML(s) {
    if (!s) return "";
    var ref = s.reference || {};
    var refHTML = ref.url
      ? '<a href="' + esc(ref.url) + '" target="_blank" rel="noopener">' + esc(ref.cite || "reference") + ' ↗</a>'
      : esc(ref.cite || "");
    var place = s.place
      ? (s.place_href ? '<a href="' + esc(s.place_href) + '">' + esc(s.place) + '</a>' : esc(s.place))
      : "";
    var badge = s.status && s.status !== "confirmed"
      ? ' <span class="ds-badge ds-badge--warning">' + esc(s.status) + '</span>' : "";
    return '<div class="ds-sw-story" hidden>' +
      '<div class="ds-sw-story-name">' + esc(s.name) + badge + '</div>' +
      '<p><b>Origin.</b> ' + esc(s.origin) + '</p>' +
      (place ? '<p><b>Place.</b> ' + place + '</p>' : "") +
      (s.inspired ? '<p><b>It inspired.</b> ' + esc(s.inspired) + '</p>' : "") +
      '<p class="ds-sw-ref"><b>Reference.</b> ' + refHTML + '</p>' +
      '</div>';
  }

  /* ---------- LIVE TOKEN GALLERIES ---------- */
  function renderTokens() {
    var swatchHost = document.getElementById("ds-swatches");
    if (swatchHost && swatchHost.dataset.colors) {
      var colors = JSON.parse(swatchHost.dataset.colors);
      swatchHost.innerHTML = colors.map(function (pair) {
        var nm = pair[0], v = pair[1], c = val(v) || "transparent";
        var s = STORY_BY_TOKEN[v];
        var hasStory = !!s;
        return '<div class="ds-sw' + (hasStory ? ' has-story' : '') + '"' + (hasStory ? ' tabindex="0" role="button" aria-expanded="false" title="Where this colour comes from"' : '') + '>' +
          '<div class="chip" style="background:' + esc(c) + '">' + (hasStory ? '<span class="ds-sw-tag">story</span>' : '') + '</div>' +
          '<div class="meta"><div class="nm">' + esc(nm) + '</div><div class="var">' + esc(v) + '</div><div class="hex">' + esc(c) + '</div></div>' +
          storyHTML(s) + '</div>';
      }).join("");
    }
    var typeHost = document.getElementById("ds-typescale");
    if (typeHost && typeHost.dataset.type) {
      var type = JSON.parse(typeHost.dataset.type);
      typeHost.innerHTML = type.map(function (r) {
        var v = r[0], label = r[1], fam = r[2] || "sans";
        var ff = fam === "display" ? "var(--font-display)" : fam === "mono" ? "var(--font-mono)" : "var(--font-sans)";
        var w = fam === "display" ? 600 : 400;
        return '<div class="ds-type-row"><span class="tag">' + esc(v) + '</span>' +
          '<span class="sample" style="font-size:var(' + v + ');font-family:' + ff + ';font-weight:' + w + '">' + esc(label) + '</span></div>';
      }).join("");
    }
    renderScale("ds-spacescale", "sp", function (v) {
      return '<div class="box" style="width:var(' + v + ');height:var(' + v + ');min-width:4px"></div>'; });
    renderScale("ds-radiusscale", "radius", function (v) {
      return '<div class="rbox" style="border-radius:var(' + v + ')"></div>'; });
    renderScale("ds-elevationscale", "shadow", function (v) {
      return '<div class="ebox" style="box-shadow:var(' + v + ')"><span style="font-family:var(--font-mono);font-size:var(--fs-3xs);color:var(--muted-foreground)">' +
        esc(v.replace("--shadow-", "")) + '</span></div>'; });
  }
  function renderScale(id, kind, boxFn) {
    var host = document.getElementById(id);
    if (!host || !host.dataset.vars) return;
    var vars = JSON.parse(host.dataset.vars);
    host.innerHTML = vars.map(function (v) {
      return '<div class="item">' + boxFn(v) + '<div class="lbl">' + esc(v) + '<br>' + esc(val(v)) + '</div></div>';
    }).join("");
  }
  // first paint: render immediately (so tokens show fast), then load the colour
  // stories and re-render swatches so the "story" affordance appears.
  renderTokens();
  loadStories().then(renderTokens);

  // click / keyboard to expand a swatch's origin story
  document.addEventListener("click", function (e) {
    var sw = e.target.closest(".ds-sw.has-story");
    if (!sw) return;
    if (e.target.closest(".ds-sw-story a")) return;   // let links through
    var story = sw.querySelector(".ds-sw-story");
    if (!story) return;
    var open = story.hasAttribute("hidden");
    if (open) story.removeAttribute("hidden"); else story.setAttribute("hidden", "");
    sw.setAttribute("aria-expanded", open ? "true" : "false");
    sw.classList.toggle("is-open", open);
  });
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("has-story")) {
      e.preventDefault(); e.target.click();
    }
  });

  /* ---------- TOC SCROLLSPY + SMOOTH SCROLL ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".ds-toc a"));
  links.forEach(function (a) { a.addEventListener("click", function (e) {
    var t = document.querySelector(a.getAttribute("href"));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: "smooth" }); }
  }); });
  if ("IntersectionObserver" in window && links.length) {
    var byId = {}; links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) {
        links.forEach(function (l) { l.classList.remove("active"); });
        var a = byId[en.target.id]; if (a) a.classList.add("active");
      } });
    }, { rootMargin: "-10% 0px -80% 0px" });
    document.querySelectorAll(".ds-tier[id]").forEach(function (s) { io.observe(s); });
  }

  /* ---------- GRAND: reveal-on-scroll + reading progress ----------
     Reuses the site's .will-reveal / [data-reveal] system, which already
     degrades under prefers-reduced-motion AND the a11y data-reduce-motion flag.
     We just auto-tag the gallery's sections + specimens and reveal on scroll. */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function markReveal() {
    var targets = document.querySelectorAll(".ds-tier-head, .ds-why, .ds-spec, .ds-story-col, .ds-plate");
    targets.forEach(function (el, i) {
      if (el.classList.contains("will-reveal")) return;
      el.classList.add("will-reveal");
      el.style.transitionDelay = (Math.min(i % 4, 3) * 60) + "ms";  // gentle stagger within a group
    });
    return targets;
  }
  var revealEls = markReveal();
  // .is-revealed is the site's shown-state class (see styles.css / motion.js)
  function reveal(el) { if (el && !el.classList.contains("is-revealed")) el.classList.add("is-revealed"); }
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-revealed"); el.style.transitionDelay = ""; });
  } else {
    var rio = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { reveal(en.target); obs.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { rio.observe(el); });
    // safety net: anything at/above the viewport bottom is revealed on load and
    // on scroll, so fast jumps (or elements already on-screen) never stay hidden.
    var sweep = function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      revealEls.forEach(function (el) {
        if (el.classList.contains("is-revealed")) return;
        var top = el.getBoundingClientRect().top;
        if (top < vh * 0.92) { reveal(el); rio.unobserve(el); }
      });
    };
    sweep();
    window.addEventListener("scroll", sweep, { passive: true });
    window.addEventListener("resize", sweep, { passive: true });
  }

  // reading-progress bar
  var bar = document.createElement("div");
  bar.className = "ds-progress"; bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  var ticking = false;
  function updateProgress() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0;
    bar.style.width = (pct * 100).toFixed(2) + "%";
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(updateProgress); }
  }, { passive: true });
  updateProgress();
})();
