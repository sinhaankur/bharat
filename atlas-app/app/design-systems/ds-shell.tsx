'use client'

import { useEffect, useRef, useState } from 'react'
import { SKINS } from '@/components/skin-switcher'
import { downloadCss, downloadJson, downloadSpec, downloadZip } from '@/lib/download-skin'
import { TOKEN_SETS } from '@/lib/design-tokens'

// The intuitive shell around the handoff design document. It gives /design-systems what a
// 12,000px iframe scroll lacks: an intro that says what this is, a LIVE skin switcher (pick
// a design system → the whole atlas reskins), and a sticky jump-nav that scrolls the
// (same-origin) iframe to each section. The iframe itself is the exact handoff document.
const base = process.env.NEXT_PUBLIC_BASE_PATH || ''

// the standalone flagship's sections (data-screen-label → slug id, added to the served
// India by Design Systems.dc.html), in document order, for the jump-nav.
const SECTIONS: { id: string; label: string }[] = [
  { id: 'ds-hero', label: 'Hero' },
  { id: 'ds-segment-lattice', label: 'Segment lattice' },
  { id: 'ds-scripts', label: 'The script layer' },
  { id: 'ds-flags', label: 'The flag layer' },
  { id: 'ds-timeline', label: 'The time layer' },
  { id: 'ds-version-register', label: 'Version register' },
  { id: 'ds-explorations', label: 'Explorations' },
  { id: 'ds-chassis', label: 'The chassis' },
  { id: 'ds-poster-close', label: 'Poster' },
]

