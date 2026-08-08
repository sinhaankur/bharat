// Jali — a repeating Indic lattice pattern (perforated-screen geometry). Rendered
// as a tiling SVG background: an 8-point star / interlaced grid, the classic
// geometric jali unit. Use as a FAINT, low-contrast texture behind panels and
// sections — "light through a stone screen", not loud decoration.

export function JaliPattern({ color = 'currentColor', opacity = 0.12, id = 'jali' }: { color?: string; opacity?: number; id?: string }) {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <pattern id={id} width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
          <g fill="none" stroke={color} strokeWidth="1.1" opacity={opacity}>
            {/* interlaced 8-point star + connecting grid — a common jali motif */}
            <path d="M30 6 L38 22 L54 30 L38 38 L30 54 L22 38 L6 30 L22 22 Z" />
            <rect x="14" y="14" width="32" height="32" transform="rotate(45 30 30)" />
            <circle cx="30" cy="30" r="6" />
            {/* edge links so tiles connect seamlessly */}
            <path d="M0 30 H6 M54 30 H60 M30 0 V6 M30 54 V60" />
          </g>
        </pattern>
      </defs>
    </svg>
  )
}

// A ready-to-use div background layer using the pattern above.
export default function JaliBackground({
  color = 'var(--ochre, #b8791f)',
  opacity = 0.1,
  className,
}: {
  color?: string
  opacity?: number
  className?: string
}) {
  const id = 'jali-bg'
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className || ''}`} aria-hidden="true">
      <JaliPattern color={color} opacity={opacity} id={id} />
      <svg width="100%" height="100%" className="absolute inset-0">
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </div>
  )
}
