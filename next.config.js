/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  // Compression
  compress: true,

  // Image optimization — WebP/AVIF, lazy loading by default
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    unoptimized: true,
  },

  // Security + performance headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Clickjacking protection
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // XSS protection
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Force HTTPS
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // Referrer policy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Permissions policy (disable unused APIs)
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/logo.png',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/manifest.json',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ]
  },

  // Experimental performance
  experimental: {
    optimizeCss: true,
    serverActions: {
      allowedOrigins: ['localhost:3000', 'cmbaplatform.vercel.app'],
    },
  },
}
module.exports = nextConfig
