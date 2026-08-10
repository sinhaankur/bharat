'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

// Reveal — the cinematic layer (mockup 5c): a section rises in once when it scrolls
// into view. Honours reduce-motion (the reader toggle sets html[data-reduce=on] and
// the OS media query) by rendering immediately with no transform.
export default function Reveal({ children, delay = 0, as: Tag = 'div' }: { children: ReactNode; delay?: number; as?: 'div' | 'section' }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const reduce =
      matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.dataset.reduce === 'on'
    if (reduce) { setShown(true); return }

    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { setShown(true); io.unobserve(e.target) }
        })
      },
      { threshold: 0.15 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref as never}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(14px)',
        transition: `opacity .6s cubic-bezier(.2,.6,.2,1) ${delay}ms, transform .6s cubic-bezier(.2,.6,.2,1) ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  )
}
