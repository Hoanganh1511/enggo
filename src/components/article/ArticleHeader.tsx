import Image from "next/image";
import { Heart, MessageCircle, BadgeCheck } from "lucide-react";
import type { Post } from "@/content/home-feed-mock";
import {
  getPostTitle,
  getPostImageUrl,
} from "@/components/discover/home-feed/post-display";
import { formatCompact } from "@/lib/format-number";
import { formatRelativeTime } from "@/lib/format-time";
import { ArticleMainImage } from "./ArticleMainImage";

// Dau trang chi tiet bai viet - GOI chung anh bia + tieu de + mo ta (excerpt
// that, xem post.excerpt) + cum thich/binh luan + tac gia GON vao 1 khoi
// duy nhat (yeu cau nguoi dung, xem mockup): anh bia (neu kind co anh -
// image/gallery/video/coverImage, xem getPostImageUrl; kind khong co anh
// nhu "text" thi an han, KHONG bia anh gia) + tieu de (suy tu getPostTitle -
// nhieu kind khong co field title rieng) + mo ta (chi hien khi co
// post.excerpt that) + so like/binh luan + dong tac gia GON (khac ban day
// du hon o ArticleAuthorCard.tsx cuoi bai).
export function ArticleHeader({ post }: { post: Post }) {
  const title = getPostTitle(post);
  const imageUrl = getPostImageUrl(post);

  return (
    <header className="flex flex-col gap-4">
      {imageUrl && (
        <ArticleMainImage imageUrl={imageUrl} alt={title} postId={post.id} />
      )}

      {/* font-content: mo ta + thong tin bai/tac gia la NOI DUNG, dung
          Manrope thay --font-sans mac dinh (UI/dieu huong). Rieng tieu de
          (h1) dung Noto Serif qua var(--font-serif-book) - truoc chi dung
          cho khu "hanh trinh cuon sach" (JourneyHero...), theo yeu cau
          nguoi dung gio dung THEM cho tieu de bai viet chi tiet. */}
      <div className="font-content flex flex-col gap-1.5">
        <h1
          style={{ fontFamily: "var(--font-serif-book)" }}
          className="text-2xl leading-snug font-bold tracking-tight text-ink sm:text-[28px]"
        >
          {title}
        </h1>
        {post.excerpt && (
          <p className="text-sm leading-relaxed text-ink-muted">
            {post.excerpt}
          </p>
        )}
      </div>

      <div className="font-content flex items-center gap-4 text-sm text-ink-faint">
        <span className="flex items-center gap-1.5">
          <Heart
            size={15}
            strokeWidth={2}
            className="shrink-0 text-rose-500"
            fill="currentColor"
          />
          {formatCompact(post.stats.likes)} lượt thích
        </span>
        <span className="flex items-center gap-1.5">
          <MessageCircle size={15} strokeWidth={2} className="shrink-0" />
          {formatCompact(post.stats.comments)} bình luận
        </span>
      </div>

      <div className="flex items-center gap-2 border-y border-border py-3">
        <Image
          src={post.author.avatarUrl}
          alt={post.author.name}
          width={36}
          height={36}
          className="size-9 shrink-0 rounded-full object-cover"
        />
        <div className="font-content min-w-0 flex-1">
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
