import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  devIndicators: false,
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
