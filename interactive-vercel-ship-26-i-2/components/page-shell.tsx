// PageShell — the STANDARD frame for every native content page, so they all
// share one identity: the Ashoka theme, the header/footer, the reveal observer,
// and (optionally) a cinematic masthead with a floral-glow backdrop + big title.
// Pages just pass their content; the design system is applied here, once.
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import EditorialBrief, { type Brief } from '@/components/editorial-brief'
import RevealObserver from '@/components/indic/reveal-observer'
import FloralGlow from '@/components/indic/floral-glow'
import CineTitle from '@/components/indic/cine-title'
import Chakra from '@/components/indic/chakra'

export default function PageShell({
  children,
  brief,
  title,
  eyebrow,
  intro,
}: {
  children: React.ReactNode
  brief?: Brief
  /** when given, renders the standard cinematic masthead */
  title?: string
  eyebrow?: string
  intro?: string
}) {
  return (
    <div className="theme-ashoka min-h-screen bg-background text-foreground">
      <RevealObserver />
      <SiteHeader />

      {title && (
        <header className="cine-vignette relative overflow-hidden border-b border-border">
          <FloralGlow petals={false} intensity={0.8} />
          {/* same container as the header/footer (max-w-7xl px-4 md:px-6) so edges align */}
          <div className="relative mx-auto max-w-7xl px-4 py-16 text-center md:px-6">
            {eyebrow && (
              <div className="mb-3 flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                <Chakra size={13} color="var(--accent)" /> {eyebrow}
              </div>
            )}
            <CineTitle
              text={title}
              className="bharati mx-auto max-w-4xl text-4xl font-black tracking-tight md:text-6xl"
            />
            {intro && (
              <p className="mx-auto mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
                {intro}
              </p>
            )}
          </div>
        </header>
      )}

      <main className="min-h-[60vh]">{children}</main>
      {brief && <EditorialBrief brief={brief} />}
      <SiteFooter />
    </div>
  )
}
