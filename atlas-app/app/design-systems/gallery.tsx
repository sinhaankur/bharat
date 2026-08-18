'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/* ────────────────────────────────────────────────────────────────────────────
   GALLERY MODE — the design systems shown one at a time, as framed plates hung
   on a lamplit museum wall. Adapted (vanilla React + CSS, no deps) from the
   art-gallery-slider + animated-spotlight references: a horizontal rail with one
   active plate spotlit and centred, ambient light that takes the active plate's
   colour, and prev/next by arrow keys, drag, wheel or the dot rail. Each "artwork"
   is a design system — its palette, its heritage motif, its gallery number.
   ──────────────────────────────────────────────────────────────────────────── */

type Plate = {
  id: string
  no: string        // gallery plate number, roman
  name: string
  era: string
  place: string
  line: string      // one-line heritage
  motif: 'pillar' | 'halo' | 'vimana' | 'jharokha' | 'chassis' | 'loom' | 'backwater'
  palette: { name: string; hex: string }[]
  ground: string    // plate ground
  ink: string       // plate ink
  accent: string    // the action colour
  skin?: string     // if it can reskin the site live
  href?: string     // full reference page
}

const PLATES: Plate[] = [
  {
    id: 'mauryan', no: 'I', name: 'Mauryan', era: 'c. 322–185 BCE', place: 'Magadha · the first empire',
    line: 'Stone, sky & the incised line — the austere imperial skeleton, carved from Chunar sandstone.',
    motif: 'pillar', ground: '#efe7d2', ink: '#2a2018', accent: '#c1440e', skin: 'chassis', href: 'design-system.html',
    palette: [
      { name: 'Chunar sandstone', hex: '#d8c9a6' }, { name: 'Ashokan polish', hex: '#b8a67e' },
      { name: 'Edict ink', hex: '#2a2018' }, { name: 'Vermilion', hex: '#c1440e' }, { name: 'Sky', hex: '#6e7f8c' },
    ],
  },
  {
    id: 'gupta', no: 'II', name: 'Gupta', era: 'c. 320–550 CE', place: 'the classical age',
    line: 'Plaster, fresco & the ornate halo — Mathura red sandstone and the jewel-tones of Ajanta.',
    motif: 'halo', ground: '#f2e7cf', ink: '#3a241a', accent: '#c9a227', skin: 'gupta', href: 'ds-gupta.html',
    palette: [
      { name: 'Ajanta plaster', hex: '#efe1c4' }, { name: 'Mathura rose', hex: '#c58a6a' },
      { name: 'Halo gold', hex: '#c9a227' }, { name: 'Terre-verte', hex: '#5b7351' }, { name: 'Badakhshan lapis', hex: '#2a4a7a' },
    ],
  },
  {
    id: 'chola', no: 'III', name: 'Chola', era: '9th–13th c. CE', place: 'Tamil imperial',
    line: 'Bronze, granite & the sacred red — Thanjavur granite and kumkum vermilion as the action.',
    motif: 'vimana', ground: '#f0e9dd', ink: '#3a2a1a', accent: '#a8322b', skin: 'tamil', href: 'ds-chola.html',
    palette: [
      { name: 'Sacred ash', hex: '#eae3d4' }, { name: 'Gopuram gold', hex: '#c9862b' },
      { name: 'Bronze', hex: '#7a5a3a' }, { name: 'Kumkum', hex: '#a8322b' }, { name: 'Patina', hex: '#4e7a63' },
    ],
  },
  {
    id: 'rajput', no: 'IV', name: 'Rajput', era: '8th–18th c.', place: 'the desert courts',
    line: 'Sandstone, mirror-work & miniature colour — Jaisalmer gold, indigo, and gold-leaf on wasli.',
    motif: 'jharokha', ground: '#f4ead2', ink: '#3a2418', accent: '#c9345a', skin: 'rajasthan', href: 'ds-rajput.html',
    palette: [
      { name: 'Wasli cream', hex: '#efe2c6' }, { name: 'Haveli sandstone', hex: '#cc9a54' },
      { name: 'Court sepia', hex: '#5a3a24' }, { name: 'Vermilion', hex: '#c9345a' }, { name: 'Miniature indigo', hex: '#2a4a7a' },
    ],
  },
  {
    id: 'kerala', no: 'V', name: 'Kerala', era: 'living', place: 'the backwater coast',
    line: 'Coir green, brass & rain — the temple-and-lagoon register of the Malabar coast.',
    motif: 'backwater', ground: '#e9ecdd', ink: '#1c241a', accent: '#2f7d4f', skin: 'kerala',
    palette: [
      { name: 'Coir', hex: '#c7b489' }, { name: 'Backwater green', hex: '#2f7d4f' },
      { name: 'Teak', hex: '#5a3a22' }, { name: 'Temple brass', hex: '#b8863b' }, { name: 'Monsoon slate', hex: '#4a5b60' },
    ],
  },
  {
    id: 'naga', no: 'VI', name: 'Nagaland', era: 'living', place: 'the loom of the hills',
    line: 'Shawl bands, warrior red & loom black — the woven grammar of the Naga highlands.',
    motif: 'loom', ground: '#efe6d8', ink: '#201a16', accent: '#b3271f', skin: 'naga',
    palette: [
      { name: 'Loom cream', hex: '#e6dcc6' }, { name: 'Warrior red', hex: '#b3271f' },
      { name: 'Loom black', hex: '#201a16' }, { name: 'Shawl white', hex: '#f4efe3' }, { name: 'Hill green', hex: '#3f6b45' },
    ],
  },
]

