'use client'

// ATLAS HOME — a faithful implementation of the approved "Atlas Home.dc.html"
// mockup: intro splash → gridded hero → counting stats → 2px-gap entry grid.
// Restrained, architectural, Mauryan-gold on warm paper. Reduce-motion safe.
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const STATS: { count: number; decimals?: number; suffix?: string; label: string }[] = [
  { count: 788, label: 'Districts mapped' },
  { count: 36, label: 'States & union territories' },
  { count: 1.4, decimals: 1, suffix: 'B', label: 'People counted' },
  { count: 100, suffix: '%', label: 'Sourced, or a gap' },
]

const ENTRIES: { n: string; title: string; body: string; href: string }[] = [
  { n: '01', title: 'The interactive map', body: 'India by district — public money, flood & CRZ zoning, and the shape of the land.', href: '/map' },
  { n: '02', title: 'Sacred ground', body: '137 sourced sacred sites — builder, lifespan, and the record of destruction.', href: '/heritage' },
  { n: '03', title: 'The Edicts of Ashoka', body: 'The empire in his own words — Kalinga’s remorse, conquest by Dhamma.', href: '/edicts' },
  { n: '04', title: 'Every tongue, its letters', body: '19 languages, 24 scripts, each in its own self-hosted Indic type.', href: '/languages' },
]

