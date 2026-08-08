'use client'

// ─────────────────────────────────────────────────────────────────────────
// PUNCH COIN — a sketch of a Mauryan silver KARSHAPANA (punch-marked coin,
// c. 4th–2nd c. BCE). Real karshapanas were struck with several independent
// PUNCHES, each a symbol: the sun, the six-armed symbol (shadara/chakra), the
// tree-in-railing, the hill-with-crescent, an elephant, a peacock-on-arches,
// the taurine/nandipada. We draw them as fine incised line-marks on a worn
// silver disc — a coin AND a seal for the brand. Reduce-motion → no drift.
// ─────────────────────────────────────────────────────────────────────────

const S = 200
const C = 100

// ── the individual punch symbols, each drawn around a small local origin ──
function Sun() {
  // central boss + radiating dots (the classic six-armed "sun" punch)
  return (
    <g stroke="currentColor" strokeWidth="2" fill="none">
      <circle r="7" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI) / 4
        return <line key={i} x1={Math.cos(a) * 9} y1={Math.sin(a) * 9} x2={Math.cos(a) * 15} y2={Math.sin(a) * 15} />
      })}
    </g>
  )
}
function SixArm() {
  // the six-armed symbol: six arms ending in taurine/knobs around a hub
  return (
    <g stroke="currentColor" strokeWidth="2" fill="none">
      <circle r="3.5" fill="currentColor" />
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i * Math.PI) / 3
        const x = Math.cos(a) * 15
        const y = Math.sin(a) * 15
        return (
          <g key={i}>
            <line x1={0} y1={0} x2={x} y2={y} />
            <circle cx={x} cy={y} r="3" />
          </g>
        )
      })}
    </g>
  )
}
function TreeInRailing() {
  // a stylised tree (branching) inside a small square railing (vedika)
  return (
    <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round">
      <rect x="-13" y="-13" width="26" height="26" rx="2" strokeWidth="1.6" />
      <path d="M0 12 V-2 M0 2 L-7 -6 M0 2 L7 -6 M0 -3 L-5 -11 M0 -3 L5 -11 M0 -8 V-13" />
    </g>
  )
}
function HillCrescent() {
  // three-arched hill (mountain) crowned with a crescent — the "ujjain"/hill punch
  return (
    <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round">
      <path d="M-16 8 Q-11 -4 -6 8 Q-1 -6 4 8 Q9 -3 14 8" />
      <path d="M0 -8 A6 6 0 1 1 6 -12" />
    </g>
  )
}
function Elephant() {
  // a minimal elephant glyph, facing left, trunk down
  return (
    <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round">
      <path d="M12 -2 Q12 -9 4 -9 Q-6 -9 -8 -2 L-12 -1 Q-14 2 -12 4 L-11 0 M-8 -2 L-8 8 M-3 -3 L-3 8 M4 -4 L4 8 M9 -3 L9 8 M12 -2 Q13 3 9 6" />
    </g>
  )
}
function Taurine() {
  // nandipada / taurine — a small motif used as a filler punch
  return (
    <g stroke="currentColor" strokeWidth="2" fill="none">
      <path d="M0 6 V-1 M0 -1 A4 4 0 1 1 -0.1 -1" />
      <circle cy="-5" r="2.2" fill="currentColor" stroke="none" />
    </g>
  )
}

const PUNCHES = [
  { at: [64, 62], node: <Sun /> },
  { at: [138, 66], node: <SixArm /> },
  { at: [66, 138], node: <TreeInRailing /> },
  { at: [138, 138], node: <HillCrescent /> },
  { at: [100, 100], node: <Elephant /> },
  { at: [100, 44], node: <Taurine /> },
]

export default function PunchCoin({
  size = 160,
  color = 'var(--accent)',
  edge = 'var(--foreground)',
  className,
  spin = false,
}: {
  size?: number
  color?: string
  edge?: string
  className?: string
  spin?: boolean
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${S} ${S}`}
      className={className}
      role="img"
      aria-label="Mauryan punch-marked coin"
      style={{ animation: spin ? 'mandala-spin 90s linear infinite' : undefined, transformOrigin: 'center' }}
    >
      {/* worn bronze disc — a solid warm metal so the incised marks read clearly */}
      <defs>
        <radialGradient id="bronze" cx="38%" cy="34%" r="78%">
          <stop offset="0%" stopColor="#d9bd86" />
          <stop offset="60%" stopColor="#c39a5c" />
          <stop offset="100%" stopColor="#8a5e30" />
        </radialGradient>
      </defs>
      <circle cx={C} cy={C} r="92" fill="url(#bronze)" stroke="#5a3a1c" strokeWidth="3" />
      {/* an irregular flan edge — coin was cut, not round */}
      <circle cx={C} cy={C} r="85" fill="none" stroke="#5a3a1c" strokeWidth="1" opacity="0.45" />
      {/* the punches — deep incised marks struck into the metal */}
      <g style={{ color: '#3a2612' }} strokeLinejoin="round">
        {PUNCHES.map((p, i) => (
          <g key={i} transform={`translate(${p.at[0]} ${p.at[1]})`}>
            {p.node}
          </g>
        ))}
      </g>
    </svg>
  )
}
