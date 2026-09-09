"use client";

import { Search } from "lucide-react";
import type { FeedCategoryGroup } from "@/lib/api/feed-categories";
import type { NormalizedPost } from "@/lib/discover/normalize-post";
import { useArticleFilter } from "./use-article-filter";
import { HomeCategoryGrid } from "./HomeCategoryGrid";
import { HomeArticleCard } from "./HomeArticleCard";
import { EmptyState } from "./EmptyState";

const TABS = [
  { id: "latest", label: "Latest", available: true },
  { id: "popular", label: "Popular", available: false },
  { id: "bookmarks", label: "Bookmarks", available: false },
] as const;

// Island DUY NHAT can interactivity that su tren /home: bam 1 category se
// loc grid ben duoi, go search cung vay - 2 thao tac dung CHUNG 1 state (xem
// use-article-filter.ts) nen KHONG tach thanh 2 client component doc lap
// (se phai nang state len 1 parent chung, ra ket qua tuong duong nhung them
// 1 lop truyen prop khong can thiet). Hero/Roadmap/Quote/Activity ben ngoai
// van la Server Component thuan, khong dinh JS nao vao day.
export function HomeArticleSection({
  categoryTree,
  posts,
}: {
  categoryTree: FeedCategoryGroup[];
  posts: NormalizedPost[];
}) {
  const { search, setSearch, activeGroupSlug, activeGroupName, toggleGroup, filtered } =
    useArticleFilter(posts, categoryTree);

  return (
    <div>
      <div className="mt-8 mb-4 flex items-center justify-between">
        <h2 className="text-[18px] font-bold tracking-tight">Browse by category</h2>
      </div>
      <HomeCategoryGrid
        categoryTree={categoryTree}
        activeGroupSlug={activeGroupSlug}
        onToggle={toggleGroup}
      />

      <div className="mt-8 mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[18px] font-bold tracking-tight">
          {activeGroupName ?? "Latest articles"}
        </h2>
        <div className="relative w-full max-w-[320px]">
          <Search
            aria-hidden="true"
            className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <label htmlFor="home-article-search" className="sr-only">
            Tìm bài viết
          </label>
          <input
            id="home-article-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="h-9 w-full rounded-lg bg-[#f7f8fa] pr-3 pl-10 text-[13px] outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-blue-200"
          />
        </div>
      </div>

      <div role="tablist" aria-label="Sắp xếp bài viết" className="mb-4 flex gap-7 border-b border-[#edf0f4] text-[13px]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.available}
            disabled={!tab.available}
            title={tab.available ? undefined : `${tab.label} — sắp có`}
            className={
              tab.available
                ? "border-b-2 border-blue-500 px-1 pb-3 font-semibold"
                : "cursor-not-allowed pb-3 text-slate-300"
            }
          >
            {tab.available ? tab.label : `${tab.label} · Sắp có`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="Không có bài viết nào khớp." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filtered.slice(0, 9).map((post, i) => (
            <HomeArticleCard key={post.id} post={post} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