// ── the heritage motif line-art, drawn per plate (real iconography, gilt) ──
function Motif({ kind, color }: { kind: Plate['motif']; color: string }) {
  const p = { fill: 'none', stroke: color, strokeWidth: 2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
  switch (kind) {
    case 'pillar': // Ashokan lion pillar
      return (<svg viewBox="0 0 80 120" width="72" height="108" aria-hidden><g {...p}><path d="M34 108 L36 44 H44 L46 108 Z" /><path d="M30 44 C33 34 47 34 50 44 Z" /><rect x="30" y="30" width="20" height="8" /><path d="M33 30 C33 22 36 18 40 14 C44 18 47 22 47 30" /><circle cx="40" cy="10" r="4" /><path d="M22 112 H58" /></g></svg>)
    case 'halo': // radiating prabhavali halo
      return (<svg viewBox="0 0 120 120" width="104" height="104" aria-hidden><g {...p}><circle cx="60" cy="60" r="26" /><circle cx="60" cy="60" r="40" opacity="0.6" />{Array.from({ length: 24 }, (_, i) => (<line key={i} x1="60" y1="18" x2="60" y2="8" transform={`rotate(${i * 15} 60 60)`} />))}<circle cx="60" cy="60" r="9" fill={color} stroke="none" /></g></svg>)
    case 'vimana': // stepped Dravida tower
      return (<svg viewBox="0 0 100 120" width="88" height="106" aria-hidden><g {...p}>{[0, 1, 2, 3].map((i) => (<rect key={i} x={30 - i * 6} y={90 - i * 22} width={40 + i * 12} height="18" />))}<path d="M40 24 H60 L54 8 H46 Z" /><path d="M50 8 V2" /></g></svg>)
    case 'jharokha': // arched Rajput balcony window
      return (<svg viewBox="0 0 100 120" width="88" height="106" aria-hidden><g {...p}><path d="M24 108 V52 C24 30 76 30 76 52 V108" /><path d="M32 108 V56 C32 40 68 40 68 56 V108" /><path d="M50 40 V108 M32 74 H68" /><path d="M18 108 H82" /><path d="M28 30 H72 L66 20 H34 Z" /></g></svg>)
    case 'backwater': // temple lamp over water lines
      return (<svg viewBox="0 0 110 120" width="96" height="104" aria-hidden><g {...p}><path d="M40 22 C40 40 46 48 55 48 C64 48 70 40 70 22" /><path d="M55 48 V60 M46 60 H64" /><path d="M55 14 V8" /><path d="M14 78 Q30 70 46 78 T78 78 T110 78 M4 92 Q22 84 40 92 T76 92 T108 92 M10 106 Q28 98 46 106 T82 106" /></g></svg>)
    case 'loom': // Naga shawl weave bands
      return (<svg viewBox="0 0 120 100" width="104" height="88" aria-hidden><g {...p}><rect x="14" y="18" width="92" height="64" />{[30, 42, 54, 66][0] && [26, 38, 50, 62, 74].map((y) => (<line key={y} x1="14" y1={y} x2="106" y2={y} />))}{[34, 54, 74, 94].map((x, i) => (<path key={x} d={`M${x} 18 l6 8 l-6 8 l6 8 l-6 8 l6 8 l-6 8`} opacity={i % 2 ? 0.6 : 1} />))}</g></svg>)
    case 'chassis': // the bare modernist frame
    default:
      return (<svg viewBox="0 0 100 100" width="88" height="88" aria-hidden><g {...p}><rect x="16" y="16" width="68" height="68" /><path d="M16 40 H84 M40 16 V84" /></g></svg>)
  }
}

export default function Gallery() {
  const [i, setI] = useState(0)
  const [reduced, setReduced] = useState(false)
  const railRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef<number | null>(null)
  const [dragDX, setDragDX] = useState(0)
  const wheelLock = useRef(0)
  const n = PLATES.length
  const cur = PLATES[i]

  const go = useCallback((next: number) => setI((v) => Math.max(0, Math.min(n - 1, next))), [n])
  const prev = useCallback(() => go(i - 1), [go, i])
  const next = useCallback(() => go(i + 1), [go, i])

  useEffect(() => {
    setReduced(
      document.documentElement.getAttribute('data-reduce-motion') === '1' ||
      (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    )
  }, [])

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
      else if (e.key === 'ArrowRight') { e.preventDefault(); next() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next])

  // wheel (horizontal intent)
  function onWheel(e: React.WheelEvent) {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    const now = Date.now()
    if (now < wheelLock.current || Math.abs(d) < 12) return
    wheelLock.current = now + 420
    d > 0 ? next() : prev()
  }

  // drag / swipe
  function onDown(clientX: number) { dragStart.current = clientX; setDragDX(0) }
  function onMove(clientX: number) { if (dragStart.current != null) setDragDX(clientX - dragStart.current) }
  function onUp() {
    if (dragStart.current != null) {
      if (dragDX < -60) next(); else if (dragDX > 60) prev()
    }
    dragStart.current = null; setDragDX(0)
  }

  // spotlight follows the active plate's accent
  const amb = cur.accent

  return (
    <section
      id="gallery"
      className="gal"
      aria-roledescription="carousel"
      aria-label="Indic design systems gallery"
      onWheel={onWheel}
      style={{ ['--amb' as string]: amb, ['--gal-ground' as string]: cur.ground }}
    >
      {/* ambient lamplight — takes the active plate's colour */}
      <div className="gal-amb" aria-hidden style={{ background: `radial-gradient(60% 55% at 50% 8%, ${amb}44 0%, transparent 60%)` }} />
      <div className="gal-spot" aria-hidden />
      <div className="gal-jali" aria-hidden><svg width="100%" height="100%"><rect width="100%" height="100%" fill="url(#jali)" /></svg></div>

      {/* header — plate counter, like a museum room number */}
      <div className="gal-head">
        <span className="gal-kicker">Indic Designs™ · the gallery</span>
        <span className="gal-count">{String(i + 1).padStart(2, '0')}<span className="gal-count-sep">/</span>{String(n).padStart(2, '0')}</span>
      </div>

      {/* the rail of framed plates */}
      <div
        ref={railRef}
        className="gal-stage"
        onMouseDown={(e) => onDown(e.clientX)}
        onMouseMove={(e) => dragStart.current != null && onMove(e.clientX)}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onTouchStart={(e) => onDown(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={onUp}
      >
        <div
          className="gal-rail"
          style={{
            transform: `translateX(calc(50% - ${i * 520 + 260}px + ${dragDX}px))`,
            transition: dragStart.current != null || reduced ? 'none' : 'transform .6s cubic-bezier(.32,.72,0,1)',
          }}
        >
          {PLATES.map((pl, idx) => {
            const active = idx === i
            return (
              <article
                key={pl.id}
                className={`gal-plate${active ? ' is-active' : ''}`}
                aria-hidden={!active}
                style={{ ['--pl-ground' as string]: pl.ground, ['--pl-ink' as string]: pl.ink, ['--pl-accent' as string]: pl.accent }}
                onClick={() => !active && go(idx)}
              >
                {/* gilt frame */}
                <div className="gal-frame">
                  <span className="gal-corner tl" /><span className="gal-corner tr" /><span className="gal-corner bl" /><span className="gal-corner br" />
                  <div className="gal-plate-in">
                    <div className="gal-plate-top">
                      <span className="gal-no">Plate {pl.no}</span>
                      <span className="gal-era">{pl.era}</span>
                    </div>
                    <div className="gal-motif"><Motif kind={pl.motif} color={pl.accent} /></div>
                    <h2 className="gal-name">{pl.name}</h2>
                    <div className="gal-place">{pl.place}</div>
                    <p className="gal-line">{pl.line}</p>
                    {/* the palette, as a mounted colour strip */}
                    <div className="gal-palette">
                      {pl.palette.map((c) => (
                        <span key={c.name} className="gal-sw" style={{ background: c.hex }} title={`${c.name} · ${c.hex}`} />
                      ))}
                    </div>
                    <div className="gal-actions">
                      {pl.skin && (
                        <button
                          className="gal-wear"
                          onClick={(e) => { e.stopPropagation(); document.documentElement.dataset.skin = pl.skin!; try { localStorage.setItem('atlas-skin', pl.skin!) } catch {} }}
                        >Wear this skin →</button>
                      )}
                      {pl.href && <a className="gal-open" href={`/bharat/${pl.href}`} onClick={(e) => e.stopPropagation()}>Open the reference</a>}
                    </div>
                  </div>
                </div>
                {/* brass nameplate under the frame */}
                <div className="gal-brass">{pl.name.toUpperCase()} · {pl.era}</div>
              </article>
            )
          })}
        </div>
      </div>

      {/* prev / next arrows */}
      <button className="gal-nav gal-prev" onClick={prev} disabled={i === 0} aria-label="Previous system">‹</button>
      <button className="gal-nav gal-next" onClick={next} disabled={i === n - 1} aria-label="Next system">›</button>

      {/* dot rail */}
      <div className="gal-dots" role="tablist" aria-label="Choose a plate">
        {PLATES.map((pl, idx) => (
          <button
            key={pl.id}
            role="tab"
            aria-selected={idx === i}
            aria-label={pl.name}
            className={`gal-dot${idx === i ? ' on' : ''}`}
            onClick={() => go(idx)}
            style={{ ['--dot' as string]: pl.accent }}
          />
        ))}
      </div>

      <div className="gal-hint">
        <kbd>←</kbd><kbd>→</kbd><span>walk the gallery · drag or scroll</span>
      </div>

      <style>{galleryCss}</style>
    </section>
  )
}

const galleryCss = `
  .gal { position: relative; overflow: hidden; min-height: 760px;
    background:
      radial-gradient(120% 90% at 50% -20%, #2c1712 0%, #1c0d0a 60%, #120807 100%);
    padding: 0; isolation: isolate; }
  /* the top spotlight cone from an unseen lamp */
  .gal-spot { position: absolute; top: -14%; left: 50%; transform: translateX(-50%);
    width: 120%; height: 90%; pointer-events: none; z-index: 0;
    background: conic-gradient(from 180deg at 50% 0%, transparent 78deg, rgba(255,240,205,.10) 90deg, transparent 102deg);
    filter: blur(2px); }
  .gal-amb { position: absolute; inset: 0; pointer-events: none; z-index: 0; transition: background .6s ease; }
  .gal-jali { position: absolute; inset: 0; pointer-events: none; z-index: 0; color: #d9a441; opacity: .08; }

  .gal-head { position: relative; z-index: 3; display: flex; align-items: baseline; justify-content: space-between;
    max-width: 1100px; margin: 0 auto; padding: 28px var(--edge) 0; }
  .gal-kicker { font: 700 11px var(--font-mono); letter-spacing: .24em; text-transform: uppercase; color: #f0cd7a; }
  .gal-count { font: 400 15px var(--font-mono); color: rgba(244,230,200,.6); }
  .gal-count-sep { margin: 0 6px; color: rgba(244,230,200,.3); }

  .gal-stage { position: relative; z-index: 2; margin-top: 8px; padding: 24px 0 8px; cursor: grab; user-select: none; }
  .gal-stage:active { cursor: grabbing; }
  .gal-rail { display: flex; align-items: center; gap: 40px; will-change: transform; }

  .gal-plate { flex: 0 0 480px; width: 480px; opacity: .38; transform: scale(.86);
    transition: opacity .6s ease, transform .6s cubic-bezier(.32,.72,0,1); filter: saturate(.7); cursor: pointer; }
  .gal-plate.is-active { opacity: 1; transform: scale(1); filter: none; cursor: default; }

  /* the gilt frame — a double gold-leaf border with corner flourishes */
  .gal-frame { position: relative; background: var(--pl-ground); color: var(--pl-ink);
    border: 2px solid #d9a441; box-shadow: 0 0 0 6px #23110d, 0 0 0 8px #b8842f,
      0 30px 60px -20px rgba(0,0,0,.7); padding: 6px; }
  .gal-plate.is-active .gal-frame { box-shadow: 0 0 0 6px #23110d, 0 0 0 8px #f0cd7a,
      0 40px 80px -18px rgba(0,0,0,.85), 0 0 60px -10px var(--amb); }
  .gal-corner { position: absolute; width: 16px; height: 16px; border: 2px solid #f0cd7a; z-index: 2; }
  .gal-corner.tl { top: -2px; left: -2px; border-right: 0; border-bottom: 0; }
  .gal-corner.tr { top: -2px; right: -2px; border-left: 0; border-bottom: 0; }
  .gal-corner.bl { bottom: -2px; left: -2px; border-right: 0; border-top: 0; }
  .gal-corner.br { bottom: -2px; right: -2px; border-left: 0; border-top: 0; }
  .gal-plate-in { border: 1px solid color-mix(in srgb, var(--pl-ink) 20%, transparent); padding: 26px 28px 24px; text-align: center; }

  .gal-plate-top { display: flex; justify-content: space-between; font: 600 10px var(--font-mono);
    letter-spacing: .14em; text-transform: uppercase; color: color-mix(in srgb, var(--pl-ink) 55%, transparent); }
  .gal-motif { height: 116px; display: grid; place-items: center; margin: 10px 0 6px; }
  .gal-name { font: 400 clamp(34px,4vw,52px) 'Rozha One', var(--font-display); margin: 0; color: var(--pl-ink); line-height: 1; }
  .gal-place { font: 600 11px var(--font-mono); letter-spacing: .12em; text-transform: uppercase;
    color: var(--pl-accent); margin: 8px 0 0; }
  .gal-line { font: 400 14px/1.6 var(--font-ui); color: color-mix(in srgb, var(--pl-ink) 80%, transparent);
    max-width: 42ch; margin: 14px auto 0; }
  .gal-palette { display: flex; gap: 0; justify-content: center; margin: 20px 0 0;
    border: 1px solid color-mix(in srgb, var(--pl-ink) 25%, transparent); }
  .gal-sw { width: 44px; height: 26px; }
  .gal-actions { display: flex; gap: 10px; justify-content: center; margin: 20px 0 2px; flex-wrap: wrap; }
  .gal-wear { font: 700 12px var(--font-ui); cursor: pointer; background: var(--pl-accent); color: #fff;
    border: 0; padding: 9px 16px; }
  .gal-wear:hover { filter: brightness(1.08); }
  .gal-open { font: 600 12px var(--font-ui); color: var(--pl-ink); border: 1.5px solid var(--pl-ink);
    padding: 8px 15px; text-decoration: none; }
  .gal-open:hover { background: var(--pl-ink); color: var(--pl-ground); }

  /* brass nameplate under the frame */
  .gal-brass { margin: 16px auto 0; width: max-content; max-width: 90%; font: 700 10.5px var(--font-mono);
    letter-spacing: .16em; color: #2a1c10; background: linear-gradient(180deg,#e8c477,#c9962f);
    padding: 6px 16px; border: 1px solid #8a5f1e; box-shadow: 0 2px 6px rgba(0,0,0,.5);
    opacity: 0; transition: opacity .5s ease .1s; }
  .gal-plate.is-active .gal-brass { opacity: 1; }

  .gal-nav { position: absolute; top: 46%; z-index: 4; width: 48px; height: 48px; border-radius: 50%;
    background: rgba(35,17,13,.6); color: #f0cd7a; border: 1px solid rgba(217,164,65,.5);
    font-size: 24px; line-height: 1; cursor: pointer; backdrop-filter: blur(6px);
    display: grid; place-items: center; transition: background .15s, transform .15s; }
  .gal-nav:hover:not(:disabled) { background: rgba(217,164,65,.22); transform: scale(1.06); }
  .gal-nav:disabled { opacity: .25; cursor: default; }
  .gal-prev { left: max(16px, calc(50% - 560px)); }
  .gal-next { right: max(16px, calc(50% - 560px)); }

  .gal-dots { position: relative; z-index: 3; display: flex; gap: 12px; justify-content: center; margin: 18px 0 0; }
  .gal-dot { width: 10px; height: 10px; border-radius: 50%; border: 1.5px solid rgba(217,164,65,.5);
    background: transparent; cursor: pointer; padding: 0; transition: all .2s; }
  .gal-dot:hover { border-color: #f0cd7a; }
  .gal-dot.on { background: var(--dot); border-color: #f0cd7a; box-shadow: 0 0 10px 1px var(--dot); transform: scale(1.25); }

  .gal-hint { position: relative; z-index: 3; display: flex; gap: 8px; align-items: center; justify-content: center;
    margin: 18px 0 30px; color: rgba(244,230,200,.4); font-size: 12px; }
  .gal-hint kbd { font: 600 11px var(--font-mono); border: 1px solid rgba(217,164,65,.3);
    background: rgba(0,0,0,.2); padding: 2px 7px; color: rgba(244,230,200,.6); }

  @media (max-width: 640px) {
    .gal-plate { flex-basis: 300px; width: 300px; }
    .gal-rail { gap: 20px; }
    .gal-prev, .gal-next { display: none; }
  }
  @media (prefers-reduced-motion: reduce) {
    .gal-plate, .gal-rail, .gal-amb, .gal-brass { transition: none !important; }
  }
`
