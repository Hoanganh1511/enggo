"use client";

import { useSyncExternalStore } from "react";
import FeedColumns from "@/components/discover/FeedColumns";
import {
  getPosts,
  subscribeFeed,
  getServerSnapshot,
} from "@/lib/discover/feed-store";

// "Following" - chi hien post cua nguoi dang follow (mock: loc theo co
// "following" trong data, chua co he thong follow that).
export default function FollowingPage() {
  const allPosts = useSyncExternalStore(
    subscribeFeed,
    getPosts,
    getServerSnapshot,
  );
  const posts = allPosts.filter((p) => p.following);
  return (
    <FeedColumns
      posts={posts}
      emptyMessage="Bạn chưa follow ai có bài đăng mới."
    />
  );
}
