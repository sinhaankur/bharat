import SiteHeader from '@/components/site-header'
import TrendingTicker from '@/components/trending-ticker'
import BharatHero from '@/components/bharat-hero'
import StatBand from '@/components/stat-band'
import IndiaFocal from '@/components/india-focal'
import AtlasMap from '@/components/atlas-map'
import RevealObserver from '@/components/indic/reveal-observer'
import LatestGrid from '@/components/latest-grid'
import EditorialStandards from '@/components/editorial-standards'
import NewsletterBand from '@/components/newsletter-band'
import SiteFooter from '@/components/site-footer'

export default function Page() {
  return (
    <div className="cine-grain theme-ashoka min-h-screen bg-background">
      <RevealObserver />
      <SiteHeader />
      <TrendingTicker />
      <main>
        {/* the front door — glowing, mandala, living logo, parallax */}
        <BharatHero />
        {/* the number band + dark chain-of-command thesis (from the mockups) */}
        <StatBand />
        {/* the India map — the key focal point, drawn from data */}
        <IndiaFocal />
        {/* everything we've built, mapped into one navigable house */}
        <AtlasMap />
        {/* the latest stories below the fold */}
        <LatestGrid />
        <EditorialStandards />
        <NewsletterBand />
      </main>
      <SiteFooter />
    </div>
  )
}
