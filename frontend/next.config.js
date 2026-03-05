const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'placeholder.pics' },
    ],
  },
  // Rewrites uniquement en développement local (évite les erreurs en production)
  ...(process.env.NODE_ENV === 'development' && {
    async rewrites() {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      return [
        {
          source: '/debug/:path*',
          destination: `${backendUrl}/debug/:path*`,
        },
        {
          source: '/analytics/:path*',
          destination: `${backendUrl}/analytics/:path*`,
        },
        {
          source: '/error',
          destination: `${backendUrl}/error`,
        },
        {
          source: '/ping',
          destination: `${backendUrl}/ping`,
        },
        {
          source: '/uploads/:path*',
          destination: `${backendUrl}/uploads/:path*`,
        },
      ];
    },
  }),
};

module.exports = withNextIntl(nextConfig);
