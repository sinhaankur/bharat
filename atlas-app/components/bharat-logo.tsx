'use client'

import { useEffect } from 'react'

// The Bharat logo — faithful to the handoff's Bharat Logo.dc.html: a gold seal-ring
// with a script glyph that cycles ಭ→भ→ভ→ਭ→ભ→ଭ→భ→ഭ (8 scripts) every 1.4s, beside
// "Bharat." in Rozha One and a small tagline. Reduce-motion safe.
const GLYPHS = ['ಭ', 'भ', 'ভ', 'ਭ', 'ભ', 'ଭ', 'భ', 'ഭ']

export default function BharatLogo({ tagline = 'WE ARE HERE', size = 40 }: { tagline?: string; size?: number }) {
  useEffect(() => {
    if ((window as any).__bhaTimer) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let i = 1
    ;(window as any).__bhaTimer = setInterval(() => {
      document.querySelectorAll('[data-bha]').forEach((el) => { el.textContent = GLYPHS[i % GLYPHS.length] })
      i++
    }, 1400)
    return () => { clearInterval((window as any).__bhaTimer); (window as any).__bhaTimer = null }
  }, [])

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 11, fontFamily: 'var(--font-ui)', color: 'inherit' }}>
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={{ flex: 'none' }}>
        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--band)" strokeWidth="4" />
        <circle cx="50" cy="50" r="39" fill="none" stroke="var(--band)" strokeWidth="6" strokeDasharray="2.5 7.7" />
        <text x="50" y="62" fontSize="34" textAnchor="middle" fill="currentColor" data-bha="1"
          fontFamily="'Noto Sans Kannada','Noto Sans Devanagari','Noto Sans Bengali','Noto Sans Gurmukhi','Noto Sans Gujarati','Noto Sans Oriya','Noto Sans Telugu','Noto Sans Malayalam',serif">ಭ</text>
        <circle cx="50" cy="22" r="3.2" fill="currentColor" />
        <path d="M34 72 Q50 64 66 72 M38 79 Q50 72 62 79" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
      <span>
        <span style={{ display: 'block', fontFamily: "'Rozha One', var(--font-display)", fontSize: 22, lineHeight: 1 }}>
          Bharat<span style={{ color: 'var(--band)' }}>.</span>
        </span>
        <span style={{ display: 'block', fontSize: 8.5, letterSpacing: '0.22em', color: 'var(--band)', marginTop: 4 }}>{tagline}</span>
      </span>
    </span>
  )
}
