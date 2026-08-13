'use client'

import { useEffect } from 'react'

// The Bharat logo — faithful to the handoff's Bharat Logo.dc.html: a gold seal-ring
// with a script glyph that cycles ಭ→भ→ভ→ਭ→ભ→ଭ→భ→ഭ (8 scripts) every 1.4s, beside
// "Bharat." in Rozha One and a small tagline. Reduce-motion safe.
const GLYPHS = ['ಭ', 'भ', 'ভ', 'ਭ', 'ભ', 'ଭ', 'భ', 'ഭ']

// 24 fine engraved sunburst rays behind the ring — identical geometry to the
// classic sealLogo() in site-nav.js, so both logos draw the same emblem.
const RAYS = (() => {
  let d = ''
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2
    const long = k % 2 === 0
    const r0 = 46, r1 = long ? 49.5 : 48
    const c = Math.cos(a), s = Math.sin(a)
    d += `M${(50 + r0 * c).toFixed(2)} ${(50 + r0 * s).toFixed(2)}L${(50 + r1 * c).toFixed(2)} ${(50 + r1 * s).toFixed(2)}`
  }
  return d
})()

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
    <span className="bha-brand" style={{ display: 'inline-flex', alignItems: 'center', gap: 11, fontFamily: 'var(--font-ui)', color: 'inherit' }}>
      <style>{`
        .bha-brand .bha-seal-app { overflow: visible; }
        .bha-brand .bha-seal-app .bha-ring { transform-origin: 50px 50px; transition: transform 1.1s cubic-bezier(.22,.61,.36,1); }
        .bha-brand .bha-seal-app .bha-rays { transform-origin: 50px 50px; transition: opacity .5s ease; opacity: .9; }
        .bha-brand:hover .bha-seal-app .bha-ring { transform: rotate(30deg); }
        .bha-brand:hover .bha-seal-app .bha-rays { opacity: 1; }
        @media (prefers-reduced-motion: reduce) {
          .bha-brand .bha-seal-app .bha-ring, .bha-brand .bha-seal-app .bha-rays { transition: none; }
          .bha-brand:hover .bha-seal-app .bha-ring { transform: none; }
        }
      `}</style>
      <svg className="bha-seal-app" width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={{ flex: 'none' }}>
        <g className="bha-rays"><path d={RAYS} stroke="var(--band)" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.62" /></g>
        <g className="bha-ring">
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--band)" strokeWidth="4" />
          <circle cx="50" cy="50" r="39" fill="none" stroke="var(--band)" strokeWidth="6" strokeDasharray="2.5 7.7" />
          <circle cx="50" cy="22" r="3.2" fill="currentColor" />
        </g>
        <text x="50" y="62" fontSize="34" textAnchor="middle" fill="currentColor" data-bha="1"
          fontFamily="'Noto Sans Kannada','Noto Sans Devanagari','Noto Sans Bengali','Noto Sans Gurmukhi','Noto Sans Gujarati','Noto Sans Oriya','Noto Sans Telugu','Noto Sans Malayalam',serif">ಭ</text>
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
