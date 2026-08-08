import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import RevealObserver from '@/components/indic/reveal-observer'
import FloralGlow from '@/components/indic/floral-glow'
import Chakra from '@/components/indic/chakra'
import { ATLAS_PAGES, SECTIONS, pagesBySection, hrefFor } from '@/lib/atlas-pages'

export const metadata: Metadata = {
  title: 'The Atlas — every page — Bharat',
  description: 'Every page of the Bharat atlas, by section. Nothing hidden, nothing dead.',
}

export default function AtlasDirectory() {
  const total = ATLAS_PAGES.length
  return (
    <div className="theme-ashoka min-h-screen bg-background text-foreground">
      <RevealObserver />
      <SiteHeader />

      {/* masthead */}
      <header className="relative overflow-hidden border-b border-border">
        <FloralGlow petals={false} intensity={0.8} />
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center">
          <div className="mb-3 flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
            <Chakra size={13} color="var(--accent)" /> {total} pages · 8 sections
          </div>
          <h1 className="bharati text-5xl font-black tracking-tight md:text-6xl">The Atlas</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Everything we have built — the whole house, room by room. Live native pages and
            framed originals alike. Nothing hidden, nothing dead.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-14">
        {SECTIONS.map((section) => {
          const pages = pagesBySection(section)
          if (!pages.length) return null
          return (
            <section key={section} className="mb-14 stone-reveal">
              <div className="mb-5 flex items-baseline gap-3 border-b border-border pb-2">
                <h2 className="text-2xl font-bold text-foreground">{section}</h2>
                <span className="text-sm text-muted-foreground">{pages.length} pages</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pages.map((p) => (
                  <Link
                    key={p.slug}
                    href={hrefFor(p)}
                    className="lift group flex flex-col rounded-lg border border-border bg-card/60 p-4 transition-colors hover:border-[var(--accent)]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground group-hover:text-[var(--accent)]">
                        {p.title}
                      </span>
                      {p.native && (
                        <span className="rounded-full bg-[var(--accent)]/12 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--accent)]">
                          native
                        </span>
                      )}
                    </div>
                    {p.blurb && (
                      <span className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.blurb}</span>
                    )}
                    <span className="mt-2 text-xs text-[var(--muted-foreground)] transition-transform duration-300 group-hover:translate-x-1">
                      Open →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </main>

      <SiteFooter />
    </div>
  )
}
