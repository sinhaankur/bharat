// SCRIPTS SECTION — "the writing material shaped the letter" (from the mock).
// Four groups by material: palm leaf (round southern scripts), birch bark (sharp
// north), Sanchi/aloe bark (Assam), copper plate (the compact chancery hands).
// Sample glyphs render in their own self-hosted Noto Indic fonts (.f-* classes).

type ScriptSample = { name: string; glyph: string; font: string }
type Group = { material: string; why: string; scripts: ScriptSample[] }

const GROUPS: Group[] = [
  {
    material: 'Palm leaf → the round scripts',
    why: 'A stylus dragged straight along a palm leaf splits it at the fibre — so Odia, Tamil, Malayalam, Telugu and Kannada bent every stroke into curves and hoops.',
    scripts: [
      { name: 'Odia', glyph: 'ଅ', font: 'f-odia' },
      { name: 'Tamil', glyph: 'அ', font: 'f-tamil' },
      { name: 'Malayalam', glyph: 'അ', font: 'f-malayalam' },
      { name: 'Telugu', glyph: 'అ', font: 'f-telugu' },
      { name: 'Kannada', glyph: 'ಅ', font: 'f-kannada' },
    ],
  },
  {
    material: 'Birch bark → the sharp north',
    why: 'Bhojpatra from Himalayan birches takes ink from a reed pen — so Sharada and Devanagari kept straight strokes and the headline the pen could pull.',
    scripts: [
      { name: 'Devanagari', glyph: 'अ', font: 'f-devanagari' },
      { name: 'Gurmukhi', glyph: 'ਅ', font: 'f-gurmukhi' },
      { name: 'Gujarati', glyph: 'અ', font: 'f-gujarati' },
    ],
  },
  {
    material: 'Sanchi bark → Assam’s hand',
    why: 'The aloe-bark folios of Kamarupa carried the Assamese letterforms — sized between leaf-curve and pen-line.',
    scripts: [
      { name: 'Bengali–Assamese', glyph: 'অ', font: 'f-bengali' },
    ],
  },
  {
    material: 'Copper plate → the chancery',
    why: 'Land grants chiselled in copper demanded compact, unambiguous forms — the discipline behind Modi, Nandinagari and grant-hand Grantha.',
    scripts: [
      { name: 'Brahmi (root)', glyph: '𑀅', font: 'f-brahmi' },
      { name: 'Grantha', glyph: '𑌅', font: 'f-grantha' },
    ],
  },
]

export default function ScriptsSection() {
  return (
    <section className="py-16" aria-label="The writing material shaped the letter">
      <span className="block text-[11px] uppercase tracking-[0.1em] text-[#8a3a12]">Scripts</span>
      <h2 className="m-0 mt-2 text-[clamp(28px,3.4vw,40px)] leading-tight" style={{ fontFamily: "'Rozha One', serif" }}>
        The material shaped the letter.
      </h2>
      <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-[#2a2018]/75">
        Every Indic script descends from Brahmi — but the surface it was written on bent its shapes.
        Round in the south where the stylus split the leaf; sharp in the north where the reed pen ruled the bark.
      </p>

      <div className="mt-10 grid gap-0.5 border-2 border-[#3a2c1e] bg-[#3a2c1e] md:grid-cols-2">
        {GROUPS.map((g) => (
          <div key={g.material} className="bg-[#f6f0e1] p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a3a12]">{g.material}</div>
            <p className="mt-2 text-[13px] leading-relaxed text-[#2a2018]/75">{g.why}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {g.scripts.map((s) => (
                <div key={s.name} className="flex flex-col items-center gap-1.5 border border-[#3a2c1e]/20 bg-white/40 px-3 py-2 text-center">
                  <span className={`${s.font} text-3xl leading-none text-[#2a2018]`}>{s.glyph}</span>
                  <span className="text-[10px] uppercase tracking-wide text-[#2a2018]/60">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
