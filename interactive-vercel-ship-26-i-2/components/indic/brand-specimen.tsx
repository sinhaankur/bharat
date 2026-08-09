// BRAND SPECIMEN — a one-sheet design-direction card (from the Atlas Mockups
// "Indic spectrum", turn 8). Each of the four registers of the system, shown as
// its own brand specimen: seal + name + tagline, a swatch row, an accent-law
// note, a display line, and a "use for" footer.

export type Register = {
  id: string
  name: string
  glyph: string
  tagline: string
  swatches: string[]
  paper: string
  ink: string
  accent: string
  display: string // font-family for the display line
  headline: string
  law: string
  useFor: string
}

export const REGISTERS: Register[] = [
  {
    id: 'mauryan',
    name: 'Mauryan Imperial',
    glyph: 'भ',
    tagline: 'AUSTERE · MONUMENTAL · SINGULAR — THE SKELETON',
    swatches: ['#e9ddc7', '#dcccae', '#2a2018', '#cc8900', '#3078c0', '#a8452a'],
    paper: '#e9ddc7', ink: '#2a2018', accent: '#cc8900',
    display: 'var(--font-playfair), Fraunces, serif',
    headline: 'Money, land & law — carved in the open.',
    law: 'Gold #cc8900 = action only · sky = data only · terracotta = warnings. One accent per element, never two.',
    useFor: 'nav · map · ledger · tables · every structural page',
  },
  {
    id: 'gupta',
    name: 'Gupta Classical',
    glyph: 'ॐ',
    tagline: 'ORNATE · SERENE · DEVOTIONAL — THE SOUL',
    swatches: ['#efe3cc', '#c8664a', '#d98a6a', '#c68a2e', '#9e3b2e', '#4f6b45', '#2a4a7a', '#cba233'],
    paper: '#efe3cc', ink: '#3a2418', accent: '#c8664a',
    display: "'Rozha One', serif",
    headline: 'The soul register — Mathura red, Ajanta jewels.',
    law: 'Mathura sandstone ground, Ajanta fresco jewel-tones, halo-gold. Ornament allowed; never loud with structure.',
    useFor: 'ashoka · vedas · temple-forms · heritage · cave-walk · articles',
  },
  {
    id: 'kolam',
    name: 'Kolam Grid',
    glyph: '⁙',
    tagline: 'MODERN INDIC · RICE-FLOUR GEOMETRY ON SLATE',
    swatches: ['#1e2226', '#2b3138', '#f0ede6', '#e8b04a', '#d95d39', '#5aa08c', '#f0c46a'],
    paper: '#1e2226', ink: '#f0ede6', accent: '#e8b04a',
    display: '"Archivo", sans-serif',
    headline: 'Rice-flour geometry, ordering the dark.',
    law: 'A dot-grid orders every layout; kolam line-work as rule and divider. Archivo + mono, on slate.',
    useFor: 'dashboards · explore · data pages · the darkest 3D register',
  },
  {
    id: 'indigo',
    name: 'Indigo Press',
    glyph: '❁',
    tagline: 'TEXTILE-BLOCK INDIA · INDIGO · TURMERIC · MADDER',
    swatches: ['#f2ecdd', '#22304a', '#3a5078', '#d9a521', '#a63d2f', '#8b9b6e', '#16223a'],
    paper: '#f2ecdd', ink: '#22304a', accent: '#a63d2f',
    display: "'Yatra One', system-ui, sans-serif",
    headline: 'Block-printed India, on unbleached cotton.',
    law: 'Indigo vat + turmeric + madder on cotton; stamped edges, hand-block motifs. Warmest, least governmental.',
    useFor: 'culture pages · languages · the feed',
  },
]

export default function BrandSpecimen({ r }: { r: Register }) {
  return (
    <div style={{ background: r.paper, color: r.ink, borderRadius: 2, border: '1px solid rgba(42,32,24,.15)', overflow: 'hidden' }}>
      {/* header */}
      <div style={{ padding: '20px 22px 16px', borderBottom: `2px solid ${r.ink}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 34, color: r.accent, lineHeight: 1 }} aria-hidden="true">{r.glyph}</span>
        <div>
          <div style={{ font: `600 22px ${r.display}` }}>{r.name}</div>
          <div style={{ font: "600 8px 'JetBrains Mono', monospace", letterSpacing: '.18em', opacity: 0.65, marginTop: 2 }}>{r.tagline}</div>
        </div>
      </div>
      {/* swatch row */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(42,32,24,.2)' }}>
        {r.swatches.map((c, i) => (
          <div key={i} style={{ flex: 1, height: 40, background: c }} />
        ))}
      </div>
      {/* body */}
      <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ font: '400 12px/1.6 Inter, sans-serif', opacity: 0.85, margin: 0 }}>{r.law}</p>
        {/* demo row */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ borderRadius: 2, background: r.accent, color: r.paper, font: '600 12px Inter', padding: '8px 13px' }}>Open the ledger</span>
          <span style={{ borderRadius: 2, border: `1.5px solid ${r.ink}`, font: '600 12px Inter', padding: '7px 13px' }}>Audit figures</span>
        </div>
        <div style={{ font: `600 24px/1.15 ${r.display}` }}>{r.headline}</div>
        <div style={{ borderTop: '1px solid rgba(42,32,24,.2)', paddingTop: 10, font: "400 10px 'JetBrains Mono', monospace", opacity: 0.6 }}>
          USE FOR: {r.useFor}
        </div>
      </div>
    </div>
  )
}
