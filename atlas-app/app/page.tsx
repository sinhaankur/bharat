import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import AtlasMap from '@/components/atlas-map'
import Reveal from '@/components/reveal'
import { Chakra } from '@/components/icon'

// The atlas home — mockup 1a "Sunlit Monument": Modernist grid skeleton (2px rules,
// flush-left, 0 radius) carrying the Mauryan stone/sky/gold palette, jali texture,
// and chakra. Hero → stat row → the colour-the-map panel → register strip.

const STATS: { n: string; label: string; sky?: boolean }[] = [
  { n: '35', label: 'states & UTs' },
  { n: '594', label: 'districts' },
  { n: '~6,800', label: 'sub-district blocks' },
  { n: '7', label: 'engines', sky: true },
]

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main style={{ maxWidth: 'var(--wrap)', margin: '0 auto' }}>
        {/* ── hero ── */}
        <section
          style={{
            position: 'relative',
            padding: '34px var(--edge) 26px',
            borderBottom: '2px solid var(--line-strong)',
          }}
        >
          <svg className="hero-jali" aria-hidden="true"><rect width="100%" height="100%" fill="url(#jali)" /></svg>

          <Reveal>
            <div style={{ position: 'relative', maxWidth: 820 }}>
              <div className="kicker" style={{ marginBottom: 10 }}>Sourced — or it&apos;s an explicit gap</div>
              <h1 style={{ font: '800 clamp(30px,5vw,44px)/1.05 var(--font-ui)', margin: '0 0 14px', letterSpacing: '-.01em' }}>
                Money, land, and law — side by side for 594 districts.
              </h1>
              <p style={{ font: '400 16px/1.5 var(--font-ui)', color: 'var(--muted)', margin: 0, maxWidth: 620 }}>
                Where public money flows, what the land allows, and the health and wealth of the people on it.
                Every figure cites a public source; a missing number is shown as a gap, never guessed.
              </p>
            </div>
          </Reveal>

          {/* stat row */}
          <div
            style={{
              position: 'relative',
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              marginTop: 28, borderTop: '2px solid var(--line-strong)',
            }}
            className="stat-row"
          >
            {STATS.map((s, i) => (
              <div
                key={s.label}
                style={{
                  padding: '16px 18px 0',
                  borderRight: i < STATS.length - 1 ? '1px solid var(--line)' : undefined,
                }}
              >
                <div style={{ font: '800 clamp(24px,4vw,30px) var(--font-ui)', color: s.sky ? 'var(--sky)' : 'var(--ink)' }}>{s.n}</div>
                <div style={{ font: '500 11px var(--font-ui)', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── the map ── */}
        <AtlasMap />

        {/* ── register strip ── */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '12px var(--edge)', borderTop: '2px solid var(--line-strong)',
            font: '500 11px var(--font-ui)', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)',
          }}
        >
          <Chakra size={14} className="strip-chakra" />
          <span>Mauryan register — stone &amp; sky · Modernist grid skeleton · jali as light texture</span>
        </div>
      </main>

      <SiteFooter />

      <style>{`
        .hero-jali { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
        .strip-chakra { color: #a8794a; }
        @media (max-width: 620px) {
          .stat-row { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </>
  )
}
