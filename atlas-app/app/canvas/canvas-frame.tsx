'use client'

// Embeds the vendored "Atlas Mockups" design canvas (public/canvas/) in a full-bleed
// iframe — the complete multi-screen deck (Understand India hero, Ashoka's rule, the
// Mauryan Atomic Design System, Every page mapped, Money/land/law, the Birbhum ledger,
// The Engines…), served as-is. The src carries the basePath so it resolves under
// /bharat/app in prod.
const base = process.env.NEXT_PUBLIC_BASE_PATH || ''

export default function CanvasFrame() {
  return (
    <div style={{ background: '#e9e0cb' }}>
      <div data-reveal style={{ maxWidth: 'var(--wrap)', margin: '0 auto', padding: '18px var(--edge) 0' }}>
        <div className="kicker" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase' }}>
          The canvas · every screen, one deck
        </div>
        <h1 style={{ font: "400 clamp(28px,4vw,40px) 'Rozha One', var(--font-display)", margin: '8px 0 4px', color: '#2a2018' }}>
          The atlas, screen by screen
        </h1>
        <p style={{ font: '400 14px/1.6 var(--font-ui)', color: '#5c4a38', maxWidth: '62ch', margin: 0 }}>
          The full design canvas — the home hero, Ashoka&apos;s rule of the land, the atomic
          design system, the whole-site page map, the Birbhum edict-ledger and the Engines —
          laid out end to end, exactly as designed.
        </p>
      </div>
      <iframe
        src={`${base}/canvas-deck/`}
        title="The Atlas design canvas"
        style={{ width: '100%', height: 'min(88vh, 1100px)', border: 0, display: 'block', marginTop: 14 }}
        loading="lazy"
      />
    </div>
  )
}
