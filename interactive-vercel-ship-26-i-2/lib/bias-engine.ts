// Bias Engine — maps a news source to a media-lean, Ground-News style.
// A maintained registry of Indian outlets, each placed left … center … right,
// with a factual-reporting note. This is an ASSESSMENT, not a fact — we label it
// as such and cite the approach. Sources not in the registry are "unrated"
// (an honest gap), never guessed.

export type Lean = 'left' | 'center-left' | 'center' | 'center-right' | 'right' | 'unrated'

export const LEAN_ORDER: Lean[] = ['left', 'center-left', 'center', 'center-right', 'right']

export const LEAN_LABEL: Record<Lean, string> = {
  left: 'Left',
  'center-left': 'Center-Left',
  center: 'Center',
  'center-right': 'Center-Right',
  right: 'Right',
  unrated: 'Unrated',
}

// position 0..100 (0=left, 50=center, 100=right) — for the bias bar
export const LEAN_POS: Record<Lean, number> = {
  left: 8,
  'center-left': 30,
  center: 50,
  'center-right': 70,
  right: 92,
  unrated: 50,
}

// ownership: is the outlet state/government-run, public-funded, or private?
export type Ownership = 'state' | 'public' | 'private' | 'unknown'
export const OWNERSHIP_LABEL: Record<Ownership, string> = {
  state: 'State / govt-run',
  public: 'Public broadcaster',
  private: 'Private',
  unknown: 'Ownership unknown',
}

type Rating = { lean: Lean; factual: 'low' | 'mixed' | 'high'; ownership?: Ownership; note?: string }

// Registry keyed by a normalized source name / domain fragment.
// Placements are directional summaries drawn from public media-bias assessments;
// they describe editorial lean, not the truth of any single story.
const REGISTRY: Record<string, Rating> = {
  'the hindu': { lean: 'center-left', factual: 'high', ownership: 'private' },
  'the indian express': { lean: 'center', factual: 'high', ownership: 'private' },
  'indian express': { lean: 'center', factual: 'high', ownership: 'private' },
  'times of india': { lean: 'center', factual: 'mixed', ownership: 'private' },
  'hindustan times': { lean: 'center', factual: 'high', ownership: 'private' },
  ndtv: { lean: 'center-left', factual: 'high', ownership: 'private' },
  'the wire': { lean: 'left', factual: 'mixed', ownership: 'private' },
  scroll: { lean: 'left', factual: 'high', ownership: 'private' },
  'the print': { lean: 'center', factual: 'high', ownership: 'private' },
  theprint: { lean: 'center', factual: 'high', ownership: 'private' },
  'india today': { lean: 'center', factual: 'mixed', ownership: 'private' },
  'republic': { lean: 'right', factual: 'low', ownership: 'private' },
  'republic world': { lean: 'right', factual: 'low', ownership: 'private' },
  'opindia': { lean: 'right', factual: 'low', ownership: 'private' },
  'firstpost': { lean: 'center-right', factual: 'mixed', ownership: 'private' },
  'news18': { lean: 'center-right', factual: 'mixed', ownership: 'private' },
  'zee news': { lean: 'right', factual: 'low', ownership: 'private' },
  'the economic times': { lean: 'center', factual: 'high', ownership: 'private' },
  'economic times': { lean: 'center', factual: 'high', ownership: 'private' },
  'livemint': { lean: 'center', factual: 'high', ownership: 'private' },
  mint: { lean: 'center', factual: 'high', ownership: 'private' },
  'business standard': { lean: 'center', factual: 'high', ownership: 'private' },
  'deccan herald': { lean: 'center', factual: 'high', ownership: 'private' },
  'the telegraph': { lean: 'center-left', factual: 'high', ownership: 'private' },
  // state / government-run
  'dd news': { lean: 'center', factual: 'mixed', ownership: 'state' },
  doordarshan: { lean: 'center', factual: 'mixed', ownership: 'state' },
  pib: { lean: 'center', factual: 'mixed', ownership: 'state' },
  'press information bureau': { lean: 'center', factual: 'mixed', ownership: 'state' },
  'all india radio': { lean: 'center', factual: 'mixed', ownership: 'state' },
  newsonair: { lean: 'center', factual: 'mixed', ownership: 'state' }, // All India Radio news
  'department of science': { lean: 'center', factual: 'high', ownership: 'state' },
  dst: { lean: 'center', factual: 'high', ownership: 'state' },
  // think-tanks / specialist (private, but flag factual quality)
  orfonline: { lean: 'center-right', factual: 'high', ownership: 'private' },
  'observer research': { lean: 'center-right', factual: 'high', ownership: 'private' },
  lawbeat: { lean: 'center', factual: 'high', ownership: 'private' },
  'bar and bench': { lean: 'center', factual: 'high', ownership: 'private' },
  livelaw: { lean: 'center', factual: 'high', ownership: 'private' },
  cricinfo: { lean: 'center', factual: 'high', ownership: 'private' },
  espncricinfo: { lean: 'center', factual: 'high', ownership: 'private' },
  'india.com': { lean: 'center-right', factual: 'mixed', ownership: 'private' },
  // public broadcasters (public-funded, editorially independent)
  'bbc': { lean: 'center', factual: 'high', ownership: 'public' },
  'bbc news': { lean: 'center', factual: 'high', ownership: 'public' },
  dw: { lean: 'center', factual: 'high', ownership: 'public' },
  'deutsche welle': { lean: 'center', factual: 'high', ownership: 'public' },
  'al jazeera': { lean: 'center-left', factual: 'high', ownership: 'state' }, // Qatar-funded
  // wire services (private, cooperative)
  'reuters': { lean: 'center', factual: 'high', ownership: 'private' },
  'associated press': { lean: 'center', factual: 'high', ownership: 'private' },
  'ap news': { lean: 'center', factual: 'high', ownership: 'private' },
}

