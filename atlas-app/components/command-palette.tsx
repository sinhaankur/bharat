'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/icon'
import { searchIndex, type Scope, type Hit } from '@/lib/search-index'

// The command palette (mockup 7c). Open with "/" or ⌘K / Ctrl-K, or the header
// search button (dispatches the 'atlas:open-search' event). Search districts,
// pages and queries; ↑↓ to move, ↵ to open, TAB to cycle scope, ESC to close.
const SCOPES: (Scope | 'all')[] = ['all', 'districts', 'pages', 'queries']

export default function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [scope, setScope] = useState<Scope | 'all'>('all')
  const [sel, setSel] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const hits = useMemo(() => searchIndex(q, scope === 'all' ? undefined : scope), [q, scope])

  // open/close wiring: "/" anywhere (unless typing), ⌘/Ctrl-K, custom event, ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /^(input|textarea|select)$/i.test((e.target as HTMLElement)?.tagName || '') ||
        (e.target as HTMLElement)?.isContentEditable
      if (!open && (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) && !typing) {
        e.preventDefault(); setOpen(true)
      } else if (open && e.key === 'Escape') {
        setOpen(false)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('atlas:open-search', onOpen as EventListener)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('atlas:open-search', onOpen as EventListener)
    }
  }, [open])

  useEffect(() => {
    if (open) { setSel(0); setTimeout(() => inputRef.current?.focus(), 0) }
  }, [open])
  useEffect(() => setSel(0), [q, scope])

  function go(h: Hit) {
    setOpen(false)
    if (h.external || h.href.startsWith('http') || h.href.includes('.html')) {
      window.location.href = h.href
    } else {
      router.push(h.href)
    }
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(hits.length - 1, s + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(0, s - 1)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (hits[sel]) go(hits[sel]) }
    else if (e.key === 'Tab') { e.preventDefault(); const i = SCOPES.indexOf(scope); setScope(SCOPES[(i + 1) % SCOPES.length]) }
  }

  if (!open) return null

  return (
    <div className="cmdk-backdrop" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label="Search the atlas">
      <div className="cmdk" onClick={(e) => e.stopPropagation()}>
        <div className="cmdk-input-row">
          <svg width="17" height="17" style={{ color: 'var(--gold)' }} aria-hidden="true"><use href="#chakra" /></svg>
          <input
            ref={inputRef}
            className="cmdk-input"
            placeholder="Search districts, pages, queries…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onInputKey}
            aria-label="Search"
          />
          <span className="cmdk-esc mono">ESC</span>
        </div>

        <div className="cmdk-scopes">
          {SCOPES.map((s) => (
            <button key={s} className={`cmdk-scope${s === scope ? ' on' : ''}`} onClick={() => setScope(s)}>{s}</button>
          ))}
        </div>

        <div className="cmdk-list">
          {hits.length === 0 && <div className="cmdk-empty">No matches — try a district, a page, or a risk term.</div>}
          {hits.map((h, i) => (
            <button key={h.href} className={`cmdk-item${i === sel ? ' on' : ''}`} onMouseEnter={() => setSel(i)} onClick={() => go(h)}>
              <Icon name={h.icon} size={15} className="cmdk-ic" />
              <span className="cmdk-text">
                <span className="cmdk-title">{h.title}</span>
                <span className="cmdk-sub">{h.sub}</span>
              </span>
              {i === sel && <span className="cmdk-open mono">↵ OPEN</span>}
            </button>
          ))}
        </div>

        <div className="cmdk-foot mono">
          <span>↑↓ navigate</span><span>↵ open</span><span>TAB scope</span>
        </div>
      </div>

      <style>{`
        .cmdk-backdrop { position: fixed; inset: 0; z-index: 200; background: rgba(42,32,24,.35); display: grid; place-items: start center; padding: 12vh 20px; }
        .cmdk { width: min(560px, 100%); background: var(--paper); border: 2px solid var(--ink); box-shadow: 10px 10px 0 rgba(42,32,24,.3); color: #1a1917; font-family: var(--font-ui); }
        .cmdk-input-row { display: flex; align-items: center; gap: 11px; padding: 13px 17px; border-bottom: 2px solid var(--ink); }
        .cmdk-input { flex: 1; border: 0; background: transparent; font: 400 15px var(--font-ui); color: #1a1917; outline: none; }
        .cmdk-esc { font-size: 10px; border: 1px solid #c3bcb2; padding: 1px 6px; color: var(--muted); }
        .cmdk-scopes { display: flex; gap: 0; border-bottom: 1px solid #d6d0cb; }
        .cmdk-scope { flex: none; padding: 8px 14px; border: 0; background: transparent; cursor: pointer; font: 600 10px var(--font-mono); letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }
        .cmdk-scope.on { background: var(--ink); color: var(--paper); }
        .cmdk-list { max-height: 46vh; overflow-y: auto; padding: 6px 0; }
        .cmdk-empty { padding: 22px 17px; font-size: 13px; color: var(--muted); }
        .cmdk-item { display: flex; align-items: center; gap: 11px; width: 100%; padding: 10px 17px; border: 0; background: transparent; cursor: pointer; text-align: left; border-left: 3px solid transparent; }
        .cmdk-item.on { background: #f7ecd2; border-left-color: var(--gold); }
        .cmdk-ic { color: var(--muted); flex: none; }
        .cmdk-item.on .cmdk-ic { color: var(--gold-700); }
        .cmdk-text { display: flex; flex-direction: column; min-width: 0; }
        .cmdk-title { font: 600 13px var(--font-ui); }
        .cmdk-sub { font: 400 10.5px var(--font-ui); color: var(--muted); }
        .cmdk-open { margin-left: auto; font-size: 9.5px; color: var(--gold-700); flex: none; }
        .cmdk-foot { display: flex; gap: 14px; padding: 9px 17px; border-top: 1px solid #d6d0cb; font-size: 10px; color: var(--muted); }
      `}</style>
    </div>
  )
}
