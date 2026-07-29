"use client";

import { useSyncExternalStore } from "react";
import type { Post } from "@/content/home-feed-mock";
import PostCard from "./PostCard";
import MasonryGrid from "@/components/ui/masonry-grid";
import { getFeedStatus, subscribeFeed } from "@/lib/discover/feed-store";

// Khai bao ngoai component: truyen inline arrow vao MasonryGrid se tao ham moi
// moi lan render -> useMemo tinh lai layout vo ich.
const getPostKey = (post: Post) => post.id;
const renderPost = (post: Post) => <PostCard post={post} variant="card" />;

// Feed 1 luong duy nhat, xep theo masonry (xem masonry-grid.tsx).
//
// Khac FeedColumns.tsx (van dung cho cac tab con lai): o do 2 cot co NGHIA -
// trai la hoat dong/chia se ca nhan, phai la tu lieu/cap nhat, moi cot 1 tieu
// de rieng. O day cot KHONG con nghia gi ca, chi la cho de lap day - nen moi
// bai phai la 1 the tu chua dung duoc (variant="card"), khong dung bien the
// timeline (von dua vao duong ke doc cua ca cot).
const MasonryFeed = ({
  posts,
  emptyMessage,
}: {
  posts: Post[];
  emptyMessage?: string;
}) => {
  const status = useSyncExternalStore(subscribeFeed, getFeedStatus, () => "idle" as const);

  if (posts.length === 0 && status === "loading") {
    return (
      <div className="flex flex-wrap gap-4 py-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-40 w-full max-w-80 flex-1 animate-pulse rounded-lg bg-surface-muted"
          />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <p className="py-5 text-sm text-ink-faint">
        {emptyMessage ?? "Chưa có bài viết nào."}
      </p>
    );
  }

  return (
    <MasonryGrid
      items={posts}
      getKey={getPostKey}
      renderItem={renderPost}
      minColumnWidth={280}
      gap={16}
    />
  );
};

export default MasonryFeed;
