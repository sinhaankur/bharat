'use client'

// ─────────────────────────────────────────────────────────────────────────
// ATLAS MAP — a single navigable map of everything we've built. Grouped into
// four "chambers" of the atlas; each destination is a card with an Indic motif,
// a live-or-gap status, and intuitive micro-animation (hover lift + tilt +
// ornament glow). This IS the site navigation, made a place.
// ─────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import Chakra from '@/components/indic/chakra'
import { Lotus } from '@/components/indic/lotus'
import TempleOrnament from '@/components/indic/ornament'

type Dest = {
  href: string
  title: string
  blurb: string
  status?: 'live' | 'building'
}
type Chamber = { key: string; label: string; note: string; items: Dest[] }

const CHAMBERS: Chamber[] = [
  {
    key: 'news',
    label: 'The Newsroom',
    note: 'What is happening — read against the numbers.',
    items: [
      { href: '/news', title: 'News, bias & sentiment', blurb: 'Live India headlines with media-lean, tone and a legal-safe read.', status: 'live' },
      { href: '/news', title: 'The Lawyer Engine', blurb: 'Every claim wrapped in careful, defamation-safe language.', status: 'live' },
    ],
  },
  {
    key: 'land',
    label: 'The Land',
    note: 'Where things are — money, rivers, risk, mapped.',
    items: [
      { href: '/map', title: 'The interactive map', blurb: 'India by district — money flow, risk and the shape of the land.', status: 'live' },
      { href: '/deep-history', title: 'Deep history', blurb: 'Ancient-DNA population shifts across the subcontinent.', status: 'live' },
    ],
  },
  {
    key: 'roots',
    label: 'The Roots',
    note: 'Where we come from — empire, edicts, scripts.',
    items: [
      { href: '/pataliputra', title: 'The god-gifted city', blurb: 'Pataliputra — how travellers and the spade proved the Mauryan wonder.', status: 'live' },
      { href: '/edicts', title: 'The Edicts of Ashoka', blurb: 'The empire in his own words — Kalinga’s remorse, conquest by Dhamma.', status: 'live' },
      { href: '/ancient-india', title: 'Ancient India', blurb: 'A six-era timeline spine — language, script, rulers, heritage.', status: 'live' },
    ],
  },
  {
    key: 'craft',
    label: 'The Craft',
    note: 'How it is made — the Indian design system itself.',
    items: [
      { href: '/mauryan', title: 'Mauryan design language', blurb: 'The full system: palette, motifs, Blender ornaments, atomic kit.', status: 'live' },
      { href: '/components', title: 'The component gallery', blurb: 'Every atom, molecule and organism, living and documented.', status: 'live' },
    ],
  },
]

function motifFor(i: number) {
  switch (i % 3) {
    case 0:
      return <Chakra size={30} color="var(--accent)" />
    case 1:
      return <Lotus size={30} color="var(--accent)" />
    default:
      return <TempleOrnament name="rosette" width={30} />
  }
}

export default function AtlasMap() {
  return (
    <section id="explore" className="theme-ashoka relative bg-background py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center stone-reveal">
          <div className="mb-3 flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
            <span className="h-px w-8 bg-[var(--accent)]" />
            The atlas, mapped
            <span className="h-px w-8 bg-[var(--accent)]" />
          </div>
          <h2 className="bharati text-4xl font-black tracking-tight md:text-5xl">
            Four chambers, one house
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Everything we have built, gathered under one roof — the newsroom, the land,
            the roots, and the craft that binds them.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {CHAMBERS.map((ch, ci) => (
            <div
              key={ch.key}
              className="stone-reveal rounded-xl border border-border bg-card/60 p-6 backdrop-blur-sm"
              style={{ transitionDelay: `${ci * 80}ms` }}
            >
              <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-border pb-3">
                <h3 className="text-lg font-bold text-foreground">{ch.label}</h3>
                <span className="text-xs text-muted-foreground">{ch.note}</span>
              </div>

              <div className="grid gap-3">
                {ch.items.map((d, i) => (
                  <Link
                    key={d.title}
                    href={d.href}
                    className="lift group relative flex items-start gap-4 rounded-lg border border-transparent p-3 transition-all duration-300 hover:border-border hover:bg-background"
                  >
                    <span className="mt-0.5 shrink-0 transition-transform duration-500 group-hover:rotate-[24deg]">
                      {motifFor(i + ci)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="font-semibold text-foreground group-hover:text-[var(--accent)]">
                          {d.title}
                        </span>
                        {d.status === 'live' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)]/12 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--accent)]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" style={{ animation: 'livePulse 2s infinite' }} />
                            live
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">
                        {d.blurb}
                      </span>
                    </span>
                    <span className="mt-1 shrink-0 text-[var(--muted-foreground)] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[var(--accent)]">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
