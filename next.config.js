/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'carelline.com'],
  },
  experimental: {
    scrollRestoration: false,
  },
  async headers() {
    return [
      {
        source: '/api/product-image',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
      {
        source: '/api/webhook',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ]
  },
}

module.exports = nextConfig