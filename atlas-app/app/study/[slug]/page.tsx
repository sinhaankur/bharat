import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import { STUDIES, STUDY_SLUGS } from '@/lib/study'

// Study / edict shell — mockup 4b, the Gupta register: ivory ground, ruled margins,
// Fraunces display with Instrument Serif emphasis, a map band + a bordered edict
// callout + a floral divider.

export function generateStaticParams() {
  return STUDY_SLUGS.map((slug) => ({ slug }))
}
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const s = STUDIES[params.slug]
  if (!s) return { title: 'Study — Bharat' }
  return { title: `${s.title} ${s.titleEm} · Bharat`, description: s.lead.slice(0, 155) }
}

export default async function StudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const s = STUDIES[slug]
  if (!s) notFound()

  return (
    <>
      <SiteHeader />

      <main className="st">
        <div className="st-top">
          <svg width="17" height="17" style={{ color: 'var(--st-gold)' }} aria-hidden="true"><use href="#chakra" /></svg>
          <span className="st-brand">Bharat<span style={{ color: 'var(--st-gold)' }}>.</span></span>
          <span className="st-sec">{s.section}</span>
          <span className="st-src mono">{s.source}</span>
        </div>

        {/* ruled reading column */}
        <section className="st-read">
          {s.ruler && <div className="st-ruler mono">{s.ruler}</div>}
          <h1 className="st-h1">{s.title} <em className="st-em">{s.titleEm}</em></h1>
          <p className="st-lead" dangerouslySetInnerHTML={{ __html: s.lead.replace(/Ashoka’s own edicts|Brahmi/g, (m) => `<strong>${m}</strong>`) }} />
          <div className="st-stats">
            {s.stats.map((x, i) => (
              <div key={i} className="st-stat" style={{ borderRight: i < s.stats.length - 1 ? '1px solid var(--line)' : undefined }}>
                <div className="st-stat-v mono">{x.v}</div>
                <div className="st-stat-l">{x.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* map band */}
        <div className="st-map">
          <svg className="st-map-jali" aria-hidden="true"><rect width="100%" height="100%" fill="url(#jali)" /></svg>
          <div className="st-map-note mono">{s.mapNote}</div>
          {s.legend && (
            <div className="st-legend">
              {s.legend.map((l) => (
                <span key={l.label}><span className="st-dot" style={{ background: l.color }} />{l.label}</span>
              ))}
            </div>
          )}
        </div>

        {/* edict callout */}
        {s.callout && (
          <div className="st-callout">
            <div className="st-callout-tag mono">{s.callout.tag}</div>
            <div className="st-callout-figs">
              {s.callout.figures.map((f, i) => (
                <div key={i}><div className="st-fig-v mono">{f.v}</div><div className="st-fig-l">{f.l}</div></div>
              ))}
            </div>
            <div className="st-callout-q">{s.callout.quote}</div>
          </div>
        )}

        <svg className="st-floral" height="20" aria-hidden="true"><rect width="100%" height="20" fill="url(#floral)" /></svg>
      </main>

      <SiteFooter />

      <style>{`
        .st { --st-gold: #cc8900; --st-maroon: #a06b00; background: #f3f2f2; color: #201e1d; max-width: 960px; margin: 0 auto; font-family: var(--font-ui); }
        .st-top { display: flex; align-items: center; gap: 12px; padding: 11px var(--edge); border-bottom: 2px solid var(--line-strong); font: 500 12px var(--font-ui); flex-wrap: wrap; }
        .st-brand { font: 600 13px var(--font-serif); }
        .st-sec { color: var(--muted); }
        .st-src { margin-left: auto; font-size: 10px; letter-spacing: .12em; color: var(--gold-700); }
        .st-read { padding: 34px var(--edge) 26px; border-left: 2px solid var(--line-strong); border-right: 2px solid var(--line-strong); margin: 0 24px; }
        .st-ruler { font-size: 10.5px; letter-spacing: .18em; text-transform: uppercase; color: var(--st-maroon); margin-bottom: 8px; }
        .st-h1 { font: 600 clamp(28px,5vw,38px)/1.08 var(--font-serif); margin: 0 0 10px; }
        .st-em { font-family: var(--font-italic); color: #ec3013; font-weight: 400; }
        .st-lead { font: 400 14px/1.65 var(--font-ui); color: #444141; margin: 0; text-align: justify; max-width: 640px; }
        .st-stats { display: flex; flex-wrap: wrap; margin-top: 20px; border-top: 2px solid var(--line-strong); }
        .st-stat { padding: 12px 18px 0; }
        .st-stat:first-child { padding-left: 0; }
        .st-stat-v { font: 600 22px var(--font-mono); }
        .st-stat-l { font: 400 10.5px var(--font-ui); color: var(--muted); }
        .st-map { position: relative; margin: 20px 24px 0; height: 230px; background: #f8f4f4; border: 1px solid var(--line); display: flex; align-items: center; justify-content: center; }
        .st-map-jali { position: absolute; inset: 0; width: 100%; height: 100%; }
        .st-map-note { position: relative; font-size: 12px; letter-spacing: .12em; color: var(--muted); text-transform: uppercase; }
        .st-legend { position: absolute; bottom: 12px; left: 14px; display: flex; gap: 10px; flex-wrap: wrap; font: 500 10.5px var(--font-ui); color: #444141; }
        .st-dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 4px; }
        .st-callout { margin: 22px 24px; border: 1px solid rgba(158,59,46,.4); border-left: 5px solid var(--st-maroon); background: #ffe0d9; padding: 18px 22px; }
        .st-callout-tag { font-size: 10px; letter-spacing: .14em; color: var(--muted); }
        .st-callout-figs { display: flex; gap: 26px; margin: 10px 0 12px; flex-wrap: wrap; }
        .st-fig-v { font: 600 24px var(--font-mono); color: var(--st-maroon); }
        .st-fig-l { font: 400 10.5px var(--font-ui); color: var(--muted); }
        .st-callout-q { border-left: 3px solid rgba(42,32,24,.4); padding-left: 14px; font: italic 400 16px/1.55 var(--font-italic); color: #201e1d; }
        .st-floral { display: block; width: calc(100% - 48px); margin: 0 24px 18px; color: #bab6b6; }
        @media (max-width: 620px) { .st-read { margin: 0; border-left: 0; border-right: 0; } .st-map, .st-callout, .st-floral { margin-left: var(--edge); margin-right: var(--edge); } .st-floral { width: calc(100% - 2 * var(--edge)); } }
      `}</style>
    </>
  )
}
