'use client'

// Embeds the full "India by Design Systems" flagship deck (public/design-systems-full/)
// as-is — the complete 133KB document: hero, the region-grouped segment lattice, the
// chassis, the scripts and flags, the timeline, the explorations, the version register
// and the poster close. The interactive skin lattice above (DesignSystemsClient) is the
// live control; this is the full designed document beneath it. The src carries the
// basePath so it resolves under /bharat/app in prod.
const base = process.env.NEXT_PUBLIC_BASE_PATH || ''

export default function FlagshipFrame() {
  return (
    <section style={{ borderTop: '2px solid var(--ink)', background: '#f6f0e1' }}>
      <div data-reveal style={{ maxWidth: 'var(--wrap)', margin: '0 auto', padding: '26px var(--edge) 0' }}>
        <div className="kicker" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase' }}>
          The complete document · all segments
        </div>
        <h2 style={{ font: "400 clamp(24px,3.4vw,34px) 'Rozha One', var(--font-display)", margin: '8px 0 4px', color: '#2a2018' }}>
          India by Design Systems — in full
        </h2>
        <p style={{ font: '400 14px/1.6 var(--font-ui)', color: '#5c4a38', maxWidth: '62ch', margin: 0 }}>
          The whole flagship deck, exactly as designed: the segment lattice, the shared
          chassis, the scripts and flags, the timeline, the explorations, the version
          register and the poster close.
        </p>
      </div>
      <iframe
        src={`${base}/design-systems-full/`}
        title="India by Design Systems — the complete document"
        style={{ width: '100%', height: 'min(90vh, 1400px)', border: 0, display: 'block', marginTop: 14 }}
        loading="lazy"
      />
    </section>
  )
}
