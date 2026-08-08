import { TrendingUp } from 'lucide-react'
import { trending } from '@/lib/articles'

export default function TrendingTicker() {
  const items = [...trending, ...trending]

  return (
    <div className="border-b border-foreground bg-foreground text-background">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 md:px-6">
        <div className="flex shrink-0 items-center gap-2 py-2.5 pr-4">
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-accent">
            <TrendingUp size={14} />
            Trending
          </span>
        </div>
        <div className="marquee-track relative flex-1 overflow-hidden">
          <ul className="animate-marquee flex w-max items-center gap-8 py-2.5">
            {items.map((t, i) => (
              <li key={`${t}-${i}`} className="flex items-center gap-8 whitespace-nowrap">
                <a
                  href="#"
                  className="text-xs font-semibold uppercase tracking-wide text-background/80 transition-colors hover:text-accent"
                >
                  {t}
                </a>
                <span className="text-accent" aria-hidden="true">
                  &bull;
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
