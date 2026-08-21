'use client'

import { useEffect, useRef, useState } from 'react'
import { SKINS } from '@/components/skin-switcher'
import { downloadCss, downloadJson, downloadFigma, downloadSpec, downloadZip } from '@/lib/download-skin'
import { TOKEN_SETS } from '@/lib/design-tokens'
import Gallery from './gallery'
import { Stagger, Item } from '@/components/motion'

// The intuitive shell around the handoff design document. It gives /design-systems what a
// 12,000px iframe scroll lacks: an intro that says what this is, a LIVE skin switcher (pick
// a design system → the whole atlas reskins), and a sticky jump-nav that scrolls the
// (same-origin) iframe to each section. The iframe itself is the exact handoff document.
const base = process.env.NEXT_PUBLIC_BASE_PATH || ''

// the standalone flagship's sections (data-screen-label → slug id, added to the served
// India by Design Systems.dc.html), in document order, for the jump-nav. The hero +
// segment lattice are TRIMMED from the embed (the gallery above already covers them),
// so the embedded document only adds what's NEW: scripts, flags, timeline, chassis…
const SECTIONS: { id: string; label: string }[] = [
  { id: 'ds-scripts', label: 'The script layer' },
  { id: 'ds-flags', label: 'The flag layer' },
  { id: 'ds-timeline', label: 'The time layer' },
  { id: 'ds-version-register', label: 'Version register' },
  { id: 'ds-explorations', label: 'Explorations' },
  { id: 'ds-chassis', label: 'The chassis' },
  { id: 'ds-poster-close', label: 'Poster' },
]
// sections hidden inside the embed because the gallery/shell already presents them
const EMBED_HIDE = ['ds-hero', 'ds-segment-lattice']

