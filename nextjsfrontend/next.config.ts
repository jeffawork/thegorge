import path from 'path';
import type { NextConfig } from 'next';

const nextConfig = {
  experimental: {
    // @ts-expect-error: 'turbopack' is experimental and not typed yet
    turbopack: {
      root: path.resolve(__dirname),
    },
  },
} satisfies NextConfig;

export default nextConfig;
