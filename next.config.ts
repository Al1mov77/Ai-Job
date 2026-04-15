import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://157.180.29.248:8090/api/:path*",
      },
    ];
  },
};

export default nextConfig;
