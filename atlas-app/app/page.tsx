import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import HomeMotion from './home-motion'
import { classicMapHref } from '@/lib/links'

// The home — faithful to the handoff's Atlas Home.dc.html: "The atlas of modern
// India." over a modular grid, animated red stat counters, and the bordered entry
// grid. Modernist: Archivo, red accent, 2px rules, flush-left, 0 radius.
export const metadata: Metadata = {
  title: 'Bharat, district by district · Indic Designs',
  description:
    '594 districts — their boundaries, censuses, and measured survey plates — in one archive that opens like a book of maps. Sourced, or marked a gap.',
}

const STATS = [
  { count: '594', label: 'Districts mapped' },
  { count: '36', label: 'States & union territories' },
  { count: '1.4', decimals: 1, suffix: 'B', label: 'People counted' },
  { count: '3.29', decimals: 2, suffix: 'M km²', label: 'Land surveyed' },
]

const ENTRIES = [
  { n: '01', title: 'Explore districts', body: 'Every boundary, versioned as districts split and merge — money to the pixel.', href: '/explore' },
  { n: '02', title: 'Census layers', body: 'Population and the deep district ledgers, drawn over the same base map.', href: '/register' },
  { n: '03', title: 'Survey plates', body: 'Measured temple and site surveys, archived as drawn plates.', href: '/heritage/ranakpur-jain-temple' },
  { n: '04', title: 'The engines', body: 'Seven lenses on one country — survey, money, land, law, the record.', href: '/engines' },
]

export default function HomePage() {
  return (
    <>
      {/* intro splash — "Bharat / Indic" */}
      <div data-intro className="hm-intro">
        <div>
          <div className="hm-intro-rule" />
          <p className="hm-intro-t"><span>Bharat</span><span>Indic</span></p>
        </div>
      </div>

      <SiteHeader />

      <main style={{ maxWidth: 'var(--wrap)', margin: '0 auto', padding: '0 var(--edge)' }}>
        {/* hero — modular grid rules behind the headline */}
        <section className="hm-hero">
          <div className="hm-rule" style={{ left: '25%' }} data-anim />
          <div className="hm-rule" style={{ left: '50%' }} data-anim />
          <div className="hm-rule" style={{ left: '75%' }} data-anim />
          <h1 className="hm-h1">
            <span data-seq>Bharat,</span>
            <span data-seq>district by district.</span>
          </h1>
          <p className="hm-lede" data-seq>
            594 districts — their boundaries, censuses, and measured survey plates — in one archive that
            opens like a book of maps.
          </p>
          <div className="hm-cta" data-seq>
            <a className="btn btn-primary" href={classicMapHref()}>Enter Bharat</a>
            <a className="btn btn-ghost" href="#atlas">What it holds</a>
          </div>
        </section>

        <div className="hm-hr" data-anim />

        {/* stats — animated red counters */}
        <section id="data" aria-label="The atlas, by the numbers" style={{ padding: '70px 0' }}>
          <div className="hm-stats" data-seq>
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="hm-stat-n">
                  <span data-count={s.count} data-decimals={s.decimals ?? 0} data-suffix={s.suffix ?? ''}>0</span>
                </p>
                <p className="hm-stat-l">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* entry grid */}
        <section id="atlas" style={{ padding: '0 0 98px' }}>
          <span className="hm-eyebrow">What Bharat holds</span>
          <div className="hm-grid" data-seq>
            {ENTRIES.map((e) => (
              <Link key={e.n} href={e.href} className="hm-cell">
                <p className="hm-cell-n">{e.n}</p>
                <h2 className="hm-cell-t">{e.title}</h2>
                <p className="hm-cell-b">{e.body}</p>
                <svg className="hm-arrow" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
                  <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
                </svg>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
      <HomeMotion />

      <style>{`
        @keyframes hmIntroExit { to { transform: translateY(-101%); } }
        @keyframes hmRise { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
        @keyframes hmDrawX { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .hm-intro { position: fixed; inset: 0; z-index: 100; background: var(--accent); display: flex; align-items: flex-end; padding: var(--edge); animation: hmIntroExit .8s cubic-bezier(.7,0,.2,1) 1.7s forwards; }
        .hm-intro-rule { height: 2px; width: min(360px, 40vw); background: var(--surface); transform: scaleX(0); transform-origin: left; animation: hmDrawX .7s cubic-bezier(.2,.6,.2,1) .15s forwards; }
        .hm-intro-t { font-family: var(--font-display); font-size: clamp(48px, 9vw, 128px); line-height: 1.02; letter-spacing: -.02em; color: var(--surface); margin: 20px 0 0 -0.058em; }
        .hm-intro-t span { display: block; opacity: 0; animation: hmRise .7s cubic-bezier(.2,.6,.2,1) .3s forwards; }
        .hm-intro-t span:last-child { animation-delay: .45s; }
        @media (prefers-reduced-motion: reduce) { .hm-intro { display: none !important; } }
        .hm-hero { position: relative; padding: 112px 0 84px; }
        .hm-rule { position: absolute; top: 0; bottom: 0; width: 1px; background: var(--line); opacity: .35; }
        .hm-h1 { position: relative; font-family: var(--font-display); font-weight: 800; font-size: clamp(42px, 6.2vw, 84px); line-height: 1.06; letter-spacing: -0.02em; margin: 0 0 0 -0.058em; }
        .hm-h1 span { display: block; }
        .hm-lede { position: relative; font-size: 17px; line-height: 28px; max-width: 58ch; margin: 36px 0 0; }
        .hm-cta { position: relative; display: flex; gap: var(--space-3); flex-wrap: wrap; margin-top: 28px; }
        .btn-ghost { color: var(--accent); padding-inline: var(--space-1); }
        .btn-ghost:hover { background: color-mix(in srgb, var(--accent) 10%, transparent); }
        .hm-hr { height: 2px; background: var(--line); }
        .hm-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 42px 28px; }
        .hm-stat-n { font-family: var(--font-display); font-weight: 800; font-size: clamp(34px, 3.4vw, 48px); line-height: 56px; color: var(--accent); margin: 0 0 0 -0.045em; }
        .hm-stat-l { font-size: 13px; line-height: 14px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); margin: 14px 0 0; }
        .hm-eyebrow { display: block; font-size: 13px; line-height: 14px; letter-spacing: .08em; text-transform: uppercase; color: var(--accent-700); margin: 0 0 28px; }
        .hm-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2px; background: var(--line); border: 2px solid var(--line); }
        .hm-cell { display: block; background: var(--bg); padding: 42px 32px; text-decoration: none; color: var(--ink); }
        .hm-cell:hover { background: #ffe0d9; }
        .hm-cell-n { font-family: var(--font-display); font-weight: 800; font-size: 15px; line-height: 14px; color: var(--accent-700); margin: 0; }
        .hm-cell-t { font-family: var(--font-display); font-weight: 800; font-size: 26px; line-height: 30px; letter-spacing: -0.01em; margin: 22px 0 0; }
        .hm-cell-b { font-size: 15px; line-height: 24px; color: color-mix(in srgb, var(--ink) 78%, transparent); margin: 12px 0 0; max-width: 36ch; }
        .hm-arrow { display: block; margin-top: 28px; color: var(--accent); }
      `}</style>
    </>
  )
}
