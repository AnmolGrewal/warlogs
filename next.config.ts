import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // the calculator moved to the home page; keep old links working
  async redirects() {
    return [{ source: "/logistics", destination: "/", permanent: true }];
  },
};

export default nextConfig;
