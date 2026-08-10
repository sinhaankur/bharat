// Heritage sites — a curated, fully-sourced subset drawn from the atlas's
// heritage-sites.json (137 sites; ASI / UNESCO / named chronicle sources). Each site
// carries its builder, lifespan, status, and — where it applies — a single-record
// destruction account with the actor named and the source cited. Multi-actor, not
// one-sided; "Sanatan Dharma" not "Hindu".
// A measured dimension for the specimen "survey plate". Either a real sourced value
// (with its own tier) or an explicit gap — never an invented figure.
export type Dim = { label: string; value: string; gap?: boolean }

export type Site = {
  slug: string
  name: string
  tradition: 'sanatan' | 'buddhist' | 'jain' | 'other'
  deity: string
  region: string
  state: string
  builder: string
  from: number
  to: number
  status: string
  note: string
  destroy?: { year: number; actor: string; account: string }
  source: { label: string; tier: 1 | 2 | 3 | 4 }
  // measured-survey figures for the specimen plate — real, or a declared gap
  dims?: Dim[]
  form?: string  // architectural form (e.g. "Nagara shikhara", "rock-cut monolith")
}

export const SITES: Record<string, Site> = {
  'martand-sun-temple': {
    slug: 'martand-sun-temple', name: 'Martand Sun Temple', tradition: 'sanatan', deity: 'Surya (Sun)',
    region: 'Kashmir', state: 'Jammu & Kashmir', builder: 'Lalitaditya Muktapida, Karkota dynasty',
    from: 725, to: 756, status: 'ruin',
    note: 'Built ~8th c. CE at the height of Karkota Kashmir; a masterwork blending Gandharan, Gupta and Graeco-Roman forms. Today a protected ruin of 84 fluted columns on a plateau above the Kashmir Valley.',
    destroy: { year: 1400, actor: "Sultan Sikandar Shah Miri ('Butshikan')", account: "Kashmiri chronicles (Jonaraja's continuation of the Rajatarangini) record Sikandar's campaign to demolish Kashmir's temples; Martand's demolition reportedly took a year given the massive masonry." },
    source: { label: 'ASI-protected monument; Jonaraja, Rajatarangini (continuation); J&K restoration report 2024', tier: 2 },
    form: 'Colonnaded peristyle · Kashmiri style',
    dims: [
      { label: 'Peristyle columns', value: '84 fluted' },
      { label: 'Courtyard', value: '~220 × 142 ft' },
      { label: 'Central shrine height', value: '—', gap: true },
    ],
  },
  'somnath-temple': {
    slug: 'somnath-temple', name: 'Somnath Temple', tradition: 'sanatan', deity: 'Shiva (Jyotirlinga)',
    region: 'West India', state: 'Gujarat', builder: 'Maitraka / Solanki (Chaulukya) kings; present temple 1951 (Govt. of India / Sardar Patel).',
    from: 800, to: 1951, status: 'reconstructed',
    note: 'One of the twelve Jyotirlingas. Repeatedly built, plundered and rebuilt over a millennium; the modern temple was completed in 1951 as an act of national reconstruction.',
    destroy: { year: 1026, actor: 'Mahmud of Ghazni', account: 'Sacked and looted the temple; contemporary and later Persian chronicles claim tens of thousands killed defending it and the idol broken.' },
    source: { label: "ASI — Somnath; Richard M. Eaton, 'Temple Desecration and Indo-Muslim States' (2000)", tier: 2 },
  },
  'kashi-vishwanath': {
    slug: 'kashi-vishwanath', name: 'Kashi Vishwanath (original / Gyanvapi)', tradition: 'sanatan', deity: 'Shiva (Jyotirlinga)',
    region: 'North India', state: 'Uttar Pradesh', builder: 'Rebuilt under Raja Man Singh & Todar Mal (16th c.); present temple by Ahilyabai Holkar (1780).',
    from: 1585, to: 1780, status: 'reconstructed',
    note: "Varanasi's principal Shiva shrine. The 16th-c. temple was demolished in 1669 under Aurangzeb and the Gyanvapi mosque raised on the site; the present temple was built adjacent by Ahilyabai Holkar in 1780.",
    destroy: { year: 1669, actor: 'Aurangzeb', account: 'The Maasir-i-Alamgiri (official court history) records the 1669 order to demolish the temple. The Gyanvapi mosque stands on the site.' },
    source: { label: 'Maasir-i-Alamgiri; Richard M. Eaton temple-desecration list', tier: 2 },
  },
  'nalanda-mahavihara': {
    slug: 'nalanda-mahavihara', name: 'Nalanda Mahavihara', tradition: 'buddhist', deity: 'Buddhist monastic university',
    region: 'East India', state: 'Bihar', builder: 'Gupta emperor Kumaragupta I; expanded by Harsha and the Pala kings',
    from: 427, to: 1200, status: 'ruin',
    note: 'The great Buddhist university, active for ~700 years and drawing scholars from across Asia. Sacked c. 1193; a UNESCO World Heritage ruin today, with a modern revival university nearby.',
    destroy: { year: 1193, actor: 'Bakhtiyar Khilji', account: 'The Persian chronicle Tabaqat-i-Nasiri records the sack of the monastic complex; tradition holds the library burned for months. Modern scholars debate the exact site named.' },
    source: { label: 'ASI; UNESCO World Heritage; Minhaj-i-Siraj, Tabaqat-i-Nasiri', tier: 1 },
  },
  'vitthala-temple-hampi': {
    slug: 'vitthala-temple-hampi', name: 'Vitthala Temple, Hampi (Vijayanagara)', tradition: 'sanatan', deity: 'Vishnu (Vitthala)',
    region: 'Deccan', state: 'Karnataka', builder: 'Vijayanagara Empire (Devaraya II onward; peak under Krishnadevaraya)',
    from: 1422, to: 1565, status: 'partially ruined',
    note: 'Centrepiece of the Vijayanagara capital, famed for its stone chariot and musical pillars. The city was sacked in 1565 after the Battle of Talikota; a UNESCO World Heritage ruin today.',
    destroy: { year: 1565, actor: 'Deccan Sultanate confederacy', account: 'After defeating Vijayanagara at Talikota, the victorious armies looted and burned the capital over months — one of the largest such destructions of a medieval Indian city.' },
    source: { label: 'ASI; UNESCO — Group of Monuments at Hampi', tier: 1 },
  },
  'konark-sun-temple': {
    slug: 'konark-sun-temple', name: 'Konark Sun Temple', tradition: 'sanatan', deity: 'Surya (Sun)',
    region: 'East India', state: 'Odisha', builder: 'Narasimhadeva I, Eastern Ganga dynasty',
    from: 1238, to: 1250, status: 'partially ruined',
    note: 'The Sun temple built as a colossal stone chariot. Partly collapsed / decayed over centuries (causes debated — structural, and possibly deliberate damage in the 16th–17th c.); the main tower is lost, the Jagamohana survives. A UNESCO World Heritage site.',
    source: { label: 'ASI; UNESCO — Sun Temple, Konârak', tier: 1 },
    form: 'Ratha (chariot) · Kalinga / Nagara',
    dims: [
      { label: 'Chariot wheels', value: '24 carved' },
      { label: 'Wheel diameter', value: '~9 ft 9 in' },
      { label: 'Horses', value: '7' },
      { label: 'Main tower (lost)', value: '~229 ft (per tradition)', gap: true },
    ],
  },

  'ranakpur-jain-temple': {
    slug: 'ranakpur-jain-temple', name: 'Ranakpur Jain Temple', tradition: 'jain', deity: 'Adinatha (Chaturmukha)',
    region: 'West India', state: 'Rajasthan', builder: 'Dharna Shah, under Rana Kumbha of Mewar',
    from: 1437, to: 1458, status: 'active',
    note: 'The Chaturmukha (four-faced) Dharana Vihara — a marble Jain temple famous for its forest of individually-carved pillars, no two alike, and its light-filled halls. Continuously in worship.',
    source: { label: 'ASI; Anekant Rupam / Jain trust survey; UNESCO tentative list', tier: 2 },
    form: 'Chaturmukha · Māru-Gurjara marble',
    dims: [
      { label: 'Carved pillars', value: '1,444 (no two alike)' },
      { label: 'Halls / domes', value: '29 halls, 80 domes' },
      { label: 'Devakulikas (shrines)', value: '~84' },
      { label: 'Platform', value: '~48,000 sq ft' },
    ],
  },
  'kailasa-ellora': {
    slug: 'kailasa-ellora', name: 'Kailasa Temple, Ellora (Cave 16)', tradition: 'sanatan', deity: 'Shiva (Kailasa)',
    region: 'Deccan', state: 'Maharashtra', builder: 'Rashtrakuta king Krishna I',
    from: 757, to: 783, status: 'active',
    note: 'The largest rock-cut monolithic temple in the world — carved top-down from a single basalt cliff, removing an estimated 200,000+ tonnes of rock. A UNESCO World Heritage cave.',
    source: { label: 'ASI; UNESCO — Ellora Caves', tier: 1 },
    form: 'Rock-cut monolith · Dravida',
    dims: [
      { label: 'Vertical relief', value: '~100 ft' },
      { label: 'Footprint', value: '~276 × 154 ft' },
      { label: 'Rock removed', value: '~200,000 tonnes (est.)' },
      { label: 'Carve time', value: '—', gap: true },
    ],
  },
  'brihadishvara-thanjavur': {
    slug: 'brihadishvara-thanjavur', name: 'Brihadishvara Temple, Thanjavur', tradition: 'sanatan', deity: 'Shiva (Rajarajeshvaram)',
    region: 'South India', state: 'Tamil Nadu', builder: 'Rajaraja Chola I',
    from: 1003, to: 1010, status: 'active',
    note: 'The great Chola temple, its granite vimana among the tallest of its age, crowned by a single ~80-tonne capstone. A UNESCO “Great Living Chola Temple,” still in worship after a millennium.',
    source: { label: 'ASI; UNESCO — Great Living Chola Temples', tier: 1 },
    form: 'Dravida vimana · Chola granite',
    dims: [
      { label: 'Vimana height', value: '~216 ft (66 m)' },
      { label: 'Capstone (shikhara)', value: '~80 tonnes' },
      { label: 'Built in', value: '~7 years' },
    ],
  },
}

export const SITE_SLUGS = Object.keys(SITES)

export const TRADITION_LABEL: Record<Site['tradition'], string> = {
  sanatan: 'Sanatan Dharma', buddhist: 'Buddhist', jain: 'Jain', other: 'Other',
}
