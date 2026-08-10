import type { Metadata } from 'next'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import Icon, { Chakra, type IconName } from '@/components/icon'
import { Field, Segmented, Loading, EmptyState, ErrorState, Toast, Dialog } from '@/components/ui'

// The design-system reference — mockups 2a (icon set) + 3a (atomic tiers). A living
// page: every colour, type and icon is drawn from the same tokens the app ships.
export const metadata: Metadata = {
  title: 'Design system — carved from artefacts · Bharat',
  description: 'The Mauryan atomic design system: colour, type, the icon set drawn from period artefacts, and the component molecules — all from the shipped tokens.',
}

// the 12 stroke icons + their role (2a)
const ICONS: { name: IconName | 'chakra'; role: string }[] = [
  { name: 'chakra', role: 'live · loading' },
  { name: 'pillar', role: 'engines · structure' },
  { name: 'lotus', role: 'heritage · culture' },
  { name: 'bell', role: 'foundations · base' },
  { name: 'edict', role: 'sources · provenance' },
  { name: 'coin', role: 'money flow' },
  { name: 'lion', role: 'the mark · north' },
  { name: 'elephant', role: 'east · scale' },
  { name: 'bull', role: 'west · land' },
  { name: 'horse', role: 'south · movement' },
  { name: 'stupa', role: 'heritage sites' },
  { name: 'torana', role: 'gateways · nav' },
]

const COINS: IconName[] = ['sun', 'sixarm', 'chaitya', 'tree']

const SWATCHES: { c: string; label: string; cta?: boolean }[] = [
  { c: 'var(--paper)', label: '--background' },
  { c: '#262320', label: '--brand' },
  { c: 'var(--gold)', label: '--accent CTA', cta: true },
  { c: '#ffe0d9', label: '--accent-tint' },
  { c: 'var(--stone)', label: 'stone' },
  { c: 'var(--sky)', label: 'sky' },
  { c: '#2d2b2b', label: 'maroon' },
  { c: '#ec3013', label: 'gold-leaf' },
  { c: '#ec3013', label: 'gupta-stone' },
  { c: 'var(--good)', label: '--positive' },
]

