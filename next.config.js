import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/admin/user', destination: '/admin/users', permanent: false },
      { source: '/admin/user/:path*', destination: '/admin/users/:path*', permanent: false },
    ];
  },
  async rewrites() {
    return [
      { source: '/v1/api/:path*', destination: '/api/:path*' },
      { source: '/v1/docs', destination: '/api-docs' },
      { source: '/v1/docs/', destination: '/api-docs' },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '6mb',
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-is': path.resolve(__dirname, 'node_modules/react-is'),
    };
    return config;
  },
};

export default nextConfig;
