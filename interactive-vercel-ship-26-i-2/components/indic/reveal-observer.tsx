'use client'

// ─────────────────────────────────────────────────────────────────────────
// REVEAL OBSERVER — one global watcher that reveals every `.stone-reveal` on
// the page as it scrolls into view (adds `.is-in`). Drop it once near the top
// of a page; it also re-scans when new nodes mount. Reduce-motion → reveal all
// immediately (the CSS already no-ops the transition under reduce-motion).
// ─────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react'

export default function RevealObserver() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const nodes = () =>
      Array.from(
        document.querySelectorAll<HTMLElement>('.stone-reveal:not(.is-in), .cine-reveal:not(.is-in)'),
      )

    if (reduce) {
      nodes().forEach((n) => n.classList.add('is-in'))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    const observeAll = () => nodes().forEach((n) => io.observe(n))
    observeAll()

    // catch anything that mounts after first paint
    const mo = new MutationObserver(observeAll)
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])

  return null
}
