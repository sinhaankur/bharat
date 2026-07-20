/* engines-data.js — THE single source of truth for the atlas's "engines".
 *
 * The project is framed as a set of composable engines, each reading the same
 * country through one lens; they mix. This file describes all of them ONCE, so both
 * the hub (engines.html) and every deep page (engine-*.html) render from the same
 * data — edit an engine here and it updates everywhere. See ENGINES.md.
 *
 * Every engine states its `sources` and obeys sourced-or-gap (a figure is cited or
 * it's an explicit gap — audit them on provenance.html). The Corruption engine is
 * additionally facts-only: it surfaces what an audit/court/RTI has ALREADY
 * established, never an accusation.
 *
 * Shape of an engine:
 *   slug, num, icon, accent   — identity (accent is an oklch colour string)
 *   name (may contain <em>), tagline, origin?(bool)
 *   lede                       — one paragraph, the deep-page hero
 *   maps: [{label, note}]      — WHAT it maps (the mechanisms/fields)
 *   how: [{h, p}]              — HOW it works (deep-page sections)
 *   example: {title, body}     — a real, sourced worked example (no fabrication)
 *   stat: {value, label}       — one honest headline number (computed elsewhere/known)
 *   views: [{href, text}]      — links into the EXISTING views that power it
 *   sources: [{name, tier}]    — the source discipline
 *   related: [slug, ...]       — sibling engines it mixes with
 */
