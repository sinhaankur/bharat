import type { Lean } from '@/lib/bias-engine'

const SEGS: { key: Lean; color: string; label: string }[] = [
  { key: 'left', color: 'oklch(0.5 0.14 260)', label: 'L' },
  { key: 'center-left', color: 'oklch(0.6 0.09 250)', label: 'CL' },
  { key: 'center', color: 'oklch(0.62 0.02 80)', label: 'C' },
  { key: 'center-right', color: 'oklch(0.62 0.1 40)', label: 'CR' },
  { key: 'right', color: 'oklch(0.55 0.16 25)', label: 'R' },
]

export default function BiasBar({
  spread,
  total,
}: {
  spread: { counts: Record<Lean, number> }
  total: number
}) {
  const rated = SEGS.reduce((n, s) => n + spread.counts[s.key], 0) || 1
  return (
    <div className="mt-4">
      <div className="flex h-6 overflow-hidden rounded">
        {SEGS.map((s) => {
          const n = spread.counts[s.key]
          const w = (n / rated) * 100
          return w > 0 ? (
            <span
              key={s.key}
              style={{ width: `${w}%`, background: s.color }}
              title={`${s.label} ${n}`}
              className="flex items-center justify-center text-[10px] font-bold text-white/90"
            >
              {w > 8 ? n : ''}
            </span>
          ) : null
        })}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground">
        <span>◄ Left</span>
        <span>Center</span>
        <span>Right ►</span>
      </div>
      {spread.counts.unrated > 0 && (
        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
          {spread.counts.unrated} source{spread.counts.unrated > 1 ? 's' : ''} unrated (honest gap)
        </p>
      )}
    </div>
  )
}
