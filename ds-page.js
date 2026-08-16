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
})();
