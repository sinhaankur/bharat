import type { Metadata } from 'next'
import PageShell from '@/components/page-shell'
import IndustryTimeline from './industry-timeline'

export const metadata: Metadata = {
  title: 'How a district industrialised — Munger — Bharat',
  description:
    'One district, three regimes — Munger, Bihar: the Nawabi gun trade, colonial ITC and railway works, and the Nehruvian PSU era. An ownership-lineage timeline.',
}

export default function DistrictIndustryPage() {
  return (
    <PageShell
      eyebrow="Money · industrial heritage"
      title="How a district industrialised"
      intro="Read one district as a stack of regimes. Munger, Bihar — the Nawabi arsenal, Asia’s first cigarette factory and railway workshop, then the PSU state — each plant carrying its founding, its era, and who owned it."
    >
      <IndustryTimeline />
    </PageShell>
  )
}
