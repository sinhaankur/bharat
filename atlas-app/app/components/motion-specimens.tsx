'use client'

// Live specimens for the design system's MOTION layer — each pattern rendered so you
// can see (and hover/tap) it, next to a one-line note. Documents the Framer/Motion
// patterns we adopted: spring, whileHover, whileTap, whileInView, stagger, enter/exit.
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Reveal, Stagger, Item, Press } from '@/components/motion'
import { SPRING } from '@/lib/motion'

function Chip({ children }: { children: React.ReactNode }) {
  return <span style={{ font: '600 10px var(--font-mono)', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', background: 'color-mix(in srgb, var(--ink) 6%, transparent)', padding: '3px 8px' }}>{children}</span>
}

function Demo({ label, note, children }: { label: string; note: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 168 }}>
      <Chip>{label}</Chip>
      <div style={{ minHeight: 84, display: 'grid', placeItems: 'center', border: '1px solid var(--line)', background: 'var(--surface)', padding: 12 }}>{children}</div>
      <span style={{ font: '400 11.5px/1.4 var(--font-ui)', color: 'var(--muted)' }}>{note}</span>
    </div>
  )
}

function box(extra?: React.CSSProperties): React.CSSProperties {
  return { width: 56, height: 56, background: 'var(--accent)', display: 'grid', placeItems: 'center', color: '#fff', font: '700 11px var(--font-ui)', ...extra }
}

export default function MotionSpecimens() {
  const [show, setShow] = useState(true)
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 22, alignItems: 'flex-start' }}>
      <Demo label="whileHover" note="Cards & buttons lift on hover (spring).">
        <motion.div style={box()} whileHover={{ y: -6, scale: 1.05 }} transition={SPRING.ui}>hover</motion.div>
      </Demo>

      <Demo label="whileTap" note="Press-down feedback on tap/click.">
        <motion.div style={box({ cursor: 'pointer' })} whileTap={{ scale: 0.88 }} transition={SPRING.snap}>tap</motion.div>
      </Demo>

      <Demo label="spring drag" note="Physics drag — throw it, it springs back.">
        <motion.div style={box({ cursor: 'grab' })} drag dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} dragElastic={0.5} whileDrag={{ scale: 1.1, cursor: 'grabbing' }}>drag</motion.div>
      </Demo>

      <Demo label="whileInView" note="Reveals once when scrolled into view.">
        <Reveal><div style={box({ background: 'var(--band)' })}>rise</div></Reveal>
      </Demo>

      <Demo label="stagger" note="Children cascade in sequence.">
        <Stagger style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map((i) => <Item key={i}><div style={box({ width: 18, height: 40, background: 'var(--band)' })} /></Item>)}
        </Stagger>
      </Demo>

      <Demo label="enter / exit" note="AnimatePresence — smooth mount & unmount.">
        <div style={{ display: 'grid', placeItems: 'center', gap: 8 }}>
          <AnimatePresence mode="wait">
            {show && (
              <motion.div key="b" style={box()} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={SPRING.snap}>hi</motion.div>
            )}
          </AnimatePresence>
          <button className="btn btn-ghost" onClick={() => setShow((v) => !v)} style={{ fontSize: 11 }}>{show ? 'remove' : 'add'}</button>
        </div>
      </Demo>

      <Demo label="Press primitive" note="<Press> = hover-lift + tap, one wrapper.">
        <Press as="button" className="btn btn-primary">Wear this skin →</Press>
      </Demo>
    </div>
  )
}
