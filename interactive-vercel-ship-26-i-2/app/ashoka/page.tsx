import type { Metadata } from 'next'
import PageShell from '@/components/page-shell'
import AshokaSites from './ashoka-sites'

export const metadata: Metadata = {
  title: 'Ashoka’s rule of the land — where the edicts stand — Bharat',
  description:
    'The 25 places where Ashoka carved his edicts — from Kandahar to Karnataka, on rock, pillar and cave, in Brahmi, Kharoshthi, Greek and Aramaic.',
}

export default function AshokaPage() {
  return (
    <PageShell
      eyebrow="Empire · the reach of an edict"
      title="Where the empire spoke"
      intro="An emperor’s conscience, carved into the land itself — from a bilingual Greek-and-Aramaic rock at Kandahar to pillars deep in the south. This is the map of where Ashoka spoke."
    >
      <AshokaSites />
    </PageShell>
  )
}
