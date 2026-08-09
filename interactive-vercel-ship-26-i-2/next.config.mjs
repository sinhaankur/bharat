/** @type {import('next').NextConfig} */
// GitHub Pages: static export under the /bharat subpath.
// Set BASE_PATH='' for a local/root build. Server routes (/api/*) are skipped in
// export — the news page fetches client-side and falls back to sample data.
import { existsSync, lstatSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// SAFETY: public/legacy is a local-only symlink to the repo root (../..) used to
// preview the classic atlas in dev. During `next build`, Next copies public/ into
// out/ and would follow this symlink recursively (out -> public/legacy -> root ->
// app -> out -> ...) until the disk fills with ENOSPC. Strip it before any build.
const __dir = dirname(fileURLToPath(import.meta.url))
const legacyLink = join(__dir, 'public', 'legacy')
try {
  if (existsSync(legacyLink) && lstatSync(legacyLink).isSymbolicLink()) {
    rmSync(legacyLink)
    console.log('[next.config] removed recursive public/legacy symlink before build')
  }
} catch {}

const isProd = process.env.NODE_ENV === 'production'
// The new app lives at /bharat/app/ (the 55-page atlas stays at the root /bharat/).
const basePath = process.env.BASE_PATH ?? (isProd ? '/bharat/app' : '')

const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
}

export default nextConfig
