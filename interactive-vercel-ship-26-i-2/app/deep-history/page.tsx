import type { Metadata } from 'next'
import PageShell from '@/components/page-shell'
import DnaTimeline from './dna-timeline'
import data from './data.json'

export const metadata: Metadata = {
  title: 'Deep history in DNA — the population shifts that made South Asia | Bharat',
  description:
    'What ancient DNA reveals about who migrated, mixed and was replaced across the subcontinent — held strictly to peer-reviewed science, with the “Aryan migration” debate flagged as a contested interpretation of undisputed data.',
}

export default function Page() {
  return (
    <PageShell
      brief={{
        section: 'History',
        explainer:
          'What ancient DNA reveals about who migrated, mixed and was replaced across South Asia — from Neanderthals to the Steppe and the Indus genome.',
        research:
          'Held strictly to peer-reviewed ancient-DNA science (Reich lab; Narasimhan & Shinde 2019). A genetic finding (established) is kept separate from a historical interpretation (the “Aryan migration” debate is flagged contested).',
        references: [
          { label: 'Narasimhan 2019 (Science)', href: 'https://www.science.org/doi/10.1126/science.aat7487' },
          { label: 'Shinde 2019 (Cell)', href: 'https://doi.org/10.1016/j.cell.2019.08.048' },
          { label: 'All sources', href: '/references.html' },
        ],
        docs: '/how-it-works.html',
        updated: '2026-08-07',
      }}
    >
      {/* @ts-expect-error — JSON import is loosely typed */}
      <DnaTimeline data={data} />
    </PageShell>
  )
}
