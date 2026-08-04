import Image from "next/image";
import { ThumbsUp, MessageCircle, Bookmark, MoreHorizontal } from "lucide-react";
import type { CommunityPost } from "@/content/community-mock";
import { formatRelativeTime } from "@/lib/career-tree/format-time";
import { cn } from "@/lib/utils";

// The bai viet dung chung cho ca khoi "Bai viet noi bat" (variant="featured",
// luoi 2 cot, badge lon) LAN danh sach thao luan chinh (variant="list", hang
// doc gon hon) - tranh viet 2 markup gan giong nhau cho cung 1 loai du lieu.
export function CommunityPostCard({
  post,
  variant = "list",
}: {
  post: CommunityPost;
  variant?: "featured" | "list";
}) {
  return (
    <article
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 transition-colors duration-150 ease-out hover:bg-hover-bg",
        variant === "list" && "gap-1.5",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Image
            src={post.author.avatarUrl}
            alt={post.author.name}
            width={variant === "featured" ? 28 : 32}
            height={variant === "featured" ? 28 : 32}
            className={cn(
              "shrink-0 rounded-full object-cover",
              variant === "featured" ? "size-7" : "size-8",
            )}
          />
          <span className="flex min-w-0 flex-col">
            <span className="flex items-center gap-1 truncate text-sm font-semibold text-ink">
              {variant === "list" && (
                <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  {post.badgeLabel}
                </span>
              )}
              {post.author.name}
            </span>
            <span className="text-[11px] text-ink-faint">
              {formatRelativeTime(post.createdAt)}
            </span>
          </span>
        </div>
        {variant === "featured" ? (
          <span className="shrink-0 rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
            {post.badgeLabel}
          </span>
        ) : (
          <button
            type="button"
            aria-label="Thêm"
            className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
          >
            <MoreHorizontal size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      <h3
        className={cn(
          "leading-snug font-semibold text-ink",
          variant === "featured" ? "text-base" : "text-sm",
        )}
      >
        {post.title}
      </h3>
      <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted">
        {post.description}
      </p>

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-ink-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs text-ink-faint">
          <span className="inline-flex items-center gap-1">
            <ThumbsUp size={13} strokeWidth={2} />
            {post.likes}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle size={13} strokeWidth={2} />
            {post.comments}
          </span>
          {post.saves > 0 && (
            <span className="inline-flex items-center gap-1">
              <Bookmark size={13} strokeWidth={2} />
              Lưu
            </span>
          )}
        </div>
        {post.repliedAvatarUrls.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1.5">
              {post.repliedAvatarUrls.map((url, i) => (
                <Image
                  key={i}
                  src={url}
                  alt=""
                  width={18}
                  height={18}
                  className="size-4.5 shrink-0 rounded-full border border-surface object-cover"
                />
              ))}
            </div>
            <span className="text-[11px] text-ink-faint">
              {variant === "featured"
                ? `+${post.repliedCount}`
                : `${post.repliedCount} người đã trả lời`}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
