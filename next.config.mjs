/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_FORM137_API_URL: process.env.NEXT_PUBLIC_FORM137_API_URL,
  },
  async rewrites() {
    return [
      {
        source: '/health',
        destination: '/api/health',
      },
    ]
  },
}

export default nextConfig
