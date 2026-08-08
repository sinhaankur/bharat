'use client'

// ─────────────────────────────────────────────────────────────────────────
// MAURYAN MUSIC — "how it could have sounded." Megasthenes' Indica records that
// Chandragupta's court prized song and dance, that music halls stood across the
// realm, and that North and South shared one idiom. No notation survives — so
// this is an honest IMAGINED reconstruction, synthesised in the browser:
//   · a tanpura-like drone (Sa–Pa), the spine of Indian music
//   · a plucked veena-ish melody over an ancient pentatonic-leaning scale
// Clearly labelled as conjecture, not a recording. Web Audio, no files.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'

// a plausible early Indian scale (leaning on the shadja-grama's natural notes),
// ratios over the tonic Sa. Kept pentatonic-ish for an ancient, open sound.
const SA = 196 // G3 — a warm tonic
const SCALE = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2] // Sa Re Ga Pa Dha Sá

// a short, wandering phrase (indices into SCALE, with rests as -1)
const PHRASE = [0, 1, 2, 1, 3, 2, 4, 3, 5, 4, 3, 2, -1, 2, 1, 0]

export default function MauryanMusic() {
  const [playing, setPlaying] = useState(false)
  const ctxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<{ stop: () => void } | null>(null)
  const [step, setStep] = useState(-1)

  useEffect(() => () => stop(), []) // cleanup on unmount

  function pluck(ctx: AudioContext, freq: number, t: number, dur: number, gain = 0.18) {
    // a simple Karplus-ish plucked tone: two detuned saws through a lowpass + decay
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(gain, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.setValueAtTime(2200, t)
    lp.frequency.exponentialRampToValueAtTime(700, t + dur)
    ;[freq, freq * 1.005].forEach((f) => {
      const o = ctx.createOscillator()
      o.type = 'sawtooth'
      o.frequency.value = f
      o.connect(g)
      o.start(t)
      o.stop(t + dur)
    })
    g.connect(lp).connect(ctx.destination)
  }

  function drone(ctx: AudioContext) {
    // Sa + Pa held soft under everything
    const stops: (() => void)[] = []
    ;[SA / 2, (SA * 3) / 4].forEach((f) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'triangle'
      o.frequency.value = f
      g.gain.value = 0.05
      o.connect(g).connect(ctx.destination)
      o.start()
      stops.push(() => {
        try {
          o.stop()
        } catch {}
      })
    })
    return () => stops.forEach((s) => s())
  }

  function start() {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    ctxRef.current = ctx
    const stopDrone = drone(ctx)
    const beat = 0.42
    let i = 0
    const t0 = ctx.currentTime + 0.1

    // schedule a couple of loops
    const total = PHRASE.length
    const scheduleLoop = (loop: number) => {
      PHRASE.forEach((idx, k) => {
        if (idx < 0) return
        const t = t0 + (loop * total + k) * beat
        pluck(ctx, SA * SCALE[idx], t, beat * 1.6)
      })
    }
    scheduleLoop(0)
    scheduleLoop(1)

    // visual step indicator
    const iv = setInterval(() => {
      setStep((s) => (s + 1) % total)
      i++
      if (i > total * 2) {
        clearInterval(iv)
      }
    }, beat * 1000)

    nodesRef.current = {
      stop: () => {
        clearInterval(iv)
        stopDrone()
        setTimeout(() => ctx.close().catch(() => {}), 100)
      },
    }
    setPlaying(true)

    // auto-stop after two loops
    setTimeout(() => stop(), total * 2 * beat * 1000 + 400)
  }

  function stop() {
    nodesRef.current?.stop()
    nodesRef.current = null
    ctxRef.current = null
    setPlaying(false)
    setStep(-1)
  }

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6 md:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)]">
            Imagined reconstruction · not a recording
          </div>
          <h3 className="bharati text-2xl font-black tracking-tight">How it could have sounded</h3>
        </div>
        <button
          type="button"
          onClick={playing ? stop : start}
          className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-[var(--accent)] px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-[var(--accent-foreground)] transition-transform hover:scale-[1.03]"
        >
          {playing ? '■ Stop' : '▶ Play the court'}
        </button>
      </div>

      {/* the phrase, lit note by note */}
      <div className="mb-4 flex flex-wrap gap-1.5" aria-hidden="true">
        {PHRASE.map((idx, k) => (
          <span
            key={k}
            className="h-8 flex-1 rounded transition-all duration-200"
            style={{
              minWidth: 10,
              background:
                idx < 0
                  ? 'transparent'
                  : k === step
                    ? 'var(--accent)'
                    : 'color-mix(in srgb, var(--accent) 22%, transparent)',
              transform: k === step ? 'scaleY(1.15)' : 'scaleY(1)',
              border: idx < 0 ? '1px dashed var(--border)' : 'none',
            }}
          />
        ))}
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        Megasthenes wrote that Chandragupta’s court loved song and dance, that music halls stood
        across the realm, and that North and South shared one idiom. No notation survives — so this
        is a guess in good faith: a tanpura-like <strong>drone</strong> on Sa–Pa, the spine of Indian
        music, under a plucked <strong>veena</strong>-ish line on an open, ancient scale.
      </p>
    </div>
  )
}
