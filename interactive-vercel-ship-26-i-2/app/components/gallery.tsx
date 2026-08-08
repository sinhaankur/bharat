'use client'

import { Button, Input, Checkbox, Badge, Eyebrow, Label, Divider, Icon } from '@/components/ui-kit/atoms'
import { SearchField, LabeledField, StatBlock, Meter, TagRow, CardHeader } from '@/components/ui-kit/molecules'
import { StoryCard, DataTable, SectionHeader, StatBand, Toolbar } from '@/components/ui-kit/organisms'
import Chakra from '@/components/indic/chakra'
import { Lotus } from '@/components/indic/lotus'
import LionMark from '@/components/indic/lion-mark'
import { Shikhara, Gavaksha, GavakshaBand, PurnaKalasha, Kirtimukha, ToranaFrame } from '@/components/indic/gupta'

// The living design-system gallery (Atomic Design · documentation hub).
// Shows every layer — atoms → molecules → organisms — with live previews.
export default function Gallery() {
  return (
    <div className="theme-ashoka min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="mx-auto max-w-5xl px-4 pb-6 pt-12">
        <div className="flex items-center gap-2">
          <LionMark size={40} color="var(--stone-ink)" />
          <Eyebrow>Bharat design system · atomic</Eyebrow>
        </div>
        <h1 className="mt-2 font-serif text-4xl font-black md:text-5xl">The component library</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted-foreground)]">
          Atoms → molecules → organisms, built on the Mauryan/Gupta tokens. Every piece is self-contained,
          token-driven, and keyboard-accessible. This page is the living documentation hub.
        </p>
      </header>

      <main className="mx-auto max-w-5xl space-y-14 px-4 pb-24">
        {/* ATOMS */}
        <section>
          <SectionHeader n="1" kicker="Layer 1" title="Atoms" />
          <div className="grid gap-6 md:grid-cols-2">
            <Demo label="Buttons">
              <div className="flex flex-wrap gap-2">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </Demo>
            <Demo label="Input · Checkbox">
              <Input placeholder="Text input…" />
              <label className="mt-3 flex items-center gap-2 text-sm">
                <Checkbox defaultChecked /> Sourced, or a gap
              </label>
            </Demo>
            <Demo label="Badges">
              <div className="flex flex-wrap gap-2">
                <Badge tone="accent">Accent</Badge>
                <Badge tone="neutral">Neutral</Badge>
                <Badge tone="success">Sourced</Badge>
                <Badge tone="warn">Debated</Badge>
                <Badge tone="danger">Contested</Badge>
                <Badge tone="outline">Unrated</Badge>
              </div>
            </Demo>
            <Demo label="Eyebrow · Divider · Indic icons">
              <Eyebrow>News · India · live</Eyebrow>
              <Divider className="my-3" />
              <div className="flex items-center gap-4">
                <Chakra size={28} color="var(--accent)" />
                <Chakra size={22} color="var(--accent)" spin />
                <Lotus size={30} color="var(--accent)" />
                <LionMark size={30} color="var(--stone-ink)" />
              </div>
            </Demo>
          </div>
        </section>

        {/* MOLECULES */}
        <section>
          <SectionHeader n="2" kicker="Layer 2" title="Molecules" />
          <div className="grid gap-6 md:grid-cols-2">
            <Demo label="Search field">
              <SearchField placeholder="Search the atlas…" />
            </Demo>
            <Demo label="Labeled field">
              <LabeledField id="q" label="District" hint="Type a district name" placeholder="e.g. Ranchi" />
            </Demo>
            <Demo label="Stat block">
              <div className="grid grid-cols-2 gap-3">
                <StatBlock value="594" label="Districts" />
                <StatBlock value="100%" label="Sourced or gap" />
              </div>
            </Demo>
            <Demo label="Meter · Tag row">
              <Meter value={72} label="Data coverage" color="var(--accent)" />
              <TagRow className="mt-3" tags={[{ label: 'Center', tone: 'neutral' }, { label: 'Public', tone: 'outline' }, { label: 'Long-haul', tone: 'accent' }]} />
            </Demo>
            <Demo label="Card header">
              <CardHeader kicker="History" title="Ancient India, on one spine" meta="updated today · interactive" />
            </Demo>
          </div>
        </section>

        {/* GUPTA ORNAMENTS (from documented temple forms) */}
        <section>
          <SectionHeader n="G" kicker="Heritage layer · sourced from Gupta temples" title="Gupta ornaments" />
          <div className="grid gap-6 md:grid-cols-2">
            <Demo label="Shikhara · gavaksha · kirtimukha (var(--gupta-stone))">
              <div className="flex items-end gap-6" style={{ color: 'var(--gupta-stone)' }}>
                <Shikhara size={44} />
                <Gavaksha size={36} />
                <Kirtimukha size={44} />
                <PurnaKalasha size={44} />
              </div>
            </Demo>
            <Demo label="Gavaksha band (chaitya-arch cornice)">
              <GavakshaBand color="var(--gupta-stone)" height={26} />
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">the horseshoe-window frieze — a section divider</p>
            </Demo>
            <Demo label="Torana doorway frame — wraps content">
              <ToranaFrame color="var(--gupta-stone)">
                <p className="text-center font-serif text-lg">Read a source text</p>
                <p className="text-center text-sm text-[var(--muted-foreground)]">framed like a temple doorway</p>
              </ToranaFrame>
            </Demo>
            <Demo label="Ajanta palette (fresco jewel-tones)">
              <div className="flex flex-wrap gap-2">
                {[['gupta-stone', '#c8664a'], ['ajanta-ochre', '#c68a2e'], ['ajanta-red', '#9e3b2e'], ['ajanta-green', '#4f6b45'], ['ajanta-lapis', '#2a4a7a'], ['ajanta-ivory', '#efe3cc'], ['halo-gold', '#cba233']].map(([n, hex]) => (
                  <div key={n} className="text-center">
                    <div className="h-10 w-10 rounded-sm border border-[var(--border)]" style={{ background: `var(--${n})` }} />
                    <div className="mt-1 font-mono text-[8px] text-[var(--muted-foreground)]">{hex}</div>
                  </div>
                ))}
              </div>
            </Demo>
          </div>
        </section>

        {/* ORGANISMS */}
        <section>
          <SectionHeader n="3" kicker="Layer 3" title="Organisms" />
          <div className="space-y-6">
            <Demo label="Toolbar">
              <Toolbar />
            </Demo>
            <Demo label="Stat band">
              <StatBand
                stats={[
                  { value: '594', label: 'Districts' },
                  { value: '16', label: 'News outlets' },
                  { value: '4', label: 'Engines' },
                  { value: '0', label: 'Fabricated' },
                ]}
              />
            </Demo>
            <Demo label="Story cards">
              <div className="grid gap-4 md:grid-cols-2">
                <StoryCard
                  kicker="History"
                  title="Ashoka’s rule of the land"
                  dek="An empire read from its own edicts — a ruler you can verify because the script was deciphered."
                  meta="interactive map"
                  tags={[{ label: 'Mauryan' }, { label: 'Edicts' }]}
                  featured
                />
                <StoryCard
                  kicker="Languages"
                  title="Every language & script of Bharat"
                  dek="Two family trees kept apart — Indo-Aryan vs Dravidian — with self-hosted fonts."
                  meta="hub"
                  tags={[{ label: 'Brahmi' }, { label: 'Fonts' }]}
                />
              </div>
            </Demo>
            <Demo label="Data table">
              <DataTable
                caption="Sample — states by a dimension"
                columns={[
                  { key: 'state', label: 'State' },
                  { key: 'lean', label: 'Family' },
                  { key: 'v', label: 'Value', align: 'right' },
                ]}
                rows={[
                  { state: 'Maharashtra', lean: 'Indo-Aryan', v: '88' },
                  { state: 'Tamil Nadu', lean: 'Dravidian', v: '76' },
                  { state: 'West Bengal', lean: 'Indo-Aryan', v: '64' },
                ]}
              />
            </Demo>
          </div>
        </section>
      </main>
    </div>
  )
}

function Demo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="carved rounded-sm bg-[var(--card)] p-4">
      <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">{label}</div>
      {children}
    </div>
  )
}
