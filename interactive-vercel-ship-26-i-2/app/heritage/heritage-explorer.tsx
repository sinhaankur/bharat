'use client'

// Heritage atlas — a native, sourced explorer over heritage-sites.json (137
// sacred sites of Bharat + the Silk Road + SE Asia). Filter by tradition;
// each card shows the builder, a lifespan bar, and the multi-actor destruction
// record. Sanatan/Jain/Buddhist etc. — multi-actor, not one-sided.
import { useMemo, useState } from 'react'
import data from './heritage-sites.json'

type Destruction = {
  primary?: { year: number; actor: string; actor_role?: string; account?: string; toll_note?: string }
  later?: { year: number; actor: string; actor_role?: string }[]
}
type Site = {
  id: string
  name: string
  tradition: string
  deity?: string
  region?: string
  state?: string
  builder?: string
  built_from?: number
  built_to?: number
  status: string
  lifespan_note?: string
  destruction?: Destruction
}

const SITES = (data.sites as Site[]).slice().sort((a, b) => (a.built_from ?? 0) - (b.built_from ?? 0))

const TRADITIONS: { id: string; label: string; color: string }[] = [
  { id: 'all', label: 'All', color: 'var(--accent)' },
  { id: 'sanatan', label: 'Sanatan', color: 'var(--accent)' },
  { id: 'buddhist', label: 'Buddhist', color: 'var(--ajanta-ochre, #c68a2e)' },
  { id: 'jain', label: 'Jain', color: 'var(--sage, #9aa084)' },
  { id: 'sikh', label: 'Sikh', color: 'var(--ajanta-lapis, #2a4a7a)' },
  { id: 'indus_valley', label: 'Indus Valley', color: 'var(--clay-soft, #c08a68)' },
  { id: 'contested', label: 'Contested', color: 'var(--ajanta-red, #9e3b2e)' },
]

const fmtYear = (y?: number) => (y == null ? '?' : y < 0 ? `${-y} BCE` : `${y} CE`)

// map a year range to a 0-100 bar over -3000..2026
const YMIN = -3000
const YMAX = 2026
const pct = (y: number) => Math.max(0, Math.min(100, ((y - YMIN) / (YMAX - YMIN)) * 100))

export default function HeritageExplorer() {
  const [trad, setTrad] = useState('all')
  const [open, setOpen] = useState<string | null>(null)

  const sites = useMemo(
    () => (trad === 'all' ? SITES : SITES.filter((s) => s.tradition === trad)),
    [trad],
  )
  const color = (t: string) => TRADITIONS.find((x) => x.id === t)?.color || 'var(--accent)'

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-14">
      {/* tradition filter */}
      <div className="mb-4 flex flex-wrap justify-center gap-2 stone-reveal">
        {TRADITIONS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTrad(t.id)}
            className={`rounded-[var(--radius)] border px-4 py-2 text-sm font-semibold transition-all ${
              trad === t.id ? 'border-transparent text-white' : 'border-border text-muted-foreground hover:border-[var(--accent)]'
            }`}
            style={trad === t.id ? { background: t.color } : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="mb-10 text-center text-sm text-muted-foreground">
        {sites.length} sites · built earliest first · click a site for its destruction record
      </p>

      {/* site list */}
      <div className="space-y-3">
        {sites.map((s) => {
          const c = color(s.tradition)
          const from = s.built_from ?? 0
          const to = s.built_to ?? from
          const isOpen = open === s.id
          const d = s.destruction
          return (
            <article
              key={s.id}
              className="stone-reveal overflow-hidden rounded-xl border border-border bg-card/70"
            >
              <button
                onClick={() => setOpen(isOpen ? null : s.id)}
                className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-background"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="font-bold text-foreground">{s.name}</h3>
                    <span className="text-xs uppercase tracking-wide" style={{ color: c }}>
                      {s.tradition.replace(/_/g, ' ')}
                    </span>
                    {s.deity && <span className="text-xs text-muted-foreground">{s.deity}</span>}
                    <span className="text-xs text-muted-foreground">
                      {s.region}{s.state ? ` · ${s.state}` : ''}
                    </span>
                  </div>
                  {/* lifespan bar */}
                  <div className="relative mt-2 h-2 w-full rounded-full bg-[var(--muted)]">
                    <div
                      className="absolute h-2 rounded-full"
                      style={{ left: `${pct(from)}%`, width: `${Math.max(1, pct(to) - pct(from))}%`, background: c, opacity: 0.7 }}
                    />
                    {d?.primary && (
                      <span
                        className="absolute -top-0.5 h-3 w-0.5 bg-[var(--ajanta-red,#9e3b2e)]"
                        style={{ left: `${pct(d.primary.year)}%` }}
                        title={`sacked ${fmtYear(d.primary.year)}`}
                      />
                    )}
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                    {fmtYear(from)} — {fmtYear(to)} · {s.status.replace(/_/g, ' ')}
                  </div>
                </div>
                <span className="shrink-0 text-[var(--muted-foreground)]">{isOpen ? '–' : '+'}</span>
              </button>

              {isOpen && (
                <div className="border-t border-border bg-background/60 p-4 text-sm">
                  {s.builder && (
                    <p className="mb-2 leading-relaxed">
                      <span className="font-semibold text-foreground">Builder: </span>
                      <span className="text-muted-foreground">{s.builder}</span>
                    </p>
                  )}
                  {s.lifespan_note && (
                    <p className="mb-3 leading-relaxed text-muted-foreground">{s.lifespan_note}</p>
                  )}
                  {d?.primary && (
                    <div className="rounded-lg border-l-2 border-[var(--ajanta-red,#9e3b2e)] bg-card/60 p-3">
                      <div className="font-semibold text-foreground">
                        Destroyed {fmtYear(d.primary.year)} — {d.primary.actor}
                        {d.primary.actor_role ? ` (${d.primary.actor_role})` : ''}
                      </div>
                      {d.primary.account && (
                        <p className="mt-1 leading-relaxed text-muted-foreground">{d.primary.account}</p>
                      )}
                      {d.primary.toll_note && (
                        <p className="mt-1 text-xs italic text-muted-foreground">{d.primary.toll_note}</p>
                      )}
                      {d.later && d.later.length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Later: {d.later.map((l) => `${fmtYear(l.year)} ${l.actor}`).join(' · ')}
                        </div>
                      )}
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
