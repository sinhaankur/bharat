'use client'

// ─────────────────────────────────────────────────────────────────────────
// CINE TITLE — a headline that clarifies letter by letter, like a film title
// resolving into focus. Reduce-motion → renders as plain text instantly.
// ─────────────────────────────────────────────────────────────────────────

import type { ElementType } from 'react'

export default function CineTitle({
  text,
  as: Tag = 'h1',
  className,
  accentLast,
}: {
  text: string
  as?: ElementType
  className?: string
  accentLast?: string // e.g. "." rendered in accent
}) {
  const chars = Array.from(text)
  return (
    <Tag className={`cine-title ${className || ''}`} aria-label={text + (accentLast || '')}>
      {chars.map((c, i) => (
        <span key={i} aria-hidden="true" style={{ ['--i' as string]: i }}>
          {c === ' ' ? ' ' : c}
        </span>
      ))}
      {accentLast && (
        <span aria-hidden="true" style={{ ['--i' as string]: chars.length, color: 'var(--accent)' }}>
          {accentLast}
        </span>
      )}
    </Tag>
  )
}
