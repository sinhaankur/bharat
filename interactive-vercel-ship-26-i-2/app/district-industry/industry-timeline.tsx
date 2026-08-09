'use client'

// "How this district industrialised" — an era-coded ownership-lineage timeline
// (from the Atlas Mockups, turn 7b). Munger, Bihar: three regimes in one district.
// Each entry carries founded · era · ownership lineage + a source tier badge.
import Icon from '@/components/indic/icon'

type Era = 'pre' | 'colonial' | 'psu' | 'liberal'
const ERA_COLOR: Record<Era, string> = {
  pre: '#a8794a',
  colonial: '#9e3b2e',
  psu: '#2a4a7a',
  liberal: '#00877f',
}
const ERA_LEGEND: [Era, string][] = [
  ['pre', 'Pre-colonial'],
  ['colonial', 'Colonial 1757–1947'],
  ['psu', 'Nehruvian PSU 1947–91'],
  ['liberal', 'Liberalisation 1991–'],
]

type Entry = {
  era: Era
  when: string
  title: string
  body: string
  tier: { label: string; kind: 'primary' | 'secondary' | 'provisional' | 'gap' }
}

const MUNGER: Entry[] = [
  {
    era: 'pre', when: '1762 · NAWABI', title: 'The Munger gun trade',
    body: "Mir Qasim moves his capital and arsenal to Munger — the gunsmith tradition that still defines the district's craft economy.",
    tier: { label: 'T3 ⚠', kind: 'provisional' },
  },
  {
    era: 'colonial', when: '1862 · EAST INDIA COMPANY → CROWN', title: 'Railway workshop, Jamalpur',
    body: 'Asia’s first full-scale railway workshop — the managing-agency era reaches the district.',
    tier: { label: 'T2', kind: 'secondary' },
  },
  {
    era: 'colonial', when: '1907 · BRITISH-OWNED', title: 'Imperial Tobacco (ITC), Munger',
    body: 'Asia’s first cigarette factory. Ownership lineage: Imperial Tobacco → managing agency (to 1970 abolition) → ITC Ltd.',
    tier: { label: 'T1 · GAZETTE', kind: 'primary' },
  },
  {
    era: 'psu', when: '1947–91 · STATE', title: 'The PSU consolidation',
    body: 'Rail workshop nationalised into Indian Railways; the private mills thin out — employment shifts to the state.',
    tier: { label: 'GAP — plant-level ₹', kind: 'gap' },
  },
]

function TierBadge({ tier }: { tier: Entry['tier'] }) {
  const styles: Record<string, string> = {
    primary: 'bg-[#f7ecd2] text-[#a06b00]',
    secondary: 'bg-[var(--muted)] text-[var(--muted-foreground)]',
    provisional: 'bg-[#f7ecd2] text-[#a06b00]',
    gap: 'border border-[var(--border)] text-[var(--muted-foreground)]',
  }
  return (
    <span className={`ml-1 whitespace-nowrap rounded-[2px] px-1.5 py-0.5 font-mono text-[9.5px] font-semibold ${styles[tier.kind]}`}>
      {tier.label}
    </span>
  )
}

export default function IndustryTimeline() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      {/* legend */}
      <div className="mb-8 flex flex-wrap gap-x-5 gap-y-2 stone-reveal">
        {ERA_LEGEND.map(([era, label]) => (
          <span key={era} className="flex items-center gap-1.5 font-mono text-[9.5px] font-semibold uppercase tracking-widest text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: ERA_COLOR[era] }} />
            {label}
          </span>
        ))}
      </div>

      {/* the timeline */}
      <div className="relative pl-7 stone-reveal">
        <div
          className="absolute left-2 top-1 bottom-2 w-[3px]"
          style={{ background: 'linear-gradient(#a8794a 0 30%,#9e3b2e 30% 78%,#2a4a7a 78% 100%)' }}
        />
        {MUNGER.map((e, i) => (
          <div key={i} className={`relative ${i < MUNGER.length - 1 ? 'pb-5' : ''}`}>
            <span
              className="absolute -left-[24px] top-1 h-[13px] w-[13px] rounded-full border-[2.5px] border-background"
              style={{ background: ERA_COLOR[e.era] }}
            />
            <div className="font-mono text-[11px] font-semibold" style={{ color: ERA_COLOR[e.era] }}>{e.when}</div>
            <div className="text-[15px] font-bold text-foreground" style={{ fontFamily: 'var(--font-playfair), serif' }}>{e.title}</div>
            <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
              {e.body}
              <TierBadge tier={e.tier} />
            </p>
          </div>
        ))}
      </div>

      {/* footer note */}
      <div className="mt-8 flex items-center gap-3 border-t border-border pt-5 text-[13px] leading-relaxed text-muted-foreground stone-reveal">
        <Icon name="coin" size={16} className="shrink-0 text-[var(--accent)]" />
        Every plant carries founded · era · ownership lineage — the colonial managing-agency system
        controlled roughly three-quarters of Indian industry until it was abolished in 1970.
      </div>
    </div>
  )
}
