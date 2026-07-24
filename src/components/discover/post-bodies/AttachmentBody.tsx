import { FileDown, Globe, Star } from "lucide-react";
import type { Post } from "@/content/home-feed-mock";
import { hexToRgba } from "@/lib/skill-tree/status-style";

type FilePost = Extract<Post, { kind: "file" }>;
type LinkPost = Extract<Post, { kind: "link" }>;
type ResourcePost = Extract<Post, { kind: "resource" }>;

// File/Link/Resource - nhom "attachment": moi cai la 1 the doc lap co elevation
// rieng (bg-surface-muted + border + hover nang len/shadow), khac han media
// (anh/video) vi day la vat the "dinh kem" chu khong phai noi dung chinh.
function Caption({ content }: { content?: string }) {
  if (!content) return null;
  return <p className="mt-1 text-[16px] wrap-break-word text-ink">{content}</p>;
}

const attachmentShellClass =
  "mt-3 flex items-center gap-3 rounded-xl border border-border bg-surface-muted p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-hover-border hover:shadow-dropdown cursor-pointer";

export function FileBody({ post }: { post: FilePost }) {
  return (
    <>
      <Caption content={post.content} />
      <div className={attachmentShellClass}>
        <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-[11px] font-bold text-danger">
          {post.file.ext}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">
            {post.file.name}
          </p>
          <p className="text-xs text-ink-faint">{post.file.size}</p>
        </div>
        <FileDown
          size={18}
          strokeWidth={1.75}
          className="shrink-0 text-ink-faint"
        />
      </div>
    </>
  );
}

export function LinkBody({ post }: { post: LinkPost }) {
  return (
    <>
      <Caption content={post.content} />
      <div className={attachmentShellClass}>
        <span
          className="flex size-14 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: hexToRgba(post.link.accent, 0.15),
            color: post.link.accent,
          }}
        >
          <post.link.icon size={24} strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-ink">
            {post.link.title}
          </p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-ink-faint">
            <Globe size={11} strokeWidth={1.75} className="shrink-0" />
            {post.link.domain}
          </p>
          <p className="mt-0.5 line-clamp-1 text-xs text-ink-faint">
            {post.link.description}
          </p>
        </div>
      </div>
    </>
  );
}

// Save da chuyen xuong action bar (xem action-bar/action-bar-config.tsx,
// case "resource") nen o day chi con thong tin, khong lap lai nut Save.
export function ResourceBody({ post }: { post: ResourcePost }) {
  return (
    <div className="mt-2 flex items-center gap-3 rounded-xl border border-border bg-surface-muted p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-hover-border hover:shadow-dropdown">
      <span
        className="flex size-14 shrink-0 items-center justify-center rounded-lg"
        style={{
          background: hexToRgba(post.resource.accent, 0.15),
          color: post.resource.accent,
        }}
      >
        <post.resource.icon size={24} strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">
          {post.resource.title}
        </p>
        <p className="text-xs text-ink-faint">{post.resource.kindLabel}</p>
        <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-warning">
          <Star size={12} strokeWidth={1.75} fill="currentColor" />
          {post.resource.rating}
        </p>
      </div>
    </div>
  );
}