function normalize(s: string): string {
  return (s || '').toLowerCase().replace(/^www\.|\.(com|in|org|net)$/g, '').trim()
}

export type BiasResult = {
  lean: Lean
  label: string
  position: number
  factual: 'low' | 'mixed' | 'high' | 'unknown'
  ownership: Ownership
  ownershipLabel: string
  rated: boolean
}

/** The Bias Engine: assess one source. */
export function assessBias(source: string): BiasResult {
  const key = normalize(source)
  // exact, then substring match against registry keys
  const hit =
    REGISTRY[key] ||
    Object.entries(REGISTRY).find(([k]) => key.includes(k) || k.includes(key))?.[1]
  if (!hit) {
    return {
      lean: 'unrated',
      label: LEAN_LABEL.unrated,
      position: 50,
      factual: 'unknown',
      ownership: 'unknown',
      ownershipLabel: OWNERSHIP_LABEL.unknown,
      rated: false,
    }
  }
  const ownership = hit.ownership || 'unknown'
  return {
    lean: hit.lean,
    label: LEAN_LABEL[hit.lean],
    position: LEAN_POS[hit.lean],
    factual: hit.factual,
    ownership,
    ownershipLabel: OWNERSHIP_LABEL[ownership],
    rated: true,
  }
}

/** Aggregate the lean spread of a set of sources (for a cluster / the whole feed). */
export function biasSpread(sources: string[]) {
  const counts: Record<Lean, number> = {
    left: 0,
    'center-left': 0,
    center: 0,
    'center-right': 0,
    right: 0,
    unrated: 0,
  }
  for (const s of sources) counts[assessBias(s).lean]++
  const rated = sources.length - counts.unrated
  const leftish = counts.left + counts['center-left']
  const rightish = counts.right + counts['center-right']
  // a "blindspot" = coverage concentrated on one side
  let blindspot: 'left' | 'right' | null = null
  if (rated >= 3) {
    if (leftish === 0 && rightish > 0) blindspot = 'left' // the left isn't covering it
    else if (rightish === 0 && leftish > 0) blindspot = 'right'
  }
  return { counts, rated, leftish, rightish, blindspot }
}

export const BIAS_METHOD =
  'Media-lean is an editorial ASSESSMENT of an outlet, not a judgement of any single story, and is contested. Ratings summarise public media-bias evaluations; sources we have not rated are shown as “unrated”, never guessed.'
