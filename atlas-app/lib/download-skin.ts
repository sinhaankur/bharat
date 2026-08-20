// Client-side downloaders for a design system: CSS tokens, JSON tokens, a Figma-ready
// W3C Design Tokens file, a printable spec, or a .zip of all four + a README. No
// dependency — a tiny stored (uncompressed) ZIP writer. Every file carries the story
// and the rights-reserved notice. See lib/design-tokens.ts + [[indic-design-ip-trademark]].
import { TOKEN_SETS, TOKEN_STORY, RIGHTS, type TokenSet } from './design-tokens'

// role/story line for a token, for comments + $description
function roleOf(k: string): string {
  return TOKEN_STORY[k] || (k.includes('font') ? 'A type face in the system.' : 'A colour in the system.')
}
function isFont(k: string): boolean { return k.includes('font') }

function trigger(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = name
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export function cssFor(t: TokenSet): string {
  // header carries the full story; each token gets an inline heritage comment
  const lines = Object.entries(t.tokens)
    .map(([k, v]) => `  ${k}: ${v};  /* ${roleOf(k)} */`).join('\n')
  const story = (t.story || t.from).replace(/\*\//g, '* /')
  return `/*!\n  Indic Designs™ — ${t.label} design system\n  ${t.from}\n\n  ${story}\n\n  ${RIGHTS}\n*/\nhtml[data-skin="${t.id}"] {\n${lines}\n}\n`
}

// Plain JSON — the flat token map, each with a heritage description.
export function jsonFor(t: TokenSet): string {
  const tokens: Record<string, { value: string; type: string; description: string }> = {}
  for (const [k, v] of Object.entries(t.tokens)) {
    tokens[k.replace(/^--/, '')] = { value: v, type: isFont(k) ? 'fontFamily' : 'color', description: roleOf(k) }
  }
  return JSON.stringify(
    { name: `Indic Designs — ${t.label}`, id: t.id, heritage: t.from, story: t.story || t.from, rights: RIGHTS, tokens },
    null, 2)
}

// W3C Design Tokens format — the standard a designer imports into FIGMA (via the free
// Tokens Studio plugin). Colours and fonts are grouped; every token carries its heritage
// in $description so the story rides along. This is the "play with it in Figma" file.
export function w3cFor(t: TokenSet): string {
  const color: Record<string, unknown> = {}
  const font: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(t.tokens)) {
    const name = k.replace(/^--/, '')
    const node = { $value: v, $type: isFont(k) ? 'fontFamily' : 'color', $description: roleOf(k) }
    if (isFont(k)) font[name.replace(/^font-/, '')] = node
    else color[name] = node
  }
  const doc = {
    $description: `Indic Designs™ — ${t.label}. ${t.story || t.from}  ${RIGHTS}`,
    color,
    font,
  }
  return JSON.stringify(doc, null, 2)
}

// A proper README — the standard way a design system ships: what it is, the story, how to
// use the CSS, and how to import into Figma. Markdown.
export function readmeFor(t: TokenSet): string {
  return `# Indic Designs™ — ${t.label}

${t.story || t.from}

## What's in this folder

| File | For |
| --- | --- |
| \`indic-${t.id}.css\` | Drop-in CSS custom properties (\`html[data-skin="${t.id}"]\`). |
| \`indic-${t.id}.tokens.json\` | Plain JSON token map, each with a heritage note. |
| \`indic-${t.id}.figma.tokens.json\` | **W3C Design Tokens** — import into **Figma**. |
| \`indic-${t.id}-spec.html\` | A one-page printable specimen. |
| \`LICENSE.txt\` | The licence. |

## Use it in code

Link the CSS and set the skin on \`<html>\`:

\`\`\`html
<link rel="stylesheet" href="indic-${t.id}.css">
<html data-skin="${t.id}">
\`\`\`

Then read the tokens as CSS variables — e.g. \`background: var(--bg); color: var(--ink); accent: var(--accent);\`.

## Play with it in Figma

The design language is open for designers to explore:

1. In Figma, install the free **Tokens Studio for Figma** plugin.
2. Open the plugin → **Tools → Import** → choose \`indic-${t.id}.figma.tokens.json\`.
3. The colours and type land as Figma variables/styles — each with its heritage note. Restyle, remix, prototype.

Every token carries its story: the action colour, the corner, the ground — each is a place with a history, not a decoration.

---

${RIGHTS}
`
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
export function downloadFigma(id: string) { const t = TOKEN_SETS[id]; if (t) trigger(`indic-${id}.figma.tokens.json`, new Blob([w3cFor(t)], { type: 'application/json' })) }
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
    { name: `README.md`, data: enc.encode(readmeFor(t)) },
    { name: `indic-${id}.css`, data: enc.encode(cssFor(t)) },
    { name: `indic-${id}.tokens.json`, data: enc.encode(jsonFor(t)) },
    { name: `indic-${id}.figma.tokens.json`, data: enc.encode(w3cFor(t)) },
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
