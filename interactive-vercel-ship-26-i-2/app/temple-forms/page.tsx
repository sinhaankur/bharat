import type { Metadata } from 'next'
import PageShell from '@/components/page-shell'
import SurveyPlate from '@/components/indic/survey-plate'
import TempleOrnament from '@/components/indic/ornament'

export const metadata: Metadata = {
  title: 'Temple forms — measured survey plates — Bharat',
  description:
    'The forms of the Indian temple, drawn as measured survey plates — the Nagara shikhara, its latina curve, ribbed amalaka and kalasha. Sourced dimensions, drawn in the system.',
}

const PARTS: [string, string][] = [
  ['Adhisthana', 'The moulded plinth — stacked courses that lift the whole temple off the ground.'],
  ['Jangha', 'The wall zone, carrying the devakoshtha niches where the deities stand.'],
  ['Shikhara', 'The tower — the latina curve rising over the sanctum, w = W(1−t)^1.35.'],
  ['Amalaka', 'The ribbed stone disc near the summit, named for the myrobalan fruit.'],
  ['Kalasha', 'The pot-finial that crowns it all — the point where stone meets sky.'],
]

export default function TempleFormsPage() {
  return (
    <PageShell
      eyebrow="Heritage · measured elevation"
      title="The temple, drawn to scale"
      intro="The Indian temple is a diagram in stone. Here it is drawn the way a surveyor would — course by course, dimension by dimension, from the plinth to the pot that crowns the tower."
    >
      <div className="mx-auto max-w-4xl px-4 py-14">
        {/* the survey plate */}
        <div className="stone-reveal">
          <SurveyPlate />
        </div>

        {/* the anatomy, bottom to top */}
        <section className="mt-16 stone-reveal">
          <h2 className="bharati mb-6 text-2xl font-black tracking-tight">From the plinth to the sky</h2>
          <ol className="space-y-3 border-l-2 border-[var(--accent)]/40 pl-6">
            {PARTS.map(([name, desc], i) => (
              <li key={name} className="relative">
                <span className="absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-[var(--accent)] bg-background">
                  <span className="font-mono text-[8px] text-[var(--accent)]">{PARTS.length - i}</span>
                </span>
                <div className="font-bold text-foreground">{name}</div>
                <p className="mt-0.5 leading-relaxed text-muted-foreground">{desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* the built form, in the round */}
        <section className="mt-16 grid items-center gap-8 rounded-xl border border-border bg-card/60 p-6 md:grid-cols-[1fr_auto] md:p-8 stone-reveal">
          <div>
            <h2 className="bharati mb-2 text-2xl font-black tracking-tight">And in the round</h2>
            <p className="leading-relaxed text-muted-foreground">
              The survey plate is one elevation. The same form, rendered as carved stone in Blender,
              shows what the drawing measures — the shikhara as it stands against the light.
            </p>
          </div>
          <div className="mx-auto" aria-hidden="true">
            <TempleOrnament name="shikhara" width={160} />
          </div>
        </section>

        <section className="mt-10 border-t border-border pt-6">
          <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-[var(--muted-foreground)]">Sources</h3>
          <p className="text-sm text-muted-foreground">
            · Dimensions after ASI survey records; the drawing is constructed in our own system, not
            traced from a facsimile. Kandariya Mahādeva, Khajuraho, c. 1030 CE.
          </p>
        </section>
      </div>
    </PageShell>
  )
}
