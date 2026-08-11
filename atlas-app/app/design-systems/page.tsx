import type { Metadata } from 'next'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import FlagshipFrame from './flagship-frame'

export const metadata: Metadata = {
  title: 'India by Design Systems — one chassis, many Indias · Bharat',
  description:
    'INDIC DESIGNS: one Modernist chassis, a token layer per state and culture. Pick a segment to wear it across the whole atlas — Kashmir, Rajasthan, Tamil, Kerala, Assam, Naga and more.',
}

export default function DesignSystemsPage() {
  return (
    <>
      <SiteHeader />
      {/* the full handoff flagship document IS the page (full-bleed) */}
      <FlagshipFrame />
      <SiteFooter />
    </>
  )
}
