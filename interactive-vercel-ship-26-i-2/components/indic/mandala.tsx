'use client'

// ─────────────────────────────────────────────────────────────────────────
// MANDALA — a generative Indic radial ornament (the center-of-focus / garbhagriha
// principle as pure geometry). Concentric rings of lotus petals, gavaksha arches,
// dots and spokes, symmetric, in the warm palette. The "amazing mandala".
// Slow-rotates (reduce-motion freezes). Use as a hero backdrop / section centrepiece.
// ─────────────────────────────────────────────────────────────────────────

type RingKind = 'petals' | 'arches' | 'dots' | 'spokes' | 'teeth' | 'buds'
type Ring = { r: number; count: number; kind: RingKind; w?: number; color?: string; spin?: number }

const C = 200 // svg center (viewBox 0 0 400 400)
const n = (v: number) => Math.round(v * 100) / 100 // round → server/client match (no hydration drift)

function petal(cx: number, cy: number, len: number, wide: number, rot: number) {
  // a lotus petal (pointed leaf) pointing outward from center
  return `M${cx} ${cy}
    C ${cx - wide} ${cy - len * 0.5}, ${cx - wide * 0.3} ${cy - len}, ${cx} ${cy - len}
    C ${cx + wide * 0.3} ${cy - len}, ${cx + wide} ${cy - len * 0.5}, ${cx} ${cy} Z`
}

function ringNodes(ring: Ring, accent: string, ink: string) {
  const nodes: JSX.Element[] = []
  const col = ring.color === 'accent' ? accent : ring.color === 'ink' ? ink : ring.color || accent
  for (let i = 0; i < ring.count; i++) {
    const a = n((i * 360) / ring.count)
    const rad = ((a - 90) * Math.PI) / 180
    const x = n(C + Math.cos(rad) * ring.r)
    const y = n(C + Math.sin(rad) * ring.r)
    const key = `${ring.r}-${i}`
    switch (ring.kind) {
      case 'petals':
        nodes.push(
          <path key={key} d={petal(C, C, ring.r + 14, ring.w || 12, a)} transform={`rotate(${a} ${C} ${C})`}
            fill="none" stroke={col} strokeWidth={ring.w ? 1 : 1.3} />
        )
        break
      case 'buds':
        nodes.push(<circle key={key} cx={x} cy={y} r={(ring.w || 4)} fill={col} />)
        break
      case 'dots':
        nodes.push(<circle key={key} cx={x} cy={y} r={(ring.w || 2)} fill={col} />)
        break
      case 'arches': // gavaksha-like little horseshoes pointing out
        nodes.push(
          <path key={key} d={`M${x - 6} ${y + 5} L${x - 6} ${y} A6 6 0 0 1 ${x + 6} ${y} L${x + 6} ${y + 5}`}
            transform={`rotate(${a} ${x} ${y})`} fill="none" stroke={col} strokeWidth="1.3" />
        )
        break
      case 'teeth':
        nodes.push(
          <path key={key} d={`M${C} ${C} L${x} ${y}`} stroke={col} strokeWidth={ring.w || 0.8} opacity={0.5} />
        )
        break
      case 'spokes':
        nodes.push(
          <line key={key} x1={n(C + Math.cos(rad) * (ring.r - 8))} y1={n(C + Math.sin(rad) * (ring.r - 8))}
            x2={x} y2={y} stroke={col} strokeWidth={ring.w || 1} />
        )
        break
    }
  }
  return nodes
}

export default function Mandala({
  size = 360,
  accent = 'var(--accent)',
  ink = 'var(--foreground)',
  rose = 'var(--dusty-rose, #b07f7a)',
  spin = true,
  className,
  opacity = 1,
}: {
  size?: number
  accent?: string
  ink?: string
  rose?: string
  spin?: boolean
  className?: string
  opacity?: number
}) {
  // the ring recipe — outer to inner, alternating motifs (rich but ordered)
  const rings: Ring[] = [
    { r: 190, count: 48, kind: 'teeth', color: 'accent' },
    { r: 182, count: 1, kind: 'dots' }, // (circle drawn separately below)
    { r: 168, count: 24, kind: 'arches', color: 'ink' },
    { r: 150, count: 32, kind: 'dots', w: 2.4, color: 'accent' },
    { r: 120, count: 16, kind: 'petals', w: 22, color: 'ink' },
    { r: 118, count: 24, kind: 'buds', w: 3, color: rose },
    { r: 84, count: 12, kind: 'petals', color: 'accent' },
    { r: 70, count: 24, kind: 'spokes', w: 0.8, color: 'ink' },
    { r: 44, count: 8, kind: 'petals', w: 14, color: rose },
    { r: 22, count: 16, kind: 'dots', w: 1.6, color: 'accent' },
  ]
  const circles = [192, 150, 118, 84, 44, 12]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label="Mandala"
      style={{
        opacity,
        transformOrigin: 'center',
        animation: spin ? 'mandala-spin 120s linear infinite' : undefined,
      }}
    >
      {/* concentric ground circles */}
      {circles.map((r) => (
        <circle key={r} cx={C} cy={C} r={r} fill="none" stroke={accent} strokeWidth={r === 12 ? 0 : 0.8} opacity={0.4} />
      ))}
      {rings.map((ring) => (
        <g key={`${ring.r}-${ring.kind}`}>{ringNodes(ring, accent, ink)}</g>
      ))}
      {/* seed at the very center — a small lotus */}
      <g>
        {Array.from({ length: 8 }).map((_, i) => (
          <path key={i} d={petal(C, C, 20, 8, 0)} transform={`rotate(${(i * 360) / 8} ${C} ${C})`} fill={accent} opacity={0.9} />
        ))}
        <circle cx={C} cy={C} r={5} fill={ink} />
      </g>
    </svg>
  )
}
