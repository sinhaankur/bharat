import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'

// Engines hub — mockup 1c "Temple Interior": dark maroon register, gilded spinning
// chakra, the seven lenses in a bordered grid with gold-leaf accents.

export const metadata: Metadata = {
  title: 'The Engines — seven lenses, one country · Bharat',
  description: 'Each engine reads the same India through one lens — the land, the law, the money, the record. They compose; they invent nothing.',
}

const ENGINES: { n: string; name: string; body: string }[] = [
  { n: '00 · ORIGIN', name: 'Survey', body: 'The Great Trigonometrical Survey — mapped to tax; turned toward accountability.' },
  { n: '01', name: 'Country', body: 'How India is constituted — Union, State, UT, local; who answers to whom.' },
  { n: '02', name: 'Development', body: 'Money in → what it was for → what got built.' },
  { n: '03', name: 'Climate', body: 'Flood, monsoon and low-lying exposure over the real open DEM.' },
  { n: '04', name: 'Land-Zoning', body: 'What can legally be built here — CRZ, encroachment, cadastral.' },
  { n: '05', name: 'Corruption', body: 'Established findings only — CAG paras, court-ordered arrears. Facts, never accusations.' },
  { n: '06', name: 'News', body: 'The moderated, attributed feed — every story pinned to place.' },
]

export default function EnginesPage() {
  return (
    <>
      <SiteHeader />

      <main className="engines">
        <section className="eng-hero">
          <svg className="eng-jali" aria-hidden="true"><rect width="100%" height="100%" fill="url(#jali)" /></svg>
          <div className="eng-hero-in">
            <svg className="eng-chakra" width="72" height="72" aria-hidden="true"><use href="#chakra" /></svg>
            <div>
              <div className="eng-kicker mono">Seven lenses · one country</div>
              <h1 className="eng-title">The Engines</h1>
              <p className="eng-dek">
                Each engine reads the same India through one lens — the land, the law, the money, the record.
                They compose; they invent nothing.
              </p>
            </div>
          </div>
        </section>

        <div className="eng-grid">
          {ENGINES.map((e) => (
            <div key={e.name} className="eng-cell">
              <div className="eng-n mono">{e.n}</div>
              <div className="eng-name">{e.name}</div>
              <div className="eng-body">{e.body}</div>
            </div>
          ))}
          <Link href="/engines/revenue" className="eng-cell eng-cell-cta">
            <div className="eng-quote">&ldquo;Break India into pixels of money + chain of command.&rdquo;</div>
            <div className="eng-all">Open the state ledger →</div>
          </Link>
        </div>

        <div className="eng-strip mono">
          <svg width="14" height="14" style={{ color: 'var(--engine-gold)' }} aria-hidden="true"><use href="#chakra" /></svg>
          <span>Dark temple-interior register — maroon ground · gold-leaf accents · polish edge highlight</span>
        </div>
      </main>

      <SiteFooter />

      <style>{`
        /* engines runs its own dark register regardless of the reader theme */
        .engines { --engine-gold: #c9a227; background: #1c1210; color: #efe3cc; max-width: var(--wrap); margin: 0 auto; }
        .eng-hero { position: relative; padding: 40px var(--edge) 30px; border-bottom: 1px solid rgba(201,162,39,.3); }
        .eng-jali { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; opacity: .5; }
        .eng-hero-in { position: relative; display: flex; align-items: flex-start; gap: 26px; }
        .eng-chakra { color: var(--engine-gold); flex: none; animation: chakra-spin 40s linear infinite; }
        @keyframes chakra-spin { to { transform: rotate(360deg); } }
        .eng-kicker { font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: var(--engine-gold); margin-bottom: 10px; }
        .eng-title { font: 600 clamp(30px,5vw,42px)/1.05 var(--font-serif); margin: 0 0 10px; color: #efe3cc; }
        .eng-dek { font: 400 15px/1.55 var(--font-ui); color: rgba(239,227,204,.65); margin: 0; max-width: 560px; }
        .eng-grid { display: grid; grid-template-columns: repeat(4, 1fr); }
        .eng-cell { padding: 22px 22px 18px; border-right: 1px solid rgba(201,162,39,.22); border-bottom: 1px solid rgba(201,162,39,.22); position: relative; transition: background .15s; }
        .eng-cell:hover { background: #301818; }
        .eng-cell:nth-child(4n) { border-right: 0; }
        .eng-n { font-size: 10px; color: var(--engine-gold); letter-spacing: .16em; }
        .eng-name { font: 600 20px var(--font-serif); margin: 8px 0 6px; }
        .eng-body { font: 400 12.5px/1.5 var(--font-ui); color: rgba(239,227,204,.6); }
        .eng-cell-cta { background: #301818; display: flex; flex-direction: column; justify-content: flex-end; }
        .eng-quote { font: italic 400 16px/1.45 var(--font-italic); color: var(--engine-gold); }
        .eng-all { font: 600 12px var(--font-ui); margin-top: 12px; color: #efe3cc; }
        .eng-strip { display: flex; align-items: center; gap: 14px; padding: 12px var(--edge); border-top: 1px solid rgba(201,162,39,.3); font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; color: rgba(239,227,204,.5); }
        @media (max-width: 900px) { .eng-grid { grid-template-columns: repeat(2, 1fr); } .eng-cell:nth-child(4n) { border-right: 1px solid rgba(201,162,39,.22); } .eng-cell:nth-child(2n) { border-right: 0; } }
        @media (max-width: 560px) { .eng-grid { grid-template-columns: 1fr; } .eng-cell { border-right: 0 !important; } .eng-hero-in { flex-direction: column; gap: 16px; } }
      `}</style>
    </>
  )
}
