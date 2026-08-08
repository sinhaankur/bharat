// Bharat — the content model for the magazine home.
// Every "article" is a real tool or story on the atlas. `href` points to it.
// The atlas itself is the static site; from the app we link out to those pages
// (…or migrate them into /app routes over time).

const ATLAS = '' // same-origin; set to the atlas base URL if hosted separately

export type Article = {
  id: string
  title: string
  dek: string
  category: string
  author: string
  timeAgo: string
  image?: string
  readTime: string
  href?: string
}

export const featured: Article = {
  id: 'lead',
  title: 'Ancient India, on one spine — five thousand years, read five ways',
  dek: 'For each era — Indus, Vedic, Mauryan, Gupta — see the language, the script, the people (from ancient DNA), the rulers and the heritage, with the evidence behind every fact open to interrogation.',
  category: 'History',
  author: 'The Bharat desk',
  timeAgo: 'updated today',
  readTime: 'interactive',
  href: `${ATLAS}/ancient-india.html`,
}

export const topStories: Article[] = [
  {
    id: 's1',
    title: "Ashoka's rule of the land — an empire read from its own edicts",
    dek: 'Because Brahmi was deciphered, we can map how far Mauryan power reached and read what a ruler actually proclaimed — including his remorse after Kalinga.',
    category: 'History',
    author: 'The Bharat desk',
    timeAgo: 'updated today',
    readTime: 'interactive map',
    href: `${ATLAS}/ashoka.html`,
  },
  {
    id: 's2',
    title: 'Every language & script of Bharat, in one place',
    dek: 'Two family trees kept apart — Indo-Aryan vs Dravidian languages, and the Brahmi-descended scripts — with self-hosted fonts so every script renders.',
    category: 'Languages',
    author: 'The Bharat desk',
    timeAgo: 'updated today',
    readTime: 'hub',
    href: `${ATLAS}/languages.html`,
  },
  {
    id: 's3',
    title: 'Built where water returns — habitation on land the water reclaims',
    dek: 'Illegal habitation on flood-prone and reclaimed land, case by case, over real terrain.',
    category: 'Land',
    author: 'The Bharat desk',
    timeAgo: 'updated today',
    readTime: 'atlas',
    href: `${ATLAS}/encroachment-atlas.html`,
  },
]

export const latest: Article[] = [
  {
    id: 'l1',
    title: 'Where India’s public money goes — every one of 594 districts',
    dek: 'The 2D fiscal atlas: colour every district by what you choose, and read the chain of command behind the money.',
    category: 'Money',
    author: 'The Bharat desk',
    timeAgo: 'live',
    readTime: 'the map',
    href: `${ATLAS}/index.html`,
  },
  {
    id: 'l2',
    title: 'The News Engine — headlines read by bias & sentiment',
    dek: 'Live India headlines scored for media-lean (Bias Engine) and tone (Sentiment Engine), Ground-News style, and framed as moves in a long-haul game.',
    category: 'News',
    author: 'The Bharat desk',
    timeAgo: 'live',
    readTime: 'the engine',
    href: '/news',
  },
  {
    id: 'l3',
    title: 'Deep history in DNA — who migrated, mixed and was replaced',
    dek: 'Held strictly to the peer-reviewed science; the ‘Aryan migration’ debate is shown where it belongs — as a contested interpretation of undisputed data.',
    category: 'History',
    author: 'The Bharat desk',
    timeAgo: 'updated',
    readTime: 'explainer',
    href: `${ATLAS}/deep-history.html`,
  },
  {
    id: 'l4',
    title: 'The journey of a word — one idea across 4,000 years',
    dek: 'Scroll from unwritten proto-languages, through Brahmi, to the living languages of today.',
    category: 'Languages',
    author: 'The Bharat desk',
    timeAgo: 'updated',
    readTime: 'scrollytelling',
    href: `${ATLAS}/journey.html`,
  },
]

export type VideoItem = {
  id: string
  title: string
  duration: string
  series: string
  image?: string
  views: string
  href?: string
}

