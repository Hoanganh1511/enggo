import Image from "next/image";
import { Heart, BadgeCheck } from "lucide-react";
import type { Post } from "@/content/home-feed-mock";
import {
  getPostTitle,
  getPostImageUrl,
} from "@/components/discover/home-feed/post-display";
import { formatCompact } from "@/lib/format-number";
import { formatRelativeTime } from "@/lib/format-time";

// Dau trang chi tiet bai viet: anh bia (neu kind co anh - image/gallery/
// video/coverImage, xem getPostImageUrl; kind khong co anh nhu "text" thi an
// han, KHONG bia anh gia) + tieu de (suy tu getPostTitle - nhieu kind khong
// co field title rieng) + so like + dong tac gia GON (khac ban day du hon o
// ArticleAuthorCard.tsx cuoi bai).
export function ArticleHeader({ post }: { post: Post }) {
  const title = getPostTitle(post);
  const imageUrl = getPostImageUrl(post);

  return (
    <header className="flex flex-col gap-4">
      {imageUrl && (
        <div className="relative aspect-video w-full overflow-hidden  bg-surface-muted">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="620px"
            priority
            className="object-cover"
          />
        </div>
      )}

      <h1 className="text-2xl leading-snug font-bold tracking-tight text-ink sm:text-[28px]">
        {title}
      </h1>

      <div className="flex items-center gap-1.5 text-sm text-ink-faint">
        <Heart
          size={15}
          strokeWidth={2}
          className="shrink-0 text-rose-500"
          fill="currentColor"
        />
        {formatCompact(post.stats.likes)} lượt thích
      </div>

      <div className="flex items-center gap-2 border-y border-border py-3">
        <Image
          src={post.author.avatarUrl}
          alt={post.author.name}
          width={36}
          height={36}
          className="size-9 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate text-sm font-semibold text-ink">
              {post.author.name}
            </span>
            {post.author.verified && (
              <BadgeCheck
                size={13}
                strokeWidth={2.25}
                className="shrink-0 text-primary"
              />
            )}
          </div>
          <p className="text-xs text-ink-faint">
            {formatRelativeTime(post.createdAt)}
          </p>
        </div>
      </div>
    </header>
  );
}
