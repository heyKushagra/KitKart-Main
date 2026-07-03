import type { NextConfig } from "next";

// Check if we are building specifically for GitHub Pages
const isGithubActions = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  // Use static export ONLY for GitHub Pages. Vercel and local dev will use dynamic rendering.
  output: isGithubActions ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  // Only apply basePath and assetPrefix for GitHub Pages deployment
  basePath: isGithubActions ? '/KitKart-Admin' : '',
  assetPrefix: isGithubActions ? '/KitKart-Admin/' : '',
};

export default nextConfig;
