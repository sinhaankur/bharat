'use client'

// The remaining sections of "India by Design Systems": Flags · Timeline ·
// Version register · Chassis · Poster close. Interactive (hover reveals, the
// timeline scrubs), from the mock.
import { useState } from 'react'

const FLAGS: { name: string; note: string; colors: [string, string] }[] = [
  { name: 'Bhagwa', note: 'The jari-patka — the saffron swallowtail that rode with the Maratha columns.', colors: ['#e8801f', '#c1440e'] },
  { name: 'Puli', note: 'The tiger standard of the Chola navy — ink roundel on vermilion.', colors: ['#b02a17', '#2a2018'] },
  { name: 'Kayal', note: 'The twin-carp banner of Madurai — the Pandya fish.', colors: ['#c98a2b', '#7a1f14'] },
  { name: 'Vil', note: 'The bow-and-arrow standard of the Cheras.', colors: ['#4f6b45', '#2a2018'] },
  { name: 'Varaha', note: 'The boar banner under sun and moon marks — Vijayanagara.', colors: ['#8a3a12', '#c98a2b'] },
  { name: 'Nishan Sahib', note: 'The triangular standard flying over the sarovar — Harmandir.', colors: ['#e8a13a', '#2a4a7a'] },
  { name: 'Surya', note: 'The crimson field and gold sun of Mewar.', colors: ['#a01f1f', '#e8b04a'] },
  { name: 'Dar-chog', note: 'Prayer flags in the five-colour order — Ladakh, Sikkim, Tawang.', colors: ['#2a6f9e', '#c98a2b'] },
  { name: 'Bana', note: 'Changed at dusk every day atop the Nila Chakra, 65 m above the street — Puri.', colors: ['#b02a17', '#efe3cc'] },
  { name: 'Garuda-dhvaja', note: 'Raised on the dhvaja-stambha to open the festival — Tirupati’s Brahmotsavam.', colors: ['#8a3a12', '#e8b04a'] },
  { name: 'Nandi-dhvaja', note: 'The bull standard over Shiva’s courts — the vahana names the flag.', colors: ['#4a4038', '#c98a2b'] },
  { name: 'Kodi', note: 'The gold pennant up the teak kodimaram — held for the ten utsavam days.', colors: ['#c98a2b', '#7a1f14'] },
]

const ERAS: { name: string; note: string }[] = [
  { name: 'Mauryan — the first stone', note: 'Barabar’s polished caves and the stupa railings: architecture learns stone.' },
  { name: 'Sanchi — the gateway', note: 'Torana gates rise over the stupa — the first monumental threshold.' },
  { name: 'Gupta — the first temples', note: 'The flat-roofed cell at Sanchi and Deogarh: garbhagriha + porch, the seed form.' },
  { name: 'The laboratory — Aihole to Mamallapuram', note: 'Chalukya workshops and the Pallava rathas prototype both families side by side.' },
  { name: 'Karkota — Martand', note: 'Kashmir builds its sun temple in grey limestone: trefoil arcades, 84 columns.' },
  { name: 'Rashtrakuta — Kailasa', note: 'Ellora is cut downward out of the living ridge — design by removal.' },
  { name: 'Chandela + Chola — the climax of height', note: 'Khajuraho clusters its spires into one mountain; Thanjavur stacks 13 storeys.' },
  { name: 'Ganga — Konark', note: 'The temple becomes a machine: 24 sundial wheels, seven horses.' },
  { name: 'Mewar + Vijayanagara', note: 'Ranakpur’s 1,444-pillar marble forest; Hampi’s granite bazaars.' },
  { name: 'Nayaka — the gateway wins', note: 'Madurai’s gopurams tower over the shrine they guard — the threshold triumphs.' },
]

