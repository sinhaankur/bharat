import type { Metadata } from 'next'
import PageShell from '@/components/page-shell'
import AtrocitiesChart from './atrocities-chart'

export const metadata: Metadata = {
  title: 'Population Control, Marauder Style — an atlas of atrocity — Bharat',
  description:
    'The 100 deadliest episodes of mass death in history, ranked by toll (after Matthew White). India-linked events highlighted.',
}

export default function AtrocitiesPage() {
  return (
    <PageShell
      eyebrow="History · after Matthew White"
      title="Population Control, Marauder Style"
      intro="The hundred deadliest episodes of mass death that history records — war, despotism, famine, oppression — ranked by their estimated toll. The events that touched India are marked in gold."
    >
      <AtrocitiesChart />
    </PageShell>
  )
}
