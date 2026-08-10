/** @type {import('next').NextConfig} */
// Static export under the /bharat subpath (GitHub Pages). The classic 594-district
// atlas stays at /bharat/ (root); this rebuilt app lives at /bharat/app/.
// Set BASE_PATH='' for a local/root build.
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
}

export default nextConfig
