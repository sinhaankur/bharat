import type { Metadata } from 'next'
import PageShell from '@/components/page-shell'
import { getNews } from '@/lib/news'
import { biasSpread, LEAN_LABEL, LEAN_POS, BIAS_METHOD } from '@/lib/bias-engine'
import { SENTIMENT_METHOD } from '@/lib/sentiment-engine'
import NewsCard from './news-card'
import BiasBar from './bias-bar'

export const metadata: Metadata = {
  title: 'The News Engine — India headlines with bias & sentiment | Bharat',
  description:
    'Live India headlines, each read through the Bias Engine (media-lean) and the Sentiment Engine (tone), Ground-News style — and framed as moves in a long-haul game. Sourced, and the method is in the open.',
}

export const revalidate = 600

export default async function NewsPage() {
  const news = await getNews()
  const spread = biasSpread(news.items.map((i) => i.source))
  const sent = {
    negative: news.items.filter((i) => i.sentiment.label === 'negative').length,
    neutral: news.items.filter((i) => i.sentiment.label === 'neutral').length,
    positive: news.items.filter((i) => i.sentiment.label === 'positive').length,
  }
  const total = news.items.length || 1

  return (
    <PageShell
      brief={{
        section: 'News',
        explainer:
          'India headlines pulled live, then read through two engines — a Bias Engine (media-lean by outlet) and a Sentiment Engine (tone of the headline) — Ground-News style, and framed as moves in a long-haul game.',
        research:
          'The News Engine normalizes a provider feed (GNews/NewsAPI) server-side. The Bias Engine maps each outlet to a lean from a maintained registry (unrated where we have none). The Sentiment Engine is a transparent lexicon heuristic on the headline. Both read framing/tone, not truth.',
        references: [
          { label: 'Feed & method', href: '/feed.html' },
          { label: 'Geopolitical chess', href: '/geopolitical-chess.html' },
          { label: 'All sources', href: '/references.html' },
        ],
        docs: '/how-it-works.html',
        updated: '2026-08-07',
      }}
    >
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <header>
          <div className="text-[11px] font-bold uppercase tracking-widest text-accent">
            The News Engine · India · {news.live ? 'live' : 'sample'}
          </div>
          <h1 className="mt-2 font-serif text-3xl font-black leading-tight md:text-5xl">
            The news, read by <em className="italic">two engines</em>
          </h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
            Every headline below is pulled live, then scored for <b>media-lean</b> (the Bias Engine) and{' '}
            <b>tone</b> (the Sentiment Engine), and framed as a <b>move</b> — does its impact land now, or
            compound over the long haul? The engines read framing and tone, never truth.
          </p>
          {!news.live && (
            <p className="mt-3 inline-block rounded border border-accent/40 bg-accent/10 px-3 py-1.5 text-sm text-foreground">
              ⚠ <b>Sample mode.</b> {news.note}
            </p>
          )}
        </header>

        {/* aggregates */}
        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded border border-border bg-card p-5">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Coverage lean
            </h2>
            <BiasBar spread={spread} total={total} />
            {spread.blindspot && (
              <p className="mt-3 text-sm text-foreground">
                🕳 <b>Blindspot:</b> the{' '}
                <span className="font-semibold">{spread.blindspot === 'left' ? 'Left' : 'Right'}</span>{' '}
                isn’t covering part of this. Coverage is one-sided.
              </p>
            )}
          </div>
          <div className="rounded border border-border bg-card p-5">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Sentiment mix
            </h2>
            <div className="mt-4 flex h-6 overflow-hidden rounded">
              <span
                style={{ width: `${(sent.negative / total) * 100}%`, background: 'oklch(0.58 0.16 25)' }}
                title={`Negative ${sent.negative}`}
              />
              <span
                style={{ width: `${(sent.neutral / total) * 100}%`, background: 'oklch(0.72 0.02 80)' }}
                title={`Neutral ${sent.neutral}`}
              />
              <span
                style={{ width: `${(sent.positive / total) * 100}%`, background: 'oklch(0.6 0.14 150)' }}
                title={`Positive ${sent.positive}`}
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground">
              <span>▼ {sent.negative} negative</span>
              <span>■ {sent.neutral} neutral</span>
              <span>▲ {sent.positive} positive</span>
            </div>
          </div>
        </section>

        {/* the feed */}
        <div className="mt-8 divide-y divide-border">
          {news.items.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>

        {/* method */}
        <div className="mt-10 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
          <p>
            <b className="text-foreground">Bias Engine.</b> {BIAS_METHOD}
          </p>
          <p className="mt-2">
            <b className="text-foreground">Sentiment Engine.</b> {SENTIMENT_METHOD}
          </p>
          <p className="mt-2">
            <b className="text-foreground">The move framing</b> ties to{' '}
            <a href="/geopolitical-chess.html" className="text-accent hover:underline">
              Geopolitical Chess
            </a>{' '}
            — news as moves in a long-haul game, small headlines with compounding impact. A framing, labeled as one.
          </p>
          <p className="mt-3 font-mono">
            Provider: {news.provider} · fetched {new Date(news.fetchedAt).toLocaleString()}
          </p>
        </div>
      </div>
    </PageShell>
  )
}
