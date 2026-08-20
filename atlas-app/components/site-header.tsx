'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import BharatLogo from '@/components/bharat-logo'
import SkinSwitcher from '@/components/skin-switcher'
import { classicMapHref, classicHref } from '@/lib/links'

// The global header — the SAME public 6-section nav the classic pages use
// (News · Money · Land · History · Languages · About), so a visitor sees one
// consistent map across the classic atlas and this app. '3D' folds into its topic
// (globe→Money, temples→History, terrain→Land); Design/Study/Data live under About.
// Most items are classic .html pages (one level up at /bharat); some are app routes.
// Colours come from skin tokens so it reskins with the whole site.

type Item = { t: string; href: string; app?: boolean }
type Section = { label: string; href: string; app?: boolean; icon: string; items: Item[] }

// Each section wears a Mauryan artefact icon (public sprite): News=edict, Money=coin,
// Land=tree, History=lion, Languages=pillar, About=jali.
// c() = a classic page link; app routes are marked app:true (rendered via next/link).
const c = (file: string) => classicHref(file)
const SECTIONS: Section[] = [
  { label: 'News', href: c('feed'), icon: 'i-edict', items: [
    { t: "Today's news", href: c('feed') },
    { t: 'How it built up', href: c('timeline') },
  ]},
  { label: 'Money', href: classicMapHref(), icon: 'i-coin', items: [
    { t: 'The money map', href: classicMapHref() },
    { t: 'See it on the globe', href: c('india-3d') },
    { t: 'Which states carry the country', href: c('state-of-india') },
    { t: 'Ask your own question', href: '/explore', app: true },
    { t: "Who's in charge", href: c('command-chain') },
  ]},
  { label: 'Land', href: c('encroachment-atlas'), icon: 'i-tree', items: [
    { t: 'Built where water returns', href: c('encroachment-atlas') },
    { t: 'The land in 3D', href: c('terrain-3d') },
    { t: 'Raise the water', href: c('flood-3d') },
    { t: 'Earthquakes & tsunamis', href: c('quake-tsunami') },
  ]},
  { label: 'History', href: c('ancient-india'), icon: 'i-lion', items: [
    { t: '5,000 years, one timeline', href: c('ancient-india') },
    { t: "Ashoka's empire", href: c('ashoka') },
    { t: 'Temples & sacred ground', href: c('heritage-atlas') },
    { t: 'Walk inside a temple', href: c('cave-walk') },
    { t: 'Temples in 3D', href: '/3d', app: true },
    { t: 'Who we are, in DNA', href: c('deep-history') },
    { t: "History's deadliest events", href: c('atrocities') },
  ]},
  { label: 'Languages', href: c('languages'), icon: 'i-pillar', items: [
    { t: 'Every language & script', href: c('languages') },
    { t: 'The journey of a word', href: c('journey') },
    { t: 'The script family tree', href: c('scripts') },
    { t: 'One text, many tongues', href: c('vedas') },
  ]},
  { label: 'About', href: c('how-it-works'), icon: 'i-jali', items: [
    { t: 'How it works', href: c('how-it-works') },
    { t: 'The 7 engines', href: '/engines', app: true },
    { t: 'India vs the world', href: c('global') },
    { t: 'The data & sources', href: '/data', app: true },
    { t: 'Every figure → its source', href: c('provenance') },
    { t: 'India by Design Systems', href: '/design-systems', app: true },
    { t: 'The gallery', href: '/design-systems#gallery', app: true },
    { t: 'Methodology & honesty', href: c('about') },
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
      <Link href="/" className="ah-brand" aria-label="Bharat — home"><BharatLogo size={38} tagline="INDIC DESIGNS" /></Link>

      {/* desktop grouped nav */}
      <div className="ah-nav">
        {SECTIONS.map((s) => (
          <div key={s.label} className={`ah-group${activeSec(s) ? ' on' : ''}`}>
            <button className="ah-top" aria-haspopup="true"><svg className="ah-sec-ico" width="15" height="15" viewBox="0 0 32 32" aria-hidden="true"><use href={`#${s.icon}`} /></svg>{s.label}<span className="ah-caret" aria-hidden>▾</span></button>
            <div className="ah-menu">
              {s.items.map((i) => renderLink(i, 'ah-mitem'))}
            </div>
          </div>
        ))}
      </div>

      <div className="ah-actions">
        <button className="ah-search" onClick={() => window.dispatchEvent(new Event('atlas:open-search'))} aria-label="Search the atlas">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16.5 16.5 4.5 4.5" /></svg>
          <span className="ah-search-label">Search the atlas</span>
          <span className="ah-search-key">/</span>
        </button>
        <SkinSwitcher />
        <a className="ah-cta" href={classicMapHref()}>View the India map</a>
        <button className="ah-toggle" onClick={() => setOpen((v) => !v)} aria-label="Menu" aria-expanded={open}>{open ? '✕' : '☰'}</button>
      </div>

      {/* mobile accordion drawer */}
      {open && (
        <div className="ah-mobile">
          {SECTIONS.map((s) => (
            <div key={s.label} className="ah-msec">
              <button className="ah-msec-top" onClick={() => setOpenSec(openSec === s.label ? null : s.label)} aria-expanded={openSec === s.label}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}><svg width="16" height="16" viewBox="0 0 32 32" aria-hidden="true"><use href={`#${s.icon}`} /></svg>{s.label}</span><span aria-hidden>{openSec === s.label ? '−' : '+'}</span>
              </button>
              {openSec === s.label && (
                <div className="ah-msec-body">
                  {s.items.map((i) => renderLink(i, 'ah-mlink', () => setOpen(false)))}
                </div>
              )}
            </div>
          ))}
          <a className="ah-cta" href={classicMapHref()} style={{ marginTop: 10, width: 'fit-content' }}>View the India map</a>
        </div>
      )}

      <style>{`
        .ah { position: sticky; top: 0; z-index: 50; display: flex; align-items: center; gap: 18px; flex-wrap: wrap;
              padding: 8px var(--edge); background: var(--surface); border-bottom: 2px solid var(--ink);
              color: var(--ink); font-family: var(--font-ui); }
        .ah-brand { display: flex; text-decoration: none; color: var(--ink); flex: none; }
        .ah-nav { display: flex; align-items: center; gap: 2px; }
        .ah-group { position: relative; }
        .ah-top { display: inline-flex; align-items: center; gap: 6px; background: transparent; border: 0; cursor: pointer;
                  color: var(--ink); font: 600 13.5px var(--font-ui); padding: 8px 8px; border-bottom: 3px solid transparent; }
        .ah-top:hover { color: var(--accent); }
        .ah-sec-ico { color: var(--band); flex: none; }
        .ah-top:hover .ah-sec-ico, .ah-group.on .ah-sec-ico { color: var(--accent); }
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
        .ah-search { display: flex; align-items: center; gap: 10px; border: 1.5px solid var(--line); background: transparent;
                     color: var(--muted); padding: 8px 12px; cursor: pointer; min-width: 170px; font: 400 12.5px var(--font-ui); }
        .ah-search:hover { border-color: var(--ink); color: var(--ink); }
        .ah-search-label { white-space: nowrap; }
        .ah-search-key { margin-left: auto; border: 1px solid var(--line); padding: 0 5px; font: 400 10.5px var(--font-mono); }
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
