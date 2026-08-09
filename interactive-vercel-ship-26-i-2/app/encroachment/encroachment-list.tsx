'use client'

// Built where the water returns — documented cases of construction on land the
// water reclaims (floodplain / lakebed / wetland), each ruled on by NGT, a court
// or the CAG. From encroachment-cases.json. The user's favourite detail.
import { useMemo, useState } from 'react'
import data from './encroachment-cases.json'

type Case = {
  state: string
  district: string
  type: string
  water_body: string
  year: number
  detail: string
  order_ref?: string
  status: string
  source?: string
}

const CASES = (data.cases as Case[]).slice().sort((a, b) => b.year - a.year)
const STATES = ['All', ...Array.from(new Set(CASES.map((c) => c.state))).sort()]

export default function EncroachmentList() {
  const [state, setState] = useState('All')
  const cases = useMemo(() => (state === 'All' ? CASES : CASES.filter((c) => c.state === state)), [state])

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-14">
      {/* state filter */}
      <div className="mb-10 flex flex-wrap justify-center gap-2 stone-reveal">
        {STATES.map((s) => (
          <button
            key={s}
            onClick={() => setState(s)}
            className={`rounded-[var(--radius)] border px-3 py-1.5 text-sm font-semibold transition-all ${
              state === s
                ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]'
                : 'border-border text-muted-foreground hover:border-[var(--accent)]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {cases.map((c, i) => (
          <article
            key={i}
            className="stone-reveal rounded-xl border border-border bg-card/70 p-6"
          >
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-lg font-bold text-foreground">
                {c.water_body}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {c.district}, {c.state}
                </span>
              </h3>
              <span className="font-mono text-xs text-[var(--accent)]">{c.year}</span>
            </div>
            <div className="mb-3 inline-block rounded-[var(--radius)] bg-[var(--gupta-stone,#c8664a)]/12 px-2 py-0.5 text-xs font-medium text-[var(--gupta-stone,#c8664a)]">
              {c.type}
            </div>
            <p className="leading-relaxed text-muted-foreground">{c.detail}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-xs">
              <span className="font-semibold text-foreground">Status: {c.status}</span>
              {c.order_ref && <span className="text-muted-foreground">Ruling: {c.order_ref}</span>}
              {c.source && (
                <a href={c.source} target="_blank" rel="noopener" className="text-[var(--accent)] hover:underline">
                  Source ↗
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
