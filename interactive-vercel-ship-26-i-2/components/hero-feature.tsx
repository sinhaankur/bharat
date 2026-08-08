import { featured, topStories } from '@/lib/articles'
import StoryCard from '@/components/story-card'
import Reveal from '@/components/reveal'
import CardArt from '@/components/card-art'

export default function HeroFeature() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
        {/* Lead story */}
        <Reveal as="article" className="group lg:col-span-2">
          <a href={featured.href || '#'} aria-label={featured.title} className="block overflow-hidden">
            <div className="transition-transform duration-500 group-hover:scale-105">
              <CardArt kind={featured.category} className="!aspect-[16/9]" />
            </div>
          </a>
          <div className="mt-4">
            <span className="bg-accent px-2 py-1 text-[11px] font-bold uppercase tracking-widest text-accent-foreground">
              {featured.category}
            </span>
            <h1 className="mt-4 font-serif text-3xl font-black leading-[1.05] text-balance md:text-5xl group-hover:text-muted-foreground">
              <a href={featured.href || '#'}>{featured.title}</a>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">
              {featured.dek}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{featured.author}</span> ·{' '}
              {featured.timeAgo} · {featured.readTime}
            </p>
          </div>
        </Reveal>

        {/* Side rail */}
        <Reveal delay={120} className="flex flex-col">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-xs font-bold uppercase tracking-widest">Top Stories</h2>
            <span className="h-px flex-1 bg-foreground" />
          </div>
          <div className="flex flex-col gap-6 divide-y divide-border [&>*:not(:first-child)]:pt-6">
            {topStories.map((a) => (
              <StoryCard key={a.id} article={a} variant="compact" />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
