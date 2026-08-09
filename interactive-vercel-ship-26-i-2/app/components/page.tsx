import type { Metadata } from 'next'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import RevealObserver from '@/components/indic/reveal-observer'
import Gallery from './gallery'

export const metadata: Metadata = {
  title: 'Component library — Bharat design system',
  description: 'The atomic component library (atoms · molecules · organisms) of the Bharat Mauryan/Gupta design system.',
}

export default function ComponentsPage() {
  return (
    <div className="theme-ashoka min-h-screen bg-background text-foreground">
      <RevealObserver />
      <SiteHeader />
      <main>
        <Gallery />
      </main>
      <SiteFooter />
    </div>
  )
}
