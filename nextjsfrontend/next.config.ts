import path from 'path';
import type { NextConfig } from 'next';

const nextConfig = {
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api",
  //       destination: "http://localhost:3000/api/auth/:path*", // backend
  //     },
  //     {
  //       source: "/socket.io/:path*",
  //       destination: "http://localhost:3000/socket.io/:path*", // backend
  //     },
  //   ];
  // },
  experimental: {
    // @ts-expect-error: 'turbopack' is experimental and not typed yet
    turbopack: {
      root: path.resolve(__dirname),
    },
    eslint: { ignoreDuringBuilds: true },
  },
} satisfies NextConfig;

export default nextConfig;
