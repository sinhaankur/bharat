import type { Metadata } from 'next'
import Link from 'next/link'
import Chakra from '@/components/indic/chakra'
import LionMark from '@/components/indic/lion-mark'
import JaliBackground from '@/components/indic/jali'
import { ToranaFrame, GavakshaBand, Shikhara, Gavaksha, PurnaKalasha, Kirtimukha } from '@/components/indic/gupta'
import { Lotus, FloralBand } from '@/components/indic/lotus'
import ParallaxBackground from '@/components/indic/parallax-bg'
import { BharatMark } from '@/components/indic/bharat-logo'
import Mandala from '@/components/indic/mandala'
import TempleOrnament from '@/components/indic/ornament'
import RevealObserver from '@/components/indic/reveal-observer'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import { Button, Badge, Input, Eyebrow } from '@/components/ui-kit/atoms'
import { SearchField, StatBlock, Meter } from '@/components/ui-kit/molecules'
import { StoryCard, StatBand } from '@/components/ui-kit/organisms'

export const metadata: Metadata = {
  title: 'Mauryan design language — Bharat',
  description:
    'A design language rooted in the Mauryan / Ashokan visual world: sandstone, the Lion Capital, the Dharmachakra, Brahmi, and Indic jali lattice.',
}

const SWATCHES: [string, string, string][] = [
  ['Sunlit sandstone', 'var(--stone)', '#e9ddc7'],
  ['Stone shadow', 'var(--stone-2)', '#dcccae'],
  ['Stone ink', 'var(--stone-ink)', '#2a2018'],
  ['Indian sky blue (accent)', 'var(--sky)', '#3078c0'],
  ['Deep sky', 'var(--sky-deep)', '#245c98'],
  ['Warm ochre', 'var(--ochre)', '#a8794a'],
  ['Temple maroon', 'var(--maroon)', '#301818'],
  ['Blush neutral', 'var(--blush)', '#f0c0a8'],
]

