"use client";

import { useSyncExternalStore } from "react";
import FeedColumns from "@/components/discover/FeedColumns";
import {
  getPosts,
  subscribeFeed,
  getServerSnapshot,
} from "@/lib/discover/feed-store";
import { filterPostsByHomeTab } from "@/lib/discover/post-kind-meta";

// "Bài đăng" - tab mac dinh, chi hien cac kind chia se doi thuong (text/
// image/gallery/video/question/idea/event) - xem homeTab trong
// post-kind-meta.ts de biet kind nao thuoc tab nao.
export default function PostsTabPage() {
  const allPosts = useSyncExternalStore(
    subscribeFeed,
    getPosts,
    getServerSnapshot,
  );
  const posts = filterPostsByHomeTab(allPosts, "posts");
  return <FeedColumns posts={posts} />;
}
