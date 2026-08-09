import type { Metadata } from 'next'
import PageShell from '@/components/page-shell'
import JourneyView from './journey-view'

export const metadata: Metadata = {
  title: 'The journey of a word — Bharat',
  description:
    'One meaning — “mother” — traced from Proto-Indo-European, through Sanskrit and the Dravidian substrate, into the living languages of India.',
}

export default function JourneyPage() {
  return (
    <PageShell
      eyebrow="Language · one word, across time"
      title="The journey of a word"
      intro="Follow a single idea — “mother” — down the centuries: from a voice we can no longer hear, through Sanskrit and the Dravidian tongues, into the words spoken today."
    >
      <JourneyView />
    </PageShell>
  )
}
