// ─────────────────────────────────────────────────────────────────────────
// ATLAS PAGES — the single registry of EVERY page in the atlas (58 legacy
// static pages + the native Next routes). Each legacy page is reachable via a
// themed shell at /p/<slug> that frames the working original .html. Native
// pages point straight at their route. Nothing is dead.
// ─────────────────────────────────────────────────────────────────────────

export type Section =
  | 'News'
  | 'Money'
  | 'Land'
  | 'History'
  | 'Languages'
  | '3D'
  | 'Data'
  | 'About'

export type AtlasPage = {
  slug: string // /p/<slug>  (also the source filename without .html for legacy)
  title: string
  section: Section
  blurb?: string
  native?: string // if set, this page has a native Next route (use instead of the frame)
  file?: string // legacy html file if different from `${slug}.html`
  featured?: boolean
}

// NOTE order within a section = display order in the atlas directory.
export const ATLAS_PAGES: AtlasPage[] = [
  // ── News ────────────────────────────────────────────────────────────────
  { slug: 'news', title: 'News, bias & sentiment', section: 'News', native: '/news', featured: true, blurb: 'Live India headlines with media-lean, tone and a legal-safe read.' },
  { slug: 'feed', title: 'News, place by place', section: 'News', blurb: 'Bias vs reality, clustered by place.' },
  { slug: 'engine-news', title: 'The News Engine', section: 'News', blurb: 'How the newsroom aggregates and labels sources.' },
  { slug: 'story', title: 'Source & bias comparison', section: 'News' },
  { slug: 'curate', title: 'Curate — moderation tool', section: 'News' },
  { slug: 'geopolitical-chess', title: 'Geopolitical Chess', section: 'News', featured: true, blurb: 'The dollar is the board — long game and short game.' },

  // ── Money ───────────────────────────────────────────────────────────────
  { slug: 'index', title: 'The India Fiscal Map', section: 'Money', native: '/map', featured: true, blurb: 'India by district — public money, flood & CRZ zoning, land.' },
  { slug: 'explore', title: "Explore the districts", section: 'Money', blurb: 'Money, flood, CRZ zoning & risk, district by district.' },
  { slug: 'engines', title: 'The Engines', section: 'Money', featured: true, blurb: 'Seven composable engines over the same data.' },
  { slug: 'engine-survey', title: 'Survey Engine', section: 'Money' },
  { slug: 'engine-country', title: 'Country Engine', section: 'Money' },
  { slug: 'engine-development', title: 'Development Engine', section: 'Money' },
  { slug: 'engine-climate', title: 'Climate Engine', section: 'Money' },
  { slug: 'engine-corruption', title: 'Corruption Engine', section: 'Money', blurb: 'Names, departments, the chain — in legal-safe language.' },
  { slug: 'engine-zoning', title: 'Zoning Engine', section: 'Money' },
  { slug: 'command-chain', title: 'Chain of command', section: 'Money', blurb: 'How the IAS / IPS system actually works.' },
  { slug: 'mesh', title: 'The mesh', section: 'Money', blurb: 'How officials, districts, money & cases connect.' },
  { slug: 'how-it-works', title: 'How it works', section: 'Money' },
  { slug: 'state-of-india', title: 'State of India', section: 'Money', blurb: 'Who carries the country.' },
  { slug: 'provenance', title: 'Provenance ledger', section: 'Money', blurb: 'Every figure → its citation.' },
  { slug: 'timeline', title: 'Fund-story timeline', section: 'Money' },
  { slug: 'history', title: 'Land-revenue history', section: 'Money' },
  { slug: 'usa', title: 'USA Fiscal Map', section: 'Money', blurb: 'A comparison — state revenue, net flow & GSP.' },
  { slug: 'global', title: 'India vs the world', section: 'Money', blurb: 'GDP, income & industry.' },
  { slug: 'widget', title: 'Fiscal card widget', section: 'Money' },

  // ── Land ────────────────────────────────────────────────────────────────
  { slug: 'encroachment-atlas', title: 'Built where the water returns', section: 'Land', featured: true, blurb: "India's encroachment cases on land the water reclaims." },
  { slug: 'heritage-atlas', title: 'Sacred ground of the world', section: 'Land', featured: true, blurb: 'A sourced atlas of sacred sites, builders & destruction.' },
  { slug: 'atrocities', title: 'Population Control, Marauder Style', section: 'Land', blurb: 'An interactive atlas of historical atrocity.' },
  { slug: 'quake-tsunami', title: 'Earthquake & tsunami tracker', section: 'Land', blurb: 'Live USGS feed + historical quakes & tsunamis.' },

  // ── History ─────────────────────────────────────────────────────────────
  { slug: 'ancient-india', title: 'Ancient India', section: 'History', native: '/ancient-india', featured: true, blurb: 'One timeline: language, script, people, rule, heritage.' },
  { slug: 'pataliputra', title: 'Pataliputra — the god-gifted city', section: 'History', native: '/pataliputra', featured: true, blurb: 'How Megasthenes & Faxian described the Mauryan capital — and how archaeology proved it real.' },
  { slug: 'edicts', title: 'The Edicts of Ashoka', section: 'History', native: '/edicts', featured: true, blurb: 'The empire in his own words — Kalinga’s remorse, conquest by Dhamma, the protection of all life.' },
  { slug: 'ashoka', title: "Ashoka's rule of the land", section: 'History', blurb: 'The empire read from his own edicts.' },
  { slug: 'deep-history', title: 'Deep history in DNA', section: 'History', native: '/deep-history', blurb: 'The population shifts that made South Asia.' },
  { slug: 'heritage-3d', title: 'Temples in 3D', section: 'History', blurb: 'See how they looked.' },
  { slug: 'cave-walk', title: 'Walk inside the temples', section: 'History', featured: true, blurb: 'A first-person walk through temples as they were.' },
  { slug: 'temple-forms', title: 'Temple forms in 3D', section: 'History', blurb: 'How each style is shaped and oriented.' },
  { slug: 'library', title: 'The Reading Room', section: 'History', blurb: 'Study the primary sources.' },

  // ── Languages ───────────────────────────────────────────────────────────
  { slug: 'languages', title: 'Languages of Bharat', section: 'Languages', native: '/languages', featured: true, blurb: 'Families, scripts, fonts & source texts.' },
  { slug: 'scripts', title: 'Scripts & language families', section: 'Languages', blurb: "Brahmi's tree and the roots of the branches." },
  { slug: 'journey', title: 'The journey of a word', section: 'Languages', blurb: 'One meaning, across time and tongues.' },
  { slug: 'vedas', title: 'The Hymn of Creation', section: 'Languages', blurb: 'Nāsadīya Sūkta across languages.' },
  { slug: 'mauryan', title: 'Mauryan design language', section: 'Languages', native: '/mauryan', featured: true, blurb: 'The full Indian design system — carved in Blender.' },

  // ── 3D ──────────────────────────────────────────────────────────────────
  { slug: 'india-3d', title: 'India in 3D', section: '3D', featured: true, blurb: 'States, rivers & the full claimed map on a globe.' },
  { slug: 'atlas-3d', title: 'Geography constraint atlas', section: '3D', blurb: 'India in 3D — terrain, flood, zoning.' },
  { slug: 'terrain-3d', title: 'Real topography', section: '3D', blurb: 'India in 3D from open DEM.' },
  { slug: 'flood-3d', title: 'District flood explorer', section: '3D', blurb: 'Rising water on real terrain.' },
  { slug: 'earth-3d', title: 'Photoreal 3D Earth', section: '3D', blurb: 'Google 3D Tiles (your key).' },
  { slug: 'globe-map', title: 'Globe → Map', section: '3D' },
  { slug: 'hero', title: 'The whole country, one screen', section: '3D', blurb: 'The single-screen atlas app.' },

  // ── Data ────────────────────────────────────────────────────────────────
  { slug: 'knowledge', title: 'Knowledge base', section: 'Data', featured: true, blurb: 'Every district, dimension, source & gap.' },
  { slug: 'data', title: 'Data & API', section: 'Data', blurb: 'Download, embed, reuse.' },
  { slug: 'references', title: 'Sources & references', section: 'Data' },
  { slug: 'articles', title: 'Analysis', section: 'Data', blurb: "Data-journalism on India's public money." },
  { slug: 'article', title: 'Analysis (single)', section: 'Data' },
  { slug: 'share', title: 'Share from the data', section: 'Data' },
  { slug: 'sitemap', title: 'Site map', section: 'Data' },

  // ── About ───────────────────────────────────────────────────────────────
  { slug: 'about', title: 'About & methodology', section: 'About', blurb: 'How this is built, and its limits.' },
  { slug: 'for-organisations', title: 'For organisations', section: 'About', blurb: 'Data licensing, widgets & commissions.' },
  { slug: 'how-we-report', title: 'How we report', section: 'About', file: 'about', blurb: 'Editorial standards & the Lawyer Engine.' },
  { slug: 'design-system', title: 'Design system (legacy)', section: 'About' },
  { slug: 'privacy-policy', title: 'Privacy & policy', section: 'About' },
  { slug: 'components', title: 'Component gallery', section: 'About', native: '/components', blurb: 'Every atom, molecule & organism, living.' },
]

