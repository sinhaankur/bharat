'use client'

import { useState } from 'react'
import { SKINS } from '@/components/skin-switcher'

// The India by Design Systems flagship — the INDIC DESIGNS register. One Modernist
// chassis, many skins. The segment lattice is INTERACTIVE: click a segment to skin
// the WHOLE site in it (the switcher, as a full page). Grouped by region, each tile
// names the heritage the segment references. Wears its own Indic skin regardless of
// the active site skin.

type Seg = { skin?: string; name: string; place: string; motif: string; accent: string; band: string }
const REGIONS: { region: string; segs: Seg[] }[] = [
  {
    region: 'North & the Himalaya',
    segs: [
      { skin: 'kashmir', name: 'Martand', place: 'Kashmir', motif: 'valley stone · saffron · trefoil arcade', accent: '#d98a2b', band: '#6e7f8c' },
      { name: 'Harmandir', place: 'Punjab', motif: 'sarovar gold · phulkari thread', accent: '#c9862b', band: '#2a6b4f' },
      { name: 'Kashi', place: 'Uttar Pradesh', motif: 'ghat ochre · river silver', accent: '#b5642a', band: '#4a6b7a' },
      { name: 'Kedar', place: 'Uttarakhand', motif: 'grey granite · snow line', accent: '#5a6b74', band: '#b5642a' },
    ],
  },
  {
    region: 'West',
    segs: [
      { skin: 'rajasthan', name: 'Ranakpur', place: 'Rajasthan', motif: 'pink sandstone · leheriya · indigo', accent: '#c9345a', band: '#2a4a7a' },
      { name: 'Modhera', place: 'Gujarat', motif: 'stepwell stone · bandhani dot', accent: '#c25a2a', band: '#2a6b6b' },
      { name: 'Sindhu', place: 'Sindh frontier', motif: 'ajrak indigo + madder', accent: '#8a2e5a', band: '#c9862b' },
    ],
  },
  {
    region: 'Deccan & South',
    segs: [
      { skin: 'tamil', name: 'Vimana', place: 'Tamil Nadu', motif: 'granite · kumkum · temple gold', accent: '#a8322b', band: '#c9862b' },
      { name: 'Pallava', place: 'Tamil coast', motif: 'shore-temple grey · surf line', accent: '#8c2822', band: '#4a6b7a' },
      { name: 'Vijayanagara', place: 'Karnataka', motif: 'Hampi boulder · stone chariot', accent: '#9e3b2e', band: '#c9862b' },
      { skin: 'kerala', name: 'Backwater', place: 'Kerala', motif: 'coir green · brass · rain', accent: '#2f7d4f', band: '#b8863b' },
      { name: 'Kandariya', place: 'Madhya Pradesh', motif: 'Khajuraho sandstone · shikhara', accent: '#b5642a', band: '#8a5a3a' },
    ],
  },
  {
    region: 'East & the Northeast',
    segs: [
      { name: 'Bishnupur', place: 'West Bengal', motif: 'terracotta temple · laterite red', accent: '#a8452a', band: '#7d5a3a' },
      { name: 'Dhokra', place: 'Odisha / Jharkhand', motif: 'lost-wax bronze · Sohrai wall', accent: '#8a6a2a', band: '#3f6b45' },
      { skin: 'assam', name: 'Gamosa', place: 'Assam', motif: 'cream weave · red border · green', accent: '#c0392b', band: '#3f6b45' },
      { skin: 'naga', name: 'Shawl bands', place: 'Nagaland', motif: 'loom black · warrior red · white', accent: '#b3271f', band: '#201a16' },
      { name: 'Moirang', place: 'Manipur', motif: 'moirang-phee border · phanek', accent: '#7a1f3a', band: '#c9862b' },
    ],
  },
]

