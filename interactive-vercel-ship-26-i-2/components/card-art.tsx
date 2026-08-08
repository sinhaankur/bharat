// CardArt — on-brand SVG "data snapshots" instead of stock photos.
// Honest, instant, rights-free, distinctly Bharat. One per category/section.
// Palette pulls from the design tokens (ink, gold accent, warm paper).

type Props = { kind?: string; className?: string }

const INK = 'var(--foreground)'
const GOLD = 'var(--accent)'
const PAPER = 'var(--card)'
const MUTE = 'var(--muted-foreground)'
const PANEL = 'var(--secondary)'

// a simple India-ish silhouette path (stylised, not survey-accurate — it's an icon)
const INDIA =
  'M52 8 L64 12 L70 10 L74 18 L70 26 L78 30 L74 40 L80 46 L72 54 L64 52 L58 62 L52 74 L46 60 L40 54 L34 58 L30 48 L36 40 L30 32 L38 26 L34 18 L44 14 Z'

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 100 62" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      {children}
    </svg>
  )
}

export default function CardArt({ kind = 'default', className }: Props) {
  const art = (() => {
    switch (kind) {
      case 'History':
        // an era spine — dots on a timeline
        return (
          <Frame>
            <rect width="100" height="62" fill={PANEL} />
            <line x1="14" y1="31" x2="86" y2="31" stroke={MUTE} strokeWidth="1.2" />
            {[20, 34, 48, 62, 76].map((x, i) => (
              <circle key={x} cx={x} cy="31" r={i === 2 ? 5 : 3.4} fill={i === 2 ? GOLD : INK} />
            ))}
            <text x="14" y="14" fill={MUTE} fontSize="6" fontFamily="monospace">
              5,000 yrs
            </text>
          </Frame>
        )
      case 'Languages':
        // script glyph fan
        return (
          <Frame>
            <rect width="100" height="62" fill={PANEL} />
            {['अ', 'অ', 'ਅ', 'அ', 'క'].map((g, i) => (
              <text key={i} x={14 + i * 17} y="40" fill={i === 0 ? GOLD : INK} fontSize="18" fontFamily="serif">
                {g}
              </text>
            ))}
          </Frame>
        )
      case 'Land':
        // terrain / flood layers
        return (
          <Frame>
            <rect width="100" height="62" fill={PANEL} />
            <path d="M0 46 Q25 34 50 42 T100 38 V62 H0 Z" fill={INK} opacity="0.85" />
            <path d="M0 52 Q25 44 50 50 T100 46 V62 H0 Z" fill={GOLD} opacity="0.5" />
          </Frame>
        )
      case 'Money':
        // district map with hotspots
        return (
          <Frame>
            <rect width="100" height="62" fill={INK} />
            <path d={INDIA} fill="var(--secondary)" opacity="0.28" transform="translate(24,-4) scale(0.72)" />
            <circle cx="52" cy="24" r="3.4" fill={GOLD} />
            <circle cx="58" cy="38" r="2.6" fill={GOLD} />
            <circle cx="44" cy="34" r="2" fill={PAPER} />
          </Frame>
        )
      case 'News':
        // a bias bar (left→center→right) with a sentiment dot
        return (
          <Frame>
            <rect width="100" height="62" fill={PAPER} />
            <rect x="14" y="26" width="24" height="10" fill="oklch(0.5 0.14 260)" />
            <rect x="38" y="26" width="24" height="10" fill={MUTE} />
            <rect x="62" y="26" width="24" height="10" fill="oklch(0.55 0.16 25)" />
            <circle cx="50" cy="31" r="4.5" fill={GOLD} stroke={PAPER} strokeWidth="1.5" />
            <text x="14" y="18" fill={MUTE} fontSize="5.5" fontFamily="monospace">
              LEFT · CENTER · RIGHT
            </text>
          </Frame>
        )
      case '3D':
        // a globe
        return (
          <Frame>
            <rect width="100" height="62" fill={INK} />
            <circle cx="50" cy="31" r="20" fill="none" stroke={GOLD} strokeWidth="1.2" />
            <ellipse cx="50" cy="31" rx="20" ry="7" fill="none" stroke={MUTE} strokeWidth="0.8" />
            <ellipse cx="50" cy="31" rx="8" ry="20" fill="none" stroke={MUTE} strokeWidth="0.8" />
            <path d={INDIA} fill={GOLD} opacity="0.6" transform="translate(34,14) scale(0.42)" />
          </Frame>
        )
      default:
        // a generic chart
        return (
          <Frame>
            <rect width="100" height="62" fill={PANEL} />
            {[[18, 40, 12], [32, 28, 24], [46, 44, 8], [60, 20, 32], [74, 34, 18]].map(([x, y, h], i) => (
              <rect key={x} x={x} y={y} width="8" height={h} rx="1" fill={i === 3 ? GOLD : INK} />
            ))}
            <line x1="10" y1="52" x2="90" y2="52" stroke={MUTE} strokeWidth="1" />
          </Frame>
        )
    }
  })()
  return (
    <div className={`aspect-[16/9] w-full overflow-hidden border border-border ${className || ''}`}>{art}</div>
  )
}
