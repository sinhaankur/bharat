// The command-palette search index. Every entry is a real destination on the atlas:
// an app route, a classic atlas page, or a saved query. Scopes match the mockup 7c
// tabs (districts · pages · queries). Keep this the single source the palette reads.
import { classicMapHref, classicHref } from '@/lib/links'

export type Scope = 'districts' | 'pages' | 'queries'
export type Hit = {
  scope: Scope
  title: string
  sub: string
  href: string
  icon: 'coin' | 'sun' | 'edict' | 'pillar' | 'jali' | 'stupa' | 'lotus'
  external?: boolean
  keywords?: string
}

export const INDEX: Hit[] = [
  // — districts (deep) —
  { scope: 'districts', title: 'Kolkata — deep district ledger', sub: 'KMC ₹5,525 cr · 52% grant-in-aid · split-admin, no DM', href: '/d/kolkata', icon: 'coin', keywords: 'west bengal kmc civic budget municipal police commissioner' },
  { scope: 'districts', title: 'Birbhum — district ledger', sub: '₹0 MGNREGS · 4-yr fund freeze · ₹3,038 cr+ dues', href: '/d/birbhum', icon: 'coin', keywords: 'west bengal freeze mgnrega' },
  { scope: 'districts', title: 'Greater Bombay — deep district', sub: 'BMC ₹74,427 cr · 92% coverage · 1 audit flag', href: '/d/greater-bombay', icon: 'coin', keywords: 'mumbai maharashtra bmc' },
  { scope: 'districts', title: 'Munger — industrial heritage', sub: 'gun trade · Jamalpur railway · ITC · three regimes', href: '/d/munger', icon: 'pillar', keywords: 'bihar industrialised timeline' },
  { scope: 'districts', title: 'Ernakulam — Kochi ledger', sub: '₹225 cr civic budget · 84% coverage', href: '/d/ernakulam', icon: 'coin', keywords: 'kerala kochi' },

  // — pages / fronts —
  { scope: 'pages', title: 'The map — 594 districts', sub: 'the classic interactive fiscal map', href: classicMapHref(), icon: 'jali', external: true, keywords: 'choropleth leaflet money crz flood' },
  { scope: 'pages', title: 'Engines — seven lenses', sub: 'survey · country · development · climate · zoning · corruption · news', href: '/engines', icon: 'stupa', keywords: 'hub' },
  { scope: 'pages', title: 'The state ledger — revenue dashboard', sub: 'FY15→24 · 9 views · governance footprint', href: '/engines/revenue', icon: 'coin', keywords: 'revenue gsdp corruption finance commission dashboard' },
  { scope: 'pages', title: 'Explore — query 594 districts', sub: 'AND facets · shareable via URL', href: '/explore', icon: 'sun', keywords: 'query filter facets' },
  { scope: 'pages', title: 'Data & provenance', sub: 'every figure, its citation, or a declared gap', href: '/data', icon: 'edict', keywords: 'references sources audit' },
  { scope: 'pages', title: 'West Bengal — every source', sub: 'references · 14 T1 citations', href: classicHref('references'), icon: 'edict', external: true, keywords: 'sources provenance' },
  { scope: 'pages', title: 'About the atlas', sub: 'what it is, how it is built', href: '/about', icon: 'lotus', keywords: 'how it works' },
  { scope: 'pages', title: 'The register — every page, one list', sub: 'districts, heritage, studies, tools', href: '/register', icon: 'edict', keywords: 'index sitemap all pages catalog' },
  { scope: 'pages', title: 'Martand Sun Temple', sub: 'Kashmir · 8th c. · ruin — the record of destruction', href: '/heritage/martand-sun-temple', icon: 'stupa', keywords: 'heritage temple sanatan surya kashmir' },
  { scope: 'pages', title: 'Somnath Temple', sub: 'Gujarat · Jyotirlinga · rebuilt 1951', href: '/heritage/somnath-temple', icon: 'stupa', keywords: 'heritage temple shiva gujarat' },
  { scope: 'pages', title: 'Nalanda Mahavihara', sub: 'Bihar · Buddhist university · sacked 1193', href: '/heritage/nalanda-mahavihara', icon: 'stupa', keywords: 'heritage buddhist university bihar' },
  { scope: 'pages', title: 'Vitthala Temple, Hampi', sub: 'Karnataka · Vijayanagara · sacked 1565', href: '/heritage/vitthala-temple-hampi', icon: 'stupa', keywords: 'heritage temple hampi vijayanagara' },
  { scope: 'pages', title: 'Ranakpur Jain Temple', sub: 'Rajasthan · 1,444 carved pillars, no two alike', href: '/heritage/ranakpur-jain-temple', icon: 'jali', keywords: 'heritage jain marble ranakpur pillars' },
  { scope: 'pages', title: 'Kailasa Temple, Ellora', sub: 'Maharashtra · largest rock-cut monolith, ~200k tonnes removed', href: '/heritage/kailasa-ellora', icon: 'stupa', keywords: 'heritage rock cut ellora rashtrakuta shiva' },
  { scope: 'pages', title: 'Brihadishvara Temple, Thanjavur', sub: 'Tamil Nadu · ~216 ft vimana, 80-tonne capstone', href: '/heritage/brihadishvara-thanjavur', icon: 'pillar', keywords: 'heritage chola granite thanjavur vimana' },

  // — saved queries —
  { scope: 'queries', title: 'fund-freeze AND flood-chronic', sub: 'explore — 7 districts match', href: '/explore?q=fund-freeze+flood-chronic', icon: 'sun', keywords: 'risk stack' },
  { scope: 'queries', title: 'CRZ coastal AND fund-freeze', sub: 'explore — legal + money risk overlap', href: '/explore?q=crz+fund-freeze', icon: 'sun', keywords: 'coastal zoning' },
  { scope: 'queries', title: 'Risk stack (3+ signals)', sub: 'explore — physical + legal + money', href: '/explore?q=risk-stack', icon: 'sun', keywords: 'multi signal' },
]

// simple ranked substring match over title + sub + keywords
export function searchIndex(q: string, scope?: Scope): Hit[] {
  const pool = scope ? INDEX.filter((h) => h.scope === scope) : INDEX
  const needle = q.trim().toLowerCase()
  if (!needle) return pool
  const terms = needle.split(/\s+/)
  return pool
    .map((h) => {
      const hay = `${h.title} ${h.sub} ${h.keywords ?? ''}`.toLowerCase()
      const score = terms.reduce((s, t) => (hay.includes(t) ? s + (h.title.toLowerCase().includes(t) ? 2 : 1) : s), 0)
      return { h, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.h)
}
