'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { classicMapHref } from '@/lib/links'

// The global header — faithful to the handoff's Atlas Header.dc.html: the Modernist
// nav bar with the red square brand mark + "District Atlas", flush links, and the
// red primary button. Sticky, 2px bottom rule. (nav .nav / .nav-brand / .btn come
// straight from the _ds system.)
const NAV: { label: string; href: string; ext?: boolean; match?: string[] }[] = [
  { label: 'Atlas', href: '/', match: ['/d', '/explore', '/engines', '/heritage'] },
  { label: '3D', href: '/3d' },
  { label: 'Study', href: '/study/ashoka', match: ['/study', '/heritage'] },
  { label: 'Data', href: '/data', match: ['/data', '/register', '/design'] },
  { label: 'About', href: '/about' },
]

export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname() || '/'
  const isActive = (n: (typeof NAV)[number]) =>
    !n.ext && (n.href === '/' ? pathname === '/' || (n.match?.some((m) => pathname.startsWith(m)) ?? false)
      : n.match ? n.match.some((m) => pathname.startsWith(m)) : pathname.startsWith(n.href))

  return (
    <header className="nav" style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--bg)', paddingInline: 'var(--edge)' }}>
      {/* brand */}
      <Link href="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: 12 }} aria-label="District Atlas — home">
        <span style={{ width: 10, height: 10, background: 'var(--accent)', flex: 'none' }} aria-hidden="true" />
        District Atlas
      </Link>

      {/* desktop nav */}
      <nav className="nav-links" aria-label="Primary">
        {NAV.map((n) => {
          const props = { 'aria-current': isActive(n) ? ('page' as const) : undefined }
          return n.ext
            ? <a key={n.label} href={n.href} {...props}>{n.label}</a>
            : <Link key={n.label} href={n.href} {...props}>{n.label}</Link>
        })}
      </nav>

      {/* search + primary */}
      <button
        className="nav-search"
        onClick={() => window.dispatchEvent(new Event('atlas:open-search'))}
        aria-label="Search the atlas"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        <span className="nav-search-key">/</span>
      </button>
      <a className="btn btn-primary open-map" href={classicMapHref()}>Open the map</a>

      <button className="nav-toggle" onClick={() => setOpen((v) => !v)} aria-label="Menu" aria-expanded={open}>
        {open ? '✕' : '☰'}
      </button>

      {/* mobile drawer */}
      {open && (
        <nav className="nav-mobile" aria-label="Primary (mobile)">
          {NAV.map((n) =>
            n.ext
              ? <a key={n.label} href={n.href}>{n.label}</a>
              : <Link key={n.label} href={n.href} onClick={() => setOpen(false)}>{n.label}</Link>
          )}
        </nav>
      )}

      <style>{`
        .nav { display: flex; align-items: center; gap: var(--space-4); padding-block: var(--space-3); border-bottom: 2px solid var(--line); }
        .nav-brand { font-family: var(--font-display); font-weight: 800; font-size: 18px; color: var(--ink); margin-right: auto; text-decoration: none; }
        .nav-links { display: flex; gap: 22px; align-items: center; }
        .nav-links a { color: var(--ink); text-decoration: none; font: 600 14px var(--font-ui); }
        .nav-links a:hover, .nav-links a[aria-current='page'] { color: var(--accent); }
        .nav-search { display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--line); background: transparent; color: var(--muted); cursor: pointer; padding: 7px 9px; }
        .nav-search:hover { color: var(--ink); border-color: var(--ink); }
        .nav-search-key { font: 600 11px var(--font-mono); }
        .open-map { white-space: nowrap; }
        .nav-toggle { display: none; width: 40px; height: 40px; border: 1px solid var(--line); background: transparent; color: var(--ink); cursor: pointer; align-items: center; justify-content: center; }
        .nav-mobile { display: none; }
        @media (max-width: 820px) {
          .nav-links, .open-map, .nav-search-key { display: none !important; }
          .nav-toggle { display: inline-flex; }
          .nav-mobile { display: flex; flex-direction: column; flex-basis: 100%; order: 10; border-top: 2px solid var(--line); margin-top: var(--space-3); }
          .nav-mobile a { padding: 12px 0; border-bottom: 1px solid var(--line); color: var(--ink); text-decoration: none; font: 600 15px var(--font-ui); }
        }
      `}</style>
    </header>
  )
}
