'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import BharatLogo from '@/components/bharat-logo'
import SkinSwitcher from '@/components/skin-switcher'
import { classicMapHref, classicHref } from '@/lib/links'

// The global header — the SAME 8-section magazine nav the classic pages use
// (News · Money · Land · History · Languages · 3D · Design · Data), so a visitor sees
// one consistent header across the classic atlas and this app. Most section items are
// classic .html pages (one level up at /bharat); a few are app routes (Design, some 3D).
// Colours come from skin tokens so it reskins with the whole site.

type Item = { t: string; href: string; app?: boolean }
type Section = { label: string; href: string; app?: boolean; items: Item[] }

// c() = a classic page link; app routes are marked app:true (rendered via next/link).
const c = (file: string) => classicHref(file)
const SECTIONS: Section[] = [
  { label: 'News', href: c('feed'), items: [
    { t: 'The feed', href: c('feed') },
    { t: 'Timeline', href: c('timeline') },
    { t: "History's deadliest", href: c('atrocities') },
  ]},
  { label: 'Money', href: classicMapHref(), items: [
    { t: 'The map', href: classicMapHref() },
    { t: 'State of India', href: c('state-of-india') },
    { t: 'Explore / query', href: '/explore', app: true },
    { t: 'Chain of command', href: c('command-chain') },
    { t: 'Provenance ledger', href: c('provenance') },
  ]},
  { label: 'Land', href: c('encroachment-atlas'), items: [
    { t: 'Built where water returns', href: c('encroachment-atlas') },
    { t: 'District terrain 3D', href: c('terrain-3d') },
    { t: 'Flood explorer', href: c('flood-3d') },
    { t: 'Quake & tsunami', href: c('quake-tsunami') },
  ]},
  { label: 'History', href: c('ancient-india'), items: [
    { t: 'Ancient India timeline', href: c('ancient-india') },
    { t: "Ashoka's rule of the land", href: c('ashoka') },
    { t: 'Sacred ground', href: c('heritage-atlas') },
    { t: 'Walk inside a temple', href: c('cave-walk') },
    { t: 'Deep history in DNA', href: c('deep-history') },
  ]},
  { label: 'Languages', href: c('languages'), items: [
    { t: 'Languages of Bharat', href: c('languages') },
    { t: 'The journey of a word', href: c('journey') },
    { t: 'Scripts & families', href: c('scripts') },
    { t: 'Texts across languages', href: c('vedas') },
  ]},
  { label: '3D', href: '/3d', app: true, items: [
    { t: 'Temple in 3D', href: '/3d', app: true },
    { t: 'The globe', href: c('india-3d') },
    { t: 'Globe → map', href: c('globe-map') },
    { t: 'Temple forms in 3D', href: c('temple-forms') },
    { t: 'The mesh', href: c('mesh') },
  ]},
  { label: 'Design', href: '/design-systems', app: true, items: [
    { t: 'India by Design Systems', href: '/design-systems', app: true },
    { t: 'The canvas', href: '/canvas', app: true },
    { t: 'Design system', href: c('design-system') },
  ]},
  { label: 'Data', href: '/data', app: true, items: [
    { t: 'Data & provenance', href: '/data', app: true },
    { t: 'The register', href: '/register', app: true },
    { t: 'Knowledge base', href: c('knowledge') },
    { t: 'The engines', href: '/engines', app: true },
    { t: 'India vs world', href: c('global') },
  ]},
]

