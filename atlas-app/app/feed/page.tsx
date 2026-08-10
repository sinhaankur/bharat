import type { Metadata } from 'next'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import { classicHref } from '@/lib/links'

// Feed shell — mockup 4d: place-clustered stories with a media-lean bar (bias shown,
// not hidden) and a blindspot tag. Covers feed/articles/article/story/curate/timeline/
// atrocities.
export const metadata: Metadata = {
  title: 'The feed — moderated, attributed, clustered by place · Bharat',
  description: 'Spin-proof numbers beside the contested narrative. Every story pinned to place, with its media-lean spread and blindspots shown.',
}

type Story = {
  place: string
  headline: string
  body?: string
  lean: [number, number, number]   // left · center · right weights
  tag: { text: string; blindspot?: boolean }
}
const STORIES: Story[] = [
  {
    place: 'WEST BENGAL · MONEY FLOW',
    headline: 'Centre releases partial MGNREGS dues after court order',
    body: 'Clustered from 6 outlets. Spin-proof numbers beside the contested narrative — the district ledger holds the sourced figure.',
    lean: [2, 3, 2],
    tag: { text: 'BLINDSPOT — RIGHT', blindspot: true },
  },
  {
    place: 'MAHARASHTRA · ZONING',
    headline: 'CRZ notice issued for reclaimed stretch in Greater Bombay',
    lean: [1, 4, 1.5],
    tag: { text: '3 OUTLETS' },
  },
]

export default function FeedPage() {
  return (
    <>
      <SiteHeader />

      <main className="fd">
        <div className="fd-top">
          <svg width="17" height="17" style={{ color: 'var(--gold)' }} aria-hidden="true"><use href="#chakra" /></svg>
          <span className="fd-brand">The feed</span>
          <span className="fd-sub">moderated · attributed · clustered by place</span>
          <span className="fd-live mono">
            <svg width="11" height="11" style={{ color: 'var(--gold-700)', animation: 'chakra-spin 12s linear infinite' }} aria-hidden="true"><use href="#chakra" /></svg>
            LIVE
          </span>
        </div>

        {STORIES.map((s, i) => {
          const total = s.lean[0] + s.lean[1] + s.lean[2]
          return (
            <article key={i} className="fd-story">
              <div className="fd-place mono">{s.place}</div>
              <h2 className="fd-headline">{s.headline}</h2>
              {s.body && <p className="fd-body">{s.body}</p>}
              <div className="fd-lean-row">
                <span className="mono fd-lean-l">LEAN</span>
                <div className="fd-lean">
                  <span style={{ flex: s.lean[0], background: '#2a4a7a' }} />
                  <span style={{ flex: s.lean[1], background: '#bab6b6' }} />
                  <span style={{ flex: s.lean[2], background: '#ae1800' }} />
                </div>
                <span className={`mono fd-tag${s.tag.blindspot ? ' blindspot' : ''}`}>{s.tag.text}</span>
              </div>
            </article>
          )
        })}

        <a href={classicHref('feed')} className="fd-all">All stories, pinned to the map →</a>
      </main>

      <SiteFooter />

      <style>{`
        .fd { background: #f3f2f2; color: #1a1917; max-width: 680px; margin: 0 auto; font-family: var(--font-ui); }
        .fd-top { display: flex; align-items: center; gap: 11px; padding: 12px var(--edge); border-bottom: 2px solid #262320; }
        .fd-brand { font: 600 13px var(--font-serif); }
        .fd-sub { font: 400 11px var(--font-ui); color: #605d5d; }
        .fd-live { margin-left: auto; display: flex; align-items: center; gap: 6px; font-size: 10px; letter-spacing: .1em; color: var(--gold-700); }
        .fd-story { padding: 16px var(--edge); border-bottom: 1px solid #d7d3d3; }
        .fd-place { font-size: 9.5px; letter-spacing: .14em; color: var(--gold-700); margin-bottom: 6px; }
        .fd-headline { font: 600 17px/1.3 var(--font-serif); margin: 0 0 6px; }
        .fd-body { font: 400 12px/1.5 var(--font-ui); color: #605d5d; margin: 0 0 10px; }
        .fd-lean-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .fd-lean-l { font-size: 9.5px; color: #605d5d; }
        .fd-lean { display: flex; height: 8px; flex: 1; max-width: 220px; }
        .fd-tag { font-size: 9.5px; border: 1px solid #bab6b6; color: #605d5d; padding: 1px 7px; }
        .fd-tag.blindspot { background: #ffe0d9; color: var(--gold-700); border-color: transparent; }
        .fd-all { display: block; padding: 13px var(--edge); font: 600 12px var(--font-ui); color: var(--gold-700); }
        .fd-all:hover { background: #ffe0d9; color: var(--gold-700); }
      `}</style>
    </>
  )
}
