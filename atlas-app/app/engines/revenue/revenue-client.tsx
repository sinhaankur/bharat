'use client'

import { useMemo, useState } from 'react'
import Icon from '@/components/icon'
import { VIEWS, FY, DETAIL, stateValue, type View } from '@/lib/revenue'
import { classicMapHref } from '@/lib/links'
import geo from '@/app/map/india-states.json'

// State-revenue dashboard — mockup 7a "The state ledger". A state choropleth over a
// FY15→24 timeline with 9 views; clicking a state opens its detail (sparkline +
// governance footprint). Stone register, sky data ramp, gold CTA. Labelled sample —
// the sourced figures live on the classic atlas.

type Feature = { properties: { ST_NM: string }; geometry: { type: string; coordinates: any } }
const FEATURES = (geo as any).features as Feature[]
const B = { minLng: 68.0, maxLng: 97.5, minLat: 6.7, maxLat: 37.1 }
const W = 640
const H = (W * (B.maxLat - B.minLat)) / (B.maxLng - B.minLng) / Math.cos((22 * Math.PI) / 180)
const project = (lng: number, lat: number): [number, number] => [
  ((lng - B.minLng) / (B.maxLng - B.minLng)) * W,
  H - ((lat - B.minLat) / (B.maxLat - B.minLat)) * H,
]
const ring = (r: number[][]) => r.map((c, i) => `${i ? 'L' : 'M'}${project(c[0], c[1]).map((n) => n.toFixed(1)).join(' ')}`).join('') + 'Z'
const path = (f: Feature) => {
  const g = f.geometry
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates
  return polys.map((poly: number[][][]) => poly.map(ring).join('')).join('')
}
const RAMP = ['var(--ramp-0)', 'var(--ramp-1)', 'var(--ramp-2)', 'var(--ramp-3)', 'var(--ramp-4)']
const ramp = (v: number) => RAMP[Math.min(RAMP.length - 1, Math.floor((v / 100) * RAMP.length))]

function Spark({ data }: { data: number[] }) {
  const max = Math.max(...data), min = Math.min(...data)
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 280
    const y = 48 - ((v - min) / (max - min || 1)) * 40
    return `${x.toFixed(0)} ${y.toFixed(0)}`
  })
  return (
    <svg width="100%" height="54" viewBox="0 0 280 54" style={{ overflow: 'visible' }} aria-hidden="true">
      <line x1="0" y1="48" x2="280" y2="48" stroke="var(--line)" />
      <polyline points={pts.join(' ')} fill="none" stroke="var(--sky)" strokeWidth="2.5"
        strokeDasharray="600" style={{ animation: 'drawline 1.8s cubic-bezier(.2,.7,.2,1) both' }} />
      <circle cx="280" cy={pts[pts.length - 1].split(' ')[1]} r="4" fill="var(--gold)" />
    </svg>
  )
}

