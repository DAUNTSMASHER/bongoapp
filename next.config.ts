import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
  outputFileTracingExcludes: {
    "*": ["public/Videos/**"],
  },
};

export default nextConfig;
