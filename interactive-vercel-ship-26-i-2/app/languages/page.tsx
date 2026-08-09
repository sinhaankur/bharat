import type { Metadata } from 'next'
import PageShell from '@/components/page-shell'
import LanguagesExplorer from './languages-explorer'

export const metadata: Metadata = {
  title: 'Languages of Bharat — families, scripts & fonts — Bharat',
  description:
    'India’s languages by family — Indo-Aryan, Dravidian, Austroasiatic, Tibeto-Burman — each written in its own script and its own self-hosted font. Sourced.',
}

export default function LanguagesPage() {
  return (
    <PageShell
      eyebrow="Languages · scripts · fonts"
      title="Every tongue, its own letters"
      intro="India writes in more scripts than any other country — each language in a hand of its own. Here they are by family, rendered in our own self-hosted Indic type."
    >
      <LanguagesExplorer />
    </PageShell>
  )
}
