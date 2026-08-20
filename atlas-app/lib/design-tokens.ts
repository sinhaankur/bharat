// Full design-token values per Indic design system — the source for the downloadable
// CSS / JSON / spec files on /design-systems. Mirrors the html[data-skin=…] blocks in
// globals.css. Each skin is India's own design language; downloads carry a rights-reserved
// notice (Indic Designs™ · © Bharat). See [[indic-design-ip-trademark]].

export type TokenSet = {
  id: string
  label: string
  note: string
  // heritage source of the language (for the spec sheet)
  from: string
  // the fuller brand story — travels with the download (README + token $descriptions)
  story?: string
  tokens: Record<string, string>
}

// per-token heritage — why a token is the value it is. Keyed by CSS var. Used to fill
// $description in the W3C/Figma export and the token comments, so the story ships with
// the file. A token without an entry falls back to a plain role label.
export const TOKEN_STORY: Record<string, string> = {
  '--bg': 'The ground — the paper/stone/wall the whole register is set on.',
  '--surface': 'The raised surface — cards and panels lift a step off the ground.',
  '--ink': 'The text colour — the mark made on the ground.',
  '--accent': 'The one action colour. In each culture this hue already means “here, now, do this”.',
  '--accent-600': 'The action colour, pressed — a shade deeper for hover/active.',
  '--accent-700': 'The action colour, deepest — for text-on-light and dense states.',
  '--band': 'The secondary/ornament hue — bands, motifs, the quiet second voice.',
  '--font-display': 'The display face — headlines and the masthead voice.',
  '--font-ui': 'The reading face — body, labels and data.',
}

const FONT_GUPTA = { '--font-display': '"Rozha One", Georgia, serif', '--font-ui': '"Karla", system-ui, sans-serif' }
const FONT_MODERN = { '--font-display': '"Archivo", system-ui, sans-serif', '--font-ui': '"Archivo", system-ui, sans-serif' }

export const TOKEN_SETS: Record<string, TokenSet> = {
  gupta: {
    id: 'gupta', label: 'Gupta', note: 'the warm default — stone & house gold',
    from: 'Gupta-classical stone & house gold (#cc8900) — the default; CTAs wear the gold.',
    story: 'The Gupta register (c. 320–550 CE) — the classical age of Ajanta fresco and the Mathura Buddha. Its ground is lime-plaster; its action colour the halo-gold of the prabhāvali, where the eye is meant to land. Ornament is modelled in plaster, not incised in stone, so corners roll (a warm 6px) rather than chisel sharp. Proportion follows tālamāna iconometry — by the rule, never by eye.',
    tokens: { '--bg': '#f6f0e1', '--surface': '#efe3cc', '--ink': '#2a2018', '--accent': '#cc8900', '--accent-600': '#a06b00', '--accent-700': '#7d5400', '--band': '#cc8900', ...FONT_GUPTA },
  },
  chassis: {
    id: 'chassis', label: 'Modernist', note: 'the bare structural chassis — red on grey',
    from: 'The shared Modernist chassis every skin stands on — red on grey, Archivo, 0 radius.',
    story: 'The bare chassis — the structural skeleton every Indic skin is a token-layer over. Red on grey, Archivo, 0 radius, 2px rules, hard offset shadows. It carries no heritage of its own on purpose: it is the loom the regional cloth is woven on. Wear any skin to dress it; the layout never moves, only the tokens swap.',
    tokens: { '--bg': '#f3f2f2', '--surface': '#eae9e9', '--ink': '#201e1d', '--accent': '#ec3013', '--accent-600': '#dd2b0f', '--accent-700': '#ae1800', '--band': '#ec3013', ...FONT_MODERN },
  },
  kashmir: {
    id: 'kashmir', label: 'Kashmir', note: 'valley stone · saffron · trefoil',
    from: "Valley stone and saffron; the trefoil arch of Martand Sun Temple.",
    tokens: { '--bg': '#f4efe6', '--surface': '#e9e0d0', '--ink': '#241f1a', '--accent': '#d98a2b', '--accent-600': '#bd7420', '--accent-700': '#8f5615', '--band': '#6e7f8c', ...FONT_GUPTA },
  },
  rajasthan: {
    id: 'rajasthan', label: 'Rajasthan', note: 'pink sandstone · leheriya · indigo',
    from: 'Pink sandstone of the walled city; leheriya tie-dye; indigo.',
    story: 'The Rajput register (8th–18th c.) — the desert courts of miniature painting and fort-cities. The ground is cream wasli paper; the action colour cinnabar vermilion, the loudest pigment on the page, saved for the one thing that must be seen. Corners take a 5px jharokha arch — the cusped oriel window: ornamented but crisp, a line painted with a squirrel-hair brush. Indigo (nīla, India’s “blue gold”) is the quiet second voice.',
    tokens: { '--bg': '#fbeee8', '--surface': '#f6dccf', '--ink': '#3a1f1a', '--accent': '#c9345a', '--accent-600': '#a82849', '--accent-700': '#7f1d38', '--band': '#2a4a7a', ...FONT_GUPTA },
  },
  tamil: {
    id: 'tamil', label: 'Tamil Nadu', note: 'granite · kumkum · temple gold',
    from: 'Temple granite; kumkum red; the gold of the vimana.',
    story: 'The Chola register (9th–13th c. CE) — Tamil imperial, cast in bronze and dry-stacked granite. The ground is sacred-ash white; the action colour is kumkum vermilion, the red of active worship, which in the culture already means “here, now, sacred”. Corners stay a squared 3px — granite blocks laid without mortar, holding because the stone does. The Great Living Temples are still in worship, so the palette is observed practice, not archaeology.',
    tokens: { '--bg': '#f5efe4', '--surface': '#eadfc8', '--ink': '#231c14', '--accent': '#a8322b', '--accent-600': '#8c2822', '--accent-700': '#6b1e19', '--band': '#c9862b', ...FONT_GUPTA },
  },
  kerala: {
    id: 'kerala', label: 'Kerala', note: 'backwater green · coir · brass',
    from: 'Backwater green; coir weave; temple brass.',
    tokens: { '--bg': '#eef2e6', '--surface': '#dde7cf', '--ink': '#1c241a', '--accent': '#2f7d4f', '--accent-600': '#266641', '--accent-700': '#1c4d31', '--band': '#b8863b', ...FONT_GUPTA },
  },
  assam: {
    id: 'assam', label: 'Assam', note: 'gamosa weave · red border · green',
    from: 'The gamosa — cream cloth, red woven border, field green.',
    tokens: { '--bg': '#f6f1e6', '--surface': '#ece2cd', '--ink': '#232019', '--accent': '#c0392b', '--accent-600': '#9f2f24', '--accent-700': '#78241b', '--band': '#3f6b45', ...FONT_GUPTA },
  },
  naga: {
    id: 'naga', label: 'Nagaland', note: 'Naga shawl bands · loom red',
    from: 'Naga shawl bands — black ground carrying red and white loom stripes.',
    tokens: { '--bg': '#f2ece2', '--surface': '#e5dccd', '--ink': '#201a16', '--accent': '#b3271f', '--accent-600': '#94201a', '--accent-700': '#6f1813', '--band': '#201a16', ...FONT_GUPTA },
  },
}

export const RIGHTS = 'Indic Designs™ — India’s own design systems. © 2026 Bharat. All rights reserved. View / download for reference; no redistribution or reuse without a licence.'
