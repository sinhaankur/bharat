import type { Metadata } from 'next'
import PageShell from '@/components/page-shell'
import TsunamiList from './tsunami-list'

export const metadata: Metadata = {
  title: 'Earthquake & tsunami — the waves that struck India — Bharat',
  description:
    'The great tsunamis that struck the Indian coast — source quake, run-up, total and India-specific death tolls and impact. Sourced.',
}

export default function QuakeTsunamiPage() {
  return (
    <PageShell
      eyebrow="Hazard · the record"
      title="When the sea rose"
      intro="The great tsunamis that reached the Indian coast — the quake that spawned each, how high the water climbed, and what it cost, in lives and in the places it took."
    >
      <TsunamiList />
    </PageShell>
  )
}
