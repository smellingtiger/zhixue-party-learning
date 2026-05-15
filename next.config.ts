import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['*.dev.coze.site'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
    ],
  },
  ...(process.env.COZE_PROJECT_ENV === 'PROD' && {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://192.168.1.244:8082/api/:path*',
        },
        {
          source: '/sso/:path*',
          destination: 'http://192.168.1.244:8082/sso/:path*',
        },
        {
          source: '/user/:path*',
          destination: 'http://192.168.1.244:8082/user/:path*',
        },
        {
          source: '/live/:path*',
          destination: 'http://192.168.1.244:8082/live/:path*',
        },
      ];
    },
  }),
};

export default nextConfig;
