// ─────────────────────────────────────────────────────────────────────────
// GUPTA temple ornaments — original SVG drawings from documented Gupta / early-
// Hindu temple forms (Wikipedia: Hindu temple architecture, Gupta art):
//   • Shikhara + amalaka + kalasha (the crowning tower)
//   • Gavaksha / chaitya-arch (the horseshoe "kudu" window — repeating motif)
//   • Purna-kalasha (overflowing vase-and-foliage — pillar base & doorway)
//   • Torana / ornate doorway frame with foliate sakhas
//   • Kirtimukha (the guardian face)
// Palette-aware via currentColor; use as headings, dividers, frames, caps.
// ─────────────────────────────────────────────────────────────────────────

// ── Shikhara: the tower over the garbhagriha — curvilinear + amalaka + kalasha ──
export function Shikhara({ size = 64, color = 'currentColor', className }: { size?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size * 1.6} viewBox="0 0 60 96" className={className} fill="none" role="img" aria-label="Shikhara">
      {/* kalasha finial */}
      <circle cx="30" cy="6" r="2.4" fill={color} />
      <line x1="30" y1="8" x2="30" y2="12" stroke={color} strokeWidth="1.5" />
      {/* amalaka (ribbed disc) */}
      <ellipse cx="30" cy="15" rx="8" ry="3.4" fill={color} />
      {[...Array(9)].map((_, i) => (
        <line key={i} x1={22 + i * 2} y1="12.5" x2={22 + i * 2} y2="17.5" stroke="var(--card,#fff)" strokeWidth="0.6" opacity="0.5" />
      ))}
      {/* curvilinear tower: w = W(1-t)^1.35 */}
      <path
        d={(() => {
          const pts: string[] = []
          const H = 60, top = 18, W = 20
          for (let i = 0; i <= 20; i++) {
            const t = i / 20
            const w = W * Math.pow(1 - t, 0.6) + 3
            pts.push(`${30 - w / 2},${top + H * (1 - t)}`)
          }
          const right = [...pts].reverse().map((p) => { const [x, y] = p.split(','); return `${60 - +x},${y}` })
          return `M${pts.join(' L')} L${right.join(' L')} Z`
        })()}
        fill={color}
        opacity="0.9"
      />
      {/* vertical band (lata) + gavaksha nodes up the spine */}
      <line x1="30" y1="18" x2="30" y2="78" stroke="var(--card,#fff)" strokeWidth="0.8" opacity="0.4" />
      {[30, 44, 58, 70].map((y) => (
        <path key={y} d={`M27 ${y} a3 3 0 0 1 6 0`} stroke="var(--card,#fff)" strokeWidth="0.8" fill="none" opacity="0.5" />
      ))}
      {/* plinth */}
      <rect x="14" y="78" width="32" height="6" fill={color} />
      <rect x="10" y="84" width="40" height="5" fill={color} opacity="0.8" />
    </svg>
  )
}

// ── Gavaksha (chaitya-arch / horseshoe window) — a repeating ornament unit ──
export function Gavaksha({ size = 28, color = 'currentColor', className }: { size?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} fill="none" role="img" aria-label="Gavaksha arch">
      {/* horseshoe arch */}
      <path d="M6 28 L6 16 A10 10 0 0 1 26 16 L26 28" stroke={color} strokeWidth="2" fill="none" />
      {/* inner arch */}
      <path d="M11 28 L11 17 A5 5 0 0 1 21 17 L21 28" stroke={color} strokeWidth="1.2" fill="none" opacity="0.7" />
      {/* finial pip at the apex */}
      <circle cx="16" cy="5" r="1.6" fill={color} />
      {/* little flanking volutes */}
      <path d="M6 16 q-3 -2 -1 -5 M26 16 q3 -2 1 -5" stroke={color} strokeWidth="1.2" fill="none" opacity="0.7" />
    </svg>
  )
}

// A horizontal band of gavakshas — a facade cornice / section divider
export function GavakshaBand({ color = 'var(--accent)', height = 24, className }: { color?: string; height?: number; className?: string }) {
  return (
    <svg width="100%" height={height} viewBox="0 0 96 24" preserveAspectRatio="xMidYMid" className={className} aria-hidden="true">
      <defs>
        <pattern id="gavaksha-band" width="24" height="24" patternUnits="userSpaceOnUse">
          <g fill="none" stroke={color} strokeWidth="1.4">
            <path d="M4 22 L4 13 A8 8 0 0 1 20 13 L20 22" />
            <circle cx="12" cy="4" r="1.3" fill={color} />
          </g>
        </pattern>
      </defs>
      <rect width="96" height="24" fill="url(#gavaksha-band)" />
    </svg>
  )
}

