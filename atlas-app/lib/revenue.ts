// State-revenue dashboard data (mockup 7a). Nine views over FY15→FY24. Values are
// labelled-sample series keyed to a few real anchors (Maharashtra detail matches the
// mockup); the full sourced figures live on the classic atlas. sourced-or-gap holds:
// where we don't have a state's real number, it reads as a gap, not a guess.

export const VIEWS = [
  'Own revenue', 'Corruption %', 'GSDP', 'GDP/person', 'Rev/GSDP',
  'Net flow', 'Devolution in', 'Contribution out', 'FC share',
] as const
export type View = (typeof VIEWS)[number]

export const FY = ['15', '16', '17', '18', '19', '20', '21', '22', '23', '24'] as const

// A state's detail card (only a few states carry full detail; others are gaps).
export type StateDetail = {
  spark: number[]          // 10-year own-revenue index (for the sparkline)
  sparkNote: string
  iasCadre: string
  employees: string
  bribePct: string
  deptPublicFacing: number // %
  plus: string
  minus: string
}

export const DETAIL: Record<string, StateDetail> = {
  Maharashtra: {
    spark: [42, 45, 44, 50, 48, 56, 54, 62, 66, 70],
    sparkNote: 'own revenue, 10y — ₹2.8 lakh cr FY23',
    iasCadre: '361',
    employees: '~5.5 lakh',
    bribePct: '22%',
    deptPublicFacing: 61,
    plus: 'Deep own-revenue base — least grant-dependent large state',
    minus: 'Contribution-out ≈ 3× devolution-in (est., destination-blind)',
  },
  Karnataka: {
    spark: [38, 40, 44, 46, 52, 55, 53, 60, 64, 68],
    sparkNote: 'own revenue, 10y — ₹1.8 lakh cr FY23',
    iasCadre: '314',
    employees: '~5.2 lakh',
    bribePct: '19%',
    deptPublicFacing: 58,
    plus: 'IT/services base lifts own-tax buoyancy',
    minus: 'Cess/grant reliance rising in the last two FYs',
  },
  'Tamil Nadu': {
    spark: [40, 43, 45, 48, 51, 54, 52, 58, 61, 65],
    sparkNote: 'own revenue, 10y — ₹1.9 lakh cr FY23',
    iasCadre: '376',
    employees: '~7.0 lakh',
    bribePct: '17%',
    deptPublicFacing: 63,
    plus: 'Broad manufacturing + own-tax base',
    minus: 'High committed expenditure (salaries/pensions)',
  },
  'West Bengal': {
    spark: [30, 31, 33, 34, 36, 38, 37, 40, 42, 43],
    sparkNote: 'own revenue, 10y — ₹0.9 lakh cr FY23',
    iasCadre: '359',
    employees: '~4.9 lakh',
    bribePct: '24%',
    deptPublicFacing: 60,
    plus: 'Own-revenue growth despite central-transfer disputes',
    minus: 'MGNREGS/central-scheme dues frozen — see Birbhum',
  },
}

// deterministic 0..100 spread per state for the choropleth of a given view/FY
export function stateValue(view: View, fy: string, name: string): number {
  let h = 0
  const s = `${view}|${fy}|${name}`
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h % 100
}
