'use client'

// Embeds the vendored Three.js Temple 3D page (public/temple3d/) in a full-bleed
// iframe. The src carries the basePath so it resolves under /bharat/app in prod.
const base = process.env.NEXT_PUBLIC_BASE_PATH || ''

export default function Temple3DFrame() {
  return (
    <div style={{ background: '#e9e0cb' }}>
      <div style={{ maxWidth: 'var(--wrap)', margin: '0 auto', padding: '18px var(--edge) 0' }}>
        <div className="kicker" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase' }}>
          Heritage · parametric temple 3D
        </div>
        <h1 style={{ font: "400 clamp(28px,4vw,40px) 'Rozha One', var(--font-display)", margin: '8px 0 4px', color: '#2a2018' }}>
          The tower, built from a rule
        </h1>
        <p style={{ font: '400 14px/1.6 var(--font-ui)', color: 'var(--muted)', maxWidth: '60ch', margin: 0 }}>
          Three temple types, each generated from its own geometry — the Nagara latina curve
          <em> w = W(1−t)<sup>1.35</sup></em>, a Dravida vimana in stepped talas, a Kalinga deul with its chariot
          wheels. Drag to orbit; each exports to Blender as OBJ/GLB.
        </p>
      </div>
      <iframe
        src={`${base}/temple3d/`}
        title="Parametric temple in 3D"
        style={{ width: '100%', height: 'min(82vh, 820px)', border: 0, display: 'block', marginTop: 14 }}
        loading="lazy"
      />
    </div>
  )
}
