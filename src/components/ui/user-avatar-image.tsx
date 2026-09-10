"use client";

import { useState } from "react";
import Image from "next/image";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "?";
}

// Anh dai dien co FALLBACK that (chu cai dau ten) thay vi luon gia dinh
// avatarUrl la 1 URL hop le - can vi backend tra `''` khi User.avatarUrl
// null (xem UserService.getProfileByUsername), VA vi 1 URL S3 con hop le
// luc fetch profile van co the that bai khi tai that su (object da bi xoa -
// da gap that voi cron don rac S3 xoa nham avatar dang dung, xem
// career-tree-api UploadService.deleteOrphanedUploads). Ca 2 truong hop
// truoc day deu render ra icon "ảnh vỡ" thay vi 1 fallback co the doan duoc.
export function UserAvatarImage({
  src,
  name,
  size,
  className = "",
}: {
  src: string;
  name: string;
  size: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const base = `shrink-0 rounded-full ${className}`;

  if (!src || failed) {
    return (
      <span
        style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}
        className={`${base} flex items-center justify-center bg-primary font-semibold text-white`}
      >
        {getInitials(name)}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className={`${base} object-cover`}
    />
  );
}
