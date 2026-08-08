'use client'

import { useMemo } from 'react'

type Event = {
  id: string
  title: string
  year_label: string
  sort_year: number
  region: string
  kind: string
  consensus: string
  components?: string[]
  finding: string
  interpretation?: string
  contested?: boolean
  note_on_violence?: string
  rebuttal?: string
  source?: { label: string; url: string }
  atlas_link?: string
}
type Data = { _meta: any; events: Event[] }

// colour per ancestry component (substring match) — echoes the atlas's DNA page
const ANC: [string, string][] = [
  ['Neanderthal', 'oklch(0.6 0.12 30)'],
  ['Homo sapiens', 'oklch(0.75 0.1 90)'],
  ['AASI', 'oklch(0.55 0.15 25)'],
  ['Ancestral South', 'oklch(0.6 0.14 25)'],
  ['Iranian', 'oklch(0.62 0.12 140)'],
  ['Steppe', 'oklch(0.55 0.14 285)'],
  ['Yamnaya', 'oklch(0.55 0.14 285)'],
  ['Ancestral North', 'oklch(0.58 0.12 260)'],
  ['IVC', 'oklch(0.62 0.12 200)'],
]
const colorFor = (label: string) => ANC.find(([k]) => label.includes(k))?.[1] || 'oklch(0.55 0.05 0)'

export default function DnaTimeline({ data }: { data: Data }) {
  const events = useMemo(() => [...data.events].sort((a, b) => a.sort_year - b.sort_year), [data.events])

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <header>
        <div className="text-[11px] font-bold uppercase tracking-widest text-accent">
          Deep history · ancient DNA · peer-reviewed
        </div>
        <h1 className="mt-2 font-serif text-3xl font-black leading-tight md:text-5xl">
          The population shifts written in <em className="italic">DNA</em>
        </h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Ancient DNA now reads the turnovers that remade the subcontinent — who arrived, who blended, who was
          replaced. Held strictly to the science; a <b>finding</b> (established) is kept apart from an{' '}
          <b>interpretation</b> (often contested). The “Aryan migration” debate is shown where it belongs.
        </p>
      </header>

      {/* ancestry legend */}
      <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1 rounded border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
        <span className="font-mono uppercase tracking-wide text-foreground">Ancestry:</span>
        {['AASI', 'Iranian', 'Steppe', 'Neanderthal', 'IVC'].map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <i className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: colorFor(k) }} />
            {k}
          </span>
        ))}
      </div>

      {/* timeline */}
      <div className="relative mt-8 pl-6">
        <div
          className="absolute bottom-2 left-[7px] top-2 w-[2px]"
          style={{ background: 'linear-gradient(180deg, oklch(0.5 0.12 285), oklch(0.55 0.14 40))' }}
        />
        {events.map((ev) => (
          <div key={ev.id} className="relative mb-7">
            <span
              className="absolute -left-6 top-1.5 h-3 w-3 rounded-full border-2 border-background"
              style={{ background: ev.contested ? 'oklch(0.72 0.03 300)' : 'oklch(0.7 0.14 285)' }}
            />
            <div className={`rounded border p-4 ${ev.contested ? 'border-[oklch(0.5_0.06_300)] bg-secondary' : 'border-border bg-card'}`}>
              <div className="font-mono text-[10px] uppercase tracking-wide text-accent">{ev.year_label}</div>
              <h3 className="mt-0.5 text-lg font-bold">{ev.title}</h3>
              <div className="font-mono text-[10px] uppercase text-muted-foreground">{ev.region}</div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase text-white ${
                    ev.consensus === 'established' ? 'bg-[oklch(0.48_0.15_150)]' : 'bg-[oklch(0.55_0.14_80)]'
                  }`}
                >
                  {ev.consensus}
                </span>
                <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[9px] uppercase text-muted-foreground">
                  {(ev.kind || '').replace(/_/g, ' ')}
                </span>
              </div>

              {/* ancestry bar */}
              {ev.components && ev.components.length > 0 && (
                <>
                  <div className="mt-3 flex h-2.5 overflow-hidden rounded-full border border-border">
                    {ev.components.map((c) => (
                      <span key={c} className="flex-1" style={{ background: colorFor(c) }} />
                    ))}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                    {ev.components.map((c) => (
                      <span key={c} className="inline-flex items-center gap-1">
                        <i className="inline-block h-2 w-2 rounded-sm" style={{ background: colorFor(c) }} />
                        {c}
                      </span>
                    ))}
                  </div>
                </>
              )}

              <p className="mt-2 text-sm leading-relaxed">{ev.finding}</p>
              {ev.interpretation && (
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  <b className="text-[oklch(0.48_0.1_285)]">Reading it:</b> {ev.interpretation}
                </p>
              )}
              {ev.note_on_violence && (
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">⚖️ {ev.note_on_violence}</p>
              )}
              {ev.contested && ev.rebuttal && (
                <p className="mt-2 rounded border-l-2 border-accent bg-secondary p-2 text-[13px] leading-relaxed">
                  <b>Where the honest line is:</b> {ev.rebuttal}
                </p>
              )}
              {ev.source?.url && (
                <div className="mt-2 border-t border-dashed border-border pt-2">
                  <a href={ev.source.url} target="_blank" rel="noopener" className="font-mono text-[11px] text-accent hover:underline">
                    📄 {ev.source.label}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
