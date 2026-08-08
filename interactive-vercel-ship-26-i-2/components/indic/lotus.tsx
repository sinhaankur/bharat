// Lotus / floral motif — "flowers and nature were always on their pillars."
// The Ashokan capitals carry lotus (padma) bells, honeysuckle & floral bands.
// Two exports: a single lotus rosette, and a repeating floral-vine band divider.

export function Lotus({
  size = 40,
  color = 'currentColor',
  className,
  petals = 8,
}: {
  size?: number
  color?: string
  className?: string
  petals?: number
}) {
  const R = 46
  const petalArr = Array.from({ length: petals }, (_, i) => (i * 360) / petals)
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} role="img" aria-label="Lotus" fill="none">
      {/* outer petals */}
      <g stroke={color} strokeWidth="1.6">
        {petalArr.map((a) => (
          <path
            key={a}
            d="M50 50 C 42 26, 58 26, 50 50 Z"
            transform={`rotate(${a} 50 50)`}
          />
        ))}
      </g>
      {/* inner petals (offset) */}
      <g stroke={color} strokeWidth="1.2" opacity="0.7">
        {petalArr.map((a) => (
          <path
            key={a}
            d="M50 50 C 45 36, 55 36, 50 50 Z"
            transform={`rotate(${a + 360 / petals / 2} 50 50)`}
          />
        ))}
      </g>
      {/* seed pod */}
      <circle cx="50" cy="50" r="6" fill={color} />
      <circle cx="50" cy="50" r="3" fill="var(--card, #fff)" opacity="0.6" />
    </svg>
  )
}

// A horizontal floral-vine band — a running honeysuckle/lotus scroll, as on the
// pillar abacus. Repeats via SVG pattern; use as a section divider or header rule.
export function FloralBand({
  color = 'var(--ochre, #a8794a)',
  height = 22,
  className,
}: {
  color?: string
  height?: number
  className?: string
}) {
  return (
    <svg width="100%" height={height} viewBox="0 0 120 22" preserveAspectRatio="xMidYMid meet" className={className} aria-hidden="true">
      <defs>
        <pattern id="floral-band" width="40" height="22" patternUnits="userSpaceOnUse">
          <g fill="none" stroke={color} strokeWidth="1.3">
            {/* undulating vine */}
            <path d="M0 11 C 8 3, 12 3, 20 11 S 32 19, 40 11" />
            {/* alternating buds/leaves */}
            <path d="M10 7 c -3 -4, 3 -4, 0 0" fill={color} />
            <path d="M30 15 c -3 4, 3 4, 0 0" fill={color} />
            <circle cx="20" cy="11" r="2" fill={color} />
          </g>
        </pattern>
      </defs>
      <rect width="120" height="22" fill="url(#floral-band)" />
    </svg>
  )
}
