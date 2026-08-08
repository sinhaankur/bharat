// EditorialBrief — the per-page editorial contract (React port of page-brief.js).
// Explainer · Research · References · Documentation, on the sourced-or-gap credo.

type Ref = { label: string; href: string }

export type Brief = {
  section?: string
  explainer?: string
  research?: string
  references?: Ref[]
  docs?: string
  updated?: string
}

const ICONS: Record<string, string> = {
  Explainer: '◆',
  Research: '⚗',
  References: '❝',
  Documentation: '▤',
}

function Refs({ refs }: { refs?: Ref[] }) {
  if (!refs || !refs.length)
    return <span className="italic text-muted-foreground">references not yet attached — a gap, not hidden</span>
  return (
    <>
      {refs.map((r, i) => {
        const ext = /^https?:/.test(r.href)
        return (
          <span key={r.href}>
            {i > 0 && <span className="mx-2 text-border">·</span>}
            <a
              href={r.href}
              {...(ext ? { target: '_blank', rel: 'noopener' } : {})}
              className="text-accent underline-offset-2 hover:underline"
            >
              {r.label}
              {ext ? ' ↗' : ''}
            </a>
          </span>
        )
      })}
    </>
  )
}

export default function EditorialBrief({ brief }: { brief: Brief }) {
  const rows: { k: string; node: React.ReactNode }[] = [
    { k: 'Explainer', node: brief.explainer || <Gap /> },
    { k: 'Research', node: brief.research || <Gap /> },
    { k: 'References', node: <Refs refs={brief.references} /> },
    {
      k: 'Documentation',
      node: (
        <Refs
          refs={[
            { label: 'How this was built', href: brief.docs || '/how-it-works.html' },
            { label: 'Methodology', href: '/about.html' },
          ]}
        />
      ),
    },
  ]
  return (
    <aside
      aria-label="About this page"
      className="mx-auto my-12 max-w-3xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="mb-3 flex flex-wrap items-baseline gap-3 border-b border-border pb-3">
        <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
          The editorial brief
        </span>
        {brief.section && (
          <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
            {brief.section}
          </span>
        )}
        {brief.updated && (
          <span className="font-mono text-[11px] text-muted-foreground">updated {brief.updated}</span>
        )}
        <span className="ml-auto font-mono text-[11px] italic text-accent">Sourced, or it’s a gap.</span>
      </div>
      <div>
        {rows.map((r, i) => (
          <div
            key={r.k}
            className={`grid grid-cols-1 gap-1 py-2 md:grid-cols-[150px_1fr] md:gap-4 ${
              i > 0 ? 'border-t border-dashed border-border' : ''
            }`}
          >
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-primary">
              <span className="text-accent">{ICONS[r.k]}</span>
              {r.k}
            </div>
            <div className="text-sm leading-relaxed text-foreground">{r.node}</div>
          </div>
        ))}
      </div>
    </aside>
  )
}

function Gap() {
  return <span className="italic text-muted-foreground">not stated — a gap</span>
}
