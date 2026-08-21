import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import HomeMotion from './home-motion'
import { classicMapHref } from '@/lib/links'
import { SKINS } from '@/lib/skins'

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

      {/* GRAND CINEMATIC HERO — a heritage-textured, gilded arrival, full-bleed */}
      <section className="hm-cinema" aria-label="Welcome">
        {/* layered ancient texture backdrop, slow ken-burns drift */}
        <svg className="hm-cinema-bg" aria-hidden="true"><rect width="100%" height="100%" fill="url(#jali)" /></svg>
        <div className="hm-cinema-wash" aria-hidden="true" />
        <div className="hm-cinema-in">
          <div className="hm-seal" data-seq aria-hidden="true">
            <svg width="64" height="64" viewBox="0 0 100 100"><use href="#seal-ring" /></svg>
          </div>
          <div className="royal-kicker hm-kicker" data-seq>Since antiquity · भारत · a civilisation, mapped</div>
          <h1 className="hm-h1">
            <span data-seq><span className="gilt-text">Bharat</span>,</span>
            <span data-seq>district by district.</span>
          </h1>
          <div className="hm-gilt-rule gilt-rule" data-seq aria-hidden="true" />
          <p className="hm-lede" data-seq>
            Five thousand years of a civilisation — its money and land, its temples, scripts and names —
            laid over 594 districts in one archive that opens like a book of maps. Sourced, or it&apos;s a gap.
          </p>
          <div className="hm-cta" data-seq>
            <a className="btn btn-primary btn-lg" href={classicMapHref()}>Enter Bharat →</a>
            <a className="btn btn-ghost" href="#atlas">What it holds</a>
          </div>
        </div>
        <div className="hm-ornament" aria-hidden="true"><svg height="20" width="100%"><rect width="100%" height="20" fill="url(#floral)" /></svg></div>
      </section>

      <main style={{ maxWidth: 'var(--wrap)', margin: '0 auto', padding: '0 var(--edge)' }}>

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
          <span className="hm-eyebrow royal-caps">What Bharat holds</span>
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

      {/* BRAND MOMENT — India, told in its own design language. A full-bleed royal band
          that carries the design-system story onto the landing surface. */}
      <section className="hm-brand" aria-label="Indic Designs — India's own design language">
        <div className="hm-brand-in">
          <div className="hm-brand-kicker">Indic Designs™ · India&apos;s own design language</div>
          <h2 className="hm-brand-h">
            An atlas of India deserves to be <em>told in India&apos;s own hand.</em>
          </h2>
          <p className="hm-brand-lede">
            So we built one — a design language <b>for Bharat</b>, one system per heritage. The colour, the
            corner, the motif of each are read straight out of that place: kumkum vermilion from a Chola
            temple, halo-gold from an Ajanta fresco, cinnabar from a Rajput miniature. One chassis, many
            Indias — worn over the whole atlas.
          </p>
          {/* the systems, as a swatch strip — a teaser into the gallery */}
          <div className="hm-brand-strip" aria-hidden="true">
            {SKINS.map((s) => (
              <span key={s.id} className="hm-brand-sw" title={s.label}
                style={{ background: s.swatch, boxShadow: `inset 0 -5px 0 ${s.band}` }} />
            ))}
          </div>
          <a className="hm-brand-cta" href="design-systems/">Walk the gallery →</a>
        </div>
      </section>

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

        /* ── HERO — clean, quiet, confident. A faint jali watermark on the stone
              ground, ample space, one gold accent. No murky gradients. ── */
        .hm-cinema { position: relative; overflow: hidden; border-bottom: 1px solid var(--line); background: var(--bg); }
        .hm-cinema-bg { position: absolute; top: -10%; right: -6%; width: 46%; height: 120%; color: var(--band);
          opacity: .05; }                                       /* a whisper of pattern, corner only */
        .hm-cinema-wash { display: none; }                      /* no wash — it muddied the ground */
        .hm-cinema-in { position: relative; max-width: var(--wrap); margin: 0 auto; padding: clamp(72px, 13vh, 148px) var(--edge) clamp(56px, 9vh, 100px); }
        .hm-seal { color: var(--accent); margin-bottom: 26px; }
        .hm-kicker { font-family: var(--font-mono); font-size: 11.5px; letter-spacing: .24em; text-transform: uppercase;
          color: var(--accent-700); margin-bottom: 20px; }
        .hm-cinema .hm-h1 { font-family: var(--font-display); font-weight: 400; font-size: clamp(46px, 7.5vw, 96px);
          line-height: 1.02; letter-spacing: -0.01em; margin: 0; color: var(--ink); }
        /* keep the gilt word on the same baseline as its comma; no extra line-box */
        .hm-cinema .hm-h1 .gilt-text { display: inline; line-height: inherit; padding-right: .02em; }
        .hm-cinema .hm-h1 span[data-seq]:first-child { margin-bottom: -0.06em; }
        .hm-cinema .hm-lede { font-size: clamp(16px, 1.4vw, 19px); line-height: 1.75; max-width: 58ch; margin: 30px 0 0; color: var(--muted); }
        .hm-cinema .hm-cta { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 36px; }
        .hm-ornament { display: none; }                          /* dropped — cleaner without it */

        /* ROYAL BHARAT gilt detailing on the hero */
        .hm-gilt-rule { width: min(420px, 62%); margin: 30px 0 0; height: 2px; opacity: .9; }
        .hm-cinema .hm-kicker::before { background: var(--gold-leaf); }
        .hm-cinema .hm-seal { color: var(--gold-leaf); filter: drop-shadow(0 1px 0 color-mix(in srgb, var(--gold-leaf) 40%, transparent)); }
        /* stat counters get a gilt underline; entry cells a gilt top-hairline on hover */
        .hm-stats > div { position: relative; padding-top: 14px; }
        .hm-stats > div::before { content: ""; position: absolute; top: 0; left: 0; width: 34px; height: 2px; background: var(--gold-leaf); }
        .hm-cell { position: relative; transition: background .15s ease; }
        .hm-cell::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 2px; transform: scaleX(0); transform-origin: left;
          background: linear-gradient(90deg, var(--gold-leaf), transparent); transition: transform .28s cubic-bezier(.2,.7,.3,1); }
        .hm-cell:hover::before { transform: scaleX(1); }
        html[data-reduce="on"] .hm-cell::before { transition: none; }

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

        /* ── BRAND MOMENT — the deep-royal band, carrying the design-system register ── */
        .hm-brand { background:
            radial-gradient(120% 100% at 50% -20%, #351a13 0%, #23110d 55%, #170b08 100%);
          border-top: 3px solid #d9a441; }
        .hm-brand-in { max-width: 900px; margin: 0 auto; padding: clamp(56px,9vh,104px) var(--edge); text-align: center; }
        .hm-brand-kicker { font: 700 11px var(--font-mono); letter-spacing: .24em; text-transform: uppercase; color: #f0cd7a; margin-bottom: 18px; }
        .hm-brand-h { font: 400 clamp(28px,4.4vw,50px)/1.12 'Rozha One', var(--font-display); color: #f4e6c8; margin: 0 auto; max-width: 20ch; }
        .hm-brand-h em { font-style: italic;
          background: linear-gradient(180deg, #f0cd7a, #d9a441 70%, #b8842f);
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .hm-brand-lede { font: 400 clamp(15px,1.3vw,17px)/1.75 var(--font-ui); color: rgba(244,230,200,.78); max-width: 62ch; margin: 22px auto 0; }
        .hm-brand-lede b { color: #f0cd7a; font-weight: 600; }
        .hm-brand-strip { display: flex; justify-content: center; gap: 0; margin: 30px auto 0; width: max-content;
          border: 1px solid rgba(217,164,65,.4); }
        .hm-brand-sw { width: clamp(34px,6vw,54px); height: 30px; display: block; }
        .hm-brand-cta { display: inline-block; margin-top: 30px; font: 700 13px var(--font-ui);
          color: #23110d; background: linear-gradient(180deg,#f0cd7a,#d9a441); padding: 12px 24px; text-decoration: none;
          transition: filter .15s ease, transform .15s ease; }
        .hm-brand-cta:hover { filter: brightness(1.06); transform: translateY(-2px); }
      `}</style>
    </>
  )
}
