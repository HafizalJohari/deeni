/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@supabase/ssr', '@supabase/supabase-js'],
  images: {
    domains: [
      'v3.fal.media',
      'placehold.co',
      'res.cloudinary.com'
    ],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      encoding: false,
    };
    return config;
  },
  experimental: {
    turbo: {
      resolveAlias: {
        // Any necessary aliases
      },
      // Additional turbo config
    }
  },
  distDir: '.next'
};

module.exports = nextConfig; 