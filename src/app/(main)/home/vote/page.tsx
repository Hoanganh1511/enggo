"use client";

import { useSyncExternalStore } from "react";
import FeedColumns from "@/components/discover/FeedColumns";
import {
  getPosts,
  subscribeFeed,
  getServerSnapshot,
} from "@/lib/discover/feed-store";
import { filterPostsByHomeTab } from "@/lib/discover/post-kind-meta";

// "Vote" - chi kind "poll" (xem homeTab trong post-kind-meta.ts).
export default function VoteTabPage() {
  const allPosts = useSyncExternalStore(
    subscribeFeed,
    getPosts,
    getServerSnapshot,
  );
  const posts = filterPostsByHomeTab(allPosts, "vote");
  return (
    <FeedColumns posts={posts} emptyMessage="Chưa có bình chọn nào." />
  );
}
