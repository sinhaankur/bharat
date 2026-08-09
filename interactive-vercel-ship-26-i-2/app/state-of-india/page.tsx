import type { Metadata } from 'next'
import PageShell from '@/components/page-shell'
import StatesView from './states-view'

export const metadata: Metadata = {
  title: 'State of India — who carries the country — Bharat',
  description:
    'Every state — its population, its share of the Finance Commission pool, and an honest read of its strengths and strains. Sourced.',
}

export default function StateOfIndiaPage() {
  return (
    <PageShell
      eyebrow="Money · the states"
      title="Who carries the country"
      intro="India runs on its states. Here is each one — how many people it holds, its slice of the shared money pool, and an honest account of what it gives and what it strains under."
    >
      <StatesView />
    </PageShell>
  )
}
