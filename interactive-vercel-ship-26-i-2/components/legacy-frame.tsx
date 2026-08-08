'use client'

// ─────────────────────────────────────────────────────────────────────────
// LEGACY FRAME — wraps a legacy .html page in our themed frame so nothing feels
// off-brand and nothing is dead: our header, a slim contextual bar (section +
// title + "open standalone"), the framed original, and our footer. The iframe
// keeps the working maps/3D/data engines intact while we rebuild natively.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import Chakra from '@/components/indic/chakra'
import type { AtlasPage } from '@/lib/atlas-pages'
import { legacyUrl } from '@/lib/atlas-pages'

export default function LegacyFrame({ page }: { page: AtlasPage }) {
  const [loaded, setLoaded] = useState(false)
  const ref = useRef<HTMLIFrameElement>(null)
  const src = legacyUrl(page)

  // grow the iframe to its content height where same-origin allows it
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => {
      try {
        const doc = el.contentDocument
        if (doc) el.style.height = Math.max(doc.body.scrollHeight, 640) + 'px'
      } catch {
        /* cross-origin — leave the fixed tall height */
      }
    }
    const t = setInterval(fit, 800)
    return () => clearInterval(t)
  }, [loaded])

  return (
    <div className="theme-ashoka min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* contextual bar */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 md:px-6">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <Link href="/atlas" className="shrink-0 text-[var(--muted-foreground)] hover:text-[var(--accent)]">
              Atlas
            </Link>
            <span className="text-[var(--muted-foreground)]">/</span>
            <span className="shrink-0 rounded-full bg-[var(--accent)]/12 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-[var(--accent)]">
              {page.section}
            </span>
            <span className="truncate font-semibold text-foreground">{page.title}</span>
          </div>
          <a
            href={src}
            target="_blank"
            rel="noopener"
            className="shrink-0 rounded-full border border-border px-3 py-1 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Open standalone ↗
          </a>
        </div>
      </div>

      {/* the framed original */}
      <div className="relative">
        {!loaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background">
            <Chakra size={40} color="var(--accent)" spin />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
              Loading {page.title}…
            </span>
          </div>
        )}
        <iframe
          ref={ref}
          src={src}
          title={page.title}
          onLoad={() => setLoaded(true)}
          className="w-full"
          style={{ height: '82vh', border: 0, background: 'transparent' }}
          loading="lazy"
        />
      </div>

      <SiteFooter />
    </div>
  )
}
