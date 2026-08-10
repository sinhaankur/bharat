import type { Metadata } from 'next'
// Self-hosted fonts via @fontsource — bundled into the app, so there is NO network
// fetch at build time (next/font/google was aborting the CI build when the Google
// Fonts request failed) or at runtime. Weights match the handoff.
import '@fontsource/archivo/400.css'
import '@fontsource/archivo/600.css'
import '@fontsource/archivo/700.css'
import '@fontsource/archivo/800.css'
import '@fontsource/fraunces/400.css'
import '@fontsource/fraunces/600.css'
import '@fontsource/fraunces/700.css'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/600.css'
import SvgSprite from '@/components/svg-sprite'
import CommandPalette from '@/components/command-palette'
import ReaderPanel from '@/components/reader-panel'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bharat — the India District Atlas',
  description:
    'Money, land, and law — side by side for 594 districts. Every figure cites a public source; a missing number is shown as an explicit gap, never guessed.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SvgSprite />
        {children}
        <CommandPalette />
        <ReaderPanel />
      </body>
    </html>
  )
}
