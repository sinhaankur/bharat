import type { Metadata } from 'next'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import RevenueClient from './revenue-client'

export const metadata: Metadata = {
  title: 'The state ledger — revenue, corruption, GSDP · Bharat',
  description: 'A state choropleth across FY15→FY24 and three Finance Commissions, in nine views. Click a state for its revenue trend and governance footprint.',
}

export default function RevenuePage() {
  return (
    <>
      <SiteHeader />
      <RevenueClient />
      <SiteFooter />
    </>
  )
}