export default function DsShell() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const introRef = useRef<HTMLElement>(null)
  const [active, setActive] = useState('ds-scripts')
  const [skin, setSkin] = useState('gupta')
  const [frameH, setFrameH] = useState<number | null>(null)

  useEffect(() => {
    setSkin(document.documentElement.dataset.skin || 'gupta')
  }, [])

  // PARALLAX — the gilt jali watermark, wash and seal drift as the royal intro
  // scrolls past. Honours reduce-motion (OS + the site a11y flag); rAF-throttled.
  useEffect(() => {
    const reduced =
      document.documentElement.getAttribute('data-reduce-motion') === '1' ||
      (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    if (reduced) return
    const el = introRef.current
    if (!el) return
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY || window.pageYOffset
        // only pay the cost while the intro is roughly in view
        if (y < el.offsetHeight + 200) el.style.setProperty('--px', String(y))
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
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

      // TRIM the embed: hide the duplicate hero + segment lattice (the gallery covers
      // them) by injecting a style into the iframe document, once.
      if (!doc.getElementById('dss-embed-trim')) {
        const st = doc.createElement('style')
        st.id = 'dss-embed-trim'
        st.textContent =
          EMBED_HIDE.map((id) => `#${id}`).join(',') + '{display:none!important}' +
          // the embed opens straight on the script layer — tighten its top padding
          '#ds-scripts{padding-top:8px!important}'
        doc.head?.appendChild(st)
      }

      // FIT the iframe to its (now shorter) content so there's no dark void below.
      const fit = () => {
        const h = doc.body?.scrollHeight
        if (h && h > 200) setFrameH(h)
      }
      fit()
      // re-fit after fonts/reveals settle
      win.setTimeout(fit, 400)
      win.setTimeout(fit, 1200)

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
      {/* GRAND CINEMATIC INTRO — the throne-room arrival: deep-royal ground, gold-leaf */}
      <header className="dss-intro" ref={introRef}>
        <svg className="dss-intro-bg" aria-hidden="true"><rect width="100%" height="100%" fill="url(#jali)" /></svg>
        <div className="dss-intro-wash" aria-hidden="true" />
        <div className="dss-intro-in">
          <div className="dss-intro-seal" aria-hidden="true">
            <svg width="76" height="76" viewBox="0 0 100 100" role="img">
              <defs>
                <radialGradient id="dss-seal-g" cx="50%" cy="38%" r="65%">
                  <stop offset="0%" stopColor="#3a1c14" />
                  <stop offset="100%" stopColor="#1c0d0a" />
                </radialGradient>
              </defs>
              {/* filled medallion disc */}
              <circle cx="50" cy="50" r="47" fill="url(#dss-seal-g)" stroke="#f0cd7a" strokeWidth="2.5" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#d9a441" strokeWidth="1" opacity="0.7" />
              {/* radiating ticks around the ring */}
              <g stroke="#f0cd7a" strokeWidth="1.4">
                {Array.from({ length: 24 }, (_, i) => (
                  <line key={i} x1="50" y1="11" x2="50" y2="6" transform={`rotate(${i * 15} 50 50)`} />
                ))}
              </g>
              {/* center chakra glyph */}
              <g stroke="#f0cd7a" strokeWidth="1.4" fill="none">
                <circle cx="50" cy="50" r="15" />
                {Array.from({ length: 12 }, (_, i) => (
                  <line key={i} x1="50" y1="36" x2="50" y2="50" transform={`rotate(${i * 30} 50 50)`} />
                ))}
              </g>
              <circle cx="50" cy="50" r="4" fill="#f0cd7a" />
            </svg>
          </div>
          <div className="dss-rule" aria-hidden="true"><span /><b>✦</b><span /></div>
          <div className="kicker">Indic Designs™ · India&apos;s own design systems · carved from artefacts</div>
          <h1 className="dss-h1">One chassis.<br /><em>Many Indias.</em></h1>
          <p className="dss-lede">
            Giving structure to a civilisation is the work of design <em>and</em> language. This is an
            original body of work: a design language <em>for India</em>, one per state and culture —
            each colour, band and motif read straight out of that place&apos;s own heritage, most of it
            older than any nation. Every system below carries the <b>idea it was built from</b> — the
            temple, the loom, the script, the measure. The layout never moves; only the tokens swap.
            Wear one to reskin the whole atlas.
          </p>
          <p className="dss-ip">
            Indic Designs™ — the design systems, their names and this register are original work,
            © 2026 Bharat. All rights reserved.
          </p>
        </div>
      </header>

      {/* GALLERY MODE — walk the design systems one at a time, framed & spotlit */}
      <Gallery />

      {/* TAKE ONE HOME — the downloads shelf. Not a second skin-picker (the gallery
          above wears skins); this is only the files, for the systems that ship them.
          Cards cascade in on view via the design-system Stagger primitive. */}
      <div className="dss-shelf-h mono">Take one home — download the tokens</div>
      <Stagger className="dss-skins" as="section" aria-label="Download a design system">
        {SKINS.filter((s) => TOKEN_SETS[s.id]).map((s) => (
          <Item key={s.id} className={`dss-skin${skin === s.id ? ' on' : ''}`} as="article">
            <span className="dss-skin-band" style={{ background: `linear-gradient(90deg, ${s.swatch}, ${s.band})` }} />
            <div className="dss-skin-apply">
              <span className="dss-skin-name">{s.label}</span>
              {TOKEN_SETS[s.id]?.from && <span className="dss-skin-from">{TOKEN_SETS[s.id].from}</span>}
            </div>
            <div className="dss-dl" aria-label={`Download the ${s.label} design system`}>
              <span className="dss-dl-h">Files</span>
              <button onClick={() => downloadCss(s.id)} title="CSS custom properties">CSS</button>
              <button onClick={() => downloadJson(s.id)} title="JSON design tokens">JSON</button>
              <button className="dss-dl-figma" onClick={() => downloadFigma(s.id)} title="W3C Design Tokens — import into Figma via Tokens Studio">Figma ↗</button>
              <button onClick={() => downloadSpec(s.id)} title="One-page specimen (HTML)">Spec</button>
              <button className="dss-dl-zip" onClick={() => downloadZip(s.id)} title="All files + README + license (.zip)">.zip ↓</button>
            </div>
          </Item>
        ))}
      </Stagger>
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

      {/* the handoff document — the layers the gallery doesn't cover (scripts, flags,
          timeline, chassis). Height is fit to content so there's no dark void. */}
      <iframe
        ref={iframeRef}
        src={`${base}/design-systems-full/`}
        title="India by Design Systems — scripts, flags, timeline & the chassis"
        className="dss-frame"
        style={frameH ? { height: frameH } : undefined}
      />

      <style>{`
        .dss { background: var(--bg); }
        /* intro — DEEP-ROYAL throne-room ground: maroon-ink, gold-leaf hairlines, gilt seal */
        .dss-intro { position: relative; overflow: hidden;
          --royal: #2a1410; --royal-2: #3a1c14; --leaf: #d9a441; --leaf-2: #f0cd7a; --cream: #f4e6c8;
          background:
            radial-gradient(130% 100% at 50% -8%, #3a1c14 0%, #2a1410 46%, #1c0d0a 100%);
          border-bottom: 3px solid var(--leaf);
          box-shadow: inset 0 -1px 0 rgba(240,205,122,.5); }
        .dss-intro { --px: 0; }
        .dss-intro-bg { position: absolute; top: -12%; right: -8%; width: 52%; height: 130%; color: var(--leaf); opacity: .10;
          transform: translate3d(0, calc(var(--px) * 0.22px), 0) rotate(calc(var(--px) * 0.006deg)); will-change: transform; }
        .dss-intro-wash { display: block; position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(80% 120% at 14% 0%, rgba(240,205,122,.10), transparent 55%);
          transform: translate3d(0, calc(var(--px) * -0.08px), 0); }
        .dss-intro-in { position: relative; max-width: var(--wrap); margin: 0 auto; padding: clamp(64px,10vh,120px) var(--edge) clamp(44px,6vh,72px);
          transform: translate3d(0, calc(var(--px) * 0.12px), 0); }
        .dss-intro-seal { color: var(--leaf-2); margin-bottom: 14px;
          filter: drop-shadow(0 3px 10px rgba(240,205,122,.35));
          transform: translate3d(0, calc(var(--px) * -0.16px), 0); }
        @media (prefers-reduced-motion: reduce) {
          .dss-intro-bg, .dss-intro-wash, .dss-intro-in, .dss-intro-seal { transform: none !important; }
        }
        /* a centred gold-leaf hairline flourish under the seal */
        .dss-rule { display: flex; align-items: center; gap: 14px; max-width: 340px; margin: 0 0 20px; }
        .dss-rule span { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, var(--leaf) 60%, var(--leaf-2)); }
        .dss-rule span:last-of-type { background: linear-gradient(90deg, var(--leaf-2), var(--leaf) 40%, transparent); }
        .dss-rule b { color: var(--leaf-2); font-size: 13px; letter-spacing: .2em; }
        .dss-intro .kicker { color: var(--leaf-2); letter-spacing: .22em; }
        .dss-h1 { font: 400 clamp(44px,8vw,92px)/1.0 'Rozha One', var(--font-display); margin: 8px 0 18px;
          color: var(--cream); letter-spacing: .01em;
          text-shadow: 0 2px 26px rgba(0,0,0,.45); }
        .dss-h1 em { font-style: italic;
          background: linear-gradient(180deg, var(--leaf-2), var(--leaf) 70%, #b8842f);
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .dss-lede { font: 400 clamp(15px,1.4vw,18.5px)/1.8 var(--font-ui); color: rgba(244,230,200,.82); max-width: 70ch; margin: 0; }
        .dss-lede em { font-style: italic; color: var(--cream); }
        .dss-lede b { color: var(--leaf-2); font-weight: 600; }
        .dss-ip { font: 500 11.5px/1.5 var(--font-mono); color: rgba(244,230,200,.55); max-width: 70ch; margin: 18px 0 0;
          padding-top: 12px; border-top: 1px solid rgba(217,164,65,.35); letter-spacing: .01em; }
        /* the origin story on each skin card */
        .dss-skin-from { font: 400 11.5px/1.5 var(--font-ui); color: var(--muted); font-style: italic; margin-top: 3px; }

        /* the downloads shelf continues the royal register — dark ground, gilt cards */
        .dss-shelf-h { background: #1c0d0a; color: #f0cd7a; margin: 0; padding: 26px var(--edge) 0;
          font: 700 11px var(--font-mono); letter-spacing: .2em; text-transform: uppercase; }
        .dss-skins { --leaf: #d9a441; --leaf-2: #f0cd7a; --cream: #f4e6c8; --royal-2: #2f1712; --leaf-ln: rgba(217,164,65,.32);
          background: linear-gradient(180deg, #1c0d0a 0%, #23110d 100%);
          margin: 0; padding: 16px var(--edge) 22px;
          display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 12px;
          max-width: none; }
        .dss-skin { display: flex; flex-direction: column; background: var(--royal-2); color: var(--cream);
          border: 1px solid var(--leaf-ln); border-radius: 0; overflow: hidden;
          transition: transform .12s cubic-bezier(.2,.7,.2,1), box-shadow .16s ease, border-color .16s ease; }
        .dss-skin:hover { transform: translateY(-3px); box-shadow: 0 8px 22px rgba(0,0,0,.4); border-color: var(--leaf); }
        .dss-skin.on { border-color: var(--leaf-2); box-shadow: 0 0 0 1px var(--leaf-2), 0 8px 22px rgba(0,0,0,.45); }
        .dss-skin-band { height: 12px; width: 100%; display: block; }
        /* grow the body so the download bar always aligns at the card bottom, even
           when a skin's origin line is longer/shorter — keeps the row even */
        .dss-skin-apply { flex: 1; display: flex; flex-direction: column; align-items: flex-start; gap: 4px; text-align: left;
          cursor: pointer; background: transparent; border: 0; width: 100%; padding: 12px 12px 14px; color: inherit; }
        .dss-skin-name { font: 700 16px var(--font-ui); color: var(--cream); }
        .dss-skin-note { font: 400 12px var(--font-ui); color: rgba(244,230,200,.6); }
        .dss-skin-cta { font: 600 11px var(--font-mono); letter-spacing: .04em; color: var(--leaf-2); margin-top: 4px; }
        .dss-skin.on .dss-skin-cta { color: var(--leaf-2); }
        .dss-dl { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; padding: 8px 10px; border-top: 1px solid var(--leaf-ln); background: rgba(0,0,0,.18); }
        .dss-dl-h { font: 600 9.5px var(--font-mono); letter-spacing: .12em; text-transform: uppercase; color: rgba(244,230,200,.5); margin-right: 2px; }
        .dss-dl button { font: 600 11px var(--font-mono); cursor: pointer; background: transparent; color: var(--cream);
          border: 1px solid var(--leaf-ln); padding: 3px 7px; border-radius: 0; transition: background .12s ease, color .12s ease, border-color .12s ease; }
        .dss-dl button:hover { background: var(--leaf); color: #23110d; border-color: var(--leaf); }
        .dss-dl .dss-dl-zip { border-color: var(--leaf); color: var(--leaf-2); }
        .dss-dl .dss-dl-zip:hover { background: var(--leaf); color: #23110d; }
        .dss-dl .dss-dl-figma { border-color: color-mix(in srgb, var(--leaf) 60%, transparent); color: var(--leaf-2); }
        .dss-dl .dss-dl-figma:hover { background: var(--leaf-2); color: #23110d; border-color: var(--leaf-2); }
        /* the note closes the royal skin band */
        .dss-dl-note { background: #23110d; color: rgba(244,230,200,.5); margin: 0; padding: 0 var(--edge) 22px;
          font-size: 10.5px; border-bottom: 3px solid #d9a441; }

        /* jump-nav — a gilt rail on deep ground, the sticky throne-room ribbon */
        .dss-tabs { position: sticky; top: 58px; z-index: 20; display: flex; gap: 0; flex-wrap: wrap;
          background: #2f1712; border-top: 1px solid rgba(217,164,65,.3); border-bottom: 2px solid #d9a441;
          padding: 0 var(--edge); margin-top: 0; }
        .dss-tab { background: transparent; border: 0; cursor: pointer; color: rgba(244,230,200,.62);
          font: 600 13px var(--font-ui); padding: 12px 14px; border-bottom: 3px solid transparent; }
        .dss-tab:hover { color: #f4e6c8; }
        .dss-tab.on { color: #f0cd7a; border-bottom-color: #f0cd7a; }

        /* default is a sensible min until JS fits it to content (avoids the dark void) */
        .dss-frame { width: 100%; height: 1400px; border: 0; display: block; background: #23110d; }

        @media (max-width: 720px) {
          .dss-tabs { top: 54px; overflow-x: auto; flex-wrap: nowrap; }
          .dss-tab { white-space: nowrap; }
        }
      `}</style>
    </div>
  )
}
