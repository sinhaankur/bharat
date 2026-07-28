/* site-nav.js — single source of truth for the global header + footer + SEO.
   Renders a grouped-dropdown nav into #site-nav and a sitemap footer into
   #site-footer on every page, and injects SEO/social meta into <head>.
   Edit the IA + SEO defaults here, once. */
(function () {
  // ---- SEO: inject Open Graph / Twitter cards / canonical / JSON-LD --------
  // Derived from each page's existing <title> + meta[description]; the domain is
  // brandable so SEO comes from content + rich social cards, not the name.
  const SITE = {
    name: "India Fiscal Map",
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

  // ---- Information Architecture: engines-led, 4 groups ------------------
  // The atlas is framed as composable ENGINES (see engines.html / ENGINES.md), so
  // the engines are the nav SPINE — first group, the 7 lenses + the hub. The other
  // groups stay pragmatic: Explore (the views/tools), Data (get it + audit it),
  // About (the project). No page is orphaned; the old "Understand" group dissolved
  // into the engines (its conceptual pages) + Explore (its 3D/comparison views).
  // The view catalog is the SINGLE SOURCE OF TRUTH in nav-data.js (window.ATLAS_NAV),
  // shared with the hero app's rail + launcher so the two can never drift. This nav
  // just renders it. If nav-data.js failed to load, fall back to a minimal set so the
  // header never disappears entirely.
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
        const hint = i.hint ? `<span class="snav-hint">${i.hint}</span>` : "";
        return `<a href="${i.href}"${ext}${cur}><span class="snav-t">${i.text}</span>${hint}</a>`;
      }).join("");
      return `<div class="snav-group${open}">
        <button class="snav-top" aria-expanded="false">${g.label} <span class="snav-caret">▾</span></button>
        <div class="snav-menu">${items}</div>
      </div>`;
    }).join("");
    return `
      <nav id="nav" class="snav">
        <a class="brand" href="index.html"><span class="brand-dot"></span> 🇮🇳 INDIA FISCAL MAP</a>
        <button class="snav-burger" aria-label="Menu" aria-expanded="false">☰</button>
        <div class="snav-groups">${groups}</div>
      </nav>`;
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
        <div class="sfoot-grid">
          <div class="sfoot-col sfoot-brand">
            <div class="sfoot-name">🇮🇳 India Fiscal Map</div>
            <p>Tracing public money to every Indian district — what came in, who's
            accountable, and what the record shows happened. Source-cited, or it's a gap.</p>
          </div>
          ${cols}
        </div>
        <div class="sfoot-base">
          <span>Independent civic-data project · not affiliated with any government body.</span>
          <span><a href="sitemap.xml">sitemap</a> · <a href="about.html">methodology</a> · <a href="https://github.com/sinhaankur/india-fiscal-map" target="_blank" rel="noopener">open source ↗</a></span>
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
    // mobile burger toggles the whole group list
    const burger = document.querySelector(".snav-burger");
    burger?.addEventListener("click", () => {
      const nav = document.querySelector(".snav");
      const open = nav.classList.toggle("snav-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // click-away closes dropdowns
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
