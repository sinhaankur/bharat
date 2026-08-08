// News Engine — pulls India headlines from a provider, normalizes them, and runs
// each through the Bias Engine and the Sentiment Engine. Server-side only (keeps
// any API key secret). Works WITHOUT a key by returning bundled sample headlines,
// clearly labeled as sample — so the feature runs today and upgrades when you add
// a key. Set NEWS_API_KEY (GNews) or NEWSAPI_KEY (newsapi.org) in the env.

import { assessBias, type BiasResult } from './bias-engine'
import { analyzeSentiment, type SentimentResult } from './sentiment-engine'

export type NewsItem = {
  id: string
  title: string
  description: string
  url: string
  source: string
  publishedAt: string
  image?: string
  bias: BiasResult
  sentiment: SentimentResult
  move: MoveClass // the geopolitical-chess "move" framing
}

// ── The "long-haul game" framing (ties to geopolitical-chess) ──
// Each story is a MOVE: does its impact land now (short-term) or compound over
// years (long-term)? A light keyword classifier; explicitly a framing, not a fact.
export type MoveHorizon = 'short' | 'long' | 'both'
export type MoveClass = { horizon: MoveHorizon; note: string }

const LONG_SIGNALS = [
  'treaty','policy','law','bill','deal','pact','agreement','reform','census','election',
  'trade','tariff','pipeline','defence','defense','alliance','border','constitution','budget',
  'infrastructure','climate','demographic','currency','sanction','investment','strategic',
]
const SHORT_SIGNALS = [
  'attack','blast','clash','protest','arrest','raid','crash','flood','quake','win','loss',
  'match','verdict','rescue','fire','accident','strike','rally','statement',
]

function classifyMove(text: string): MoveClass {
  const t = (text || '').toLowerCase()
  const long = LONG_SIGNALS.some((w) => t.includes(w))
  const short = SHORT_SIGNALS.some((w) => t.includes(w))
  if (long && short) return { horizon: 'both', note: 'A move with immediate news value that also shifts the long game.' }
  if (long) return { horizon: 'long', note: 'A long-haul move — small headline today, compounding impact over years.' }
  if (short) return { horizon: 'short', note: 'A short-term move — the impact lands now.' }
  return { horizon: 'short', note: 'Immediate news; long-run weight unclear.' }
}

function enrich(raw: { title: string; description?: string; url: string; source: string; publishedAt: string; image?: string }): NewsItem {
  const text = `${raw.title}. ${raw.description || ''}`
  return {
    id: Buffer.from(raw.url).toString('base64').slice(0, 16),
    title: raw.title,
    description: raw.description || '',
    url: raw.url,
    source: raw.source,
    publishedAt: raw.publishedAt,
    image: raw.image,
    bias: assessBias(raw.source),
    sentiment: analyzeSentiment(raw.title),
    move: classifyMove(text),
  }
}

// ── Providers ──
async function fromGNews(key: string): Promise<NewsItem[]> {
  const url = `https://gnews.io/api/v4/top-headlines?country=in&lang=en&max=20&apikey=${key}`
  const r = await fetch(url, { next: { revalidate: 600 } })
  if (!r.ok) throw new Error(`GNews ${r.status}`)
  const d = await r.json()
  return (d.articles || []).map((a: any) =>
    enrich({
      title: a.title,
      description: a.description,
      url: a.url,
      source: a.source?.name || 'Unknown',
      publishedAt: a.publishedAt,
      image: a.image,
    })
  )
}

async function fromNewsAPI(key: string): Promise<NewsItem[]> {
  const url = `https://newsapi.org/v2/top-headlines?country=in&pageSize=20&apiKey=${key}`
  const r = await fetch(url, { next: { revalidate: 600 } })
  if (!r.ok) throw new Error(`NewsAPI ${r.status}`)
  const d = await r.json()
  return (d.articles || []).map((a: any) =>
    enrich({
      title: a.title,
      description: a.description,
      url: a.url,
      source: a.source?.name || 'Unknown',
      publishedAt: a.publishedAt,
      image: a.urlToImage,
    })
  )
}

