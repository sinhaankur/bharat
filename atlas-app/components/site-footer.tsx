import Link from 'next/link'
import { Chakra } from '@/components/icon'
import { classicMapHref, classicHref } from '@/lib/links'

// Footer — ported from Atlas Footer.dc.html: a 4-column grid under a 2px top rule,
// brand blurb, and three link columns, then a baseline row.
const COLS: { label: string; links: { t: string; href: string; ext?: boolean }[] }[] = [
  {
    label: 'Atlas',
    links: [
      { t: 'The map', href: classicMapHref(), ext: true },
      { t: 'Explore districts', href: '/explore' },
      { t: 'Engines', href: '/engines' },
    ],
  },
  {
    label: 'Data',
    links: [
      { t: 'Provenance', href: '/data' },
      { t: 'References', href: classicHref('references'), ext: true },
      { t: 'Downloads', href: classicHref('data'), ext: true },
    ],
  },
  {
    label: 'Project',
    links: [
      { t: 'About', href: '/about' },
      { t: 'How it works', href: classicHref('how-it-works'), ext: true },
      { t: 'Sitemap', href: '/sitemap' },
    ],
  },
]

export default function SiteFooter() {
  return (
    <footer style={{ borderTop: '2px solid var(--line-strong)', background: 'var(--stone)' }}>
      <div
        style={{
          maxWidth: 'var(--wrap)', margin: '0 auto',
          padding: '56px var(--edge) 42px',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '42px 28px',
        }}
      >
        <div>
          <p style={{ display: 'flex', alignItems: 'center', gap: 10, font: '800 20px var(--font-ui)', margin: 0 }}>
            <Chakra size={22} className="foot-chakra" /> BHARAT
          </p>
          <p style={{ fontSize: 13, lineHeight: '22px', color: 'var(--muted)', margin: '14px 0 0', maxWidth: '28ch' }}>
            Money, land and law — side by side for 594 districts. Sourced to the figure, or shown as an explicit gap.
          </p>
        </div>

        {COLS.map((col) => (
          <nav key={col.label} aria-label={col.label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--gold-700)', marginBottom: 8 }}>
              {col.label}
            </span>
            {col.links.map((l) =>
              l.ext ? (
                <a key={l.t} href={l.href} style={{ fontSize: 15, lineHeight: '24px', color: 'var(--muted)' }}>{l.t}</a>
              ) : (
                <Link key={l.t} href={l.href} style={{ fontSize: 15, lineHeight: '24px', color: 'var(--muted)' }}>{l.t}</Link>
              )
            )}
          </nav>
        ))}
      </div>

      <div
        style={{
          maxWidth: 'var(--wrap)', margin: '0 auto',
          padding: '0 var(--edge) 42px',
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14,
          fontSize: 13, color: 'var(--muted)',
        }}
      >
        <span>© 2026 India District Atlas</span>
        <span className="mono" style={{ fontSize: 11 }}>Sourced — or it&apos;s an explicit gap.</span>
      </div>

      <style>{`.foot-chakra { color: var(--sky); }`}</style>
    </footer>
  )
}
