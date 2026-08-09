'use client'

// Geopolitical Chess — "the dollar is the board." 15 world players, each with
// its ruling power, its pieces (with sourced facts), and its move. Plus the
// timeline of moves that set the board. From geopolitics.json. Framing labelled.
import { useMemo, useState } from 'react'
import data from './geopolitics.json'

type Fact = { text: string; source?: string; as_of?: string }
type Piece = { label: string; note?: string; facts?: Fact[] }
type Player = {
  slug: string
  name: string
  flag: string
  type: string
  side: string
  role: string
  tagline: string
  politics?: { ruling?: string; orientation?: string }
  interest?: string
  pieces?: Piece[]
  move?: string
}
type Move = { date: string; actor: string; title: string; text: string; kind?: string; framing?: boolean }

const PLAYERS = data.players as Player[]
const MOVES = (data.moves as Move[]) || []
const SIDES: { id: string; label: string }[] = [
  { id: 'all', label: 'All players' },
  { id: 'us-bloc', label: 'US bloc' },
  { id: 'china-bloc', label: 'China bloc' },
  { id: 'non-aligned', label: 'Non-aligned' },
  { id: 'resource', label: 'Resource' },
  { id: 'junction', label: 'Junction' },
]

export default function GeopoliticsBoard() {
  const [side, setSide] = useState('all')
  const [open, setOpen] = useState<string | null>(null)
  const players = useMemo(
    () => (side === 'all' ? PLAYERS : PLAYERS.filter((p) => p.side === side)),
    [side],
  )

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      {/* framing banner */}
      <div className="mb-8 rounded-xl border-l-4 border-[var(--accent)] bg-card/60 p-4 text-sm text-muted-foreground stone-reveal">
        <strong className="text-foreground">Framing.</strong> This is a deliberate lens — “the dollar
        is the board.” The facts on each piece are sourced; the framing is ours.
      </div>

      {/* side filter */}
      <div className="mb-10 flex flex-wrap justify-center gap-2 stone-reveal">
        {SIDES.map((s) => (
          <button
            key={s.id}
            onClick={() => setSide(s.id)}
            className={`rounded-[var(--radius)] border px-3 py-1.5 text-sm font-semibold transition-all ${
              side === s.id
                ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]'
                : 'border-border text-muted-foreground hover:border-[var(--accent)]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* players */}
      <div className="grid gap-4 md:grid-cols-2">
        {players.map((p) => {
          const isOpen = open === p.slug
          return (
            <article key={p.slug} className="stone-reveal overflow-hidden rounded-xl border border-border bg-card/70">
              <button
                onClick={() => setOpen(isOpen ? null : p.slug)}
                className="flex w-full items-start gap-3 p-5 text-left transition-colors hover:bg-background"
              >
                <span className="text-2xl leading-none" aria-hidden="true">{p.flag}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{p.name}</span>
                    <span className="rounded-[var(--radius)] bg-[var(--accent)]/12 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--accent)]">
                      {p.role}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm italic text-muted-foreground">{p.tagline}</span>
                </span>
                <span className="shrink-0 text-muted-foreground">{isOpen ? '–' : '+'}</span>
              </button>

              {isOpen && (
                <div className="border-t border-border bg-background/50 p-5 text-sm">
                  {p.politics?.ruling && (
                    <p className="mb-3 leading-relaxed">
                      <span className="font-semibold text-foreground">Ruling: </span>
                      <span className="text-muted-foreground">{p.politics.ruling}</span>
                    </p>
                  )}
                  {p.interest && (
                    <p className="mb-3 leading-relaxed">
                      <span className="font-semibold text-foreground">Interest: </span>
                      <span className="text-muted-foreground">{p.interest}</span>
                    </p>
                  )}
                  {p.pieces && p.pieces.length > 0 && (
                    <div className="space-y-2">
                      {p.pieces.map((pc, i) => (
                        <div key={i} className="rounded-lg border border-border bg-card/60 p-3">
                          <div className="font-semibold text-foreground">{pc.label}</div>
                          {pc.note && <div className="mt-0.5 text-muted-foreground">{pc.note}</div>}
                          {pc.facts?.map((f, j) => (
                            <div key={j} className="mt-1 font-mono text-[11px] text-[var(--accent)]">
                              {f.text}
                              {f.as_of && <span className="text-muted-foreground"> ({f.as_of})</span>}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                  {p.move && (
                    <p className="mt-3 border-t border-border pt-3 leading-relaxed text-muted-foreground">
                      <span className="font-semibold text-foreground">Its move: </span>{p.move}
                    </p>
                  )}
                </div>
              )}
            </article>
          )
        })}
      </div>

      {/* the moves timeline */}
      {MOVES.length > 0 && (
        <section className="mt-16 stone-reveal">
          <h2 className="bharati mb-6 text-2xl font-black tracking-tight">The moves that set the board</h2>
          <ol className="relative space-y-5 border-l-2 border-[var(--accent)]/40 pl-6">
            {MOVES.map((m, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-[var(--accent)] bg-background">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                </span>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-mono text-sm font-bold text-[var(--accent)]">{m.date}</span>
                  <span className="font-semibold text-foreground">{m.title}</span>
                  {m.framing && (
                    <span className="rounded-[var(--radius)] border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-muted-foreground">
                      framing
                    </span>
                  )}
                </div>
                <p className="mt-1 leading-relaxed text-muted-foreground">{m.text}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}