export default function DesignPage() {
  return (
    <>
      <SiteHeader />

      <main className="ds" style={{ maxWidth: 'var(--wrap)', margin: '0 auto' }}>
        {/* header */}
        <div className="ds-head">
          <Chakra size={28} className="ds-head-chakra" />
          <h1 className="ds-title">Mauryan Atomic Design System</h1>
          <span className="ds-head-sub">carved from artefacts · organised in tiers</span>
          <span className="ds-live mono">LIVE FROM TOKENS</span>
        </div>

        {/* TIER 01 — atoms */}
        <div className="ds-tier">
          <div className="ds-tier-l"><div className="ds-tier-n mono">TIER 01</div><div className="ds-tier-name">Atoms</div></div>
          <div className="ds-tier-body">
            <div>
              <div className="ds-h mono">COLOUR — HOUSE · MAURYAN · GUPTA</div>
              <div className="ds-swatches">
                {SWATCHES.map((s) => (
                  <div key={s.label} className="ds-swatch">
                    <div className="ds-chip" style={{ background: s.c, outline: s.cta ? '2px solid var(--ink)' : undefined, outlineOffset: 2 }} />
                    <div className="ds-chip-l mono" style={{ color: s.cta ? 'var(--gold-700)' : 'var(--muted)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <p className="ds-note">One CTA colour everywhere: <strong style={{ color: 'var(--gold-700)' }}>amber-gold #ec3013</strong> (hover #ae1800). Sky = data/nav; maroon + gold-leaf = dark register.</p>
            </div>

            <div>
              <div className="ds-h mono">TYPE</div>
              <div style={{ font: '600 20px var(--font-serif)' }}>Fraunces — display, carved</div>
              <div style={{ font: 'italic 400 15px var(--font-italic)', color: 'var(--muted)' }}>Instrument Serif — the italic voice</div>
              <div style={{ font: '400 13px var(--font-ui)', marginTop: 2 }}>Archivo — body, legibility over flourish</div>
              <div className="mono" style={{ font: '600 11px var(--font-mono)', letterSpacing: '.1em', marginTop: 3, color: 'var(--gold-700)' }}>JETBRAINS MONO — DATA · EYEBROWS · ₹74,427 CR</div>
            </div>
          </div>
        </div>

        {/* the icon set (2a) */}
        <div className="ds-tier">
          <div className="ds-tier-l"><div className="ds-tier-n mono">ICONS</div><div className="ds-tier-name">The set</div></div>
          <div className="ds-icons-body">
            <div className="ds-h mono">12 STROKE ICONS · 32PX GRID · 1.6PX INCISED LINE · CURRENTCOLOR</div>
            <div className="ds-grid">
              {ICONS.map((ic) => (
                <div key={ic.name} className="ds-cell">
                  {ic.name === 'chakra' ? <Chakra size={34} /> : <Icon name={ic.name as IconName} size={34} />}
                  <div className="ds-cell-l mono">{ic.name}<br /><span className="muted">{ic.role}</span></div>
                </div>
              ))}
            </div>
            <div className="ds-coins">
              <div className="ds-h mono" style={{ margin: '18px 0 10px' }}>PUNCH-MARKED KARSHAPANA SYMBOLS — THE COINS MONEY ITSELF CARRIED</div>
              <div className="ds-coin-row">
                {COINS.map((c) => <Icon key={c} name={c} size={30} className="ds-coin" />)}
                <span className="ds-note" style={{ marginLeft: 8 }}>sun · six-armed · chaitya hill · tree-in-railing</span>
              </div>
            </div>
            <p className="ds-note">Original stylised drawings — never the official State Emblem. The four capital animals map to the compass.</p>
          </div>
        </div>

        {/* TIER 02 — molecules */}
        <div className="ds-tier">
          <div className="ds-tier-l"><div className="ds-tier-n mono">TIER 02</div><div className="ds-tier-name">Molecules</div></div>
          <div className="ds-mol-body">
            <button className="btn btn-primary"><Icon name="coin" size={16} />Open the ledger</button>
            <button className="btn btn-secondary"><Icon name="edict" size={16} />Audit figures</button>
            <span className="tag tag-gold">T1 · GAZETTE</span>
            <span className="ds-gap mono">GAP — DECLARED</span>
            <span className="ds-freeze"><span className="ds-freeze-dot" />fund-freeze</span>
            <span className="ds-spin"><Chakra size={18} className="ds-spin-chakra" />chakra = spinner &amp; live dot</span>
          </div>
        </div>

        {/* forms (6a) */}
        <div className="ds-tier">
          <div className="ds-tier-l"><div className="ds-tier-n mono">FORMS</div><div className="ds-tier-name">Controls</div></div>
          <div className="ds-forms-body">
            <Field label="Text field" placeholder="Search a district…" />
            <Field label="Focused" value="Birbhum" hint=":focus-visible" />
            <Field label="Error" value="Bombaay" error={'No district by that name — try "Greater Bombay".'} />
            <Field label="Disabled" placeholder="Sub-district (pick a district first)" disabled />
            <div><div className="ds-h mono" style={{ marginBottom: 8 }}>SEGMENTED</div><Segmented options={['Map', 'List', 'Chart']} value="Map" /></div>
          </div>
        </div>

        {/* states (6b) */}
        <div className="ds-tier">
          <div className="ds-tier-l"><div className="ds-tier-n mono">STATES</div><div className="ds-tier-name">Feedback</div></div>
          <div className="ds-states-body">
            <Loading />
            <EmptyState action={<span className="ds-empty-cta">Help source it →</span>} />
            <ErrorState />
            <Toast icon="coin" undo>Query saved — link copied to clipboard</Toast>
            <Dialog title="Share this exact view?" body="The URL carries your layers, filters and zoom — anyone opening it sees what you see." confirm="Copy the link" cancel="Cancel" />
          </div>
        </div>
      </main>

      <SiteFooter />

      <style>{`
        .ds { background: var(--paper); }
        .ds-head { display: flex; align-items: center; gap: 14px; padding: 24px var(--edge) 18px; border-bottom: 2px solid var(--line-strong); flex-wrap: wrap; }
        .ds-head-chakra { color: var(--gold); }
        .ds-title { font: 600 clamp(22px,3.5vw,28px) var(--font-serif); margin: 0; }
        .ds-head-sub { font: italic 400 15px var(--font-italic); color: var(--muted); }
        .ds-live { margin-left: auto; font-size: 10px; letter-spacing: .14em; color: var(--gold-700); background: #ffe0d9; padding: 3px 8px; }
        .ds-tier { display: grid; grid-template-columns: 120px 1fr; border-bottom: 1px solid var(--line); }
        .ds-tier-l { padding: 20px; border-right: 2px solid var(--line-strong); background: #ffe0d9; }
        .ds-tier-n { font-size: 10px; letter-spacing: .16em; color: var(--gold-700); }
        .ds-tier-name { font: 600 17px var(--font-serif); margin-top: 3px; }
        .ds-tier-body { padding: 18px 26px; display: flex; gap: 30px; flex-wrap: wrap; }
        .ds-h { font-size: 9.5px; letter-spacing: .14em; color: var(--muted); margin-bottom: 7px; }
        .ds-swatches { display: flex; flex-wrap: wrap; }
        .ds-swatch { width: 56px; }
        .ds-chip { height: 36px; }
        .ds-chip-l { font-size: 8.5px; margin-top: 6px; }
        .ds-note { font: 400 10.5px var(--font-ui); color: var(--muted); margin-top: 8px; max-width: 60ch; }
        .ds-icons-body { padding: 18px 26px; }
        .ds-grid { display: grid; grid-template-columns: repeat(6, 1fr); border-top: 2px solid var(--line-strong); margin-top: 8px; }
        .ds-cell { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 22px 10px 16px; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); color: var(--ink); }
        .ds-cell:nth-child(6n) { border-right: 0; }
        .ds-cell-l { font-size: 10.5px; letter-spacing: .08em; text-align: center; }
        .ds-coin-row { display: flex; align-items: center; gap: 12px; color: var(--gold-700); }
        .ds-mol-body { padding: 18px 26px; display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
        .ds-gap { font-size: 10px; letter-spacing: .12em; border: 1px solid #bab6b6; color: var(--muted); padding: 3px 9px; }
        .ds-freeze { display: flex; align-items: center; gap: 6px; font: 600 11px var(--font-ui); color: var(--maroon); }
        .ds-freeze-dot { width: 9px; height: 9px; border: 2px solid var(--maroon); border-radius: 50%; }
        .ds-spin { display: flex; align-items: center; gap: 8px; font: 400 11px var(--font-ui); color: var(--muted); }
        .ds-spin-chakra { color: var(--gold); animation: chakra-spin 12s linear infinite; }
        .ds-forms-body { padding: 18px 26px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px 22px; align-items: start; }
        .ds-states-body { padding: 18px 26px; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; align-items: start; }
        .ds-empty-cta { display: inline-block; border: 1.5px solid var(--ink); font: 600 11px var(--font-ui); padding: 7px 12px; cursor: pointer; }
        .ds-empty-cta:hover { background: rgba(42,32,24,.06); }
        @media (max-width: 820px) {
          .ds-tier { grid-template-columns: 1fr; }
          .ds-tier-l { border-right: 0; border-bottom: 2px solid var(--line-strong); }
          .ds-grid { grid-template-columns: repeat(3, 1fr); }
          .ds-cell:nth-child(6n) { border-right: 1px solid var(--line); }
          .ds-cell:nth-child(3n) { border-right: 0; }
        }
      `}</style>
    </>
  )
}