export default function MoreSections() {
  const [era, setEra] = useState(0)

  return (
    <>
      {/* FLAGS */}
      <section className="border-t-2 border-[#3a2c1e] py-16">
        <span className="block text-[11px] uppercase tracking-[0.1em] text-[#8a3a12]">Flags</span>
        <h2 className="m-0 mt-2 text-[clamp(28px,3.4vw,40px)] leading-tight" style={{ fontFamily: "'Rozha One', serif" }}>
          The standards it flew.
        </h2>
        <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-[#2a2018]/75">
          Before the state flag there were a hundred — swallowtail, roundel, pennant. Each names a
          dynasty and a colour law. Hover any to read it.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-0.5 border-2 border-[#3a2c1e] bg-[#3a2c1e] sm:grid-cols-3 lg:grid-cols-4">
          {FLAGS.map((f) => (
            <div key={f.name} className="group bg-[#f6f0e1] p-4 transition-colors hover:bg-[#fdf9ee]">
              <div className="mb-3 flex h-10 overflow-hidden border border-[#3a2c1e]/20">
                <div className="flex-1" style={{ background: f.colors[0] }} />
                <div className="w-1/3" style={{ background: f.colors[1] }} />
              </div>
              <div className="text-[16px]" style={{ fontFamily: "'Rozha One', serif" }}>{f.name}</div>
              <p className="mt-1 text-[11.5px] leading-4 text-[#2a2018]/70">{f.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TIMELINE — interactive scrubber */}
      <section className="border-t-2 border-[#3a2c1e] py-16">
        <span className="block text-[11px] uppercase tracking-[0.1em] text-[#8a3a12]">Timeline</span>
        <h2 className="m-0 mt-2 text-[clamp(28px,3.4vw,40px)] leading-tight" style={{ fontFamily: "'Rozha One', serif" }}>
          How the form evolved.
        </h2>
        <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-[#2a2018]/75">
          From the first polished cave to the gateway that outgrew its shrine. Click an era.
        </p>
        {/* era buttons */}
        <div className="mt-8 flex flex-wrap gap-1.5">
          {ERAS.map((e, i) => (
            <button
              key={i}
              onClick={() => setEra(i)}
              className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                era === i ? 'bg-[#c1440e] text-[#f6f0e1]' : 'bg-[#f6f0e1] text-[#2a2018] hover:bg-[#fdf9ee]'
              }`}
              style={{ border: '1px solid #3a2c1e' }}
            >
              {String(i + 1).padStart(2, '0')}
            </button>
          ))}
        </div>
        {/* active era detail */}
        <div className="mt-6 border-2 border-[#3a2c1e] bg-[#f6f0e1] p-6">
          <div className="text-[24px]" style={{ fontFamily: "'Rozha One', serif" }}>{ERAS[era].name}</div>
          <p className="mt-2 text-[15px] leading-relaxed text-[#2a2018]/80">{ERAS[era].note}</p>
        </div>
      </section>

      {/* CHASSIS */}
      <section className="border-t-2 border-[#3a2c1e] py-16">
        <span className="block text-[11px] uppercase tracking-[0.1em] text-[#8a3a12]">The chassis</span>
        <h2 className="m-0 mt-2 text-[clamp(28px,3.4vw,40px)] leading-tight" style={{ fontFamily: "'Rozha One', serif" }}>
          One Modernist frame under all thirty-four.
        </h2>
        <div className="mt-6 grid gap-0.5 border-2 border-[#3a2c1e] bg-[#3a2c1e] sm:grid-cols-3">
          {[
            ['Archivo, flush left', 'One heading family, left-aligned, no centred columns.'],
            ['2px seams, zero radius', 'Every join is a 2px rule; corners stay square — carved, not soft.'],
            ['The token layer swaps', 'Only colour, motif and script change per state; the grid holds.'],
          ].map(([t, d]) => (
            <div key={t} className="bg-[#f6f0e1] p-5">
              <div className="text-[16px] font-bold">{t}</div>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#2a2018]/70">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* POSTER CLOSE */}
      <section className="border-t-2 border-[#3a2c1e] py-24 text-center">
        <p className="mx-auto max-w-[46ch] text-[clamp(24px,3.2vw,38px)] leading-[1.25]" style={{ fontFamily: "'Rozha One', serif" }}>
          Giving structure to information is the work of design and language — the temple’s measure,
          the loom’s band, the script’s curve.
        </p>
        <p className="mt-6 text-[11px] uppercase tracking-[0.16em] text-[#8a3a12]">
          India, by design systems · V1.5
        </p>
      </section>
    </>
  )
}
