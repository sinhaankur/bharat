import type { Metadata } from 'next'
import PageShell from '@/components/page-shell'
import GlobalCompare from './global-compare'

export const metadata: Metadata = {
  title: 'India vs the world — GDP, income & industry — Bharat',
  description:
    'How India ranks among 222 countries — GDP, GNI per person, population and industry share, from the World Bank indicators. India highlighted.',
}

export default function GlobalPage() {
  return (
    <PageShell
      eyebrow="Comparison · World Bank indicators"
      title="India, among the nations"
      intro="Where India stands in the world — by the size of its economy, the income of its people, and the shape of what it makes. Switch the measure; India is marked in gold."
    >
      <GlobalCompare />
    </PageShell>
  )
}
