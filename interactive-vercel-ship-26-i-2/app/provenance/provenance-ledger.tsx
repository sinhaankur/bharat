'use client'

// Provenance ledger — every source behind the atlas, by tier, with how many
// claims/figures it backs and where the gaps are. "Sourced, or it is a gap."
// From provenance.json.
import { useMemo, useState } from 'react'
import data from './provenance.json'

type Source = {
  source: string
  domain: string
  tier: number
  tier_label: string
  claims?: number
  figures?: number
  gaps?: number
}

const SOURCES = data.sources as Source[]
const TOTAL_CLAIMS = SOURCES.reduce((a, s) => a + (s.claims || 0), 0)
const TOTAL_FIGURES = SOURCES.reduce((a, s) => a + (s.figures || 0), 0)
const TOTAL_GAPS = SOURCES.reduce((a, s) => a + (s.gaps || 0), 0)

const TIER_COLOR: Record<number, string> = {
  1: 'var(--ajanta-green, #4f6b45)',
  2: 'var(--accent)',
  3: 'var(--gupta-stone, #c8664a)',
  4: 'var(--muted-foreground)',
}

export default function ProvenanceLedger() {
  const [tier, setTier] = useState<number | 'all'>('all')
  const tiers = useMemo(() => Array.from(new Set(SOURCES.map((s) => s.tier))).sort(), [])
  const rows = useMemo(
    () =>
      (tier === 'all' ? SOURCES : SOURCES.filter((s) => s.tier === tier)).slice().sort(
        (a, b) => (b.claims || 0) - (a.claims || 0),
      ),
    [tier],
  )

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      {/* totals */}
      <div className="mb-8 grid grid-cols-3 gap-3 stone-reveal">
        {[
          ['Claims backed', TOTAL_CLAIMS],
          ['Figures cited', TOTAL_FIGURES],
          ['Honest gaps', TOTAL_GAPS],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-border bg-card p-4 text-center">
            <div className="text-2xl font-black text-foreground">{(v as number).toLocaleString('en-IN')}</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{k}</div>
          </div>
        ))}
      </div>

      {/* tier filter */}
      <div className="mb-8 flex flex-wrap justify-center gap-2 stone-reveal">
        <button
          onClick={() => setTier('all')}
          className={`rounded-[var(--radius)] border px-3 py-1.5 text-sm font-semibold transition-all ${
            tier === 'all' ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]' : 'border-border text-muted-foreground hover:border-[var(--accent)]'
          }`}
        >
          All tiers
        </button>
        {tiers.map((t) => (
          <button
            key={t}
            onClick={() => setTier(t)}
            className="rounded-[var(--radius)] border border-border px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-all hover:border-[var(--accent)]"
            style={tier === t ? { borderColor: TIER_COLOR[t], color: TIER_COLOR[t] } : undefined}
          >
            Tier {t}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {rows.map((s, i) => (
          <a
            key={i}
            href={s.source}
            target="_blank"
            rel="noopener"
            className="stone-reveal lift block rounded-xl border border-border bg-card/70 p-4 transition-colors hover:border-[var(--accent)]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: TIER_COLOR[s.tier] }} />
                  <span className="truncate font-semibold text-foreground">{s.domain}</span>
                </div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">{s.tier_label}</div>
              </div>
              <div className="shrink-0 text-right font-mono text-[11px] text-muted-foreground">
                {s.claims ? <span className="text-foreground">{s.claims} claims</span> : null}
                {s.gaps ? <div className="text-[var(--gupta-stone,#c8664a)]">{s.gaps} gaps</div> : null}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