export default function DsShell() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [active, setActive] = useState('ds-hero')
  const [skin, setSkin] = useState('gupta')

  useEffect(() => {
    setSkin(document.documentElement.dataset.skin || 'gupta')
  }, [])

  // apply a skin to the WHOLE site (same as the header switcher)
  function applySkin(id: string) {
    document.documentElement.dataset.skin = id
    try { localStorage.setItem('atlas-skin', id) } catch {}
    setSkin(id)
  }

  // scroll the iframe's document to a section (same-origin, so we can reach in)
  function jumpTo(id: string) {
    setActive(id)
    const doc = iframeRef.current?.contentDocument
    const el = doc?.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // track which section is in view (update the active tab as you scroll the iframe)
  useEffect(() => {
    const frame = iframeRef.current
    if (!frame) return
    let io: IntersectionObserver | null = null
    const wire = () => {
      const doc = frame.contentDocument
      const win = frame.contentWindow as (Window & typeof globalThis) | null
      if (!doc || !win || !win.IntersectionObserver) return
      // build the observer INSIDE the iframe's context so it observes its own scroll
      io = new win.IntersectionObserver(
        (entries) => {
          entries.forEach((e) => { if (e.isIntersecting) setActive((e.target as HTMLElement).id) })
        },
        { threshold: 0.35 }
      )
      SECTIONS.forEach((s) => { const el = doc.getElementById(s.id); if (el) io!.observe(el) })
    }
    frame.addEventListener('load', wire)
    if (frame.contentDocument?.readyState === 'complete') wire()
    return () => { frame.removeEventListener('load', wire); io?.disconnect() }
  }, [])

  return (
    <div className="dss">
      {/* intro */}
      <header className="dss-intro">
        <div className="kicker">Indic Designs™ · India&apos;s own design systems</div>
        <h1 className="dss-h1">One chassis. Many Indias.</h1>
        <p className="dss-lede">
          An original body of work: a design language <em>for India</em>, one per state and culture —
          each accent, ground, band and motif drawn from that place&apos;s own heritage (Kashmir&apos;s
          Martand trefoil, Rajasthan&apos;s leheriya, Kerala&apos;s coir green, Assam&apos;s gamosa, the
          Naga loom), all standing on one shared chassis. Not a theme pack — a cultural design
          register. Pick one below to wear it across the whole atlas, then scroll the specimens.
        </p>
        <p className="dss-ip">
          Indic Designs™ — the design systems, their names and this register are original work,
          © 2026 Bharat. All rights reserved.
        </p>
      </header>

      {/* live skin switcher — the ready skins, as apply buttons + downloads */}
      <section className="dss-skins" aria-label="Choose a design system">
        {SKINS.map((s) => {
          const hasFiles = !!TOKEN_SETS[s.id]
          return (
            <div key={s.id} className={`dss-skin${skin === s.id ? ' on' : ''}`}>
              <span className="dss-skin-band" style={{ background: `linear-gradient(90deg, ${s.swatch}, ${s.band})` }} />
              <button className="dss-skin-apply" onClick={() => applySkin(s.id)} aria-pressed={skin === s.id}>
                <span className="dss-skin-name">{s.label}</span>
                <span className="dss-skin-note">{s.note}</span>
                <span className="dss-skin-cta">{skin === s.id ? '● worn' : 'Wear this skin →'}</span>
              </button>
              {hasFiles && (
                <div className="dss-dl" aria-label={`Download the ${s.label} design system`}>
                  <span className="dss-dl-h">Download</span>
                  <button onClick={() => downloadCss(s.id)} title="CSS custom properties">CSS</button>
                  <button onClick={() => downloadJson(s.id)} title="JSON design tokens">JSON</button>
                  <button onClick={() => downloadSpec(s.id)} title="One-page specimen (HTML)">Spec</button>
                  <button className="dss-dl-zip" onClick={() => downloadZip(s.id)} title="All files + license (.zip)">.zip ↓</button>
                </div>
              )}
            </div>
          )
        })}
      </section>
      <p className="dss-dl-note mono">
        Downloads are for reference. Indic Designs™ — original work, © 2026 Bharat; all rights reserved. No redistribution or reuse without a licence.
      </p>

      {/* sticky jump-nav */}
      <nav className="dss-tabs" aria-label="Jump to a section">
        {SECTIONS.map((s) => (
          <button key={s.id} className={`dss-tab${active === s.id ? ' on' : ''}`} onClick={() => jumpTo(s.id)}>
            {s.label}
          </button>
        ))}
      </nav>

      {/* the handoff document */}
      <iframe
        ref={iframeRef}
        src={`${base}/design-systems-full/`}
        title="India by Design Systems — the complete document"
        className="dss-frame"
      />

      <style>{`
        .dss { background: var(--bg); }
        .dss-intro { max-width: var(--wrap); margin: 0 auto; padding: 34px var(--edge) 8px; }
        .dss-h1 { font: 400 clamp(30px,5vw,52px) 'Rozha One', var(--font-display); margin: 8px 0 10px; color: var(--ink); line-height: 1.02; }
        .dss-lede { font: 400 15px/1.65 var(--font-ui); color: var(--muted); max-width: 68ch; margin: 0; }
        .dss-lede em { font-style: italic; color: var(--ink); }
        .dss-ip { font: 500 11.5px/1.5 var(--font-mono); color: var(--muted); max-width: 68ch; margin: 12px 0 0;
          padding-top: 10px; border-top: 1px solid var(--line); letter-spacing: .01em; }

        .dss-skins { max-width: var(--wrap); margin: 0 auto; padding: 18px var(--edge) 8px;
          display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 10px; }
        .dss-skin { display: flex; flex-direction: column; background: var(--surface); color: var(--ink);
          border: 2px solid var(--line); border-radius: 0; overflow: hidden;
          transition: transform .12s cubic-bezier(.2,.7,.2,1), box-shadow .16s ease, border-color .16s ease; }
        .dss-skin:hover { transform: translateY(-3px); box-shadow: 6px 8px 0 rgba(42,32,24,.16); border-color: var(--ink); }
        .dss-skin.on { border-color: var(--accent); box-shadow: 4px 5px 0 color-mix(in srgb, var(--accent) 35%, transparent); }
        .dss-skin-band { height: 12px; width: 100%; display: block; }
        .dss-skin-apply { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; text-align: left;
          cursor: pointer; background: transparent; border: 0; width: 100%; padding: 10px 12px 12px; color: inherit; }
        .dss-skin-name { font: 700 16px var(--font-ui); }
        .dss-skin-note { font: 400 12px var(--font-ui); color: var(--muted); }
        .dss-skin-cta { font: 600 11px var(--font-mono); letter-spacing: .04em; color: var(--accent); margin-top: 4px; }
        .dss-dl { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; padding: 8px 10px; border-top: 1px solid var(--line); background: color-mix(in srgb, var(--ink) 4%, transparent); }
        .dss-dl-h { font: 600 9.5px var(--font-mono); letter-spacing: .12em; text-transform: uppercase; color: var(--muted); margin-right: 2px; }
        .dss-dl button { font: 600 11px var(--font-mono); cursor: pointer; background: transparent; color: var(--ink);
          border: 1px solid var(--line); padding: 3px 7px; border-radius: 0; transition: background .12s ease, color .12s ease, border-color .12s ease; }
        .dss-dl button:hover { background: var(--accent); color: var(--surface); border-color: var(--accent); }
        .dss-dl .dss-dl-zip { border-color: var(--accent); color: var(--accent); }
        .dss-dl .dss-dl-zip:hover { background: var(--accent); color: var(--surface); }
        .dss-dl-note { max-width: var(--wrap); margin: 6px auto 0; padding: 0 var(--edge); font-size: 10.5px; color: var(--muted); }

        .dss-tabs { position: sticky; top: 58px; z-index: 20; display: flex; gap: 0; flex-wrap: wrap;
          background: var(--surface); border-top: 2px solid var(--ink); border-bottom: 2px solid var(--ink);
          padding: 0 var(--edge); margin-top: 16px; }
        .dss-tab { background: transparent; border: 0; cursor: pointer; color: var(--muted);
          font: 600 13px var(--font-ui); padding: 12px 14px; border-bottom: 3px solid transparent; }
        .dss-tab:hover { color: var(--ink); }
        .dss-tab.on { color: var(--accent); border-bottom-color: var(--accent); }

        .dss-frame { width: 100%; height: calc(100vh - 60px); border: 0; display: block; background: #f6f0e1; }

        @media (max-width: 720px) {
          .dss-tabs { top: 54px; overflow-x: auto; flex-wrap: nowrap; }
          .dss-tab { white-space: nowrap; }
        }
      `}</style>
    </div>
  )
}
