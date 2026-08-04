"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import {
  COMMUNITY_POST_CATEGORY_LABEL,
  type CommunityPost,
  type CommunityPostCategory,
} from "@/content/community-mock";
import { cn } from "@/lib/utils";
import { CommunityPostCard } from "./CommunityPostCard";

const FILTERS: { key: CommunityPostCategory | "all"; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "experience", label: COMMUNITY_POST_CATEGORY_LABEL.experience },
  { key: "qa", label: COMMUNITY_POST_CATEGORY_LABEL.qa },
  { key: "document", label: COMMUNITY_POST_CATEGORY_LABEL.document },
  { key: "discussion", label: COMMUNITY_POST_CATEGORY_LABEL.discussion },
];

// "Bai viet noi bat" (2 the dau, featured=true) + sub-filter (LOC THAT tren
// mang posts mock, khac voi CommunityMainTabs chi doi UI) + danh sach con
// lai. Tach client component rieng khoi page.tsx (server) vi can state
// active filter.
export function CommunityFeed({ posts }: { posts: CommunityPost[] }) {
  const [filter, setFilter] = useState<CommunityPostCategory | "all">("all");

  const featured = useMemo(() => posts.filter((p) => p.featured), [posts]);
  const list = useMemo(
    () =>
      posts.filter(
        (p) => !p.featured && (filter === "all" || p.category === filter),
      ),
    [posts, filter],
  );

  return (
    <div className="flex flex-col gap-6">
      {featured.length > 0 && (
        <section id="featured">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Bài viết nổi bật</h2>
            <Link href="#" className="text-xs font-medium text-primary hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {featured.map((post) => (
              <CommunityPostCard key={post.id} post={post} variant="featured" />
            ))}
          </div>
        </section>
      )}

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-2">
          <div className="flex flex-wrap items-center gap-1">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  "flex h-8 cursor-pointer items-center rounded-md px-2.5 text-sm font-medium transition-colors duration-150 ease-out",
                  filter === key
                    ? "bg-primary/10 text-primary"
                    : "text-ink-muted hover:bg-hover-bg hover:text-ink",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-border px-2.5 text-sm text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
          >
            <SlidersHorizontal size={13} strokeWidth={2} />
            Bộ lọc
          </button>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          {list.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-faint">
              Chưa có bài viết nào trong mục này.
            </p>
          ) : (
            list.map((post) => (
              <CommunityPostCard key={post.id} post={post} variant="list" />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
