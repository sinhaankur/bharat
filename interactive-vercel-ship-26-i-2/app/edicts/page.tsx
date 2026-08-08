import type { Metadata } from 'next'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import RevealObserver from '@/components/indic/reveal-observer'
import FloralGlow from '@/components/indic/floral-glow'
import CineTitle from '@/components/indic/cine-title'
import MandalaButton from '@/components/indic/mandala-button'
import Chakra from '@/components/indic/chakra'

export const metadata: Metadata = {
  title: 'The Edicts of Ashoka — the empire in his own words — Bharat',
  description:
    'The Rock and Pillar Edicts of Ashoka (Piyadasi) — "all men are my children", the remorse of Kalinga, conquest by Dhamma, and the protection of all life. Sourced from the Dhammika rendering.',
}

// ── the edicts, grouped. Text abridged from Ven. S. Dhammika's rendering. ──
const ROCK = [
  {
    n: 'Rock Edict 1',
    theme: 'No slaughter',
    text: 'Here no living being is to be slaughtered or offered in sacrifice. Formerly, in the kitchen of Beloved-of-the-Gods, hundreds of thousands of animals were killed every day for curry. But now only three creatures are killed — and in time, not even these three.',
  },
  {
    n: 'Rock Edict 2',
    theme: 'Medicine for all',
    text: 'Everywhere — even among the Cholas, the Pandyas, and as far as where the Greek king Antiochos rules — provision has been made for two kinds of medical treatment: for humans and for animals. Where herbs were lacking, I had them imported and grown. Along the roads I had wells dug and trees planted.',
  },
  {
    n: 'Rock Edict 6',
    theme: 'Report to me anywhere',
    text: 'At any time — whether I am eating, in the women’s quarters, the bed chamber, the chariot, the palanquin, or the park — reporters are to keep me informed of the affairs of the people. Truly, I consider the welfare of all to be my duty.',
  },
  {
    n: 'Rock Edict 12',
    theme: 'Honour every faith',
    text: 'One should not honour only one’s own religion and condemn others. By so doing, one’s own religion benefits, and so do others. Whoever praises his own religion and condemns others, does so out of devotion, thinking "let me glorify my own" — but he only harms his own religion. Therefore contact between religions is good.',
  },
]

const PILLAR = [
  {
    n: 'Pillar Edict 2',
    theme: 'What is Dhamma?',
    text: 'Dhamma is good. But what constitutes Dhamma? Little evil, much good, kindness, generosity, truthfulness and purity.',
  },
  {
    n: 'Pillar Edict 5',
    theme: 'The protected animals',
    text: 'Twenty-six years after my coronation, these animals were declared protected — parrots, geese, wild ducks, bats, ants, terrapins, tortoises, porcupines, squirrels, deer, bulls, wild asses, pigeons, and all four-footed creatures that are neither useful nor eaten. Forests must not be burned without reason, nor to kill creatures. One animal is not to be fed to another.',
  },
]

