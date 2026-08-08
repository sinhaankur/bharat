// Lion mark — an ORIGINAL, stylised single-lion silhouette evoking the Sarnath
// capital, for use as the brand mark. Deliberately NOT the official four-lion
// State Emblem (whose use is legally restricted). A simplified, geometric lion
// head facing forward, seated on a lotus-bell base line.

export default function LionMark({
  size = 32,
  color = 'currentColor',
  className,
}: {
  size?: number
  color?: string
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Bharat"
      fill="none"
    >
      {/* mane — a ring of stylised locks */}
      <g stroke={color} strokeWidth="2" strokeLinejoin="round">
        <path d="M32 8 C20 8 12 17 12 29 C12 40 20 47 32 47 C44 47 52 40 52 29 C52 17 44 8 32 8 Z" opacity="0.25" />
      </g>
      {/* mane locks (radial ticks) */}
      <g stroke={color} strokeWidth="1.6" strokeLinecap="round">
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 360) / 12 - 90
          const rad = (a * Math.PI) / 180
          const inner = 20
          const outer = 25
          return (
            <line
              key={i}
              x1={32 + Math.cos(rad) * inner}
              y1={29 + Math.sin(rad) * inner}
              x2={32 + Math.cos(rad) * outer}
              y2={29 + Math.sin(rad) * outer}
            />
          )
        })}
      </g>
      {/* face */}
      <g fill={color}>
        <circle cx="32" cy="27" r="12" opacity="0.9" />
      </g>
      <g fill="var(--background, #fff)">
        {/* eyes */}
        <circle cx="27" cy="25" r="1.6" />
        <circle cx="37" cy="25" r="1.6" />
        {/* muzzle */}
        <path d="M32 28 l-3 5 h6 Z" />
      </g>
      {/* lotus-bell base line */}
      <path d="M18 54 Q32 48 46 54 M22 58 Q32 53 42 58" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  )
}
