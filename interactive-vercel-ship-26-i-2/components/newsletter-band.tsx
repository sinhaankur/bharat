'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'

export default function NewsletterBand() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  return (
    <section className="bg-foreground text-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 md:flex-row md:items-center md:justify-between md:px-6 md:py-14">
        <div className="max-w-md">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">
            The Bharat brief
          </p>
          <h2 className="mt-2 font-serif text-2xl font-black leading-tight text-balance md:text-3xl">
            Understand India, by the evidence.
          </h2>
          <p className="mt-2 text-sm text-background/70">
            New data, tools and explainers — sourced, or marked a gap. No spin.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (email) setDone(true)
          }}
          className="flex w-full max-w-sm flex-col gap-2"
        >
          {done ? (
            <p className="font-serif text-lg font-bold text-accent">
              You&apos;re in. Check your inbox.
            </p>
          ) : (
            <div className="flex items-center border-2 border-background bg-background">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                aria-label="Email address"
                className="w-full bg-transparent px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="flex h-full items-center gap-1 bg-accent px-4 py-3 text-xs font-bold uppercase tracking-widest text-accent-foreground"
              >
                Join
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  )
}
