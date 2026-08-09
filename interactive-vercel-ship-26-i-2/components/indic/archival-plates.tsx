// ARCHIVAL PLATES — "Plates of record" (Atlas Mockups turn 9b). A frame that
// holds REAL measured survey drawings, captioned with dimension strings and a
// provenance tag. The big plate is a real Vijayanagara pillar survey; the
// drawn plates (SurveyPlate / GopuramPlate) fill gaps where no real plate exists.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ''

export default function ArchivalPlates() {
  return (
    <div style={{ background: '#efe3cc', color: '#3a2418', fontFamily: 'Inter, sans-serif', borderRadius: 2, border: '1px solid rgba(42,32,24,.15)', overflow: 'hidden' }}>
      {/* header */}
      <div style={{ padding: '18px 26px 12px', borderBottom: '2px solid #9e3b2e', display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ font: "400 20px 'Rozha One', serif", color: '#9e3b2e' }}>Plates of record</span>
        <span style={{ font: "italic 400 13px 'Instrument Serif', serif", color: '#8a5a3a' }}>real measured drawings, framed by the system</span>
      </div>

      <div className="grid gap-0 md:grid-cols-[1.2fr_1fr]">
        {/* the big real plate */}
        <div style={{ minWidth: 0, padding: '18px 22px' }} className="border-b border-[rgba(158,59,46,.3)] md:border-b-0 md:border-r">
          <div style={{ width: '100%', border: '1.5px solid rgba(42,32,24,.5)', background: '#f2ecdd' }}>
            <img
              src={`${BASE}/plates/pillar-vijayanagara.webp`}
              alt="Composite mandapa pillar, Vijayanagara style — measured survey drawing"
              style={{ width: '100%', height: 'auto', display: 'block' }}
              loading="lazy"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 10, font: "500 9.5px 'JetBrains Mono', monospace", color: '#8a5a3a' }}>
            <span>PLATE XII · COMPOSITE PILLAR, VIJAYANAGARA STYLE</span>
            <span>15′-5″ · 20′-2⅛″</span>
          </div>
          <div style={{ font: "italic 400 13px/1.5 'Instrument Serif', serif", color: '#5a3c28', marginTop: 6 }}>
            The mandapa pillar as a carved universe — yali, deity niche, lotus base — from the measured
            survey. Scale figures at left and right.
          </div>
        </div>

        {/* the side slots + provenance note */}
        <div style={{ minWidth: 0, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            ['PLATE XIII · GOPURAM', 'A Dravida gateway — drawn in the system (9b)', '/temple-forms'],
            ['PLATE XIV · NAGARA SECTION', 'A shikhara elevation — drawn in the system (9a)', '/temple-forms'],
          ].map(([label, note]) => (
            <div key={label}>
              <div
                style={{ width: '100%', height: 150, border: '1.5px solid rgba(42,32,24,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 12, background: 'rgba(42,32,24,.03)' }}
              >
                <span style={{ font: "italic 400 12px 'Instrument Serif', serif", color: '#8a5a3a' }}>{note}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, font: "500 9.5px 'JetBrains Mono', monospace", color: '#8a5a3a' }}>
                <span>{label}</span>
                <span>T1 · ASI</span>
              </div>
            </div>
          ))}
          <div style={{ border: '1px solid rgba(158,59,46,.35)', borderRadius: 2, background: 'rgba(200,102,74,.07)', padding: '10px 12px', font: '400 11.5px/1.55 Inter', color: '#5a3c28' }}>
            Every plate carries its dimension strings and a provenance tag. Our <em>drawn</em> plates fill
            gaps; real survey drawings take precedence wherever they exist.
          </div>
        </div>
      </div>
    </div>
  )
}
