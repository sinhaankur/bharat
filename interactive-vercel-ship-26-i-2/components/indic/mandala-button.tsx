'use client'

// ─────────────────────────────────────────────────────────────────────────
// MANDALA BUTTON — the primary CTA. A curved (Radius 2) button with a faint
// mandala living inside it that BLOOMS and spins on hover, a warm glow, and a
// magnetic arrow. Intuitive: the ornament rewards the hover, the label leads.
// Renders as <a> if href given, else <button>. Reduce-motion → no spin/magnet.
// ─────────────────────────────────────────────────────────────────────────

import { useRef } from 'react'
import Link from 'next/link'
import Mandala from '@/components/indic/mandala'

type Props = {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: 'solid' | 'ghost'
  className?: string
}

export default function MandalaButton({ children, href, onClick, variant = 'solid', className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)

  // subtle magnetic pull toward the cursor
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - (r.left + r.width / 2)) / r.width
    const y = (e.clientY - (r.top + r.height / 2)) / r.height
    el.style.transform = `translate(${x * 6}px, ${y * 5}px)`
  }
  const onLeave = () => {
    const el = ref.current
    if (el) el.style.transform = ''
  }

  const solid = variant === 'solid'
  const base = `group relative inline-flex items-center gap-2.5 overflow-hidden rounded-[var(--radius)] px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
    solid
      ? 'bg-[var(--accent)] text-[var(--accent-foreground)] hover:shadow-[0_12px_40px_-10px_var(--accent)]'
      : 'border border-border text-foreground hover:border-[var(--accent)] hover:text-[var(--accent)]'
  } ${className || ''}`

  const inner = (
    <>
      {/* the mandala that blooms on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-8 opacity-0 transition-all duration-500 group-hover:-right-4 group-hover:-top-6 group-hover:opacity-30"
      >
        <Mandala size={120} spin accent="currentColor" ink="currentColor" rose="currentColor" opacity={1} />
      </span>
      {/* a sweeping gold sheen */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
      />
      <span ref={ref} className="relative z-10 inline-flex items-center gap-2 transition-transform duration-200">
        {children}
        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </span>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={base} onMouseMove={onMove} onMouseLeave={onLeave}>
        {inner}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} className={base} onMouseMove={onMove} onMouseLeave={onLeave}>
      {inner}
    </button>
  )
}
