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
  T1: { bg: '#ffe0d9', fg: '#ae1800' },
  T2: { bg: '#eae7e7', fg: '#605d5d' },
  T3: { bg: '#ffe0d9', fg: '#ae1800' },
  gap: { bg: 'transparent', fg: '#ae1800' },
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
              <div className="lg-stat-v mono" style={{ color: s.tone === 'warn' ? '#ae1800' : s.tone === 'muted' ? '#bab6b6' : undefined }}>{s.value}</div>
              <div className="lg-stat-l">{s.label}</div>
            </div>
          ))}
        </div>

        {/* PLAIN-LANGUAGE citizen summary — 'what this means for you', built from the real
            fields (the money in, the catch, who's accountable, what's honestly unknown),
            so an ordinary reader gets the answer before the researcher's ledger below. */}
        {(() => {
          const moneyIn = d.stats[0]
          const theCatch = d.stats.find((s) => s.tone === 'warn') || d.stats[1]
          const accountable = (d.chain.find((n) => n.startsWith('*')) || d.chain[d.chain.length - 1] || '').replace(/^\*/, '')
          const gapCount = d.gaps?.length || 0
          const cards = [
            { k: 'What came in', v: moneyIn?.value, s: (moneyIn?.label || '').replace(/·\s*T\d.*/, '').trim(), icon: 'i-coin' },
            { k: 'The catch', v: theCatch?.value, s: (theCatch?.label || '').replace(/·\s*T\d.*/, '').trim(), warn: true, icon: 'i-edict' },
            { k: 'Who answers for it', v: accountable.split('(')[0].trim(), s: accountable.includes('(') ? '(' + accountable.split('(').slice(1).join('(') : d.state, icon: 'i-lion' },
            { k: 'What we don’t know', v: gapCount ? `${gapCount} open gaps` : 'Marked, not guessed', s: 'A blank cell is honesty, not absence.', icon: 'i-jali' },
          ]
          return (
            <section className="lg-citizen" aria-label="What this means for you">
              <div className="lg-citizen-h mono">In plain terms</div>
              <p className="lg-citizen-lede">{d.dek}</p>
              <div className="lg-citizen-grid">
                {cards.map((c, i) => (
                  <div key={i} className={`lg-cc${c.warn ? ' warn' : ''}`}>
                    <div className="lg-cc-k mono"><svg className="lg-cc-ico" width="14" height="14" viewBox="0 0 32 32" aria-hidden="true"><use href={`#${c.icon}`} /></svg>{c.k}</div>
                    <div className="lg-cc-v">{c.v}</div>
                    <div className="lg-cc-s">{c.s}</div>
                  </div>
                ))}
              </div>
            </section>
          )
        })()}

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
                    <span className="lg-tier mono" style={{ background: TIER_TAG[e.tier].bg, color: TIER_TAG[e.tier].fg, border: e.tier === 'gap' ? '1px solid #bab6b6' : undefined }}>
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
                  <strong className="mono" style={{ color: p.tone === 'good' ? '#ae1800' : p.tone === 'gold' ? '#ae1800' : undefined }}>{p.value}</strong>
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
        .ledger { --lg-gold: #cc8900; --lg-gold-700: #a06b00; background: #f3f2f2; color: #1a1917; max-width: 980px; margin: 0 auto; font-family: var(--font-ui); }
        .lg-crumb { display: flex; align-items: center; gap: 12px; padding: 12px var(--edge); border-bottom: 1px solid #d7d3d3; font: 500 12px var(--font-ui); flex-wrap: wrap; }
        .lg-crumb-l { color: #605d5d; }
        .lg-sep { color: #bab6b6; }
        .lg-badge { margin-left: auto; font-size: 10.5px; letter-spacing: .1em; color: var(--lg-gold-700); background: #ffe0d9; padding: 3px 8px; }
        .lg-hero { position: relative; padding: 30px var(--edge) 24px; border-bottom: 1px solid #d7d3d3; }
        .lg-jali { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; opacity: .5; }
        .lg-hero-in { position: relative; }
        .lg-kicker { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: var(--lg-gold-700); margin-bottom: 8px; }
        .lg-title { font: 600 clamp(30px,5vw,40px)/1.05 var(--font-serif); margin: 0 0 6px; letter-spacing: -.01em; }
        .lg-dek { font: italic 400 18px/1.4 var(--font-italic); color: #605d5d; margin: 0; }
        .lg-stats { display: grid; grid-template-columns: repeat(3, 1fr); border-bottom: 1px solid #d7d3d3; }
        .lg-stat { padding: 18px 24px; border-right: 1px solid #d7d3d3; }
        .lg-stat:last-child { border-right: 0; }
        .lg-stat-v { font: 600 26px var(--font-mono); }
        .lg-stat-l { font: 500 11px var(--font-ui); color: #605d5d; margin-top: 2px; }

        /* plain-language citizen band — the human answer, above the researcher's ledger */
        .lg-citizen { padding: 26px var(--edge) 28px; border-bottom: 2px solid #1a1917; background: #f8f4f4; }
        .lg-citizen-h { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: var(--lg-gold-700); margin-bottom: 10px; }
        .lg-citizen-lede { font: 400 clamp(17px,2.4vw,22px)/1.5 var(--font-ui); color: #1a1917; margin: 0 0 20px; max-width: 62ch; }
        .lg-citizen-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0; border: 1px solid #d7d3d3; }
        .lg-cc { padding: 14px 16px; border-right: 1px solid #d7d3d3; }
        .lg-cc:last-child { border-right: 0; }
        .lg-cc-k { display: inline-flex; align-items: center; gap: 6px; font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: #605d5d; }
        .lg-cc-ico { color: var(--lg-gold, #cc8900); flex: none; }
        .lg-cc-v { font: 600 18px/1.2 var(--font-ui); color: #1a1917; margin: 6px 0 4px; }
        .lg-cc-s { font: 400 12px/1.45 var(--font-ui); color: #605d5d; }
        .lg-cc.warn { background: #fff3f0; }
        .lg-cc.warn .lg-cc-v { color: var(--lg-gold-700); }
        @media (max-width: 640px) { .lg-cc { border-right: 0; border-bottom: 1px solid #d7d3d3; } .lg-cc:last-child { border-bottom: 0; } }

        .lg-body { display: grid; grid-template-columns: 1fr 300px; }
        .lg-main { padding: 22px var(--edge); border-right: 1px solid #d7d3d3; }
        .lg-h { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: #605d5d; margin-bottom: 14px; }
        .lg-timeline { display: flex; flex-direction: column; }
        .lg-event { display: flex; gap: 14px; padding: 10px 0; border-bottom: 1px solid #eae7e7; }
        .lg-event:last-child { border-bottom: 0; }
        .lg-year { font-size: 11px; color: var(--lg-gold-700); min-width: 52px; padding-top: 2px; }
        .lg-event-t { font: 400 13.5px/1.5 var(--font-ui); }
        .lg-tier { font-size: 10px; padding: 1px 6px; white-space: nowrap; }
        .lg-floral { width: 100%; margin: 18px 0 14px; color: var(--lg-gold); }
        .lg-chain { display: flex; align-items: center; gap: 10px; font: 500 12.5px var(--font-ui); flex-wrap: wrap; }
        .lg-node { border: 1px solid #bab6b6; padding: 6px 12px; background: #eae9e9; }
        .lg-node.on { border-color: var(--lg-gold); background: #ffe0d9; font-weight: 600; }
        .lg-arrow { color: #bab6b6; }
        .lg-side { padding: 22px 24px; background: #eae9e9; }
        .lg-prov-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eae7e7; font: 400 12.5px var(--font-ui); }
        .lg-prov-row:last-child { border-bottom: 0; }
        .lg-quote { margin-top: 16px; border-top: 2px solid #262320; padding-top: 12px; font: italic 400 14px/1.5 var(--font-italic); color: #605d5d; }
        .lg-audit { display: block; margin-top: 16px; background: #262320; color: #fff; font: 600 13px var(--font-ui); padding: 10px 14px; }
        .lg-audit:hover { background: #0a0a0a; color: #fff; }
        .lg-depts { border-top: 1px solid #d7d3d3; }
        .lg-depts-head { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; padding: 18px var(--edge) 6px; }
        .lg-depts-head .lg-h { margin-bottom: 0; }
        .lg-depts-src { margin-left: auto; font-size: 10px; letter-spacing: .1em; color: var(--lg-gold-700); background: #ffe0d9; padding: 3px 8px; }
        .lg-dept-table { padding: 8px var(--edge) 18px; }
        .lg-dept-thead, .lg-dept-row { display: grid; grid-template-columns: 1.4fr 2fr .6fr; gap: 12px; padding: 8px 0; align-items: baseline; }
        .lg-dept-thead { font: 600 9.5px var(--font-mono); letter-spacing: .12em; color: #605d5d; border-bottom: 2px solid #262320; text-transform: uppercase; }
        .lg-dept-row { border-bottom: 1px solid #eae7e7; font: 400 13px var(--font-ui); }
        .lg-dept-name { font-weight: 600; }
        .lg-dept-scheme { font-size: 11.5px; color: #605d5d; }
        .lg-dept-scheme strong { color: var(--lg-gold-700); font-weight: 600; }
        .lg-dept-amt { text-align: right; font-weight: 600; }
        .lg-gaps { border-top: 1px solid #d7d3d3; padding: 18px var(--edge); }
        .lg-gap-list { list-style: none; margin: 6px 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
        .lg-gap-list li { display: flex; gap: 10px; font: 400 12.5px/1.5 var(--font-ui); color: #444141; }
        .lg-gap-tag { flex: none; font-size: 9.5px; border: 1px solid #bab6b6; color: var(--lg-gold-700); padding: 1px 6px; height: fit-content; }
        .lg-strip { display: flex; align-items: center; gap: 14px; padding: 12px var(--edge); border-top: 1px solid #d7d3d3; font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; color: #605d5d; }
        @media (max-width: 780px) {
          .lg-body { grid-template-columns: 1fr; }
          .lg-main { border-right: 0; border-bottom: 1px solid #d7d3d3; }
          .lg-stats { grid-template-columns: 1fr; }
          .lg-stat { border-right: 0; border-bottom: 1px solid #d7d3d3; }
        }
      `}</style>
    </>
  )
}