export const SECTIONS: Section[] = ['News', 'Money', 'Land', 'History', 'Languages', '3D', 'Data', 'About']

export function pagesBySection(section: Section): AtlasPage[] {
  return ATLAS_PAGES.filter((p) => p.section === section)
}

export function findPage(slug: string): AtlasPage | undefined {
  return ATLAS_PAGES.find((p) => p.slug === slug)
}

// the href a page should link to: native route if it has one, else the framed shell
export function hrefFor(p: AtlasPage): string {
  return p.native ?? `/p/${p.slug}`
}

// the legacy html file url for the frame.
// The 58 original .html pages are NOT copied under the app; they live at the
// ATLAS ROOT (e.g. /india-fiscal-map/heritage-atlas.html). The app is deployed
// one level deeper at <atlasRoot>/app. So we strip a trailing "/app" from the
// base path to point the iframe back up at the atlas root. In dev (base = '')
// we serve them through the public/legacy symlink instead.
export function legacyUrl(p: AtlasPage): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
  // ?embed=1 tells the legacy atlas to suppress its OWN site-nav/header/footer
  // (site-nav.js embed-mode), so it renders content-only inside our themed frame
  // — no double header. Legacy pages look like part of the Mauryan design.
  const file = `${p.file ?? p.slug}.html?embed=1`
  if (!base) {
    // dev: served via public/legacy → /legacy/<file>
    return `/legacy/${file}`
  }
  // production: base is like "/bharat/app" → atlas root is "/bharat"
  const atlasRoot = base.replace(/\/app\/?$/, '')
  return `${atlasRoot}/${file}`
}

// the section's featured/front page (first featured, else first)
export function sectionFront(section: Section): AtlasPage {
  const list = pagesBySection(section)
  return list.find((p) => p.featured) ?? list[0]
}
