/** @type {import('next').NextConfig} */
const backendApi = (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://sentinelx-api.187.77.187.120.sslip.io/api/v1')
  .replace(/\/api\/v1\/?$/, '');

const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendApi}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

