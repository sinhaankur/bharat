'use client'

import { useEffect, useRef, useState } from 'react'

type Step = {
  id: string
  stat: string
  heading: string
  body: string
  glyph: string // a script glyph to display instead of a photo
}

// A real Bharat explainer: one word travels from the ancient root to today's scripts.
const steps: Step[] = [
  {
    id: 's1',
    stat: '~250 BCE',
    heading: 'It begins in one script',
    body: 'Almost every Indian script descends from a single root — Brahmi, first read in Ashoka’s edicts. Here, the name “Bhārata” in Brahmi letters.',
    glyph: '𑀪𑀸𑀭𑀢',
  },
  {
    id: 's2',
    stat: 'the split',
    heading: 'Then it forks, north and south',
    body: 'Brahmi branches: a northern line to Devanagari, a southern line to Tamil and the Dravidian scripts. The letters look nothing alike — but share one abugida logic.',
    glyph: 'भारत',
  },
  {
    id: 's3',
    stat: 'today',
    heading: 'Now it lives in a dozen scripts',
    body: 'The same idea, written a dozen different ways — unrelated languages, one shared ancestor. That convergence is the whole story of Bharat’s scripts.',
    glyph: 'பாரதம்',
  },
]
const STEP_FONT = ['f-brahmi', 'f-devanagari', 'f-tamil']

export default function ScrollExplainer() {
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const sectionRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.index)
            setActive(idx)
          }
        })
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    stepRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const scrolled = Math.min(Math.max(-rect.top, 0), total)
      setProgress(total > 0 ? scrolled / total : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="border-y border-border bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Section label */}
        <div className="flex items-center gap-3 py-6">
          <span className="inline-block bg-accent px-2 py-1 text-xs font-black uppercase tracking-widest text-accent-foreground">
            Bharat Explains
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest text-background/60">
            The journey of a word
          </span>
        </div>

        <div ref={sectionRef} className="relative grid gap-10 md:grid-cols-2">
          {/* Sticky visual — the script glyph, not a photo */}
          <div className="hidden md:block">
            <div className="sticky top-24 flex h-[70vh] items-center justify-center overflow-hidden rounded-lg border border-background/10 bg-background/5">
              {steps.map((step, i) => (
                <span
                  key={step.id}
                  className={`absolute ${STEP_FONT[i]} text-[14vw] leading-none text-background transition-all duration-700 ease-out ${
                    active === i ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
                  }`}
                >
                  {step.glyph}
                </span>
              ))}
              {/* Progress bar */}
              <div className="absolute inset-x-0 bottom-0 h-1.5 bg-background/20">
                <div
                  className="h-full bg-accent transition-[width] duration-150 ease-out"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              {/* Big stat overlay */}
              <div className="absolute left-6 top-6">
                <span className="font-serif text-4xl font-black text-accent drop-shadow-lg">
                  {steps[active].stat}
                </span>
              </div>
            </div>
          </div>

          {/* Scrolling text steps */}
          <div>
            {steps.map((step, i) => (
              <div
                key={step.id}
                data-index={i}
                ref={(el) => {
                  stepRefs.current[i] = el
                }}
                className="flex min-h-[80vh] flex-col justify-center py-10"
              >
                {/* Mobile glyph */}
                <div className={`mb-6 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary md:hidden ${STEP_FONT[i]}`}>
                  <span className="text-[22vw] leading-none text-foreground">{step.glyph}</span>
                </div>
                <span className="font-serif text-5xl font-black text-accent md:hidden">
                  {step.stat}
                </span>
                <h3 className="mt-2 font-serif text-3xl font-bold leading-tight text-balance md:text-4xl">
                  {step.heading}
                </h3>
                <p className="mt-4 max-w-md text-lg leading-relaxed text-background/70">
                  {step.body}
                </p>
                <span
                  className={`mt-6 h-1 w-16 origin-left bg-accent transition-transform duration-500 ${
                    active === i ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
