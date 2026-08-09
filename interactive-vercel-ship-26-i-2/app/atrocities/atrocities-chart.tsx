'use client'

// "Population Control, Marauder Style" (after Matthew White) — the 100 deadliest
// episodes of mass death in history, ranked by toll. India-related events are
// highlighted. From atrocities.json.
import { useMemo, useState } from 'react'
import data from './atrocities.json'

type Event = {
  rank: number
  name: string
  year_start: number
  year_end: number
  deaths_millions: number
  category: string
  location: string
}

const EVENTS = (data.events as Event[]).slice().sort((a, b) => b.deaths_millions - a.deaths_millions)
const MAX = Math.max(...EVENTS.map((e) => e.deaths_millions))
const INDIA = /India|Mughal|Delhi|Bengal|Sepoy|Nader|Timur|Ghazni|Aurangzeb|Partition|Maratha/i

const CAT_LABEL: Record<string, string> = {
  international_war: 'War (international)',
  despot: 'Despot',
  institutional_oppression: 'Oppression',
  failed_state: 'Failed state',
  colonial_war: 'Colonial',
  civil_war: 'Civil war',
}

const fmtYear = (y: number) => (y < 0 ? `${-y} BCE` : `${y} CE`)

export default function AtrocitiesChart() {
  const [onlyIndia, setOnlyIndia] = useState(false)
  const rows = useMemo(
    () => (onlyIndia ? EVENTS.filter((e) => INDIA.test(e.name + e.location)) : EVENTS),
    [onlyIndia],
  )

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 stone-reveal">
        <p className="text-sm text-muted-foreground">
          {rows.length} events · ranked by estimated death toll (millions). India-linked in gold.
        </p>
        <button
          onClick={() => setOnlyIndia((v) => !v)}
          className={`rounded-[var(--radius)] border px-4 py-2 text-sm font-semibold transition-all ${
            onlyIndia
              ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]'
              : 'border-border text-muted-foreground hover:border-[var(--accent)]'
          }`}
        >
          {onlyIndia ? 'Show all' : 'India-linked only'}
        </button>
      </div>

      <div className="space-y-1.5">
        {rows.map((e) => {
          const india = INDIA.test(e.name + e.location)
          const w = Math.max(2, (e.deaths_millions / MAX) * 100)
          return (
            <div key={e.rank} className="stone-reveal group flex items-center gap-3">
              <div className="w-8 shrink-0 text-right font-mono text-[10px] text-muted-foreground">
                {e.rank}
              </div>
              <div className="min-w-0 flex-1">
                <div className="relative h-7 overflow-hidden rounded-[var(--radius)] bg-[var(--muted)]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-[var(--radius)] transition-all"
                    style={{
                      width: `${w}%`,
                      background: india ? 'var(--accent)' : 'var(--muted-foreground)',
                      opacity: india ? 0.9 : 0.35,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-2.5">
                    <span className="truncate text-xs font-semibold text-foreground">{e.name}</span>
                    <span className="shrink-0 pl-2 font-mono text-[10px] text-foreground/70">
                      {e.deaths_millions}M
                    </span>
                  </div>
                </div>
                <div className="mt-0.5 flex gap-3 pl-2.5 font-mono text-[9px] uppercase tracking-wide text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  <span>{fmtYear(e.year_start)}</span>
                  <span>{CAT_LABEL[e.category] || e.category}</span>
                  <span>{e.location}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
