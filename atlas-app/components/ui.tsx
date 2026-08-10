// The reusable UI kit — forms + states/feedback from mockups 6a/6b, on the Modernist
// × Mauryan tokens: gold focus ring, incised 1px borders, 0 radius, 44px min targets,
// hard offset shadows. Pure CSS-var styling, no external deps.
import type { ReactNode } from 'react'
import Icon from '@/components/icon'
import { Chakra } from '@/components/icon'

// ── Field ─────────────────────────────────────────────────────────────────
export function Field({
  label, value, placeholder, error, disabled, hint,
}: { label: string; value?: string; placeholder?: string; error?: string; disabled?: boolean; hint?: string }) {
  return (
    <div className="ui-field">
      <div className="ui-label" style={{ color: error ? 'var(--maroon)' : disabled ? 'var(--muted)' : undefined }}>{label}</div>
      <div
        className={`ui-input${error ? ' err' : ''}${disabled ? ' dis' : ''}`}
        aria-disabled={disabled}
      >
        {value || <span className="ui-ph">{placeholder}</span>}
      </div>
      {error && <div className="ui-err-msg">⚠ {error}</div>}
      {hint && !error && <div className="ui-hint mono">{hint}</div>}
      <style>{UI_CSS}</style>
    </div>
  )
}

// ── Segmented control ──
export function Segmented({ options, value }: { options: string[]; value: string }) {
  return (
    <div className="ui-seg" role="group">
      {options.map((o) => (
        <button key={o} className={`ui-seg-opt${o === value ? ' on' : ''}`} aria-pressed={o === value}>{o}</button>
      ))}
      <style>{UI_CSS}</style>
    </div>
  )
}

// ── State cards ──
export function Loading({ label = 'Reading the ledger…' }: { label?: string }) {
  return (
    <div className="ui-state">
      <div className="ui-state-h mono">LOADING — SKELETON + CHAKRA</div>
      <div className="ui-load-row"><Chakra size={18} className="ui-load-chakra" /><span className="ui-load-t">{label}</span></div>
      <div className="ui-skel" />
      <div className="ui-skel" style={{ width: '70%' }} />
      <style>{UI_CSS}</style>
    </div>
  )
}

export function EmptyState({ title = 'No sourced figure yet', body = "This cell is a declared gap — we don't guess.", action }: { title?: string; body?: string; action?: ReactNode }) {
  return (
    <div className="ui-state ui-empty">
      <div className="ui-state-h mono" style={{ textAlign: 'left' }}>EMPTY — AN HONEST GAP</div>
      <Icon name="bell" size={30} className="ui-empty-ic" />
      <div className="ui-empty-t">{title}</div>
      <div className="ui-empty-b">{body}</div>
      {action}
      <style>{UI_CSS}</style>
    </div>
  )
}

export function ErrorState({ title = "The map data didn't load", body = 'district-ledger.json timed out. Your query is kept.' }: { title?: string; body?: string }) {
  return (
    <div className="ui-state ui-error">
      <div className="ui-state-h mono" style={{ color: 'var(--maroon)' }}>ERROR — RECOVERABLE</div>
      <div className="ui-err-t">{title}</div>
      <div className="ui-err-b">{body}</div>
      <span className="ui-retry">Retry</span>
      <style>{UI_CSS}</style>
    </div>
  )
}

// ── Toast ──
export function Toast({ children, icon = 'coin', undo }: { children: ReactNode; icon?: 'coin' | 'edict'; undo?: boolean }) {
  return (
    <div className="ui-toast" role="status">
      <Icon name={icon} size={15} className="ui-toast-ic" />
      <span className="ui-toast-t">{children}</span>
      {undo && <span className="ui-toast-undo">Undo</span>}
      <style>{UI_CSS}</style>
    </div>
  )
}

// ── Dialog (static, top elevation) ──
export function Dialog({ kicker = 'DIALOG · TOP ELEVATION', title, body, confirm = 'Confirm', cancel = 'Cancel' }: { kicker?: string; title: string; body: string; confirm?: string; cancel?: string }) {
  return (
    <div className="ui-dialog">
      <div className="ui-dialog-in">
        <div className="ui-dialog-k mono">{kicker}</div>
        <div className="ui-dialog-t">{title}</div>
        <div className="ui-dialog-b">{body}</div>
      </div>
      <div className="ui-dialog-actions">
        <button className="btn btn-primary">{confirm}</button>
        <button className="btn btn-secondary">{cancel}</button>
      </div>
      <style>{UI_CSS}</style>
    </div>
  )
}

