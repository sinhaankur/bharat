// Lawyer Engine — the legal-safety layer.
// Every name or claim about a person/entity passes through this before display.
// Its whole job: keep the project truthful and defensible. It NEVER asserts guilt;
// it attributes to a source, uses the correct legal status word, and appends the
// right qualifier ("allegedly", "accused", "named in coverage", "no finding of
// guilt"). This is a presentation/wording safeguard, not legal advice.
//
// Principles baked in:
//  • Presumption of innocence — accused ≠ guilty; a charge ≠ a conviction.
//  • Attribution over assertion — we report that a SOURCE said X, not that X is true.
//  • Only what's on the public record — no inference of wrongdoing.
//  • A name appears ONLY as reported, always linked to the reporting source.

export type LegalStatus =
  | 'named' // merely mentioned in coverage — lowest, most cautious
  | 'alleged' // an allegation has been made
  | 'accused' // formally accused / named in a complaint
  | 'under-investigation' // a probe/inquiry is ongoing
  | 'charged' // formally charged / chargesheet filed
  | 'on-trial' // matter is before a court
  | 'convicted' // court has convicted (a finding of fact)
  | 'acquitted' // court has cleared
  | 'unknown'

// The exact qualifier phrase to attach for each status (India-appropriate).
export const STATUS_QUALIFIER: Record<LegalStatus, string> = {
  named: 'named in media coverage; no allegation of wrongdoing implied',
  alleged: 'allegedly, per reporting — an allegation, not a finding',
  accused: 'accused (as reported); an accusation is not proof of guilt',
  'under-investigation': 'reportedly under investigation; an inquiry implies no guilt',
  charged: 'reportedly charged; a charge is an accusation, not a conviction',
  'on-trial': 'the matter is reportedly before a court; sub judice — outcome pending',
  convicted: 'reported as convicted by a court of law',
  acquitted: 'reported as acquitted / cleared by a court',
  unknown: 'status unclear from the reporting',
}

export const STATUS_LABEL: Record<LegalStatus, string> = {
  named: 'Named in coverage',
  alleged: 'Alleged',
  accused: 'Accused',
  'under-investigation': 'Under investigation',
  charged: 'Charged',
  'on-trial': 'On trial (sub judice)',
  convicted: 'Convicted',
  acquitted: 'Acquitted',
  unknown: 'Status unknown',
}

// Words in coverage that map to a legal status. We DOWN-rank aggressively: unless a
// conviction is explicitly reported, we never go above "accused/charged".
const STATUS_SIGNALS: [RegExp, LegalStatus][] = [
  [/\bacquitted|cleared by (the )?court|discharged\b/i, 'acquitted'],
  [/\bconvicted|found guilty|sentenced to|guilty verdict\b/i, 'convicted'],
  [/\bon trial|before the court|hearing in|sub judice|trial (began|begins)\b/i, 'on-trial'],
  [/\bcharge-?sheet|charged with|framed charges|chargesheeted\b/i, 'charged'],
  [/\bunder (probe|investigation)|being investigated|raided by|summoned by|ED probe|CBI probe\b/i, 'under-investigation'],
  [/\baccused|booked (under|for)|named in (the )?(fir|complaint|chargesheet)|arrested\b/i, 'accused'],
  [/\balleged(ly)?|allegation|claims that|accus(es|ed of)\b/i, 'alleged'],
]

export function inferStatus(text: string): LegalStatus {
  const t = text || ''
  for (const [re, status] of STATUS_SIGNALS) if (re.test(t)) return status
  // if the text is about corruption but no explicit status word, stay at the most cautious rung
  return 'named'
}

// A person as safely presentable: name + status + attribution, never an assertion.
export type SafePerson = {
  name: string
  role?: string // e.g. "politician", "official", "department"
  status: LegalStatus
  statusLabel: string
  qualifier: string
  attribution: string // "as reported by <source>"
  sourceUrl?: string
}

export function makeSafePerson(opts: {
  name: string
  role?: string
  text: string
  source: string
  sourceUrl?: string
  status?: LegalStatus
}): SafePerson {
  const status = opts.status || inferStatus(opts.text)
  return {
    name: opts.name,
    role: opts.role,
    status,
    statusLabel: STATUS_LABEL[status],
    qualifier: STATUS_QUALIFIER[status],
    attribution: `as reported by ${opts.source}`,
    sourceUrl: opts.sourceUrl,
  }
}

// Render a single safe, defensible sentence for a person.
export function safeSentence(p: SafePerson): string {
  const role = p.role ? ` (${p.role})` : ''
  return `${p.name}${role} — ${p.statusLabel}: ${p.qualifier}, ${p.attribution}.`
}

// The standing disclaimer to show wherever names/allegations appear.
export const LEGAL_DISCLAIMER =
  'All names appear only as reported by the cited source and are presented under the presumption of innocence. An allegation, accusation, FIR, or charge is NOT a finding of guilt; only a court can determine that. Matters before a court are sub judice. This is an aggregation of public reporting, attributed to its source — not an assertion of fact by this project, and not legal advice. If anything here is inaccurate, we will correct or remove it on request.'

// The "long-case" insight (user: cases dragged out so both sides bill on it):
// a factual, non-accusatory framing of case DURATION as a systemic signal.
export function caseDurationNote(years: number | null): string {
  if (years == null) return 'Case duration unknown.'
  if (years >= 10)
    return `This matter has reportedly run ${years}+ years. India’s courts carry a large pendency backlog; long timelines are common and can raise costs for all parties. (A systemic observation, not an allegation against anyone.)`
  if (years >= 3)
    return `Reportedly ongoing ~${years} years — not unusual in Indian civil/land litigation.`
  return `Reportedly ~${years} year(s) old.`
}

export const LAWYER_ENGINE_METHOD =
  'The Lawyer Engine is a wording safeguard: it fixes legal status language (allegedly/accused/charged/convicted), always attributes to a source, and never asserts guilt. It is not legal advice.'
