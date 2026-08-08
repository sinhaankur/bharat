'use client'

import { useMemo, useState } from 'react'

type Evidence = {
  tier: string
  confidence: string
  recorded_by: string
  shaped_by: string
  how: string
}
type Facet = {
  text: string
  detail?: string
  level?: string
  link?: string
  contested?: boolean
  evidence?: Evidence
}
type Era = {
  id: string
  name: string
  when: string
  sort: number
  family: string
  contested?: boolean
  language?: Facet
  script?: Facet
  people?: Facet
  rulers?: Facet
  heritage?: Facet
  events?: string[]
  links?: { label: string; href: string }[]
}
type Data = {
  _meta: any
  families: Record<string, { label: string; color: string }>
  eras: Era[]
}

const FACETS = [
  { key: 'language', icon: '🗣', label: 'Language' },
  { key: 'script', icon: '🔤', label: 'Script' },
  { key: 'people', icon: '🧬', label: 'People (DNA)' },
  { key: 'rulers', icon: '👑', label: 'Rulers' },
  { key: 'heritage', icon: '🏛', label: 'Heritage' },
] as const
type FacetKey = (typeof FACETS)[number]['key']

const TIER_RANK: Record<string, number> = {
  primary: 1,
  'peer-reviewed': 1,
  'contemporary-text': 2,
  'later-text': 3,
  reference: 3,
  inference: 3,
}
const tierClass = (t: string) =>
  ({ 1: 'bg-[oklch(0.5_0.13_150)]', 2: 'bg-[oklch(0.55_0.13_75)]', 3: 'bg-[oklch(0.55_0.15_45)]' } as Record<
    number,
    string
  >)[TIER_RANK[t] || 3]

