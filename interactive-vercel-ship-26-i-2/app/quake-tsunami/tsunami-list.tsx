'use client'

// Earthquake & tsunami — the great tsunamis that struck the Indian coast, with
// their source quake, run-up height, total vs India death toll and impact. From
// tsunamis.json. (The live USGS quake feed lives on the standalone atlas page.)
import data from './tsunamis.json'

type Tsunami = {
  id: string
  year: number
  date: string
  name: string
  source_quake_mw: number
  deaths_total: number
  deaths_india: number
  run_up_m: number
  india_impact: string
  note?: string
  source?: string
}

const TSUNAMIS = (data.tsunamis as Tsunami[]).slice().sort((a, b) => b.year - a.year)
const fmt = (n: number | null | undefined) =>
  n == null ? '—' : n.toLocaleString('en-IN')

export default function TsunamiList() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <div className="space-y-6">
        {TSUNAMIS.map((t) => (
          <article key={t.id} className="stone-reveal rounded-xl border border-border bg-card/70 p-6 md:p-8">
            <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-xl font-bold text-foreground">{t.name}</h3>
              <span className="font-mono text-sm text-[var(--accent)]">{t.date}</span>
            </div>

            {/* stat strip */}
            <div className="my-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['Source quake', t.source_quake_mw ? `M${t.source_quake_mw}` : '—'],
                ['Run-up', t.run_up_m ? `${t.run_up_m} m` : '—'],
                ['Deaths (total)', fmt(t.deaths_total)],
                ['Deaths (India)', fmt(t.deaths_india)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-border bg-background p-3">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">{k}</div>
                  <div className="mt-1 text-lg font-bold text-foreground">{v}</div>
                </div>
              ))}
            </div>

            <p className="leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">India impact: </span>
              {t.india_impact}
            </p>
            {t.note && <p className="mt-2 text-sm italic leading-relaxed text-muted-foreground">{t.note}</p>}
            {t.source && (
              <a href={t.source} target="_blank" rel="noopener" className="mt-2 inline-block text-xs text-[var(--accent)] hover:underline">
                Source ↗
              </a>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
