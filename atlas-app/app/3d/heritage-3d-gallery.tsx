'use client'

import { useEffect, useState } from 'react'

// High-detail, ZOOMABLE 3D — self-hosted GLB models rendered with Google's <model-viewer>
// web component: drag to orbit, scroll/pinch to ZOOM into the stone, pan, and open AR on
// phones. Guaranteed to load (self-hosted, no third-party embed). The Ellora scan is a real
// photogrammetry capture; the others are our modelled archetypes. A link points to Sketchfab
// for community photogrammetry of each site.
const base = process.env.NEXT_PUBLIC_BASE_PATH || ''

type Model = {
  name: string; place: string; style: string; blurb: string
  glb: string; scan?: boolean; sketchfab: string
}
const MODELS: Model[] = [
  { name: 'Kailasa Temple, Ellora', place: 'Maharashtra · Cave 16', style: 'Rashtrakuta · rock-cut · photogrammetry',
    blurb: 'The largest monolithic rock-cut temple on earth — carved top-down from a single basalt cliff, 8th century. This is a real photogrammetry scan.',
    glb: 'ellora_scan.glb', scan: true, sketchfab: 'https://sketchfab.com/search?q=Kailasa+Ellora&type=models' },
  { name: 'Konark Sun Temple', place: 'Odisha', style: 'Ganga · Kalinga',
    blurb: 'A colossal stone chariot of the sun god Surya, its wheels carved as sundials, 13th century.',
    glb: 'sun_temple.glb', sketchfab: 'https://sketchfab.com/search?q=Konark+Sun+Temple&type=models' },
  { name: 'Nagara Shikhara', place: 'North Indian type', style: 'Nagara · latina curve',
    blurb: 'The soaring curvilinear tower of the northern temple — built up from the latina curve, apex at Khajuraho.',
    glb: 'nagara.glb', sketchfab: 'https://sketchfab.com/search?q=Kandariya+Khajuraho&type=models' },
  { name: 'Jain Temple', place: 'Ranakpur type', style: 'Māru-Gurjara · marble',
    blurb: 'The white-marble Jain temple — 1,444 uniquely carved pillars, no two alike, at Ranakpur.',
    glb: 'jain.glb', sketchfab: 'https://sketchfab.com/search?q=Ranakpur+Jain+temple&type=models' },
  { name: 'Stupa', place: 'Sanchi type', style: 'Buddhist · Mauryan',
    blurb: 'The hemispherical Buddhist reliquary mound, its toranas carved with the life of the Buddha — Sanchi, 3rd c. BCE.',
    glb: 'stupa.glb', sketchfab: 'https://sketchfab.com/search?q=Sanchi+stupa&type=models' },
]

