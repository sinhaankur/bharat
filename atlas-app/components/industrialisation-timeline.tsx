import Icon from '@/components/icon'
import { INDUSTRIALISATION, ERA_LABEL, ERA_COLOR, type Era } from '@/lib/industrialisation'

// The era-coded industrialisation timeline (mockup 7b) — a vertical spine whose
// gradient tracks the eras, era-coloured nodes, and per-event tier tags. Rendered as
// a section inside the district ledger (house register). Returns null if the district
// has no industrial record yet.
const TIER_TAG: Record<string, { bg?: string; fg: string; border?: string }> = {
  T1: { bg: '#ffe0d9', fg: '#ae1800' },
  T2: { bg: '#eae7e7', fg: '#3a3630' },
  T3: { bg: '#ffe0d9', fg: '#ae1800' },
  gap: { fg: '#605d5d', border: '1px solid #bab6b6' },
}

export default function IndustrialisationTimeline({ slug }: { slug: string }) {
  const data = INDUSTRIALISATION[slug]
  if (!data) return null

  // build the spine gradient from the era sequence
  const eras = data.events.map((e) => e.era)
  const stops: string[] = []
  eras.forEach((era, i) => {
    const a = (i / eras.length) * 100
    const b = ((i + 1) / eras.length) * 100
    stops.push(`${ERA_COLOR[era]} ${a}% ${b}%`)
  })
  const spine = `linear-gradient(${stops.join(',')})`
  const usedEras = Array.from(new Set(eras)) as Era[]

  return (
    <section className="it">
      <div className="it-head">
        <div className="it-kicker mono">MUNGER · BIHAR — INDUSTRIAL HERITAGE</div>
        <div className="it-title">{data.title}</div>
      </div>

      {/* era legend */}
      <div className="it-legend">
        {usedEras.map((era) => (
          <span key={era} className="it-leg"><span className="it-leg-dot" style={{ background: ERA_COLOR[era] }} />{ERA_LABEL[era]}</span>
        ))}
      </div>

      {/* the spine */}
      <div className="it-body">
        <div className="it-spine" style={{ background: spine }} />
        {data.events.map((e, i) => {
          const tag = TIER_TAG[e.tier]
          return (
            <div key={i} className="it-event">
              <span className="it-node" style={{ background: ERA_COLOR[e.era] }} />
              <div className="it-date mono" style={{ color: ERA_COLOR[e.era] }}>{e.date}</div>
              <div className="it-event-t">{e.title}</div>
              <div className="it-event-b">
                {e.body}{' '}
                <span className="it-tier mono" style={{ background: tag.bg, color: tag.fg, border: tag.border }}>
                  {e.tier === 'gap' ? 'GAP — plant-level ₹' : `${e.tier}${e.src ? ' · ' + e.src.toUpperCase() : ''}`}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="it-note"><Icon name="coin" size={13} className="it-note-ic" />{data.note}</div>

      <style>{`
        .it { border-top: 1px solid #d7d3d3; margin-top: 8px; }
        .it-head { padding: 18px var(--edge) 14px; border-bottom: 1px solid #d7d3d3; }
        .it-kicker { font-size: 10px; letter-spacing: .16em; color: var(--gold-700); }
        .it-title { font: 600 20px var(--font-serif); margin-top: 3px; }
        .it-legend { display: flex; gap: 14px; flex-wrap: wrap; padding: 16px var(--edge) 4px; }
        .it-leg { display: flex; align-items: center; gap: 5px; font: 600 9.5px var(--font-mono); letter-spacing: .1em; }
        .it-leg-dot { width: 10px; height: 10px; }
        .it-body { position: relative; padding: 8px var(--edge) 8px calc(var(--edge) + 26px); }
        .it-spine { position: absolute; left: calc(var(--edge) + 8px); top: 12px; bottom: 12px; width: 3px; }
        .it-event { position: relative; padding-bottom: 16px; }
        .it-event:last-child { padding-bottom: 4px; }
        .it-node { position: absolute; left: -24px; top: 3px; width: 13px; height: 13px; border-radius: 50%; border: 2.5px solid #f3f2f2; }
        .it-date { font: 600 11px var(--font-mono); }
        .it-event-t { font: 600 14.5px var(--font-serif); }
        .it-event-b { font: 400 12px/1.5 var(--font-ui); color: #605d5d; }
        .it-tier { font-size: 9.5px; padding: 1px 6px; white-space: nowrap; }
        .it-note { display: flex; align-items: center; gap: 12px; padding: 12px var(--edge); border-top: 1px solid #d7d3d3; font: 400 11px var(--font-ui); color: #605d5d; }
        .it-note-ic { color: var(--gold); flex: none; }
      `}</style>
    </section>
  )
}