export default function SiteHeader() {
  const [open, setOpen] = useState(false)      // mobile drawer
  const [openSec, setOpenSec] = useState<string | null>(null) // which mobile accordion
  const pathname = usePathname() || '/'
  const activeSec = (s: Section) =>
    s.app && (s.href === pathname || s.items.some((i) => i.app && pathname.startsWith(i.href)))

  const renderLink = (i: Item, cls: string, onClick?: () => void) =>
    i.app
      ? <Link key={i.t} href={i.href} className={cls} onClick={onClick}>{i.t}</Link>
      : <a key={i.t} href={i.href} className={cls} onClick={onClick}>{i.t}<span className="ah-ext" aria-hidden> ↗</span></a>

  return (
    <nav className="ah" aria-label="Global header">
      <Link href="/" className="ah-brand" aria-label="Bharat — home"><BharatLogo size={38} /></Link>

      {/* desktop grouped nav */}
      <div className="ah-nav">
        {SECTIONS.map((s) => (
          <div key={s.label} className={`ah-group${activeSec(s) ? ' on' : ''}`}>
            <button className="ah-top" aria-haspopup="true">{s.label}<span className="ah-caret" aria-hidden>▾</span></button>
            <div className="ah-menu">
              {s.items.map((i) => renderLink(i, 'ah-mitem'))}
            </div>
          </div>
        ))}
      </div>

      <div className="ah-actions">
        <button className="ah-search" onClick={() => window.dispatchEvent(new Event('atlas:open-search'))} aria-label="Search the atlas">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16.5 16.5 4.5 4.5" /></svg>
          <span className="ah-search-key">/</span>
        </button>
        <SkinSwitcher />
        <a className="ah-cta" href={classicMapHref()}>Open the atlas</a>
        <button className="ah-toggle" onClick={() => setOpen((v) => !v)} aria-label="Menu" aria-expanded={open}>{open ? '✕' : '☰'}</button>
      </div>

      {/* mobile accordion drawer */}
      {open && (
        <div className="ah-mobile">
          {SECTIONS.map((s) => (
            <div key={s.label} className="ah-msec">
              <button className="ah-msec-top" onClick={() => setOpenSec(openSec === s.label ? null : s.label)} aria-expanded={openSec === s.label}>
                {s.label}<span aria-hidden>{openSec === s.label ? '−' : '+'}</span>
              </button>
              {openSec === s.label && (
                <div className="ah-msec-body">
                  {s.items.map((i) => renderLink(i, 'ah-mlink', () => setOpen(false)))}
                </div>
              )}
            </div>
          ))}
          <a className="ah-cta" href={classicMapHref()} style={{ marginTop: 10, width: 'fit-content' }}>Open the atlas</a>
        </div>
      )}

      <style>{`
        .ah { position: sticky; top: 0; z-index: 50; display: flex; align-items: center; gap: 18px; flex-wrap: wrap;
              padding: 8px var(--edge); background: var(--surface); border-bottom: 2px solid var(--ink);
              color: var(--ink); font-family: var(--font-ui); }
        .ah-brand { display: flex; text-decoration: none; color: var(--ink); flex: none; }
        .ah-nav { display: flex; align-items: center; gap: 2px; }
        .ah-group { position: relative; }
        .ah-top { display: inline-flex; align-items: center; gap: 4px; background: transparent; border: 0; cursor: pointer;
                  color: var(--ink); font: 600 14px var(--font-ui); padding: 8px 9px; border-bottom: 3px solid transparent; }
        .ah-top:hover { color: var(--accent); }
        .ah-caret { font-size: 8px; opacity: .55; }
        .ah-group.on .ah-top { color: var(--accent); border-bottom-color: var(--band); }
        .ah-menu { position: absolute; top: 100%; left: 0; min-width: 230px; display: none; flex-direction: column;
                   background: var(--surface); border: 1.5px solid var(--ink); box-shadow: 6px 6px 0 rgba(42,32,24,.18);
                   padding: 5px; z-index: 60; }
        .ah-group:hover .ah-menu { display: flex; }
        .ah-mitem { display: block; color: var(--ink); text-decoration: none; font: 500 13.5px var(--font-ui); padding: 8px 10px; }
        .ah-mitem:hover { color: var(--accent); background: color-mix(in srgb, var(--band) 15%, transparent); }
        .ah-ext { font-size: .85em; opacity: .5; }
        .ah-actions { display: flex; align-items: center; gap: 12px; margin-left: auto; }
        .ah-search { display: flex; align-items: center; gap: 8px; border: 1.5px solid var(--line); background: transparent;
                     color: var(--muted); padding: 8px 10px; cursor: pointer; }
        .ah-search:hover { border-color: var(--ink); color: var(--ink); }
        .ah-search-key { border: 1px solid var(--line); padding: 0 5px; font: 400 10.5px var(--font-mono); }
        .ah-cta { display: inline-block; background: var(--accent); color: var(--surface); padding: 9px 16px;
                  font: 600 13.5px var(--font-ui); text-decoration: none; transition: background .16s ease, transform .12s cubic-bezier(.2,.7,.2,1), box-shadow .16s ease; }
        .ah-cta:hover { background: var(--accent-600); color: var(--surface); transform: translateY(-1px); box-shadow: 3px 4px 0 rgba(42,32,24,.25); }
        .ah-cta:active { transform: translateY(1px); box-shadow: none; }
        .ah-toggle { display: none; width: 40px; height: 40px; border: 1.5px solid var(--ink); background: transparent; color: var(--ink); cursor: pointer; }
        .ah-mobile { display: none; }
        @media (max-width: 1080px) {
          .ah-nav, .ah-search { display: none !important; }
          .ah-toggle { display: inline-flex; align-items: center; justify-content: center; }
          .ah-mobile { display: flex; flex-direction: column; flex-basis: 100%; order: 10; border-top: 2px solid var(--line); margin-top: 8px; padding-top: 6px; max-height: 74vh; overflow-y: auto; }
          .ah-msec { border-bottom: 1px solid var(--line); }
          .ah-msec-top { width: 100%; display: flex; justify-content: space-between; align-items: center; background: transparent; border: 0; cursor: pointer; color: var(--ink); font: 600 15px var(--font-ui); padding: 13px 2px; }
          .ah-msec-body { display: flex; flex-direction: column; padding: 0 0 8px 10px; }
          .ah-mlink { color: var(--ink); text-decoration: none; font: 500 14px var(--font-ui); padding: 9px 0; }
          .ah-mlink:hover { color: var(--accent); }
        }
        @media (prefers-reduced-motion: reduce) { .ah-cta:hover { transform: none; } }
      `}</style>
    </nav>
  )
}
