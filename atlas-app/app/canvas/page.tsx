import type { Metadata } from 'next'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import CanvasFrame from './canvas-frame'

// The canvas — the handoff's "Atlas Mockups" design deck served as-is (a self-contained
// multi-screen canvas: the Understand India hero, Ashoka's rule of the land, the Mauryan
// Atomic Design System, the whole-site page map, the Money/land/law home, the Birbhum
// edict-ledger and the Engines). Embedded here inside the app chrome; the deck itself
// lives at public/canvas/.
export const metadata: Metadata = {
  title: 'The canvas — every screen, one deck · Bharat',
  description:
    'The full Atlas design canvas: the home hero, Ashoka’s rule of the land, the atomic design system, the whole-site page map, the Birbhum edict-ledger and the Engines — laid out end to end.',
}

export default function CanvasPage() {
  return (
    <>
      <SiteHeader />
      <CanvasFrame />
      <SiteFooter />
    </>
  )
}
