import Link from 'next/link'
import { classicMapHref, classicHref } from '@/lib/links'

// The global footer — faithful to the handoff's Atlas Footer.dc.html: a 2px top
// rule, the red square brand mark + "District Atlas", a blurb, and link columns,
// then a baseline row. Modernist, flush-left, accent uppercase column heads.
const COLS: { label: string; links: { t: string; href: string; ext?: boolean }[] }[] = [
  {
    label: 'Atlas',
    links: [
      { t: 'Explore', href: '/explore' },
      { t: 'Districts', href: '/register' },
      { t: 'The engines', href: '/engines' },
      { t: 'Survey plates', href: '/heritage/ranakpur-jain-temple' },
    ],
  },
  {
    label: 'Data',
    links: [
      { t: 'Provenance', href: '/data' },
      { t: 'The register', href: '/register' },
      { t: 'References', href: classicHref('references'), ext: true },
      { t: 'Downloads', href: classicHref('data'), ext: true },
    ],
  },
  {
    label: 'Project',
    links: [
      { t: 'About', href: '/about' },
      { t: 'How it works', href: classicHref('how-it-works'), ext: true },
      { t: 'Design system', href: '/design' },
      { t: 'The map', href: classicMapHref(), ext: true },
    ],
  },
]

export default function SiteFooter() {
  return (
    <footer style={{ borderTop: '2px solid var(--line)', background: 'var(--bg)' }}>
      <div
        style={{
          maxWidth: 'var(--wrap)', margin: '0 auto',
          padding: '56px var(--edge) 42px',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '42px 28px',
        }}
      >
        <div>
          <p style={{ display: 'flex', alignItems: 'center', gap: 12, font: '800 20px/28px var(--font-display)', margin: 0 }}>
            <span style={{ width: 10, height: 10, background: 'var(--accent)', flex: 'none' }} aria-hidden="true" />
            District Atlas
          </p>
          <p style={{ fontSize: 13, lineHeight: '22px', color: 'var(--muted)', margin: '14px 0 0', maxWidth: '26ch' }}>
            Boundary files, census layers, and measured survey plates for every district. Sourced, or marked a gap.
          </p>
        </div>

        {COLS.map((col) => (
          <nav key={col.label} aria-label={col.label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 13, lineHeight: '14px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--accent-700)', marginBottom: 8 }}>
              {col.label}
            </span>
            {col.links.map((l) =>
              l.ext ? (
                <a key={l.t} href={l.href} style={{ fontSize: 15, lineHeight: '24px', color: 'var(--ink)' }}>{l.t}</a>
              ) : (
                <Link key={l.t} href={l.href} style={{ fontSize: 15, lineHeight: '24px', color: 'var(--ink)' }}>{l.t}</Link>
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
          fontSize: 13, lineHeight: '22px', color: 'var(--muted)',
        }}
      >
        <span>© 2026 India District Atlas</span>
        <span>Sourced — or it&apos;s an explicit gap</span>
      </div>
    </footer>
  )
}
