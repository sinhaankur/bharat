'use client'

import { useEffect, useState } from 'react'

// The design-system switcher (user requirement): pick which Indic design system skins
// the WHOLE site. Sets html[data-skin], persists to localStorage, so every page
// reskins live via the token layer (layout never changes — CLAUDE.md). Default = Gupta.
// SKINS now lives in lib/skins (plain data) so server components can import it too;
// re-exported here so existing importers keep working.
import { SKINS, type Skin } from '@/lib/skins'
import { TOKEN_SETS } from '@/lib/design-tokens'
export { SKINS }
export type { Skin }

const base = process.env.NEXT_PUBLIC_BASE_PATH || ''

export default function SkinSwitcher() {
  const [open, setOpen] = useState(false)
  const [skin, setSkin] = useState('gupta')

  useEffect(() => {
    const cur = document.documentElement.dataset.skin || 'gupta'
    setSkin(cur)
  }, [])

  function pick(id: string) {
    document.documentElement.dataset.skin = id
    try { localStorage.setItem('atlas-skin', id) } catch {}
    setSkin(id)
    setOpen(false)
  }

  const current = SKINS.find((s) => s.id === skin) ?? SKINS[0]

  return (
    <div className="sk">
      <button className="sk-btn" onClick={() => setOpen((v) => !v)} aria-haspopup="listbox" aria-expanded={open} aria-label="Choose a design system">
        <span className="sk-dot" style={{ background: current.swatch }} />
        <span className="sk-label">{current.label}</span>
        <span aria-hidden>▾</span>
      </button>

      {open && (
        <>
          <div className="sk-scrim" onClick={() => setOpen(false)} />
          <div className="sk-menu" role="listbox" aria-label="Design system">
            <div className="sk-head">Indic Designs — pick a skin</div>
            {SKINS.map((s) => (
              <button key={s.id} role="option" aria-selected={s.id === skin} className={`sk-opt${s.id === skin ? ' on' : ''}`} onClick={() => pick(s.id)}>
                <span className="sk-sw" style={{ background: s.swatch, boxShadow: `0 0 0 2px ${s.band}` }} />
                <span className="sk-txt"><span className="sk-t">{s.label}</span><span className="sk-n">{s.note}</span></span>
                {s.id === skin && <span className="sk-check" aria-hidden>✓</span>}
              </button>
            ))}
            {/* the STORY of the worn skin — switching teaches the heritage */}
            {(() => {
              const t = TOKEN_SETS[skin]
              const story = t?.story || t?.from
              if (!story) return null
              return (
                <div className="sk-story" aria-live="polite">
                  <span className="sk-story-k">{current.label} — the story</span>
                  <p className="sk-story-p">{story}</p>
                  <a className="sk-story-link" href={`${base}/design-systems/#gallery`}>Walk the gallery →</a>
                </div>
              )
            })()}
            <div className="sk-foot">Primary stays Gupta · states swap only the tokens, never the layout.</div>
          </div>
        </>
      )}

      <style>{`
        .sk { position: relative; }
        .sk-btn { display: inline-flex; align-items: center; gap: 8px; border: 1.5px solid var(--line); background: transparent; color: var(--ink); padding: 8px 11px; font: 600 12.5px var(--font-ui); cursor: pointer; }
        .sk-btn:hover { border-color: var(--ink); }
        .sk-dot { width: 11px; height: 11px; flex: none; }
        .sk-scrim { position: fixed; inset: 0; z-index: 60; }
        .sk-menu { position: absolute; right: 0; top: calc(100% + 6px); z-index: 61; width: 300px; background: var(--surface); border: 2px solid var(--ink); box-shadow: var(--shadow-md); }
        .sk-head { font: 700 10px var(--font-mono); letter-spacing: .14em; text-transform: uppercase; color: var(--accent); padding: 12px 14px 8px; border-bottom: 1px solid var(--line); }
        .sk-opt { display: flex; align-items: center; gap: 11px; width: 100%; border: 0; background: transparent; cursor: pointer; text-align: left; padding: 9px 14px; color: var(--ink); }
        .sk-opt:hover { background: color-mix(in srgb, var(--accent) 10%, transparent); }
        .sk-opt.on { background: color-mix(in srgb, var(--accent) 14%, transparent); }
        .sk-sw { width: 16px; height: 16px; flex: none; }
        .sk-txt { display: flex; flex-direction: column; min-width: 0; }
        .sk-t { font: 700 13px var(--font-ui); }
        .sk-n { font: 400 11px var(--font-ui); color: var(--muted); }
        .sk-check { margin-left: auto; color: var(--accent); font-weight: 700; }
        /* the story of the currently-worn skin — updates as you switch */
        .sk-story { padding: 12px 14px; border-top: 1px solid var(--line); background: color-mix(in srgb, var(--accent) 5%, transparent); }
        .sk-story-k { display: block; font: 700 9.5px var(--font-mono); letter-spacing: .12em; text-transform: uppercase; color: var(--accent); }
        .sk-story-p { margin: 6px 0 0; font: 400 11.5px/1.55 var(--font-ui); color: var(--ink); }
        .sk-story-link { display: inline-block; margin-top: 8px; font: 600 11px var(--font-ui); color: var(--accent); text-decoration: none; }
        .sk-story-link:hover { text-decoration: underline; }
        .sk-foot { font: italic 400 11px var(--font-ui); color: var(--muted); padding: 10px 14px; border-top: 1px solid var(--line); }
        @media (max-width: 900px) { .sk-label { display: none; } }
      `}</style>
    </div>
  )
}
