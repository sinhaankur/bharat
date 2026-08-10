'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import BharatLogo from '@/components/bharat-logo'
import SkinSwitcher from '@/components/skin-switcher'
import { classicMapHref } from '@/lib/links'

// The global header — faithful to the handoff's Atlas Header.dc.html (Indic skin):
// stone ground, Karla type, the Bharat Logo, the Home / Design systems / Temple 3D /
// Canvas nav (line icons), a search field, the skin switcher, and the accent CTA.
// All colours come from skin tokens so it reskins with the whole site.
const NAV: { label: string; href: string; ext?: boolean; match?: string[]; icon: React.ReactNode }[] = [
  {
    label: 'Home', href: '/',
    icon: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 10v10h14V10" /><path d="M10 20v-5h4v5" /></>,
  },
  {
    label: 'Design systems', href: '/design-systems', match: ['/design-systems', '/design'],
    icon: <><path d="M12 2 2 7l10 5 10-5-10-5z" /><path d="M2 12l10 5 10-5" /><path d="M2 17l10 5 10-5" /></>,
  },
  {
    label: 'Temple 3D', href: '/3d', match: ['/3d', '/heritage'],
    icon: <><path d="M12 3 4 9h16z" /><path d="M5 9v10M12 9v10M19 9v10" /><path d="M3 19h18" /></>,
  },
  {
    label: 'Canvas', href: '/explore', match: ['/explore', '/engines', '/d', '/data', '/register'],
    icon: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
  },
]

export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname() || '/'
  const active = (n: (typeof NAV)[number]) =>
    n.href === '/' ? pathname === '/' : (n.match ? n.match.some((m) => pathname.startsWith(m)) : pathname.startsWith(n.href))

  return (
    <nav className="ah" aria-label="Global header">
      <Link href="/" className="ah-brand" aria-label="Bharat — home"><BharatLogo size={40} /></Link>

      <div className="ah-nav">
        {NAV.map((n) => (
          <Link key={n.label} href={n.href} className={`ah-link${active(n) ? ' on' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{n.icon}</svg>
            {n.label}
          </Link>
        ))}
      </div>

      <div className="ah-actions">
        <button className="ah-search" onClick={() => window.dispatchEvent(new Event('atlas:open-search'))} aria-label="Search the atlas">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16.5 16.5 4.5 4.5" /></svg>
          <span className="ah-search-label">Search the atlas</span>
          <span className="ah-search-key">/</span>
        </button>
        <SkinSwitcher />
        <a className="ah-cta" href={classicMapHref()}>Open the atlas</a>
        <button className="ah-toggle" onClick={() => setOpen((v) => !v)} aria-label="Menu" aria-expanded={open}>{open ? '✕' : '☰'}</button>
      </div>

      {open && (
        <div className="ah-mobile">
          {NAV.map((n) => (
            <Link key={n.label} href={n.href} onClick={() => setOpen(false)} className="ah-mlink">{n.label}</Link>
          ))}
          <a className="ah-cta" href={classicMapHref()} style={{ marginTop: 8 }}>Open the atlas</a>
        </div>
      )}

      <style>{`
        .ah { position: sticky; top: 0; z-index: 50; display: flex; align-items: center; gap: 26px; flex-wrap: wrap;
              padding: 9px var(--edge); background: var(--surface); border-bottom: 2px solid var(--ink);
              color: var(--ink); font-family: var(--font-ui); }
        .ah-brand { display: flex; text-decoration: none; color: var(--ink); }
        .ah-nav { display: flex; align-items: center; gap: 20px; font-size: 14.5px; font-weight: 600; }
        .ah-link { display: inline-flex; align-items: center; gap: 7px; color: var(--ink); text-decoration: none;
                   padding: 6px 0; border-bottom: 3px solid transparent; }
        .ah-link:hover { color: var(--accent); }
        .ah-link.on { color: var(--accent); border-bottom-color: var(--band); }
        .ah-actions { display: flex; align-items: center; gap: 14px; margin-left: auto; }
        .ah-search { display: flex; align-items: center; gap: 10px; border: 1.5px solid var(--line); background: transparent;
                     color: var(--muted); padding: 8px 12px; font-size: 12.5px; cursor: pointer; min-width: 170px; }
        .ah-search:hover { border-color: var(--ink); color: var(--ink); }
        .ah-search-label { white-space: nowrap; }
        .ah-search-key { margin-left: auto; border: 1px solid var(--line); padding: 0 5px; font-size: 10.5px; font-family: var(--font-mono); }
        .ah-cta { display: inline-block; background: var(--accent); color: var(--surface); padding: 10px 18px;
                  font: 600 14px var(--font-ui); text-decoration: none; }
        .ah-cta:hover { background: var(--accent-600); color: var(--surface); }
        .ah-toggle { display: none; width: 40px; height: 40px; border: 1.5px solid var(--ink); background: transparent; color: var(--ink); cursor: pointer; }
        .ah-mobile { display: none; }
        @media (max-width: 900px) {
          .ah-nav, .ah-search-label, .ah-search-key, .ah-cta { display: none !important; }
          .ah-toggle { display: inline-flex; align-items: center; justify-content: center; }
          .ah-mobile { display: flex; flex-direction: column; flex-basis: 100%; order: 10; border-top: 2px solid var(--line); margin-top: 9px; padding-top: 8px; }
          .ah-mobile .ah-mlink { padding: 12px 0; border-bottom: 1px solid var(--line); color: var(--ink); text-decoration: none; font: 600 15px var(--font-ui); }
          .ah-mobile .ah-cta { display: inline-block !important; width: fit-content; }
        }
      `}</style>
    </nav>
  )
}
