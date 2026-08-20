import type { MetadataRoute } from 'next'

// Web app manifest — makes the atlas installable ('add to home screen') like a real
// product, with the Bharat seal icon and the stone/gold theme. The app is served under
// basePath /bharat/app in prod, so icon + scope paths carry that prefix.
const base = process.env.BASE_PATH ?? (process.env.NODE_ENV === 'production' ? '/bharat/app' : '')

// required for `output: 'export'` — emit the manifest as a static file at build time
export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bharat — the India District Atlas',
    short_name: 'Bharat',
    description:
      'Money, land and law for 594 districts — every figure sourced, or shown as an honest gap.',
    start_url: `${base}/`,
    scope: `${base}/`,
    display: 'standalone',
    background_color: '#ece3cd',
    theme_color: '#cc8900',
    lang: 'en',
    icons: [
      { src: `${base}/icon.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: `${base}/icon.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  }
}
