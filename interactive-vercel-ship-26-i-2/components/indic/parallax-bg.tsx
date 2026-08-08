'use client'

// ─────────────────────────────────────────────────────────────────────────
// ParallaxBackground — layered Ashokan/floral ornament that drifts at
// different speeds on scroll, giving depth. Warm, subtle, behind content.
// Uses one scroll listener + rAF (performant). Honours reduce-motion (freezes).
// ─────────────────────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react'
import { Lotus } from '@/components/indic/lotus'
import { Gavaksha, PurnaKalasha } from '@/components/indic/gupta'

type Layer = {
  speed: number // parallax factor (0 = fixed, 1 = scrolls with page); use small values
  node: React.ReactNode
  className?: string // positioning (absolute)
  opacity?: number
}

export default function ParallaxBackground({
  layers,
  className,
}: {
  layers?: Layer[]
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    let raf = 0
    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-speed]'))
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        // progress of this container through the viewport
        const y = rect.top
        for (const it of items) {
          const s = parseFloat(it.dataset.speed || '0')
          it.style.transform = `translate3d(0, ${(-y * s).toFixed(1)}px, 0)`
        }
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const L = layers ?? defaultOrnaments()

  return (
    <div ref={ref} className={`pointer-events-none absolute inset-0 overflow-hidden ${className || ''}`} aria-hidden="true">
      {L.map((layer, i) => (
        <div
          key={i}
          data-speed={layer.speed}
          className={`absolute will-change-transform ${layer.className || ''}`}
          style={{ opacity: layer.opacity ?? 0.12 }}
        >
          {layer.node}
        </div>
      ))}
    </div>
  )
}

// A tasteful default: a scattered garden of Ashokan/Gupta ornament at depths.
function defaultOrnaments(): Layer[] {
  const gold = 'var(--accent)'
  const bronze = 'var(--bronze, #70481c)'
  return [
    // deep, slow — big faint lotus top-right
    { speed: 0.06, opacity: 0.07, className: '-right-16 -top-10', node: <Lotus size={260} color={bronze} petals={20} /> },
    // mid — a gavaksha arch, mid-left
    { speed: 0.14, opacity: 0.1, className: 'left-6 top-40', node: <Gavaksha size={120} color={gold} /> },
    // mid — purna-kalasha lower-right
    { speed: 0.1, opacity: 0.09, className: 'right-24 bottom-10', node: <PurnaKalasha size={160} color={bronze} /> },
    // near, faster — small lotus lower-left
    { speed: 0.2, opacity: 0.1, className: 'left-24 bottom-24', node: <Lotus size={110} color={gold} petals={16} /> },
    // a tiny gavaksha, top-center, fastest
    { speed: 0.26, opacity: 0.08, className: 'left-1/2 top-16', node: <Gavaksha size={64} color={gold} /> },
  ]
}
