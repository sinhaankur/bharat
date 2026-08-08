import type { NewsItem } from '@/lib/news'

const SENT_STYLE: Record<string, { bg: string; label: string; icon: string }> = {
  negative: { bg: 'oklch(0.58 0.16 25)', label: 'Negative', icon: '▼' },
  neutral: { bg: 'oklch(0.62 0.02 80)', label: 'Neutral', icon: '■' },
  positive: { bg: 'oklch(0.55 0.14 150)', label: 'Positive', icon: '▲' },
}
const MOVE_STYLE: Record<string, string> = {
  short: 'Short-term move',
  long: 'Long-haul move',
  both: 'Now + long game',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600_000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function NewsCard({ item }: { item: NewsItem }) {
  const s = SENT_STYLE[item.sentiment.label]
  const rated = item.bias.rated
  return (
    <article className="group py-5">
      <div className="flex flex-wrap items-center gap-2">
        {/* source */}
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-foreground">
          {item.source}
        </span>
        {/* bias chip */}
        <span
          className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
            rated ? 'text-white' : 'border border-border text-muted-foreground'
          }`}
          style={rated ? { background: biasColor(item.bias.position) } : undefined}
          title="Media-lean — an assessment of the outlet, not this story"
        >
          {item.bias.label}
        </span>
        {/* ownership chip — state / public / private */}
        {item.bias.ownership !== 'unknown' && (
          <span
            className="rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide"
            style={{
              borderColor:
                item.bias.ownership === 'state'
                  ? 'oklch(0.6 0.16 25)'
                  : item.bias.ownership === 'public'
                    ? 'oklch(0.6 0.12 250)'
                    : 'var(--border)',
              color:
                item.bias.ownership === 'state'
                  ? 'oklch(0.5 0.16 25)'
                  : item.bias.ownership === 'public'
                    ? 'oklch(0.45 0.12 250)'
                    : 'var(--muted-foreground)',
            }}
            title="Who owns/funds the outlet — whose interest may shape coverage"
          >
            {item.bias.ownership === 'state' ? '🏛 Govt-run' : item.bias.ownership === 'public' ? '📡 Public' : 'Private'}
          </span>
        )}
        {/* sentiment chip */}
        <span
          className="rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-white"
          style={{ background: s.bg }}
          title="Headline tone — reads framing, not truth"
        >
          {s.icon} {s.label}
        </span>
        {/* move chip */}
        <span
          className="rounded-full border border-accent/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-accent"
          title={item.move.note}
        >
          ♟ {MOVE_STYLE[item.move.horizon]}
        </span>
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">{timeAgo(item.publishedAt)}</span>
      </div>

      <h3 className="mt-2 font-serif text-xl font-bold leading-snug decoration-accent decoration-2 underline-offset-4 group-hover:underline">
        <a href={item.url} target="_blank" rel="noopener">
          {item.title}
        </a>
      </h3>
      {item.description && (
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
      )}
      <p className="mt-2 text-[13px] italic text-muted-foreground">{item.move.note}</p>
    </article>
  )
}

// gradient from left (blue) → center (grey) → right (red) by position 0..100
function biasColor(pos: number): string {
  if (pos < 40) return 'oklch(0.5 0.14 260)' // left = blue
  if (pos > 60) return 'oklch(0.55 0.16 25)' // right = red
  return 'oklch(0.5 0.02 80)' // center = grey
}
