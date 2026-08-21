"use client";

import { useMemo, useState } from "react";
import { NoteCard } from "@/components/discover/home-feed/NoteCard";
import type { Post } from "@/content/home-feed-mock";

type Sort = "new" | "popular";

// Thay ProfileFeedBox.tsx (list 1 cot cu) - luoi the note.com style, tai
// dung NGUYEN NoteCard.tsx (da lam "theo dung tinh than note.com" tu truoc,
// xem comment trong file do) thay vi tao card moi. "Phổ biến" la sap xep
// LAI mang posts DA CO san (client-side, theo stats.likes that) - KHONG
// phai fake toggle, chi khong goi lai API rieng vi backend chua co tham so
// sort (xem lib/api/posts.ts).
export default function ProfileArticleGrid({
  heading,
  posts,
}: {
  heading: string;
  posts: Post[];
}) {
  const [sort, setSort] = useState<Sort>("new");
  const sorted = useMemo(() => {
    if (sort === "new") return posts;
    return [...posts].sort((a, b) => b.stats.likes - a.stats.likes);
  }, [posts, sort]);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-border py-3">
        <h2 className="text-sm font-bold text-ink">{heading}</h2>
        {posts.length > 1 && (
          <div className="flex shrink-0 gap-1.5">
            <SortChip
              active={sort === "new"}
              onClick={() => setSort("new")}
              label="Mới nhất"
            />
            <SortChip
              active={sort === "popular"}
              onClick={() => setSort("popular")}
              label="Phổ biến"
            />
          </div>
        )}
      </div>

      {sorted.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink-faint">
          Chưa có nội dung nào ở mục này.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-x-5 gap-y-8 py-5 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((post) => (
            <NoteCard
              key={post.id}
              post={post}
              className="w-full"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SortChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-150 ease-out ${
        active
          ? "bg-primary text-on-primary"
          : "border border-border text-ink-muted hover:bg-hover-bg"
      }`}
    >
      {label}
    </button>
  );
}
