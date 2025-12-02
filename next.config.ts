import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ijj-teste-bucket-novo-vel.s3.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
