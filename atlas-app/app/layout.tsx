import type { Metadata } from 'next'
import { Archivo, Fraunces, Instrument_Serif, JetBrains_Mono } from 'next/font/google'
import SvgSprite from '@/components/svg-sprite'
import CommandPalette from '@/components/command-palette'
import ReaderPanel from '@/components/reader-panel'
import './globals.css'

// Type system from the handoff: Archivo carries the whole Modernist UI; Fraunces +
// Instrument Serif + JetBrains Mono are kept for the "house register" (ledger) only.
const archivo = Archivo({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-archivo', display: 'swap' })
const fraunces = Fraunces({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-fraunces', display: 'swap' })
const instrument = Instrument_Serif({ subsets: ['latin'], weight: ['400'], style: ['normal', 'italic'], variable: '--font-instrument', display: 'swap' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-jetbrains', display: 'swap' })

export const metadata: Metadata = {
  title: 'Bharat — the India District Atlas',
  description:
    'Money, land, and law — side by side for 594 districts. Every figure cites a public source; a missing number is shown as an explicit gap, never guessed.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${fraunces.variable} ${instrument.variable} ${jetbrains.variable}`}>
      <body>
        <SvgSprite />
        {children}
        <CommandPalette />
        <ReaderPanel />
      </body>
    </html>
  )
}