const UI_CSS = `
  .ui-field { min-width: 180px; }
  .ui-label { font: 600 11px var(--font-ui); margin-bottom: 6px; }
  .ui-input { border: 1px solid var(--line); background: var(--stone-2); padding: 11px 13px; font: 400 13px var(--font-ui); min-height: 44px; display: flex; align-items: center; }
  .ui-input:hover { border-color: var(--line-strong); }
  .ui-input.err { border: 1.5px solid var(--maroon); background: #ffe0d9; }
  .ui-input.dis { background: var(--stone-2); color: var(--muted); opacity: .45; }
  .ui-ph { color: var(--muted); }
  .ui-err-msg { font: 500 10.5px var(--font-ui); color: var(--maroon); margin-top: 4px; }
  .ui-hint { font-size: 10px; color: var(--muted); margin-top: 4px; }
  .ui-seg { display: inline-flex; border: 1.5px solid var(--ink); overflow: hidden; }
  .ui-seg-opt { padding: 10px 16px; min-height: 44px; border: 0; background: transparent; cursor: pointer; font: 600 12px var(--font-ui); color: var(--ink); }
  .ui-seg-opt:hover { background: rgba(204,137,0,.12); }
  .ui-seg-opt.on { background: var(--ink); color: var(--stone); }
  .ui-state { border: 1px solid var(--line); background: var(--stone-2); padding: 14px; }
  .ui-state-h { font-size: 10px; color: var(--muted); margin-bottom: 10px; }
  .ui-load-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .ui-load-chakra { color: var(--gold); animation: chakra-spin 3s linear infinite; }
  .ui-load-t { font: 600 12px var(--font-serif); }
  .ui-skel { height: 10px; background: linear-gradient(90deg, var(--stone-2) 25%, var(--stone) 50%, var(--stone-2) 75%); background-size: 200% 100%; animation: shimmer 1.4s linear infinite; margin-bottom: 6px; }
  .ui-empty { text-align: center; }
  .ui-empty-ic { color: #bab6b6; margin: 2px auto 6px; }
  .ui-empty-t { font: 600 13px var(--font-serif); }
  .ui-empty-b { font: 400 11px/1.5 var(--font-ui); color: var(--muted); margin: 4px 0 10px; }
  .ui-error { border: 1.5px solid var(--maroon); background: #ffe0d9; }
  .ui-err-t { font: 600 13px var(--font-serif); }
  .ui-err-b { font: 400 11px/1.5 var(--font-ui); color: var(--muted); margin: 4px 0 10px; }
  .ui-retry { display: inline-flex; background: var(--gold); color: #fff; font: 600 11px var(--font-ui); padding: 8px 12px; min-height: 36px; align-items: center; cursor: pointer; }
  .ui-retry:hover { background: var(--gold-700); }
  .ui-toast { display: flex; align-items: center; gap: 11px; background: var(--ink); color: var(--stone); padding: 11px 15px; box-shadow: var(--shadow-sm); animation: rise .4s cubic-bezier(.2,.7,.2,1) both; }
  .ui-toast-ic { color: #ec3013; }
  .ui-toast-t { font: 500 12px var(--font-ui); }
  .ui-toast-undo { margin-left: auto; font: 600 11px var(--font-ui); color: #ec3013; cursor: pointer; }
  .ui-dialog { border: 2px solid var(--ink); background: var(--paper); box-shadow: var(--shadow-offset); }
  .ui-dialog-in { padding: 16px 20px 0; }
  .ui-dialog-k { font-size: 10px; letter-spacing: .14em; color: var(--gold-700); }
  .ui-dialog-t { font: 600 17px var(--font-serif); margin: 6px 0 4px; }
  .ui-dialog-b { font: 400 12px/1.5 var(--font-ui); color: var(--muted); }
  .ui-dialog-actions { display: flex; gap: 10px; padding: 14px 20px 16px; }
`
