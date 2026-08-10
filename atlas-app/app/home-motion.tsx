'use client'

import { useEffect } from 'react'

// Home motion — ported from the handoff Atlas Home.dc.html script: the intro splash
// exit, sequenced [data-seq] reveals, and the animated [data-count] stat counters.
// Reduce-motion safe (snaps everything to final state).
export default function HomeMotion() {
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const intro = document.querySelector<HTMLElement>('[data-intro]')
    const introOn = !reduced && intro && !sessionStorage.getItem('atlas-intro-seen')

    if (intro) {
      if (!introOn) intro.style.display = 'none'
      else {
        sessionStorage.setItem('atlas-intro-seen', '1')
        intro.addEventListener('animationend', (e) => {
          if ((e as AnimationEvent).animationName === 'introExit') intro.style.display = 'none'
        })
      }
    }

    const timers: number[] = []
    const seq = Array.from(document.querySelectorAll<HTMLElement>('[data-seq]'))
    const base = introOn ? 1850 : 150
    seq.forEach((el, i) => {
      if (reduced) { el.style.opacity = '1'; el.style.transform = 'none'; return }
      timers.push(window.setTimeout(() => {
        el.style.transition = 'opacity .7s cubic-bezier(.2,.6,.2,1), transform .7s cubic-bezier(.2,.6,.2,1)'
        el.style.opacity = '1'; el.style.transform = 'none'
      }, base + i * 140))
    })

    const counters = Array.from(document.querySelectorAll<HTMLElement>('[data-count]'))
    const finalText = (el: HTMLElement) =>
      (+el.dataset.count!).toFixed(+(el.dataset.decimals || 0)) + (el.dataset.suffix || '')
    const run = (el: HTMLElement) => {
      const target = +el.dataset.count!, dec = +(el.dataset.decimals || 0), suffix = el.dataset.suffix || ''
      const t0 = performance.now(), dur = 1400
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3)
        el.textContent = (target * e).toFixed(dec) + suffix
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }
    let io: IntersectionObserver | null = null
    if (reduced) counters.forEach((el) => (el.textContent = finalText(el)))
    else {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { run(e.target as HTMLElement); io!.unobserve(e.target) } })
      }, { threshold: 0.5 })
      counters.forEach((el) => io!.observe(el))
    }

    return () => { timers.forEach(clearTimeout); io?.disconnect() }
  }, [])

  return null
}
