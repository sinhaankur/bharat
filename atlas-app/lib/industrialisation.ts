// "How this district industrialised" — era-coded timeline (mockup 7b). Currently
// Munger (Bihar): three regimes in one district. Era colours match the legend.
export type Era = 'pre' | 'colonial' | 'psu' | 'liberal'

export const ERA_LABEL: Record<Era, string> = {
  pre: 'PRE-COLONIAL',
  colonial: 'COLONIAL 1757–1947',
  psu: 'NEHRUVIAN PSU 1947–91',
  liberal: 'LIBERALISATION 1991–',
}
export const ERA_COLOR: Record<Era, string> = {
  pre: '#a8794a',
  colonial: '#9e3b2e',
  psu: '#2a4a7a',
  liberal: '#00877f',
}

export type IndEvent = {
  era: Era
  date: string      // e.g. "1762 · NAWABI"
  title: string
  body: string
  tier: 'T1' | 'T2' | 'T3' | 'gap'
  src?: string
}

export const INDUSTRIALISATION: Record<string, { title: string; events: IndEvent[]; note: string }> = {
  munger: {
    title: 'How this district industrialised',
    note: 'Every plant carries founded · era · ownership lineage — the colonial managing-agency system controlled ~¾ of Indian industry until abolished in 1970.',
    events: [
      { era: 'pre', date: '1762 · NAWABI', title: 'The Munger gun trade', body: 'Mir Qasim moves his capital and arsenal to Munger — the gunsmith tradition that still defines the district’s craft economy.', tier: 'T3' },
      { era: 'colonial', date: '1862 · EAST INDIA COMPANY → CROWN', title: 'Railway workshop, Jamalpur', body: 'Asia’s first full-scale railway workshop — the managing-agency era reaches the district.', tier: 'T2' },
      { era: 'colonial', date: '1907 · BRITISH-OWNED', title: 'Imperial Tobacco (ITC), Munger', body: 'Asia’s first cigarette factory. Ownership lineage: Imperial Tobacco → managing agency (to 1970 abolition) → ITC Ltd.', tier: 'T1', src: 'gazette' },
      { era: 'psu', date: '1947–91 · STATE', title: 'The PSU consolidation', body: 'Rail workshop nationalised into Indian Railways; the private mills thin out — employment shifts to the state.', tier: 'gap' },
    ],
  },
}
