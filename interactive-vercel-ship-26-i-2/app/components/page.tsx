import type { Metadata } from 'next'
import Gallery from './gallery'

export const metadata: Metadata = {
  title: 'Component library — Bharat design system',
  description: 'The atomic component library (atoms · molecules · organisms) of the Bharat Mauryan/Gupta design system.',
}

export default function ComponentsPage() {
  return <Gallery />
}
