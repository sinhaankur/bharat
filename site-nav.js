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
  // IA regrouped by what you DO (2026-07-27). Task-based tabs: Map (the live 2D
  // surfaces) · 3D (every 3D view, the front door) · Study (the conceptual + narrative
  // layers incl. the engines + reading room) · Data (get/audit it) · About. The old
  // 12-item "Explore" dumping-ground is split; the engines become a Study sub-spine.
  // Each item has a short `hint` for a layered, scannable menu. No page orphaned.
  const NAV = [
    { label: "Map", items: [
      { href: "hero.html", text: "★ One screen (globe app)", hint: "the whole atlas on one screen" },
      { href: "index.html", text: "The map", hint: "2D fiscal atlas — every district" },
      { href: "explore.html", text: "Explore / query", hint: "filter & rank all 594" },
      { href: "feed.html", text: "News feed", hint: "bias vs the record, by place" },
      { href: "timeline.html", text: "Timeline", hint: "events over time" },
      { href: "encroachment-atlas.html", text: "Built where water returns", hint: "illegal habitation" },
    ]},
    // 3D — the front door: every interactive three-dimensional view.
    { label: "3D", items: [
      { href: "india-3d.html", text: "The globe", hint: "real Earth · 594 districts · layers" },
      { href: "terrain-3d.html", text: "District terrain 3D", hint: "relief · river · flood plain (2D/3D)" },
      { href: "atlas-3d.html", text: "India by constraint", hint: "states by development constraint" },
      { href: "flood-3d.html", text: "Flood explorer", hint: "water over real terrain" },
      { href: "earth-3d.html", text: "Photoreal Earth", hint: "Google 3D tiles (your key)" },
    ]},
    { label: "Study", items: [
      { href: "library.html", text: "Reading room", hint: "read the primary sources" },
      { href: "engines.html", text: "The 7 engines", hint: "the composable lenses" },
      { href: "engine-survey.html", text: "· Survey · origin" },
      { href: "engine-country.html", text: "· Country" },
      { href: "engine-development.html", text: "· Development" },
      { href: "engine-climate.html", text: "· Climate" },
      { href: "engine-zoning.html", text: "· Land-Zoning" },
      { href: "engine-corruption.html", text: "· Corruption" },
      { href: "engine-news.html", text: "· News" },
      { href: "articles.html", text: "Analysis", hint: "written pieces" },
      { href: "history.html", text: "History race", hint: "states over time" },
      { href: "command-chain.html", text: "Chain of command", hint: "who answers to whom" },
      { href: "mesh.html", text: "The mesh", hint: "how it all connects" },
      { href: "global.html", text: "India vs world", hint: "global comparison" },
    ]},
    { label: "Data", items: [
      { href: "knowledge.html", text: "Knowledge base", hint: "the data catalog" },
      { href: "data.html", text: "Data & API", hint: "get the data" },
      { href: "references.html", text: "Sources", hint: "every citation" },
      { href: "provenance.html", text: "Provenance ledger", hint: "figure → source, audited" },
      { href: "for-organisations.html", text: "For organisations" },
      { href: "share.html", text: "Share" },
    ]},
    { label: "About", items: [
      { href: "how-it-works.html", text: "How it works" },
      { href: "about.html", text: "Methodology & disclaimer" },
      { href: "privacy-policy.html", text: "Privacy & policy" },
      { href: "sitemap.html", text: "Site map" },
      { href: "usa.html", text: "Compare: US" },
      { href: "https://github.com/sinhaankur/india-fiscal-map", text: "GitHub ↗", ext: true },
    ]},
  ];

  const here = (location.pathname.split("/").pop() || "index.html").toLowerCase() || "index.html";
  const isHere = href => !/^https?:/.test(href) && href.split("?")[0].toLowerCase() === here;
  // which group contains the current page (to highlight the group button)
  const activeGroup = NAV.find(g => g.items.some(i => isHere(i.href)));

  function navHTML() {
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
    const cols = NAV.map(g => `
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

  function mount() {
    injectSEO();
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
  window.SiteNav = { NAV, SITE };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
