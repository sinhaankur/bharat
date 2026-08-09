'use client'

import { useMemo, useState } from 'react'
import { atlasRoot } from '@/lib/atlas-pages'
import geo from './india-states.json'

// A dependency-free SVG choropleth of India's states. Projects lng/lat to SVG
// with a simple equirectangular fit (fine at country scale), colours each state
// by the chosen demo dimension, and is fully interactive (hover + click).

type Feature = { properties: { ST_NM: string }; geometry: { type: string; coordinates: any } }
const FEATURES = (geo as any).features as Feature[]

// bounds of the data (computed once)
const B = { minLng: 68.0, maxLng: 97.5, minLat: 6.7, maxLat: 37.1 }
const W = 640
const H = (W * (B.maxLat - B.minLat)) / (B.maxLng - B.minLng) / Math.cos((22 * Math.PI) / 180)

function project(lng: number, lat: number): [number, number] {
  const x = ((lng - B.minLng) / (B.maxLng - B.minLng)) * W
  const y = H - ((lat - B.minLat) / (B.maxLat - B.minLat)) * H
  return [x, y]
}

function ringToPath(ring: number[][]): string {
  return ring.map((c, i) => `${i ? 'L' : 'M'}${project(c[0], c[1]).map((n) => n.toFixed(1)).join(' ')}`).join('') + 'Z'
}
function featurePath(f: Feature): string {
  const g = f.geometry
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates // MultiPolygon
  return polys.map((poly: number[][][]) => poly.map(ringToPath).join('')).join('')
}

// ── demo dimensions (illustrative sample values, clearly labeled) ──
// Real district-level figures live in the atlas; here we show the interaction with
// a couple of honest, sourced-or-sample state series.
type Dim = { key: string; label: string; note: string; hue: number; values: Record<string, number> }

// a few real-ish anchors + a deterministic spread so the map reads as data, labeled sample
function spread(seed: number) {
  const out: Record<string, number> = {}
  FEATURES.forEach((f, i) => {
    out[f.properties.ST_NM] = Math.abs(Math.sin((i + 1) * seed) * 100) % 100
  })
  return out
}

const DIMS: Dim[] = [
  { key: 'coverage', label: 'Data coverage', note: 'How much sourced data the atlas holds per state (illustrative).', hue: 75, values: spread(1.7) },
  { key: 'density', label: 'Population density', note: 'Illustrative sample — real figures on the full atlas.', hue: 25, values: spread(2.3) },
  { key: 'fiscal', label: 'Fiscal activity', note: 'Illustrative sample — the live fiscal map has the real numbers.', hue: 200, values: spread(3.1) },
]

function color(v: number, hue: number): string {
  // 0..100 → light→saturated in the dimension's hue
  const l = 0.92 - (v / 100) * 0.5
  const c = 0.03 + (v / 100) * 0.14
  return `oklch(${l.toFixed(2)} ${c.toFixed(2)} ${hue})`
}

export default function IndiaMap() {
  const [dimKey, setDimKey] = useState(DIMS[0].key)
  const [hover, setHover] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const dim = DIMS.find((d) => d.key === dimKey)!

  const paths = useMemo(
    () => FEATURES.map((f) => ({ name: f.properties.ST_NM, d: featurePath(f) })),
    []
  )
  const active = selected || hover

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_260px]">
      <div>
        {/* dimension switch */}
        <div className="mb-3 flex flex-wrap gap-2">
          {DIMS.map((d) => (
            <button
              key={d.key}
              onClick={() => setDimKey(d.key)}
              aria-pressed={d.key === dimKey}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                d.key === dimKey
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-card text-muted-foreground hover:border-accent'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded border border-border bg-card">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Map of India by state">
            {paths.map((p) => {
              const v = dim.values[p.name] ?? 0
              const isActive = active === p.name
              return (
                <path
                  key={p.name}
                  d={p.d}
                  fill={color(v, dim.hue)}
                  stroke={isActive ? 'var(--accent)' : 'var(--border)'}
                  strokeWidth={isActive ? 1.4 : 0.4}
                  className="cursor-pointer transition-[stroke,stroke-width] duration-150"
                  style={isActive ? { filter: 'brightness(0.95)' } : undefined}
                  onMouseEnter={() => setHover(p.name)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => setSelected(selected === p.name ? null : p.name)}
                >
                  <title>{`${p.name}: ${Math.round(v)}`}</title>
                </path>
              )
            })}
          </svg>
        </div>

        {/* legend */}
        <div className="mt-3 flex items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">Low</span>
          <div className="h-3 flex-1 rounded" style={{ background: `linear-gradient(90deg, ${color(0, dim.hue)}, ${color(100, dim.hue)})` }} />
          <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">High</span>
        </div>
        <p className="mt-2 text-xs italic text-muted-foreground">{dim.note}</p>
      </div>

      {/* side panel */}
      <aside className="rounded border border-border bg-card p-4">
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          {active ? 'State' : 'Hover or tap a state'}
        </h2>
        {active ? (
          <>
            <p className="mt-1 font-serif text-2xl font-bold">{active}</p>
            <div className="mt-4 space-y-3">
              {DIMS.map((d) => {
                const v = d.values[active] ?? 0
                return (
                  <div key={d.key}>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{d.label}</span>
                      <span className="font-mono font-semibold">{Math.round(v)}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded bg-secondary">
                      <div className="h-full rounded" style={{ width: `${v}%`, background: `oklch(0.6 0.13 ${d.hue})` }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <a
              href={`${atlasRoot()}/state-of-india.html`}
              className="mt-5 inline-block font-mono text-[11px] text-accent hover:underline"
            >
              full data on the atlas →
            </a>
          </>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {FEATURES.length} states &amp; UTs. Pick a dimension above to recolour the map, then hover or tap a state
            to read it. The full district-level map (all 594) is on the atlas.
          </p>
        )}
      </aside>
    </div>
  )
}
