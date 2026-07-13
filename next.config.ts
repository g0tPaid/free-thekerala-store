import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Up to 15 product images × ~8MB each
      bodySizeLimit: '96mb',
    },
    // Allow large single-image uploads via /api/admin/upload
    middlewareClientMaxBodySize: '96mb',
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  async rewrites() {
    return [
      // Legacy /uploads/... paths → dynamic media API (volume-backed)
      { source: '/uploads/:path*', destination: '/api/media/:path*' },
    ];
  },
  async headers() {
    return [
      {
        // Avoid browsers keeping stale RSC / Server Action IDs after deploys
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
    ];
  },
};

export default nextConfig;