export default function Heritage3DGallery() {
  const [i, setI] = useState(0)
  const m = MODELS[i]

  // load the model-viewer web component once
  useEffect(() => {
    if (document.getElementById('model-viewer-lib')) return
    const s = document.createElement('script')
    s.id = 'model-viewer-lib'; s.type = 'module'
    s.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js'
    document.head.appendChild(s)
  }, [])

  return (
    <div style={{ background: 'var(--bg)' }}>
      <div style={{ maxWidth: 'var(--wrap)', margin: '0 auto', padding: '18px var(--edge) 0' }}>
        <div className="kicker" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase' }}>
          Heritage · in high-detail 3D
        </div>
        <h1 style={{ font: "400 clamp(28px,4vw,42px) 'Rozha One', var(--font-display)", margin: '8px 0 6px', color: 'var(--ink)' }}>
          Walk around the stone
        </h1>
        <p style={{ font: '400 14px/1.6 var(--font-ui)', color: '#5c4a38', maxWidth: '64ch', margin: '0 0 14px' }}>
          Real 3D models of India&apos;s heritage — drag to orbit, <b>scroll or pinch to zoom</b> right into the carving,
          pan to move, open in AR on a phone. Pick a site below.
        </p>
      </div>

      <div className="h3g-tabs">
        {MODELS.map((mod, idx) => (
          <button key={mod.name} className={`h3g-tab${i === idx ? ' on' : ''}`} onClick={() => setI(idx)}>
            <span className="h3g-tab-n">{mod.name}{mod.scan ? ' ◆' : ''}</span>
            <span className="h3g-tab-p">{mod.place}</span>
          </button>
        ))}
      </div>

      <div className="h3g-stage">
        {/* @ts-expect-error — model-viewer is a custom element */}
        <model-viewer
          key={m.glb}
          src={`${base}/models3d/${m.glb}`}
          alt={m.name}
          camera-controls
          auto-rotate
          auto-rotate-delay="4000"
          rotation-per-second="12deg"
          shadow-intensity="1"
          exposure="1.05"
          ar
          ar-modes="webxr scene-viewer quick-look"
          className="h3g-viewer"
        />
        <aside className="h3g-cap">
          <div className="h3g-cap-style mono">{m.style}</div>
          <h2 className="h3g-cap-name">{m.name}</h2>
          <div className="h3g-cap-place mono">{m.place}</div>
          <p className="h3g-cap-blurb">{m.blurb}</p>
          <p className="h3g-cap-hint mono">drag to orbit · scroll / pinch to zoom · right-drag to pan · ⤢ AR on phone</p>
          <a className="h3g-cap-sf" href={m.sketchfab} target="_blank" rel="noopener">See community photogrammetry on Sketchfab ↗</a>
        </aside>
      </div>

      <style>{`
        .h3g-tabs { display: flex; gap: 0; flex-wrap: wrap; max-width: var(--wrap); margin: 0 auto; padding: 0 var(--edge);
          border-top: 2px solid var(--ink); border-bottom: 2px solid var(--ink); }
        .h3g-tab { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; background: transparent; border: 0;
          cursor: pointer; padding: 10px 14px; border-bottom: 3px solid transparent; text-align: left; }
        .h3g-tab:hover { background: color-mix(in srgb, var(--accent) 8%, transparent); }
        .h3g-tab.on { border-bottom-color: var(--accent); }
        .h3g-tab-n { font: 600 13.5px var(--font-ui); color: var(--ink); }
        .h3g-tab.on .h3g-tab-n { color: var(--accent); }
        .h3g-tab-p { font: 400 10px var(--font-mono); color: var(--muted); }
        .h3g-stage { display: grid; grid-template-columns: 1fr 300px; gap: 0; max-width: var(--wrap); margin: 0 auto;
          border-bottom: 2px solid var(--ink); }
        .h3g-viewer { width: 100%; height: min(74vh, 780px); display: block;
          background: radial-gradient(circle at 50% 40%, #2a2620, #14120f); border-right: 1px solid var(--line);
          --poster-color: transparent; }
        .h3g-cap { padding: 20px 22px; background: var(--surface); display: flex; flex-direction: column; gap: 6px; }
        .h3g-cap-style { font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--accent); }
        .h3g-cap-name { font: 400 24px 'Rozha One', var(--font-display); margin: 2px 0 0; color: var(--ink); }
        .h3g-cap-place { font-size: 11px; color: var(--muted); }
        .h3g-cap-blurb { font: 400 14px/1.6 var(--font-ui); color: var(--ink); margin: 10px 0 0; }
        .h3g-cap-hint { font-size: 10px; color: var(--muted); margin: 14px 0 0; padding-top: 10px; border-top: 1px solid var(--line); }
        .h3g-cap-sf { font: 600 11px var(--font-mono); color: var(--accent); margin-top: auto; padding-top: 14px; text-decoration: none; }
        .h3g-cap-sf:hover { text-decoration: underline; }
        @media (max-width: 820px) {
          .h3g-stage { grid-template-columns: 1fr; }
          .h3g-viewer { height: 62vh; border-right: 0; border-bottom: 1px solid var(--line); }
        }
      `}</style>
    </div>
  )
}