// ── Purna-kalasha (overflowing vase-and-foliage) — abundance / pillar base ──
export function PurnaKalasha({ size = 48, color = 'currentColor', className }: { size?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} fill="none" role="img" aria-label="Purna kalasha">
      {/* the pot (kalasha) */}
      <path d="M16 30 Q14 44 24 44 Q34 44 32 30 Z" fill={color} />
      <ellipse cx="24" cy="30" rx="9" ry="2.6" fill={color} />
      <rect x="18" y="26" width="12" height="4" rx="1.5" fill={color} />
      {/* overflowing foliage / lotus buds spilling out */}
      <g stroke={color} strokeWidth="1.6" fill="none">
        <path d="M24 26 C 24 14, 24 12, 24 8" />
        <path d="M24 18 C 18 14, 14 16, 12 10" />
        <path d="M24 18 C 30 14, 34 16, 36 10" />
        <path d="M24 22 C 19 20, 16 22, 14 18" />
        <path d="M24 22 C 29 20, 32 22, 34 18" />
      </g>
      {/* buds */}
      {[[24, 6], [11, 8], [37, 8], [13, 16], [35, 16]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2" fill={color} />
      ))}
    </svg>
  )
}

// ── Kirtimukha — the guardian "face of glory" (lintel / seal ornament) ──
export function Kirtimukha({ size = 40, color = 'currentColor', className }: { size?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 40" className={className} fill="none" role="img" aria-label="Kirtimukha">
      {/* brow + mane */}
      <path d="M8 20 Q4 8 24 6 Q44 8 40 20" stroke={color} strokeWidth="2" fill="none" />
      {[...Array(9)].map((_, i) => {
        const a = -Math.PI + (i / 8) * Math.PI
        return <line key={i} x1={24 + Math.cos(a) * 17} y1={18 + Math.sin(a) * 12} x2={24 + Math.cos(a) * 21} y2={18 + Math.sin(a) * 15} stroke={color} strokeWidth="1.4" />
      })}
      {/* eyes */}
      <circle cx="17" cy="18" r="2.4" fill={color} />
      <circle cx="31" cy="18" r="2.4" fill={color} />
      {/* upper jaw with scroll ends (no lower jaw — the kirtimukha convention) */}
      <path d="M12 24 Q24 34 36 24" stroke={color} strokeWidth="2" fill="none" />
      <path d="M12 24 q-3 2 -1 5 M36 24 q3 2 1 5" stroke={color} strokeWidth="1.6" fill="none" />
      {/* fangs */}
      <path d="M17 26 l1.5 4 l1.5 -4 M28 26 l1.5 4 l1.5 -4" stroke={color} strokeWidth="1.2" fill="none" />
    </svg>
  )
}

// ── Torana / ornate doorway frame — wraps content in a Gupta door-frame with
//    foliate sakhas + a gavaksha keystone + purna-kalasha bases. ──
export function ToranaFrame({ children, color = 'var(--accent)', className }: { children: React.ReactNode; color?: string; className?: string }) {
  return (
    <div className={`relative ${className || ''}`}>
      {/* top lintel with a central gavaksha + kirtimukha keystone */}
      <div className="flex items-end justify-center" style={{ color }}>
        <GavakshaBand color={color} height={18} />
      </div>
      <div
        className="relative border-x-2 px-5 py-4"
        style={{ borderColor: color }}
      >
        {/* foliate corner buds */}
        <span className="absolute -left-1 top-2" style={{ color }}><Bud color={color} /></span>
        <span className="absolute -right-1 top-2 scale-x-[-1]" style={{ color }}><Bud color={color} /></span>
        {children}
      </div>
      {/* base: two purna-kalasha */}
      <div className="flex justify-between px-2" style={{ color }}>
        <PurnaKalasha size={26} color={color} />
        <PurnaKalasha size={26} color={color} />
      </div>
    </div>
  )
}
function Bud({ color }: { color: string }) {
  return (
    <svg width="14" height="18" viewBox="0 0 14 18" fill="none" aria-hidden>
      <path d="M7 18 C7 10 2 8 2 4 C2 1 7 1 7 6 C7 1 12 1 12 4 C12 8 7 10 7 18" stroke={color} strokeWidth="1.3" />
    </svg>
  )
}
