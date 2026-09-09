import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // Tách barrel của gói icon để không kéo cả thư viện vào client bundle.
    optimizePackageImports: ["@phosphor-icons/react"],
  },
};

export default config;
