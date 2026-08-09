'use client'

// Ashoka's rule of the land — WHERE the edicts stand. 25 sites from Afghanistan
// to Karnataka, carved on rock, pillar and cave, in Brahmi, Kharoshthi, Greek
// and Aramaic. The reach of one ruler's conscience. From ashoka-edicts.json.
import { useMemo, useState } from 'react'
import data from './ashoka-edicts.json'

type Site = {
  id: string
  name: string
  region: string
  modern?: string
  type: string
  scripts?: string[]
  edge?: boolean
  note?: string
}

const SITES = data.sites as Site[]
const TYPES: { id: string; label: string }[] = [
  { id: 'all', label: 'All sites' },
  { id: 'rock', label: 'Rock edicts' },
  { id: 'minor-rock', label: 'Minor rock' },
  { id: 'pillar', label: 'Pillars' },
  { id: 'cave', label: 'Caves' },
]

const SCRIPT_COLOR: Record<string, string> = {
  brahmi: 'var(--accent)',
  kharoshthi: 'var(--gupta-stone, #c8664a)',
  greek: 'var(--ajanta-lapis, #2a4a7a)',
  aramaic: 'var(--ajanta-green, #4f6b45)',
}

export default function AshokaSites() {
  const [type, setType] = useState('all')
  const sites = useMemo(() => (type === 'all' ? SITES : SITES.filter((s) => s.type === type)), [type])

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      {/* the reach line */}
      <div className="mb-8 rounded-xl border-l-4 border-[var(--accent)] bg-card/60 p-4 text-sm text-muted-foreground stone-reveal">
        From <strong className="text-foreground">Kandahar</strong> in Afghanistan to{' '}
        <strong className="text-foreground">Karnataka</strong> in the south — {SITES.length} places where
        Ashoka had his conscience carved into stone, in four scripts.
      </div>

      {/* type filter */}
      <div className="mb-10 flex flex-wrap justify-center gap-2 stone-reveal">
        {TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setType(t.id)}
            className={`rounded-[var(--radius)] border px-3 py-1.5 text-sm font-semibold transition-all ${
              type === t.id
                ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]'
                : 'border-border text-muted-foreground hover:border-[var(--accent)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {sites.map((s) => (
          <article key={s.id} className="stone-reveal rounded-xl border border-border bg-card/70 p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-bold text-foreground">
                {s.name}
                {s.edge && <span className="ml-2 text-[10px] uppercase tracking-wide text-[var(--accent)]">frontier</span>}
              </h3>
              <span className="text-xs text-muted-foreground">{s.region}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-[var(--radius)] bg-[var(--muted)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                {s.type}
              </span>
              {s.scripts?.map((sc) => (
                <span
                  key={sc}
                  className="rounded-[var(--radius)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white"
                  style={{ background: SCRIPT_COLOR[sc] || 'var(--muted-foreground)' }}
                >
                  {sc}
                </span>
              ))}
            </div>
            {s.note && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.note}</p>}
          </article>
        ))}
      </div>
    </div>
  )
}
