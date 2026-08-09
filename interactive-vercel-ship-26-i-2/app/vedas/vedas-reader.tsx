'use client'

// The Hymn of Creation (Nāsadīya Sūkta, Ṛgveda 10.129) — a reverent reader.
// For each verse: the original Devanagari, a sound-for-sound IAST romanisation,
// an optional word-by-word grammar gloss, and Griffith's English. Toggle layers.
import { useState } from 'react'
import data from './vedas.json'

type Gloss = { w: string; lit: string; note?: string }
type Verse = {
  n: number
  devanagari: string
  iast: string
  brahmi?: string
  gloss?: Gloss[]
  translations: Record<string, string>
}

const TEXT = data.text as { title: string; ref: string; date: string; language_of_origin: string }
const VERSES = data.verses as Verse[]

export default function VedasReader() {
  const [showIast, setShowIast] = useState(true)
  const [showGloss, setShowGloss] = useState(false)
  const [openGloss, setOpenGloss] = useState<number | null>(null)

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      {/* controls */}
      <div className="mb-10 flex flex-wrap items-center justify-center gap-2 stone-reveal">
        <Toggle on={showIast} onClick={() => setShowIast((v) => !v)}>Romanisation</Toggle>
        <Toggle on={showGloss} onClick={() => setShowGloss((v) => !v)}>Word gloss</Toggle>
      </div>

      <div className="space-y-10">
        {VERSES.map((v) => (
          <article
            key={v.n}
            className="stone-reveal rounded-xl border border-border bg-card/70 p-6 md:p-8"
          >
            <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-[var(--accent)]">
              Verse {v.n}
            </div>

            {/* original Devanagari */}
            <p className="f-devanagari whitespace-pre-line text-2xl leading-relaxed text-foreground">
              {v.devanagari}
            </p>

            {/* IAST */}
            {showIast && (
              <p className="mt-4 whitespace-pre-line border-l-2 border-[var(--accent)]/40 pl-4 text-sm italic leading-relaxed text-muted-foreground">
                {v.iast}
              </p>
            )}

            {/* word gloss */}
            {showGloss && v.gloss && (
              <div className="mt-4 flex flex-wrap gap-2">
                {v.gloss.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => setOpenGloss(openGloss === v.n * 100 + i ? null : v.n * 100 + i)}
                    className="group relative rounded-[var(--radius)] border border-border bg-background px-2.5 py-1 text-left text-xs transition-colors hover:border-[var(--accent)]"
                  >
                    <span className="f-devanagari font-semibold text-foreground">{g.w}</span>
                    <span className="ml-1.5 text-muted-foreground">{g.lit}</span>
                    {openGloss === v.n * 100 + i && g.note && (
                      <span className="absolute left-0 top-full z-10 mt-1 block w-56 rounded-lg border border-border bg-popover p-2 text-[11px] leading-relaxed text-muted-foreground shadow-lg">
                        {g.note}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* English */}
            <p className="mt-5 leading-relaxed text-foreground/90">
              {v.translations['en-griffith']}
            </p>
          </article>
        ))}
      </div>

      {/* the famous last-verse note */}
      <div className="mt-12 rounded-2xl border-l-4 border-[var(--accent)] bg-card/50 p-6 stone-reveal">
        <p className="leading-relaxed text-muted-foreground">
          The hymn ends not in certainty but in doubt — “Whence all creation had its origin… whether He
          formed it all or did not form it, He who surveys it from the highest heaven, He knows — or
          perhaps He knows not.” One of the oldest expressions of philosophical scepticism in any
          language, composed <strong>{TEXT.date}</strong>.
        </p>
      </div>
    </div>
  )
}

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-[var(--radius)] border px-4 py-2 text-sm font-semibold transition-all ${
        on
          ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]'
          : 'border-border text-muted-foreground hover:border-[var(--accent)]'
      }`}
    >
      {children}
    </button>
  )
}
