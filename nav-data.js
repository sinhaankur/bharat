/* nav-data.js — the SINGLE SOURCE OF TRUTH for the atlas's views.
   Both the site nav (site-nav.js) and the hero app's rail + "All views" launcher
   (hero.html) read from this, so the two can never drift. Add a page once, here.

   Each group: { label, items: [ { href, text, hint?, icon?, rail?, ext? } ] }
     - hint : one-line description (shown in nav dropdowns + launcher)
     - icon : emoji (used by the hero launcher + rail)
     - rail : true → also pinned to the hero's slim left rail (the curated few)
     - ext  : external link (opens in a new tab; skipped by the hero)
   Exposes window.ATLAS_NAV. Plain script (no modules) so every page can include it. */
(function (g) {
  g.ATLAS_NAV = [
    { label: "Map", items: [
      { href: "hero.html", text: "★ One screen (globe app)", hint: "the whole atlas on one screen", icon: "🌍" },
      { href: "state-of-india.html", text: "State of India", hint: "who carries the country — states ranked", icon: "🏛", rail: true },
      { href: "index.html", text: "The map", hint: "2D fiscal atlas — every district", icon: "🗺", rail: true },
      { href: "explore.html", text: "Explore / query", hint: "filter & rank all 594", icon: "🔎", rail: true },
      { href: "feed.html", text: "News feed", hint: "bias vs the record, by place", icon: "📰", rail: true },
      { href: "timeline.html", text: "Timeline", hint: "events over time", icon: "🕐" },
      { href: "encroachment-atlas.html", text: "Built where water returns", hint: "illegal habitation", icon: "🏗" },
      { href: "quake-tsunami.html", text: "Quake & tsunami tracker", hint: "live USGS + historical quakes + tsunamis", icon: "🌊", rail: true },
    ]},
    { label: "3D", items: [
      { href: "india-3d.html", text: "The globe", hint: "real Earth · 594 districts · layers", icon: "🌍" },
      { href: "terrain-3d.html", text: "District terrain 3D", hint: "relief · river · flood plain (2D/3D)", icon: "🏔", rail: true },
      { href: "atlas-3d.html", text: "India by constraint", hint: "states by development constraint", icon: "⛰" },
      { href: "flood-3d.html", text: "Flood explorer", hint: "water over real terrain", icon: "🌊" },
      { href: "cave-walk.html", text: "Walk inside (first person)", hint: "walk through reconstructed temples (Ajanta · Ellora Kailasa · Nagara) — Street-View-style, as they once were", icon: "🚶", rail: true },
      { href: "heritage-3d.html", text: "Temples in 3D", hint: "photogrammetry of temples & ruins (Sketchfab)", icon: "🛕", rail: true },
      { href: "temple-forms.html", text: "Temple forms in 3D", hint: "architecture types & orientation, modelled in Blender", icon: "🏛" },
      { href: "earth-3d.html", text: "Photoreal Earth", hint: "Google 3D tiles (your key)", icon: "🛰" },
    ]},
    { label: "Study", items: [
      { href: "library.html", text: "Reading room", hint: "read the primary sources", icon: "📖", rail: true },
      { href: "engines.html", text: "The 7 engines", hint: "the composable lenses — Survey · Country · Development · Climate · Zoning · Corruption · News", icon: "⚙" },
      { href: "articles.html", text: "Analysis", hint: "written pieces", icon: "📝" },
      { href: "heritage-atlas.html", text: "Sacred ground", hint: "temples, their builders & destruction · Sanatan/Jain/Buddhist", icon: "🛕", rail: true },
      { href: "atrocities.html", text: "Atrocities timeline", hint: "history's 100 deadliest events (NYT/Matthew White)", icon: "💀" },
      { href: "deep-history.html", text: "Deep history in DNA", hint: "ancient-DNA population shifts: AASI/Iranian/Steppe, Neanderthals", icon: "🧬" },
      { href: "history.html", text: "History race", hint: "states over time", icon: "🏁" },
      { href: "command-chain.html", text: "Chain of command", hint: "who answers to whom", icon: "🔗" },
      { href: "mesh.html", text: "The mesh", hint: "how it all connects", icon: "🕸" },
      { href: "global.html", text: "India vs world", hint: "global comparison", icon: "🌐" },
      { href: "geopolitical-chess.html", text: "Geopolitical chess", hint: "the dollar is the board — who rules each player, what they bring, how it's entangled (a framing)", icon: "♟" },
    ]},
    { label: "Data", items: [
      { href: "knowledge.html", text: "Knowledge base", hint: "the data catalog", icon: "📚", rail: true },
      { href: "data.html", text: "Data & API", hint: "get the data", icon: "🧾" },
      { href: "references.html", text: "Sources", hint: "every citation", icon: "🔖" },
      { href: "provenance.html", text: "Provenance ledger", hint: "figure → source, audited", icon: "✅" },
      { href: "for-organisations.html", text: "For organisations", icon: "🏢" },
      { href: "share.html", text: "Share", icon: "🔗" },
    ]},
    { label: "About", items: [
      { href: "how-it-works.html", text: "How it works", hint: "the project, explained", icon: "ℹ️" },
      { href: "about.html", text: "Methodology & disclaimer", icon: "📋" },
      { href: "privacy-policy.html", text: "Privacy & policy", icon: "🔒" },
      { href: "sitemap.html", text: "Site map", icon: "🗺" },
      { href: "usa.html", text: "Compare: US", icon: "🇺🇸" },
      { href: "https://github.com/sinhaankur/india-fiscal-map", text: "GitHub ↗", ext: true },
    ]},
  ];
})(typeof window !== "undefined" ? window : this);
