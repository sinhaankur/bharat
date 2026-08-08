'use client'

import { useState } from 'react'
import { ShieldCheck, ChevronDown } from 'lucide-react'
import {
  biasScale,
  outletBias,
  standards,
  ownership,
  trustStats,
} from '@/lib/articles'
import Reveal from '@/components/reveal'

export default function EditorialStandards() {
  const [open, setOpen] = useState<string | null>('sourcing')

  return (
    <section
      id="standards"
      aria-labelledby="standards-heading"
      className="border-t-4 border-accent bg-background"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
        {/* Heading */}
        <Reveal>
          <div className="flex items-center gap-2 text-accent-foreground">
            <span className="inline-flex items-center gap-2 bg-accent px-2 py-1 text-xs font-bold uppercase tracking-widest text-accent-foreground">
              <ShieldCheck size={14} />
              Trust &amp; Transparency
            </span>
          </div>
          <h2
            id="standards-heading"
            className="mt-4 max-w-2xl font-serif text-3xl font-black leading-tight text-balance md:text-4xl"
          >
            How we report the news — and where we stand
          </h2>
          <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            A news hub is only as good as the trust behind it. Here is who we are, how we
            make editorial decisions, and an honest look at our own perspective.
          </p>
        </Reveal>

        {/* Bias meter */}
        <Reveal delay={80}>
          <div className="mt-10 border border-border bg-card p-6 md:p-8">
            <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold">Our editorial lean</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Rated <span className="font-semibold text-foreground">{outletBias.label}</span>{' '}
                  · Factual reporting:{' '}
                  <span className="font-semibold text-foreground">{outletBias.factual}</span>
                </p>
              </div>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Independent media-bias assessment
              </span>
            </div>

            {/* Scale */}
            <div className="mt-6">
              <div className="relative h-3 w-full rounded-full bg-gradient-to-r from-blue-600 via-muted to-red-600">
                <div
                  className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-background bg-accent shadow-md"
                  style={{ left: `${outletBias.position}%` }}
                  aria-hidden="true"
                />
              </div>
              <div className="mt-3 flex justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {biasScale.map((b) => (
                  <span key={b}>{b}</span>
                ))}
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {outletBias.summary}
              </p>
            </div>
          </div>
        </Reveal>

        {/* Trust stats */}
        <Reveal delay={120}>
          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden border border-border bg-border md:grid-cols-4">
            {trustStats.map((s) => (
              <div key={s.label} className="bg-card p-5">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block font-serif text-3xl font-black text-foreground">
                    {s.value}
                  </span>
                  <span className="mt-1 block text-xs uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* Standards + ownership */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Accordion of standards */}
          <Reveal delay={80} className="lg:col-span-2">
            <div className="border border-border bg-card">
              <h3 className="border-b border-border px-6 py-4 font-serif text-lg font-bold">
                Editorial standards
              </h3>
              <ul>
                {standards.map((item) => {
                  const isOpen = open === item.id
                  return (
                    <li key={item.id} className="border-b border-border last:border-b-0">
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : item.id)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
                      >
                        <span className="text-sm font-bold uppercase tracking-wider">
                          {item.title}
                        </span>
                        <ChevronDown
                          size={18}
                          className={`shrink-0 text-muted-foreground transition-transform duration-300 ${
                            isOpen ? 'rotate-180 text-accent-foreground' : ''
                          }`}
                        />
                      </button>
                      <div
                        className={`grid overflow-hidden px-6 transition-all duration-300 ease-out ${
                          isOpen
                            ? 'grid-rows-[1fr] pb-5 opacity-100'
                            : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <p className="min-h-0 text-sm leading-relaxed text-muted-foreground">
                          {item.body}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </Reveal>

          {/* Ownership / funding */}
          <Reveal delay={160}>
            <div className="h-full border border-border bg-foreground p-6 text-background">
              <h3 className="font-serif text-lg font-bold">Who funds us</h3>
              <p className="mt-2 text-sm leading-relaxed text-background/70">
                Independence starts with knowing where the money comes from.
              </p>
              <dl className="mt-5 flex flex-col gap-4">
                {ownership.map((o) => (
                  <div key={o.label}>
                    <dt className="text-xs font-bold uppercase tracking-widest text-accent">
                      {o.label}
                    </dt>
                    <dd className="mt-1 text-sm leading-relaxed text-background/90">
                      {o.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <a
                href="#"
                className="mt-6 inline-block text-xs font-bold uppercase tracking-widest text-accent underline-offset-4 hover:underline"
              >
                Read our full ethics policy
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
