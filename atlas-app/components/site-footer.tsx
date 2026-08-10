import Link from 'next/link'
import BharatLogo from '@/components/bharat-logo'
import { classicMapHref, classicHref } from '@/lib/links'

// The global footer — faithful to the handoff's Atlas Footer.dc.html (Indic): a dark
// register (ink ground, cream text, gold band), a "Follow the money" newsletter, the
// Bharat Logo, Atlas / Heritage / Trust columns, a sawtooth band, and the 8-script
// baseline. The dark ground stays constant; the gold band follows the active skin.
const COLS: { label: string; icon: React.ReactNode; links: { t: string; href: string; ext?: boolean }[] }[] = [
  {
    label: 'Atlas',
    icon: <><path d="M9 3 3.6 5v16L9 19l6 2 5.4-2V3L15 5 9 3z" /><path d="M9 3v16M15 5v16" /></>,
    links: [
      { t: 'Home', href: '/' },
      { t: 'Explore & query', href: '/explore' },
      { t: 'The engines', href: '/engines' },
      { t: 'The map', href: classicMapHref(), ext: true },
    ],
  },
  {
    label: 'Heritage',
    icon: <><path d="M12 3 4 9h16z" /><path d="M5 9v10M12 9v10M19 9v10" /><path d="M3 19h18" /></>,
    links: [
      { t: 'India by Design Systems', href: '/design-systems' },
      { t: 'Temple in 3D', href: '/3d' },
      { t: 'Heritage sites', href: '/heritage/ranakpur-jain-temple' },
    ],
  },
  {
    label: 'Trust',
    icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    links: [
      { t: 'Every source', href: '/data' },
      { t: 'The register', href: '/register' },
      { t: 'References', href: classicHref('references'), ext: true },
    ],
  },
]

export default function SiteFooter() {
  return (
    <footer className="af">
      {/* newsletter */}
      <div className="af-news">
        <div>
          <p className="af-news-t">Follow the money to your district.</p>
          <p className="af-news-s">One email a month — what changed in the data, what got sourced, what&apos;s still a gap. No tracking.</p>
        </div>
        <form className="af-news-form" onSubmit={undefined}>
          <input type="email" placeholder="your@email.in" aria-label="Email" className="af-input" />
          <button type="button" className="af-sub">Subscribe</button>
        </form>
      </div>

      {/* columns */}
      <div className="af-cols">
        <div>
          <div style={{ color: '#f0e6d0' }}><BharatLogo size={44} tagline="INDIC DESIGNS" /></div>
          <p className="af-tag">Sourced, or it&apos;s a gap — never fabricated.</p>
        </div>
        {COLS.map((col) => (
          <nav key={col.label} aria-label={col.label} className="af-col">
            <span className="af-col-h">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{col.icon}</svg>
              {col.label}
            </span>
            {col.links.map((l) =>
              l.ext
                ? <a key={l.t} href={l.href}>{l.t}</a>
                : <Link key={l.t} href={l.href}>{l.t}</Link>
            )}
          </nav>
        ))}
      </div>

      {/* sawtooth band */}
      <div className="af-saw" aria-hidden="true" />

      {/* baseline */}
      <div className="af-base">
        <span>© 2026 Bharat · Indic Designs · independent project</span>
        <span className="af-scripts">भ ভ ਭ ભ ଭ భ ಭ ഭ</span>
        <span className="af-credo">● SOURCED — OR IT&apos;S A GAP</span>
      </div>

      <style>{`
        .af { background: #38221a; color: #f0e6d0; font-family: var(--font-ui); }
        .af a { color: #f0e6d0; text-decoration: none; }
        .af a:hover { color: var(--band); }
        .af-news { max-width: 1240px; margin: 0 auto; padding: 34px var(--edge); display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; border-bottom: 1px solid color-mix(in srgb, var(--band) 35%, transparent); }
        .af-news-t { font-family: 'Rozha One', var(--font-display); font-size: 24px; margin: 0; }
        .af-news-s { font-size: 13px; color: rgba(240,230,208,.65); margin: 6px 0 0; max-width: 52ch; }
        .af-news-form { display: flex; }
        .af-input { background: transparent; border: 1.5px solid rgba(240,230,208,.4); color: #f0e6d0; padding: 11px 14px; font: 400 14px var(--font-ui); min-width: 210px; outline: none; }
        .af-sub { background: var(--band); color: #2a1610; border: 0; padding: 11px 20px; font: 700 14px var(--font-ui); cursor: pointer; }
        .af-cols { max-width: 1240px; margin: 0 auto; padding: 40px var(--edge) 46px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 38px 30px; }
        .af-tag { font-style: italic; font-size: 13.5px; color: rgba(240,230,208,.75); margin: 16px 0 0; }
        .af-col { display: flex; flex-direction: column; gap: 9px; }
        .af-col-h { display: inline-flex; align-items: center; gap: 7px; font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase; color: var(--band); border-bottom: 1px solid color-mix(in srgb, var(--band) 40%, transparent); padding-bottom: 8px; margin-bottom: 4px; }
        .af-col a { font-size: 14px; line-height: 22px; }
        .af-saw { height: 10px; background-image: conic-gradient(from 135deg at 50% 0%, color-mix(in srgb, var(--band) 55%, transparent) 0deg 90deg, transparent 90deg 360deg); background-size: 14px 10px; background-repeat: repeat-x; }
        .af-base { max-width: 1240px; margin: 0 auto; padding: 16px var(--edge) 22px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; font-size: 12.5px; color: rgba(240,230,208,.6); border-top: 1px solid color-mix(in srgb, var(--band) 30%, transparent); }
        .af-scripts { font-size: 15px; letter-spacing: .4em; color: rgba(240,230,208,.8); }
        .af-credo { font-size: 10.5px; letter-spacing: .12em; color: var(--band); }
      `}</style>
    </footer>
  )
}
