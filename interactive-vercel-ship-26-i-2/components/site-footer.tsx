import { categories } from '@/lib/articles'

const SECTION_HREF: Record<string, string> = {
  News: '/feed.html', Money: '/index.html', Land: '/encroachment-atlas.html',
  History: '/ancient-india.html', Languages: '/languages.html', '3D': '/india-3d.html', Data: '/knowledge.html',
}
const ABOUT: { label: string; href: string }[] = [
  { label: 'How it works', href: '/how-it-works.html' },
  { label: 'Methodology', href: '/about.html' },
  { label: 'Sources', href: '/references.html' },
  { label: 'Provenance ledger', href: '/provenance.html' },
  { label: 'Design system', href: '/design-system.html' },
  { label: 'Sitemap', href: '/sitemap.html' },
]

export default function SiteFooter() {
  return (
    <footer className="border-t border-foreground bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <span className="bg-accent px-2 py-1 font-serif text-2xl font-black italic leading-none tracking-tight text-accent-foreground">
              Bharat
            </span>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              A data-driven magazine for India. Sourced, or it’s a gap — never fabricated.
            </p>
          </div>

          <nav aria-label="Sections">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Sections
            </h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2">
              {categories.map((c) => (
                <li key={c}>
                  <a
                    href={SECTION_HREF[c] || '#'}
                    className="text-sm text-foreground transition-colors hover:text-muted-foreground"
                  >
                    {c}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="About">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              About
            </h3>
            <ul className="mt-4 flex flex-col gap-2">
              {ABOUT.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-foreground transition-colors hover:text-muted-foreground"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Bharat · an open, non-commercial data project.</p>
          <div className="flex gap-4">
            <a href="/privacy-policy.html" className="hover:text-foreground">
              Privacy
            </a>
            <a href="/about.html" className="hover:text-foreground">
              Methodology
            </a>
            <a href="/references.html" className="hover:text-foreground">
              Sources
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