export default function EdictsPage() {
  return (
    <div className="cine-grain theme-ashoka min-h-screen bg-background text-foreground">
      <RevealObserver />
      <SiteHeader />

      {/* masthead */}
      <header className="cine-vignette relative flex min-h-[68vh] items-center overflow-hidden border-b border-border">
        <FloralGlow intensity={0.9} />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center">
          <div className="mb-4 flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
            <Chakra size={13} color="var(--accent)" spin /> The Edicts · c. 257–242 BCE
          </div>
          <CineTitle
            text="I speak to you in stone"
            className="bharati text-5xl font-black leading-tight tracking-tight md:text-7xl"
          />
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            After Kalinga, Ashoka stopped conquering with armies and began speaking to his people —
            carving his conscience onto rock and pillar across the subcontinent. Unusually for any
            ancient king, he wrote in the first person, in the plain speech of Prakrit. This is his
            voice.
          </p>
          {/* Brahmi: Devanampiya Piyadasi */}
          <p className="f-brahmi mt-6 text-2xl text-[var(--muted-foreground)]/60" aria-hidden="true">
            𑀤𑁂𑀯𑀸𑀦𑀁𑀧𑀺𑀬 𑀧𑀺𑀬𑀤𑀲𑀺
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">
            Devānampiya Piyadasi — “Beloved-of-the-Gods, who looks on with affection”
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-16">
        {/* ── Kalinga: the turn ── */}
        <section className="mb-20">
          <div className="cine-reveal rounded-2xl border border-border bg-[#1c1614] p-6 text-[#efe3cc] md:p-10">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[#d79a4e]">
              Rock Edict 13 · the great turning · 261 BCE
            </div>
            <h2 className="bharati mb-4 text-3xl font-black tracking-tight">The remorse of Kalinga</h2>
            <blockquote className="space-y-4 text-lg leading-relaxed text-[#efe3cc]/90">
              <p>
                “In the conquest of Kalinga, one hundred and fifty thousand were deported, one hundred
                thousand were killed, and many more died. After the Kalingas had been conquered,
                Beloved-of-the-Gods came to feel deep remorse.”
              </p>
              <p>
                “Now Beloved-of-the-Gods considers <em>conquest by Dhamma</em> to be the best conquest.
                I have had this written so that my sons and grandsons should not think new conquests
                worth achieving… let them consider only conquest by Dhamma.”
              </p>
            </blockquote>
            <div className="mt-6 flex flex-wrap gap-6 border-t border-[#d79a4e]/20 pt-5 font-mono text-xs uppercase tracking-widest text-[#d79a4e]">
              <span>100,000 killed</span>
              <span>150,000 deported</span>
              <span>→ war renounced</span>
            </div>
          </div>
        </section>

        {/* ── all men are my children ── */}
        <section className="mb-20 text-center cine-reveal">
          <blockquote className="bharati mx-auto max-w-3xl text-3xl font-black leading-snug tracking-tight md:text-4xl">
            “All men are my children. What I desire for my own children — their welfare and happiness
            in this world and the next — that I desire for all men.”
          </blockquote>
          <p className="mt-4 font-mono text-xs uppercase tracking-widest text-[var(--muted-foreground)]">
            Kalinga Separate Edict 1
          </p>
        </section>

        {/* ── the rock edicts ── */}
        <section className="mb-16">
          <h2 className="cine-reveal bharati mb-8 text-3xl font-black tracking-tight">
            The Rock Edicts
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            {ROCK.map((e) => (
              <article
                key={e.n}
                className="cine-reveal lift flex flex-col rounded-xl border border-border bg-card/70 p-6"
              >
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)]">
                    {e.n}
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">{e.theme}</span>
                </div>
                <p className="leading-relaxed text-foreground/90">{e.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── the pillar edicts ── */}
        <section className="mb-20">
          <h2 className="cine-reveal bharati mb-8 text-3xl font-black tracking-tight">
            The Pillar Edicts
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            {PILLAR.map((e) => (
              <article
                key={e.n}
                className="cine-reveal lift flex flex-col rounded-xl border border-border bg-card/70 p-6"
              >
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)]">
                    {e.n}
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">{e.theme}</span>
                </div>
                <p className="leading-relaxed text-foreground/90">{e.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── conquest by dhamma — the reach ── */}
        <section className="mb-20">
          <div className="cine-reveal rounded-xl border-l-4 border-[var(--accent)] bg-card/50 p-6">
            <h3 className="mb-2 text-lg font-bold text-foreground">Conquest by Dhamma — the reach</h3>
            <p className="leading-relaxed text-muted-foreground">
              Rock Edict 13 names the kings Ashoka sent his message to, and they let us date him
              precisely: <strong>Antiochos</strong> II of Syria, <strong>Ptolemy</strong> II of Egypt,{' '}
              <strong>Antigonos</strong> of Macedonia, <strong>Magas</strong> of Cyrene, and{' '}
              <strong>Alexander</strong> of Epirus — “six hundred yojanas away.” An Indian emperor,
              in the 3rd century BCE, addressing the whole Hellenistic Mediterranean at once.
            </p>
          </div>
        </section>

        {/* ── how we can read it ── */}
        <section className="mb-20 cine-reveal">
          <div className="rounded-2xl border border-border bg-card/60 p-6 md:p-8">
            <h3 className="mb-2 text-lg font-bold text-foreground">How we can read a dead script</h3>
            <p className="leading-relaxed text-muted-foreground">
              These words were unreadable for seven centuries. The Brahmi they are carved in had
              died. In <strong>1837</strong>, James Prinsep deciphered it — and the edicts, and
              Ashoka himself, returned to history. Every Indic script alive today, and many across
              Southeast Asia, descend from this same Brahmi.
            </p>
          </div>
        </section>

        {/* ── onward ── */}
        <section className="cine-reveal flex flex-col items-center gap-4 rounded-2xl border border-border bg-card/60 p-10 text-center">
          <h2 className="bharati text-2xl font-black tracking-tight">Follow the thread</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <MandalaButton href="/pataliputra">The god-gifted city</MandalaButton>
            <MandalaButton href="/mauryan" variant="ghost">The design language</MandalaButton>
          </div>
        </section>

        {/* ── sources ── */}
        <section className="mt-16 border-t border-border pt-6">
          <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-[var(--muted-foreground)]">
            Sources
          </h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>· Ven. S. Dhammika, <em>The Edicts of King Asoka</em> (Buddhist Publication Society, Wheel 386/387, 1993), after A. Sen, D. C. Sircar & D. R. Bhandarkar.</li>
            <li>· James Prinsep’s 1837 decipherment of Brahmi; name confirmed by the Maski edict, 1915.</li>
          </ul>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
