import SiteHeader from '@/components/site-header'
import AtlasHome from '@/components/atlas-home'
import IndiaFocal from '@/components/india-focal'
import AtlasMap from '@/components/atlas-map'
import RevealObserver from '@/components/indic/reveal-observer'
import SiteFooter from '@/components/site-footer'

export default function Page() {
  return (
    <div className="theme-ashoka min-h-screen bg-background">
      <RevealObserver />
      <SiteHeader />
      <main>
        {/* the approved Atlas Home mockup — intro splash, gridded hero, stats, entry grid */}
        <AtlasHome />
        {/* the India map — the key focal point, drawn from data */}
        <IndiaFocal />
        {/* everything we've built, mapped into one navigable house */}
        <AtlasMap />
      </main>
      <SiteFooter />
    </div>
  )
}
