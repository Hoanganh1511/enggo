import Link from "next/link";

import type { Post } from "@/content/home-feed-mock";
import { getPostTitle } from "../home-feed/post-display";
import { CompactStats } from "../home-feed/CompactStats";

// Cot 25% ben phai trang chi tiet - danh sach chu gon (khong anh bia) de
// khong canh tranh thi giac voi luoi bai chinh o cot 75%.
export function RelatedPostsPanel({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <aside className="flex w-full shrink-0 flex-col gap-3 lg:w-1/4">
      <h2 className="text-sm font-bold tracking-tight text-ink">
        Bài viết liên quan
      </h2>
      <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/u/${post.author.username}`}
              className="flex flex-col gap-1.5 px-3 py-2.5 transition-colors duration-150 ease-out hover:bg-hover-bg"
            >
              <h3 className="line-clamp-2 text-xs leading-snug font-medium text-ink">
                {getPostTitle(post)}
              </h3>
              <span className="truncate text-[11px] text-ink-faint">
                {post.author.name}
              </span>
              <CompactStats
                likes={post.stats.likes}
                comments={post.stats.comments}
              />
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
