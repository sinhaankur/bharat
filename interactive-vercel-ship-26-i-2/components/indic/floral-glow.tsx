'use client'

// ─────────────────────────────────────────────────────────────────────────
// FLORAL GLOW — the ambient "Mauryan period, glowing" backdrop.
// Layers, back to front:
//   1. a warm radial LAMP GLOW that breathes (dawn-light on sandstone)
//   2. two mirrored carved FLORAL VINE scrolls (the flowers on the pillars) that sway
//   3. slow-falling PETALS / motes of light drifting down
// All parallax-aware (moves with scroll at different depths) and reduce-motion safe.
// Purely decorative → aria-hidden, pointer-events-none.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'

// a single flowering vine scroll (Mauryan/Sunga foliate scrollwork) as one SVG path set.
// A serpentine stem with lotus buds, palmettes and leaves budding off it.
function VineScroll({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 200 700"
      preserveAspectRatio="xMidYMid meet"
      className="floral-sway h-full w-full"
      style={{ transform: flip ? 'scaleX(-1)' : undefined }}
    >
      <g fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" opacity="0.9">
        {/* the running stem */}
        <path d="M100 690 C 60 620, 140 560, 100 490 C 60 420, 140 360, 100 290 C 60 220, 140 160, 100 90 C 80 55, 100 30, 100 12" />
        {/* buds / palmettes budding off the curve, alternating sides */}
        {[
          [100, 620, -1], [100, 490, 1], [100, 360, -1], [100, 290, 1],
          [100, 160, -1], [100, 90, 1],
        ].map(([x, y, dir], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${dir},1)`}>
            {/* curling tendril */}
            <path d="M0 0 C 22 -6, 40 -22, 44 -46 C 46 -60, 40 -70, 30 -70" />
            {/* a lotus bud / palmette at the tip */}
            <path
              d="M30 -70 C 20 -84, 30 -100, 44 -100 C 58 -100, 68 -84, 58 -70 C 66 -80, 74 -62, 60 -58 C 70 -60, 66 -46, 52 -52 C 58 -44, 46 -40, 44 -52 C 42 -40, 30 -44, 36 -52 C 24 -46, 20 -60, 30 -58 C 18 -62, 24 -80, 30 -70 Z"
              fill="var(--accent)"
              opacity="0.28"
            />
            {/* a small leaf lower on the tendril */}
            <path d="M20 -14 C 30 -10, 34 2, 26 8 C 20 2, 16 -6, 20 -14 Z" fill="var(--dusty-rose, #b07f7a)" opacity="0.3" stroke="none" />
          </g>
        ))}
      </g>
    </svg>
  )
}

function Petals({ count = 12 }: { count?: number }) {
  // deterministic pseudo-random so server & client agree (no hydration drift)
  const seed = (i: number) => {
    const s = Math.sin(i * 999.13) * 10000
    return s - Math.floor(s)
  }
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const left = Math.round(seed(i) * 100)
        const size = Math.round(6 + seed(i + 1) * 10)
        const dur = Math.round(16 + seed(i + 2) * 20)
        const delay = Math.round(seed(i + 3) * -30)
        const rose = i % 3 === 0
        return (
          <span
            key={i}
            className="absolute top-0 block"
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              borderRadius: '60% 0 60% 0',
              background: rose ? 'var(--dusty-rose, #b07f7a)' : 'var(--accent)',
              opacity: 0.5,
              animation: `petal-drift ${dur}s linear ${delay}s infinite`,
            }}
          />
        )
      })}
    </div>
  )
}

export default function FloralGlow({
  petals = true,
  vines = true,
  intensity = 1,
  className,
}: {
  petals?: boolean
  vines?: boolean
  intensity?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [reduce, setReduce] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduce(mq.matches)
    if (mq.matches) return

    // parallax: shift the glow + vines as the section scrolls through view
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const el = ref.current
        if (!el) return
        const r = el.getBoundingClientRect()
        const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight
        el.style.setProperty('--par', String(p))
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
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className || ''}`}
      style={{ ['--par' as string]: 0 }}
    >
      {/* 1 · warm lamp glow — the "glowing" heart */}
      <div
        className={reduce ? undefined : 'lamp-glow'}
        style={{
          position: 'absolute',
          inset: '-20%',
          background:
            'radial-gradient(60% 55% at 50% 42%, color-mix(in srgb, var(--accent) 42%, transparent), transparent 70%)',
          opacity: 0.5 * intensity,
          transform: 'translateY(calc(var(--par) * -40px))',
          mixBlendMode: 'multiply',
        }}
      />
      {/* a second cool-warm dawn wash to give the stone depth */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(120% 90% at 50% 120%, color-mix(in srgb, var(--gupta-stone, #c8664a) 20%, transparent), transparent 60%)',
          opacity: 0.35 * intensity,
        }}
      />
      {/* 2 · mirrored carved floral vines climbing the two edges (parallax) */}
      {vines && (
        <>
          <div
            className="absolute bottom-0 left-0 top-0 hidden w-[16%] min-w-[120px] opacity-[0.5] sm:block"
            style={{ transform: 'translateY(calc(var(--par) * 30px))' }}
          >
            <VineScroll />
          </div>
          <div
            className="absolute bottom-0 right-0 top-0 hidden w-[16%] min-w-[120px] opacity-[0.5] sm:block"
            style={{ transform: 'translateY(calc(var(--par) * 46px))' }}
          >
            <VineScroll flip />
          </div>
        </>
      )}
      {/* 3 · drifting petals / motes of light */}
      {petals && !reduce && <Petals />}
    </div>
  )
}