export default function MauryanPage() {
  // this page forces the Ashoka theme on itself
  return (
    <div className="cine-grain theme-ashoka min-h-screen bg-background text-foreground">
      <RevealObserver />
      <SiteHeader />
      {/* masthead — Blender shikhara + jali light + PARALLAX ornament garden */}
      <header className="cine-vignette relative overflow-hidden border-b-2 border-[var(--stone-ink)]/20">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.14]"
          style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_BASE_PATH || ''}/backgrounds/shikhara_light.webp)` }}
          aria-hidden="true"
        />
        <ParallaxBackground />
        {/* the mandala — center of focus, wide behind the wordmark (bleeds past the sides) */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden="true">
          <Mandala
            size={960}
            opacity={0.12}
            accent="var(--accent)"
            ink="var(--muted-foreground)"
            className="w-[130vw] max-w-none md:w-[1100px]"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--background)]" aria-hidden="true" />
        <JaliBackground color="var(--ochre)" opacity={0.1} className="jali-drift" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 py-20 text-center">
          <BharatMark size={72} color="var(--accent)" ink="var(--stone-ink)" />
          <div className="mt-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--sky-deep)]">
            <Chakra size={14} color="var(--ochre)" /> Mauryan design language · c. 250 BCE
          </div>
          {/* set in our own Bharati Inspired font */}
          <h1 className="bharati mt-3 text-5xl font-black tracking-tight md:text-7xl">
            Bharat<span className="text-[var(--accent)]">.</span>
          </h1>
          <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">
            An interface language carved from the Ashokan world — sandstone and ochre, the Lion Capital, the
            twenty-four-spoke Dharmachakra, Brahmi, and the geometry of the jali screen.
          </p>
          <p className="mt-4 f-brahmi text-3xl text-[var(--stone-ink)]/70" aria-hidden="true">
            𑀪𑀸𑀭𑀢
          </p>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            © 2026 Bharat · Mauryan design language · all rights reserved
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 md:px-6 py-14">
        {/* Blender-rendered ornaments — carved stone, not vectors */}
        <Section n="0" title="Carved in Blender — the ornament library">
          <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            These are not clip-art or vectors. Each ornament is a temple form we{' '}
            <em>built as geometry</em> in Blender — spun, extruded, lit with a raking key
            light like real relief — and rendered to stone. The same forms that crown an
            Ashokan pillar or frame a Sanchi gateway, rebuilt so they can breathe on a screen.
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {(
              [
                ['rosette', 'Lotus rosette', 'The ceiling padma — a radiating medallion, the sun-lotus of the sanctum roof.'],
                ['torana', 'Torana gateway', 'The gateway of Sanchi — twin posts, a stepped architrave, an arch in the opening.'],
                ['capital', 'Lotiform capital', 'The bell that heads a stambha — a campaniform lotus spun into stone.'],
              ] as const
            ).map(([n, title, desc]) => (
              <figure
                key={n}
                className="polish-edge lift group flex flex-col items-center rounded-lg border border-border bg-card p-5 text-center"
              >
                <div className="flex h-44 items-center justify-center">
                  <TempleOrnament
                    name={n}
                    width={n === 'capital' ? 200 : 150}
                    spin={n === 'rosette'}
                    className="drop-shadow-sm transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <figcaption className="mt-3">
                  <div className="font-semibold">{title}</div>
                  <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>

        {/* palette */}
        <Section n="I" title="The palette — named for the stone">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SWATCHES.map(([name, v, hex]) => (
              <div key={name} className="polish-edge overflow-hidden rounded border border-border bg-card">
                <div className="h-16" style={{ background: v }} />
                <div className="p-2">
                  <div className="text-xs font-semibold">{name}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{hex}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* the chakra */}
        <Section n="II" title="The Dharmachakra — 24 spokes">
          <div className="flex flex-wrap items-center gap-8">
            <Chakra size={96} color="var(--sky)" />
            <Chakra size={64} color="var(--ochre)" spin />
            <Chakra size={40} color="var(--stone-ink)" />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              The wheel of the Ashoka pillars and the Indian flag. We use it as a divider, a loading spinner,
              a section mark, and the “live” dot — our own drawing, not the official emblem.
            </p>
          </div>
        </Section>

        {/* motifs as UI */}
        <Section n="III" title="Motifs as interface">
          <div className="grid gap-4 md:grid-cols-3">
            <MotifCard label="Lion mark">
              <LionMark size={56} color="var(--ochre)" />
              <span className="text-xs text-muted-foreground">the brand mark</span>
            </MotifCard>
            <MotifCard label="Jali lattice">
              <div className="relative h-16 w-full">
                <JaliBackground color="var(--sky)" opacity={0.5} />
              </div>
              <span className="text-xs text-muted-foreground">panel texture — light through a screen</span>
            </MotifCard>
            <MotifCard label="Chakra bullet">
              <ul className="space-y-1.5 text-left text-sm">
                {['Sourced, or a gap', 'Attributed, not asserted', 'Multi-actor, not one-sided'].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Chakra size={12} color="var(--ochre)" /> {t}
                  </li>
                ))}
              </ul>
            </MotifCard>
          </div>
        </Section>

        {/* edict-style typography, framed in a Gupta torana doorway */}
        <Section n="IV" title="Edict-style long form · Gupta doorway">
          <ToranaFrame color="var(--gupta-stone)">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--sky-deep)]">
              Major Rock Edict · in the manner of
            </div>
            <p className="font-serif text-lg leading-loose first-letter:float-left first-letter:mr-2 first-letter:font-black first-letter:text-5xl first-letter:text-[var(--gupta-stone)]">
              Thus speaks the record: what is set here is set to be seen and read, long after — carved plainly, so
              that the many may know it. Where a figure has a source, it is shown; where it does not, it is marked a
              gap. The framing is named as framing. So endures the discipline, as long as the moon and sun.
            </p>
          </ToranaFrame>
        </Section>

        {/* buttons */}
        <Section n="V" title="Controls">
          <div className="flex flex-wrap items-center gap-3">
            <button className="polish-edge rounded-[10px] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-foreground)]">
              Primary — ochre
            </button>
            <button className="rounded-[10px] border border-[var(--stone-ink)]/30 px-4 py-2 text-sm font-semibold">
              Ghost — incised
            </button>
            <button className="rounded-[10px] bg-[var(--sky)] px-4 py-2 text-sm font-semibold text-white">
              Chakra navy
            </button>
          </div>
        </Section>

        {/* GUPTA ornaments — the classical layer */}
        <Section n="VI" title="Gupta ornaments · the classical layer">
          <FloralBand color="var(--gupta-stone)" height={20} className="mb-4" />
          <div className="flex flex-wrap items-end gap-8" style={{ color: 'var(--gupta-stone)' }}>
            <figure className="text-center"><Shikhara size={40} /><figcaption className="mt-1 font-mono text-[9px] uppercase text-muted-foreground">shikhara</figcaption></figure>
            <figure className="text-center"><Gavaksha size={40} /><figcaption className="mt-1 font-mono text-[9px] uppercase text-muted-foreground">gavaksha</figcaption></figure>
            <figure className="text-center"><PurnaKalasha size={44} /><figcaption className="mt-1 font-mono text-[9px] uppercase text-muted-foreground">purna-kalasha</figcaption></figure>
            <figure className="text-center"><Kirtimukha size={48} /><figcaption className="mt-1 font-mono text-[9px] uppercase text-muted-foreground">kirtimukha</figcaption></figure>
            <figure className="text-center"><Lotus size={44} color="var(--accent)" /><figcaption className="mt-1 font-mono text-[9px] uppercase text-muted-foreground">lotus</figcaption></figure>
          </div>
        </Section>

        {/* ATOMIC DESIGN × INDIA — the system, layer by layer */}
        <Section n="VII" title="Atomic Design × India · Atoms">
          <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
            The smallest pieces — buttons, inputs, badges — dressed in the Mauryan/Gupta tokens. Curved,
            carved, warm.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <MotifCard label="Buttons · curved">
              <div className="flex flex-wrap gap-2">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </MotifCard>
            <MotifCard label="Badges · sourced-or-gap">
              <div className="flex flex-wrap gap-2">
                <Badge tone="success">Sourced</Badge>
                <Badge tone="warn">Debated</Badge>
                <Badge tone="danger">Contested</Badge>
                <Badge tone="outline">Unrated</Badge>
              </div>
            </MotifCard>
          </div>
        </Section>

        <Section n="VIII" title="Atomic Design × India · Molecules">
          <div className="grid gap-4 md:grid-cols-3">
            <MotifCard label="Search field"><SearchField placeholder="Search the atlas…" /></MotifCard>
            <MotifCard label="Stat block"><StatBlock value="594" label="Districts" /></MotifCard>
            <MotifCard label="Meter"><Meter value={72} label="Data coverage" color="var(--accent)" /></MotifCard>
          </div>
        </Section>

        <Section n="IX" title="Atomic Design × India · Organisms">
          <StatBand stats={[{ value: '594', label: 'Districts' }, { value: '16', label: 'News outlets' }, { value: '5', label: 'Engines' }, { value: '0', label: 'Fabricated' }]} />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <StoryCard kicker="History" title="Ashoka’s rule of the land" dek="An empire read from its own edicts." meta="interactive map" tags={[{ label: 'Mauryan' }]} featured href="/ashoka" />
            <StoryCard kicker="Languages" title="Every language & script of Bharat" dek="Two family trees, one Brahmi root." meta="hub" tags={[{ label: 'Brahmi' }]} href="/languages" />
          </div>
          <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-widest text-[var(--muted-foreground)]">
            → the full library at <Link href="/components/" className="text-[var(--accent)] hover:underline">/components</Link>
          </p>
        </Section>

        <FloralBand color="var(--gupta-stone)" height={22} className="my-8" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          The Mauryan → Gupta design language (see <code>ASHOKA_DESIGN.md</code>), built on Atomic Design.
          The Lion Capital and Ashoka Chakra are India’s national emblems; the marks here are original stylised
          drawings, used respectfully — never the official emblem.
        </p>
      </main>
      <SiteFooter />
    </div>
  )
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--ochre)] font-mono text-xs text-[var(--sky-deep)]">
          {n}
        </span>
        <h2 className="font-serif text-2xl font-bold">{title}</h2>
        <div className="rule-incised flex-1" />
      </div>
      {children}
    </section>
  )
}

function MotifCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="polish-edge flex flex-col items-center gap-2 rounded border border-border bg-card p-4 text-center">
      <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      {children}
    </div>
  )
}
