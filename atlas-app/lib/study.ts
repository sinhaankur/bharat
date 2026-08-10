// Study/edict pages (mockup 4b, Gupta register). Ashoka is the built template; the
// others in the study front carry the same shape. Each covers a cluster of legacy
// pages restyled into the study shell.
export type Study = {
  slug: string
  section: string
  source: string
  ruler?: string
  title: string
  titleEm: string
  lead: string
  stats: { v: string; l: string }[]
  mapNote: string
  legend?: { label: string; color: string }[]
  callout?: { tag: string; figures: { v: string; l: string }[]; quote: string }
}

export const STUDIES: Record<string, Study> = {
  ashoka: {
    slug: 'ashoka',
    section: 'Study / History',
    source: 'SOURCED · HULTZSCH 1925',
    ruler: 'Devanampiya Piyadasi · r. 268–232 BCE',
    title: "Ashoka's rule of the",
    titleEm: 'land',
    lead: 'How far did Mauryan power reach, and what did it stand for? We can answer both from Ashoka’s own edicts — carved across the empire and unreadable for two millennia until Brahmi was deciphered in 1837. Each edict is a fixed point where his authority could cut stone, so the map of find-spots is the footprint of the empire; the texts state its ethics.',
    stats: [
      { v: '33', l: 'edict find-spots' },
      { v: '~2,700 km', l: 'Kandahar → Karnataka' },
      { v: '4', l: 'scripts across the realm' },
      { v: '5', l: 'modern countries' },
    ],
    mapNote: 'Leaflet — edict find-spots · reach hull · script toggles',
    legend: [
      { label: 'Brahmi', color: '#3078c0' },
      { label: 'Kharoshthi', color: '#a8794a' },
      { label: 'Greek', color: '#4f6b45' },
      { label: 'Aramaic', color: '#9e3b2e' },
    ],
    callout: {
      tag: 'ROCK EDICT 13 · c. 261 BCE — THE TURN AT KALINGA',
      figures: [
        { v: '150,000', l: 'deported' },
        { v: '100,000', l: 'slain' },
        { v: 'many ×', l: 'who died after' },
      ],
      quote: 'A victorious emperor publishing his own regret, and a change of policy, in stone — the reason the corpus reads as more than boast.',
    },
  },
  languages: {
    slug: 'languages',
    section: 'Study / Languages',
    source: 'SOURCED · CENSUS + GRIERSON',
    title: 'Every language & script of',
    titleEm: 'Bharat',
    lead: 'Two family trees — Indo-Aryan and Dravidian — grow from one Brahmi root. This is the deep culture layer: the families, the scripts, the fonts, the sacred texts, and a scroll-through journey of a single word across the country.',
    stats: [
      { v: '19', l: 'languages' },
      { v: '24', l: 'scripts' },
      { v: '1', l: 'Brahmi root' },
      { v: '2', l: 'family trees' },
    ],
    mapNote: 'Interactive lineage trees — Brahmi → Devanagari / Tamil / Bengali …',
    legend: [
      { label: 'Indo-Aryan', color: '#3078c0' },
      { label: 'Dravidian', color: '#9e3b2e' },
      { label: 'Brahmi root', color: '#a8794a' },
    ],
  },
  vedas: {
    slug: 'vedas',
    section: 'Study / Texts',
    source: 'SOURCED · PUBLIC DOMAIN',
    title: 'The Hymn of',
    titleEm: 'Creation',
    lead: 'The Nāsadīya Sūkta — the Rigveda’s hymn of creation — read across languages and scripts, with its uncertainty preserved rather than smoothed over. A text that ends in a question.',
    stats: [
      { v: '4', l: 'Vedas' },
      { v: '10', l: 'mandalas (Rigveda)' },
      { v: 'c.1500 BCE', l: 'oral composition' },
      { v: '1', l: 'hymn, many readings' },
    ],
    mapNote: 'The hymn, verse by verse, across scripts',
  },
}

export const STUDY_SLUGS = Object.keys(STUDIES)
