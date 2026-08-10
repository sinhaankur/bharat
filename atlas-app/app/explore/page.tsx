import type { Metadata } from 'next'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import ExploreClient from './explore-client'

export const metadata: Metadata = {
  title: 'Explore — query 594 districts · Bharat',
  description: 'Combine facets with AND to find the districts where legal risk, physical risk and money dysfunction overlap. The query is shareable via URL.',
}

export default function ExplorePage() {
  return (
    <>
      <SiteHeader />
      <ExploreClient />
      <SiteFooter />
    </>
  )
}
