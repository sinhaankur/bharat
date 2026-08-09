import type { Metadata } from 'next'
import PageShell from '@/components/page-shell'
import GeopoliticsBoard from './geopolitics-board'

export const metadata: Metadata = {
  title: 'Geopolitical Chess — the dollar is the board — Bharat',
  description:
    'Fifteen world players, their ruling power, their pieces (with sourced facts) and their moves. A deliberate lens on global power. Framing labelled, facts sourced.',
}

export default function GeopoliticsPage() {
  return (
    <PageShell
      eyebrow="Power · a labelled lens"
      title="The dollar is the board"
      intro="Every country is a player. See what each brings to the table, who really rules it, and the move it is making — short game and long. A deliberate framing, built on sourced facts."
    >
      <GeopoliticsBoard />
    </PageShell>
  )
}
