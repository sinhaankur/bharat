import type { Metadata } from 'next'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import Icon from '@/components/icon'
import { classicHref } from '@/lib/links'

// Data & provenance shell — mockup 4e: the audit table, every figure → its citation
// with a tier tag (T1 PDF / T2 GOV / ⚠ T4 / GAP). Covers data/references/provenance/
// knowledge/library/sitemap/design-system/privacy.
export const metadata: Metadata = {
  title: 'Data & provenance — audit us, figure by figure · Bharat',
  description: 'Every figure in the atlas, traced to its citation, with a tier. A figure is cited or it is a declared gap — never fabricated.',
}

type Tier = { text: string; kind: 'T1' | 'T2' | 'T4' | 'GAP' }
type Fig = { figure: string; source: string; tier: Tier; italicFigure?: boolean; italicSource?: boolean }
const ROWS: Fig[] = [
  { figure: 'BMC budget ₹74,427 cr', source: 'Civic budget PDF', tier: { text: 'T1 · PDF', kind: 'T1' } },
  { figure: 'GCC revenue ₹5,146 cr', source: 'chennaicorporation.gov.in', tier: { text: 'T2 · GOV', kind: 'T2' } },
  { figure: 'Ludhiana MC ~₹900 cr', source: 'corroborated reporting', tier: { text: '⚠ T4', kind: 'T4' } },
  { figure: 'Kamrup civic budget', source: 'off public books', tier: { text: 'GAP', kind: 'GAP' }, italicFigure: true, italicSource: true },
]

const TIER_STYLE: Record<string, React.CSSProperties> = {
  T1: { background: '#ffe0d9', color: '#ae1800' },
  T2: { background: '#eae7e7', color: '#3a3630' },
  T4: { border: '1px solid #ec3013', color: '#ae1800' },
  GAP: { border: '1px solid #bab6b6', color: '#605d5d' },
}

export default function DataPage() {
  return (
    <>
      <SiteHeader />

      <main className="dt">
        <div className="dt-head">
          <div className="dt-kicker mono">Provenance ledger · every figure → its citation</div>
          <h1 className="dt-title">Audit us, figure by figure</h1>
        </div>

        <div className="dt-thead mono">
          <span>FIGURE</span><span>SOURCE</span><span>TIER</span>
        </div>
        {ROWS.map((r, i) => (
          <div key={i} className="dt-row" style={{ borderBottom: i < ROWS.length - 1 ? '1px solid #eae7e7' : undefined }}>
            <span style={r.italicFigure ? { color: '#605d5d' } : undefined}>{r.figure}</span>
            <span className="dt-src" style={r.italicSource ? { fontFamily: 'var(--font-italic)', fontStyle: 'italic' } : undefined}>{r.source}</span>
            <span className="dt-tier mono" style={TIER_STYLE[r.tier.kind]}>{r.tier.text}</span>
          </div>
        ))}

        <a href={classicHref('data')} className="dt-dl"><Icon name="edict" size={15} />Download the full ledger — JSON, MIT</a>
      </main>

      <SiteFooter />

      <style>{`
        .dt { background: #f3f2f2; color: #1a1917; max-width: 680px; margin: 0 auto; font-family: var(--font-ui); }
        .dt-head { padding: 20px var(--edge) 16px; border-bottom: 2px solid #262320; }
        .dt-kicker { font-size: 10px; letter-spacing: .16em; color: var(--gold-700); margin-bottom: 6px; }
        .dt-title { font: 600 22px var(--font-serif); margin: 0; }
        .dt-thead, .dt-row { display: grid; grid-template-columns: 1.6fr 1fr .7fr; gap: 10px; padding: 10px var(--edge); align-items: baseline; }
        .dt-thead { font: 600 9.5px var(--font-mono); letter-spacing: .12em; color: #605d5d; border-bottom: 2px solid #262320; }
        .dt-row { font: 400 12px var(--font-ui); }
        .dt-src { color: #605d5d; }
        .dt-tier { font-size: 10px; padding: 2px 7px; justify-self: start; }
        .dt-dl { display: flex; align-items: center; gap: 9px; padding: 12px var(--edge); border-top: 2px solid #262320; background: var(--gold); color: #fff; font: 600 12.5px var(--font-ui); }
        .dt-dl:hover { background: var(--gold-700); color: #fff; }
      `}</style>
    </>
  )
}
