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
    name: "Bharat Atlas",
    tagline: "understand India, by the evidence",
    base: "https://sinhaankur.github.io/india-fiscal-map",   // update to custom domain when bought
    image: "https://sinhaankur.github.io/india-fiscal-map/og-image.png",
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

  const here = (location.pathname.split("/").pop() || "index.html").toLowerCase() || "index.html";
  const isHere = href => !/^https?:/.test(href) && href.split("?")[0].toLowerCase() === here;

  function navHTML() {
    const NAV = getNav();
    const activeGroup = NAV.find(g => g.items.some(i => isHere(i.href)));
    const groups = NAV.map(g => {
      const open = g === activeGroup ? " is-current" : "";
      const items = g.items.map(i => {
        const here = isHere(i.href);
        const cls = [here ? "snav-cur" : "", i.hint ? "snav-has-hint" : ""].filter(Boolean).join(" ");
        const cur = (here ? ' aria-current="page"' : "") + (cls ? ` class="${cls}"` : "");
        const ext = i.ext ? ' target="_blank" rel="noopener"' : "";
        // icon column (emoji, or a subtle bullet so text stays aligned) + text + one-line hint
        const icon = `<span class="snav-ico">${i.icon || "›"}</span>`;
        const arrow = i.ext ? ' <span class="snav-ext">↗</span>' : "";
        const hint = i.hint ? `<span class="snav-hint">${i.hint}</span>` : "";
        return `<a href="${i.href}"${ext}${cur}>${icon}<span class="snav-body"><span class="snav-t">${i.text}${arrow}</span>${hint}</span></a>`;
      }).join("");
      return `<div class="snav-group${open}">
        <button class="snav-top" aria-expanded="false">${g.label} <span class="snav-caret">▾</span></button>
        <div class="snav-menu">${items}</div>
      </div>`;
    }).join("");
    // breadcrumb: "Group › Current page" so the reader always sees where they are
    const curItem = activeGroup && activeGroup.items.find(i => isHere(i.href));
    const crumb = (activeGroup && curItem)
      ? `<div class="snav-here" aria-hidden="true"><span class="snav-here-g">${activeGroup.label}</span><span class="snav-here-sep">›</span><span class="snav-here-p">${(curItem.icon ? curItem.icon + " " : "") + curItem.text}</span></div>`
      : "";
    // topics strip — "making sense of it all:" quick jumps (like the Vox topics line)
    const topics = [
      { t: "The map", h: "index.html" }, { t: "News", h: "feed.html" },
      { t: "States", h: "state-of-india.html" }, { t: "Heritage", h: "heritage-atlas.html" },
      { t: "History", h: "atrocities.html" }, { t: "3D India", h: "india-3d.html" },
    ].map(x => `<a href="${x.h}">${x.t}</a>`).join("<span class=\"snav-topic-sep\">·</span>");

    return `
      <nav id="nav" class="snav">
        <div class="snav-bar">
          <button class="snav-burger" aria-label="Open menu" aria-expanded="false">☰</button>
          <a class="brand" href="home.html"><img class="brand-logo" src="favicon.svg" alt="" width="24" height="24" /><span class="brand-word">Bharat Atlas</span><span class="brand-dot" title="live"></span></a>
          <div class="snav-groups">${groups}</div>
          <div class="snav-actions">
            <a class="snav-cta" href="index.html">Open the map</a>
          </div>
        </div>
        <div class="snav-topics"><span class="snav-topics-lbl">Making sense of it all:</span> ${topics}</div>
      </nav>
      <div class="snav-drawer" id="snav-drawer" hidden>
        <div class="snav-drawer-panel">
          <div class="snav-drawer-head">
            <span class="brand-word">Bharat Atlas</span>
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

  function footerHTML() {
    const cols = getNav().map(g => `
      <div class="sfoot-col">
        <div class="sfoot-h">${g.label}</div>
        ${g.items.map(i => {
          const ext = i.ext ? ' target="_blank" rel="noopener"' : "";
          return `<a href="${i.href}"${ext}>${i.text}</a>`;
        }).join("")}
      </div>`).join("");
    return `
      <footer id="sfoot">
        <div class="sfoot-top">
          <a class="sfoot-mark" href="home.html"><img src="favicon.svg" alt="" width="30" height="30" /><span class="brand-word">Bharat Atlas</span></a>
          <div class="sfoot-social" aria-label="Social links">
            <a href="https://github.com/sinhaankur/india-fiscal-map" target="_blank" rel="noopener" title="GitHub" aria-label="GitHub">⌥</a>
            <a href="feed.html" title="News feed" aria-label="News feed">✍</a>
            <a href="data.html" title="Data & API" aria-label="Data">⛁</a>
            <a href="share.html" title="Share" aria-label="Share">↗</a>
          </div>
        </div>
        <div class="sfoot-rule"></div>
        <div class="sfoot-grid">${cols}</div>
        <div class="sfoot-legal">
          <a href="about.html">About &amp; methodology</a><span>·</span>
          <a href="how-it-works.html">How it works</a><span>·</span>
          <a href="references.html">Sources</a><span>·</span>
          <a href="provenance.html">Provenance</a><span>·</span>
          <a href="privacy-policy.html">Privacy</a><span>·</span>
          <a href="sitemap.html">Site map</a>
        </div>
        <div class="sfoot-base">
          <span>© ${new Date().getFullYear()} Bharat Atlas · independent civic-data project · sourced, or it's a gap.</span>
          <span>Not affiliated with any government body.</span>
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

  function mount() {
    injectSEO();
    ensureA11y();
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
  window.SiteNav = { get NAV() { return getNav(); }, SITE };

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
  function start() { ensureNavData(mount); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
