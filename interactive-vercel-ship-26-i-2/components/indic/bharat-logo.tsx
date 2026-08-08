// ─────────────────────────────────────────────────────────────────────────
// BHARAT LOGO — an original brand mark, designed like an ancient SEAL / coin.
// A chakra ring (the 24 spokes of dharma) encircles a LIVING glyph: the letter
// "Bha" (of Bhārata) that CYCLES through every Indian script — Devanagari भ,
// Bengali ভ, Tamil ப, Telugu భ, Kannada ಭ, Malayalam ഭ, Gujarati ભ, Gurmukhi ਭ,
// Odia ଭ — each in its own self-hosted font. One nation, every tongue.
// Our own drawing — NOT the official State Emblem. Reduce-motion → just भ.
// ─────────────────────────────────────────────────────────────────────────
'use client'

import { useEffect, useState } from 'react'

// each script's "Bha" (or nearest), with its self-hosted font class
const BHA_SCRIPTS: { g: string; f: string; label: string }[] = [
  { g: 'भ', f: 'f-devanagari', label: 'Devanagari' },
  { g: 'ভ', f: 'f-bengali', label: 'Bengali' },
  { g: 'ప', f: 'f-telugu', label: 'Telugu' }, // Telugu 'pa/bha' family
  { g: 'ಭ', f: 'f-kannada', label: 'Kannada' },
  { g: 'ഭ', f: 'f-malayalam', label: 'Malayalam' },
  { g: 'ભ', f: 'f-gujarati', label: 'Gujarati' },
  { g: 'ਭ', f: 'f-gurmukhi', label: 'Gurmukhi' },
  { g: 'ଭ', f: 'f-odia', label: 'Odia' },
  { g: 'ப', f: 'f-tamil', label: 'Tamil' }, // Tamil 'pa' (no distinct bha)
]

function LivingBha({ ink }: { ink: string }) {
  const [i, setI] = useState(0)
  const [reduce, setReduce] = useState(true)
  useEffect(() => {
    const r = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setReduce(r)
    if (r) return
    const t = setInterval(() => setI((n) => (n + 1) % BHA_SCRIPTS.length), 1800)
    return () => clearInterval(t)
  }, [])
  const cur = BHA_SCRIPTS[reduce ? 0 : i]
  return (
    <text
      x="50"
      y="63"
      textAnchor="middle"
      className={cur.f}
      fontSize="42"
      fontWeight={700}
      fill={ink}
      style={{ transition: 'opacity 0.5s ease' }}
    >
      {cur.g}
    </text>
  )
}

export function BharatMark({
  size = 40,
  color = 'var(--accent)',
  ink = 'var(--foreground)',
  className,
  living = true,
}: {
  size?: number
  color?: string
  ink?: string
  className?: string
  living?: boolean
}) {
  const spokes = Array.from({ length: 24 }, (_, i) => (i * 360) / 24)
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} role="img" aria-label="Bharat">
      {/* outer seal ring */}
      <circle cx="50" cy="50" r="47" fill="none" stroke={color} strokeWidth="2.5" />
      {/* the 24-spoke chakra ring (dharma) — drawn as fine ticks between two rings */}
      <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="1" opacity="0.55" />
      <g stroke={color} strokeWidth="1.1">
        {spokes.map((a) => {
          const r = (a * Math.PI) / 180 - Math.PI / 2
          return (
            <line
              key={a}
              x1={(50 + Math.cos(r) * 40).toFixed(3)}
              y1={(50 + Math.sin(r) * 40).toFixed(3)}
              x2={(50 + Math.cos(r) * 46).toFixed(3)}
              y2={(50 + Math.sin(r) * 46).toFixed(3)}
            />
          )
        })}
      </g>
      {/* the heart: the letter "Bha" of Bhārata — LIVING, cycling every script */}
      {living ? (
        <LivingBha ink={ink} />
      ) : (
        <text x="50" y="63" textAnchor="middle" className="f-devanagari" fontSize="46" fontWeight={700} fill={ink}>
          भ
        </text>
      )}
      {/* a small chakra hub dot above, and a lotus base line below */}
      <circle cx="50" cy="24" r="2.4" fill={color} />
      <path d="M34 76 Q50 70 66 76 M39 80 Q50 75 61 80" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function BharatLogo({
  size = 34,
  color = 'var(--accent)',
  ink = 'var(--foreground)',
  className,
  showTagline = false,
}: {
  size?: number
  color?: string
  ink?: string
  className?: string
  showTagline?: boolean
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className || ''}`}>
      <BharatMark size={size} color={color} ink={ink} />
      <span className="leading-none">
        {/* the wordmark is set in OUR OWN font — "Bharati Inspired" (build_bharati_font.py) */}
        <span
          className="bharati block font-black tracking-tight"
          style={{ color: ink, fontSize: size * 0.68, letterSpacing: '0.01em' }}
        >
          Bharat<span style={{ color }}>.</span>
        </span>
        {showTagline && (
          <span className="block font-mono uppercase tracking-[0.18em]" style={{ color: 'var(--muted-foreground)', fontSize: size * 0.2 }}>
            by the evidence
          </span>
        )}
      </span>
    </span>
  )
}
