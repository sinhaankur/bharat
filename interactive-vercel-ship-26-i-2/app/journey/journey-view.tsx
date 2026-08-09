'use client'

// The journey of a word — one meaning ('mother') traced across time and tongues,
// from Proto-Indo-European to the living languages. A scrolly narrative over
// steps.json (extracted from the original journey page).
import data from './steps.json'

type Stage = { big: string; translit?: string; gloss?: string; fam: string; famL?: string }
type Step = { era: string; stage: Stage; h: string; p: string }

const STEPS = data.steps as Step[]

const FAM_COLOR: Record<string, string> = {
  ia: 'var(--accent)',
  dr: 'var(--gupta-stone, #c8664a)',
  dead: 'var(--muted-foreground)',
  both: 'var(--ajanta-green, #4f6b45)',
}

export default function JourneyView() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <ol className="relative space-y-10 border-l-2 border-[var(--accent)]/30 pl-6 md:pl-10">
        {STEPS.map((s, i) => {
          const color = FAM_COLOR[s.stage.fam] || 'var(--accent)'
          return (
            <li key={i} className="stone-reveal relative">
              <span
                className="absolute -left-[35px] flex h-5 w-5 items-center justify-center rounded-full border-2 bg-background md:-left-[47px]"
                style={{ borderColor: color }}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: color }} />
              </span>

              <div className="mb-3 font-mono text-[11px] uppercase tracking-widest text-[var(--muted-foreground)]">
                {s.era}
              </div>

              {/* the word, large */}
              <div className="mb-3 rounded-xl border border-border bg-card/70 p-6 text-center">
                <div className="text-4xl font-black text-foreground md:text-5xl" style={{ color }}>
                  {s.stage.big}
                </div>
                {s.stage.translit && (
                  <div className="mt-1 text-sm italic text-muted-foreground">{s.stage.translit}</div>
                )}
                {s.stage.famL && (
                  <div className="mt-2 text-xs uppercase tracking-wide" style={{ color }}>
                    {s.stage.famL}
                  </div>
                )}
                {s.stage.gloss && (
                  <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                    {s.stage.gloss}
                  </p>
                )}
              </div>

              <h3 className="bharati text-xl font-black tracking-tight text-foreground">{s.h}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{s.p}</p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
