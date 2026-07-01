import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Only apply basePath and assetPrefix during production build
  // This prevents it from breaking your local development (npm run dev)
  basePath: isProd ? '/KitKart-Main' : '',
  assetPrefix: isProd ? '/KitKart-Main/' : '',
};

export default nextConfig;
