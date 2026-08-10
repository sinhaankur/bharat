'use client'

import { useMemo, useState } from 'react'
import { classicMapHref } from '@/lib/links'
import geo from '@/app/map/india-states.json'

// The home map panel, drawn to mockup 1a "Sunlit Monument": a 280px "Colour the map
// by" rail (8 dimensions, sky-active) beside an SVG choropleth on the sky ramp, with
// a floating deep-district card. Dependency-free SVG; the FULL 594-district Leaflet
// fiscal map opens via "Open the money ledger →" (classic.html at the atlas root).

type Feature = { properties: { ST_NM: string }; geometry: { type: string; coordinates: any } }
const FEATURES = (geo as any).features as Feature[]

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
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates
  return polys.map((poly: number[][][]) => poly.map(ringToPath).join('')).join('')
}

// The 8 dimensions from the 1a rail. Each maps a state → 0..100 (labelled sample;
// real per-district figures live on the classic fiscal map).
const DIMS = [
  'Money flow', 'Population', 'Geography & zoning', 'Health',
  'Wealth', 'Language', 'Politics', 'Data coverage',
]
function spread(seed: number): Record<string, number> {
  const out: Record<string, number> = {}
  FEATURES.forEach((f, i) => { out[f.properties.ST_NM] = Math.abs(Math.sin((i + 1) * seed) * 100) % 100 })
  return out
}
const VALUES: Record<string, Record<string, number>> = Object.fromEntries(
  DIMS.map((d, i) => [d, spread(1.3 + i * 0.37)])
)

// the sky ramp from 1a's legend
const RAMP = ['var(--ramp-0)', 'var(--ramp-1)', 'var(--ramp-2)', 'var(--ramp-3)', 'var(--ramp-4)']
function rampColor(v: number): string {
  const i = Math.min(RAMP.length - 1, Math.floor((v / 100) * RAMP.length))
  return RAMP[i]
}

