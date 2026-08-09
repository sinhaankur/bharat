import type { Metadata } from 'next'
import PageShell from '@/components/page-shell'
import EncroachmentList from './encroachment-list'

export const metadata: Metadata = {
  title: 'Built where the water returns — encroachment cases — Bharat',
  description:
    'Documented cases of construction on land the water reclaims — floodplains, lakebeds, wetlands — each ruled on by the NGT, a court, or the CAG. Sourced.',
}

export default function EncroachmentPage() {
  return (
    <PageShell
      eyebrow="Land & law · NGT / court / CAG rulings"
      title="Built where the water returns"
      intro="Developers build on land the water reclaims — floodplains, lakebeds, wetlands. Here are the documented cases, each with the ruling that named it and the water body it took."
    >
      <EncroachmentList />
    </PageShell>
  )
}
