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
  tokens: Record<string, string>
}

const FONT_GUPTA = { '--font-display': '"Rozha One", Georgia, serif', '--font-ui': '"Karla", system-ui, sans-serif' }
const FONT_MODERN = { '--font-display': '"Archivo", system-ui, sans-serif', '--font-ui': '"Archivo", system-ui, sans-serif' }

export const TOKEN_SETS: Record<string, TokenSet> = {
  gupta: {
    id: 'gupta', label: 'Gupta', note: 'the warm default — stone & vermilion',
    from: 'Gupta-classical stone & vermilion — the house default.',
    tokens: { '--bg': '#f6f0e1', '--surface': '#efe3cc', '--ink': '#2a2018', '--accent': '#c1440e', '--accent-600': '#a23409', '--accent-700': '#8a2e08', '--band': '#c9862b', ...FONT_GUPTA },
  },
  chassis: {
    id: 'chassis', label: 'Modernist', note: 'the bare structural chassis — red on grey',
    from: 'The shared Modernist chassis every skin stands on — red on grey, Archivo, 0 radius.',
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
    tokens: { '--bg': '#fbeee8', '--surface': '#f6dccf', '--ink': '#3a1f1a', '--accent': '#c9345a', '--accent-600': '#a82849', '--accent-700': '#7f1d38', '--band': '#2a4a7a', ...FONT_GUPTA },
  },
  tamil: {
    id: 'tamil', label: 'Tamil Nadu', note: 'granite · kumkum · temple gold',
    from: 'Temple granite; kumkum red; the gold of the vimana.',
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