export default function DesignSystemsClient() {
  const [applied, setApplied] = useState<string | null>(null)

  function apply(skin?: string) {
    if (!skin) return
    document.documentElement.dataset.skin = skin
    try { localStorage.setItem('atlas-skin', skin) } catch {}
    setApplied(skin)
  }

  return (
    <div className="ids">
      {/* hero */}
      <section className="ids-hero">
        <div className="ids-kicker">INDIC DESIGNS · the register</div>
        <h1 className="ids-h1">One chassis.<br /><em>Many Indias.</em></h1>
        <p className="ids-lede">
          Every atlas screen stands on one Modernist chassis — Archivo, 2px rules, flush-left, flat. A
          <strong> segment</strong> is a token layer over it: a state&apos;s accent, its ground, its band and
          motif, drawn from the region&apos;s own heritage. The structure never moves. Only the surface does.
        </p>
        <p className="ids-note">Pick a segment below to wear it across the whole atlas. Primary stays Gupta.</p>
      </section>

      {/* the ready skins (the switcher, as tiles) */}
      <section className="ids-primary">
        <div className="ids-region-h">Ready skins</div>
        <div className="ids-primary-grid">
          {SKINS.map((s) => (
            <button key={s.id} className={`ids-skin${applied === s.id ? ' on' : ''}`} onClick={() => apply(s.id)}>
              <span className="ids-skin-sw" style={{ background: s.swatch, boxShadow: `inset 0 0 0 3px ${s.band}` }} />
              <span className="ids-skin-t">{s.label}</span>
              <span className="ids-skin-n">{s.note}</span>
              <span className="ids-skin-apply">{applied === s.id ? 'Applied ✓' : 'Wear this skin →'}</span>
            </button>
          ))}
        </div>
      </section>

      {/* the full segment lattice */}
      {REGIONS.map((r) => (
        <section key={r.region} className="ids-region">
          <div className="ids-region-h">{r.region}</div>
          <div className="ids-lattice">
            {r.segs.map((seg) => (
              <button
                key={seg.name}
                className={`ids-tile${seg.skin ? ' live' : ''}`}
                onClick={() => apply(seg.skin)}
                title={seg.skin ? `Wear the ${seg.name} skin` : 'Design token study (skin coming)'}
                style={{ ['--t-accent' as string]: seg.accent, ['--t-band' as string]: seg.band }}
              >
                <span className="ids-tile-band" />
                <span className="ids-tile-name">{seg.name}</span>
                <span className="ids-tile-place">{seg.place}</span>
                <span className="ids-tile-motif">{seg.motif}</span>
                <span className="ids-tile-cta">{seg.skin ? 'Wear it →' : 'token study'}</span>
              </button>
            ))}
          </div>
        </section>
      ))}

      {/* poster close */}
      <section className="ids-poster">
        <p>Design and language are how India gives structure to its data.</p>
        <span className="ids-poster-scripts">भ ভ ਭ ભ ଭ భ ಭ ഭ</span>
      </section>

      <style>{`
        /* the flagship wears its OWN Indic skin, independent of the site skin */
        .ids { --ids-bg: #f6f0e1; --ids-surface: #efe3cc; --ids-ink: #2a2018; --ids-accent: #c1440e; --ids-band: #c9862b;
               background: var(--ids-bg); color: var(--ids-ink); font-family: 'Karla', var(--font-ui); }
        .ids-hero { max-width: 1000px; margin: 0 auto; padding: 64px var(--edge) 40px; }
        .ids-kicker { font: 700 11px var(--font-mono); letter-spacing: .2em; color: var(--ids-accent); }
        .ids-h1 { font-family: 'Rozha One', serif; font-weight: 400; font-size: clamp(40px, 7vw, 76px); line-height: 1.02; margin: 16px 0 0; }
        .ids-h1 em { color: var(--ids-accent); font-style: italic; }
        .ids-lede { font-size: 17px; line-height: 28px; max-width: 60ch; margin: 24px 0 0; }
        .ids-note { font: italic 400 14px 'Karla', sans-serif; color: color-mix(in srgb, var(--ids-ink) 60%, transparent); margin: 14px 0 0; }
        .ids-region { max-width: 1200px; margin: 0 auto; padding: 8px var(--edge) 24px; }
        .ids-primary { max-width: 1200px; margin: 0 auto; padding: 20px var(--edge) 8px; }
        .ids-region-h { font: 700 12px var(--font-mono); letter-spacing: .16em; text-transform: uppercase; color: var(--ids-accent); border-bottom: 2px solid var(--ids-ink); padding-bottom: 8px; margin-bottom: 18px; }
        .ids-primary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 2px; background: color-mix(in srgb, var(--ids-ink) 20%, transparent); border: 2px solid var(--ids-ink); }
        .ids-skin { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; background: var(--ids-bg); border: 0; cursor: pointer; text-align: left; padding: 18px 18px 16px; color: var(--ids-ink); }
        .ids-skin:hover { background: var(--ids-surface); }
        .ids-skin.on { background: var(--ids-surface); }
        .ids-skin-sw { width: 100%; height: 34px; }
        .ids-skin-t { font-family: 'Rozha One', serif; font-size: 20px; }
        .ids-skin-n { font-size: 12px; color: color-mix(in srgb, var(--ids-ink) 65%, transparent); }
        .ids-skin-apply { font: 700 11px var(--font-mono); letter-spacing: .1em; color: var(--ids-accent); margin-top: 4px; }
        .ids-lattice { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; }
        .ids-tile { position: relative; display: flex; flex-direction: column; gap: 4px; align-items: flex-start; text-align: left; cursor: pointer;
                    background: var(--ids-surface); border: 1.5px solid color-mix(in srgb, var(--ids-ink) 30%, transparent); padding: 16px 16px 14px; color: var(--ids-ink); overflow: hidden; }
        .ids-tile:hover { border-color: var(--t-accent); }
        .ids-tile.live { border-color: var(--t-accent); }
        .ids-tile-band { position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, var(--t-accent) 60%, var(--t-band) 60%); }
        .ids-tile-name { font-family: 'Rozha One', serif; font-size: 21px; margin-top: 6px; color: var(--t-accent); }
        .ids-tile-place { font: 600 11px var(--font-mono); letter-spacing: .1em; text-transform: uppercase; color: color-mix(in srgb, var(--ids-ink) 60%, transparent); }
        .ids-tile-motif { font-size: 12.5px; line-height: 1.5; margin-top: 4px; }
        .ids-tile-cta { font: 700 10.5px var(--font-mono); letter-spacing: .1em; color: var(--t-accent); margin-top: 8px; }
        .ids-poster { background: var(--ids-accent); color: var(--ids-bg); text-align: center; padding: 72px var(--edge); margin-top: 24px; }
        .ids-poster p { font-family: 'Rozha One', serif; font-size: clamp(24px, 4vw, 40px); line-height: 1.2; max-width: 20ch; margin: 0 auto; }
        .ids-poster-scripts { display: block; font-size: 22px; letter-spacing: .4em; margin-top: 22px; opacity: .85; }
      `}</style>
    </div>
  )
}
