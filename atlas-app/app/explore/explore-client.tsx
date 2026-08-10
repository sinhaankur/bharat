'use client'

import { useMemo, useState } from 'react'

// Explore/query — mockup 1d "Modernist Edict": strict 2px grid + accent-red poster.
// Facets combine with AND; the table lists districts where the active signals overlap.
// (Sample rows drawn from the mockup; the full 594-row engine is on the classic atlas.)

type Row = { district: string; state: string; inflow: string; signals: number; coverage: number; facets: string[] }
const ROWS: Row[] = [
  { district: 'North 24 Parganas', state: 'West Bengal', inflow: 'gap', signals: 4, coverage: 61, facets: ['crz', 'flood', 'freeze'] },
  { district: 'Birbhum', state: 'West Bengal', inflow: '₹0 frozen', signals: 3, coverage: 78, facets: ['flood', 'freeze', 'money'] },
  { district: 'Ernakulam', state: 'Kerala', inflow: '₹225 cr', signals: 3, coverage: 84, facets: ['crz', 'flood', 'money'] },
  { district: 'Greater Bombay', state: 'Maharashtra', inflow: '₹74,427 cr', signals: 3, coverage: 92, facets: ['crz', 'money', 'freeze'] },
  { district: 'South 24 Parganas', state: 'West Bengal', inflow: 'gap', signals: 4, coverage: 58, facets: ['crz', 'flood', 'freeze'] },
  { district: 'Thiruvananthapuram', state: 'Kerala', inflow: '₹180 cr', signals: 2, coverage: 80, facets: ['crz', 'money'] },
  { district: 'Alappuzha', state: 'Kerala', inflow: 'gap', signals: 3, coverage: 66, facets: ['crz', 'flood', 'freeze'] },
]

const FACETS: { id: string; label: string }[] = [
  { id: 'crz', label: 'CRZ coastal' },
  { id: 'flood', label: 'flood-chronic' },
  { id: 'freeze', label: 'fund-freeze' },
  { id: 'money', label: 'money & ledger' },
]

const ADD: { label: string; count: number }[] = [
  { label: 'Legal & zoning', count: 6 },
  { label: 'Flood & water', count: 4 },
  { label: 'Risk stack (3+ signals)', count: 2 },
  { label: 'Money & ledger', count: 5 },
  { label: 'Health & wealth', count: 7 },
]

function dots(n: number) {
  return '●'.repeat(n) + '○'.repeat(Math.max(0, 5 - n))
}

