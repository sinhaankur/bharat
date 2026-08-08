import { latest } from '@/lib/articles'
import StoryCard from '@/components/story-card'
import Reveal from '@/components/reveal'

export default function LatestGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      <div className="mb-6 flex items-center gap-3">
        <h2 className="text-sm font-black uppercase tracking-widest">The Latest</h2>
        <span className="h-1 flex-1 bg-accent" />
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {latest.map((a, i) => (
          <Reveal key={a.id} delay={i * 90}>
            <StoryCard article={a} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
