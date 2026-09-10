"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import { formatRelativeTime } from "@/lib/format-time";
import type { NormalizedPost } from "@/lib/discover/normalize-post";

const PAGE_SIZE = 8;

// Mobile/tablet (<lg) - "Bài viết gần đây" dang list phang (mockup man 2),
// thay cho NewestSection nhom-theo-chu-de + du lieu mock (NewestSection giu
// nguyen cho desktop). Dung THAT mang posts da fetch san o page.tsx (khong
// goi API rieng) - "Xem thêm" chi HIEN THEM tu mang da co, khong link toi
// dau ca (khong co trang "xem tat ca" rieng biet nao).
export function RecentPostsList({ posts }: { posts: NormalizedPost[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visible = posts.slice(0, visibleCount);

  if (posts.length === 0) return null;

  return (
    <div className="flex flex-col lg:hidden">
      {visible.map((post) => (
        <Link
          key={post.id}
          href={`/p/${post.id}`}
          className="flex items-center gap-3 border-b border-[var(--border)] py-4 first:pt-0 last:border-b-0"
        >
          <div className="min-w-0 flex-1">
            <span className="inline-block rounded-full bg-[var(--surface-subtle)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted)]">
              {formatRelativeTime(post.createdAt)}
            </span>
            <h3 className="font-content mt-1.5 line-clamp-2 text-[14px] font-semibold text-[var(--foreground)]">
              {post.title}
            </h3>
            <p className="mt-1 text-[12px] text-[var(--muted)]">{post.author.name}</p>
            <div className="mt-1.5 flex items-center gap-3 text-[11px] text-[var(--muted)]">
              <span className="flex items-center gap-1">
                <Heart size={12} strokeWidth={2} /> {post.likeCount}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={12} strokeWidth={2} /> {post.commentCount}
              </span>
            </div>
          </div>
          <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-[var(--surface-subtle)]">
            {post.image && (
              <Image src={post.image} alt="" fill className="object-cover" sizes="64px" />
            )}
          </div>
        </Link>
      ))}

      {visibleCount < posts.length && (
        <button
          type="button"
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          className="mt-2 cursor-pointer self-center text-sm font-semibold text-[var(--primary)] hover:underline"
        >
          Xem thêm bài viết →
        </button>
      )}
    </div>
  );
}
