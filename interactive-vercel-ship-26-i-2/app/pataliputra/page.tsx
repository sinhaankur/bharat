import type { Metadata } from 'next'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import RevealObserver from '@/components/indic/reveal-observer'
import FloralGlow from '@/components/indic/floral-glow'
import TempleOrnament from '@/components/indic/ornament'
import CineTitle from '@/components/indic/cine-title'
import MandalaButton from '@/components/indic/mandala-button'
import Chakra from '@/components/indic/chakra'
import PunchCoin from '@/components/indic/punch-coin'
import Griffin from '@/components/indic/griffin'
import MauryanMusic from '@/components/indic/mauryan-music'

export const metadata: Metadata = {
  title: 'Pataliputra — the god-gifted city — Bharat',
  description:
    'How the Mauryan capital was described by Megasthenes and Faxian — and how archaeology at Kumhrar and Bulandi Bagh proved the wonder was real. A sourced history.',
}

// ── sourced facts, with the citation attached to each (sourced-or-gap) ──
const WITNESSES = [
  {
    who: 'Megasthenes',
    when: 'c. 300 BCE',
    role: 'Greek ambassador of Seleucus to Chandragupta',
    quote:
      'The city stretches ten miles along the river; a moat 600 feet broad and 45 feet deep girds a timber wall of 570 towers and 64 gates.',
    note: 'Preserved through Arrian. He likened the palace to Susa and Ecbatana — the great Persian capitals.',
  },
  {
    who: 'Faxian (Fa-Hien)',
    when: 'c. 400 CE',
    role: 'Chinese Buddhist pilgrim, centuries after the empire',
    quote:
      'The halls and walls, the carved work and inlaid sculpture — no human hands of this world could make them. They were the work of spirits.',
    note: 'He believed the ruined palaces were god-gifted, built by devas rather than men.',
  },
]

const DIG = [
  {
    year: '1895',
    who: 'L. A. Waddell',
    site: 'Bulandi Bagh',
    found: 'Excavated the massive wooden palisade — the timber city wall Megasthenes had described, found in the earth.',
  },
  {
    year: '1912',
    who: 'D. B. Spooner',
    site: 'Kumhrar',
    found: 'Unearthed a polished sandstone pillar and traced 72 ash-pits where columns once stood.',
  },
  {
    year: '1951–55',
    who: 'K. P. Jaiswal',
    site: 'Kumhrar',
    found: 'Found 8 more pits — completing the plan: an 80-pillar hypostyle hall, 8 rows of 10.',
  },
]

const PILLAR_HALL = [
  ['Plan', '8 rows × 10 = 80 pillars'],
  ['Spacing', '4.57 m between pillars'],
  ['Height', '9.75 m each (2.74 m buried)'],
  ['Stone', 'Chunar sandstone monoliths'],
  ['Finish', 'the mirror Mauryan polish'],
  ['Roof', 'timber — the stone held up wood'],
]

