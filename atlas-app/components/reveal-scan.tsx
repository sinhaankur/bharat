'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Global attribute-based scroll-reveal: any element marked [data-reveal] fades + rises
// in when it enters the viewport (CSS in globals.css). Complements the <Reveal> wrapper
// component — this one needs no wrapping, just the attribute, so existing markup (cards,
// rows, headings) can opt in cheaply. Mounted once in the root layout; re-scans on route
// change. Reduce-motion safe: shows everything immediately.
export default function RevealScan() {
  const pathname = usePathname()

  useEffect(() => {
    const reduced =
      matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.getAttribute('data-reduce') === 'on'

    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)'))
    if (!els.length) return

    if (reduced) { els.forEach((el) => el.classList.add('is-in')); return }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          const el = e.target as HTMLElement
          const delay = Number(el.dataset.revealDelay || 0)
          if (delay) el.style.transitionDelay = `${delay}ms`
          el.classList.add('is-in')
          io.unobserve(el)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [pathname])

  return null
}
