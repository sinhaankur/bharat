import type { Metadata } from 'next'
import PageShell from '@/components/page-shell'
import AncientTimeline from './timeline'
import data from './data.json'

export const metadata: Metadata = {
  title: 'Ancient India — one timeline: language, script, people, rulers & heritage | Bharat',
  description:
    'A single chronological spine for ancient India — each era read on five facets (language, script, people from DNA, rulers, heritage), with the evidence behind every fact open to interrogation.',
}

export default function Page() {
  return (
    <PageShell
      brief={{
        section: 'History',
        explainer:
          'Five thousand years of India on one spine — each era read on five facets (language, script, people, rulers, heritage), with the evidence behind every fact open to interrogation.',
        research:
          "Built from peer-reviewed ancient-DNA papers (Narasimhan & Shinde 2019), Ashoka's own edicts, and paleography. Each fact carries an evidence tier and a 'shaped by the winner' check; contested points (e.g. the Aryan-migration narrative) are flagged, not resolved.",
        references: [
          { label: 'Ancient DNA (Science 2019)', href: 'https://www.science.org/doi/10.1126/science.aat7487' },
          { label: 'Edicts of Ashoka', href: 'https://en.wikipedia.org/wiki/Edicts_of_Ashoka' },
          { label: 'All sources', href: '/references.html' },
        ],
        docs: '/how-it-works.html',
        updated: '2026-08-07',
      }}
    >
      {/* @ts-expect-error — JSON import is loosely typed */}
      <AncientTimeline data={data} />
    </PageShell>
  )
}
