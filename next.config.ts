import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // outputFileTracingRoot: path.resolve(__dirname, '../../'),  // Uncomment and add 'import path from "path"' if needed
  /* config options here */
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
        source: '/api/knowledge-base/:path*',
        destination: '/api/knowledge-base/:path*',
      },
      {
        source: '/api/knowledge-base',
        destination: '/api/knowledge-base',
      },
      {
        source: '/api/outline/:path*',
        destination: '/api/outline/:path*',
      },
      {
        source: '/api/tts/:path*',
        destination: '/api/tts/:path*',
      },
      {
        source: '/api/llm',
        destination: '/api/llm',
      },
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
