"use client";

import { useSyncExternalStore } from "react";
import FeedColumns from "@/components/discover/FeedColumns";
import {
  getPosts,
  subscribeFeed,
  getServerSnapshot,
} from "@/lib/discover/feed-store";
import { filterPostsByHomeTab } from "@/lib/discover/post-kind-meta";

// "Tiến độ" - skill-report/skill-update/project-update/knowledge-block/
// timeline-event/experiment, cac kind cap nhat TIEN TRINH dang lam do (xem
// homeTab trong post-kind-meta.ts).
export default function ProgressTabPage() {
  const allPosts = useSyncExternalStore(
    subscribeFeed,
    getPosts,
    getServerSnapshot,
  );
  const posts = filterPostsByHomeTab(allPosts, "progress");
  return (
    <FeedColumns posts={posts} emptyMessage="Chưa có cập nhật tiến độ nào." />
  );
}
