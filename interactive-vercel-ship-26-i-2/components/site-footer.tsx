import Link from 'next/link'
import { categories } from '@/lib/articles'
import { hrefFor, sectionFront, findPage, type Section } from '@/lib/atlas-pages'
import Icon, { type IconName } from '@/components/indic/icon'
import { BharatMark } from '@/components/indic/bharat-logo'

// section → its front page, resolved from the registry so every link is a REAL
// native route (or a themed frame) — never a dead .html link.
function sectionHref(c: string): string {
  const map: Record<string, Section> = {
    News: 'News', Money: 'Money', Land: 'Land', History: 'History',
    Languages: 'Languages', '3D': '3D', Data: 'Data',
  }
  const s = map[c]
  return s ? hrefFor(sectionFront(s)) : '/atlas'
}
const SECTION_ICON: Record<string, IconName> = {
  News: 'edict', Money: 'coin', Land: 'pillar', History: 'stupa',
  Languages: 'lotus', '3D': 'torana', Data: 'jali',
}

// About links → native routes where they exist, else the framed page
const ABOUT: { label: string; slug: string }[] = [
  { label: 'The design system', slug: 'design' },
  { label: 'Provenance ledger', slug: 'provenance' },
  { label: 'Methodology', slug: 'about' },
  { label: 'Sources', slug: 'references' },
  { label: 'Everything (atlas)', slug: 'sitemap' },
]
function aboutHref(slug: string): string {
  const p = findPage(slug)
  return p ? hrefFor(p) : '/atlas'
}

export default function SiteFooter() {
  return (
    <footer className="border-t-2 border-foreground bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <BharatMark size={34} color="var(--accent)" ink="var(--foreground)" />
              <span className="bharati text-2xl font-black tracking-tight text-foreground">
                Bharat<span className="text-[var(--accent)]">.</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              An atlas of India — money, land and memory. Sourced, or it’s a gap — never fabricated.
            </p>
          </div>

          <nav aria-label="Sections">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sections</h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2">
              {categories.map((c) => (
                <li key={c}>
                  <Link
                    href={sectionHref(c)}
                    className="group flex items-center gap-2 text-sm text-foreground transition-colors hover:text-[var(--accent)]"
                  >
                    {SECTION_ICON[c] && (
                      <Icon name={SECTION_ICON[c]} size={14} className="text-[var(--muted-foreground)] group-hover:text-[var(--accent)]" />
                    )}
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="About">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">About</h3>
            <ul className="mt-4 flex flex-col gap-2">
              {ABOUT.map((l) => (
                <li key={l.label}>
                  <Link href={aboutHref(l.slug)} className="text-sm text-foreground transition-colors hover:text-[var(--accent)]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Bharat · an open, non-commercial data project.</p>
          <div className="flex gap-4">
            <Link href={aboutHref('privacy-policy')} className="hover:text-[var(--accent)]">Privacy</Link>
            <Link href={aboutHref('about')} className="hover:text-[var(--accent)]">Methodology</Link>
            <Link href="/atlas" className="hover:text-[var(--accent)]">All pages</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