export const featuredVideo: VideoItem = {
  id: 'v0',
  title: 'Walk inside a reconstructed temple — Ajanta, as it once was',
  duration: 'first-person',
  series: 'Bharat in 3D',
  views: 'Three.js walkthrough',
  href: `${ATLAS}/cave-walk.html`,
}

export const videos: VideoItem[] = [
  {
    id: 'v1',
    title: 'The globe → map — watch a projection unroll',
    duration: 'live',
    series: '3D',
    views: 'interactive',
    href: `${ATLAS}/globe-map.html`,
  },
  {
    id: 'v2',
    title: 'India in 3D — a real globe, 594 districts, real terrain',
    duration: 'live',
    series: '3D',
    views: 'interactive',
    href: `${ATLAS}/india-3d.html`,
  },
  {
    id: 'v3',
    title: 'History’s deadliest events, mapped — India highlighted',
    duration: 'interactive',
    series: 'News',
    views: 'timeline + map',
    href: `${ATLAS}/atrocities.html`,
  },
]

export const trending: string[] = [
  'Ancient India timeline',
  'Ashoka’s edicts',
  'Languages of Bharat',
  'The fiscal map',
  'Deep history in DNA',
  'Built where water returns',
  'Sacred ground',
]

// Editorial transparency & documentation — OUR credo, honestly stated.
export type BiasPosition = 'Left' | 'Center-Left' | 'Center' | 'Center-Right' | 'Right'

export const biasScale: BiasPosition[] = [
  'Left',
  'Center-Left',
  'Center',
  'Center-Right',
  'Right',
]

export const outletBias = {
  position: 50,
  label: 'Center' as BiasPosition,
  factual: 'Sourced-or-gap',
  summary:
    'Bharat is a data project, not an opinion outlet. We present the record and label framing as framing — multi-actor, not one-sided. Where a figure has no government/court/peer-reviewed source, we mark it a gap rather than fill it.',
}

export type StandardItem = {
  id: string
  title: string
  body: string
}

export const standards: StandardItem[] = [
  {
    id: 'sourcing',
    title: 'Sourced, or it’s a gap',
    body: 'Every figure links to a government, court, or peer-reviewed source — or is explicitly marked a gap. We never fabricate a number to fill a cell. A provenance ledger audits the whole atlas for unattributed figures.',
  },
  {
    id: 'framing',
    title: 'Fact vs framing',
    body: 'We keep an established finding separate from a contested interpretation. The clearest case: Steppe ancestry arriving ~2000–1500 BCE is peer-reviewed; the ‘Aryan migration’ narrative around it is flagged as debated. History written by the winner is shown as such.',
  },
  {
    id: 'attribution',
    title: 'Attribution over assertion',
    body: '“The NCRB reports X” beats “X is true.” Translations are credited to their translator; a ruler’s own edicts are read as self-portrait and propaganda, kept apart from later legend.',
  },
  {
    id: 'method',
    title: 'Method in the open',
    body: 'Data stories ship their datasets and generators. Each page carries an editorial brief — what it is, how it was made, its references, and a link to the method — so you can judge the conclusions yourself.',
  },
]

export const ownership = [
  { label: 'Project', value: 'Bharat — an independent, open, non-commercial data atlas' },
  { label: 'Editorial', value: 'Anonymous by design — the record speaks, not a byline' },
  { label: 'Coverage', value: '594 districts · 36 states & UTs · language, land, money, history' },
  { label: 'Data', value: 'Open datasets, downloadable; sourced or marked a gap' },
]

export const trustStats = [
  { value: '594', label: 'Districts covered' },
  { value: '100%', label: 'Figures sourced or marked a gap' },
  { value: '0', label: 'Fabricated numbers' },
  { value: '29+', label: 'Pages with a public editorial brief' },
]

export const categories = [
  'News',
  'Money',
  'Land',
  'History',
  'Languages',
  '3D',
  'Data',
]
