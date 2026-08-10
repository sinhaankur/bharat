// District ledger content for the deep-district pages (mockup 1b "Edict Ledger").
// Birbhum is the fully-built template; the others carry the same shape at the depth
// we have. Sourced-or-gap: a figure is cited (tier tag) or shown as an explicit gap.

export type Tier = 'T1' | 'T2' | 'T3' | 'gap'
export type Event = { year: string; text: string; tier: Tier; src?: string }
export type Stat = { value: string; label: string; tone?: 'warn' | 'muted' }
export type Dept = { name: string; allocCr: number; scheme?: string; ministry?: string }

export type District = {
  slug: string
  name: string
  state: string
  model: string
  dek: string
  stats: Stat[]
  events: Event[]
  chain: string[]        // chain of command, active node marked with a leading '*'
  provenance: { label: string; value: string; tone?: 'good' | 'gold' }[]
  departments?: { source: string; sourceTier: Tier; fy: string; rows: Dept[] }  // real KMC-style budget lines
  gaps?: string[]        // declared gaps (sourced-or-gap made explicit)
}

export const DISTRICTS: Record<string, District> = {
  // Kolkata — the deepest real ledger. Figures from the KMC Budget 2025-26 PDF (T1)
  // and MPLADS delivery review (T4). A split-admin metro with no conventional DM.
  kolkata: {
    slug: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    model: 'split-admin metro',
    dek: 'More than half the city’s civic money is grant-in-aid transferred down — and the budget still runs a deficit. No single DM answers for it.',
    stats: [
      { value: '₹5,525 cr', label: 'KMC receipts · BE 2025-26 · T1' },
      { value: '52%', label: 'is Central + State grant-in-aid (₹2,897 cr)', tone: 'warn' },
      { value: '₹5,639.56 cr', label: 'expenditure — a deficit budget', tone: 'muted' },
    ],
    events: [
      { year: 'Structure', text: 'No conventional District Magistrate/Collector: magisterial powers vest in the Commissioner of Police (Ajay Kumar Nand, IPS); a limited Collector handles only stamp/registration; service delivery runs through KMC. “Who is the DM responsible for this money?” has no single answer here.', tier: 'T3', src: 'wiki' },
      { year: 'Money', text: '~52% of KMC’s ₹5,525 cr receipts is Government Grant-in-Aid from Centre + State (₹2,897 cr) vs ₹2,628 cr raised from own sources — more than half the civic money is transferred down, not locally generated.', tier: 'T1', src: 'KMC PDF' },
      { year: 'Delivery', text: 'MPLADS delivery is recommendation-heavy but completion-poor: Kolkata Uttar completed 3 of 36 works, Kolkata Dakshin 0 of 73 (as on 2026-01-06). Money flows in on paper, converts to far less on the ground.', tier: 'T3', src: 'review' },
    ],
    chain: ['Union Ministries (MoHUA / Jal Shakti / MoRD)', 'State (UD&MA Dept)', '*Commissioner of Police (magisterial) + Municipal Commissioner', 'KMC — 16 boroughs, 144 wards'],
    provenance: [
      { label: 'Source coverage', value: '81%', tone: 'good' },
      { label: 'Tier-1 figures', value: '18' },
      { label: 'Declared gaps', value: '9', tone: 'gold' },
      { label: 'Awaiting upgrade ⚠', value: '5' },
    ],
    departments: {
      source: 'kmcgov.in — Budget 2025-26 PDF',
      sourceTier: 'T1',
      fy: 'BE 2025-26',
      rows: [
        { name: 'Solid Waste Management', allocCr: 720.85, scheme: 'SWM Rules 2016', ministry: 'MoEF&CC (Union) — rules; ULB implements' },
        { name: 'Water Supply', allocCr: 444.97, scheme: 'AMRUT 2.0', ministry: 'MoHUA (Union)' },
        { name: 'Sewerage & Drainage', allocCr: 335.69, scheme: 'NMCG', ministry: 'Jal Shakti (Union)' },
        { name: 'Roads', allocCr: 318.22 },
        { name: 'Slum Development', allocCr: 232.69, scheme: 'DAY-NULM · PMAY-U', ministry: 'MoHUA (Union)' },
        { name: 'Health', allocCr: 186.55, scheme: '15th FC Health Grants', ministry: 'Finance Commission (Union)' },
        { name: 'Lighting', allocCr: 164.45 },
        { name: 'Education', allocCr: 52.12 },
        { name: 'Parks & Squares', allocCr: 46.35 },
        { name: 'Social Welfare & Poverty Alleviation', allocCr: 29.52, scheme: 'NSAP', ministry: 'MoRD (Union)' },
      ],
    },
    gaps: [
      'Scheme-wise split of the ₹2,897 cr grant (AMRUT 2.0 / PMAY-U / 15th FC Health / NMCG named in the budget; individual ₹ pending Volume-II)',
      'MPLADS exact released & unspent per constituency (have spent + completed from the review; need the official portal release figure)',
      'Utilisation % and CAG audit data for the civic budget',
      'Municipal Commissioner & District Judge names (posts, not persons, are sourced)',
      'District-level Census C-16 mother-tongue split',
    ],
  },
  birbhum: {
    slug: 'birbhum',
    name: 'Birbhum',
    state: 'West Bengal',
    model: 'standard rural model',
    dek: 'Where the central money stopped — a four-year MGNREGS fund freeze, ₹3,038 cr+ in dues.',
    stats: [
      { value: '₹0', label: 'MGNREGS inflow FY22–25 · frozen', tone: 'warn' },
      { value: '₹3,038 cr+', label: 'central dues claimed by state · T1' },
      { value: '—', label: 'own-source revenue · explicit gap', tone: 'muted' },
    ],
    events: [
      { year: '2021', text: 'Centre freezes MGNREGS funds to West Bengal citing Section 27 non-compliance.', tier: 'T1', src: 'PIB' },
      { year: '2023', text: 'Calcutta HC directs Centre to state reasons; dues litigation begins.', tier: 'T2', src: 'court' },
      { year: '2025', text: 'Partial release ordered; district-level disbursal not yet in a public PDF.', tier: 'gap' },
    ],
    chain: ['Union Ministry (MoRD)', 'State (P&RD Dept)', '*DM, Birbhum', '19 BDOs'],
    provenance: [
      { label: 'Source coverage', value: '78%', tone: 'good' },
      { label: 'Tier-1 figures', value: '14' },
      { label: 'Declared gaps', value: '6', tone: 'gold' },
      { label: 'Awaiting upgrade ⚠', value: '3' },
    ],
  },
  'greater-bombay': {
    slug: 'greater-bombay',
    name: 'Greater Bombay',
    state: 'Maharashtra',
    model: 'split-admin metro',
    dek: 'India’s richest civic body — ₹74,427 cr of budget across a split-administration metro.',
    stats: [
      { value: '₹74,427 cr', label: 'BMC civic budget FY25 · T1' },
      { value: '92%', label: 'source coverage' },
      { value: '1', label: 'audit flag — CAG para', tone: 'warn' },
    ],
    events: [
      { year: '2025', text: 'BMC budget tabled at ₹74,427 cr — the largest municipal budget in India.', tier: 'T1', src: 'MCGM' },
      { year: '2024', text: 'CAG para on infrastructure spend flagged for review.', tier: 'T2', src: 'CAG' },
      { year: '—', text: 'Ward-level disbursal breakdown not yet in a public PDF.', tier: 'gap' },
    ],
    chain: ['State (UDD)', '*Municipal Commissioner', '24 Ward Officers'],
    provenance: [
      { label: 'Source coverage', value: '92%', tone: 'good' },
      { label: 'Tier-1 figures', value: '21' },
      { label: 'Declared gaps', value: '4', tone: 'gold' },
      { label: 'Awaiting upgrade ⚠', value: '2' },
    ],
  },
  munger: {
    slug: 'munger',
    name: 'Munger',
    state: 'Bihar',
    model: 'industrial heritage district',
    dek: 'Three regimes in one district — the gun trade, the railway workshop, and the first cigarette factory in Asia.',
    stats: [
      { value: '1762', label: 'Nawabi gun trade begins · T3' },
      { value: '1862', label: 'Jamalpur railway workshop · T2' },
      { value: '—', label: 'plant-level ₹ · explicit gap', tone: 'muted' },
    ],
    events: [
      { year: '1762', text: 'Mir Qasim moves his capital and arsenal to Munger — the gunsmith tradition that still defines the district.', tier: 'T3' },
      { year: '1862', text: 'Asia’s first full-scale railway workshop opens at Jamalpur.', tier: 'T2' },
      { year: '1907', text: 'Imperial Tobacco (later ITC) opens Asia’s first cigarette factory.', tier: 'T1', src: 'gazette' },
      { year: '1947–91', text: 'Rail workshop nationalised; private mills thin out — employment shifts to the state.', tier: 'gap' },
    ],
    chain: ['Union (Railways / MoRD)', 'State (Industries Dept)', '*DM, Munger'],
    provenance: [
      { label: 'Source coverage', value: '64%', tone: 'good' },
      { label: 'Tier-1 figures', value: '9' },
      { label: 'Declared gaps', value: '8', tone: 'gold' },
      { label: 'Awaiting upgrade ⚠', value: '4' },
    ],
  },
  ernakulam: {
    slug: 'ernakulam',
    name: 'Ernakulam',
    state: 'Kerala',
    model: 'coastal metro (Kochi)',
    dek: 'Kochi’s civic ledger on a CRZ coast — ₹225 cr of municipal budget against chronic flood exposure.',
    stats: [
      { value: '₹225 cr', label: 'Kochi Municipal Corp budget · T2' },
      { value: '84%', label: 'source coverage' },
      { value: 'CRZ', label: 'coastal regulation zone · flood-chronic', tone: 'warn' },
    ],
    events: [
      { year: '2024', text: 'Kochi Municipal Corporation civic budget reported at ₹225 cr.', tier: 'T2', src: 'cityfinance.in' },
      { year: '—', text: 'Ward-level CRZ compliance mapping not yet in a public dataset.', tier: 'gap' },
    ],
    chain: ['State (LSGD)', '*Municipal Secretary, Kochi', 'Ward councillors'],
    provenance: [
      { label: 'Source coverage', value: '84%', tone: 'good' },
      { label: 'Tier-1 figures', value: '11' },
      { label: 'Declared gaps', value: '5', tone: 'gold' },
      { label: 'Awaiting upgrade ⚠', value: '3' },
    ],
  },
}

export const DISTRICT_SLUGS = Object.keys(DISTRICTS)
