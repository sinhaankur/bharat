'use client'

// Scripts of Bharat — the visible proof that language and script are separate
// trees: the SAME Sanskrit word (saṃskṛtam) written across a dozen scripts, all
// descended from Brahmi. Plus the Brahmi family tree. From scripts.json.
import { useState } from 'react'
import data from './scripts.json'

type Rendering = { script: string; family: string; font: string; text: string }
type Script = { id: string; name: string; status: string; period: string; branch: string; parent: string | null; note?: string; contested?: boolean }

const SPECIMEN = data.specimen as { word_meaning?: string; iast?: string; renderings: Rendering[] }
const SCRIPTS = data.scripts as Script[]

// group scripts by branch for the tree
const BRANCH_ORDER = ['pre-brahmi', 'root', 'sibling', 'north', 'south', 'southeast-asia', 'modern-purpose-built', 'constructed-link']
const BRANCH_LABEL: Record<string, string> = {
  'pre-brahmi': 'Before Brahmi',
  root: 'The root — Brahmi',
  sibling: 'Brahmi’s siblings',
  north: 'Northern branch',
  south: 'Southern branch',
  'southeast-asia': 'Into Southeast Asia',
  'modern-purpose-built': 'Modern & purpose-built',
  'constructed-link': 'Constructed link-scripts',
}

export default function ScriptsView() {
  const [tab, setTab] = useState<'specimen' | 'tree'>('specimen')

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      {/* tabs */}
      <div className="mb-10 flex justify-center gap-2 stone-reveal">
        {(['specimen', 'tree'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-[var(--radius)] border px-4 py-2 text-sm font-semibold transition-all ${
              tab === t
                ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]'
                : 'border-border text-muted-foreground hover:border-[var(--accent)]'
            }`}
          >
            {t === 'specimen' ? 'One word, many scripts' : 'The Brahmi tree'}
          </button>
        ))}
      </div>

      {tab === 'specimen' && (
        <div className="stone-reveal">
          <p className="mx-auto mb-8 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
            The same Sanskrit word — <em>saṃskṛtam</em>, “refined / put-together”, the name of the
            language itself — in a dozen scripts. Sanskrit has no script of its own; it borrows
            whichever local Brahmic hand is near. Same sounds, utterly different letters: proof that
            language and script are separate trees.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {SPECIMEN.renderings.map((r) => (
              <figure key={r.script} className="flex flex-col items-center rounded-xl border border-border bg-card/70 p-5 text-center">
                <span className={`f-${r.font} text-3xl text-foreground`}>{r.text}</span>
                <figcaption className="mt-3 text-xs font-semibold text-muted-foreground">{r.script}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}

      {tab === 'tree' && (
        <div className="space-y-8 stone-reveal">
          {BRANCH_ORDER.map((br) => {
            const list = SCRIPTS.filter((s) => s.branch === br)
            if (!list.length) return null
            return (
              <div key={br}>
                <h3 className="mb-3 flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-[var(--accent)]">
                  {BRANCH_LABEL[br] || br}
                  <span className="h-px flex-1 bg-border" />
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((s) => (
                    <div key={s.id} className="rounded-xl border border-border bg-card/70 p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{s.name}</span>
                        {s.contested && (
                          <span className="text-[10px] uppercase text-[var(--gupta-stone,#c8664a)]">contested</span>
                        )}
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                        {s.period}{s.parent ? ` · from ${s.parent}` : ''}
                      </div>
                      {s.note && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{s.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
