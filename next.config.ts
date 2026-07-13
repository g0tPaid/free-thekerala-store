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
      // Shopify steals /admin on connected domains — public admin lives at /manage
      { source: '/manage', destination: '/admin' },
      { source: '/manage/:path*', destination: '/admin/:path*' },
      // Legacy /uploads/... paths → dynamic media API (volume-backed)
      { source: '/uploads/:path*', destination: '/api/media/:path*' },
    ];
  },
};

export default nextConfig;
