'use client'

// The full "India by Design Systems" flagship deck (public/design-systems-full/) IS the
// page — the complete 133KB handoff document: hero, the region-grouped segment lattice
// (Mauryan Imperial, Gupta Classical, Kolam Grid, Indigo Press, Gamosa, Kangla…), the
// chassis, scripts, flags, timeline, explorations, version register and poster close.
// Served full-bleed under the app chrome so /design-systems matches the handoff document
// exactly. The src carries the basePath so it resolves under /bharat/app in prod.
const base = process.env.NEXT_PUBLIC_BASE_PATH || ''

export default function FlagshipFrame() {
  return (
    <iframe
      src={`${base}/design-systems-full/`}
      title="India by Design Systems — the complete document"
      style={{ width: '100%', height: 'calc(100vh - 58px)', border: 0, display: 'block', background: '#f6f0e1' }}
    />
  )
}
