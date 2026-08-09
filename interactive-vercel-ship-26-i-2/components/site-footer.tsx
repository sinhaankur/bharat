'use client'

// SITE FOOTER — the dark maroon "temple interior" footer from the Atlas Mockups
// (turn 5b): jali texture, a newsletter band, the living भ seal, four gold-labelled
// columns (Map / 3D / Study / Trust), a floral divider and a multi-script baseline.
// All links resolve to real native routes via the atlas registry.
import Link from 'next/link'
import { hrefFor, findPage, sectionFront } from '@/lib/atlas-pages'
import { BharatMark } from '@/components/indic/bharat-logo'
import Icon from '@/components/indic/icon'

const nav = (slug: string, fallback = '/atlas') => {
  const p = findPage(slug)
  return p ? hrefFor(p) : fallback
}

const COLS: { label: string; links: [string, string][] }[] = [
  {
    label: 'Map',
    links: [
      ['The atlas', nav('index')],
      ['Explore & query', nav('explore')],
      ['The feed', nav('feed')],
      ['Chain of command', nav('command-chain')],
    ],
  },
  {
    label: '3D',
    links: [
      ['The globe', nav('india-3d')],
      ['Topography', nav('terrain-3d')],
      ['Flood explorer', nav('flood-3d')],
      ['Cave walk', nav('cave-walk')],
    ],
  },
  {
    label: 'Study',
    links: [
      ['The engines', nav('engines')],
      ['Ashoka’s edicts', nav('edicts')],
      ['Heritage atlas', nav('heritage-atlas')],
      ['Languages', nav('languages')],
    ],
  },
  {
    label: 'Trust',
    links: [
      ['Every source', nav('references')],
      ['Provenance ledger', nav('provenance')],
      ['Methodology', nav('about')],
      ['The design system', nav('design')],
    ],
  },
]

const SCRIPTS = ['भ', 'ভ', 'ப', 'భ', 'ಭ', 'ഭ', 'ભ', 'ਭ', 'ଭ']

export default function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#301818] text-[var(--ajanta-ivory,#efe3cc)]">
      {/* jali texture wash — the mockup #jali-dark lattice */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <pattern id="footer-jali" width="60" height="60" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="#c9a227" strokeWidth="1" opacity="0.12">
              <path d="M30 6 L38 22 L54 30 L38 38 L30 54 L22 38 L6 30 L22 22 Z" />
              <rect x="14" y="14" width="32" height="32" transform="rotate(45 30 30)" />
              <circle cx="30" cy="30" r="6" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#footer-jali)" />
      </svg>

      {/* newsletter band */}
      <div className="relative flex flex-col items-start gap-5 border-b border-[rgba(201,162,39,.3)] px-6 py-6 md:flex-row md:items-center md:gap-6">
        <div className="flex-1">
          <div className="bharati text-lg font-bold">Follow the money to your district.</div>
          <div className="mt-1 text-xs text-[rgba(239,227,204,.6)]">
            One email a month — what changed in the data, what got sourced, what’s still a gap. No tracking.
          </div>
        </div>
        <form className="flex" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="your@email.in"
            aria-label="Email"
            className="min-w-[220px] rounded-l-[2px] border border-r-0 border-[rgba(201,162,39,.45)] bg-black/25 px-3.5 py-2.5 text-[12.5px] text-[var(--ajanta-ivory,#efe3cc)] placeholder-[rgba(239,227,204,.5)] outline-none"
          />
          <button className="rounded-r-[2px] bg-[var(--accent)] px-4 py-2.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-[#a06b00]">
            Subscribe
          </button>
        </form>
      </div>

      {/* columns */}
      <div className="relative grid grid-cols-2 gap-6 px-6 pb-6 pt-8 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        {/* brand */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <BharatMark size={40} color="#c9a227" ink="#efe3cc" />
            <span className="leading-none">
              <span className="bharati block text-[22px] font-bold">Bharat<span className="text-[#c9a227]">.</span></span>
              <span className="mt-0.5 block font-mono text-[7px] uppercase tracking-[0.2em] text-[rgba(239,227,204,.55)]">By the evidence</span>
            </span>
          </div>
          <p className="mt-3 max-w-[230px] text-[15px] italic leading-relaxed text-[rgba(239,227,204,.75)]" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Sourced, or it’s a gap — never fabricated.
          </p>
          <div className="mt-4 flex gap-2">
            <Link href="/atlas" className="rounded-[2px] border border-[rgba(201,162,39,.4)] px-2.5 py-1.5 text-[11px] font-semibold text-[#c9a227] transition-colors hover:bg-[rgba(201,162,39,.15)]">All pages ↗</Link>
            <Link href={nav('data')} className="rounded-[2px] border border-[rgba(201,162,39,.4)] px-2.5 py-1.5 text-[11px] font-semibold text-[#c9a227] transition-colors hover:bg-[rgba(201,162,39,.15)]">Data &amp; API</Link>
          </div>
        </div>

        {COLS.map((col) => (
          <nav key={col.label} aria-label={col.label}>
            <div className="mb-2.5 border-b border-[rgba(201,162,39,.3)] pb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c9a227]">
              {col.label}
            </div>
            <div className="flex flex-col gap-1.5 text-[12px] text-[rgba(239,227,204,.75)]">
              {col.links.map(([label, href]) => (
                <Link key={label} href={href} className="transition-colors hover:text-[#efe3cc]">{label}</Link>
              ))}
            </div>
          </nav>
        ))}
      </div>

      {/* floral divider — the exact mockup #floral vine, gold, clearly visible */}
      <svg className="relative block h-[22px] w-full" aria-hidden="true" preserveAspectRatio="none">
        <defs>
          <pattern id="footer-floral" width="40" height="22" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="#c9a227" strokeWidth="1.3">
              <path d="M0 11 C 8 3, 12 3, 20 11 S 32 19, 40 11" />
              <path d="M10 7 c -3 -4, 3 -4, 0 0" fill="#c9a227" />
              <path d="M30 15 c -3 4, 3 4, 0 0" fill="#c9a227" />
              <circle cx="20" cy="11" r="2" fill="#c9a227" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="22" fill="url(#footer-floral)" opacity="0.6" />
      </svg>

      {/* baseline */}
      <div className="relative flex flex-wrap items-center gap-x-3.5 gap-y-2 border-t border-[rgba(201,162,39,.3)] px-6 py-3 text-[11px] text-[rgba(239,227,204,.55)]">
        <span>© {new Date().getFullYear()} Bharat · independent civic-data project · MIT</span>
        <span>·</span>
        <span>Not affiliated with any government body</span>
        <span className="ml-2 flex gap-2.5 text-[13px]" title="Every language of Bharat" aria-hidden="true">
          {SCRIPTS.map((g, i) => (
            <span key={i} className="cursor-default transition-colors hover:text-[#c9a227]">{g}</span>
          ))}
        </span>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#c9a227]">
          <Icon name="chakra" size={12} /> Sourced — or it’s a gap
        </span>
      </div>
    </footer>
  )
}
