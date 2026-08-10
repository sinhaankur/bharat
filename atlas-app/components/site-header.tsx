'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Chakra } from '@/components/icon'
import { classicMapHref } from '@/lib/links'

// The five fronts, per mockup 1a's nav. hrefs are app-internal routes (next/link
// prepends the basePath); "Open the map" opens the classic 594-district fiscal map.
const NAV: { label: string; href: string }[] = [
  { label: 'Engines', href: '/engines' },
  { label: 'Explore', href: '/explore' },
  { label: '3D', href: '/3d' },
  { label: 'Data', href: '/data' },
  { label: 'About', href: '/about' },
]

export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname() || '/'
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--stone)', borderBottom: '2px solid var(--line-strong)',
      }}
    >
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 20,
          maxWidth: 'var(--wrap)', margin: '0 auto',
          padding: '14px var(--edge)',
        }}
      >
        {/* brand */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }} aria-label="Bharat — home">
          <Chakra size={26} className="brand-chakra" />
          <span style={{ font: '800 17px var(--font-ui)', letterSpacing: '.02em' }}>BHARAT</span>
          <span
            className="tagline"
            style={{ font: '500 11px var(--font-ui)', color: 'var(--muted)', letterSpacing: '.14em', textTransform: 'uppercase' }}
          >
            India District Atlas
          </span>
        </Link>

        {/* desktop nav */}
        <nav className="nav-desktop" style={{ display: 'flex', gap: 22, marginLeft: 'auto', font: '600 13px var(--font-ui)' }}>
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              style={{
                color: isActive(n.href) ? 'var(--ink)' : 'var(--muted)',
                borderBottom: isActive(n.href) ? '2px solid var(--sky)' : '2px solid transparent',
                paddingBottom: 2,
              }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* search — opens the command palette (also on "/" or ⌘K) */}
        <button
          className="hdr-search"
          onClick={() => window.dispatchEvent(new Event('atlas:open-search'))}
          aria-label="Search the atlas"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
          </svg>
          <span className="hdr-search-label">Search</span>
          <span className="hdr-search-key mono">/</span>
        </button>

        {/* the gold action — opens the real fiscal map */}
        <a
          href={classicMapHref()}
          className="btn btn-primary btn-wide open-map"
        >
          Open the map
        </a>

        {/* mobile toggle */}
        <button
          className="nav-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={open}
          style={{
            display: 'none', width: 40, height: 40, border: '1.5px solid var(--line-strong)',
            background: 'transparent', cursor: 'pointer', color: 'var(--ink)',
          }}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* mobile drawer */}
      {open && (
        <nav className="nav-mobile" style={{ borderTop: '2px solid var(--line-strong)', background: 'var(--stone-2)' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: '8px var(--edge) 16px' }}>
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  style={{ display: 'block', padding: '12px 0', font: '600 15px var(--font-ui)', borderBottom: '1px solid var(--line)' }}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <style>{`
        .brand-chakra { color: var(--sky); }
        .hdr-search { display: inline-flex; align-items: center; gap: 8px; border: 1.5px solid var(--line-strong); background: transparent; color: var(--muted); cursor: pointer; font: 500 12px var(--font-ui); padding: 8px 10px; }
        .hdr-search:hover { color: var(--ink); background: rgba(42,32,24,.05); }
        .hdr-search-key { font-size: 11px; border: 1px solid var(--line); padding: 0 5px; }
        @media (max-width: 860px) {
          .nav-desktop, .open-map, .tagline, .hdr-search-label, .hdr-search-key { display: none !important; }
          .hdr-search { margin-left: auto; }
          .nav-toggle { display: inline-flex !important; align-items: center; justify-content: center; }
        }
      `}</style>
    </header>
  )
}
