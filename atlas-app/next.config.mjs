/** @type {import('next').NextConfig} */
// Static export under the /bharat subpath (GitHub Pages). The classic 594-district
// atlas stays at /bharat/ (root); this rebuilt app lives at /bharat/app/.
// Set BASE_PATH='' for a local/root build.
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const isProd = process.env.NODE_ENV === 'production'
const basePath = process.env.BASE_PATH ?? (isProd ? '/bharat/app' : '')

const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },

  // This repo has multiple lockfiles (the classic atlas root + the parked old app),
  // so Next mis-infers the workspace root and the tsconfig "@/*" paths alias fails
  // to resolve on the CI webpack build ("Can't resolve @/components/…"). Pin the
  // Turbopack root AND add an explicit webpack alias, both anchored to THIS dir, so
  // "@/x" always resolves to atlas-app/x regardless of where the build is invoked.
  turbopack: { root: __dirname },
  webpack: (config) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = { ...(config.resolve.alias || {}), '@': __dirname }
    return config
  },
}

export default nextConfig
