'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

export default function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className = '',
}: {
  children: ReactNode
  delay?: number
  as?: 'div' | 'section' | 'article' | 'li'
  className?: string
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const Component = Tag as any

  return (
    <Component
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ ['--reveal-delay' as string]: `${delay}ms` }}
    >
      {children}
    </Component>
  )
}
