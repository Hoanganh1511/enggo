"use client";

import type { Post } from "@/content/home-feed-mock";
import MasonryGrid from "@/components/ui/masonry-grid";
import {
  AchievementCard,
  MilestoneCard,
  CareerUpdateCard,
  NodeCreatedCard,
} from "./AchievementCard";

// Khai bao ngoai component (giong MasonryFeed.tsx) - truyen inline arrow vao
// MasonryGrid se tao ham moi moi lan render, khien useMemo tinh lai layout
// vo ich.
const getPostKey = (post: Post) => post.id;

function renderPost(post: Post) {
  switch (post.kind) {
    case "achievement":
      return <AchievementCard post={post} />;
    case "milestone":
      return <MilestoneCard post={post} />;
    case "career-update":
      return <CareerUpdateCard post={post} />;
    case "node-created":
      return <NodeCreatedCard post={post} />;
    default:
      return null;
  }
}

// Luoi chinh cua tab "Thanh tich moi" - moi kind 1 mau the RIENG (xem
// AchievementCard.tsx: achievement/milestone/career-update/node-created deu
// co template dung phong cach mau tham khao cua rieng no, khong con gom
// chung node-created vao 1 the tong hop nua), xep vao MasonryGrid (da dung
// cho tab "Bai dang", xem MasonryFeed.tsx) - kich thuoc the deu nhau giua
// cac kind (xem AchievementCardShell) de tranh 1 loai/1 nguoi choan spotlight.
export function AchievementsMasonry({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-surface px-4 py-10 text-center text-sm text-ink-faint">
        Chưa có thành tích nào được chia sẻ.
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
}

export default AchievementsMasonry;
