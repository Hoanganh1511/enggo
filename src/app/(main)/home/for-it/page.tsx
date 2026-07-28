"use client";

import { useSyncExternalStore } from "react";
import FeedColumns from "@/components/discover/FeedColumns";
import {
  getPosts,
  subscribeFeed,
  getServerSnapshot,
} from "@/lib/discover/feed-store";
import { filterPostsByHomeTab } from "@/lib/discover/post-kind-meta";

// "For IT" - note/file/link/resource/code-snippet/tutorial, cac kind mang
// tinh tu lieu/kien thuc ky thuat (xem homeTab trong post-kind-meta.ts).
export default function ForItTabPage() {
  const allPosts = useSyncExternalStore(
    subscribeFeed,
    getPosts,
    getServerSnapshot,
  );
  const posts = filterPostsByHomeTab(allPosts, "for-it");
  return (
    <FeedColumns posts={posts} emptyMessage="Chưa có tài liệu nào được chia sẻ." />
  );
}
