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
};

export default nextConfig;