export default function ExploreClient() {
  const [active, setActive] = useState<string[]>(['crz', 'flood', 'freeze'])

  const results = useMemo(
    () => ROWS.filter((r) => active.every((f) => r.facets.includes(f))),
    [active]
  )

  const toggle = (id: string) => setActive((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]))

  return (
    <div className="xp">
      <div className="xp-bar">
        <svg width="22" height="22" style={{ color: 'var(--xp-red)' }} aria-hidden="true"><use href="#chakra" /></svg>
        <span className="xp-bar-t">EXPLORE — 594 DISTRICTS, ONE ROW EACH</span>
        <span className="xp-bar-note mono">query is shareable via URL</span>
      </div>

      <div className="xp-grid">
        {/* facets rail */}
        <aside className="xp-rail">
          <div className="xp-h">Facets · AND</div>
          <div className="xp-chips">
            {active.length === 0 && <span className="xp-empty">no facets — showing all</span>}
            {active.map((id) => {
              const f = FACETS.find((x) => x.id === id)
              return (
                <button key={id} className="xp-chip" onClick={() => toggle(id)}>
                  {f?.label ?? id} ✕
                </button>
              )
            })}
          </div>

          <div className="xp-h xp-h-top">Add a facet</div>
          <div className="xp-add">
            {FACETS.map((f) => (
              <button
                key={f.id}
                className={`xp-add-row${active.includes(f.id) ? ' on' : ''}`}
                onClick={() => toggle(f.id)}
              >
                <span>{f.label}</span>
                <span className="muted">{active.includes(f.id) ? '✓' : '+'}</span>
              </button>
            ))}
            {ADD.filter((a) => !FACETS.some((f) => f.label.toLowerCase() === a.label.toLowerCase())).map((a) => (
              <div key={a.label} className="xp-add-row static">
                <span>{a.label}</span><span className="muted">{a.count}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* results */}
        <div className="xp-results">
          <div className="xp-poster">
            <div className="xp-count">{results.length} district{results.length === 1 ? '' : 's'}</div>
            <div className="xp-poster-sub">where legal risk, physical risk and money dysfunction overlap</div>
          </div>

          <div className="xp-thead">
            <span>District</span><span>State</span><span>₹ inflow</span><span>Risk signals</span><span>Coverage</span>
          </div>
          {results.map((r) => (
            <div key={r.district} className="xp-row">
              <strong>{r.district}</strong>
              <span>{r.state}</span>
              <span className="mono">{r.inflow}</span>
              <span className="mono xp-dots">{dots(r.signals)} {r.signals}</span>
              <span className="mono">{r.coverage}%</span>
            </div>
          ))}
          {results.length === 0 && <div className="xp-none">No district carries all those signals at once — loosen a facet.</div>}
        </div>
      </div>

      <div className="xp-strip mono">
        <svg width="14" height="14" style={{ color: 'var(--xp-red)' }} aria-hidden="true"><use href="#chakra" /></svg>
        <span>Modernist register — 2px rules, flush-left, red poster field · chakra replaces the dot</span>
      </div>

      <style>{`
        .xp { --xp-red: #ec3013; --xp-bg: #f3f2f2; --xp-ink: #201e1d; background: var(--xp-bg); color: var(--xp-ink); max-width: var(--wrap); margin: 0 auto; font-family: var(--font-ui); }
        .xp-bar { display: flex; align-items: center; gap: 18px; padding: 14px var(--edge); border-bottom: 2px solid var(--xp-ink); }
        .xp-bar-t { font: 800 15px var(--font-ui); letter-spacing: .02em; }
        .xp-bar-note { margin-left: auto; font-size: 11px; color: #6f6c6a; }
        .xp-grid { display: grid; grid-template-columns: 340px 1fr; }
        .xp-rail { border-right: 2px solid var(--xp-ink); padding: 20px 22px; }
        .xp-h { font: 700 12px var(--font-ui); letter-spacing: .14em; text-transform: uppercase; margin-bottom: 12px; }
        .xp-h-top { border-top: 2px solid var(--xp-ink); padding-top: 16px; }
        .xp-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 18px; }
        .xp-chip { font: 600 12px var(--font-ui); padding: 6px 10px; background: var(--xp-red); color: #fff; border: 0; cursor: pointer; }
        .xp-empty { font-size: 12px; color: #6f6c6a; }
        .xp-add { display: flex; flex-direction: column; font: 500 13px var(--font-ui); }
        .xp-add-row { display: flex; justify-content: space-between; padding: 8px 2px; border: 0; border-bottom: 1px solid rgba(32,30,29,.18); background: transparent; cursor: pointer; text-align: left; font: inherit; color: var(--xp-ink); }
        .xp-add-row:hover { background: rgba(236,48,19,.07); }
        .xp-add-row.on { color: var(--xp-red); font-weight: 700; }
        .xp-add-row.static { cursor: default; }
        .xp-poster { background: var(--xp-red); color: #fff; padding: 22px var(--edge); }
        .xp-count { font: 800 clamp(26px,4vw,34px)/1.05 var(--font-ui); letter-spacing: -.01em; }
        .xp-poster-sub { font: 500 14px var(--font-ui); margin-top: 4px; opacity: .92; }
        .xp-thead, .xp-row { display: grid; grid-template-columns: 2fr 1.2fr 1fr 1fr 1fr; gap: 12px; padding: 10px var(--edge); }
        .xp-thead { font: 700 11px var(--font-ui); letter-spacing: .12em; text-transform: uppercase; border-bottom: 2px solid var(--xp-ink); color: #6f6c6a; }
        .xp-row { font: 500 13.5px var(--font-ui); border-bottom: 1px solid rgba(32,30,29,.18); align-items: baseline; }
        .xp-row:hover { background: rgba(236,48,19,.06); }
        .xp-row strong { font: 700 14px var(--font-ui); }
        .xp-dots { color: var(--xp-red); letter-spacing: 1px; }
        .xp-none { padding: 22px var(--edge); font-size: 13px; color: #6f6c6a; }
        .xp-strip { display: flex; align-items: center; gap: 14px; padding: 12px var(--edge); border-top: 2px solid var(--xp-ink); font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; color: #6f6c6a; }
        @media (max-width: 820px) {
          .xp-grid { grid-template-columns: 1fr; }
          .xp-rail { border-right: 0; border-bottom: 2px solid var(--xp-ink); }
          .xp-thead { display: none; }
          .xp-row { grid-template-columns: 1fr 1fr; gap: 4px 12px; }
          .xp-row strong { grid-column: 1 / -1; }
        }
      `}</style>
    </div>
  )
}