export default function PataliputraPage() {
  return (
    <div className="cine-grain theme-ashoka min-h-screen bg-background text-foreground">
      <RevealObserver />
      <SiteHeader />

      {/* ── cinematic masthead ── */}
      <header className="cine-vignette relative flex min-h-[70vh] items-center overflow-hidden border-b border-border">
        <FloralGlow intensity={0.9} />
        <div
          aria-hidden="true"
          className="ken-burns pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.10]"
          style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_BASE_PATH || ''}/backgrounds/shikhara_light.webp)` }}
        />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center">
          <div className="mb-4 flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
            <Chakra size={13} color="var(--accent)" /> Mauryan capital · 321–185 BCE
          </div>
          <CineTitle
            text="The god-gifted city"
            className="bharati text-5xl font-black leading-tight tracking-tight md:text-7xl"
          />
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Two travellers, seven centuries apart, said Pataliputra was too perfect for human
            hands. For a long time we called it legend. Then the spades of archaeology found
            the timber wall, and the eighty pillars, exactly where the stories said.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 md:px-6 py-16">
        {/* ── the witnesses ── */}
        <section className="mb-20">
          <h2 className="cine-reveal bharati mb-8 text-3xl font-black tracking-tight">
            What the travellers saw
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {WITNESSES.map((w) => (
              <figure
                key={w.who}
                className="cine-reveal relative flex flex-col rounded-xl border border-border bg-card/70 p-6"
              >
                <blockquote className="text-lg italic leading-relaxed text-foreground">
                  “{w.quote}”
                </blockquote>
                <figcaption className="mt-4 border-t border-border pt-4">
                  <div className="font-bold text-foreground">{w.who}</div>
                  <div className="text-sm text-[var(--accent)]">{w.when} · {w.role}</div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{w.note}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ── the dig: story → proof ── */}
        <section className="mb-20">
          <h2 className="cine-reveal bharati mb-2 text-3xl font-black tracking-tight">
            Then the earth gave up the proof
          </h2>
          <p className="cine-reveal mb-8 max-w-2xl text-muted-foreground">
            Between 1895 and 1955, three excavations turned the traveller’s tale into stratigraphy.
          </p>
          <ol className="relative space-y-6 border-l-2 border-[var(--accent)]/40 pl-6">
            {DIG.map((d) => (
              <li key={d.year} className="cine-reveal relative">
                <span className="absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-[var(--accent)] bg-background">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                </span>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-mono text-sm font-bold text-[var(--accent)]">{d.year}</span>
                  <span className="font-semibold text-foreground">{d.who}</span>
                  <span className="text-sm text-muted-foreground">· {d.site}</span>
                </div>
                <p className="mt-1 leading-relaxed text-muted-foreground">{d.found}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── the 80-pillared hall — a data readout ── */}
        <section className="mb-20">
          <div className="cine-reveal grid items-center gap-8 rounded-2xl border border-border bg-card/60 p-6 md:grid-cols-[1fr_auto] md:p-8">
            <div>
              <h2 className="bharati mb-2 text-3xl font-black tracking-tight">The eighty-pillar hall</h2>
              <p className="mb-6 text-muted-foreground">
                A hypostyle audience hall at Kumhrar — later, the site of Ashoka’s Third Buddhist
                Council. The stone was monolithic and mirror-polished; the roof it carried was wood.
              </p>
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {PILLAR_HALL.map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-border bg-background p-3">
                    <dt className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)]">{k}</dt>
                    <dd className="mt-1 text-sm font-semibold leading-snug text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="mx-auto hidden md:block" aria-hidden="true">
              <TempleOrnament name="capital" width={190} className="drop-shadow-sm" />
            </div>
          </div>
        </section>

        {/* ── the coin: money of the empire ── */}
        <section className="mb-20">
          <h2 className="cine-reveal bharati mb-2 text-3xl font-black tracking-tight">
            The money it ran on
          </h2>
          <p className="cine-reveal mb-8 max-w-2xl text-muted-foreground">
            The empire’s coin was the silver <em>karshapana</em> — not stamped with one royal
            face, but struck with several independent <strong>punches</strong>, each a symbol of
            authority. We redrew them as a seal.
          </p>
          <div className="cine-reveal grid items-center gap-8 rounded-2xl border border-border bg-card/60 p-6 md:grid-cols-[auto_1fr] md:p-8">
            <div className="mx-auto lift">
              <PunchCoin size={190} spin />
            </div>
            <div>
              <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-[var(--accent)]">
                Karshapana · silver · c. 4th–2nd century BCE
              </div>
              <p className="mb-4 leading-relaxed text-muted-foreground">
                Each mark was punched separately, so no two coins are quite alike. The symbols
                recur across the Gangetic hoards:
              </p>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                {[
                  ['Sun', 'radiant order'],
                  ['Six-arm symbol', 'the shadara / wheel'],
                  ['Tree-in-railing', 'a sacred grove'],
                  ['Hill & crescent', 'the marked land'],
                  ['Elephant', 'royal power'],
                  ['Taurine', 'the filler mark'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-semibold text-foreground">{k}</dt>
                    <dd className="text-muted-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ── the griffin: lion + eagle ── */}
        <section className="mb-20">
          <div className="cine-reveal grid items-center gap-8 rounded-2xl border border-border bg-card/60 p-6 md:grid-cols-[auto_1fr] md:p-8">
            <div className="mx-auto lift">
              <Griffin size={190} />
            </div>
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[var(--accent)]">
                Shirdal · the lion-eagle · a travelling guardian
              </div>
              <h2 className="bharati mb-3 text-3xl font-black tracking-tight">
                What is a griffin doing in India?
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                Lion’s body, eagle’s head and wings — king of beasts fused with king of the air.
                The griffin was a hallmark of Achaemenid <strong>Persepolis</strong>, and it rode the
                same Indo-Persian channels as the polished pillar and the lotus into Mauryan-era art.
                The twist: Greek writers <em>Ctesias</em> and <em>Aelian</em> called the griffin an{' '}
                <strong>Indian</strong> beast — a gold-guarding creature of the far north. So the
                question runs both ways. Borrowed guardian, or a memory of India returning home?
              </p>
            </div>
          </div>
        </section>

        {/* ── the music of the court ── */}
        <section className="mb-20">
          <MauryanMusic />
        </section>

        {/* ── Persia connection ── */}
        <section className="mb-20">
          <div className="cine-reveal rounded-xl border-l-4 border-[var(--accent)] bg-card/50 p-6">
            <h3 className="mb-2 text-lg font-bold text-foreground">Persia in the polish</h3>
            <p className="leading-relaxed text-muted-foreground">
              Megasthenes measured Pataliputra against Susa and Ecbatana, and the debt shows: the
              lustrous stone, the lotus motif, the very idea of carving royal proclamations onto
              pillars all echo Achaemenid Persepolis. But the differences are the point — the Ashokan
              shaft is a single monolith where the Persian is stacked drums; its surface is smooth
              where theirs is fluted; and it stands <em>alone</em>, a free monument, not a roof-beam
              in a larger hall. Borrowed grammar, a new sentence.
            </p>
          </div>
        </section>

        {/* ── why it was hidden ── */}
        <section className="mb-20">
          <div className="cine-reveal rounded-2xl border border-border bg-[#1c1614] p-6 text-[#efe3cc] md:p-8">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[#d79a4e]">
              Lost · then found · 1837
            </div>
            <h2 className="bharati mb-3 text-3xl font-black tracking-tight">
              Why was the greatest king forgotten?
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <p className="leading-relaxed text-[#efe3cc]/75">
                For nearly <strong>700 years</strong> Ashoka was a ghost. His edicts stood in plain
                sight on rocks and pillars across the land — but no one alive could read them. The{' '}
                <strong>Brahmi</strong> script had died, and with it the memory of the man. He
                survived only as a fairy-tale “too-good-to-be-true” king in Buddhist legend, dismissed
                as myth.
              </p>
              <p className="leading-relaxed text-[#efe3cc]/75">
                Two things buried him. Brahmi fell out of use, so the writing became silent stone; and
                the <strong>Shunga</strong> reaction after 185 BCE, with its revival of Brahmanism,
                had little reason to keep a Buddhist emperor’s memory alive. Then in{' '}
                <strong>1837</strong>, James Prinsep cracked Brahmi — and “Beloved-of-the-Gods, King
                Piyadasi” spoke again. In 1915 an edict finally gave the name: <em>Ashoka</em>.
              </p>
            </div>
            <blockquote className="mt-6 border-l-2 border-[#d79a4e] pl-4 text-lg italic text-[#efe3cc]">
              “Amidst the tens of thousands of names of monarchs… the name of Ashoka shines, and
              shines almost alone, a star.”
              <span className="mt-1 block text-sm not-italic text-[#efe3cc]/60">— H. G. Wells</span>
            </blockquote>
          </div>
        </section>

        {/* ── onward ── */}
        <section className="cine-reveal flex flex-col items-center gap-4 rounded-2xl border border-border bg-card/60 p-10 text-center">
          <h2 className="bharati text-2xl font-black tracking-tight">Read the empire in stone</h2>
          <p className="max-w-xl text-muted-foreground">
            The pillars, the polish, the lion capital and the lotus bell — the whole Mauryan
            grammar is the root of our design language.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <MandalaButton href="/mauryan">See the design language</MandalaButton>
            <MandalaButton href="/ancient-india" variant="ghost">The timeline</MandalaButton>
          </div>
        </section>

        {/* ── sources (sourced-or-gap) ── */}
        <section className="mt-16 border-t border-border pt-6">
          <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-[var(--muted-foreground)]">
            Sources
          </h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>· Megasthenes, <em>Indica</em> (fragments preserved in Arrian & Strabo).</li>
            <li>· Faxian, <em>Record of Buddhistic Kingdoms</em>, tr. James Legge.</li>
            <li>· Waddell (1895), Bulandi Bagh palisade; Spooner (1912) & Jaiswal (1951–55), Kumhrar 80-pillar hall — ASI excavation reports.</li>
            <li>· Vajiram &amp; Ravi, <em>Mauryan Art, Architecture &amp; Literature</em> (UPSC notes).</li>
          </ul>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
