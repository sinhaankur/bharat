'use client'

// State of India — who carries the country. Each state with its population,
// finance-commission share, and an honest pros/cons read. From india-fiscal.json.
import { useMemo, useState } from 'react'
import data from './india-fiscal.json'

type State = {
  capital: string
  region: string
  pop_cr?: number
  fc15_share?: number
  gsdp?: number
  pros?: string[]
  cons?: string[]
}

const STATES = Object.entries(data.states as Record<string, State>)
  .map(([name, s]) => ({ name, ...s }))
  .sort((a, b) => (b.fc15_share || 0) - (a.fc15_share || 0))

const REGIONS = ['All', ...Array.from(new Set(STATES.map((s) => s.region)))]

export default function StatesView() {
  const [region, setRegion] = useState('All')
  const [open, setOpen] = useState<string | null>(null)
  const states = useMemo(
    () => (region === 'All' ? STATES : STATES.filter((s) => s.region === region)),
    [region],
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <div className="mb-10 flex flex-wrap justify-center gap-2 stone-reveal">
        {REGIONS.map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            className={`rounded-[var(--radius)] border px-3 py-1.5 text-sm font-semibold transition-all ${
              region === r
                ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]'
                : 'border-border text-muted-foreground hover:border-[var(--accent)]'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {states.map((s) => {
          const isOpen = open === s.name
          return (
            <article key={s.name} className="stone-reveal overflow-hidden rounded-xl border border-border bg-card/70">
              <button
                onClick={() => setOpen(isOpen ? null : s.name)}
                className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-background"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <h3 className="font-bold text-foreground">{s.name}</h3>
                    <span className="text-xs text-muted-foreground">{s.capital} · {s.region}</span>
                  </div>
                  <div className="mt-1 flex gap-4 font-mono text-[10px] text-muted-foreground">
                    {s.pop_cr != null && <span>{s.pop_cr} cr people</span>}
                    {s.fc15_share != null && <span>{s.fc15_share}% of the FC-15 pool</span>}
                  </div>
                </div>
                <span className="shrink-0 text-muted-foreground">{isOpen ? '–' : '+'}</span>
              </button>

              {isOpen && (
                <div className="grid gap-4 border-t border-border bg-background/50 p-5 text-sm sm:grid-cols-2">
                  {s.pros && s.pros.length > 0 && (
                    <div>
                      <div className="mb-2 font-semibold text-[var(--ajanta-green,#4f6b45)]">Strengths</div>
                      <ul className="space-y-1.5">
                        {s.pros.map((p, i) => (
                          <li key={i} className="leading-relaxed text-muted-foreground">· {p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {s.cons && s.cons.length > 0 && (
                    <div>
                      <div className="mb-2 font-semibold text-[var(--gupta-stone,#c8664a)]">Strains</div>
                      <ul className="space-y-1.5">
                        {s.cons.map((c, i) => (
                          <li key={i} className="leading-relaxed text-muted-foreground">· {c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
