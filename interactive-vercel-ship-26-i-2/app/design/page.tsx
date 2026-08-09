import type { Metadata } from 'next'
import PageShell from '@/components/page-shell'
import Icon, { type IconName } from '@/components/indic/icon'
import TempleOrnament, { type OrnamentName } from '@/components/indic/ornament'
import MandalaButton from '@/components/indic/mandala-button'
import BrandSpecimen, { REGISTERS } from '@/components/indic/brand-specimen'

export const metadata: Metadata = {
  title: 'The Mauryan design system — Bharat',
  description:
    'The foundations of the Bharat design system: palette, carved-stone radius, the icon sprite, the Blender ornament library, typography and the register discipline. Downloadable.',
}

const SWATCHES: [string, string][] = [
  ['Paper', '#f8f4ea'],
  ['Card', '#fefcf6'],
  ['Ink', '#33251a'],
  ['Accent (CTA gold)', '#cc8900'],
  ['Accent hover', '#a06b00'],
  ['Stone', '#e7d8b8'],
  ['Sky (rare 2nd)', '#2f6f9e'],
  ['Gupta stone (red)', '#c8664a'],
  ['Ajanta green', '#4f6b45'],
  ['Ajanta lapis', '#2a4a7a'],
  ['Halo gold', '#cba233'],
  ['Maroon (dark bg)', '#1c1614'],
]

const ICONS: IconName[] = [
  'chakra', 'lotus', 'pillar', 'stupa', 'lion', 'elephant', 'bull', 'horse',
  'edict', 'jali', 'coin', 'torana', 'bell', 'sun', 'sixarm', 'chaitya', 'tree',
]

const ORNAMENTS: OrnamentName[] = ['mandala_ceiling', 'rosette', 'torana', 'capital', 'kalasha', 'jali-panel']

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ''

