'use client'

// STAT BAND + the dark "chain of command" section — straight from the approved
// Atlas Mockups. A row of headline numbers on stone, then a maroon temple-interior
// band that states the thesis with a gold CTA.
import Link from 'next/link'
import Icon from '@/components/indic/icon'

const STATS: [string, string][] = [
  ['594', 'districts, per-district'],
  ['36', 'states & union territories'],
  ['7', 'engines over one dataset'],
  ['100%', 'figures sourced, or a gap'],
]

export default function StatBand() {
  return (
    <>
      {/* the number band on stone */}
      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px md:grid-cols-4">
          {STATS.map(([n, label], i) => (
            <div
              key={i}
              className="stone-reveal flex flex-col items-center border-border px-4 py-10 text-center md:[&:not(:last-child)]:border-r"
              style={{ transitionDelay: `${i * 70}ms` }}
            >
              <div className="text-5xl font-black tracking-tight text-foreground">{n}</div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* the dark "chain of command" thesis band (temple interior + gold) */}
      <section className="cine-vignette relative overflow-hidden bg-[#1c1210] text-[var(--ajanta-ivory,#efe3cc)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{ background: 'radial-gradient(70% 120% at 20% 0%, color-mix(in srgb, var(--accent) 30%, transparent), transparent 60%)' }}
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-16 md:flex-row md:items-center md:justify-between">
          <h2 className="bharati max-w-2xl text-3xl font-black leading-tight tracking-tight md:text-4xl">
            We trace public money to the <span className="text-[var(--accent)]">rupee</span> — and the
            chain of command behind it.
          </h2>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href="/map"
              className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-[var(--accent)] px-6 py-3 text-sm font-bold uppercase tracking-widest text-[var(--accent-foreground)] transition-transform hover:scale-[1.03]"
            >
              <Icon name="coin" size={16} /> Open the map
            </Link>
            <Link
              href="/provenance"
              className="inline-flex items-center gap-2 rounded-[var(--radius)] border border-[var(--accent)]/40 px-6 py-3 text-sm font-bold uppercase tracking-widest text-[var(--ajanta-ivory,#efe3cc)] transition-colors hover:border-[var(--accent)]"
            >
              How we source it
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
