// Client-side downloaders for a design system: CSS tokens, JSON tokens, a printable spec,
// or a .zip of all three. No dependency — a tiny stored (uncompressed) ZIP writer. Every
// file carries the rights-reserved notice. See lib/design-tokens.ts + [[indic-design-ip-trademark]].
import { TOKEN_SETS, RIGHTS, type TokenSet } from './design-tokens'

function trigger(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = name
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export function cssFor(t: TokenSet): string {
  const lines = Object.entries(t.tokens).map(([k, v]) => `  ${k}: ${v};`).join('\n')
  return `/*\n  Indic Designs™ — ${t.label} design system\n  ${t.from}\n  ${RIGHTS}\n*/\nhtml[data-skin="${t.id}"] {\n${lines}\n}\n`
}

export function jsonFor(t: TokenSet): string {
  const tokens: Record<string, { value: string; type: string }> = {}
  for (const [k, v] of Object.entries(t.tokens)) {
    tokens[k.replace(/^--/, '')] = { value: v, type: k.includes('font') ? 'fontFamily' : 'color' }
  }
  return JSON.stringify({ name: `Indic Designs — ${t.label}`, id: t.id, heritage: t.from, rights: RIGHTS, tokens }, null, 2)
}

export function specHtmlFor(t: TokenSet): string {
  const bg = t.tokens['--bg'], ink = t.tokens['--ink'], accent = t.tokens['--accent'], band = t.tokens['--band'], surface = t.tokens['--surface']
  const swatch = (label: string, val: string) =>
    `<div style="flex:1;min-width:120px"><div style="height:56px;background:${val};border:1px solid rgba(0,0,0,.15)"></div><div style="font:600 11px/1.4 monospace;margin-top:6px">${label}</div><div style="font:400 11px/1.4 monospace;color:#666">${val}</div></div>`
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Indic Designs — ${t.label}</title>
<style>body{margin:0;background:${bg};color:${ink};font-family:${t.tokens['--font-ui'] || 'system-ui'};padding:48px;max-width:900px;margin:0 auto}
h1{font-family:${t.tokens['--font-display'] || 'serif'};font-size:44px;margin:0 0 4px;color:${accent}}
.k{font:600 11px monospace;letter-spacing:.18em;text-transform:uppercase;color:${band}}
.row{display:flex;gap:10px;margin:20px 0}.rule{height:2px;background:${ink};margin:24px 0}
.btn{display:inline-block;background:${accent};color:${bg};padding:10px 18px;font-weight:600;text-decoration:none}
.foot{font:400 11px monospace;color:#777;border-top:1px solid rgba(0,0,0,.15);padding-top:14px;margin-top:32px}</style></head>
<body><div class="k">Indic Designs™ · specimen</div><h1>${t.label}</h1><p>${t.from}</p>
<div class="rule"></div><div class="k">Colour</div>
<div class="row">${swatch('bg', bg)}${swatch('surface', surface)}${swatch('ink', ink)}${swatch('accent', accent)}${swatch('band', band)}</div>
<div class="k">Type</div><p style="font-family:${t.tokens['--font-display'] || 'serif'};font-size:30px;margin:6px 0">Display — ${t.tokens['--font-display'] || ''}</p>
<p style="font-size:15px;margin:6px 0">Body — ${t.tokens['--font-ui'] || ''}. The quick brown fox jumps over the lazy dog.</p>
<div class="rule"></div><div class="k">In use</div><p><a class="btn" href="#">A primary action</a></p>
<div class="foot">${RIGHTS}</div></body></html>`
}

export function downloadCss(id: string) { const t = TOKEN_SETS[id]; if (t) trigger(`indic-${id}.css`, new Blob([cssFor(t)], { type: 'text/css' })) }
export function downloadJson(id: string) { const t = TOKEN_SETS[id]; if (t) trigger(`indic-${id}.tokens.json`, new Blob([jsonFor(t)], { type: 'application/json' })) }
export function downloadSpec(id: string) { const t = TOKEN_SETS[id]; if (t) trigger(`indic-${id}-spec.html`, new Blob([specHtmlFor(t)], { type: 'text/html' })) }

// ── tiny stored-ZIP writer (no compression, no deps) ──
function crc32(bytes: Uint8Array): number {
  let c = ~0
  for (let i = 0; i < bytes.length; i++) {
    c ^= bytes[i]
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1))
  }
  return ~c >>> 0
}
export function downloadZip(id: string) {
  const t = TOKEN_SETS[id]; if (!t) return
  const enc = new TextEncoder()
  const files: { name: string; data: Uint8Array }[] = [
    { name: `indic-${id}.css`, data: enc.encode(cssFor(t)) },
    { name: `indic-${id}.tokens.json`, data: enc.encode(jsonFor(t)) },
    { name: `indic-${id}-spec.html`, data: enc.encode(specHtmlFor(t)) },
    { name: `LICENSE.txt`, data: enc.encode(RIGHTS + '\n') },
  ]
  const chunks: Uint8Array[] = []
  const central: Uint8Array[] = []
  let offset = 0
  const u16 = (n: number) => new Uint8Array([n & 255, (n >> 8) & 255])
  const u32 = (n: number) => new Uint8Array([n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >> 24) & 255])
  for (const f of files) {
    const nameB = enc.encode(f.name); const crc = crc32(f.data); const sz = f.data.length
    const local = concat([u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(sz), u32(sz), u16(nameB.length), u16(0), nameB, f.data])
    chunks.push(local)
    central.push(concat([u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(sz), u32(sz), u16(nameB.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), nameB]))
    offset += local.length
  }
  const cd = concat(central); const cdOffset = offset
  const end = concat([u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(cd.length), u32(cdOffset), u16(0)])
  trigger(`indic-${id}.zip`, new Blob([concat(chunks), cd, end], { type: 'application/zip' }))
}
function concat(parts: Uint8Array[]): Uint8Array {
  const len = parts.reduce((n, p) => n + p.length, 0)
  const out = new Uint8Array(len); let o = 0
  for (const p of parts) { out.set(p, o); o += p.length }
  return out
}