// ── RSS from Indian outlets (no key, ANONYMOUS) — the reliable live source.
// (Reddit's public JSON/RSS now returns 403 without OAuth, so we don't use it;
//  outlet RSS is better anyway — real news, already attributed, Bias-Engine-ratable.)
// We send a generic browser UA that identifies nobody. Read-only, no login.
// The working feeds (tested live). `cap` limits how many we take from each so no
// single outlet floods the feed — giving real source & lean diversity.
const RSS_FEEDS: { url: string; source: string; cap: number }[] = [
  { url: 'https://feeds.bbci.co.uk/news/world/asia/india/rss.xml', source: 'BBC News', cap: 6 },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', cap: 3 },
  { url: 'https://feeds.feedburner.com/ndtvnews-india-news', source: 'NDTV', cap: 5 },
  { url: 'https://www.livemint.com/rss/news', source: 'LiveMint', cap: 4 },
  { url: 'https://indianexpress.com/section/india/feed/', source: 'The Indian Express', cap: 5 },
  { url: 'https://www.thehindu.com/news/national/feeder/default.rss', source: 'The Hindu', cap: 3 },
  { url: 'https://economictimes.indiatimes.com/rssfeedstopstories.cms', source: 'The Economic Times', cap: 3 },
]
const ANON_UA = 'Mozilla/5.0 (compatible; BharatAtlas/1.0; +public-data-reader)'

function stripTags(s: string): string {
  return (s || '')
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#8217;|&#39;|&rsquo;/g, '’').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '')
    .trim()
}

function parseRss(xml: string, source: string, cap: number): NewsItem[] {
  const items: NewsItem[] = []
  // strip the channel header so we don't grab the feed's own <title> as an item
  const body = xml.replace(/<channel[^>]*>[\s\S]*?(?=<item)/i, '')
  // handle both RSS <item> and Atom <entry>
  const blocks = body.match(/<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi) || []
  for (const b of blocks.slice(0, cap)) {
    const title = stripTags((b.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '')
    if (!title) continue
    const link =
      (b.match(/<link[^>]*>([\s\S]*?)<\/link>/i) || [])[1]?.trim() ||
      (b.match(/<link[^>]*href="([^"]+)"/i) || [])[1] ||
      ''
    const desc = stripTags((b.match(/<description[^>]*>([\s\S]*?)<\/description>/i) || [])[1] || '').slice(0, 180)
    const date =
      (b.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) || [])[1] ||
      (b.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i) || [])[1] ||
      new Date().toISOString()
    items.push(
      enrich({
        title,
        description: desc,
        url: link.trim(),
        source,
        publishedAt: new Date(date.trim()).toISOString(),
      })
    )
  }
  return items
}

async function fromRss(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (f) => {
      const r = await fetch(f.url, { headers: { 'User-Agent': ANON_UA }, next: { revalidate: 600 } })
      if (!r.ok) throw new Error(`${f.source} ${r.status}`)
      return parseRss(await r.text(), f.source, f.cap)
    })
  )
  const out: NewsItem[] = []
  for (const res of results) if (res.status === 'fulfilled') out.push(...res.value)
  return out
}

