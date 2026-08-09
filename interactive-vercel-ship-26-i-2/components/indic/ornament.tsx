// ─────────────────────────────────────────────────────────────────────────
// TEMPLE ORNAMENT — a Blender-rendered carved-stone ornament (NOT a vector).
// Rendered headless by render_ornaments.py from procedurally-built temple forms
// (lotiform capital, torana gateway, lotus rosette) + the earlier shikhara/lotus.
// Serves the /public/backgrounds/<name>_<light|dark>.webp pair; picks by theme.
// ─────────────────────────────────────────────────────────────────────────
'use client'

import { useEffect, useState } from 'react'

export type OrnamentName =
  | 'capital'
  | 'torana'
  | 'rosette'
  | 'jali-panel'
  | 'kalasha'
  | 'shikhara'
  | 'lotus'
  | 'mandala_ceiling'
  | 'vine_frieze'

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ''

// intrinsic aspect ratios of the trimmed renders (w/h) — for stable layout
const RATIO: Record<OrnamentName, number> = {
  capital: 674 / 470,
  torana: 792 / 900,
  rosette: 900 / 865,
  'jali-panel': 510 / 612,
  kalasha: 530 / 786,
  shikhara: 1,
  lotus: 1,
  mandala_ceiling: 1,
  vine_frieze: 1400 / 114,
}

const LABEL: Record<OrnamentName, string> = {
  capital: 'Lotiform capital',
  torana: 'Torana gateway',
  rosette: 'Lotus rosette',
  'jali-panel': 'Jali screen',
  kalasha: 'Purna-kalasha',
  shikhara: 'Shikhara',
  lotus: 'Lotus medallion',
  mandala_ceiling: 'Temple ceiling mandala',
  vine_frieze: 'Carved vine frieze',
}

export default function TempleOrnament({
  name,
  width = 200,
  className,
  opacity = 1,
  variant,
  spin,
  alt,
}: {
  name: OrnamentName
  width?: number
  className?: string
  opacity?: number
  variant?: 'light' | 'dark' // force one; otherwise follows the .dark class
  spin?: boolean
  alt?: string
}) {
  // decide light/dark from the document theme unless forced
  const [dark, setDark] = useState(false)
  useEffect(() => {
    if (variant) return setDark(variant === 'dark')
    const el = document.documentElement
    const check = () => setDark(el.classList.contains('dark'))
    check()
    const mo = new MutationObserver(check)
    mo.observe(el, { attributes: true, attributeFilter: ['class'] })
    return () => mo.disconnect()
  }, [variant])

  const tone = (variant || (dark ? 'dark' : 'light')) as 'light' | 'dark'
  const src = `${BASE}/backgrounds/${name}_${tone}.webp`
  const h = Math.round(width / RATIO[name])

  return (
    <img
      src={src}
      width={width}
      height={h}
      alt={alt ?? LABEL[name]}
      loading="lazy"
      className={className}
      style={{
        opacity,
        transformOrigin: 'center',
        animation: spin ? 'mandala-spin 140s linear infinite' : undefined,
      }}
    />
  )
}
