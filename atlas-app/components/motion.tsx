'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Motion PRIMITIVES — the design-system components everything uses for animation.
// Thin wrappers over `motion` that bake in our tokens/variants (lib/motion) and the
// reduce-motion contract, so pages never hand-roll transitions or forget a11y.
//
//   <Reveal>        rise + fade when scrolled into view (whileInView)
//   <Stagger>/<Item> a container whose children cascade in
//   <Press>         hover-lift + tap-press feedback (spring)
// Motion is respected: if the reader wants reduced motion, these render statically.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState, type ReactNode } from 'react'
import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react'
import { revealV, staggerV, staggerItemV, pressV, prefersReduced } from '@/lib/motion'

// combine the OS/media reduced-motion signal with the site's a11y reader toggle
function useReduced(): boolean {
  const os = useReducedMotion()
  const [toggle, setToggle] = useState(false)
  useEffect(() => {
    const read = () => setToggle(prefersReduced())
    read()
    const mo = new MutationObserver(read)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-reduce', 'data-reduce-motion'] })
    return () => mo.disconnect()
  }, [])
  return !!os || toggle
}

// Reveal — rise/fade in once when it scrolls into view.
export function Reveal({
  children, className, delay = 0, as = 'div', ...rest
}: { children: ReactNode; className?: string; delay?: number; as?: 'div' | 'section' | 'article' } & HTMLMotionProps<'div'>) {
  const reduced = useReduced()
  const M = (motion as any)[as]
  if (reduced) return <M className={className} {...rest}>{children}</M>
  return (
    <M
      className={className}
      variants={revealV}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay: delay / 1000 }}
      {...rest}
    >
      {children}
    </M>
  )
}

// Stagger — a container that cascades its <Item> children in on view.
export function Stagger({ children, className, as = 'div', ...rest }: { children: ReactNode; className?: string; as?: 'div' | 'section' } & HTMLMotionProps<'div'>) {
  const reduced = useReduced()
  const M = (motion as any)[as]
  if (reduced) return <M className={className} {...rest}>{children}</M>
  return (
    <M className={className} variants={staggerV} initial="hidden" whileInView="shown" viewport={{ once: true, amount: 0.1 }} {...rest}>
      {children}
    </M>
  )
}
export function Item({ children, className, as = 'div', ...rest }: { children: ReactNode; className?: string; as?: 'div' | 'article' | 'li' } & HTMLMotionProps<'div'>) {
  const reduced = useReduced()
  const M = (motion as any)[as]
  if (reduced) return <M className={className} {...rest}>{children}</M>
  return <M className={className} variants={staggerItemV} {...rest}>{children}</M>
}

// Press — hover-lift + tap-press. Wrap any interactive surface.
export function Press({ children, className, as = 'div', ...rest }: { children: ReactNode; className?: string; as?: 'div' | 'button' | 'a' } & HTMLMotionProps<'div'>) {
  const reduced = useReduced()
  const M = (motion as any)[as]
  if (reduced) return <M className={className} {...rest}>{children}</M>
  return <M className={className} whileHover={pressV.whileHover} whileTap={pressV.whileTap} {...rest}>{children}</M>
}
