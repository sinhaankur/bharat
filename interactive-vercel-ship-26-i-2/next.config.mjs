/** @type {import('next').NextConfig} */
// GitHub Pages: static export under the /bharat subpath.
// Set BASE_PATH='' for a local/root build. Server routes (/api/*) are skipped in
// export — the news page fetches client-side and falls back to sample data.
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
