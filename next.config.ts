import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Server Actions mac dinh gioi han body 1MB (chan luon avatar/cover/anh
  // bai viet upload qua FormData, vi Composer.tsx/ProfileSidebar.tsx/
  // SettingsSections.tsx deu goi upload qua "use server" action, khong phai
  // fetch truc tiep) - nang len 26mb, khop MAX_IMAGE_BYTES 25MB phia client
  // + du du cho overhead multipart/form-data.
  experimental: {
    serverActions: {
      bodySizeLimit: "26mb",
    },
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