// ── Google News RSS — aggregates DOZENS of outlets in one call, and each <item>
// carries its ORIGINAL <source> (outlet name + url) which the Bias Engine reads
// directly. This is the widest-diversity source. We run a few India queries.
const GNEWS_QUERIES = [
  { q: 'India when:1d', cap: 14 },
  { q: 'India government policy when:2d', cap: 6 },
  { q: 'India court OR verdict OR CBI OR ED when:2d', cap: 6 },
]
async function fromGoogleNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    GNEWS_QUERIES.map(async ({ q, cap }) => {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-IN&gl=IN&ceid=IN:en`
      const r = await fetch(url, { headers: { 'User-Agent': ANON_UA }, next: { revalidate: 600 } })
      if (!r.ok) throw new Error(`GoogleNews ${r.status}`)
      const xml = await r.text()
      const blocks = (xml.match(/<item>[\s\S]*?<\/item>/gi) || []).slice(0, cap)
      const items: NewsItem[] = []
      for (const b of blocks) {
        let title = stripTags((b.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '')
        // Google appends " - <Source>" to titles; the real source is in <source>
        const src = stripTags((b.match(/<source[^>]*>([\s\S]*?)<\/source>/i) || [])[1] || 'Google News')
        title = title.replace(new RegExp(`\\s*-\\s*${src}\\s*$`, 'i'), '').trim()
        const link = (b.match(/<link>([\s\S]*?)<\/link>/i) || [])[1]?.trim() || ''
        const date = (b.match(/<pubDate>([\s\S]*?)<\/pubDate>/i) || [])[1] || new Date().toISOString()
        if (!title) continue
        items.push(
          enrich({
            title,
            description: `via Google News · ${src}`,
            url: link,
            source: src, // the ORIGINAL outlet → Bias Engine rates it
            publishedAt: new Date(date.trim()).toISOString(),
          })
        )
      }
      return items
    })
  )
  const out: NewsItem[] = []
  for (const res of results) if (res.status === 'fulfilled') out.push(...res.value)
  return out
}

// ── Sample fallback (no key) — real-looking India headlines across the lean/tone
// spectrum, clearly labeled sample so nothing is passed off as live. ──
const SAMPLE: { title: string; description: string; source: string }[] = [
  { title: 'India and neighbour sign long-term trade pact to ease border commerce', description: 'The agreement phases in over five years and reshapes regional supply chains.', source: 'Reuters' },
  { title: 'Monsoon floods displace thousands as rivers breach embankments', description: 'Relief camps set up across low-lying districts; rescue operations underway.', source: 'The Hindu' },
  { title: 'Budget boosts infrastructure spending; critics question the funding math', description: 'Capital outlay rises sharply while economists debate the deficit path.', source: 'The Indian Express' },
  { title: 'Opposition slams new bill as government defends it in parliament', description: 'The proposed law heads to committee after a heated debate.', source: 'NDTV' },
  { title: 'Record solar capacity added as renewable investment surges', description: 'The economics tipped; states race to add grid-scale capacity.', source: 'LiveMint' },
  { title: 'Anchor calls verdict a national victory in prime-time broadcast', description: 'Coverage framed the court ruling in triumphant terms.', source: 'Republic' },
  { title: 'Census delay raises questions over welfare targeting', description: 'Policymakers rely on ageing data to allocate benefits.', source: 'Scroll' },
  { title: 'Border talks resume in a cautious step toward de-escalation', description: 'Diplomats describe the meeting as constructive but preliminary.', source: 'The Print' },
]

function sampleItems(): NewsItem[] {
  const now = Date.now()
  return SAMPLE.map((s, i) =>
    enrich({
      title: s.title,
      description: s.description,
      url: `https://example.com/sample/${i}`,
      source: s.source,
      publishedAt: new Date(now - i * 3600_000).toISOString(),
    })
  )
}

export type NewsResult = {
  items: NewsItem[]
  live: boolean
  provider: string
  note: string
  fetchedAt: string
}

/** The News Engine entrypoint. Merges every available source (outlet API + Reddit),
 *  dedupes, and sorts newest-first. Reddit needs NO key, so the feed is live by
 *  default; an outlet API key adds curated headlines on top. */
export async function getNews(): Promise<NewsResult> {
  const gnews = process.env.NEWS_API_KEY
  const newsapi = process.env.NEWSAPI_KEY
  const base = { fetchedAt: new Date().toISOString() }
  const providers: string[] = []
  let items: NewsItem[] = []

  // 1) outlet API (if a key is set)
  try {
    if (gnews) {
      const a = await fromGNews(gnews)
      if (a.length) { items = items.concat(a); providers.push('GNews') }
    } else if (newsapi) {
      const a = await fromNewsAPI(newsapi)
      if (a.length) { items = items.concat(a); providers.push('NewsAPI') }
    }
  } catch {
    /* fall through to Reddit / sample */
  }

  // 2) RSS from Indian outlets (no key, anonymous) — always attempted
  try {
    const r = await fromRss()
    if (r.length) { items = items.concat(r); providers.push('RSS') }
  } catch {
    /* skip */
  }

  // 3) Google News aggregate (widest source diversity; original outlet per item)
  try {
    const g = await fromGoogleNews()
    if (g.length) { items = items.concat(g); providers.push('Google News') }
  } catch {
    /* skip */
  }

  if (items.length) {
    // dedupe by title, newest first, cap the feed
    const seen = new Set<string>()
    const merged = items
      .filter((i) => (seen.has(i.title) ? false : (seen.add(i.title), true)))
      .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
      .slice(0, 30)
    return {
      items: merged,
      live: true,
      provider: providers.join(' + '),
      note: `Live India feed from ${providers.join(' + ')} (outlet RSS + any API key). Each item is run through the Bias & Sentiment engines.`,
      ...base,
    }
  }

  // fallback) nothing worked → labeled sample
  return {
    items: sampleItems(),
    live: false,
    provider: 'sample',
    note: 'No live source reachable — showing SAMPLE headlines (clearly labeled). The feed pulls outlet RSS by default; add NEWS_API_KEY (GNews) for more.',
    ...base,
  }
}
