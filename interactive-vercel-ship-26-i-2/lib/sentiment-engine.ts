// Sentiment Engine — scores a headline's tone (negative … neutral … positive),
// lexicon-based so it needs NO API and runs anywhere. A transparent, auditable
// heuristic: it counts polarity words, handles simple negation and intensifiers.
// It reads TONE, not truth — a grim fact and a spun frame can score alike, so we
// label it as tone only.

const POS = new Set([
  'win','wins','won','gain','gains','boost','boosts','surge','surges','growth','grow','grows',
  'record','high','rise','rises','rising','improve','improves','improved','success','successful',
  'breakthrough','deal','agreement','peace','support','supports','rescue','relief','recover','recovery',
  'praise','praised','approve','approved','strong','strengthen','hope','progress','launch','launches',
  'invest','investment','partnership','historic','milestone','triumph','celebrate','celebrated','safe','secures','secure',
])
const NEG = new Set([
  'kill','killed','kills','dead','death','deaths','die','dies','died','attack','attacks','attacked',
  'blast','bomb','crisis','conflict','war','clash','clashes','violence','violent','riot','riots',
  'crash','crashes','collapse','collapses','plunge','plunges','fall','falls','falling','loss','losses',
  'fear','fears','threat','threats','warn','warns','warning','ban','banned','scam','fraud','corruption',
  'protest','protests','strike','strikes','arrest','arrested','probe','raid','raids','flood','floods','drought',
  'quake','disaster','toll','slump','recession','inflation','shortage','fail','fails','failure','crackdown',
  'illegal','encroachment','dispute','tension','tensions','row','outrage','condemn','condemned','deadly','crime',
])
const NEGATORS = new Set(['no','not','never','without','nor','n’t', "n't", 'anti', 'un'])
const INTENSIFIERS = new Set(['very','massive','huge','major','sharp','severe','deep','record','extreme'])

export type SentimentLabel = 'negative' | 'neutral' | 'positive'

export type SentimentResult = {
  score: number // -1 … +1
  label: SentimentLabel
  magnitude: number // 0 … 1 (how strong / opinionated the wording is)
  hits: { word: string; polarity: 1 | -1 }[]
}

function tokenize(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9’'\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

/** The Sentiment Engine: score one piece of text. */
export function analyzeSentiment(text: string): SentimentResult {
  const toks = tokenize(text)
  let sum = 0
  let weightSum = 0
  const hits: { word: string; polarity: 1 | -1 }[] = []
  for (let i = 0; i < toks.length; i++) {
    const w = toks[i]
    let pol: 1 | -1 | 0 = POS.has(w) ? 1 : NEG.has(w) ? -1 : 0
    if (pol === 0) continue
    // look back up to 2 tokens for a negator / intensifier
    let mult = 1
    for (let j = Math.max(0, i - 2); j < i; j++) {
      if (NEGATORS.has(toks[j])) mult *= -1
      if (INTENSIFIERS.has(toks[j])) mult *= 1.5
    }
    const val = pol * mult
    sum += val
    weightSum += Math.abs(val)
    hits.push({ word: w, polarity: (val >= 0 ? 1 : -1) as 1 | -1 })
  }
  const n = Math.max(1, toks.length)
  // normalise: score in -1..1, magnitude 0..1
  const score = weightSum === 0 ? 0 : Math.max(-1, Math.min(1, sum / Math.max(1, weightSum)))
  const magnitude = Math.min(1, weightSum / Math.min(n, 8))
  const label: SentimentLabel = score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral'
  return { score, label, magnitude, hits }
}

export const SENTIMENT_LABEL: Record<SentimentLabel, string> = {
  negative: 'Negative',
  neutral: 'Neutral',
  positive: 'Positive',
}
export const SENTIMENT_COLOR: Record<SentimentLabel, string> = {
  negative: 'oklch(0.58 0.16 25)', // red
  neutral: 'oklch(0.6 0.02 80)', // grey
  positive: 'oklch(0.6 0.14 150)', // green
}

export const SENTIMENT_METHOD =
  'Sentiment is a transparent lexicon heuristic on the headline text (polarity words + simple negation/intensifiers). It reads TONE, not truth: a grim fact and a spun frame can score alike. Shown to reveal the emotional colour of coverage, not to rate accuracy.'
