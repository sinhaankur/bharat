import type { Metadata } from 'next'
import PageShell from '@/components/page-shell'
import ProvenanceLedger from './provenance-ledger'

export const metadata: Metadata = {
  title: 'Provenance ledger — every figure, its citation — Bharat',
  description:
    'An auditable index of every sourced figure in the atlas and the citation that backs it — by tier, with the gaps shown honestly.',
}

export default function ProvenancePage() {
  return (
    <PageShell
      eyebrow="Method · sourced, or it is a gap"
      title="Show your working"
      intro="Every figure in the atlas is tied to a source — government first, then official aggregate, then labelled provisional. Where there is no source, we say so. This is the ledger."
    >
      <ProvenanceLedger />
    </PageShell>
  )
}
