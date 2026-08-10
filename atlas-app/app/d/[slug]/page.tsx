import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import { DISTRICTS, DISTRICT_SLUGS } from '@/lib/districts'
import { classicMapHref } from '@/lib/links'
import IndustrialisationTimeline from '@/components/industrialisation-timeline'

// Deep-district ledger — mockup 1b "Edict Ledger", the house register (paper ground,
// Fraunces / Instrument Serif / JetBrains Mono, amber-gold), edict layout.

export function generateStaticParams() {
  return DISTRICT_SLUGS.map((slug) => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const d = DISTRICTS[params.slug]
  if (!d) return { title: 'District — Bharat' }
  return { title: `${d.name} — the money ledger · Bharat`, description: d.dek }
}

const TIER_TAG: Record<string, { bg: string; fg: string }> = {
  T1: { bg: '#f7ecd2', fg: '#a06b00' },
  T2: { bg: '#ece9e2', fg: '#6b665e' },
  T3: { bg: '#f7ecd2', fg: '#a06b00' },
  gap: { bg: 'transparent', fg: '#a06b00' },
}

export default async function DistrictPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const d = DISTRICTS[slug]
  if (!d) notFound()

  return (
    <>
      <SiteHeader />

      <main className="ledger">
        {/* breadcrumb */}
        <div className="lg-crumb">
          <svg width="18" height="18" style={{ color: 'var(--lg-gold)' }} aria-hidden="true"><use href="#chakra" /></svg>
          <Link href="/" className="lg-crumb-l">Atlas</Link><span className="lg-sep">/</span>
          <span className="lg-crumb-l">{d.state}</span><span className="lg-sep">/</span>
          <strong>{d.name}</strong>
          <span className="lg-badge mono">DEEP DISTRICT · T1 SOURCED</span>
        </div>

        {/* hero */}
        <section className="lg-hero">
          <svg className="lg-jali" aria-hidden="true"><rect width="100%" height="100%" fill="url(#jali)" /></svg>
          <div className="lg-hero-in">
            <div className="lg-kicker mono">The money ledger · {d.model}</div>
            <h1 className="lg-title">{d.name}</h1>
            <p className="lg-dek">{d.dek}</p>
          </div>
        </section>

        {/* stat row */}
        <div className="lg-stats">
          {d.stats.map((s, i) => (
            <div key={i} className="lg-stat">
              <div className="lg-stat-v mono" style={{ color: s.tone === 'warn' ? '#9e3b2e' : s.tone === 'muted' ? '#c3bcb2' : undefined }}>{s.value}</div>
              <div className="lg-stat-l">{s.label}</div>
            </div>
          ))}
        </div>

        {/* body: timeline + provenance */}
        <div className="lg-body">
          <div className="lg-main">
            <div className="lg-h mono">What happened to the money</div>
            <div className="lg-timeline">
              {d.events.map((e, i) => (
                <div key={i} className="lg-event">
                  <span className="lg-year mono">{e.year}</span>
                  <div className="lg-event-t">
                    {e.text}{' '}
                    <span className="lg-tier mono" style={{ background: TIER_TAG[e.tier].bg, color: TIER_TAG[e.tier].fg, border: e.tier === 'gap' ? '1px solid #c3bcb2' : undefined }}>
                      {e.tier === 'gap' ? 'GAP' : `${e.tier}${e.src ? ' · ' + e.src : ''}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <svg className="lg-floral" height="18" aria-hidden="true"><rect width="100%" height="18" fill="url(#floral)" /></svg>

            <div className="lg-h mono">Chain of command</div>
            <div className="lg-chain">
              {d.chain.map((node, i) => {
                const active = node.startsWith('*')
                const label = active ? node.slice(1) : node
                return (
                  <span key={i} className="lg-chain-wrap">
                    <span className={`lg-node${active ? ' on' : ''}`}>{label}</span>
                    {i < d.chain.length - 1 && <span className="lg-arrow">→</span>}
                  </span>
                )
              })}
            </div>
          </div>

          <aside className="lg-side">
            <div className="lg-h mono">Provenance</div>
            <div className="lg-prov">
              {d.provenance.map((p, i) => (
                <div key={i} className="lg-prov-row">
                  <span>{p.label}</span>
                  <strong className="mono" style={{ color: p.tone === 'good' ? '#00bb7f' : p.tone === 'gold' ? '#a06b00' : undefined }}>{p.value}</strong>
                </div>
              ))}
            </div>
            <div className="lg-quote">&ldquo;Sourced — or it&apos;s a gap. A blank cell is honesty, not absence.&rdquo;</div>
            <a href={classicMapHref()} className="lg-audit">Audit every figure →</a>
          </aside>
        </div>

        {/* real department budget lines — where the money is allocated (KMC-style) */}
        {d.departments && (
          <section className="lg-depts">
            <div className="lg-depts-head">
              <div className="lg-h mono">Where the civic money goes · {d.departments.fy}</div>
              <span className="lg-depts-src mono">{d.departments.sourceTier} · {d.departments.source}</span>
            </div>
            <div className="lg-dept-table">
              <div className="lg-dept-thead mono"><span>Department</span><span>Scheme · ministry</span><span>₹ cr</span></div>
              {d.departments.rows.map((r) => (
                <div key={r.name} className="lg-dept-row">
                  <span className="lg-dept-name">{r.name}</span>
                  <span className="lg-dept-scheme">{r.scheme ? <><strong>{r.scheme}</strong>{r.ministry ? ` · ${r.ministry}` : ''}</> : <span className="muted">own funds · no dedicated central line</span>}</span>
                  <span className="lg-dept-amt mono">{r.allocCr.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* declared gaps — sourced-or-gap, made explicit */}
        {d.gaps && d.gaps.length > 0 && (
          <section className="lg-gaps">
            <div className="lg-h mono">Declared gaps — what we don&apos;t yet have a source for</div>
            <ul className="lg-gap-list">
              {d.gaps.map((g, i) => <li key={i}><span className="lg-gap-tag mono">GAP</span>{g}</li>)}
            </ul>
          </section>
        )}

        {/* era-coded industrialisation timeline (7b) — only where we have the record */}
        <IndustrialisationTimeline slug={slug} />

        <div className="lg-strip mono">
          <svg width="14" height="14" style={{ color: 'var(--lg-gold)' }} aria-hidden="true"><use href="#chakra" /></svg>
          <span>House register — Fraunces · Inter · JetBrains Mono · amber-gold · edict layout</span>
        </div>
      </main>

      <SiteFooter />

      <style>{`
        .ledger { --lg-gold: #cc8900; --lg-gold-700: #a06b00; background: #f6f5f1; color: #1a1917; max-width: 980px; margin: 0 auto; font-family: var(--font-ui); }
        .lg-crumb { display: flex; align-items: center; gap: 12px; padding: 12px var(--edge); border-bottom: 1px solid #d6d0cb; font: 500 12px var(--font-ui); flex-wrap: wrap; }
        .lg-crumb-l { color: #6b665e; }
        .lg-sep { color: #c3bcb2; }
        .lg-badge { margin-left: auto; font-size: 10.5px; letter-spacing: .1em; color: var(--lg-gold-700); background: #f7ecd2; padding: 3px 8px; }
        .lg-hero { position: relative; padding: 30px var(--edge) 24px; border-bottom: 1px solid #d6d0cb; }
        .lg-jali { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; opacity: .5; }
        .lg-hero-in { position: relative; }
        .lg-kicker { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: var(--lg-gold-700); margin-bottom: 8px; }
        .lg-title { font: 600 clamp(30px,5vw,40px)/1.05 var(--font-serif); margin: 0 0 6px; letter-spacing: -.01em; }
        .lg-dek { font: italic 400 18px/1.4 var(--font-italic); color: #6b665e; margin: 0; }
        .lg-stats { display: grid; grid-template-columns: repeat(3, 1fr); border-bottom: 1px solid #d6d0cb; }
        .lg-stat { padding: 18px 24px; border-right: 1px solid #d6d0cb; }
        .lg-stat:last-child { border-right: 0; }
        .lg-stat-v { font: 600 26px var(--font-mono); }
        .lg-stat-l { font: 500 11px var(--font-ui); color: #6b665e; margin-top: 2px; }
        .lg-body { display: grid; grid-template-columns: 1fr 300px; }
        .lg-main { padding: 22px var(--edge); border-right: 1px solid #d6d0cb; }
        .lg-h { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: #6b665e; margin-bottom: 14px; }
        .lg-timeline { display: flex; flex-direction: column; }
        .lg-event { display: flex; gap: 14px; padding: 10px 0; border-bottom: 1px solid #ece9e2; }
        .lg-event:last-child { border-bottom: 0; }
        .lg-year { font-size: 11px; color: var(--lg-gold-700); min-width: 52px; padding-top: 2px; }
        .lg-event-t { font: 400 13.5px/1.5 var(--font-ui); }
        .lg-tier { font-size: 10px; padding: 1px 6px; white-space: nowrap; }
        .lg-floral { width: 100%; margin: 18px 0 14px; color: var(--lg-gold); }
        .lg-chain { display: flex; align-items: center; gap: 10px; font: 500 12.5px var(--font-ui); flex-wrap: wrap; }
        .lg-node { border: 1px solid #c3bcb2; padding: 6px 12px; background: #fbfaf7; }
        .lg-node.on { border-color: var(--lg-gold); background: #f7ecd2; font-weight: 600; }
        .lg-arrow { color: #c3bcb2; }
        .lg-side { padding: 22px 24px; background: #fbfaf7; }
        .lg-prov-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #ece9e2; font: 400 12.5px var(--font-ui); }
        .lg-prov-row:last-child { border-bottom: 0; }
        .lg-quote { margin-top: 16px; border-top: 2px solid #262320; padding-top: 12px; font: italic 400 14px/1.5 var(--font-italic); color: #6b665e; }
        .lg-audit { display: block; margin-top: 16px; background: #262320; color: #fff; font: 600 13px var(--font-ui); padding: 10px 14px; }
        .lg-audit:hover { background: #0a0a0a; color: #fff; }
        .lg-depts { border-top: 1px solid #d6d0cb; }
        .lg-depts-head { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; padding: 18px var(--edge) 6px; }
        .lg-depts-head .lg-h { margin-bottom: 0; }
        .lg-depts-src { margin-left: auto; font-size: 10px; letter-spacing: .1em; color: var(--lg-gold-700); background: #f7ecd2; padding: 3px 8px; }
        .lg-dept-table { padding: 8px var(--edge) 18px; }
        .lg-dept-thead, .lg-dept-row { display: grid; grid-template-columns: 1.4fr 2fr .6fr; gap: 12px; padding: 8px 0; align-items: baseline; }
        .lg-dept-thead { font: 600 9.5px var(--font-mono); letter-spacing: .12em; color: #6b665e; border-bottom: 2px solid #262320; text-transform: uppercase; }
        .lg-dept-row { border-bottom: 1px solid #ece9e2; font: 400 13px var(--font-ui); }
        .lg-dept-name { font-weight: 600; }
        .lg-dept-scheme { font-size: 11.5px; color: #6b665e; }
        .lg-dept-scheme strong { color: var(--lg-gold-700); font-weight: 600; }
        .lg-dept-amt { text-align: right; font-weight: 600; }
        .lg-gaps { border-top: 1px solid #d6d0cb; padding: 18px var(--edge); }
        .lg-gap-list { list-style: none; margin: 6px 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
        .lg-gap-list li { display: flex; gap: 10px; font: 400 12.5px/1.5 var(--font-ui); color: #4a3d30; }
        .lg-gap-tag { flex: none; font-size: 9.5px; border: 1px solid #c3bcb2; color: var(--lg-gold-700); padding: 1px 6px; height: fit-content; }
        .lg-strip { display: flex; align-items: center; gap: 14px; padding: 12px var(--edge); border-top: 1px solid #d6d0cb; font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; color: #6b665e; }
        @media (max-width: 780px) {
          .lg-body { grid-template-columns: 1fr; }
          .lg-main { border-right: 0; border-bottom: 1px solid #d6d0cb; }
          .lg-stats { grid-template-columns: 1fr; }
          .lg-stat { border-right: 0; border-bottom: 1px solid #d6d0cb; }
        }
      `}</style>
    </>
  )
}
