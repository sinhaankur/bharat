import type { Metadata } from 'next'
import { Libre_Franklin, Fraunces } from 'next/font/google'
import { GeistMono } from 'geist/font/mono'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const libreFranklin = Libre_Franklin({
  subsets: ['latin'],
  variable: '--font-libre-franklin',
  display: 'swap',
})

// Fraunces is the display serif — mapped to the --font-playfair var so every
// existing `font-serif` usage picks it up without renaming any component class.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Bharat — Money, Land & Memory',
  description:
    'A data-driven magazine for India. Where public money goes across 594 districts, the land and law that shape it, the deep past in language, script and DNA, and the record behind the headlines. Sourced, or it is a gap.',
  generator: 'Bharat atlas',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`theme-ashoka bg-background ${libreFranklin.variable} ${fraunces.variable} ${GeistMono.variable}`}
    >
      <body className="cine-grain bg-background font-sans text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
