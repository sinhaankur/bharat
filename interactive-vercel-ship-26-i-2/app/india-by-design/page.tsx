import type { Metadata } from 'next'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import RevealObserver from '@/components/indic/reveal-observer'
import SegmentLattice from './segment-lattice'
import ScriptsSection from './scripts-section'
import MoreSections from './more-sections'
import data from './segments.json'

export const metadata: Metadata = {
  title: 'India, by design systems — Bharat',
  description:
    'Every state’s interface language, derived from what it built and wove — temple, loom, ghat and fort. One Modernist chassis; thirty-four token layers.',
}

const COUNT = (data as { regions: { segments: unknown[] }[] }).regions.reduce((a, r) => a + r.segments.length, 0)

export default function IndiaByDesignPage() {
  return (
    <div className="min-h-screen" style={{ background: '#e9e0cb', color: '#2a2018', fontFamily: 'Karla, sans-serif' }}>
      <RevealObserver />
      <SiteHeader />

      <div className="mx-auto max-w-[1240px] px-[clamp(20px,5vw,72px)]">
        {/* hero */}
        <section className="pb-16 pt-24">
          <span className="block text-[13px] uppercase tracking-[0.08em] text-[#8a3a12]">
            Indic Designs — the segmented family
            <span className="ml-2.5 bg-[rgba(201,134,43,0.18)] px-1.5 py-0.5 align-[1px] text-[9.5px] tracking-[0.08em] text-[#8a3a12]">V1.5</span>
          </span>
          <h1 className="m-0 mt-5 text-[clamp(40px,5.8vw,76px)] leading-[1.06]" style={{ fontFamily: "'Rozha One', serif" }}>
            <span className="block">India,</span>
            <span className="block">by design systems.</span>
          </h1>
          <p className="mt-8 max-w-[58ch] text-[17px] leading-7">
            Every state’s interface language, derived from what it built and wove — temple, loom, ghat,
            and fort. One Modernist chassis; thirty-four token layers. Where invasion took the temple,
            the remnant carries the language.
          </p>
          <div className="mt-7 flex flex-wrap gap-3.5">
            <a href="#lattice" className="inline-block bg-[#c1440e] px-5 py-3 text-[15px] font-semibold text-[#f6f0e1] transition-colors hover:bg-[#a23409]">
              Open the canvas
            </a>
            <a href="/mauryan" className="inline-block border-2 border-[#2a2018] px-5 py-2.5 text-[15px] font-semibold text-[#2a2018] transition-colors hover:bg-[#2a2018] hover:text-[#f6f0e1]">
              The design system
            </a>
          </div>
          {/* stats */}
          <div className="mt-12 flex flex-wrap gap-[clamp(24px,4vw,64px)]">
            {[[COUNT, 'Segments'], [8, 'Sheeted in full'], [1, 'Shared chassis']].map(([n, label]) => (
              <div key={label as string}>
                <p className="m-0 text-[34px] text-[#c1440e]" style={{ fontFamily: "'Rozha One', serif" }}>{n as number}</p>
                <p className="mt-1.5 text-[11px] uppercase tracking-[0.08em] text-[#2a2018]/70">{label as string}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="h-0.5 bg-[#3a2c1e]" />

        {/* the segment lattice */}
        <div id="lattice" className="pt-14">
          <SegmentLattice />
        </div>

        {/* the scripts — the material shaped the letter */}
        <div className="border-t-2 border-[#3a2c1e]">
          <ScriptsSection />
        </div>

        {/* Flags · Timeline · Chassis · Poster */}
        <MoreSections />
      </div>

      <SiteFooter />
    </div>
  )
}
