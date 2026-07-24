import { Check } from "lucide-react";
import type { Post } from "@/content/home-feed-mock";
import { hexToRgba } from "@/lib/skill-tree/status-style";

type ProjectUpdatePost = Extract<Post, { kind: "project-update" }>;

// Project Update - dang GitHub Release: header co icon + ten project + badge
// version (monospace), duoi la changelog dang checklist.
export function ProjectUpdateBody({ post }: { post: ProjectUpdatePost }) {
  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-border">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-surface-muted px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-md"
            style={{
              background: hexToRgba(post.accent, 0.15),
              color: post.accent,
            }}
          >
            <post.icon size={16} strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-medium tracking-wide text-ink-faint uppercase">
              Project
            </p>
            <p className="truncate text-sm font-semibold text-ink">
              {post.project}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-tag-bg px-2 py-0.5 font-mono text-xs font-semibold text-tag-text">
          {post.version}
        </span>
      </div>
      <div className="flex flex-col gap-1.5 px-4 py-3">
        {post.changes.map((change) => (
          <div
            key={change}
            className="flex items-center gap-2 text-sm text-ink-muted"
          >
            <Check
              size={14}
              strokeWidth={2.5}
              className="shrink-0 text-success"
            />
            {change}
          </div>
        ))}
      </div>
    </div>
  );
}
