import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import { DISTRICTS, DISTRICT_SLUGS } from '@/lib/districts'
import { SITES, SITE_SLUGS } from '@/lib/heritage'
import { STUDIES, STUDY_SLUGS } from '@/lib/study'
import { classicMapHref } from '@/lib/links'

// The register (from the deck's index) — every real entry in the atlas, grouped by
// section, each with a specimen swatch and a one-line description. A flat, scannable
// table of everything that is built.
export const metadata: Metadata = {
  title: 'The register — every page, one list · Bharat',
  description: 'The whole atlas as one register: districts, studies, heritage sites and the tools, each with a one-line description.',
}

type Row = { name: string; sub: string; href: string; ext?: boolean; swatch: string }

const GROUPS: { label: string; rows: Row[] }[] = [
  {
    label: 'Deep districts — money to the pixel',
    rows: DISTRICT_SLUGS.map((s) => {
      const d = DISTRICTS[s]
      return { name: d.name, sub: `${d.state} · ${d.model} — ${d.dek}`, href: `/d/${s}`, swatch: 'var(--gold)' }
    }),
  },
  {
    label: 'Heritage — sites of record',
    rows: SITE_SLUGS.map((s) => {
      const h = SITES[s]
      return { name: h.name, sub: `${h.state} · ${h.from} CE · ${h.status}${h.destroy ? ` — destroyed ${h.destroy.year}` : ''}`, href: `/heritage/${s}`, swatch: '#ae1800' }
    }),
  },
  {
    label: 'Study — the long read',
    rows: STUDY_SLUGS.map((s) => {
      const st = STUDIES[s]
      return { name: `${st.title} ${st.titleEm}`.trim(), sub: st.section.replace('Study / ', ''), href: `/study/${s}`, swatch: '#ec3013' }
    }),
  },
  {
    label: 'Tools & data',
    rows: [
      { name: 'The interactive map', sub: 'all 594 districts — money, CRZ, flood (classic atlas)', href: classicMapHref(), ext: true, swatch: 'var(--sky)' },
      { name: 'Explore', sub: 'query the districts with AND facets', href: '/explore', swatch: 'var(--sky)' },
      { name: 'Engines', sub: 'seven lenses, one country', href: '/engines', swatch: '#2a4a7a' },
      { name: 'The state ledger', sub: 'revenue dashboard — FY15→24, 9 views', href: '/engines/revenue', swatch: '#2a4a7a' },
      { name: 'India in 3D', sub: 'the real Earth, every layer sourced or a gap', href: '/3d', swatch: '#ec3013' },
      { name: 'The feed', sub: 'moderated, attributed, clustered by place', href: '/feed', swatch: '#bab6b6' },
      { name: 'Data & provenance', sub: 'audit us, figure by figure', href: '/data', swatch: 'var(--good)' },
      { name: 'Design system', sub: 'carved from artefacts', href: '/design', swatch: 'var(--ink)' },
    ],
  },
]

const TOTAL = GROUPS.reduce((n, g) => n + g.rows.length, 0)

export default function RegisterPage() {
  return (
    <>
      <SiteHeader />
      <main className="rg" style={{ maxWidth: 'var(--wrap)', margin: '0 auto' }}>
        <div className="rg-head">
          <div className="rg-kicker mono">The register</div>
          <h1 className="rg-title">Every page, one list</h1>
          <span className="rg-count mono">{TOTAL} entries · sourced or a gap</span>
        </div>

        {GROUPS.map((g, gi) => (
          <section key={g.label} className="rg-group" data-reveal data-reveal-delay={gi * 60}>
            <div className="rg-group-h mono">{g.label}</div>
            {g.rows.map((r) => {
              const inner = (
                <>
                  <span className="rg-swatch" style={{ background: r.swatch }} />
                  <span className="rg-name">{r.name}</span>
                  <span className="rg-sub">{r.sub}</span>
                  <span className="rg-arrow mono">{r.ext ? '↗' : '→'}</span>
                </>
              )
              return r.ext ? (
                <a key={r.name} href={r.href} className="rg-row">{inner}</a>
              ) : (
                <Link key={r.name} href={r.href} className="rg-row">{inner}</Link>
              )
            })}
          </section>
        ))}
      </main>
      <SiteFooter />

      <style>{`
        .rg-head { display: flex; align-items: baseline; gap: 14px; padding: 30px var(--edge) 18px; border-bottom: 2px solid var(--line-strong); flex-wrap: wrap; }
        .rg-kicker { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: var(--terra); }
        .rg-title { font: 800 clamp(26px,4vw,38px) var(--font-ui); margin: 0; }
        .rg-count { margin-left: auto; font-size: 11px; color: var(--muted); }
        .rg-group { border-bottom: 1px solid var(--line); }
        .rg-group-h { padding: 16px var(--edge) 10px; font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: var(--gold-700); }
        .rg-row { display: grid; grid-template-columns: 14px 1.1fr 2fr 20px; gap: 14px; align-items: baseline; padding: 11px var(--edge); border-top: 1px solid var(--line); }
        .rg-row:hover { background: var(--stone-2); }
        .rg-swatch { width: 10px; height: 10px; align-self: center; }
        .rg-name { font: 600 14px var(--font-ui); }
        .rg-sub { font: 400 12.5px var(--font-ui); color: var(--muted); }
        .rg-arrow { color: var(--muted); text-align: right; }
        @media (max-width: 640px) {
          .rg-row { grid-template-columns: 12px 1fr 16px; }
          .rg-sub { grid-column: 2 / 4; }
        }
      `}</style>
    </>
  )
}
