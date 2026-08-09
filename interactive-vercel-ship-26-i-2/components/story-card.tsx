import type { Article } from '@/lib/articles'
import CardArt from '@/components/card-art'
import SmartLink from '@/components/smart-link'

type Variant = 'default' | 'compact'

export default function StoryCard({
  article,
  variant = 'default',
}: {
  article: Article
  variant?: Variant
}) {
  if (variant === 'compact') {
    return (
      <article className="group flex gap-4">
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            {article.category}
          </span>
          <h3 className="mt-1 font-serif text-base font-bold leading-snug text-balance decoration-accent decoration-2 underline-offset-4 group-hover:underline">
            <SmartLink href={article.href || '#'}>{article.title}</SmartLink>
          </h3>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {article.author} · {article.timeAgo}
          </p>
        </div>
        <SmartLink href={article.href || '#'} className="w-24 shrink-0" aria-label={article.title}>
          <CardArt kind={article.category} className="!aspect-[4/3]" />
        </SmartLink>
      </article>
    )
  }

  return (
    <article className="group flex flex-col">
      <SmartLink href={article.href || '#'} aria-label={article.title} className="overflow-hidden">
        <div className="transition-transform duration-500 group-hover:scale-105">
          <CardArt kind={article.category} />
        </div>
      </SmartLink>
      <div className="mt-3 flex flex-col">
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {article.category}
        </span>
        <h3 className="mt-1.5 font-serif text-xl font-bold leading-snug text-balance decoration-accent decoration-2 underline-offset-4 group-hover:underline">
          <SmartLink href={article.href || '#'}>{article.title}</SmartLink>
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          {article.dek}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{article.author}</span> · {article.readTime}
        </p>
      </div>
    </article>
  )
}