export default function AncientTimeline({ data }: { data: Data }) {
  const [shown, setShown] = useState<Set<FacetKey>>(new Set(FACETS.map((f) => f.key)))
  const [open, setOpen] = useState<string | null>(null) // `${eraId}:${facetKey}`

  const eras = useMemo(() => [...data.eras].sort((a, b) => a.sort - b.sort), [data.eras])
  const famColor = (id: string) => data.families[id]?.color || 'var(--accent)'
  const famLabel = (id: string) => data.families[id]?.label || id
  const tierLabel = (t: string) => data._meta.interrogation?.tiers?.[t]?.label || t

  const toggle = (k: FacetKey) => {
    const next = new Set(shown)
    next.has(k) ? next.delete(k) : next.add(k)
    if (next.size === 0) next.add(k)
    setShown(next)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
      <header>
        <div className="text-[11px] font-bold uppercase tracking-widest text-accent">
          Ancient India · one timeline · sourced
        </div>
        <h1 className="mt-2 font-serif text-3xl font-black leading-tight md:text-5xl">
          Ancient India, on <em className="italic">one spine</em>
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
          Five thousand years, read five ways at once. For each era, see the <b>language</b> spoken, the{' '}
          <b>script</b> it was written in, the <b>people</b> (from ancient DNA), the <b>rulers</b>, and the{' '}
          <b>heritage</b> they left. Every fact is open to interrogation — click “how do we know?”.
        </p>
      </header>

      {/* facet toggles */}
      <div className="mt-6 flex flex-wrap gap-2">
        <span className="self-center font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
          Read by facet:
        </span>
        {FACETS.map((f) => {
          const on = shown.has(f.key)
          return (
            <button
              key={f.key}
              onClick={() => toggle(f.key)}
              aria-pressed={on}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                on
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-card text-muted-foreground'
              }`}
            >
              {f.icon} {f.label}
            </button>
          )
        })}
      </div>

      {/* evidence legend */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 rounded border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
        <span className="font-mono uppercase tracking-wide text-foreground">Evidence (strong → weak):</span>
        {Object.keys(data._meta.interrogation?.tiers || {}).map((t) => (
          <span key={t} className="inline-flex items-center gap-1.5">
            <i className={`inline-block h-2.5 w-2.5 rounded-sm ${tierClass(t)}`} />
            {tierLabel(t)}
          </span>
        ))}
      </div>

      {/* the timeline */}
      <div className="relative mt-8 pl-8">
        <div
          className="absolute bottom-2 left-[9px] top-2 w-[3px] rounded"
          style={{ background: 'linear-gradient(180deg,oklch(0.58 0.14 25),oklch(0.55 0.08 300),oklch(0.6 0.14 285))' }}
        />
        {eras.map((era) => (
          <div key={era.id} className="relative mb-8">
            <span
              className="absolute -left-8 top-1.5 h-5 w-5 rounded-full border-[3px] border-background"
              style={{ background: famColor(era.family), boxShadow: '0 0 0 1px var(--border)' }}
            />
            <div className="overflow-hidden rounded border border-border bg-card shadow-sm">
              <div className="border-l-4 px-5 py-4" style={{ borderColor: famColor(era.family) }}>
                <div className="font-mono text-[11px] uppercase tracking-wide text-accent">{era.when}</div>
                <div className="mt-0.5 text-xl font-bold">
                  {era.name}
                  {era.contested && (
                    <span className="ml-2 rounded-full border border-[oklch(0.6_0.13_45)] px-2 py-0.5 align-middle font-mono text-[10px] uppercase text-[oklch(0.5_0.14_45)]">
                      contested points
                    </span>
                  )}
                </div>
                <span
                  className="mt-1 inline-block rounded-full px-2 py-0.5 font-mono text-[10px] uppercase text-white"
                  style={{ background: famColor(era.family) }}
                >
                  {famLabel(era.family)}
                </span>
              </div>

              {/* facet grid */}
              <div className="grid grid-cols-1 gap-px border-t border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
                {FACETS.filter((f) => shown.has(f.key)).map((f) => {
                  const facet = era[f.key] as Facet | undefined
                  if (!facet) return null
                  const key = `${era.id}:${f.key}`
                  const isOpen = open === key
                  const ev = facet.evidence
                  return (
                    <div key={f.key} className="bg-card px-4 py-3">
                      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                        <span>{f.icon}</span>
                        {f.label}
                        {facet.contested && <span className="text-[oklch(0.55_0.14_45)]">⚠</span>}
                        {facet.level && (
                          <span className="ml-auto rounded-full border border-border px-1.5 text-[9px] normal-case">
                            {facet.level}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-[15px] font-semibold leading-snug">{facet.text}</div>
                      {facet.detail && (
                        <div className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{facet.detail}</div>
                      )}
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        {facet.link && (
                          <a href={facet.link} className="font-mono text-[11px] text-accent hover:underline">
                            explore →
                          </a>
                        )}
                        {ev && (
                          <>
                            <span
                              className={`rounded-full px-1.5 py-0.5 font-mono text-[9px] uppercase text-white ${tierClass(
                                ev.tier
                              )}`}
                            >
                              {tierLabel(ev.tier)}
                            </span>
                            <button
                              onClick={() => setOpen(isOpen ? null : key)}
                              className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-accent hover:border-accent"
                            >
                              how do we know? →
                            </button>
                          </>
                        )}
                      </div>
                      {ev && isOpen && (
                        <div className="mt-3 rounded border-l-2 border-accent bg-secondary p-3 text-[13px] leading-relaxed">
                          <div className="mb-1 flex flex-wrap gap-2 font-mono text-[10px] uppercase text-muted-foreground">
                            <span>
                              evidence: <b className="text-foreground">{tierLabel(ev.tier)}</b>
                            </span>
                            <span>
                              confidence: <b className="text-foreground">{ev.confidence}</b>
                            </span>
                          </div>
                          <p className="mt-1">
                            <span className="font-mono text-[10px] uppercase text-accent">Recorded by</span>
                            <br />
                            {ev.recorded_by}
                          </p>
                          <p className="mt-2">
                            <span className="font-mono text-[10px] uppercase text-[oklch(0.55_0.14_45)]">
                              Shaped by (the winner’s-history check)
                            </span>
                            <br />
                            {ev.shaped_by}
                          </p>
                          <p className="mt-2 rounded border border-border bg-card p-2">{ev.how}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* events + links */}
              <div className="border-t border-border bg-secondary/40 px-5 py-3">
                <div className="flex flex-wrap gap-2">
                  {(era.events || []).map((ev) => (
                    <span key={ev} className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-muted-foreground">
                      {ev}
                    </span>
                  ))}
                </div>
                {era.links && era.links.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    {era.links.map((l) => (
                      <a key={l.href} href={l.href} className="font-mono text-[11px] text-accent hover:underline">
                        {l.label} →
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
