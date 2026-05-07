import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // Server Actions habilitados por defecto en Next.js 15
  },
  images: {
    remotePatterns: [
      // Falabella
      { protocol: 'https', hostname: 'falabella.scene7.com' },
      { protocol: 'https', hostname: 'www.falabella.com' },
      // Paris / Cencosud
      { protocol: 'https', hostname: 'paris.cl' },
      { protocol: 'https', hostname: 'cl-dam-resizer.ecomm.cencosud.com' },
      { protocol: 'https', hostname: 'newimgs.paris.cl' },
      // Ripley
      { protocol: 'https', hostname: 'simple.ripley.cl' },
      { protocol: 'https', hostname: 'media.ripley.com.pe' },
      // Lider / Walmart
      { protocol: 'https', hostname: 'i5.walmartimages.cl' },
      { protocol: 'https', hostname: 'www.lider.cl' },
      // Sodimac
      { protocol: 'https', hostname: 'sodimac.scene7.com' },
      // Mercado Libre
      { protocol: 'https', hostname: 'http2.mlstatic.com' },
      { protocol: 'https', hostname: 'mco-s2-p.mlstatic.com' },
      // Easy
      { protocol: 'https', hostname: 'easycl.vtexassets.com' },
      // ABCDin
      { protocol: 'https', hostname: 'www.abc.cl' },
      { protocol: 'https', hostname: 'img.abcdin.cl' },
      // AliExpress
      { protocol: 'https', hostname: 'ae-pic-a1.aliexpress-media.com' },
      // Otros CDNs
      { protocol: 'https', hostname: 'd1soed2y0oyruu.cloudfront.net' },
      { protocol: 'https', hostname: '*.cloudfront.net' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600,
  },
  // Headers de seguridad y SEO
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
  // Redirecciones útiles
  async redirects() {
    return [
      { source: '/search', destination: '/results', permanent: true },
    ]
  },
}

export default nextConfig
