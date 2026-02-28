const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'placeholder.pics'],
  },
  async rewrites() {
    return [
      {
        source: '/debug/:path*',
        destination: 'http://localhost:8000/debug/:path*',
      },
      {
        source: '/analytics/:path*',
        destination: 'http://localhost:8000/analytics/:path*',
      },
      {
        source: '/error',
        destination: 'http://localhost:8000/error',
      },
      {
        source: '/ping',
        destination: 'http://localhost:8000/ping',
      },
    ]
  },
};

module.exports = withNextIntl(nextConfig);
