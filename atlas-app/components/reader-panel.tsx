'use client'

import { useEffect, useState } from 'react'

// The a11y reader panel (mockup 7c). A floating "Aa" button opens preferences:
// text size, font, theme, reduce-motion. Saved to localStorage and applied to
// <html> via data-* attributes (see globals.css), so it persists and applies
// everywhere.
type Size = 'sm' | 'md' | 'lg'
type Font = 'default' | 'hyperlegible' | 'dyslexic'
type Theme = 'light' | 'dark' | 'auto'

const KEY = 'atlas-reader-prefs'

function apply(size: Size, font: Font, theme: Theme, reduce: boolean) {
  const el = document.documentElement
  el.dataset.size = size
  el.dataset.font = font
  el.dataset.theme = theme
  el.dataset.reduce = reduce ? 'on' : 'off'
}

export default function ReaderPanel() {
  const [open, setOpen] = useState(false)
  const [size, setSize] = useState<Size>('md')
  const [font, setFont] = useState<Font>('default')
  const [theme, setTheme] = useState<Theme>('auto')
  const [reduce, setReduce] = useState(false)

  // load once
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem(KEY) || '{}')
      if (p.size) setSize(p.size)
      if (p.font) setFont(p.font)
      if (p.theme) setTheme(p.theme)
      if (p.reduce) setReduce(!!p.reduce)
      apply(p.size || 'md', p.font || 'default', p.theme || 'auto', !!p.reduce)
    } catch { /* first visit */ }
  }, [])

  // persist + apply on change
  useEffect(() => {
    apply(size, font, theme, reduce)
    localStorage.setItem(KEY, JSON.stringify({ size, font, theme, reduce }))
  }, [size, font, theme, reduce])

  const Seg = <T,>({ value, set, opts }: { value: T; set: (v: T) => void; opts: { v: T; label: string }[] }) => (
    <div className="rp-seg">
      {opts.map((o) => (
        <button key={String(o.v)} className={`rp-opt${o.v === value ? ' on' : ''}`} onClick={() => set(o.v)}>{o.label}</button>
      ))}
    </div>
  )

  return (
    <>
      <button className="rp-fab" onClick={() => setOpen((v) => !v)} aria-label="Reader preferences" aria-expanded={open}>Aa</button>

      {open && (
        <div className="rp-panel card" role="dialog" aria-label="Reader preferences">
          <div className="rp-head">
            <span className="rp-aa">Aa</span>
            <span className="rp-title">Reader preferences</span>
            <span className="rp-note">saved on this device, applies everywhere</span>
          </div>
          <div className="rp-grid">
            <div>
              <div className="rp-label mono">TEXT SIZE</div>
              <Seg value={size} set={setSize} opts={[{ v: 'sm', label: 'A' }, { v: 'md', label: 'A' }, { v: 'lg', label: 'A' }]} />
            </div>
            <div>
              <div className="rp-label mono">FONT</div>
              <Seg value={font} set={setFont} opts={[{ v: 'default', label: 'Default' }, { v: 'hyperlegible', label: 'Legible' }, { v: 'dyslexic', label: 'Dyslexic' }]} />
            </div>
            <div>
              <div className="rp-label mono">THEME</div>
              <Seg value={theme} set={setTheme} opts={[{ v: 'light', label: 'Light' }, { v: 'dark', label: 'Dark' }, { v: 'auto', label: 'Auto' }]} />
            </div>
            <div>
              <div className="rp-label mono">MOTION</div>
              <button className={`rp-toggle${reduce ? ' on' : ''}`} onClick={() => setReduce((v) => !v)} aria-pressed={reduce}>
                <span className="rp-knob" /> Reduce motion
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .rp-fab { position: fixed; right: 18px; bottom: 18px; z-index: 190; width: 44px; height: 44px; border: 2px solid var(--ink); background: var(--stone); color: var(--ink); font: 600 16px var(--font-serif); cursor: pointer; box-shadow: var(--shadow-sm); }
        .rp-fab:hover { background: var(--stone-2); }
        .rp-panel { position: fixed; right: 18px; bottom: 72px; z-index: 190; width: min(420px, calc(100vw - 36px)); background: var(--stone); }
        .rp-head { display: flex; align-items: center; gap: 10px; padding: 13px 20px; border-bottom: 2px solid var(--ink); flex-wrap: wrap; }
        .rp-aa { width: 34px; height: 34px; display: grid; place-items: center; border: 1.5px solid var(--ink); font: 600 14px var(--font-serif); }
        .rp-title { font: 600 14px var(--font-serif); }
        .rp-note { font: 400 11px var(--font-ui); color: var(--muted); flex-basis: 100%; }
        .rp-grid { padding: 16px 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px 22px; }
        .rp-label { font-size: 10px; letter-spacing: .12em; color: var(--gold-700); margin-bottom: 7px; }
        .rp-seg { display: inline-flex; border: 1.5px solid var(--ink); overflow: hidden; }
        .rp-opt { padding: 7px 12px; border: 0; background: transparent; cursor: pointer; font: 500 12px var(--font-ui); color: var(--ink); }
        .rp-opt:hover { background: rgba(204,137,0,.12); }
        .rp-opt.on { background: var(--ink); color: var(--stone); }
        .rp-toggle { display: inline-flex; align-items: center; gap: 9px; border: 0; background: transparent; cursor: pointer; font: 500 12px var(--font-ui); color: var(--ink); padding: 0; }
        .rp-knob { width: 38px; height: 20px; background: var(--stone-2); border: 1.5px solid var(--ink); position: relative; flex: none; }
        .rp-knob::after { content: ""; position: absolute; left: 2px; top: 2px; width: 14px; height: 14px; background: var(--ink); transition: left .15s; }
        .rp-toggle.on .rp-knob { background: var(--gold); }
        .rp-toggle.on .rp-knob::after { left: 20px; background: #fff; }
      `}</style>
    </>
  )
}
