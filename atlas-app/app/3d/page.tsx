import type { Metadata } from 'next'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import Icon from '@/components/icon'
import { classicHref } from '@/lib/links'

// 3D dark-canvas shell — mockup 4c. Covers india-3d/terrain/flood/atlas-3d/earth-3d/
// globe-map/heritage-3d/cave-walk. A near-black stage with a glowing globe, a layers
// rail, a month slider, and the declared-gaps note.
export const metadata: Metadata = {
  title: 'India in 3D — states & rivers · Bharat',
  description: 'The real Earth, every layer sourced or a declared gap: states raised by money, seasonal rivers, zones, air quality — and an impact simulator.',
}

const TABS = ['Globe', 'Terrain', 'Flood', 'Constraint']
const LAYERS: { name: string; on: boolean }[] = [
  { name: 'States — raised by ₹', on: true },
  { name: 'Rivers · seasonal flow', on: true },
  { name: 'Railways · highways', on: false },
  { name: 'Zones — CRZ · flood', on: true },
  { name: 'Air quality (PM2.5)', on: false },
  { name: 'Impact simulator', on: false },
]

export default function ThreeDPage() {
  return (
    <>
      <SiteHeader />

      <main className="td">
        <div className="td-bar">
          <svg width="19" height="19" style={{ color: '#c9a227' }} aria-hidden="true"><use href="#chakra" /></svg>
          <span className="td-brand">Bharat<span style={{ color: '#c9a227' }}>.</span></span>
          <span className="td-sub">3D / India in 3D — states &amp; rivers</span>
          <div className="td-tabs">
            {TABS.map((t, i) => <span key={t} className={`td-tab${i === 0 ? ' on' : ''}`}>{t}</span>)}
          </div>
        </div>

        <div className="td-stage-grid">
          <div className="td-stage">
            <div className="td-globe"><div className="td-india" /></div>
            <div className="td-src mono">REAL EARTH · NASA CC BY 4.0 · EVERY LAYER SOURCED-OR-A-DECLARED-GAP</div>
            <div className="td-slider">
              <span className="mono td-slider-l">MONTH</span>
              <div className="td-track"><div className="td-knob" /></div>
              <span className="mono td-slider-v">JUL — monsoon</span>
            </div>
          </div>

          <aside className="td-rail">
            <div className="td-rail-h mono">LAYERS</div>
            <div className="td-layers">
              {LAYERS.map((l) => (
                <div key={l.name} className="td-layer">
                  <span>{l.name}</span>
                  <span className={`td-toggle${l.on ? ' on' : ''}`}><span className="td-toggle-knob" /></span>
                </div>
              ))}
            </div>
            <div className="td-gaps">Declared gaps stay visible: agriculture zones · per-river discharge · physics-grade flooding — not shown, not faked.</div>
            <a href={classicHref('india-3d')} className="td-fly"><Icon name="sun" size={15} />Fly down to a district</a>
          </aside>
        </div>
      </main>

      <SiteFooter />

      <style>{`
        .td { background: #100a08; color: #efe3cc; max-width: var(--wrap); margin: 0 auto; font-family: var(--font-ui); }
        .td-bar { display: flex; align-items: center; gap: 14px; padding: 12px var(--edge); border-bottom: 1px solid rgba(201,162,39,.3); flex-wrap: wrap; }
        .td-brand { font: 600 14px var(--font-serif); }
        .td-sub { font: 500 12px var(--font-ui); color: rgba(239,227,204,.55); }
        .td-tabs { margin-left: auto; display: flex; gap: 8px; font: 600 11px var(--font-ui); }
        .td-tab { padding: 5px 11px; color: rgba(239,227,204,.55); }
        .td-tab.on { border: 1px solid rgba(201,162,39,.4); color: #c9a227; }
        .td-stage-grid { display: grid; grid-template-columns: 1fr 280px; min-height: 480px; }
        .td-stage { position: relative; display: flex; align-items: center; justify-content: center; background: radial-gradient(ellipse 70% 60% at 50% 55%, #1c1b26 0%, #100a08 70%); }
        .td-globe { width: 340px; max-width: 70vw; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at 38% 34%, #2a4a7a 0%, #16243c 55%, #0c1420 100%); box-shadow: 0 0 80px rgba(42,74,122,.4), inset -30px -20px 60px rgba(0,0,0,.6); position: relative; }
        .td-india { position: absolute; top: 26%; left: 44%; width: 70px; height: 90px; background: rgba(201,162,39,.35); clip-path: polygon(30% 0, 70% 8%, 100% 45%, 60% 100%, 30% 78%, 0 40%); }
        .td-src { position: absolute; top: 22px; left: 24px; right: 24px; font-size: 10px; letter-spacing: .16em; color: rgba(239,227,204,.5); }
        .td-slider { position: absolute; bottom: 20px; left: 24px; right: 24px; display: flex; align-items: center; gap: 14px; }
        .td-slider-l { font-size: 10px; letter-spacing: .12em; color: #c9a227; }
        .td-track { flex: 1; height: 2px; background: rgba(239,227,204,.25); position: relative; }
        .td-knob { position: absolute; left: 58%; top: -5px; width: 12px; height: 12px; background: #c9a227; border-radius: 50%; }
        .td-slider-v { font-size: 11px; color: #efe3cc; }
        .td-rail { border-left: 1px solid rgba(201,162,39,.3); padding: 18px 20px; }
        .td-rail-h { font-size: 10px; letter-spacing: .16em; color: #c9a227; margin-bottom: 12px; }
        .td-layers { display: flex; flex-direction: column; font: 500 12.5px var(--font-ui); }
        .td-layer { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(201,162,39,.18); }
        .td-toggle { width: 26px; height: 14px; background: rgba(239,227,204,.2); position: relative; flex: none; }
        .td-toggle-knob { position: absolute; left: 1px; top: 1px; width: 12px; height: 12px; background: #100a08; }
        .td-toggle.on { background: #c9a227; }
        .td-toggle.on .td-toggle-knob { left: auto; right: 1px; }
        .td-gaps { margin-top: 14px; padding: 10px 12px; border: 1px solid rgba(201,162,39,.3); font: 400 10.5px/1.5 var(--font-ui); color: rgba(239,227,204,.6); }
        .td-fly { margin-top: 12px; display: flex; align-items: center; gap: 9px; background: var(--gold); color: #fff; font: 600 12.5px var(--font-ui); padding: 9px 13px; }
        .td-fly:hover { background: var(--gold-700); color: #fff; }
        @media (max-width: 820px) { .td-stage-grid { grid-template-columns: 1fr; } .td-stage { min-height: 340px; padding: 40px 0; } .td-rail { border-left: 0; border-top: 1px solid rgba(201,162,39,.3); } }
      `}</style>
    </>
  )
}
