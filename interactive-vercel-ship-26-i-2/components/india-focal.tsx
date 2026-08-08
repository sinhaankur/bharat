'use client'

// ─────────────────────────────────────────────────────────────────────────
// INDIA FOCAL — the map is the hero of the atlas (keep-classic-map principle).
// A cinematic, full-bleed dark stage where the India choropleth sits centre,
// framed by data-viz teasers and a jali/ornament surround. This is the moment
// that says: everything here is India, drawn from data.
// ─────────────────────────────────────────────────────────────────────────

import IndiaMap from '@/app/map/india-map'
import MandalaButton from '@/components/indic/mandala-button'
import CineTitle from '@/components/indic/cine-title'
import Chakra from '@/components/indic/chakra'

const WAYS = [
  { k: 'Choropleth', d: 'States & 594 districts shaded by money, wealth or risk.' },
  { k: 'Flow', d: 'Where public money moves — source to spend, per capita.' },
  { k: 'Terrain', d: 'Flood plains, CRZ zoning, the land the water reclaims.' },
  { k: 'Time', d: 'Scrub a dimension across years — watch the country change.' },
]

export default function IndiaFocal() {
  return (
    <section className="cine-vignette relative overflow-hidden bg-[#1c1614] py-20 text-[#efe3cc]">
      {/* warm stage glow behind the map */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(55% 55% at 50% 45%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center cine-reveal">
          <div className="mb-3 flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-[#d79a4e]">
            <Chakra size={13} color="#d79a4e" spin /> The map is the atlas
          </div>
          <CineTitle
            text="India, drawn from data"
            as="h2"
            className="bharati text-4xl font-black tracking-tight md:text-5xl"
          />
          <p className="mx-auto mt-3 max-w-xl text-[#efe3cc]/70">
            One country, many dimensions. Hover a state, then open the full atlas to go
            district by district — money, land, law and risk.
          </p>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* the map — centre stage, in a carved frame */}
          <div className="cine-reveal relative rounded-2xl border border-[#d79a4e]/25 bg-black/20 p-4 shadow-2xl">
            <IndiaMap />
          </div>

          {/* the ways to read it */}
          <div className="cine-reveal">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#d79a4e]">
              Ways to visualise
            </h3>
            <ul className="mt-4 space-y-3">
              {WAYS.map((w) => (
                <li
                  key={w.k}
                  className="lift rounded-lg border border-[#d79a4e]/20 bg-black/20 p-3 transition-colors hover:border-[#d79a4e]/60"
                >
                  <div className="font-semibold text-[#efe3cc]">{w.k}</div>
                  <div className="mt-0.5 text-sm leading-relaxed text-[#efe3cc]/65">{w.d}</div>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <MandalaButton href="/map">Open the full map</MandalaButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
