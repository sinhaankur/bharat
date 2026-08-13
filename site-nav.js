/* site-nav.js — single source of truth for the global header + footer + SEO.
   Renders a grouped-dropdown nav into #site-nav and a sitemap footer into
   #site-footer on every page, and injects SEO/social meta into <head>.
   Edit the IA + SEO defaults here, once. */
(function () {
  // ---- THEME bootstrap: apply the reader's saved light/dark choice ASAP -----
  // a11y.js owns the toggle + persistence; this just re-asserts it early so a
  // saved override (e.g. "light" on a dark-canvas page) settles quickly. "auto"
  // honours the page's own class="theme-dark" already in the HTML (no flash).
  try {
    var pref = (JSON.parse(localStorage.getItem("atlas_a11y") || "{}") || {}).theme || "auto";
    if (pref !== "auto") {
      var root = document.documentElement;
      root.classList.toggle("theme-dark", pref === "dark");
      root.classList.toggle("theme-light", pref === "light");
      root.setAttribute("data-theme", pref);
    }
  } catch (e) {}

  // ---- SEO: inject Open Graph / Twitter cards / canonical / JSON-LD --------
  // Derived from each page's existing <title> + meta[description]; the domain is
  // brandable so SEO comes from content + rich social cards, not the name.
  const SITE = {
    name: "Bharat",
    tagline: "understand India, by the evidence",
    base: "https://sinhaankur.github.io/bharat",   // update to custom domain when bought
    image: "https://sinhaankur.github.io/bharat/og-image.png",
    twitter: "",   // add @handle once social accounts exist
  };
  function injectSEO() {
    const head = document.head;
    if (!head) return;
    const title = document.title || SITE.name;
    const descEl = document.querySelector('meta[name="description"]');
    const desc = descEl ? descEl.getAttribute("content") : "Tracing public money to every Indian district — what came in, who's accountable, and what the record shows.";
    const path = (location.pathname.split("/").pop() || "index.html");
    const url = `${SITE.base}/${path}`;

    const metas = [
      ["og:title", title], ["og:description", desc], ["og:type", "website"],
      ["og:url", url], ["og:site_name", SITE.name], ["og:image", SITE.image],
      ["twitter:card", "summary_large_image"], ["twitter:title", title],
      ["twitter:description", desc], ["twitter:image", SITE.image],
    ];
    if (SITE.twitter) metas.push(["twitter:site", SITE.twitter]);

    for (const [k, v] of metas) {
      if (!v) continue;
      const isOG = k.startsWith("og:");
      const attr = isOG ? "property" : "name";
      if (head.querySelector(`meta[${attr}="${k}"]`)) continue;   // don't duplicate page-set tags
      const m = document.createElement("meta");
      m.setAttribute(attr, k); m.setAttribute("content", v);
      head.appendChild(m);
    }
    // favicon — the site shipped without one (every page 404'd favicon.ico). Inject an
    // SVG pin, derived from this script's own folder, unless the page already set one.
    if (!head.querySelector('link[rel~="icon"]')) {
      let base = "";
      const me = document.currentScript || [...document.scripts].find(s => /site-nav\.js/.test(s.src));
      if (me && me.src) base = me.src.replace(/site-nav\.js.*$/, "");
      const fav = document.createElement("link");
      fav.rel = "icon"; fav.type = "image/svg+xml"; fav.href = base + "favicon.svg";
      head.appendChild(fav);
    }
    // canonical
    if (!head.querySelector('link[rel="canonical"]')) {
      const l = document.createElement("link"); l.rel = "canonical"; l.href = url; head.appendChild(l);
    }
    // JSON-LD: Organization + WebSite (once, on the homepage is enough but harmless everywhere)
    if (!document.getElementById("ld-org")) {
      const ld = document.createElement("script");
      ld.type = "application/ld+json"; ld.id = "ld-org";
      ld.textContent = JSON.stringify({
        "@context": "https://schema.org", "@type": "WebSite",
        "name": SITE.name, "url": SITE.base,
        "description": "Source-cited atlas of India's public-money flows by district, with governance, news and bias analysis.",
        "publisher": { "@type": "Organization", "name": SITE.name, "url": SITE.base }
      });
      head.appendChild(ld);
    }
  }

  // ---- Information Architecture: task-based, 5 groups -------------------
  // Grouped by what the reader wants to DO, not by internal framing:
  //   Map   — the interactive views (2D atlas, query, feed, trackers) · the front door
  //   3D    — see India for real (globe, terrain, flood, temples)
  //   Study — go deeper (the 7 engines, heritage, deep history, chain of command, compare)
  //   Data  — get it, reference it, audit it
  //   About — how it works, methodology, policy, the project
  // The view catalog is the SINGLE SOURCE OF TRUTH in nav-data.js (window.ATLAS_NAV),
  // shared with the hero app's rail + launcher so the two can never drift, and with
  // sitemap.html (via window.SiteNav.NAV) so the site map never drifts either. This
  // file just renders it. If nav-data.js failed to load, fall back to a minimal set so
  // the header never disappears entirely.
  const FALLBACK_NAV = [
    { label: "Map", items: [{ href: "index.html", text: "The map" }, { href: "hero.html", text: "One screen" }] },
    { label: "About", items: [{ href: "sitemap.html", text: "Site map" }] },
  ];
  // resolved at mount time (after nav-data.js loads), never at IIFE-eval time
  function getNav() { return (typeof window !== "undefined" && window.ATLAS_NAV) || FALLBACK_NAV; }

  // ---- Bharat seal logo (Indic chrome) -------------------------------------
  // The gold seal-ring + a script glyph that cycles भ→ভ→ਭ… every 1.4s (started in
  // wire(), reduce-motion safe), faithful to the handoff's Bharat Logo.dc.html.
  const BHA_GLYPHS = ["ಭ", "भ", "ভ", "ਭ", "ભ", "ଭ", "భ", "ഭ"];
  const BHA_FONTS = "'Noto Sans Kannada','Noto Sans Devanagari','Noto Sans Bengali','Noto Sans Gurmukhi','Noto Sans Gujarati','Noto Sans Oriya','Noto Sans Telugu','Noto Sans Malayalam',serif";
  // 24 fine engraved rays behind the ring — an imperial/temple sun-emblem. Built
  // once as a path string so both the classic + React seals draw identical geometry.
  function sealRays() {
    let d = "";
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2;
      const long = k % 2 === 0;            // alternate long/short rays
      const r0 = 46, r1 = long ? 49.5 : 48;
      const c = Math.cos(a), s = Math.sin(a);
      d += `M${(50 + r0 * c).toFixed(2)} ${(50 + r0 * s).toFixed(2)}L${(50 + r1 * c).toFixed(2)} ${(50 + r1 * s).toFixed(2)}`;
    }
    return d;
  }
  function sealLogo(size) {
    const s = size || 32;
    return `<svg class="bha-seal" width="${s}" height="${s}" viewBox="0 0 100 100" aria-hidden="true">
        <g class="bha-rays"><path d="${sealRays()}" stroke="var(--chrome-band)" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.62"/></g>
        <g class="bha-ring">
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--chrome-band)" stroke-width="4"/>
          <circle cx="50" cy="50" r="39" fill="none" stroke="var(--chrome-band)" stroke-width="6" stroke-dasharray="2.5 7.7"/>
          <circle cx="50" cy="22" r="3.2" fill="currentColor"/>
        </g>
        <text x="50" y="62" font-size="34" text-anchor="middle" fill="currentColor" data-bha="1" font-family="${BHA_FONTS}">ಭ</text>
        <path d="M34 72 Q50 64 66 72 M38 79 Q50 72 62 79" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      </svg>`;
  }
  function startGlyphCycle() {
    if (window.__bhaTimer) return;
    try { if (matchMedia("(prefers-reduced-motion: reduce)").matches) return; } catch (e) {}
    let i = 1;
    window.__bhaTimer = setInterval(() => {
      document.querySelectorAll("[data-bha]").forEach(el => { el.textContent = BHA_GLYPHS[i % BHA_GLYPHS.length]; });
      i++;
    }, 1400);
  }

  const here = (location.pathname.split("/").pop() || "index.html").toLowerCase() || "index.html";
  const isHere = href => !/^https?:/.test(href) && href.split("?")[0].toLowerCase() === here;

  // the MAGAZINE masthead sections (falls back to the full grouped nav if absent)
  function getSections() {
    return (typeof window !== "undefined" && window.ATLAS_SECTIONS) || getNav();
  }

  // ---- Mauryan section icons (mauryan-icons.svg sprite) --------------------
  // Each top-nav section wears an artefact icon, matching the app header.
  const SECTION_ICON = {
    News: "i-edict", Money: "i-coin", Land: "i-tree", History: "i-lion",
    Languages: "i-pillar", "3D": "i-stupa", Design: "i-lotus", Data: "i-jali",
  };
  function sectionIcon(label) {
    const id = SECTION_ICON[label];
    return id ? `<svg class="snav-ico-sec" width="15" height="15" viewBox="0 0 32 32" aria-hidden="true"><use href="#${id}"></use></svg>` : "";
  }
  // inject the Mauryan sprite once (hidden), so <use href="#i-…"> resolves on classic pages
  function ensureSprite() {
    if (document.getElementById("mauryan-sprite")) return;
    let base = "";
    const me = document.currentScript || [...document.scripts].find(s => /site-nav\.js/.test(s.src));
    if (me && me.src) base = me.src.replace(/site-nav\.js.*$/, "");
    fetch(base + "mauryan-icons.svg").then(r => r.ok ? r.text() : "").then(svg => {
      if (!svg) return;
      const div = document.createElement("div");
      div.id = "mauryan-sprite"; div.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
      div.setAttribute("aria-hidden", "true"); div.innerHTML = svg;
      document.body.insertAdjacentElement("afterbegin", div);
    }).catch(() => {});
  }

  // href → icon lookup, built from ATLAS_NAV (which carries per-item icons). The
  // editorial ATLAS_SECTIONS don't define icons, so we borrow them by href so the
  // dropdown items get the same glyph as the full nav/drawer.
  let _iconMap = null;
  function iconFor(href) {
    if (!_iconMap) {
      _iconMap = {};
      getNav().forEach(g => (g.items || []).forEach(i => { if (i.icon) _iconMap[(i.href || "").toLowerCase()] = i.icon; }));
    }
    return _iconMap[(href || "").toLowerCase()] || "";
  }

  function navHTML() {
    const SECTIONS = getSections();
    const activeSection = SECTIONS.find(s => s.items.some(i => isHere(i.href)) || isHere(s.href));
    const groups = SECTIONS.map(s => {
      const open = s === activeSection ? " is-current" : "";
      const items = s.items.map(i => {
        const here = isHere(i.href);
        const cls = [here ? "snav-cur" : "", i.hint ? "snav-has-hint" : ""].filter(Boolean).join(" ");
        const cur = (here ? ' aria-current="page"' : "") + (cls ? ` class="${cls}"` : "");
        const ext = i.ext ? ' target="_blank" rel="noopener"' : "";
        const arrow = i.ext ? ' <span class="snav-ext">↗</span>' : "";
        const hint = i.hint ? `<span class="snav-hint">${i.hint}</span>` : "";
        const glyph = i.icon || iconFor(i.href);
        const ico = `<span class="snav-ico" aria-hidden="true">${glyph || "·"}</span>`;
        return `<a href="${i.href}"${ext}${cur}>${ico}<span class="snav-body"><span class="snav-t">${i.text}${arrow}</span>${hint}</span></a>`;
      }).join("");
      // a "section front" link at the top of the menu, then its stories
      const front = s.href ? `<a class="snav-front" href="${s.href}"><span class="snav-body"><span class="snav-t">${s.label} — front page</span><span class="snav-hint">${s.tagline || ""}</span></span></a>` : "";
      return `<div class="snav-group${open}">
        <button class="snav-top" aria-expanded="false">${sectionIcon(s.label)}${s.label} <span class="snav-caret">▾</span></button>
        <div class="snav-menu">${front}${items}</div>
      </div>`;
    }).join("");

    return `
      <nav id="nav" class="snav">
        <div class="snav-bar">
          <button class="snav-burger" aria-label="Open menu" aria-expanded="false">☰</button>
          <a class="brand" href="home.html" aria-label="Bharat — home">${sealLogo(30)}<span class="brand-lockup"><span class="brand-word">Bharat<span class="brand-stop">.</span></span><span class="brand-tag">INDIC DESIGNS</span></span></a>
          <div class="snav-groups">${groups}</div>
          <div class="snav-actions">
            <button class="snav-search" aria-label="Search" title="Search the atlas (press /)" onclick="window.CommandPalette&&window.CommandPalette.open()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4.5 4.5"/></svg>
              <span class="snav-search-label">Search the atlas</span><span class="snav-search-key">/</span>
            </button>
            <a class="snav-cta" href="index.html">View the India map</a>
          </div>
        </div>
      </nav>
      <div class="snav-drawer" id="snav-drawer" hidden>
        <div class="snav-drawer-panel">
          <div class="snav-drawer-head">
            <span class="brand-word">Bharat<span class="brand-stop">.</span></span>
            <button class="snav-drawer-close" aria-label="Close menu">✕</button>
          </div>
          <div class="snav-drawer-links">${drawerLinks()}</div>
        </div>
        <div class="snav-drawer-scrim"></div>
      </div>`;
  }

  // big category links for the slide-out drawer (Vox-style full-list menu)
  function drawerLinks() {
    return getNav().map(g => `
      <div class="snav-dl-group">
        <div class="snav-dl-h">${g.label}</div>
        ${g.items.map(i => {
          const ext = i.ext ? ' target="_blank" rel="noopener"' : "";
          return `<a href="${i.href}"${ext}>${i.icon ? i.icon + " " : ""}${i.text}</a>`;
        }).join("")}
      </div>`).join("");
  }

  // The footer — faithful to the handoff's Atlas Footer.dc.html (Indic): a dark register
  // with a newsletter, the Bharat seal, three CURATED columns (Atlas / Heritage / Trust)
  // instead of the whole-IA dump, a gold sawtooth band and the 8-script baseline. The full
  // site map still lives at sitemap.html — the footer is a wayfinding shortlist, not a mirror.
  // columns wear Mauryan sprite icons (coin/stupa/edict headers + a line icon per link),
  // matching the app footer so the two footers are the same design system.
  const FOOT_COLS = [
    { label: "Atlas", icon: "i-coin", links: [
      { t: "Home", href: "home.html", icon: "i-torana" },
      { t: "The map", href: "index.html", icon: "i-coin" },
      { t: "Explore & query", href: "explore.html", icon: "i-jali" },
      { t: "The engines", href: "engines.html", icon: "i-sixarm" },
    ] },
    { label: "Heritage", icon: "i-stupa", links: [
      { t: "India by design", href: "design-system.html", icon: "i-lotus" },
      { t: "Temples in 3D", href: "temple-forms.html", icon: "i-chaitya" },
      { t: "Sacred ground", href: "heritage-atlas.html", icon: "i-pillar" },
      { t: "Ancient India", href: "ancient-india.html", icon: "i-sun" },
    ] },
    { label: "Trust", icon: "i-edict", links: [
      { t: "Every source", href: "references.html", icon: "i-edict" },
      { t: "Provenance ledger", href: "provenance.html", icon: "i-bell" },
      { t: "How it works", href: "how-it-works.html", icon: "i-tree" },
      { t: "Methodology", href: "about.html", icon: "i-elephant" },
    ] },
  ];
  const footIcon = (id, cls) => id ? `<svg class="${cls}" width="15" height="15" viewBox="0 0 32 32" aria-hidden="true"><use href="#${id}"></use></svg>` : "";
  function footerHTML() {
    const cols = FOOT_COLS.map(c => `
      <nav class="sfoot-col" aria-label="${c.label}">
        <div class="sfoot-h">${footIcon(c.icon, "sfoot-h-ico")}${c.label}</div>
        ${c.links.map(l => `<a class="sfoot-link" href="${l.href}">${footIcon(l.icon, "sfoot-lico")}<span>${l.t}</span></a>`).join("")}
      </nav>`).join("");
    return `
      <footer id="sfoot">
        <div class="sfoot-news">
          <div>
            <p class="sfoot-news-t">Follow the money to your district.</p>
            <p class="sfoot-news-s">One email a month — what changed in the data, what got sourced, what's still a gap. No tracking.</p>
          </div>
          <form class="sfoot-news-form" onsubmit="return false">
            <input type="email" class="sfoot-input" placeholder="your@email.in" aria-label="Email" />
            <button type="button" class="sfoot-sub">Subscribe</button>
          </form>
        </div>
        <div class="sfoot-cols">
          <div class="sfoot-brand">
            <a class="sfoot-mark" href="home.html" aria-label="Bharat — home">${sealLogo(40)}<span class="brand-lockup"><span class="brand-word">Bharat<span class="brand-stop">.</span></span><span class="brand-tag">INDIC DESIGNS</span></span></a>
            <p class="sfoot-credo-p">Sourced, or it's a gap — never fabricated.</p>
            <div class="sfoot-social" aria-label="Social links">
              <a href="https://github.com/sinhaankur/bharat" target="_blank" rel="noopener" title="GitHub" aria-label="GitHub">GitHub</a>
              <a href="data.html" title="Data & API" aria-label="Data & API">Data & API</a>
            </div>
          </div>
          ${cols}
        </div>
        <div class="sfoot-saw" aria-hidden="true"></div>
        <div class="sfoot-base">
          <span>© ${new Date().getFullYear()} Bharat · Indic Designs™ · original work, all rights reserved</span>
          <span class="sfoot-scripts" aria-hidden="true">भ ভ ਭ ભ ଭ భ ಭ ഭ</span>
          <span class="sfoot-credo">● SOURCED — OR IT'S A GAP</span>
        </div>
      </footer>`;
  }

  // load the accessibility/reader-prefs module once, on every page (even embedded), so a
  // reader's font/size/contrast choice applies + is offered everywhere. Derives its path
  // from this script's own src. Self-mounts its "Aa" button.
  function ensureA11y() {
    if (window.A11y || document.getElementById("a11y-script")) return;
    let base = "";
    const me = document.currentScript || [...document.scripts].find(s => /site-nav\.js/.test(s.src));
    if (me && me.src) base = me.src.replace(/site-nav\.js.*$/, "");
    const s = document.createElement("script");
    s.id = "a11y-script"; s.src = base + "a11y.js";
    document.head.appendChild(s);
  }

  // load motion.js once on every page so micro-interactions, scroll-reveal, parallax,
  // animated graphs + tap ripples work site-wide (same self-pathing trick as a11y).
  function ensureMotion() {
    if (window.Motion || document.getElementById("motion-script")) return;
    let base = "";
    const me = document.currentScript || [...document.scripts].find(s => /site-nav\.js/.test(s.src));
    if (me && me.src) base = me.src.replace(/site-nav\.js.*$/, "");
    const s = document.createElement("script");
    s.id = "motion-script"; s.src = base + "motion.js"; s.defer = true;
    document.head.appendChild(s);
  }

  // load a companion script (analytics, ads) once, self-pathed like the others. Each is
  // INERT until its ID is configured (placeholders in analytics.js / ads.js), so this is
  // safe to load everywhere now and flip on later.
  function ensureScript(id, file) {
    if (document.getElementById(id)) return;
    let base = "";
    const me = document.currentScript || [...document.scripts].find(s => /site-nav\.js/.test(s.src));
    if (me && me.src) base = me.src.replace(/site-nav\.js.*$/, "");
    const s = document.createElement("script");
    s.id = id; s.src = base + file; s.defer = true;
    document.head.appendChild(s);
  }

  function mount() {
    injectSEO();
    ensureA11y();
    ensureMotion();
    ensureSprite();   // Mauryan icons for the section nav
    ensureScript("analytics-script", "analytics.js");   // privacy analytics + visit count (inert until configured)
    ensureScript("ads-script", "ads.js");               // AdSense (inert until approved + enabled)
    ensureScript("related-script", "related.js");       // "Related — read next" cross-links
    // EMBED MODE: when a page is loaded inside the hero app (?embed=1), suppress the site
    // header + footer so the hero's own chrome is the only navigation. The page's own
    // content fills the panel. A body class lets pages trim their own margins if they like.
    const EMBED = new URLSearchParams(location.search).get("embed") === "1";
    if (EMBED) {
      document.documentElement.classList.add("embed-mode");
      const nh = document.getElementById("site-nav"); if (nh) nh.remove();
      const fh = document.getElementById("site-footer"); if (fh) fh.remove();
      return;   // no header/footer inside the hero
    }
    // header: replace #site-nav placeholder, or any pre-existing #nav, or prepend to body
    const navHost = document.getElementById("site-nav");
    if (navHost) navHost.outerHTML = navHTML();
    else {
      const oldNav = document.getElementById("nav");
      if (oldNav) oldNav.outerHTML = navHTML();
      else document.body.insertAdjacentHTML("afterbegin", navHTML());
    }
    // footer: replace #site-footer placeholder, or append to body
    const footHost = document.getElementById("site-footer");
    if (footHost) footHost.outerHTML = footerHTML();
    else if (!document.getElementById("sfoot")) document.body.insertAdjacentHTML("beforeend", footerHTML());

    wire();
  }

  function wire() {
    startGlyphCycle();   // begin the seal-ring script-glyph cycle (reduce-motion safe)
    // dropdowns: click to open on touch, hover handled by CSS on desktop
    document.querySelectorAll(".snav-group .snav-top").forEach(btn => {
      btn.addEventListener("click", e => {
        e.preventDefault();
        const g = btn.closest(".snav-group");
        const wasOpen = g.classList.contains("open");
        document.querySelectorAll(".snav-group.open").forEach(x => x.classList.remove("open"));
        if (!wasOpen) { g.classList.add("open"); btn.setAttribute("aria-expanded", "true"); }
        else btn.setAttribute("aria-expanded", "false");
      });
    });
    // burger opens the slide-out category drawer (Vox-style full menu)
    const burger = document.querySelector(".snav-burger");
    const drawer = document.getElementById("snav-drawer");
    function openDrawer() {
      if (!drawer) return;
      drawer.hidden = false;
      requestAnimationFrame(() => drawer.classList.add("open"));
      burger?.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }
    function closeDrawer() {
      if (!drawer) return;
      drawer.classList.remove("open");
      burger?.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      setTimeout(() => { drawer.hidden = true; }, 320);
    }
    burger?.addEventListener("click", openDrawer);
    drawer?.querySelector(".snav-drawer-close")?.addEventListener("click", closeDrawer);
    drawer?.querySelector(".snav-drawer-scrim")?.addEventListener("click", closeDrawer);
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeDrawer(); });
    // click-away closes desktop dropdowns
    document.addEventListener("click", e => {
      if (!e.target.closest(".snav-group")) document.querySelectorAll(".snav-group.open").forEach(x => x.classList.remove("open"));
    });
  }

  // Expose the IA so sitemap.html (and anything else) can render the SAME structure
  // without duplicating it — single source of truth for the site's information map.
  // `ready(cb)` runs cb once nav-data.js has actually loaded (ATLAS_NAV present),
  // fixing the race where consumers read SiteNav.NAV before it resolved and got the
  // 3-item fallback. Fires immediately if already ready.
  let _navReady = false;
  const _readyCbs = [];
  window.SiteNav = {
    get NAV() { return getNav(); },
    SITE,
    get isReady() { return _navReady; },
    ready(cb) { if (_navReady) cb(getNav()); else _readyCbs.push(cb); },
  };
  function markNavReady() {
    _navReady = true;
    _iconMap = null;   // rebuild icon lookup now that the real nav is present
    _readyCbs.splice(0).forEach(cb => { try { cb(getNav()); } catch (e) {} });
    try { window.dispatchEvent(new CustomEvent("SiteNavReady", { detail: { nav: getNav() } })); } catch (e) {}
  }

  // ensure the shared view catalog (nav-data.js) is loaded, THEN mount. If a page already
  // included nav-data.js, this is instant; otherwise we inject it so no page has to remember to.
  function ensureNavData(cb) {
    if (window.ATLAS_NAV) return cb();
    // derive the path to nav-data.js from this script's own src (same folder)
    let base = "";
    const me = document.currentScript || [...document.scripts].find(s => /site-nav\.js/.test(s.src));
    if (me && me.src) base = me.src.replace(/site-nav\.js.*$/, "");
    const s = document.createElement("script");
    s.src = base + "nav-data.js";
    s.onload = cb; s.onerror = cb;   // fall back to FALLBACK_NAV if it can't load
    document.head.appendChild(s);
  }
  function start() { ensureNavData(function () { markNavReady(); mount(); }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
