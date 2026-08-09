import type { Metadata } from 'next'
import PageShell from '@/components/page-shell'
import ScriptsView from './scripts-view'

export const metadata: Metadata = {
  title: 'Scripts of Bharat — Brahmi’s tree — Bharat',
  description:
    'The scripts of India, all descended from Brahmi — seen as one Sanskrit word written a dozen ways, and as a family tree from the root.',
}

export default function ScriptsPage() {
  return (
    <PageShell
      eyebrow="Writing · Brahmi’s children"
      title="One root, a hundred hands"
      intro="Nearly every script of South and Southeast Asia descends from a single ancestor — Brahmi. See the proof in one word written a dozen ways, then walk the family tree from the root."
    >
      <ScriptsView />
    </PageShell>
  )
}
