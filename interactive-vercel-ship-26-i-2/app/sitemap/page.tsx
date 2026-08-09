import type { Metadata } from 'next'
import Link from 'next/link'
import PageShell from '@/components/page-shell'
import Icon, { type IconName } from '@/components/indic/icon'
import { ATLAS_PAGES, SECTIONS, pagesBySection, hrefFor, type Section } from '@/lib/atlas-pages'

export const metadata: Metadata = {
  title: 'Site map — every page — Bharat',
  description:
    'The information architecture of Bharat — every page, grouped by front. Native pages and framed originals alike. Everything clickable, nothing hidden.',
}

const SECTION_ICON: Record<Section, IconName> = {
  News: 'edict', Money: 'coin', Land: 'pillar', History: 'stupa',
  Languages: 'lotus', '3D': 'torana', Data: 'jali', About: 'chakra',
}

export default function SitemapPage() {
  const total = ATLAS_PAGES.length
  const native = ATLAS_PAGES.filter((p) => p.native).length
  return (
    <PageShell
      eyebrow={`Information architecture · ${total} pages`}
      title="Everything, mapped"
      intro="The whole house, front by front. Every page links out — native builds and framed originals alike. Nothing hidden, nothing dead."
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-14">
        {/* counts */}
        <div className="mb-10 flex flex-wrap gap-6 stone-reveal">
          {[[total, 'Pages'], [native, 'Native builds'], [SECTIONS.length, 'Fronts']].map(([n, l]) => (
            <div key={l as string}>
              <div className="bharati text-3xl font-black text-[var(--accent)]">{n as number}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{l as string}</div>
            </div>
          ))}
        </div>

        {/* the fronts */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {SECTIONS.map((section) => {
            const pages = pagesBySection(section)
            if (!pages.length) return null
            return (
              <section key={section} className="stone-reveal rounded-lg border border-border bg-card/50 p-5">
                <h2 className="mb-3 flex items-center gap-2 border-b border-border pb-2 text-sm font-bold uppercase tracking-widest text-[var(--accent)]">
                  <Icon name={SECTION_ICON[section]} size={16} />
                  {section}
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">{pages.length}</span>
                </h2>
                <ul className="space-y-1.5">
                  {pages.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={hrefFor(p)}
                        className="group flex items-center gap-1.5 text-sm text-foreground transition-colors hover:text-[var(--accent)]"
                      >
                        <span className="truncate">{p.title}</span>
                        {p.native && (
                          <span className="shrink-0 rounded-[2px] bg-[var(--accent)]/12 px-1 text-[8px] font-bold uppercase tracking-wide text-[var(--accent)]">
                            live
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </div>
    </PageShell>
  )
}
