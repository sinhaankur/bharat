// ─────────────────────────────────────────────────────────────────────────
// ATOMS — the smallest UI building blocks of the Bharat (Mauryan/Gupta) system.
// Every atom reads from the design tokens (--accent, --stone-ink, --carved…),
// is keyboard-accessible, and has visible focus. No atom depends on another.
// (Atomic Design · Step 3, layer 1)
// ─────────────────────────────────────────────────────────────────────────
'use client'

import * as React from 'react'

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')

// focus ring shared by all interactive atoms (WCAG keyboard visibility)
const FOCUS =
  'outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]'

// ── Button ──────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type BtnSize = 'sm' | 'md' | 'lg'
export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: BtnSize }) {
  // curved buttons — a comfortable medium radius (10px), softer than stone-sharp
  const base =
    'inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold transition-[transform,background,box-shadow] duration-150 active:translate-y-px disabled:opacity-50 disabled:pointer-events-none'
  const sizes: Record<BtnSize, string> = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  }
  const variants: Record<BtnVariant, string> = {
    primary: 'polish-edge bg-[var(--accent)] text-[var(--accent-foreground)] hover:brightness-95',
    secondary: 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--muted)]',
    ghost: 'border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]',
    danger: 'bg-[var(--terracotta,#b04a2c)] text-white hover:brightness-95',
  }
  return <button className={cx(base, sizes[size], variants[variant], FOCUS, className)} {...props} />
}

// ── Icon (wrapper for a passed SVG / emoji, sized consistently) ───────────
export function Icon({ children, size = 18, className }: { children: React.ReactNode; size?: number; className?: string }) {
  return (
    <span className={cx('inline-flex items-center justify-center', className)} style={{ width: size, height: size }} aria-hidden>
      {children}
    </span>
  )
}

// ── Text input ────────────────────────────────────────────────────────────
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cx(
          'carved-deep h-10 w-full rounded-sm bg-[var(--card)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]',
          FOCUS,
          className
        )}
        {...props}
      />
    )
  }
)

// ── Checkbox (accessible; label handled at molecule level) ────────────────
export const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Checkbox({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        type="checkbox"
        className={cx(
          'h-4 w-4 rounded-[3px] border border-[var(--border-strong,var(--border))] accent-[var(--accent)]',
          FOCUS,
          className
        )}
        {...props}
      />
    )
  }
)

// ── Label / eyebrow (mono kicker, an Indic ornament slot) ─────────────────
export function Label({ children, className, htmlFor }: { children: React.ReactNode; className?: string; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className={cx('block text-sm font-medium text-[var(--foreground)]', className)}>
      {children}
    </label>
  )
}
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cx('font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--accent)]', className)}>
      {children}
    </span>
  )
}

// ── Badge / Chip ──────────────────────────────────────────────────────────
type BadgeTone = 'accent' | 'neutral' | 'success' | 'warn' | 'danger' | 'outline'
export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode
  tone?: BadgeTone
  className?: string
}) {
  const tones: Record<BadgeTone, string> = {
    accent: 'bg-[var(--accent)] text-[var(--accent-foreground)]',
    neutral: 'bg-[var(--secondary)] text-[var(--foreground)]',
    success: 'text-white bg-[oklch(0.55_0.14_150)]',
    warn: 'text-white bg-[oklch(0.6_0.14_75)]',
    danger: 'text-white bg-[var(--terracotta,#b04a2c)]',
    outline: 'border border-[var(--border)] text-[var(--muted-foreground)]',
  }
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide', tones[tone], className)}>
      {children}
    </span>
  )
}

// ── Divider (incised hairline; optional chakra node) ──────────────────────
export function Divider({ className }: { className?: string }) {
  return <div className={cx('rule-incised w-full', className)} role="separator" />
}
