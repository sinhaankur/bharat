// Link helpers. The app deploys under basePath /bharat/app; the classic 594-district
// fiscal atlas lives one level up at /bharat (root). next/link prepends the basePath
// to app-internal routes automatically — but for the classic atlas .html pages we
// must build the full path ourselves and render a plain <a> (see SmartLink).

// The atlas root = basePath minus a trailing /app. '' in dev.
export function atlasRoot(): string {
  return (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/app\/?$/, '')
}

// The classic interactive fiscal map — all 594 districts, money/CRZ/flood.
// This is THE map the "Open the map" buttons open (classic.html at the atlas root).
export function classicMapHref(): string {
  return `${atlasRoot()}/classic.html`
}

// A classic atlas .html page by filename (without extension).
export function classicHref(file: string): string {
  return `${atlasRoot()}/${file}.html`
}
