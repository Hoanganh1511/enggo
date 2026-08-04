"use client";

import { useState } from "react";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { formatCompact } from "@/lib/format-number";
import { cn } from "@/lib/utils";

// Cum hanh dong day du (khac Count Like tinh o ArticleHeader.tsx - o day
// like/save BAM DUOC, toggle active state local, CHUA goi API that - chua co
// endpoint Like/Save cho Post, xem home-feed-mock.ts comment ve lien/saved
// luon undefined tu API). "Luu" KHONG hien so dem (Post khong co truong luot
// luu that, khac likes/comments da co san tu backend) - chi la toggle ca
// nhan giong Twitter bookmark, khong phai con so cong khai.
export function ArticleActionBar({
  likes,
  commentCount,
}: {
  likes: number;
  commentCount: number;
}) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex items-center justify-between border-y border-border py-3">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setLiked((v) => !v)}
          className={cn(
            "flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors duration-150 ease-out hover:bg-hover-bg",
            liked ? "text-rose-500" : "text-ink-muted",
          )}
        >
          <Heart size={17} strokeWidth={2} fill={liked ? "currentColor" : "none"} />
          {formatCompact(likes + (liked ? 1 : 0))}
        </button>

        <a
          href="#comments"
          className="flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg"
        >
          <MessageCircle size={17} strokeWidth={2} />
          {formatCompact(commentCount)}
        </a>

        <button
          type="button"
          onClick={() => setSaved((v) => !v)}
          aria-label="Lưu bài viết"
          className={cn(
            "flex h-9 w-9 cursor-pointer items-center justify-center rounded-md transition-colors duration-150 ease-out hover:bg-hover-bg",
            saved ? "text-primary" : "text-ink-muted",
          )}
        >
          <Bookmark size={17} strokeWidth={2} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <button
        type="button"
        aria-label="Chia sẻ"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
      >
        <Share2 size={17} strokeWidth={2} />
      </button>
    </div>
  );
}
