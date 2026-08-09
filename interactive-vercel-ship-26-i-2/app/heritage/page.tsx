import type { Metadata } from 'next'
import PageShell from '@/components/page-shell'
import HeritageExplorer from './heritage-explorer'

export const metadata: Metadata = {
  title: 'Sacred ground — a sourced atlas of temples & sites — Bharat',
  description:
    'A sourced atlas of Sanatan, Jain, Buddhist, Sikh and other sacred sites of Bharat and beyond — builder, lifespan, and the multi-actor record of destruction.',
}

export default function HeritagePage() {
  return (
    <PageShell
      eyebrow="Heritage · 137 sacred sites"
      title="Sacred ground"
      intro="Who built it, how long it stood, and what befell it — a sourced atlas of the sacred places of Bharat and the roads beyond. Multi-actor and cited, never one-sided."
    >
      <HeritageExplorer />
    </PageShell>
  )
}