export default function AtlasMap() {
  const [dim, setDim] = useState(DIMS[0])
  const [hover, setHover] = useState<string | null>(null)
  const paths = useMemo(() => FEATURES.map((f) => ({ name: f.properties.ST_NM, d: featurePath(f) })), [])
  const values = VALUES[dim]
  const active = hover

  return (
    <div className="atlas-map">
      {/* ── rail: colour the map by ── */}
      <aside className="map-rail">
        <div className="rail-h">Colour the map by</div>
        <div className="rail-opts">
          {DIMS.map((d) => {
            const on = d === dim
            return (
              <button key={d} className={`rail-opt${on ? ' on' : ''}`} onClick={() => setDim(d)} aria-pressed={on}>
                <span className="swatch" />{d}
              </button>
            )
          })}
        </div>

        <div className="rail-legend">
          <div className="rail-h">Legend — ₹ into district</div>
          <div className="ramp">{RAMP.map((c, i) => <span key={i} style={{ background: c }} />)}</div>
          <div className="ramp-labels mono"><span>gap</span><span>₹74,427 cr</span></div>
          <div className="flag"><span className="flag-dot" />fund-freeze / audit flag</div>
        </div>
      </aside>

      {/* ── the map ── */}
      <div className="map-panel">
        <svg className="jali-bg" aria-hidden="true"><rect width="100%" height="100%" fill="url(#jali)" /></svg>
        <svg viewBox={`0 0 ${W} ${H}`} className="map-svg" role="img" aria-label="India by state — choropleth">
          {paths.map((p) => {
            const v = values[p.name] ?? 0
            const on = active === p.name
            return (
              <path
                key={p.name}
                d={p.d}
                fill={rampColor(v)}
                stroke={on ? 'var(--ink)' : 'rgba(42,32,24,.35)'}
                strokeWidth={on ? 1.6 : 0.4}
                onMouseEnter={() => setHover(p.name)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: 'pointer' }}
              >
                <title>{`${p.name}: ${Math.round(v)}`}</title>
              </path>
            )
          })}
        </svg>

        <div className="map-note mono">
          {active
            ? <><strong>{active}</strong> · {dim}: {Math.round(values[active] ?? 0)} · labelled sample</>
            : <>Leaflet choropleth — 594 districts · drill state → district → block</>}
        </div>

        {/* floating deep-district card (Greater Bombay, per 1a) */}
        <div className="dcard">
          <div className="dcard-h">
            <div className="dcard-kicker">Deep district · Maharashtra</div>
            <div className="dcard-name">Greater Bombay</div>
          </div>
          <div className="dcard-body">
            <div className="row"><span className="muted">BMC budget</span><strong className="mono">₹74,427 cr</strong></div>
            <div className="row"><span className="muted">Model</span><span>split-admin metro</span></div>
            <div className="row"><span className="muted">Coverage</span><strong className="mono" style={{ color: 'var(--sky)' }}>92%</strong></div>
            <div className="row warn"><span className="flag-dot" />1 audit flag — CAG para</div>
          </div>
          <a href={classicMapHref()} className="dcard-cta">Open the money ledger →</a>
        </div>
      </div>

      <style>{`
        .atlas-map { display: grid; grid-template-columns: 280px 1fr; min-height: 520px; }
        .map-rail { border-right: 2px solid var(--line-strong); background: var(--stone-2); padding: 22px 20px; }
        .rail-h { font: 600 11px var(--font-ui); letter-spacing: .16em; text-transform: uppercase; color: var(--muted); margin-bottom: 14px; }
        .rail-opts { display: flex; flex-direction: column; gap: 2px; font: 500 13.5px var(--font-ui); }
        .rail-opt { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border: 0; background: transparent; cursor: pointer; text-align: left; font: inherit; color: var(--ink); }
        .rail-opt .swatch { width: 8px; height: 8px; border: 1.5px solid var(--ink); flex: none; }
        .rail-opt:hover { background: rgba(48,120,192,.12); }
        .rail-opt.on { background: var(--sky); color: #fff; }
        .rail-opt.on .swatch { background: #fff; border-color: #fff; }
        .rail-legend { border-top: 2px solid var(--line-strong); margin-top: 18px; padding-top: 14px; }
        .ramp { display: flex; height: 12px; }
        .ramp span { flex: 1; }
        .ramp-labels { display: flex; justify-content: space-between; font-size: 10px; color: var(--muted); margin-top: 5px; }
        .flag { display: flex; align-items: center; gap: 8px; font: 500 11.5px var(--font-ui); color: var(--terra); margin-top: 10px; }
        .flag-dot { width: 10px; height: 10px; border: 2px solid var(--terra); border-radius: 50%; flex: none; }
        .map-panel { position: relative; background: var(--ramp-0); display: flex; align-items: center; justify-content: center; padding: 24px; overflow: hidden; }
        .jali-bg { position: absolute; inset: 0; width: 100%; height: 100%; }
        .map-svg { position: relative; width: 100%; max-width: 560px; height: auto; }
        .map-note { position: absolute; left: 26px; bottom: 18px; font-size: 11px; letter-spacing: .04em; text-transform: uppercase; color: var(--muted); background: color-mix(in srgb, var(--stone) 82%, transparent); padding: 5px 9px; }
        .dcard { position: absolute; top: 26px; right: 26px; width: 300px; background: var(--stone); border: 2px solid var(--line-strong); box-shadow: var(--shadow-offset); }
        .dcard-h { border-bottom: 1px solid var(--line); padding: 12px 16px 10px; position: relative; }
        .dcard-h::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, rgba(255,252,244,.9), transparent); }
        .dcard-kicker { font: 600 10px var(--font-ui); letter-spacing: .16em; text-transform: uppercase; color: var(--terra); }
        .dcard-name { font: 800 20px var(--font-ui); }
        .dcard-body { padding: 12px 16px 14px; font: 400 13px/1.5 var(--font-ui); }
        .dcard-body .row { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 4px 0; }
        .dcard-body .row.warn { color: var(--terra); font: 500 12.5px var(--font-ui); }
        .dcard-cta { display: block; border-top: 2px solid var(--line-strong); padding: 10px 16px; font: 600 13px var(--font-ui); background: var(--gold); color: #fff; }
        .dcard-cta:hover { background: var(--gold-700); color: #fff; }
        @media (max-width: 860px) {
          .atlas-map { grid-template-columns: 1fr; }
          .map-rail { border-right: 0; border-bottom: 2px solid var(--line-strong); }
          .dcard { position: static; width: 100%; margin-top: 16px; box-shadow: none; }
          .map-panel { flex-direction: column; }
        }
      `}</style>
    </div>
  )
}