export default function DesignSystemPage() {
  return (
    <PageShell
      eyebrow="Design system · v1"
      title="Carved, not clicked"
      intro="One system, rooted in the Mauryan and Gupta world — stone palette, carved-stone corners, an icon sprite, and a Blender-rendered ornament library. Everything here is downloadable and version-controlled."
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-14">
        {/* palette */}
        <section className="mb-16 stone-reveal">
          <h2 className="bharati mb-2 text-2xl font-black tracking-tight">The palette</h2>
          <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
            Warm paper and umber ink; the house gold <code className="font-mono text-[var(--accent)]">#cc8900</code> is
            the only CTA colour. Blue is a rare secondary. Red-sandstone + Ajanta jewel-tones carry the Gupta “soul”.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {SWATCHES.map(([name, hex]) => (
              <div key={name} className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="h-16" style={{ background: hex }} />
                <div className="p-2">
                  <div className="text-xs font-semibold">{name}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{hex}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* the Indic spectrum — four registers */}
        <section className="mb-16 stone-reveal">
          <h2 className="bharati mb-2 text-2xl font-black tracking-tight">The Indic spectrum</h2>
          <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
            One system, four registers — each a one-sheet brand specimen. Mauryan is the skeleton;
            Gupta the soul; Kolam the dark modern grid; Indigo the warm textile-block register.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {REGISTERS.map((r) => (
              <BrandSpecimen key={r.id} r={r} />
            ))}
          </div>
        </section>

        {/* radius + rules */}
        <section className="mb-16 stone-reveal">
          <h2 className="bharati mb-2 text-2xl font-black tracking-tight">Stone, not plastic</h2>
          <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
            Corners stay tight — <strong>2px</strong> on cards and buttons. Rules are 2px incised, never hairline-soft.
            Cards carry a burnished “polish” top-edge.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="polish-edge rounded-[var(--radius)] border border-border bg-card px-6 py-4 text-sm font-semibold">
              Card · radius 2px
            </div>
            <button className="rounded-[var(--radius)] bg-[var(--accent)] px-6 py-3 text-sm font-bold uppercase tracking-widest text-[var(--accent-foreground)]">
              Button · 2px
            </button>
            <div className="rule-incised w-40" />
          </div>
        </section>

        {/* icon sprite */}
        <section className="mb-16 stone-reveal">
          <h2 className="bharati mb-2 text-2xl font-black tracking-tight">The icon sprite</h2>
          <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
            17 original stylised marks (never the official State Emblem) — currentColor-driven, one SVG sprite.
          </p>
          <div className="grid grid-cols-4 gap-4 sm:grid-cols-6 md:grid-cols-9">
            {ICONS.map((n) => (
              <div key={n} className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-3">
                <Icon name={n} size={28} className="text-[var(--foreground)]" />
                <span className="font-mono text-[9px] text-muted-foreground">{n}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ornament library */}
        <section className="mb-16 stone-reveal">
          <h2 className="bharati mb-2 text-2xl font-black tracking-tight">The ornament library</h2>
          <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
            Real temple forms, built as geometry in Blender and rendered to carved stone — not vectors.
          </p>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            {ORNAMENTS.map((n) => (
              <figure key={n} className="flex flex-col items-center rounded-lg border border-border bg-card p-4 text-center">
                <div className="flex h-28 items-center justify-center">
                  <TempleOrnament name={n} width={n === 'mandala_ceiling' ? 120 : 100} />
                </div>
                <figcaption className="mt-2 font-mono text-[10px] text-muted-foreground">{n}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* typography */}
        <section className="mb-16 stone-reveal">
          <h2 className="bharati mb-4 text-2xl font-black tracking-tight">Typography</h2>
          <div className="space-y-3 rounded-lg border border-border bg-card p-6">
            <div className="bharati text-4xl font-black">Bharati Inspired — display</div>
            <div className="text-xl" style={{ fontFamily: 'var(--font-libre-franklin)' }}>Libre Franklin — body text</div>
            <div className="font-mono text-sm text-muted-foreground">JetBrains / Geist Mono — data & labels</div>
            <div className="f-devanagari text-2xl">देवनागरी · अ आ इ ई</div>
            <div className="f-tamil text-2xl">தமிழ் · அ ஆ இ</div>
          </div>
        </section>

        {/* register discipline */}
        <section className="mb-16 stone-reveal">
          <h2 className="bharati mb-4 text-2xl font-black tracking-tight">Register discipline</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['Mauryan — skeleton', 'Stone + sky. Nav, map, data, structure. Austere, polished, imperial.'],
              ['Gupta — soul', 'Red sandstone + Ajanta jewel-tones. Long-form, heritage, culture. Ornate, devotional.'],
              ['Temple interior — dark', 'Maroon + gold-leaf. The 3D pages and the engines hub. Never both loud at once.'],
            ].map(([t, d]) => (
              <div key={t} className="rounded-lg border border-border bg-card p-4">
                <div className="mb-1 font-bold text-foreground">{t}</div>
                <p className="text-sm leading-relaxed text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* download */}
        <section className="stone-reveal flex flex-col items-center gap-4 rounded-2xl border border-border bg-card/60 p-10 text-center">
          <h2 className="bharati text-2xl font-black tracking-tight">Take it with you</h2>
          <p className="max-w-xl text-muted-foreground">
            The token layer, the icon sprite and the ornament renders are open and version-controlled.
            Download the core files or read the handoff.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={`${BASE}/mauryan-icons.svg`}
              download
              className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-[var(--accent)] px-6 py-3 text-sm font-bold uppercase tracking-widest text-[var(--accent-foreground)] transition-opacity hover:opacity-90"
            >
              <Icon name="chakra" size={16} /> Download icon sprite
            </a>
            <MandalaButton href="/components" variant="ghost">The component gallery</MandalaButton>
          </div>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-[var(--muted-foreground)]">
            © 2026 Bharat · design system v1
          </p>
        </section>
      </div>
    </PageShell>
  )
}
