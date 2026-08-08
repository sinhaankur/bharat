import type { Metadata } from 'next'
import PageShell from '@/components/page-shell'
import IndiaMap from './india-map'

export const metadata: Metadata = {
  title: 'The map — India by state | Bharat',
  description:
    'An interactive choropleth of India’s states — recolour by dimension, hover or tap a state to read it. The full district-level fiscal map (all 594) lives on the atlas.',
}

export default function MapPage() {
  return (
    <PageShell
      brief={{
        section: 'Money',
        explainer:
          'An interactive map of India’s 36 states & UTs — recolour by a chosen dimension and read any state. The atlas’s signature view, native in the app.',
        research:
          'State polygons from open GeoJSON, projected and rendered as SVG (no map library). The sample dimension values here are illustrative and labeled as such; the full district-level figures (all 594) live on the atlas, sourced-or-gap.',
        references: [
          { label: 'The full district map', href: '/index.html' },
          { label: 'State of India (ranked)', href: '/state-of-india.html' },
          { label: 'All sources', href: '/references.html' },
        ],
        docs: '/how-it-works.html',
        updated: '2026-08-07',
      }}
    >
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <div className="text-[11px] font-bold uppercase tracking-widest text-accent">Money · the map</div>
        <h1 className="mt-2 font-serif text-3xl font-black leading-tight md:text-5xl">
          India, <em className="italic">by state</em>
        </h1>
        <p className="mb-8 mt-3 max-w-2xl leading-relaxed text-muted-foreground">
          Pick a dimension to recolour the map, then hover or tap a state. This is the app-native map;
          the full <a href="/index.html" className="text-accent hover:underline">district-level atlas</a> maps
          all 594.
        </p>
        <IndiaMap />
      </div>
    </PageShell>
  )
}
