'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import BrandSeal from '@/components/brand-seal'
import { classicMapHref } from '@/lib/links'

// The global header — mockup 4a: the seal-ring "Bharat." brand (animated भ/ভ/ಭ, gold),
// the Map/3D/Study/Data/About nav with a gold active underline, a "press / to search"
// hint, and the gold "Open the map" action. Used on every page.
const NAV: { label: string; href: string; ext?: boolean; match?: string[] }[] = [
  { label: 'Map', href: classicMapHref(), ext: true },
  { label: '3D', href: '/3d' },
  { label: 'Study', href: '/study/ashoka', match: ['/study', '/heritage'] },
  { label: 'Data', href: '/data', match: ['/data', '/register', '/design', '/engines', '/explore'] },
  { label: 'About', href: '/about' },
]

export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname() || '/'
  const isActive = (n: (typeof NAV)[number]) =>
    !n.ext && (n.match ? n.match.some((m) => pathname.startsWith(m)) : pathname === n.href)

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--stone)', borderBottom: '2px solid var(--line-strong)',
      }}
    >
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 18,
          maxWidth: 'var(--wrap)', margin: '0 auto',
          padding: '13px var(--edge)',
        }}
      >
        {/* brand — seal-ring Bharat. */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9 }} aria-label="Bharat — home">
          <BrandSeal size={28} color="var(--gold)" ink="var(--ink)" />
          <span style={{ font: '600 17px var(--font-serif)' }}>Bharat<span style={{ color: 'var(--gold)' }}>.</span></span>
        </Link>

        {/* nav */}
        <nav className="nav-desktop" style={{ display: 'flex', gap: 20, font: '600 12.5px var(--font-ui)' }}>
          {NAV.map((n) => {
            const on = isActive(n)
            const style: React.CSSProperties = {
              color: on ? 'var(--ink)' : 'var(--muted)',
              borderBottom: on ? '2px solid var(--gold)' : '2px solid transparent',
              paddingBottom: 2,
            }
            return n.ext
              ? <a key={n.label} href={n.href} style={style}>{n.label}</a>
              : <Link key={n.label} href={n.href} style={style}>{n.label}</Link>
          })}
        </nav>

        {/* actions */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="hdr-search"
            onClick={() => window.dispatchEvent(new Event('atlas:open-search'))}
            aria-label="Search the atlas"
          >
            <span aria-hidden>⌕</span><span className="hdr-search-label"> press <span className="mono">/</span> to search</span>
          </button>
          <a href={classicMapHref()} className="btn btn-primary btn-wide open-map">Open the map</a>
          <button
            className="nav-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu" aria-expanded={open}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* mobile drawer */}
      {open && (
        <nav className="nav-mobile" style={{ borderTop: '2px solid var(--line-strong)', background: 'var(--stone-2)' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: '8px var(--edge) 16px' }}>
            {NAV.map((n) => {
              const style: React.CSSProperties = { display: 'block', padding: '12px 0', font: '600 15px var(--font-ui)', borderBottom: '1px solid var(--line)' }
              return (
                <li key={n.label}>
                  {n.ext
                    ? <a href={n.href} style={style}>{n.label}</a>
                    : <Link href={n.href} onClick={() => setOpen(false)} style={style}>{n.label}</Link>}
                </li>
              )
            })}
          </ul>
        </nav>
      )}

      <style>{`
        .hdr-search { display: inline-flex; align-items: center; gap: 4px; border: 0; background: transparent; color: var(--muted); cursor: pointer; font: 400 12px var(--font-ui); padding: 6px 4px; }
        .hdr-search:hover { color: var(--ink); }
        .hdr-search .mono { border: 1px solid var(--line); padding: 0 5px; font-size: 11px; }
        .nav-toggle { display: none; width: 40px; height: 40px; border: 1.5px solid var(--line-strong); background: transparent; cursor: pointer; color: var(--ink); align-items: center; justify-content: center; }
        @media (max-width: 860px) {
          .nav-desktop, .open-map, .hdr-search-label { display: none !important; }
          .nav-toggle { display: inline-flex !important; }
        }
      `}</style>
    </header>
  )
}
