import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
        pathname: '/platform/**',
      },
    ],
  },
};

export default nextConfig;
