"use client";

import { useState } from "react";
import Image from "next/image";
import { BadgeCheck, MoreHorizontal, Link2, Flag } from "lucide-react";
import type { Post } from "@/content/home-feed-mock";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { PostBody } from "./post-bodies";
import { ActionBar } from "./action-bar";

type PostCardProps = {
  post: Post;
};

// Card 1 bai post trong feed Trang chu - MOCK data (xem content/home-feed-mock.ts).
// PostCard chi lo phan CHUNG cho moi loai post: avatar/ten/badge/username/
// thoi gian/menu 3 cham o header. Phan noi dung chinh (van ban/anh/video/
// file/link/resource/note/...) giao het cho PostBody (post-bodies/index.tsx),
// va cum action duoi cung giao het cho ActionBar (action-bar/index.tsx) - moi
// "kind" co dang trinh bay VA bo action rieng, khong con dung chung 1 mau
// Like/Comment/Repost/Save cho moi loai bai.
//
// Card nam tren bg-surface (box thich ung ca light/dark, xem HomeLayoutShell.tsx)
// nen toan bo mau chu O DAY dung token ngu nghia (text-ink/text-ink-muted/
// text-ink-faint) de tu doi mau theo prefers-color-scheme thay vi hex co dinh.
const PostCard = ({ post }: PostCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <article className="py-4 first:pt-5 last:pb-5">
      <div className="flex items-start gap-3">
        <Image
          src={post.author.avatarUrl}
          alt={post.author.name}
          width={52}
          height={52}
          className="size-13 shrink-0 rounded-full object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <span className="truncate text-[18px] font-semibold text-ink">
                {post.author.name}
              </span>
              {post.author.verified && (
                <BadgeCheck
                  size={13}
                  strokeWidth={2}
                  className="shrink-0 text-primary"
                />
              )}
              <span className="truncate text-sm text-ink-muted">
                @{post.author.username}
              </span>
              <span className="text-ink-faint">·</span>
              <span className="shrink-0 text-xs text-ink-muted">
                {post.timeAgo} trước
              </span>
            </div>

            <PopoverRoot open={menuOpen} onOpenChange={setMenuOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors duration-150 ease-out ${
                    menuOpen
                      ? "bg-hover-bg text-ink"
                      : "text-ink-faint hover:bg-hover-bg hover:text-ink-muted"
                  }`}
                >
                  <MoreHorizontal size={16} strokeWidth={1.75} />
                </button>
              </PopoverTrigger>
              <PopoverContent
                open={menuOpen}
                align="end"
                className="z-50 w-44 rounded-lg border border-border bg-surface p-1.5 shadow-dropdown"
              >
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
                >
                  <Link2 size={14} strokeWidth={1.75} />
                  Copy link
                </button>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-red-500 transition-colors duration-150 ease-out hover:bg-hover-bg"
                >
                  <Flag size={14} strokeWidth={1.75} />
                  Báo cáo
                </button>
              </PopoverContent>
            </PopoverRoot>
          </div>

          <PostBody post={post} />
          <ActionBar post={post} />
        </div>
      </div>
    </article>
  );
};

export default PostCard;
