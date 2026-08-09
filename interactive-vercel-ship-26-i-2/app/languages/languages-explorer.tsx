'use client'

// Languages of Bharat — an interactive native view over the sourced scripts.json
// (5 families, 19 languages, 24 scripts). Filter by family; each language shows
// the script it's written in, in its OWN self-hosted font (.f-* classes).
import { useMemo, useState } from 'react'
import data from './scripts.json'

type Family = { id: string; label: string; parent_family: string; note: string }
type Language = {
  id: string
  name: string
  family: string
  status: string
  period: string
  note: string
  written_in: string[]
}
type Script = { id: string; name: string; status: string; period: string; note: string; contested?: boolean }

const FAMILIES = data.families as Family[]
const LANGUAGES = data.languages as Language[]
const SCRIPTS = data.scripts as Script[]

// map a language/script id → the self-hosted font class where we have one
const FONT: Record<string, string> = {
  hindi: 'f-devanagari', sanskrit: 'f-devanagari', marathi: 'f-devanagari', nepali: 'f-devanagari',
  bengali: 'f-bengali', assamese: 'f-bengali',
  tamil: 'f-tamil', telugu: 'f-telugu', kannada: 'f-kannada', malayalam: 'f-malayalam',
  gujarati: 'f-gujarati', punjabi: 'f-gurmukhi', odia: 'f-odia',
}
// a specimen glyph per language (the "Bha"-like letter, or the name's first akshara)
const GLYPH: Record<string, string> = {
  hindi: 'अ', sanskrit: 'ॐ', marathi: 'म', nepali: 'न', bengali: 'অ', assamese: 'অ',
  tamil: 'அ', telugu: 'అ', kannada: 'ಅ', malayalam: 'അ', gujarati: 'અ', punjabi: 'ੴ', odia: 'ଅ',
}

const FAMILY_COLOR: Record<string, string> = {
  'indo-aryan': 'var(--accent)',
  dravidian: 'var(--gupta-stone, #c8664a)',
  austroasiatic: 'var(--sage, #9aa084)',
  'tibeto-burman': 'var(--ajanta-lapis, #2a4a7a)',
  constructed: 'var(--dusty-rose, #b07f7a)',
}

export default function LanguagesExplorer() {
  const [family, setFamily] = useState<string>('all')

  const langs = useMemo(
    () => (family === 'all' ? LANGUAGES : LANGUAGES.filter((l) => l.family === family)),
    [family],
  )

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-14">
      {/* family filter */}
      <div className="mb-10 flex flex-wrap justify-center gap-2 stone-reveal">
        <button
          onClick={() => setFamily('all')}
          className={`rounded-[var(--radius)] border px-4 py-2 text-sm font-semibold transition-all ${
            family === 'all'
              ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]'
              : 'border-border text-muted-foreground hover:border-[var(--accent)]'
          }`}
        >
          All families
        </button>
        {FAMILIES.map((f) => (
          <button
            key={f.id}
            onClick={() => setFamily(f.id)}
            className={`rounded-[var(--radius)] border px-4 py-2 text-sm font-semibold transition-all ${
              family === f.id
                ? 'border-transparent text-white'
                : 'border-border text-muted-foreground hover:border-[var(--accent)]'
            }`}
            style={family === f.id ? { background: FAMILY_COLOR[f.id] || 'var(--accent)' } : undefined}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* family note */}
      {family !== 'all' && (
        <p className="mx-auto mb-8 max-w-2xl text-center leading-relaxed text-muted-foreground">
          {FAMILIES.find((f) => f.id === family)?.note}
        </p>
      )}

      {/* language cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {langs.map((l) => {
          const font = FONT[l.id]
          const glyph = GLYPH[l.id]
          const color = FAMILY_COLOR[l.family] || 'var(--accent)'
          return (
            <article
              key={l.id}
              className="stone-reveal lift flex flex-col rounded-xl border border-border bg-card/70 p-5"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{l.name}</h3>
                  <div className="mt-0.5 text-xs uppercase tracking-wide" style={{ color }}>
                    {FAMILIES.find((f) => f.id === l.family)?.label || l.family}
                  </div>
                </div>
                {glyph && (
                  <span
                    className={`shrink-0 text-4xl leading-none ${font || ''}`}
                    style={{ color }}
                    aria-hidden="true"
                  >
                    {glyph}
                  </span>
                )}
              </div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">
                {l.period} · {l.status}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{l.note}</p>
            </article>
          )
        })}
      </div>

      {/* scripts strip */}
      <div className="mt-16 stone-reveal">
        <h2 className="bharati mb-6 text-2xl font-black tracking-tight">
          The scripts they are written in
        </h2>
        <div className="flex flex-wrap gap-2">
          {SCRIPTS.map((s) => (
            <span
              key={s.id}
              title={s.note}
              className="rounded-full border border-border bg-card/60 px-3 py-1.5 text-sm text-foreground transition-colors hover:border-[var(--accent)]"
            >
              {s.name}
              {s.contested && <span className="ml-1 text-[var(--gupta-stone,#c8664a)]" title="contested">·contested</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
