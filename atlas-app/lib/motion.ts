// ─────────────────────────────────────────────────────────────────────────────
// The design system's MOTION LAYER — tokens + variants, one source of truth.
// Built on `motion` (the framer-motion successor). Everything here is data, not
// components, so it's importable from any client component and documented on the
// design-system reference page. Pair with the primitives in components/motion.tsx.
//
// The patterns we adopted from Motion/Framer:
//   spring physics · whileHover · whileTap · whileDrag · whileInView (scroll reveal)
//   stagger · AnimatePresence (enter/exit) · layout · variants
// ─────────────────────────────────────────────────────────────────────────────
import type { Transition, Variants } from 'motion/react'

// ── MOTION TOKENS ────────────────────────────────────────────────────────────
// Durations (seconds) — a small, named scale, like our spacing/type scales.
export const DUR = {
  fast: 0.16,
  base: 0.28,
  slow: 0.5,
  reveal: 0.6,
} as const

// Easings — one expressive curve for entrances, one calm curve for exits.
export const EASE = {
  out: [0.2, 0.6, 0.2, 1] as const,      // decisive entrance
  inOut: [0.65, 0, 0.35, 1] as const,    // symmetric
  gallery: [0.32, 0.72, 0, 1] as const,  // the slider glide
}

// Springs — physical configs for gesture + layout motion.
export const SPRING = {
  // a gentle UI spring — buttons, cards, hovers
  ui: { type: 'spring', stiffness: 420, damping: 32, mass: 0.9 } as Transition,
  // a snappier spring — the gallery snap, drag release
  snap: { type: 'spring', stiffness: 520, damping: 40, mass: 0.8 } as Transition,
  // a soft, weighty spring — big plates, layout shifts
  soft: { type: 'spring', stiffness: 260, damping: 30, mass: 1.1 } as Transition,
} as const

// ── VARIANTS (named, reusable animation states) ──────────────────────────────

// Reveal — rise + fade in when scrolled into view (replaces the hand-rolled Reveal).
export const revealV: Variants = {
  hidden: { opacity: 0, y: 16 },
  shown: { opacity: 1, y: 0, transition: { duration: DUR.reveal, ease: EASE.out } },
}

// Stagger — a container that cascades its children in.
export const staggerV: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}
export const staggerItemV: Variants = {
  hidden: { opacity: 0, y: 14 },
  shown: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE.out } },
}

// Press — hover-lift + tap-press feedback for interactive surfaces.
export const pressV = {
  whileHover: { y: -3, transition: SPRING.ui },
  whileTap: { scale: 0.97, transition: SPRING.snap },
}

// Plate — a gallery/card enter-exit (used with AnimatePresence).
export const plateV: Variants = {
  enter: { opacity: 0, scale: 1.06 },
  center: { opacity: 1, scale: 1, transition: { duration: DUR.reveal, ease: EASE.gallery } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: DUR.base, ease: EASE.gallery } },
}

// ── reduce-motion helper ─────────────────────────────────────────────────────
// Honour the OS setting AND the site's a11y reader toggle (html[data-reduce=on]).
export function prefersReduced(): boolean {
  if (typeof window === 'undefined') return false
  return (
    (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ||
    document.documentElement.dataset.reduce === 'on' ||
    document.documentElement.getAttribute('data-reduce-motion') === '1'
  )
}
