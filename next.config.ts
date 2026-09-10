import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // Anh upload That qua S3 (avatar/cover/anh bai viet - xem
      // UploadService o backend: `https://{bucket}.s3.{region}.amazonaws.com/...`).
      // "**" khop moi tang subdomain (bucket.s3.region.amazonaws.com).
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
