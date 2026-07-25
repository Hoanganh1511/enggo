import type { Post } from "@/content/home-feed-mock";

type CodeSnippetPost = Extract<Post, { kind: "code-snippet" }>;

// Code Snippet - khoi code mono trong khung toi mau trung tinh, tab ngon ngu
// o tren. Nut "Copy" nam o action bar (xem action-bar/), khong lap lai o day.
export function CodeSnippetBody({ post }: { post: CodeSnippetPost }) {
  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-border">
      <div className="flex items-center justify-between border-b border-border bg-surface-muted px-3 py-1.5">
        <span className="font-mono text-[11px] font-medium text-ink-faint">
          {post.language}
        </span>
        {post.title && (
          <span className="text-xs font-medium text-ink">{post.title}</span>
        )}
      </div>
      <pre className="overflow-x-auto p-3 text-xs leading-relaxed text-ink">
        <code>{post.code}</code>
      </pre>
    </div>
  );
}
