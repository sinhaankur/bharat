'use client'

// ─────────────────────────────────────────────────────────────────────────
// BHARAT HERO — the front door. A single, calm, glowing masthead that gathers
// everything: the wide Mandala centre-of-focus, the living भ logo, the floral
// glow backdrop, Blender-rendered stone ornaments flanking, and parallax depth.
// Intuitive: a "scroll to explore" cue that gently bobs.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'
import Mandala from '@/components/indic/mandala'
import FloralGlow from '@/components/indic/floral-glow'
import TempleOrnament from '@/components/indic/ornament'
import { BharatMark } from '@/components/indic/bharat-logo'
import Chakra from '@/components/indic/chakra'
import CineTitle from '@/components/indic/cine-title'
import MandalaButton from '@/components/indic/mandala-button'

export default function BharatHero() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const el = ref.current
        if (!el) return
        const y = window.scrollY
        el.style.setProperty('--sy', String(y))
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <header
      ref={ref}
      className="theme-ashoka relative flex min-h-[88vh] items-center justify-center overflow-hidden border-b-2 border-[var(--border)] bg-background"
      style={{ ['--sy' as string]: 0 }}
    >
      {/* glowing floral Mauryan backdrop */}
      <FloralGlow intensity={1.1} />

      {/* wide mandala — the centre of focus, drifts slightly up on scroll */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{ transform: 'translateY(calc(var(--sy) * -0.06px))' }}
        aria-hidden="true"
      >
        <Mandala
          size={1000}
          opacity={0.12}
          accent="var(--accent)"
          ink="var(--muted-foreground)"
          className="w-[135vw] max-w-none md:w-[1150px]"
        />
      </div>

      {/* flanking Blender stone ornaments (hidden on small screens), gentle parallax */}
      <div
        className="pointer-events-none absolute bottom-8 left-[3%] hidden opacity-70 lg:block"
        style={{ transform: 'translateY(calc(var(--sy) * 0.05px))' }}
        aria-hidden="true"
      >
        <TempleOrnament name="kalasha" width={130} />
      </div>
      <div
        className="pointer-events-none absolute bottom-8 right-[3%] hidden opacity-70 lg:block"
        style={{ transform: 'translateY(calc(var(--sy) * 0.08px))' }}
        aria-hidden="true"
      >
        <TempleOrnament name="torana" width={130} />
      </div>

      {/* the content */}
      <div className="relative z-10 flex flex-col items-center px-4 text-center">
        <BharatMark size={84} color="var(--accent)" ink="var(--foreground)" />

        <div className="mt-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
          <Chakra size={13} color="var(--accent)" spin /> Origins
        </div>

        <CineTitle
          text="Bharat"
          accentLast="."
          className="bharati mt-4 text-6xl font-black leading-[0.95] tracking-tight text-foreground md:text-8xl"
        />

        <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
          An atlas of India — its money and power, its land and rivers, its scripts and
          faiths — carved in an interface language of its own, from the Mauryan and Gupta world.
        </p>

        {/* the Brahmi signature */}
        <p className="f-brahmi mt-5 text-3xl text-[var(--muted-foreground)]/60" aria-hidden="true">
          𑀪𑀸𑀭𑀢
        </p>

        {/* primary CTAs — mandala buttons */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <MandalaButton href="/map">Open the map</MandalaButton>
          <MandalaButton href="#explore" variant="ghost">Explore the atlas</MandalaButton>
        </div>

        {/* scroll cue */}
        <a
          href="#explore"
          className="group mt-10 inline-flex flex-col items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)] transition-colors hover:text-[var(--accent)]"
          aria-label="Scroll to explore"
        >
          <span
            className="block h-8 w-5 rounded-full border border-current p-1"
            aria-hidden="true"
          >
            <span className="mx-auto block h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
          </span>
        </a>
      </div>
    </header>
  )
}
