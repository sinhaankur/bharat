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

  // ---- Information Architecture: 4 groups -------------------------------
  const NAV = [
    { label: "Explore", items: [
      { href: "feed.html", text: "The feed" },
      { href: "index.html", text: "Map" },
      { href: "explore.html", text: "Explore" },
      { href: "timeline.html", text: "Timeline" },
      { href: "articles.html", text: "Analysis" },
      { href: "share.html", text: "Share" },
    ]},
    { label: "Understand", items: [
      { href: "how-it-works.html", text: "How it works" },
      { href: "command-chain.html", text: "Chain of command" },
      { href: "history.html", text: "History race" },
      { href: "global.html", text: "India vs world" },
      { href: "atlas-3d.html", text: "India in 3D" },
    ]},
    { label: "Data", items: [
      { href: "data.html", text: "Data & API" },
      { href: "for-organisations.html", text: "For organisations" },
      { href: "references.html", text: "Sources" },
    ]},
    { label: "About", items: [
      { href: "about.html", text: "Methodology & disclaimer" },
      { href: "privacy-policy.html", text: "Privacy & policy" },
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
        const cur = isHere(i.href) ? ' aria-current="page" class="snav-cur"' : "";
        const ext = i.ext ? ' target="_blank" rel="noopener"' : "";
        return `<a href="${i.href}"${ext}${cur}>${i.text}</a>`;
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

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
