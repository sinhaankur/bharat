import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import { classicMapHref, classicHref } from '@/lib/links'
import { DISTRICT_SLUGS } from '@/lib/districts'
import { STUDY_SLUGS } from '@/lib/study'

// The IA / sitemap (mockup 5a): home fans into the fronts, then every page. Grouped
// by the five fronts, each entry a real link (app route or classic atlas page).
export const metadata: Metadata = {
  title: 'Sitemap — every page · Bharat',
  description: 'The whole atlas, grouped by its five fronts. Every page, one click away.',
}

type Entry = { t: string; href: string; ext?: boolean }
const GROUPS: { front: string; items: Entry[] }[] = [
  {
    front: 'Map & money',
    items: [
      { t: 'The interactive map (594 districts)', href: classicMapHref(), ext: true },
      { t: 'Explore — query the districts', href: '/explore' },
      { t: 'Engines — seven lenses', href: '/engines' },
      ...DISTRICT_SLUGS.map((s) => ({ t: `District — ${s.replace(/-/g, ' ')}`, href: `/d/${s}` })),
    ],
  },
  {
    front: 'Study & history',
    items: STUDY_SLUGS.map((s) => ({ t: `Study — ${s}`, href: `/study/${s}` })),
  },
  {
    front: '3D',
    items: [
      { t: 'India in 3D', href: '/3d' },
      { t: 'Terrain · flood · cave-walk (classic)', href: classicHref('india-3d'), ext: true },
    ],
  },
  {
    front: 'Feed & news',
    items: [
      { t: 'The feed', href: '/feed' },
      { t: 'Timeline · atrocities (classic)', href: classicHref('timeline'), ext: true },
    ],
  },
  {
    front: 'Data & about',
    items: [
      { t: 'Data & provenance', href: '/data' },
      { t: 'Design system', href: '/design' },
      { t: 'About the atlas', href: '/about' },
      { t: 'References (classic)', href: classicHref('references'), ext: true },
      { t: 'How it works (classic)', href: classicHref('how-it-works'), ext: true },
    ],
  },
]

export default function SitemapPage() {
  return (
    <>
      <SiteHeader />
      <main className="sm" style={{ maxWidth: 'var(--wrap)', margin: '0 auto', padding: '40px var(--edge) 60px' }}>
        <div className="kicker" style={{ marginBottom: 10 }}>The whole atlas</div>
        <h1 style={{ font: '800 clamp(28px,4vw,40px) var(--font-ui)', margin: '0 0 28px' }}>Every page, mapped</h1>

        <div className="sm-grid">
          {GROUPS.map((g) => (
            <section key={g.front} className="sm-col">
              <div className="sm-front">{g.front}</div>
              <ul className="sm-list">
                {g.items.map((it) => (
                  <li key={it.t}>
                    {it.ext ? (
                      <a href={it.href}>{it.t} <span className="sm-ext">↗</span></a>
                    ) : (
                      <Link href={it.href}>{it.t}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />

      <style>{`
        .sm-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 2px; background: var(--line); border: 2px solid var(--line-strong); }
        .sm-col { background: var(--stone); padding: 22px 24px; }
        .sm-front { font: 600 11px var(--font-ui); letter-spacing: .14em; text-transform: uppercase; color: var(--gold-700); margin-bottom: 14px; }
        .sm-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
        .sm-list a { font: 500 14px var(--font-ui); color: var(--ink); text-transform: capitalize; }
        .sm-list a:hover { color: var(--gold-700); }
        .sm-ext { color: var(--muted); }
      `}</style>
    </>
  )
}
