import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import BrandSeal from '@/components/brand-seal'
import Icon from '@/components/icon'
import { classicMapHref, classicHref } from '@/lib/links'

// Editorial front shell — mockup 4a. Covers about/how-it-works/for-organisations.
export const metadata: Metadata = {
  title: 'About — understand India, by the evidence · Bharat',
  description: 'Money, land, law, heritage, history and the record behind the headlines — traced to every one of 594 districts. Sourced, or we mark it a gap.',
}

const STARTS: { n: string; kicker: string; icon: 'coin' | 'edict' | 'lion'; title: string; body: string; href: string; ext?: boolean }[] = [
  { n: 'START 01 · THE MAP', kicker: '', icon: 'coin', title: 'See the money, by district', body: 'Every one of 594 districts, coloured by what you choose. The heart of the atlas.', href: classicMapHref(), ext: true },
  { n: 'START 02 · THE LANGUAGES', kicker: '', icon: 'edict', title: 'Every language & script of Bharat', body: 'Families, scripts, fonts, sacred texts and a scroll-through journey — the deep culture layer.', href: '/study/languages' },
  { n: 'START 03 · THE HISTORY', kicker: '', icon: 'lion', title: 'An empire in its own words', body: "Ashoka's rule mapped from his edicts — a ruler you can read, because the script was deciphered.", href: '/study/ashoka' },
]

const STATS = [
  { n: '594', l: 'districts' },
  { n: '36', l: 'states & UTs' },
  { n: '7', l: 'engines' },
  { n: '100%', l: 'sourced — or a gap', gold: true },
]

export default function AboutPage() {
  return (
    <>
      <SiteHeader />

      <main className="ed" style={{ maxWidth: 'var(--wrap)', margin: '0 auto' }}>
        {/* hero */}
        <section className="ed-hero">
          <svg className="ed-jali" aria-hidden="true"><rect width="100%" height="100%" fill="url(#jali)" /></svg>
          <div className="ed-hero-in">
            <div className="ed-kicker mono">Bharat · understand India, by the evidence</div>
            <h1 className="ed-h1">
              Understand India —<br /><em className="ed-em">by the evidence.</em>
            </h1>
            <p className="ed-dek">
              Money, land, law, heritage, history and the record behind the headlines — traced to every one of
              594 districts. Sourced, or we mark it a gap.
            </p>
            <div className="ed-cta-row">
              <a href={classicMapHref()} className="btn btn-primary"><Icon name="coin" size={16} />Explore the map ↓</a>
              <Link href="/study/ashoka" className="btn btn-secondary">Read the explainers</Link>
            </div>
          </div>
        </section>

        {/* start here */}
        <section className="ed-start">
          <div className="ed-kicker mono">New here? Start with one of these</div>
          <div className="ed-starts">
            {STARTS.map((s) =>
              s.ext ? (
                <a key={s.title} href={s.href} className="ed-card">
                  <div className="ed-card-n mono">{s.n}</div>
                  <Icon name={s.icon} size={30} className="ed-card-ic" />
                  <div className="ed-card-t">{s.title}</div>
                  <div className="ed-card-b">{s.body}</div>
                </a>
              ) : (
                <Link key={s.title} href={s.href} className="ed-card">
                  <div className="ed-card-n mono">{s.n}</div>
                  <Icon name={s.icon} size={30} className="ed-card-ic" />
                  <div className="ed-card-t">{s.title}</div>
                  <div className="ed-card-b">{s.body}</div>
                </Link>
              )
            )}
          </div>
        </section>

        {/* stat band */}
        <div className="ed-stats">
          {STATS.map((s, i) => (
            <div key={s.l} className="ed-stat" style={{ borderRight: i < STATS.length - 1 ? '1px solid var(--line)' : undefined }}>
              <div className="ed-stat-n mono" style={{ color: s.gold ? 'var(--gold)' : undefined }}>{s.n}</div>
              <div className="ed-stat-l">{s.l}</div>
            </div>
          ))}
        </div>

        {/* pixel banner */}
        <section className="ed-banner">
          <svg className="ed-banner-jali" aria-hidden="true"><rect width="100%" height="100%" fill="url(#jali-dark)" /></svg>
          <div className="ed-banner-q">
            We trace public money to the <em className="ed-banner-em">pixel</em> — and the chain of command behind it.
          </div>
          <div className="ed-banner-cta">
            <a href={classicHref('how-it-works')} className="btn btn-primary">How it works</a>
            <a href={classicHref('references')} className="ed-banner-ghost">Every source</a>
          </div>
        </section>
      </main>

      <SiteFooter />

      <style>{`
        .ed-hero { position: relative; padding: 52px var(--edge) 40px; border-bottom: 2px solid var(--line-strong); }
        .ed-jali { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
        .ed-hero-in { position: relative; max-width: 780px; }
        .ed-kicker { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: var(--terra); margin-bottom: 12px; }
        .ed-h1 { font: 600 clamp(34px,6vw,52px)/1.04 var(--font-serif); margin: 0 0 14px; letter-spacing: -.015em; }
        .ed-em { font-family: var(--font-italic); font-weight: 400; }
        .ed-dek { font: 400 16px/1.55 var(--font-ui); color: var(--muted); margin: 0 0 22px; max-width: 600px; }
        .ed-cta-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .ed-start { padding: 26px var(--edge); border-bottom: 2px solid var(--line-strong); }
        .ed-starts { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 14px; }
        .ed-card { border: 1px solid var(--line); background: var(--stone-2); padding: 18px 20px; position: relative; display: block; transition: box-shadow .15s; }
        .ed-card:hover { box-shadow: 5px 5px 0 rgba(42,32,24,.15); }
        .ed-card::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, rgba(255,252,244,.8), transparent); }
        .ed-card-n { font-size: 9.5px; letter-spacing: .14em; color: var(--gold-700); }
        .ed-card-ic { color: var(--sky); margin: 12px 0 8px; }
        .ed-card-t { font: 600 18px var(--font-serif); margin-bottom: 6px; }
        .ed-card-b { font: 400 12.5px/1.5 var(--font-ui); color: var(--muted); }
        .ed-stats { display: grid; grid-template-columns: repeat(4, 1fr); border-bottom: 2px solid var(--line-strong); }
        .ed-stat { padding: 20px; }
        .ed-stat-n { font: 600 clamp(26px,4vw,34px) var(--font-mono); }
        .ed-stat-l { font: 500 11px var(--font-ui); letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
        .ed-banner { position: relative; background: #2d2b2b; color: #f3f2f2; padding: 44px var(--edge); overflow: hidden; }
        .ed-banner-jali { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
        .ed-banner-q { position: relative; font: 600 clamp(22px,3.5vw,30px)/1.25 var(--font-serif); max-width: 720px; }
        .ed-banner-em { font-family: var(--font-italic); color: #ec3013; font-weight: 400; }
        .ed-banner-cta { position: relative; display: flex; gap: 12px; margin-top: 20px; flex-wrap: wrap; }
        .ed-banner-ghost { border: 1.5px solid rgba(239,227,204,.5); font: 600 13px var(--font-ui); padding: 8px 16px; color: #f3f2f2; }
        .ed-banner-ghost:hover { border-color: #ec3013; color: #f3f2f2; }
        @media (max-width: 820px) { .ed-starts { grid-template-columns: 1fr; } .ed-stats { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </>
  )
}
