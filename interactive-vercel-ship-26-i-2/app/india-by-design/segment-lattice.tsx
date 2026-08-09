'use client'

// SEGMENT LATTICE — the heart of "India by Design Systems": 34 place-based design
// segments (one per state/UT), grouped by region. Each card carries a motif bar
// derived from the place's architecture, a 4-swatch palette, the design-translation
// rules (built form → interface behaviour), and its pillar/house/temple sources.
import data from './segments.json'

type Rule = { from: string; to: string }
type Segment = {
  name: string
  region: string
  desc: string
  motif: string // a CSS `background:...` string
  swatches: string[]
  rules: Rule[]
  sources: string
}
type Region = { label: string; segments: Segment[] }

const REGIONS = (data as { regions: Region[] }).regions

export default function SegmentLattice() {
  return (
    <section className="pb-24">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-0.5 border-2 border-[#3a2c1e] bg-[#3a2c1e]">
        {REGIONS.map((r) => (
          <div key={r.label} className="contents">
            {/* region header spans the row */}
            <div className="col-[1/-1] bg-[#f6f0e1] px-5 py-3 text-[11px] uppercase tracking-[0.1em] text-[#8a3a12]">
              {r.label}
            </div>
            {r.segments.map((s) => (
              <article
                key={s.name}
                className="group bg-[#f6f0e1] transition-all duration-200 hover:bg-[#fdf9ee] hover:shadow-[inset_0_-4px_0_#c1440e]"
              >
                {/* motif bar — the place's architecture as texture */}
                <div className="h-[18px] shadow-[inset_0_-2px_rgba(32,30,29,0.25)]" style={cssBg(s.motif)} />
                <div className="px-5 pb-3.5 pt-4">
                  <p className="m-0 text-[19px]" style={{ fontFamily: "'Rozha One', serif" }}>{s.name}</p>
                  <p className="mt-0.5 text-[9.5px] uppercase tracking-[0.07em] text-[#8a3a12]">{s.region}</p>
                  <p className="mt-2 text-[11.5px] leading-4 text-[#2a2018]/70">{s.desc}</p>
                  {/* palette */}
                  <div className="mt-3 flex">
                    {s.swatches.map((c, i) => (
                      <div key={i} className="h-4 flex-1" style={{ background: c }} />
                    ))}
                  </div>
                  {/* translation rules */}
                  <div className="mt-3 space-y-1">
                    {s.rules.map((rule, i) => (
                      <p key={i} className="text-[11px] text-[#2a2018]">
                        {rule.from} → <strong className="text-[10px] text-[#8a3a12]">{rule.to}</strong>
                      </p>
                    ))}
                  </div>
                  {s.sources && (
                    <p className="mt-2.5 text-[10px] uppercase leading-[14px] tracking-[0.04em] text-[#2a2018]/60">
                      {s.sources}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

// parse a "background:..." css string into a style object (keeps gradients intact)
function cssBg(motif: string): React.CSSProperties {
  const out: React.CSSProperties = {}
  // motif is like "background:repeating-linear-gradient(...)" or has multiple props
  motif.split(';').forEach((decl) => {
    const idx = decl.indexOf(':')
    if (idx < 0) return
    const key = decl.slice(0, idx).trim()
    const val = decl.slice(idx + 1).trim()
    if (key === 'background') out.background = val
    else if (key === 'background-color') out.backgroundColor = val
    else if (key === 'background-image') out.backgroundImage = val
    else if (key === 'background-size') out.backgroundSize = val
    else if (key === 'background-repeat') out.backgroundRepeat = val as React.CSSProperties['backgroundRepeat']
  })
  return out
}
