// Heritage sites — a curated, fully-sourced subset drawn from the atlas's
// heritage-sites.json (137 sites; ASI / UNESCO / named chronicle sources). Each site
// carries its builder, lifespan, status, and — where it applies — a single-record
// destruction account with the actor named and the source cited. Multi-actor, not
// one-sided; "Sanatan Dharma" not "Hindu".
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
}

export const SITES: Record<string, Site> = {
  'martand-sun-temple': {
    slug: 'martand-sun-temple', name: 'Martand Sun Temple', tradition: 'sanatan', deity: 'Surya (Sun)',
    region: 'Kashmir', state: 'Jammu & Kashmir', builder: 'Lalitaditya Muktapida, Karkota dynasty',
    from: 725, to: 756, status: 'ruin',
    note: 'Built ~8th c. CE at the height of Karkota Kashmir; a masterwork blending Gandharan, Gupta and Graeco-Roman forms. Today a protected ruin of 84 fluted columns on a plateau above the Kashmir Valley.',
    destroy: { year: 1400, actor: "Sultan Sikandar Shah Miri ('Butshikan')", account: "Kashmiri chronicles (Jonaraja's continuation of the Rajatarangini) record Sikandar's campaign to demolish Kashmir's temples; Martand's demolition reportedly took a year given the massive masonry." },
    source: { label: 'ASI-protected monument; Jonaraja, Rajatarangini (continuation); J&K restoration report 2024', tier: 2 },
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
  },
}

export const SITE_SLUGS = Object.keys(SITES)

export const TRADITION_LABEL: Record<Site['tradition'], string> = {
  sanatan: 'Sanatan Dharma', buddhist: 'Buddhist', jain: 'Jain', other: 'Other',
}
