'use client'

// India vs the world — GDP, income and industry, from the World Bank indicators.
// India is highlighted; sort by any measure. From global-indicators.json.
import { useMemo, useState } from 'react'
import data from './global-indicators.json'

type Country = {
  iso3: string
  name: string
  gdp_usd?: number
  gni_per_capita?: number
  population?: number
  industry_pct?: number
  agri_pct?: number
}

const COUNTRIES = (data.countries as Country[]).filter((c) => c.gdp_usd)
type Metric = { key: keyof Country; label: string; fmt: (n: number) => string }
const METRICS: Metric[] = [
  { key: 'gdp_usd', label: 'GDP (US$)', fmt: (n) => '$' + (n / 1e12).toFixed(2) + 'T' },
  { key: 'gni_per_capita', label: 'GNI / person', fmt: (n) => '$' + n.toLocaleString('en-IN') },
  { key: 'population', label: 'Population', fmt: (n) => (n / 1e6).toFixed(1) + 'M' },
  { key: 'industry_pct', label: 'Industry % of GDP', fmt: (n) => n.toFixed(1) + '%' },
]

export default function GlobalCompare() {
  const [metric, setMetric] = useState<Metric>(METRICS[0])
  const rows = useMemo(() => {
    const list = COUNTRIES.filter((c) => c[metric.key] != null)
    list.sort((a, b) => (b[metric.key] as number) - (a[metric.key] as number))
    return list.slice(0, 30)
  }, [metric])
  const max = rows.length ? (rows[0][metric.key] as number) : 1
  const indiaRank = useMemo(() => {
    const all = COUNTRIES.filter((c) => c[metric.key] != null).sort(
      (a, b) => (b[metric.key] as number) - (a[metric.key] as number),
    )
    return all.findIndex((c) => c.iso3 === 'IND') + 1
  }, [metric])

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      {/* metric switch */}
      <div className="mb-6 flex flex-wrap justify-center gap-2 stone-reveal">
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setMetric(m)}
            className={`rounded-[var(--radius)] border px-3 py-1.5 text-sm font-semibold transition-all ${
              metric.key === m.key
                ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]'
                : 'border-border text-muted-foreground hover:border-[var(--accent)]'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      {indiaRank > 0 && (
        <p className="mb-8 text-center text-sm text-muted-foreground">
          India ranks <span className="font-bold text-[var(--accent)]">#{indiaRank}</span> in the world by {metric.label.toLowerCase()} · top 30 shown
        </p>
      )}

      <div className="space-y-1.5">
        {rows.map((c, i) => {
          const india = c.iso3 === 'IND'
          const val = c[metric.key] as number
          const w = Math.max(2, (val / max) * 100)
          return (
            <div key={c.iso3} className="stone-reveal flex items-center gap-3">
              <div className="w-6 shrink-0 text-right font-mono text-[10px] text-muted-foreground">{i + 1}</div>
              <div className="min-w-0 flex-1">
                <div className="relative h-7 overflow-hidden rounded-[var(--radius)] bg-[var(--muted)]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-[var(--radius)]"
                    style={{ width: `${w}%`, background: india ? 'var(--accent)' : 'var(--muted-foreground)', opacity: india ? 0.9 : 0.3 }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-2.5">
                    <span className={`truncate text-xs ${india ? 'font-bold text-foreground' : 'font-medium text-foreground/80'}`}>{c.name}</span>
                    <span className="shrink-0 pl-2 font-mono text-[10px] text-foreground/70">{metric.fmt(val)}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
