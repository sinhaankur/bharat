// Dharmachakra — the 24-spoke wheel (as on the Ashoka pillars & the Indian flag).
// Our own original drawing (not the official State Emblem). Used as a divider,
// a loading spinner (spin), a section mark, and the "live" dot.

export default function Chakra({
  size = 24,
  color = 'currentColor',
  spin = false,
  className,
  strokeWidth = 1,
}: {
  size?: number
  color?: string
  spin?: boolean
  className?: string
  strokeWidth?: number
}) {
  const r = 50
  const hub = 8
  const spokes = Array.from({ length: 24 }, (_, i) => {
    const a = (i * 360) / 24 - 90
    const rad = (a * Math.PI) / 180
    return {
      x1: 60 + Math.cos(rad) * hub,
      y1: 60 + Math.sin(rad) * hub,
      x2: 60 + Math.cos(rad) * (r - 6),
      y2: 60 + Math.sin(rad) * (r - 6),
      // little "cog" dots at the rim, a stylised nod to the flag's chakra
      dx: 60 + Math.cos(rad + Math.PI / 24) * (r - 2),
      dy: 60 + Math.sin(rad + Math.PI / 24) * (r - 2),
    }
  })
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Dharmachakra"
      style={spin ? { animation: 'chakra-spin 12s linear infinite' } : undefined}
    >
      <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth={strokeWidth * 2} />
      <circle cx="60" cy="60" r={r - 4} fill="none" stroke={color} strokeWidth={strokeWidth * 0.6} opacity={0.5} />
      {spokes.map((s, i) => (
        <g key={i}>
          <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={color} strokeWidth={strokeWidth} />
          <circle cx={s.dx} cy={s.dy} r={strokeWidth * 0.9} fill={color} opacity={0.7} />
        </g>
      ))}
      <circle cx="60" cy="60" r={hub} fill={color} />
      <circle cx="60" cy="60" r={hub - 3} fill="none" stroke="var(--background, #fff)" strokeWidth={strokeWidth} opacity={0.4} />
    </svg>
  )
}
