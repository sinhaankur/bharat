// ─────────────────────────────────────────────────────────────────────────
// MOLECULES — small functional clusters built by combining ATOMS.
// (Atomic Design · Step 3, layer 2)
// ─────────────────────────────────────────────────────────────────────────
'use client'

import * as React from 'react'
import { Input, Label, Badge, Eyebrow, Icon } from './atoms'

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')

// ── SearchField = Input + internal icon (the classic molecule) ────────────
export function SearchField({
  placeholder = 'Search…',
  onSubmit,
  className,
  ...props
}: { placeholder?: string; onSubmit?: (v: string) => void; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const [v, setV] = React.useState('')
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.(v)
      }}
      className={cx('relative', className)}
    >
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" aria-hidden>
        <SearchIcon />
      </span>
      <Input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-9"
        {...props}
      />
    </form>
  )
}
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" />
      <line x1="11" y1="11" x2="15" y2="15" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

// ── LabeledField = Label + Input (+ optional hint) ────────────────────────
export function LabeledField({
  label,
  hint,
  id,
  ...inputProps
}: { label: string; hint?: string; id: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} aria-describedby={hint ? `${id}-hint` : undefined} {...inputProps} />
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-[var(--muted-foreground)]">
          {hint}
        </p>
      )}
    </div>
  )
}

// ── StatBlock = big number + label (the "by the numbers" unit) ────────────
export function StatBlock({ value, label, className }: { value: React.ReactNode; label: string; className?: string }) {
  return (
    <div className={cx('carved rounded-sm bg-[var(--card)] p-4', className)}>
      <div className="font-serif text-2xl font-black leading-none text-[var(--foreground)] md:text-3xl">{value}</div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-wide text-[var(--muted-foreground)]">{label}</div>
    </div>
  )
}

// ── Meter = a labelled progress/spread bar (bias bar, coverage, etc.) ─────
export function Meter({
  value,
  label,
  max = 100,
  color = 'var(--accent)',
  className,
}: {
  value: number
  label?: string
  max?: number
  color?: string
  className?: string
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className={className}>
      {label && (
        <div className="mb-1 flex justify-between text-xs text-[var(--muted-foreground)]">
          <span>{label}</span>
          <span className="font-mono font-semibold text-[var(--foreground)]">{Math.round(value)}</span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-[var(--secondary)]" role="meter" aria-valuenow={value} aria-valuemax={max} aria-label={label}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

// ── TagRow = a row of Badges ──────────────────────────────────────────────
export function TagRow({ tags, className }: { tags: { label: string; tone?: any }[]; className?: string }) {
  return (
    <div className={cx('flex flex-wrap gap-1.5', className)}>
      {tags.map((t, i) => (
        <Badge key={i} tone={t.tone}>
          {t.label}
        </Badge>
      ))}
    </div>
  )
}

// ── CardHeader = Eyebrow (kicker) + Title (+ optional meta) ───────────────
export function CardHeader({
  kicker,
  title,
  meta,
  className,
}: {
  kicker?: string
  title: React.ReactNode
  meta?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cx('space-y-1', className)}>
      {kicker && <Eyebrow>{kicker}</Eyebrow>}
      <h3 className="font-serif text-lg font-bold leading-snug text-[var(--foreground)]">{title}</h3>
      {meta && <div className="font-mono text-[11px] text-[var(--muted-foreground)]">{meta}</div>}
    </div>
  )
}
