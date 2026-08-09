'use client'

// TEMPLE 3D — a live Three.js temple viewer (from the design bundle). Three
// parametric temple styles — Nagara (Khajuraho), Dravida (Thanjavur), Kalinga
// (Konark) — orbit/zoom/pan, autorotate, and OBJ/GLB export for Blender. The
// working scene is a self-contained static asset framed in the Bharat shell.
import { useState } from 'react'
import Link from 'next/link'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import Chakra from '@/components/indic/chakra'

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ''
const SRC = `${BASE}/3d/temple-3d.html`

export default function Temple3DPage() {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className="theme-ashoka flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      {/* contextual bar */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 md:px-6">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <Link href="/temple-forms" className="shrink-0 text-[var(--muted-foreground)] hover:text-[var(--accent)]">Temple forms</Link>
            <span className="text-[var(--muted-foreground)]">/</span>
            <span className="truncate font-semibold text-foreground">In the round — parametric 3D</span>
          </div>
          <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] sm:inline">
            Nagara · Dravida · Kalinga — drag to orbit · export OBJ/GLB
          </span>
        </div>
      </div>

      {/* the live 3D stage */}
      <div className="relative flex-1">
        {!loaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background">
            <Chakra size={40} color="var(--accent)" spin />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
              Building the temple…
            </span>
          </div>
        )}
        <iframe
          src={SRC}
          title="Bharat temple — parametric 3D"
          onLoad={() => setLoaded(true)}
          className="h-full w-full"
          style={{ minHeight: '78vh', border: 0, background: '#e9e0cb' }}
        />
      </div>

      <SiteFooter />
    </div>
  )
}
