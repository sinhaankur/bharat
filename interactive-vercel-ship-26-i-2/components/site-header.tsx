'use client'

import { useState } from 'react'
import { Menu, Search, X } from 'lucide-react'
import { categories } from '@/lib/articles'
import { BharatLogo } from '@/components/indic/bharat-logo'
import ThemeToggle from '@/components/theme-toggle'
import { hrefFor, sectionFront, type Section } from '@/lib/atlas-pages'

// magazine section → its front page, resolved from the atlas registry so it
// always lands on a REAL route (native page or themed frame — never a dead link)
function sectionHref(c: string): string {
  const map: Record<string, Section> = {
    News: 'News',
    Money: 'Money',
    Land: 'Land',
    History: 'History',
    Languages: 'Languages',
    '3D': '3D',
    Data: 'Data',
  }
  const s = map[c]
  return s ? hrefFor(sectionFront(s)) : '/atlas'
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-foreground bg-background">
      {/* Top bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>

          <a href="/" className="flex items-center" aria-label="Bharat home">
            <BharatLogo size={36} />
          </a>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/atlas"
            className="hidden text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            All pages
          </a>
          <ThemeToggle className="hidden sm:flex" />
          <button
            className="hidden h-9 w-9 items-center justify-center rounded-full hover:bg-muted sm:flex"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
          <a
            href="/map"
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[var(--accent-foreground)] transition-opacity hover:opacity-90"
          >
            Open the map
          </a>
        </div>
      </div>

      {/* Category nav */}
      <nav className="hidden border-t border-border md:block">
        <div className="mx-auto max-w-7xl px-6">
          <ul className="flex items-center gap-6 overflow-x-auto py-2.5">
            {categories.map((c) => (
              <li key={c}>
                <a
                  href={sectionHref(c)}
                  className="whitespace-nowrap text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                >
                  {c}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-border md:hidden">
          <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 px-4 py-4">
            {categories.map((c) => (
              <li key={c}>
                <a
                  href={sectionHref(c)}
                  className="block py-2 text-sm font-bold uppercase tracking-wide text-foreground"
                >
                  {c}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
