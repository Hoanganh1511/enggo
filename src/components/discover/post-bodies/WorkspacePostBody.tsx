import Link from "next/link";
import type { Post } from "@/content/home-feed-mock";
import { hexToRgba } from "@/lib/utils";
import { POST_KIND_META } from "@/lib/discover/post-kind-meta";

type WorkspacePost = Extract<Post, { kind: "workspace-post" }>;

// The hien thi 1 bai viet Workspace duoc "Đăng lên bảng tin" (xem
// PostView.tsx's nut chia se + document.service.ts's shareToFeed) - style
// theo mau LinkBody/ResourceBody trong AttachmentBody.tsx, nhung click duoc
// thang toi trang bai viet day du (khac ResourceBody chi trang tri).
export function WorkspacePostBody({ post }: { post: WorkspacePost }) {
  const kindMeta = POST_KIND_META[post.kind];
  return (
    <Link
      href={`/u/${post.authorUsername}/workspaces/${post.slug}`}
      className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-surface-muted p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-hover-border hover:shadow-dropdown"
    >
      {post.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImageUrl}
          alt=""
          className="size-14 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <span
          className="flex size-14 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: hexToRgba(kindMeta.accent, 0.15),
            color: kindMeta.accent,
          }}
        >
          <kindMeta.icon size={24} strokeWidth={1.75} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">
          {post.title}
        </p>
        {post.summary && (
          <p className="mt-0.5 line-clamp-2 text-xs text-ink-faint">
            {post.summary}
          </p>
        )}
      </div>
    </Link>
  );
}