export default function AtlasHome({ intro = true }: { intro?: boolean }) {
  const [showIntro, setShowIntro] = useState(intro)
  const seqRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setShowIntro(false)
      // reveal all sequenced items + set final stat text
      document.querySelectorAll<HTMLElement>('[data-seq]').forEach((el) => {
        el.style.opacity = '1'
        el.style.transform = 'none'
      })
      document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
        const t = +(el.dataset.count || '0')
        el.textContent = t.toFixed(+(el.dataset.decimals || 0)) + (el.dataset.suffix || '')
      })
      return
    }

    const introOn = intro
    if (introOn) {
      const t = setTimeout(() => setShowIntro(false), 2500)
      // clean up handled below
    }
    // sequence reveal
    const base = introOn ? 1850 : 150
    const timers: number[] = []
    document.querySelectorAll<HTMLElement>('[data-seq]').forEach((el, i) => {
      timers.push(
        window.setTimeout(() => {
          el.style.transition = 'opacity 0.7s cubic-bezier(0.2,0.6,0.2,1), transform 0.7s cubic-bezier(0.2,0.6,0.2,1)'
          el.style.opacity = '1'
          el.style.transform = 'none'
        }, base + i * 140),
      )
    })
    // count-up on scroll into view
    const run = (el: HTMLElement) => {
      const target = +(el.dataset.count || '0')
      const dec = +(el.dataset.decimals || 0)
      const suffix = el.dataset.suffix || ''
      const t0 = performance.now()
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / 1400)
        const e = 1 - Math.pow(1 - p, 3)
        el.textContent = (target * e).toFixed(dec) + suffix
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { run(e.target as HTMLElement); io.unobserve(e.target) } }),
      { threshold: 0.5 },
    )
    document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => io.observe(el))
    return () => { timers.forEach(clearTimeout); io.disconnect() }
  }, [intro])

  return (
    <div className="theme-ashoka bg-background text-foreground">
      {/* intro splash */}
      {showIntro && (
        <div
          className="fixed inset-0 z-[100] flex items-end bg-[var(--accent)] p-[clamp(20px,5vw,72px)]"
          style={{ animation: 'introExit 0.8s cubic-bezier(0.7,0,0.2,1) 1.7s forwards' }}
          aria-hidden="true"
        >
          <div>
            <div className="h-0.5 w-[min(360px,40vw)] origin-left bg-[var(--accent-foreground)]" style={{ animation: 'drawX 0.7s cubic-bezier(0.2,0.6,0.2,1) 0.15s forwards', transform: 'scaleX(0)' }} />
            <p className="bharati m-0 mt-5 text-[clamp(48px,9vw,128px)] font-black leading-[1.02] tracking-tight text-[var(--accent-foreground)]">
              <span className="block" style={{ opacity: 0, animation: 'riseIn 0.7s cubic-bezier(0.2,0.6,0.2,1) 0.25s forwards' }}>Bharat</span>
              <span className="block" style={{ opacity: 0, animation: 'riseIn 0.7s cubic-bezier(0.2,0.6,0.2,1) 0.4s forwards' }}>Atlas</span>
            </p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1200px] px-[clamp(20px,5vw,72px)]">
        {/* hero with faint grid lines */}
        <section className="relative py-[84px] pt-[112px]" aria-label="Hero">
          {[25, 50, 75].map((l, i) => (
            <div
              key={l}
              className="absolute bottom-0 top-0 w-px origin-top bg-[var(--divider,var(--border))] opacity-35"
              style={{ left: `${l}%`, transform: 'scaleY(0)', animation: `drawY 1.2s cubic-bezier(0.2,0.6,0.2,1) ${1.9 + i * 0.15}s both` }}
              data-hero-anim
            />
          ))}
          <h1 className="bharati relative m-0 text-[clamp(42px,6.2vw,84px)] font-black leading-[1.06] tracking-tight">
            <span data-seq className="block" style={{ opacity: 0, transform: 'translateY(28px)' }}>The atlas of</span>
            <span data-seq className="block" style={{ opacity: 0, transform: 'translateY(28px)' }}>modern India<span className="text-[var(--accent)]">.</span></span>
          </h1>
          <p data-seq className="relative mt-9 max-w-[58ch] text-[17px] leading-7 text-muted-foreground" style={{ opacity: 0, transform: 'translateY(28px)' }}>
            India, opened like a book of maps — its money and land, its scripts and faiths,
            its deep past. Sourced to the figure, or it is marked a gap.
          </p>
          <div data-seq className="relative mt-7 flex flex-wrap gap-3" style={{ opacity: 0, transform: 'translateY(28px)' }}>
            <Link href="/map" className="inline-flex items-center rounded-[var(--radius)] bg-[var(--accent)] px-5 py-3 text-sm font-bold uppercase tracking-widest text-[var(--accent-foreground)] transition-opacity hover:opacity-90">
              Enter the atlas
            </Link>
            <Link href="#atlas" className="inline-flex items-center px-2 py-3 text-sm font-bold uppercase tracking-widest text-[var(--accent)] transition-opacity hover:opacity-80">
              What it holds
            </Link>
          </div>
        </section>

        {/* sweep divider */}
        <div className="h-0.5 origin-left bg-[var(--border)]" style={{ transform: 'scaleX(0)', animation: 'drawX 1s cubic-bezier(0.2,0.6,0.2,1) 2.4s forwards' }} data-hero-anim />

        {/* stats */}
        <section id="data" className="py-[70px]" aria-label="By the numbers">
          <div data-seq className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-7 gap-y-[42px]" style={{ opacity: 0, transform: 'translateY(28px)' }}>
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="bharati m-0 text-[clamp(34px,3.4vw,48px)] font-black leading-[56px] text-[var(--accent)]">
                  <span data-count={s.count} data-decimals={s.decimals} data-suffix={s.suffix}>0</span>
                </p>
                <p className="mt-3.5 text-[13px] font-mono uppercase leading-[14px] tracking-[0.08em] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* entry grid */}
        <section id="atlas" className="pb-[98px]">
          <span className="mb-7 block text-[13px] font-mono uppercase leading-[14px] tracking-[0.08em] text-[var(--accent)]">What the atlas holds</span>
          <div data-seq className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-0.5 border-2 border-[var(--border)] bg-[var(--border)]" style={{ opacity: 0, transform: 'translateY(28px)' }}>
            {ENTRIES.map((e) => (
              <Link key={e.n} href={e.href} className="group block bg-background p-8 px-8 py-[42px] transition-colors hover:bg-[var(--accent)]/[0.08]">
                <p className="bharati m-0 text-[15px] font-black leading-[14px] text-[var(--accent)]">{e.n}</p>
                <h2 className="bharati mt-[22px] text-[26px] font-black leading-[30px] tracking-tight">{e.title}</h2>
                <p className="mt-3 max-w-[36ch] text-[15px] leading-6 text-muted-foreground">{e.body}</p>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="mt-7 block text-[var(--accent)] transition-transform group-hover:translate-x-1">
                  <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
                </svg>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
