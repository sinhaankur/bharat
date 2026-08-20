/* nav-data.js — the SINGLE SOURCE OF TRUTH for the atlas's views.
   site-nav.js, hero.html (rail + "All views"), home.html (topic hub) and
   command-palette.js (smart search) all read this, so nothing can drift.
   Add a page once, here.

   Each group: { label, tagline?, items: [ { href, text, hint?, icon?, rail?, ext?, keywords? } ] }
     - tagline  : one line describing the whole section (shown on the home hub)
     - hint     : one-line description (nav dropdowns + launcher + cards)
     - icon     : emoji (hero launcher + rail + cards)
     - rail     : true → also pinned to the hero's slim left rail (the curated few)
     - ext      : external link (new tab; skipped by the hero)
     - keywords : extra search terms / synonyms for the ⌘K smart search
   Exposes window.ATLAS_NAV. Plain script (no modules) so every page can include it. */
(function (g) {
  g.ATLAS_NAV = [
    { label: "Map", tagline: "Start here — every district on one map, and the tools to read it.", items: [
      { href: "index.html", text: "The map", hint: "2D fiscal atlas — every district", icon: "🗺", rail: true, keywords: "money fiscal district choropleth budget spending main default start" },
      { href: "hero.html", text: "One screen (globe app)", hint: "the whole atlas on one screen", icon: "🌍", keywords: "app dashboard everything single screen globe" },
      { href: "state-of-india.html", text: "State of India", hint: "who carries the country — states ranked", icon: "🏛", rail: true, keywords: "states ranked ranking leaderboard richest poorest" },
      { href: "explore.html", text: "Explore / query", hint: "filter & rank all 594 districts", icon: "🔎", rail: true, keywords: "search filter query find rank compare districts data" },
      { href: "feed.html", text: "News feed", hint: "bias vs the record, by place", icon: "📰", rail: true, keywords: "news media bias headlines events current affairs ground" },
      { href: "timeline.html", text: "Timeline", hint: "events over time", icon: "🕐", keywords: "time history events chronology when" },
    ]},

    { label: "Land & Climate", tagline: "The physical India — terrain, water, flood, and where it's unsafe to build.", items: [
      { href: "encroachment-atlas.html", text: "Built where water returns", hint: "illegal habitation on flood land", icon: "🏗", rail: true, keywords: "encroachment illegal flood water land habitation river building unsafe reclaim" },
      { href: "terrain-3d.html", text: "District terrain 3D", hint: "relief · river · flood plain (2D/3D)", icon: "🏔", rail: true, keywords: "terrain elevation relief mountain river 3d landscape topography" },
      { href: "flood-3d.html", text: "Flood explorer", hint: "water over real terrain", icon: "🌊", keywords: "flood water sea level rise inundation climate risk" },
      { href: "quake-tsunami.html", text: "Quake & tsunami tracker", hint: "live USGS + historical quakes + tsunamis", icon: "🌋", rail: true, keywords: "earthquake quake tsunami seismic disaster hazard usgs live" },
      { href: "atlas-3d.html", text: "India by constraint", hint: "states by development constraint", icon: "⛰", keywords: "constraint development geography barrier terrain" },
    ]},

    { label: "History & Heritage", tagline: "The deep past — temples, rulers, DNA, and the record of what happened here.", items: [
      { href: "ancient-india.html", text: "Ancient India timeline", hint: "5,000 years on one spine — language, script, people, rulers & heritage per era", icon: "⏳", rail: true, keywords: "ancient india timeline history era indus vedic mauryan gupta spine chronology overview when language script people rulers heritage" },
      { href: "heritage-atlas.html", text: "Sacred ground", hint: "temples, their builders & destruction · Sanatan/Jain/Buddhist", icon: "🛕", rail: true, keywords: "temple heritage sacred hindu sanatan jain buddhist builder destruction religion mandir" },
      { href: "cave-walk.html", text: "Walk inside (first person)", hint: "walk through reconstructed temples — Ajanta, Ellora, Nagara", icon: "🚶", rail: true, keywords: "temple walk first person ajanta ellora cave 3d explore immersive street view" },
      { href: "heritage-3d.html", text: "Temples in 3D", hint: "photogrammetry of temples & ruins", icon: "🏛", keywords: "temple 3d photogrammetry ruins sketchfab model" },
      { href: "temple-forms.html", text: "Temple forms in 3D", hint: "architecture types & orientation, modelled in Blender", icon: "🕌", keywords: "temple architecture shikhara vimana form type blender 3d" },
      { href: "ashoka.html", text: "Ashoka's rule of the land", hint: "the Mauryan empire mapped from its edicts + the Kalinga remorse", icon: "🦁", rail: true, keywords: "ashoka maurya empire edict kalinga brahmi ruler king emperor dhamma history" },
      { href: "deep-history.html", text: "Deep history in DNA", hint: "ancient-DNA population shifts: AASI/Iranian/Steppe", icon: "🧬", keywords: "dna genetics ancestry aryan migration steppe aasi population reich origin" },
      { href: "atrocities.html", text: "Atrocities timeline", hint: "history's 100 deadliest events", icon: "💀", keywords: "atrocities deaths war massacre deadliest violence toll history matthew white" },
      { href: "history.html", text: "History race", hint: "states over time", icon: "🏁", keywords: "history race states over time animation bar chart" },
    ]},

    { label: "Languages", tagline: "Every language & script of Bharat — families, fonts, sacred texts, one journey.", items: [
      { href: "languages.html", text: "Languages of Bharat", hint: "the hub: families, scripts, fonts & source texts across India", icon: "🗣", rail: true, keywords: "language hub families scripts fonts sanskrit tamil hindi dravidian indo-aryan" },
      { href: "journey.html", text: "The journey of a word", hint: "scroll through 4,000 years: one word across the deep past to today", icon: "🧭", keywords: "language journey scroll story word history evolution scrollytelling" },
      { href: "scripts.html", text: "Scripts & families", hint: "Indo-Aryan vs Dravidian + the Brahmi script family + Bharati", icon: "🔤", keywords: "script brahmi devanagari tamil grantha family tree bharati alphabet writing abugida" },
      { href: "vedas.html", text: "Texts across languages", hint: "the Rigveda's Hymn of Creation — Sanskrit, word-gloss & translations compared", icon: "📜", keywords: "veda rigveda sanskrit hymn creation nasadiya translation griffith grammar text scripture" },
    ]},

    { label: "3D & Globe", tagline: "See India as it really is — a real globe, real terrain, real buildings.", items: [
      { href: "india-3d.html", text: "The globe", hint: "real Earth · 594 districts · layers", icon: "🌍", rail: true, keywords: "3d globe earth sphere real world districts layers" },
      { href: "globe-map.html", text: "Globe → map", hint: "watch the globe unroll into a flat map", icon: "◐", rail: true, keywords: "globe map projection morph unroll transform animation" },
      { href: "mesh.html", text: "The mesh", hint: "how it all connects", icon: "🕸", keywords: "mesh network connections graph links relationships" },
    ]},

    { label: "Study", tagline: "The lenses and the arguments — engines, analysis, and the world beyond India.", items: [
      { href: "engines.html", text: "The 7 engines", hint: "the composable lenses — Survey · Country · Development · Climate · Zoning · Corruption · News", icon: "⚙", keywords: "engines lenses framework survey country development climate zoning corruption news method" },
      { href: "library.html", text: "Reading room", hint: "read the primary sources", icon: "📖", rail: true, keywords: "library books reading room primary sources archive nehru memoir read" },
      { href: "articles.html", text: "Analysis", hint: "written pieces", icon: "📝", keywords: "articles analysis writing essays opinion pieces read" },
      { href: "global.html", text: "India vs world", hint: "global comparison", icon: "🌐", keywords: "global world comparison gdp countries international vs benchmark" },
      { href: "geopolitical-chess.html", text: "Geopolitical chess", hint: "the dollar is the board — who rules each player (a framing)", icon: "♟", keywords: "geopolitics chess dollar world powers usa china russia framing players" },
      { href: "command-chain.html", text: "Chain of command", hint: "who answers to whom", icon: "🔗", keywords: "command chain hierarchy government who answers officials structure federal" },
    ]},

    { label: "Data", tagline: "The receipts — every figure, every source, and the raw data.", items: [
      { href: "knowledge.html", text: "Knowledge base", hint: "the data catalog", icon: "📚", rail: true, keywords: "knowledge catalog data index all datasets" },
      { href: "data.html", text: "Data & API", hint: "get the data", icon: "🧾", keywords: "data api download json geojson raw export" },
      { href: "references.html", text: "Sources", hint: "every citation", icon: "🔖", keywords: "sources references citations bibliography evidence" },
      { href: "provenance.html", text: "Provenance ledger", hint: "figure → source, audited", icon: "✅", keywords: "provenance audit figure source ledger verified sourced attribution" },
    ]},

    { label: "About", tagline: "What this is, how it's built, and how to use or share it.", items: [
      { href: "how-it-works.html", text: "How it works", hint: "the project, explained", icon: "ℹ️", keywords: "how it works about explain intro what is this help start guide" },
      { href: "indic-design-systems.html", text: "Indic design systems", hint: "the family — Mauryan, Gupta, Chola, Rajput… one atomic spine, many heritages", icon: "🪷", keywords: "indic design systems family atomic mauryan gupta chola rajput heritage tokens skins per state sinhaankur" },
      { href: "design-system.html", text: "Design system — Mauryan", hint: "the flagship atomic reference: tokens, atoms, molecules, organisms, templates", icon: "🎨", keywords: "design system brand style guide tokens colors components ui ux theme atomic mauryan reference cookbook" },
      { href: "app/design-systems/", text: "India by Design Systems", hint: "the flagship deck — one chassis, many Indias (Indic skins)", icon: "🪷", ext: true, keywords: "indic design systems flagship skins states chassis modernist segment lattice" },
      { href: "app/canvas/", text: "The canvas", hint: "every screen of the atlas, one deck", icon: "🗂", ext: true, keywords: "canvas mockups deck every screen design pages map" },
      { href: "about.html", text: "Methodology & disclaimer", icon: "📋", keywords: "about methodology disclaimer legal how method" },
      { href: "for-organisations.html", text: "For organisations", icon: "🏢", keywords: "organisations business enterprise partner ngo licence" },
      { href: "share.html", text: "Share", icon: "🔗", keywords: "share social embed widget" },
      { href: "privacy-policy.html", text: "Privacy & policy", icon: "🔒", keywords: "privacy policy legal cookies terms" },
      { href: "sitemap.html", text: "Site map", icon: "🗺", keywords: "sitemap all pages index list everything navigation" },
      { href: "usa.html", text: "Compare: US", icon: "🇺🇸", keywords: "usa america united states compare" },
      { href: "https://github.com/sinhaankur/bharat", text: "GitHub ↗", ext: true, keywords: "github code open source repo" },
    ]},
  ];

  /* ── ATLAS_SECTIONS — the MAGAZINE masthead (editorial, reader-facing).
     The top nav renders from THIS; the drawer/footer/search still use the full
     ATLAS_NAV above. A section is a curated reader label whose items are drawn
     from real pages. `lead` = the one story/tool to surface first in the menu.
     Utility (About) deliberately lives only in the footer. */
  /* Public-first arrangement (2026-08-19): FIVE reader topics anyone understands —
     News · Money · Land · History · Languages — plus a single About that gathers the
     project's tools, sources and craft. '3D' is a format, not a topic, so its views
     fold into the topic they belong to (globe→Money, temples→History, terrain→Land).
     Every page stays reachable. Labels are plain; jargon lives in the hints, not the
     top nav. nav-data.js is the single source → header, drawer, footer, home, search. */
  g.ATLAS_SECTIONS = [
    { label: "News", href: "feed.html", tagline: "What's happening now — and who's spinning it. The headlines, next to the numbers.", items: [
      { href: "feed.html", text: "Today's news", hint: "the headlines, gathered by place" },
      { href: "feed.html#bias", text: "The spin check", hint: "each story, next to the sourced number" },
      { href: "timeline.html", text: "How it built up", hint: "the story over time, event by event" },
    ]},
    { label: "Money", href: "index.html", tagline: "Where India's public money goes — every district on the map, and who answers for it.", items: [
      { href: "index.html", text: "The money map", hint: "start here — every district, coloured by money" },
      { href: "india-3d.html", text: "See it on the globe", hint: "the same India in 3D — real Earth, every layer" },
      { href: "globe-map.html", text: "Globe → flat map", hint: "watch the globe unroll into the map" },
      { href: "state-of-india.html", text: "Which states carry the country", hint: "every state ranked by what it gives & gets" },
      { href: "explore.html", text: "Ask your own question", hint: "filter & rank all 594 districts" },
      { href: "command-chain.html", text: "Who's in charge", hint: "the chain of command, tier by tier" },
    ]},
    { label: "Land", href: "encroachment-atlas.html", tagline: "Read the ground itself — where the water returns, and where it's unsafe to build.", items: [
      { href: "encroachment-atlas.html", text: "Built where water returns", hint: "start here — homes on flood land" },
      { href: "terrain-3d.html", text: "The land in 3D", hint: "real relief — river, plain & mountain" },
      { href: "flood-3d.html", text: "Raise the water", hint: "flooding, over real terrain" },
      { href: "quake-tsunami.html", text: "Earthquakes & tsunamis", hint: "the live hazard — USGS + historical" },
    ]},
    { label: "History", href: "ancient-india.html", tagline: "Walk 5,000 years — the timeline, the rulers, the temples, and the record of what happened.", items: [
      { href: "ancient-india.html", text: "5,000 years, one timeline", hint: "start here — the whole spine" },
      { href: "ashoka.html", text: "Ashoka's empire", hint: "one empire, read in its own edicts" },
      { href: "heritage-atlas.html", text: "Temples & sacred ground", hint: "who built them — and who destroyed them" },
      { href: "cave-walk.html", text: "Walk inside a temple", hint: "step in — a first-person reconstruction" },
      { href: "heritage-3d.html", text: "Temples in 3D", hint: "scanned & modelled, as they stand and stood" },
      { href: "temple-forms.html", text: "How temples are shaped", hint: "Nagara · Dravida · Kalinga, modelled to real dims" },
      { href: "deep-history.html", text: "Who we are, in DNA", hint: "the ancient-DNA population shifts" },
      { href: "atrocities.html", text: "History's deadliest events", hint: "the 100 worst, mapped and counted" },
    ]},
    { label: "Languages", href: "languages.html", tagline: "Every tongue & script of Bharat — the families, the journey of a word, one text across many.", items: [
      { href: "languages.html", text: "Every language & script", hint: "start here — the hub" },
      { href: "journey.html", text: "The journey of a word", hint: "one word through 4,000 years" },
      { href: "scripts.html", text: "The script family tree", hint: "Indo-Aryan vs Dravidian + Brahmi" },
      { href: "vedas.html", text: "One text, many tongues", hint: "the Rigveda, translated & compared" },
    ]},
    { label: "About", href: "how-it-works.html", tagline: "What this is, how it's built, where every number comes from — and the design behind it.", items: [
      { href: "how-it-works.html", text: "How it works", hint: "start here — the project in plain terms", children: [
        { href: "engines.html", text: "The 7 engines", hint: "the lenses that read the whole atlas" },
        { href: "global.html", text: "India vs the world", hint: "GDP, income & industry, compared" },
        { href: "geopolitical-chess.html", text: "The geopolitical board", hint: "who rules each player (a framing)" },
        { href: "mesh.html", text: "How it all connects", hint: "money, cases, officials & districts" },
      ] },
      { href: "knowledge.html", text: "The data & sources", hint: "every figure, traced to its citation", children: [
        { href: "knowledge.html", text: "Knowledge base", hint: "the whole data catalog" },
        { href: "provenance.html", text: "Every figure → its source", hint: "the provenance ledger, 0 unattributed" },
        { href: "officials.html", text: "Officials to track", hint: "the sourced accountability register" },
        { href: "references.html", text: "Sources", hint: "every citation" },
        { href: "data.html", text: "Get the data", hint: "download & API" },
        { href: "library.html", text: "Reading room", hint: "the primary texts" },
      ] },
      { href: "indic-design-systems.html", text: "The design behind it", hint: "Indic Designs™ — India's own design systems", children: [
        { href: "app/design-systems/", text: "India by Design Systems", hint: "the flagship — a skin per state, one chassis", ext: true },
        { href: "app/design-systems/#gallery", text: "The gallery", hint: "walk the systems, plate by plate", ext: true },
        { href: "indic-design-systems.html", text: "The family", hint: "Mauryan · Gupta · Chola · Rajput" },
        { href: "design-system.html", text: "Atomic reference", hint: "tokens → templates" },
      ] },
      { href: "about.html", text: "Methodology & honesty", hint: "the sourced-or-gap rule, and the limits", children: [
        { href: "about.html", text: "Methodology & disclaimer", hint: "how we source, what we don't claim" },
        { href: "for-organisations.html", text: "For organisations", hint: "licensing, widgets, commissioned work" },
        { href: "share.html", text: "Share", hint: "post a card from the data" },
        { href: "sitemap.html", text: "Everything (site map)", hint: "every page, one list" },
      ] },
    ]},
  ];
})(typeof window !== "undefined" ? window : this);
