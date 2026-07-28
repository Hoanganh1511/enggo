"use client";

import { useSyncExternalStore } from "react";
import FeedColumns from "@/components/discover/FeedColumns";
import {
  getPosts,
  subscribeFeed,
  getServerSnapshot,
} from "@/lib/discover/feed-store";
import { filterPostsByHomeTab } from "@/lib/discover/post-kind-meta";

// "Thành tích mới" - achievement/milestone/career-update/node-created, cac
// kind mang tinh "cot moc vua dat duoc" (xem homeTab trong post-kind-meta.ts).
export default function AchievementsTabPage() {
  const allPosts = useSyncExternalStore(
    subscribeFeed,
    getPosts,
    getServerSnapshot,
  );
  const posts = filterPostsByHomeTab(allPosts, "achievements");
  return (
    <FeedColumns
      posts={posts}
      emptyMessage="Chưa có thành tích nào được chia sẻ."
    />
  );
}
