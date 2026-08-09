import type { Metadata } from 'next'
import PageShell from '@/components/page-shell'
import VedasReader from './vedas-reader'

export const metadata: Metadata = {
  title: 'The Hymn of Creation — Nāsadīya Sūkta — Bharat',
  description:
    'The Nāsadīya Sūkta (Ṛgveda 10.129) — the Hymn of Creation. Original Devanagari, IAST romanisation, word-by-word gloss and English, verse by verse.',
}

export default function VedasPage() {
  return (
    <PageShell
      eyebrow="Ṛgveda 10.129 · ~1500–1200 BCE"
      title="The Hymn of Creation"
      intro="One of the oldest surviving reflections on where everything came from — the Nāsadīya Sūkta. Read in its own script, sounded out, glossed word by word, and turned into English."
    >
      <VedasReader />
    </PageShell>
  )
}
