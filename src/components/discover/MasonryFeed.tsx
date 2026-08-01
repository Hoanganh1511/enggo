"use client";

import { useSyncExternalStore } from "react";
import type { Post } from "@/content/home-feed-mock";
import PostCard from "./PostCard";
import MasonryGrid from "@/components/ui/masonry-grid";
import { getFeedStatus, subscribeFeed } from "@/lib/discover/feed-store";
import PostCardSkeleton from "./PostCardSkeleton";

// Khai bao ngoai component: truyen inline arrow vao MasonryGrid se tao ham moi
// moi lan render -> useMemo tinh lai layout vo ich.
const getPostKey = (post: Post) => post.id;
const renderPost = (post: Post) => <PostCard post={post} variant="card" />;

// Skeleton phai di qua DUNG MasonryGrid (khong tu flex-wrap rieng) de tinh
// so cot GIONG HET feed that (theo minColumnWidth=280 ben duoi) - flex-wrap
// tu trinh duyet tinh so cot khac thuat toan cua MasonryGrid, gay lech so
// cot giua luc loading va luc co du lieu that.
type SkeletonItem = { id: string; bodyHeight: string };
const SKELETON_ITEMS: SkeletonItem[] = [
  "h-24",
  "h-40",
  "h-32",
  "h-56",
  "h-28",
  "h-44",
].map((bodyHeight, i) => ({ id: `skeleton-${i}`, bodyHeight }));
const getSkeletonKey = (item: SkeletonItem) => item.id;
const renderSkeleton = (item: SkeletonItem) => (
  <PostCardSkeleton variant="card" bodyHeight={item.bodyHeight} />
);

// Feed 1 luong duy nhat, xep theo masonry (xem masonry-grid.tsx) - dung
// CHUNG cho toan bo trang Home (thay FeedColumns.tsx 2 cot da xoa, tu luc
// gop 6 route con thanh 1 trang duy nhat loc qua query param). Moi bai la 1
// the tu chua dung duoc (variant="card").
const MasonryFeed = ({
  posts,
  emptyMessage,
  loading,
}: {
  posts: Post[];
  emptyMessage?: string;
  // Ghi de trang thai loading cua feed-store dung chung - dung khi component
  // cha (vd trang /home/category/[slug]) tu fetch rieng (API loc that theo
  // category), khong doc tu feed-store nen can tu bao trang thai loading.
  loading?: boolean;
}) => {
  const status = useSyncExternalStore(subscribeFeed, getFeedStatus, () => "idle" as const);
  const isLoading = loading ?? status === "loading";

  if (posts.length === 0 && isLoading) {
    return (
      <MasonryGrid
        items={SKELETON_ITEMS}
        getKey={getSkeletonKey}
        renderItem={renderSkeleton}
        minColumnWidth={280}
        gap={16}
      />
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
