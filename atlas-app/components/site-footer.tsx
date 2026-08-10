import Link from 'next/link'
import BrandSeal from '@/components/brand-seal'
import { classicMapHref, classicHref } from '@/lib/links'

// The global footer — the 4a register: the seal-ring "Bharat." brand + the five
// fronts (Map/3D/Study/Data/About) matching the header, a floral rule, and the
// sourced-or-gap baseline. Used on every page.
const COLS: { label: string; links: { t: string; href: string; ext?: boolean }[] }[] = [
  {
    label: 'Map',
    links: [
      { t: 'The interactive map', href: classicMapHref(), ext: true },
      { t: 'Explore districts', href: '/explore' },
      { t: 'The engines', href: '/engines' },
      { t: 'State ledger', href: '/engines/revenue' },
    ],
  },
  {
    label: 'Study',
    links: [
      { t: "Ashoka's edicts", href: '/study/ashoka' },
      { t: 'Languages & scripts', href: '/study/languages' },
      { t: 'Heritage sites', href: '/heritage/ranakpur-jain-temple' },
    ],
  },
  {
    label: 'Data',
    links: [
      { t: 'Provenance', href: '/data' },
      { t: 'The register', href: '/register' },
      { t: 'References', href: classicHref('references'), ext: true },
      { t: 'Design system', href: '/design' },
    ],
  },
  {
    label: 'About',
    links: [
      { t: 'About the atlas', href: '/about' },
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
          <p style={{ display: 'flex', alignItems: 'center', gap: 10, font: '600 20px var(--font-serif)', margin: 0 }}>
            <BrandSeal size={26} color="var(--gold)" ink="var(--ink)" />
            <span>Bharat<span style={{ color: 'var(--gold)' }}>.</span></span>
          </p>
          <p style={{ fontSize: 13, lineHeight: '22px', color: 'var(--muted)', margin: '14px 0 0', maxWidth: '28ch' }}>
            Understand India by the evidence — money, land and law traced to every one of 594 districts. Sourced, or we mark it a gap.
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

      {/* floral rule */}
      <svg width="100%" height="16" aria-hidden="true" style={{ display: 'block', color: '#a8794a', opacity: 0.5 }}>
        <rect width="100%" height="16" fill="url(#floral)" />
      </svg>

      <div
        style={{
          maxWidth: 'var(--wrap)', margin: '0 auto',
          padding: '14px var(--edge) 42px',
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14,
          fontSize: 13, color: 'var(--muted)',
        }}
      >
        <span>© 2026 Bharat · the India District Atlas</span>
        <span className="mono" style={{ fontSize: 11, letterSpacing: '.14em', color: 'var(--gold-700)' }}>SOURCED — OR IT&apos;S A GAP</span>
      </div>
    </footer>
  )
}
