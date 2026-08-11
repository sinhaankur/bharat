import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import { SITES, SITE_SLUGS, TRADITION_LABEL } from '@/lib/heritage'

// A heritage-site page in the Gupta register: builder, a lifespan bar (built → today
// or → destroyed), the sourced destruction record with the actor named, and the
// citation with its tier. Real ASI/UNESCO-sourced data — multi-actor, not one-sided.

export function generateStaticParams() {
  return SITE_SLUGS.map((slug) => ({ slug }))
}
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const s = SITES[params.slug]
  if (!s) return { title: 'Heritage — Bharat' }
  return { title: `${s.name} — ${TRADITION_LABEL[s.tradition]} · Bharat`, description: s.note.slice(0, 155) }
}

const NOW = 2026

export default async function HeritagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const s = SITES[slug]
  if (!s) notFound()

  // lifespan bar: built_from → (destroy year or now)
  const end = s.destroy?.year ?? NOW
  const span0 = 600, span1 = NOW
  const pct = (y: number) => Math.max(0, Math.min(100, ((y - span0) / (span1 - span0)) * 100))
  const others = SITE_SLUGS.filter((x) => x !== slug).slice(0, 4)

  return (
    <>
      <SiteHeader />

      <main className="hs">
        <div className="hs-top">
          <svg width="17" height="17" style={{ color: 'var(--hs-gold)' }} aria-hidden="true"><use href="#chakra" /></svg>
          <Link href="/" className="hs-crumb">Atlas</Link><span className="hs-sep">/</span>
          <span className="hs-crumb">Heritage</span><span className="hs-sep">/</span>
          <strong>{s.state}</strong>
          <span className="hs-src mono">T{s.source.tier} SOURCED</span>
        </div>

        <section className="hs-read">
          <div className="hs-ruler mono">{TRADITION_LABEL[s.tradition].toUpperCase()} · {s.deity} · {s.region}</div>
          <h1 className="hs-h1">{s.name}</h1>
          <p className="hs-lead">{s.note}</p>

          <div className="hs-facts">
            <div className="hs-fact"><div className="hs-fact-l mono">BUILDER</div><div className="hs-fact-v">{s.builder}</div></div>
            <div className="hs-fact"><div className="hs-fact-l mono">BUILT</div><div className="hs-fact-v mono">{s.from}{s.to && s.to !== s.from ? `–${s.to}` : ''} CE</div></div>
            <div className="hs-fact"><div className="hs-fact-l mono">STATUS</div><div className="hs-fact-v" style={{ textTransform: 'capitalize' }}>{s.status}</div></div>
          </div>

          {/* measured-survey plate — real dims, or a declared gap (never invented) */}
          {s.dims && (
            <div className="hs-plate">
              <div className="hs-plate-head">
                <span className="hs-plate-t mono">MEASURED SURVEY · {s.form ?? 'ELEVATION'}</span>
                <span className="hs-plate-src mono">SOURCED — NOT A SURVEY FACSIMILE</span>
              </div>
              <div className="hs-plate-grid">
                {s.dims.map((dim) => (
                  <div key={dim.label} className="hs-dim">
                    <div className="hs-dim-v mono" style={{ color: dim.gap ? 'var(--muted)' : undefined }}>
                      {dim.value}{dim.gap && <span className="hs-dim-gap mono"> GAP</span>}
                    </div>
                    <div className="hs-dim-l mono">{dim.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* lifespan bar */}
          <div className="hs-life">
            <div className="hs-life-h mono">LIFESPAN — {span0} CE → today</div>
            <div className="hs-life-bar">
              <span className="hs-life-fill" style={{ left: `${pct(s.from)}%`, width: `${pct(end) - pct(s.from)}%` }} />
              {s.destroy && <span className="hs-life-x" style={{ left: `${pct(s.destroy.year)}%` }} title={`destroyed ${s.destroy.year}`} />}
            </div>
            <div className="hs-life-labels mono"><span>{span0}</span><span>{span1}</span></div>
          </div>
        </section>

        {/* destruction record */}
        {s.destroy ? (
          <div className="hs-destroy">
            <div className="hs-destroy-tag mono">THE RECORD OF DESTRUCTION · {s.destroy.year} CE</div>
            <div className="hs-destroy-actor">By {s.destroy.actor}</div>
            <div className="hs-destroy-account">{s.destroy.account}</div>
          </div>
        ) : (
          <div className="hs-destroy hs-destroy-gap">
            <div className="hs-destroy-tag mono">THE RECORD OF DESTRUCTION</div>
            <div className="hs-destroy-account">Decline debated — structural decay and possible deliberate damage; no single sourced actor. A declared gap, not a guess.</div>
          </div>
        )}

        <div className="hs-cite">
          <span className="hs-cite-l mono">SOURCE · T{s.source.tier}</span>
          <span className="hs-cite-v">{s.source.label}</span>
        </div>

        <div className="hs-more">
          <div className="hs-h mono">More sites of record</div>
          <div className="hs-more-row">
            {others.map((o) => (
              <Link key={o} href={`/heritage/${o}`} className="hs-more-card">
                <div className="hs-more-name">{SITES[o].name}</div>
                <div className="hs-more-sub mono">{SITES[o].state} · {SITES[o].from} CE</div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />

      <style>{`
        .hs { --hs-gold: #cc8900; --hs-maroon: #a06b00; background: #f3f2f2; color: #201e1d; max-width: 960px; margin: 0 auto; font-family: var(--font-ui); }
        .hs-top { display: flex; align-items: center; gap: 12px; padding: 11px var(--edge); border-bottom: 2px solid var(--line-strong); font: 500 12px var(--font-ui); flex-wrap: wrap; }
        .hs-crumb { color: var(--muted); }
        .hs-sep { color: #bab6b6; }
        .hs-src { margin-left: auto; font-size: 10px; letter-spacing: .12em; color: var(--gold-700); background: #ffe0d9; padding: 3px 8px; }
        .hs-read { padding: 30px var(--edge) 24px; }
        .hs-ruler { font-size: 10.5px; letter-spacing: .18em; text-transform: uppercase; color: var(--hs-maroon); margin-bottom: 8px; }
        .hs-h1 { font: 600 clamp(28px,5vw,40px)/1.05 var(--font-serif); margin: 0 0 10px; }
        .hs-lead { font: 400 14px/1.65 var(--font-ui); color: #444141; margin: 0; max-width: 640px; }
        .hs-facts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; margin-top: 20px; border-top: 2px solid var(--line-strong); }
        .hs-fact { padding: 12px 16px 0 0; border-right: 1px solid var(--line); }
        .hs-fact:last-child { border-right: 0; padding-left: 16px; }
        .hs-facts .hs-fact:nth-child(2) { padding-left: 16px; }
        .hs-fact-l { font-size: 9px; letter-spacing: .14em; color: var(--muted); }
        .hs-fact-v { font: 500 12.5px/1.4 var(--font-ui); margin-top: 4px; }
        .hs-plate { margin-top: 22px; background: #e8dcc0; border: 1.5px solid rgba(42,32,24,.5); background-image: radial-gradient(ellipse 90% 70% at 30% 20%, rgba(255,250,235,.5), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 85%, rgba(160,130,80,.14), transparent 65%); }
        .hs-plate-head { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 20px 8px; margin: 0 12px; border-bottom: 1.5px solid rgba(42,32,24,.55); }
        .hs-plate-t { font-size: 9px; letter-spacing: .16em; color: #7d7979; }
        .hs-plate-src { font-size: 9px; letter-spacing: .1em; color: #7d7979; }
        .hs-plate-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0; padding: 14px 8px; }
        .hs-dim { padding: 6px 12px; border-right: 1px solid rgba(42,32,24,.2); }
        .hs-dim:last-child { border-right: 0; }
        .hs-dim-v { font: 600 17px var(--font-mono); color: #201e1d; }
        .hs-dim-gap { font-size: 9px; color: var(--gold-700); border: 1px solid #bab6b6; padding: 0 4px; }
        .hs-dim-l { font-size: 9.5px; color: #605d5d; margin-top: 3px; }
        .hs-life { margin-top: 22px; }
        .hs-life-h { font-size: 9.5px; letter-spacing: .14em; color: var(--muted); margin-bottom: 8px; }
        .hs-life-bar { position: relative; height: 12px; background: var(--stone-2); border: 1px solid var(--line); }
        .hs-life-fill { position: absolute; top: 0; bottom: 0; background: var(--sky); }
        .hs-life-x { position: absolute; top: -3px; bottom: -3px; width: 2px; background: var(--hs-maroon); }
        .hs-life-x::after { content: '✕'; position: absolute; top: -14px; left: -4px; font-size: 10px; color: var(--hs-maroon); }
        .hs-life-labels { display: flex; justify-content: space-between; font-size: 9px; color: var(--muted); margin-top: 4px; }
        .hs-destroy { margin: 6px var(--edge) 0; border: 1px solid rgba(158,59,46,.4); border-left: 5px solid var(--hs-maroon); background: #ffe0d9; padding: 16px 20px; }
        .hs-destroy-gap { border-left-color: #bab6b6; }
        .hs-destroy-tag { font-size: 10px; letter-spacing: .14em; color: var(--muted); }
        .hs-destroy-actor { font: 600 16px var(--font-serif); color: var(--hs-maroon); margin: 6px 0 6px; }
        .hs-destroy-account { font: italic 400 14px/1.55 var(--font-italic); color: #201e1d; }
        .hs-cite { display: flex; gap: 12px; align-items: baseline; padding: 16px var(--edge); flex-wrap: wrap; }
        .hs-cite-l { font-size: 10px; letter-spacing: .12em; color: var(--gold-700); flex: none; }
        .hs-cite-v { font: 400 12px/1.5 var(--font-ui); color: #444141; }
        .hs-more { border-top: 2px solid var(--line-strong); padding: 18px var(--edge) 28px; }
        .hs-h { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: var(--muted); margin-bottom: 14px; }
        .hs-more-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 2px; background: var(--line); border: 2px solid var(--line-strong); }
        .hs-more-card { background: #f3f2f2; padding: 14px 16px; }
        .hs-more-card:hover { background: #ffe0d9; }
        .hs-more-name { font: 600 15px var(--font-serif); }
        .hs-more-sub { font-size: 10px; color: var(--muted); margin-top: 3px; }
        @media (max-width: 620px) { .hs-facts { grid-template-columns: 1fr; } .hs-fact { border-right: 0; border-bottom: 1px solid var(--line); padding: 12px 0 !important; } }
      `}</style>
    </>
  )
}