(function (global) {
  'use strict';

  const ENGINES = [
    {
      slug: "survey", origin: true, num: "00", icon: "📐",
      accent: "oklch(0.82 0.13 65)",
      name: "The Survey <em>Engine</em>",
      tagline: "The known British engine that actually mapped and created this.",
      lede: "The first engine wasn't ours. The Great Trigonometrical Survey of India spent " +
        "seventy years (1802–1871) triangulating the subcontinent into measurable lines — " +
        "the Everest arc, the baseline towers, the fixed points that still define every " +
        "district boundary we use. It was built to measure the land in order to tax and " +
        "govern it. This whole atlas is the descendant instrument, turned the other way: " +
        "we map the country to hold that apparatus accountable.",
      maps: [
        { label: "District & taluk boundaries", note: "geoBoundaries polygons for all 594 districts + 6,800 sub-districts — the modern heirs of the survey's lines." },
        { label: "Elevation", note: "Per-district and per-taluk centroid elevation from open SRTM DEM — the terrain the survey once triangulated by hand." },
        { label: "Area → density", note: "Survey-of-India area figures divided by Census population give the population-density layer in the safety monitor." },
      ],
      how: [
        { h: "Triangulation, then and now", p: "The GTS fixed positions by measuring angles between towers across a 2,400 km meridian arc. We inherit the georeferenced result: every boundary, every centroid, every elevation sample is a coordinate that chain of measurement made possible." },
        { h: "Open data, not proprietary tiles", p: "We deliberately use OPEN sources — geoBoundaries, SRTM — not a paid satellite basemap. Deep zoom is an honest upscale of open imagery, never a claim of sharper data than exists." },
        { h: "The instrument, reversed", p: "Colonial survey mapped to extract. The same measured frame now carries money-flow, exposure and accountability layers on top — the map as a civic instrument, not a revenue one." },
      ],
      example: {
        title: "Kolkata, on the real ground",
        body: "The flood explorer raises water over Kolkata's actual open-DEM terrain — the delta the survey first charted — not a stylised shape. Every taluk you hover is a survey-descended polygon."
      },
      stat: { value: "594 + 6,800", label: "districts + sub-districts mapped" },
      views: [
        { href: "atlas-3d.html", text: "India in 3D" },
        { href: "terrain-3d.html", text: "3D topography" },
        { href: "how-it-works.html", text: "How it works" },
      ],
      sources: [
        { name: "Survey of India", tier: 1 },
        { name: "SRTM open DEM (NASA/USGS)", tier: 1 },
        { name: "geoBoundaries.org", tier: 2 },
      ],
      related: ["climate", "zoning", "development"],
    },

    {
      slug: "country", num: "01", icon: "🏛️",
      accent: "oklch(0.72 0.12 265)",
      name: "The Country <em>Engine</em>",
      tagline: "How India is constituted — who answers to whom.",
      lede: "What actually makes a country: the four-layer decode of Union vs State vs Union " +
        "Territory vs local body, which of the Constitution's three Lists a power sits on, " +
        "who appoints each officer, and how sanction flows down the chain. Every rupee in the " +
        "Development engine moves through this scaffolding; every officer in the Corruption " +
        "engine sits somewhere on it.",
      maps: [
        { label: "Chain of command", note: "Who appoints and who is accountable to whom, from the Union cabinet to a block development officer." },
        { label: "Protocol layers", note: "Each scheme/office tagged with its constitutional List, ministry, fiscal stream and sanction protocol." },
        { label: "Politics dimension", note: "State ruling party and alignment-with-centre per district (constituency MP/MLA left as an explicit gap)." },
        { label: "The mesh", note: "A relationship graph linking offices, schemes and money nodes." },
      ],
      how: [
        { h: "Three Lists, four layers", p: "The Seventh Schedule splits powers into Union, State and Concurrent Lists. We tag each power and office to its List and layer so you can see WHY a given decision sits where it does." },
        { h: "Appointing authority", p: "Every roster post carries who appointed it and who it answers to — the difference between an IAS collector (Union cadre, serving a state) and an elected mayor." },
        { h: "Local bodies are creatures of state law", p: "Municipal corporations — the big civic-budget holders — exist only by state statute. That's why their ₹-flows are tagged 'intergovernmental grant', not autonomous revenue." },
      ],
      example: {
        title: "A municipal budget's real chain",
        body: "BMC's ₹74,427 cr passes: own revenue + (Union Finance-Commission grants + State grants) → corporation consolidated fund → departments → State AG / Local Fund Audit → CAG technical guidance. The Country engine draws that line; the Development engine counts the money on it."
      },
      stat: { value: "4 layers", label: "Union · State · UT · local, decoded" },
      views: [
        { href: "command-chain.html", text: "Chain of command" },
        { href: "mesh.html", text: "The mesh" },
        { href: "explore.html", text: "Explore" },
      ],
      sources: [
        { name: "Constitution of India (Seventh Schedule)", tier: 1 },
        { name: "IndiaCode (statutes)", tier: 1 },
        { name: "Election Commission of India", tier: 1 },
      ],
      related: ["development", "corruption"],
    },

    {
      slug: "development", num: "02", icon: "🏗️",
      accent: "oklch(0.72 0.15 155)",
      name: "The Development <em>Engine</em>",
      tagline: "Money in → what it was for → what got built.",
      lede: "The money-flow ledger: civic budgets, devolution, own-tax and grants routed to a " +
        "district, each tagged with what it was intended to do. Beside it sits the economic " +
        "base — per-capita income, vehicles, aviation, housing — that says what a place " +
        "actually runs on. This is the 'pixels of money' half of the whole project.",
      maps: [
        { label: "Money-flow ledger", note: "Sourced ₹ rows per district: scheme, stream, amount, intended purpose, what the record shows happened." },
        { label: "Fiscal map views", note: "Own-tax, GSDP, devolution-in, contribution-out, net-flow and Finance-Commission share across 10 years." },
        { label: "Economic dimensions", note: "Economy (per-capita NSDP), vehicles/RTOs, aviation, housing — the base each district stands on." },
      ],
      how: [
        { h: "Money in, purpose attached", p: "Every ledger row records not just the amount but the intended use — so a later gap between promise and result is visible, not hidden." },
        { h: "Deep where a PDF exists", p: "We add Kolkata-depth figures only where a real government/budget document backs them. Elsewhere the structure is present and the amounts are honest gaps — never fabricated." },
        { h: "Ten years, one comparable frame", p: "State fiscal series run FY15–FY24 on a smoothed ±10% basis for year-on-year readability; Finance-Commission shares are exact." },
      ],
      example: {
        title: "The metros, pinned",
        body: "Ten districts now carry a real civic budget: BMC ₹74,427 cr, BBMP ₹19,931 cr, Surat ₹10,004 cr, Jaipur ₹6,946 cr, Chennai (revenue) ₹5,146 cr, Lucknow ₹4,305 cr… each cited, each with its gaps logged."
      },
      stat: { value: "10", label: "districts with a real ₹ money-flow row" },
      views: [
        { href: "index.html#map", text: "Money map" },
        { href: "explore.html", text: "Explore" },
        { href: "timeline.html", text: "Timeline" },
      ],
      sources: [
        { name: "Municipal corporation budgets", tier: 1 },
        { name: "RBI Handbook of Statistics on Indian States", tier: 2 },
        { name: "Finance Commission reports · MoRTH Vahan · AAI", tier: 1 },
      ],
      related: ["country", "corruption", "news"],
    },

    {
      slug: "climate", num: "03", icon: "🌊",
      accent: "oklch(0.7 0.13 220)",
      name: "The Climate <em>Engine</em>",
      tagline: "Where the water goes, and what it takes.",
      lede: "Physical exposure per district and taluk: flood-prone terrain, monsoon inundation, " +
        "coastal-regulation zones, palaeochannels and low-lying wards — raised over the real " +
        "open DEM in 3D. It is not a forecast. It is a record of where the ground is already " +
        "at risk, so a rupee spent in a floodway can be seen for what it is.",
      maps: [
        { label: "Flood explorer (3D)", note: "Raise water over any district's real terrain — an exposure view on open DEM, not a prediction." },
        { label: "Geography sub-layers", note: "Flood-prone, monsoon-inundation, low-lying %, palaeochannels — pinned where documented, gap where not." },
        { label: "Terrain & rivers", note: "Elevation, major rivers, coast status — the physical context under every ward." },
      ],
      how: [
        { h: "Exposure, not forecast", p: "We raise a flat water level over real elevation. It answers 'what's low and near water', a durable physical fact — not 'will it flood next monsoon', which we don't claim." },
        { h: "Open DEM only", p: "SRTM at ~30 m. Honest resolution, honestly labelled. The Kolkata flood simulation runs FluidX3D on that same open DEM, not a stylised basin." },
        { h: "Low-lying % is measured", p: "Per-district and per-taluk low-lying share is computed from the raster, not asserted — one of the few figures that is genuinely per-unit." },
      ],
      example: {
        title: "Kolkata's delta, simulated",
        body: "A fluid simulation over Kolkata's real open-DEM terrain shows how water pools in the delta and tidal wards — the same ground the Survey engine first charted, now read for risk."
      },
      stat: { value: "6,800", label: "taluks carrying a low-lying % from open DEM" },
      views: [
        { href: "flood-3d.html", text: "Flood explorer (3D)" },
        { href: "terrain-3d.html", text: "3D topography" },
        { href: "index.html#map", text: "Map facets" },
      ],
      sources: [
        { name: "Open DEM (SRTM)", tier: 1 },
        { name: "Bhuvan / NRSC flood hazard", tier: 1 },
        { name: "IMD · Central Water Commission", tier: 1 },
      ],
      related: ["survey", "zoning", "corruption"],
    },

    {
      slug: "zoning", num: "04", icon: "🗺️",
      accent: "oklch(0.78 0.14 45)",
      name: "The Land-Zoning <em>Engine</em>",
      tagline: "What can legally be built here.",
      lede: "The legal skin over the land: coastal-regulation categories, encroachment zones, " +
        "cadastral status and unsafe low-lying areas — the difference between what a place IS " +
        "and what the law lets it BECOME. Zoning is the default map facet because 'what can " +
        "legally be built here' is the question that turns terrain into accountability.",
      maps: [
        { label: "Zoning map facet", note: "The default lens on the map — the legal buildability read over each district." },
        { label: "CRZ (Coastal Regulation Zone)", note: "Category and development restriction per coastal district, from the CRZ Notification 2019." },
        { label: "Encroachment & cadastral", note: "Documented encroachment zones and cadastral status where a source exists; explicit gap otherwise." },
      ],
      how: [
        { h: "IS vs may-BECOME", p: "Terrain says what the ground is. Zoning says what the law permits on it. The gap between the two — a tower in a no-build CRZ-I stretch — is where accountability lives." },
        { h: "CRZ, by category", p: "The 2019 notification splits the coast into CRZ I–IV with different rules. We tag the applicable category per coastal district; the exact line on the ground stays a gap without a cadastral overlay." },
        { h: "Encroachment is sourced or absent", p: "We only mark an encroachment zone where a government finding documents it — never inferred from imagery alone." },
      ],
      example: {
        title: "The coast that can't be built on",
        body: "Coastal districts carry a CRZ flag that restricts development. Cross it with the Climate engine's low-lying layer and you get the wards that are both legally protected and physically exposed."
      },
      stat: { value: "Default", label: "zoning is the map's default facet" },
      views: [
        { href: "index.html#map", text: "Zoning facet" },
        { href: "terrain-3d.html", text: "3D topography" },
        { href: "explore.html", text: "Explore" },
      ],
      sources: [
        { name: "CRZ Notification 2019 (MoEF&CC)", tier: 1 },
        { name: "State town & country planning acts", tier: 1 },
        { name: "Bhuvan (land use)", tier: 2 },
      ],
      related: ["climate", "survey", "development"],
    },

    {
      slug: "corruption", num: "05", icon: "⚖️",
      accent: "oklch(0.72 0.17 30)",
      name: "The Corruption <em>Engine</em>",
      tagline: "The one we wish we didn't need — facts, never accusations.",
      lede: "Officers in position are sometimes corrupt, and the record sometimes proves it. " +
        "This engine surfaces only what an audit, a court, or an RTI reply has ALREADY " +
        "established — a CAG paragraph, a court-ordered pay or pension arrear, a prison over " +
        "its sanctioned capacity, the gap between a promise and the result. It never labels a " +
        "person corrupt. It shows the sourced trail and stops there.",
      facts_only: true,
      maps: [
        { label: "Accountability arc", note: "Promise → result → per-capita cost → human impact, built only from quoted promises and sourced outcomes." },
        { label: "Delayed pay & pension chains", note: "Court-settled arrears (WB DA 11 years; Punjab pension release) — established facts, with the judgment cited." },
        { label: "Prison overcrowding", note: "NCRB occupancy over sanctioned capacity per state — a structural failure the numbers show plainly." },
        { label: "Officials record", note: "Named office-holders with sourced postings — facts only, never an accusation attached to a name." },
      ],
      how: [
        { h: "Already-established, or it's not here", p: "The bar is deliberately high: a claim appears only if a government audit, a court order, or an RTI response has already found it. We aggregate the finding; we don't originate the charge." },
        { h: "No name is called corrupt", p: "We show that a pension was ordered released, or a budget line went unspent, or a jail is over capacity. We never write that a specific person is corrupt — the biggest defamation risk, deliberately avoided." },
        { h: "The record speaks", p: "Every entry links to its judgment/audit/RTI. If a reader wants the accusation, they can read the primary finding themselves." },
      ],
      example: {
        title: "West Bengal's DA arrears, settled by the Supreme Court",
        body: "Eleven years of delayed dearness allowance for state employees — not our allegation, but a matter the courts adjudicated and the Supreme Court settled. The chain records the promise, the delay, and the order, each cited."
      },
      stat: { value: "0", label: "accusations — only established findings" },
      views: [
        { href: "index.html#map", text: "Accountability" },
        { href: "story.html", text: "Story chains" },
        { href: "provenance.html", text: "Provenance" },
      ],
      sources: [
        { name: "CAG audit reports", tier: 1 },
        { name: "Court orders (SC / HC)", tier: 1 },
        { name: "NCRB Prison Statistics · RTI replies", tier: 1 },
      ],
      related: ["development", "country", "news"],
    },

    {
      slug: "news", num: "06", icon: "📰",
      accent: "oklch(0.8 0.15 72)",
      name: "The News <em>Engine</em>",
      tagline: "Who's telling it, where — against the spin-proof numbers.",
      lede: "News clustered by place, split by who's covering it (a third-party left→right lean, " +
        "recorded as aggregation, not our judgement) and set beside the reality that doesn't move " +
        "with the spin — population, per-capita money, crime. History is written by the winner; a " +
        "fact is disputable by who won. So the coverage is shown as contested, and the numbers " +
        "underneath as not. It's the live layer over the static record, feeding the map's 'What's new' strip.",
      maps: [
        { label: "Place clusters", note: "Every district/state gathers the news covering it — with a coverage-trend sparkline of when it flared up." },
        { label: "Bias bar", note: "A left→right media-lean split per place: is it being covered from all sides, or one?" },
        { label: "Bias vs reality", note: "Beside the coverage: Census population, per-capita money from the ledger, NCRB crime/prisons — sourced or an honest gap." },
        { label: "News map", note: "Bubbles on real district centroids, sized by volume and coloured by lean-skew — bias made spatial." },
      ],
      how: [
        { h: "Link-only, always attributed", p: "We never reproduce article text. We store a headline, a link, and the outlet — a discovery layer that points back to the source, never a replacement for it." },
        { h: "Lean is third-party, not ours", p: "The left/centre/right lean is from published bias assessments, explicitly recorded as aggregation. We flag where a place is covered one-sidedly, but make no political judgement of our own." },
        { h: "The number is the tie-breaker", p: "Every place card sets the contested coverage against a spin-proof reality panel — per-capita money, crime, population — each figure sourced or shown as a gap, never invented. That's the part that doesn't depend on who won." },
      ],
      example: {
        title: "Kolkata — coverage vs the rupee",
        body: "Eleven stories cluster on Kolkata, split across the lean bar. Beside them: 44.9 lakh people, the KMC's ₹2,897 cr civic budget (with its audit flag), ₹6,443 per head, crime 182/lakh — the numbers the coverage talks around, sourced or marked a gap."
      },
      stat: { value: "1,200+", label: "moderated items, clustered across 84 places" },
      views: [
        { href: "feed.html", text: "The feed — place by place" },
        { href: "feed.html#map", text: "The news map (bias, spatial)" },
        { href: "timeline.html", text: "Timeline" },
      ],
      sources: [
        { name: "RSS aggregation (link-only)", tier: 3 },
        { name: "Human moderation (curate.html)", tier: 3 },
        { name: "Published media-bias assessments", tier: 3 },
      ],
      related: ["development", "corruption"],
    },
  ];

  const BY_SLUG = {};
  ENGINES.forEach(e => { BY_SLUG[e.slug] = e; });

  global.ENGINES_DATA = { ENGINES, BY_SLUG, get: s => BY_SLUG[s] || null };
})(typeof window !== 'undefined' ? window : this);
