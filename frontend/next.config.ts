import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  images: { unoptimized: true }, // Required for static export
  reactCompiler: true,
};

export default nextConfig;
