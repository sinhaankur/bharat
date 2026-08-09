// GOPURAM PLATE — a South Indian (Dravida) temple gateway drawn as a measured
// survey sheet, the southern counterpart to the Nagara SurveyPlate. A tiered
// pyramidal tower (tala storeys diminishing upward), the barrel-vaulted shala
// crown, rows of kutas and salas, a row of kalashas, dimension lines + scale
// figure. Original drawing in the system — not a facsimile.

export default function GopuramPlate({
  plate = 'PLATE XIII',
  register = 'HERITAGE SURVEY · MEASURED ELEVATION',
  title = 'Dravida gopuram — Meenakshi temple, Madurai',
  date = 'c. 1600 CE',
  scale = 'scale 1 : 300',
  className,
}: {
  plate?: string
  register?: string
  title?: string
  date?: string
  scale?: string
  className?: string
}) {
  const ink = '#2a2018'
  const sepia = '#8a5a3a'
  const red = '#8a3020'

  // 7 diminishing storeys of the pyramidal tower
  const storeys = [
    { y: 636, x0: 150, x1: 570, h: 40 },
    { y: 596, x0: 168, x1: 552, h: 38 },
    { y: 558, x0: 186, x1: 534, h: 36 },
    { y: 522, x0: 204, x1: 516, h: 34 },
    { y: 488, x0: 222, x1: 498, h: 32 },
    { y: 456, x0: 240, x1: 480, h: 30 },
    { y: 426, x0: 258, x1: 462, h: 28 },
  ]

  return (
    <figure
      className={className}
      style={{
        background: '#e8dcc0',
        color: ink,
        fontFamily: 'Inter, sans-serif',
        borderRadius: 2,
        border: '1px solid rgba(42,32,24,.18)',
        boxShadow: '0 2px 10px rgba(42,32,24,.14)',
        backgroundImage:
          'radial-gradient(ellipse 90% 70% at 30% 20%, rgba(255,250,235,.5), transparent 60%),radial-gradient(ellipse 60% 50% at 80% 85%, rgba(160,130,80,.14), transparent 65%)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '18px 28px 10px', borderBottom: '1.5px solid rgba(42,32,24,.55)', margin: '0 16px' }}>
        <div>
          <div style={{ font: "600 9px 'JetBrains Mono', monospace", letterSpacing: '.2em', color: sepia }}>{plate} · {register}</div>
          <div style={{ font: '600 19px Fraunces, serif', marginTop: 3 }}>{title}</div>
        </div>
        <div style={{ font: "500 9.5px 'JetBrains Mono', monospace", color: '#6b5c48', textAlign: 'right' }}>{date}<br />{scale}</div>
      </div>

      <svg viewBox="0 0 720 760" style={{ width: '100%', display: 'block' }} aria-label={title}>
        {/* ground */}
        <line x1="90" y1="700" x2="640" y2="700" stroke={ink} strokeWidth="2" />
        <line x1="70" y1="708" x2="660" y2="708" stroke={ink} strokeWidth=".7" opacity=".5" />

        <g fill="none" stroke={ink} strokeWidth="1.1">
          {/* base — the massive stone gateway with the doorway */}
          <path d="M132 700 V636 H588 V700" strokeWidth="1.4" />
          <path d="M300 700 V656 C300 640 330 632 360 632 C390 632 420 640 420 656 V700" strokeWidth="1.2" />
          <g strokeWidth=".7" opacity=".7"><path d="M150 692 H570 M150 680 H570 M150 668 H570" /></g>

          {/* the diminishing storeys (talas) */}
          {storeys.map((s, i) => (
            <g key={i}>
              <path d={`M${s.x0} ${s.y} V${s.y - s.h} H${s.x1} V${s.y}`} strokeWidth={i === 0 ? 1.2 : 0.9} />
              {/* cornice line + a row of small shrine cells */}
              <path d={`M${s.x0 + 6} ${s.y - s.h + 6} H${s.x1 - 6}`} strokeWidth=".55" opacity=".6" />
              {Array.from({ length: 5 }).map((_, k) => {
                const w = (s.x1 - s.x0 - 24) / 5
                const x = s.x0 + 12 + k * w
                return <rect key={k} x={x} y={s.y - s.h + 10} width={w * 0.7} height={s.h - 18} strokeWidth=".5" opacity=".75" />
              })}
            </g>
          ))}

          {/* the barrel-vaulted shala crown */}
          <path d="M270 426 V400 C270 384 312 374 360 374 C408 374 450 384 450 400 V426" strokeWidth="1.3" />
          <path d="M270 400 C270 372 312 360 360 360 C408 360 450 372 450 400" strokeWidth="1.4" stroke={red} />
          {/* the finial-horn ends (nasika) + kalasha row */}
          <path d="M262 400 C256 388 262 380 272 382 M458 400 C464 388 458 380 448 382" strokeWidth="1" />
          {[300, 330, 360, 390, 420].map((x) => (
            <g key={x}>
              <ellipse cx={x} cy={356} rx="7" ry="4" strokeWidth=".9" />
              <path d={`M${x} 352 V344 M${x - 4} 344 H${x + 4} M${x} 344 V338`} strokeWidth=".8" />
            </g>
          ))}
        </g>

        {/* dimension lines */}
        <g stroke={ink} fill="none" strokeWidth=".8">
          <path d="M108 700 V338 M104 700 H112 M104 338 H112" />
          <path d="M600 700 V636 M596 700 H604 M596 636 H604" />
        </g>
        <g fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#5a4632">
          <text x="70" y="520" transform="rotate(-90 70 520)">51.9 m — nine diminishing talas</text>
          <text x="612" y="672" transform="rotate(-90 612 672)">gateway 8 m</text>
          <text x="250" y="732">STONE GATEWAY — GRANITE BASE + DOORWAY</text>
          <text x="452" y="392" fill={red}>SHALA — BARREL VAULT</text>
          <text x="452" y="356" fill={red}>KALASHA ROW · 13</text>
          <text x="300" y="470" opacity=".8">TALA STOREYS — STUCCO FIGURES</text>
        </g>

        {/* scale figure */}
        <g fill="none" stroke={ink} strokeWidth="1">
          <circle cx="160" cy="668" r="6" />
          <path d="M160 674 V694 M160 680 L150 688 M160 680 L170 688 M160 694 L152 700 M160 694 L168 700" />
          <line x1="146" y1="702" x2="174" y2="702" strokeWidth=".8" />
        </g>
        <text x="140" y="714" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#5a4632">1.7 m</text>
      </svg>

      <figcaption style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 28px 16px', margin: '0 16px', borderTop: '1.5px solid rgba(42,32,24,.55)', font: "500 9px 'JetBrains Mono', monospace", letterSpacing: '.12em', color: sepia }}>
        <span>SOURCED: ASI · DIMENSIONS T1</span>
        <span>DRAWN IN THE SYSTEM — NOT A SURVEY FACSIMILE</span>
        <span>BHARAT · HERITAGE</span>
      </figcaption>
    </figure>
  )
}
