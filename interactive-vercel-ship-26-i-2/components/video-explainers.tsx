import { featuredVideo, videos } from '@/lib/articles'
import { atlasRoot } from '@/lib/atlas-pages'
import Reveal from '@/components/reveal'
import CardArt from '@/components/card-art'

// "Explore" strip — the interactive/3D pieces of the atlas. These aren't videos;
// they're live tools, so each is a real link with an SVG snapshot (no stock art).
export default function VideoExplainers() {
  const kindOf = (series: string) => (/3d/i.test(series) ? '3D' : series)

  return (
    <section className="bg-foreground py-10 text-background md:py-14">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal className="mb-6 flex items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl font-black italic md:text-3xl">Explore</h2>
            <span className="bg-accent px-2 py-1 text-[11px] font-bold uppercase tracking-widest text-accent-foreground">
              Interactive
            </span>
          </div>
          <a
            href={`${atlasRoot()}/india-3d.html`}
            className="shrink-0 text-xs font-bold uppercase tracking-widest text-background/70 transition-colors hover:text-accent"
          >
            All 3D views
          </a>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Featured interactive */}
          <Reveal>
            <a href={featuredVideo.href || '#'} className="group block" aria-label={featuredVideo.title}>
              <div className="overflow-hidden">
                <div className="transition-transform duration-500 group-hover:scale-105">
                  <CardArt kind={kindOf(featuredVideo.series)} className="!aspect-video !border-white/10" />
                </div>
              </div>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-accent">
                {featuredVideo.series}
              </p>
              <h3 className="mt-1 font-serif text-xl font-bold leading-snug text-balance md:text-2xl">
                {featuredVideo.title}
              </h3>
              <p className="mt-1 text-sm text-background/60">{featuredVideo.views} · open →</p>
            </a>
          </Reveal>

          {/* List */}
          <div className="flex flex-col gap-5">
            {videos.map((v, i) => (
              <Reveal key={v.id} delay={i * 80}>
                <a href={v.href || '#'} className="group flex w-full gap-4" aria-label={v.title}>
                  <div className="w-40 shrink-0 overflow-hidden sm:w-48">
                    <div className="transition-transform duration-500 group-hover:scale-105">
                      <CardArt kind={kindOf(v.series)} className="!aspect-video !border-white/10" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-accent">{v.series}</p>
                    <h3 className="mt-1 font-serif text-base font-bold leading-snug text-balance transition-colors group-hover:text-accent md:text-lg">
                      {v.title}
                    </h3>
                    <p className="mt-1 text-xs text-background/60">{v.views} · open →</p>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