export default function RevenueClient() {
  const [view, setView] = useState<View>('Own revenue')
  const [fyIdx, setFyIdx] = useState(7) // FY 2022–23
  const [sel, setSel] = useState<string>('Maharashtra')

  const paths = useMemo(() => FEATURES.map((f) => ({ name: f.properties.ST_NM, d: path(f) })), [])
  const fy = FY[fyIdx]
  const detail = DETAIL[sel]

  return (
    <div className="rv">
      <div className="rv-top">
        <span className="rv-t">The state ledger</span>
        <span className="rv-sub">revenue · corruption · GSDP — FY15 → FY24, three Finance Commissions</span>
        <span className="rv-view mono">View: {view}</span>
      </div>

      <div className="rv-grid">
        {/* map + slider */}
        <div className="rv-map-wrap">
          <svg className="rv-jali" aria-hidden="true"><rect width="100%" height="100%" fill="url(#jali)" /></svg>
          <div className="rv-map-h mono">STATE CHOROPLETH · 36 STATES &amp; UTS · CLICK A STATE</div>
          <svg viewBox={`0 0 ${W} ${H}`} className="rv-svg" role="img" aria-label={`States by ${view}, FY${fy}`}>
            {paths.map((p) => {
              const v = stateValue(view, fy, p.name)
              const on = sel === p.name
              return (
                <path key={p.name} d={p.d} fill={ramp(v)}
                  stroke={on ? 'var(--ink)' : 'rgba(42,32,24,.35)'} strokeWidth={on ? 1.6 : 0.4}
                  onClick={() => setSel(p.name)} style={{ cursor: 'pointer' }}>
                  <title>{`${p.name}: ${v}`}</title>
                </path>
              )
            })}
          </svg>

          <div className="rv-legend">
            <div className="rv-ramp">{RAMP.map((c, i) => <span key={i} style={{ background: c }} />)}</div>
            <div className="rv-ramp-l mono">₹0 ————— ₹3.2 lakh cr own revenue</div>
          </div>

          <div className="rv-slider">
            <span className="rv-fy-l mono">FY</span>
            <input type="range" min={0} max={FY.length - 1} value={fyIdx} onChange={(e) => setFyIdx(+e.target.value)}
              className="rv-range" aria-label="Financial year" />
            <span className="rv-fy mono">FY 20{fy}–{(+fy + 1).toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* state detail */}
        <aside className="rv-detail">
          <div className="rv-detail-k mono">STATE · CLICKED</div>
          <div className="rv-detail-name">{sel}</div>
          {detail ? (
            <>
              <Spark data={detail.spark} />
              <div className="rv-spark-note mono">{detail.sparkNote}</div>
              <div className="rv-rows">
                <div className="rv-row"><span>IAS cadre strength</span><strong className="mono">{detail.iasCadre}</strong></div>
                <div className="rv-row"><span>State employees</span><strong className="mono">{detail.employees}</strong></div>
                <div className="rv-row"><span>Bribe-paid % (CMS &apos;19)</span><strong className="mono" style={{ color: 'var(--maroon)' }}>{detail.bribePct}</strong></div>
                <div className="rv-row"><span>Dept split — public-facing</span><strong className="mono">{detail.deptPublicFacing}%</strong></div>
              </div>
              <div className="rv-bar"><span style={{ width: `${detail.deptPublicFacing}%`, background: 'var(--sky)' }} /><span style={{ flex: 1, background: 'var(--stone-2)' }} /></div>
              <div className="rv-struct-h mono">STRUCTURAL</div>
              <div className="rv-struct"><span className="rv-plus">+</span> {detail.plus}<br /><span className="rv-minus">−</span> {detail.minus}</div>
              <a href={classicMapHref()} className="rv-drill"><Icon name="coin" size={14} />Drill into 36 districts →</a>
            </>
          ) : (
            <div className="rv-gap">No sourced governance footprint for {sel} yet — an explicit gap, not a guess. The choropleth still colours it from the {view.toLowerCase()} series.</div>
          )}
        </aside>
      </div>

      {/* view tabs */}
      <div className="rv-views">
        {VIEWS.map((v) => (
          <button key={v} className={`rv-view-tab${v === view ? ' on' : ''}`} onClick={() => setView(v)}>{v.toUpperCase()}</button>
        ))}
      </div>

      <style>{`
        .rv { background: var(--stone); color: var(--ink); max-width: var(--wrap); margin: 0 auto; font-family: var(--font-ui); }
        .rv-top { display: flex; align-items: center; gap: 16px; padding: 13px var(--edge); border-bottom: 2px solid var(--line-strong); flex-wrap: wrap; }
        .rv-t { font: 600 17px var(--font-serif); }
        .rv-sub { font: 400 11.5px var(--font-ui); color: var(--muted); }
        .rv-view { margin-left: auto; font-size: 12px; border: 1px solid var(--line); background: var(--stone-2); padding: 8px 13px; color: var(--gold-700); }
        .rv-grid { display: grid; grid-template-columns: 1fr 330px; }
        .rv-map-wrap { position: relative; background: var(--ramp-0); min-height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px 70px; }
        .rv-jali { position: absolute; inset: 0; width: 100%; height: 100%; }
        .rv-map-h { position: absolute; top: 16px; left: 20px; font-size: 10px; letter-spacing: .14em; color: var(--muted); }
        .rv-svg { position: relative; width: 100%; max-width: 460px; height: auto; }
        .rv-legend { position: absolute; bottom: 56px; left: 20px; }
        .rv-ramp { display: flex; height: 12px; width: 220px; border: 1px solid var(--line); }
        .rv-ramp span { flex: 1; }
        .rv-ramp-l { font-size: 10px; color: var(--muted); margin-top: 4px; }
        .rv-slider { position: absolute; left: 20px; right: 20px; bottom: 0; padding: 10px 0 14px; border-top: 2px solid var(--line-strong); display: flex; align-items: center; gap: 14px; }
        .rv-fy-l { font-size: 10px; letter-spacing: .12em; color: var(--gold-700); }
        .rv-range { flex: 1; accent-color: var(--gold); }
        .rv-fy { font-size: 12px; }
        .rv-detail { border-left: 2px solid var(--line-strong); padding: 18px 20px; background: var(--stone-2); }
        .rv-detail-k { font-size: 9.5px; letter-spacing: .14em; color: var(--gold-700); }
        .rv-detail-name { font: 600 22px var(--font-serif); margin: 2px 0 10px; }
        .rv-spark-note { font-size: 9px; color: var(--muted); }
        .rv-rows { display: flex; flex-direction: column; margin-top: 12px; }
        .rv-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--line); font: 400 12px var(--font-ui); }
        .rv-row span { color: var(--muted); }
        .rv-bar { display: flex; height: 10px; border: 1px solid var(--line); margin-top: 4px; }
        .rv-struct-h { margin-top: 14px; font-size: 9.5px; letter-spacing: .14em; color: var(--gold-700); }
        .rv-struct { font: 400 11.5px/1.55 var(--font-ui); margin-top: 5px; }
        .rv-plus { color: var(--good); font-weight: 600; }
        .rv-minus { color: var(--maroon); font-weight: 600; }
        .rv-drill { display: flex; align-items: center; gap: 8px; margin-top: 14px; background: var(--gold); color: #fff; font: 600 12px var(--font-ui); padding: 9px 13px; }
        .rv-drill:hover { background: var(--gold-700); color: #fff; }
        .rv-gap { margin-top: 12px; font: italic 400 13px/1.55 var(--font-italic); color: var(--muted); }
        .rv-views { display: flex; gap: 8px; padding: 10px var(--edge); border-top: 2px solid var(--line-strong); flex-wrap: wrap; }
        .rv-view-tab { border: 1px solid var(--line); background: transparent; font: 600 10.5px var(--font-mono); color: var(--muted); padding: 4px 9px; cursor: pointer; }
        .rv-view-tab:hover { border-color: var(--line-strong); }
        .rv-view-tab.on { background: var(--ink); color: var(--stone); border-color: var(--ink); }
        @media (max-width: 820px) {
          .rv-grid { grid-template-columns: 1fr; }
          .rv-detail { border-left: 0; border-top: 2px solid var(--line-strong); }
        }
      `}</style>
    </div>
  )
}
