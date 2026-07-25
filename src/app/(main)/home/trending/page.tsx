"use client";

import { useSyncExternalStore } from "react";
import PostCard from "@/components/discover/PostCard";
import {
  getPosts,
  subscribeFeed,
  getServerSnapshot,
} from "@/lib/discover/feed-store";

// "Trending" - sap xep theo tong tuong tac (like+comment+repost) giam dan
// (mock: tinh tren du lieu tinh, chua co xep hang that theo thoi gian thuc).
export default function TrendingPage() {
  const allPosts = useSyncExternalStore(
    subscribeFeed,
    getPosts,
    getServerSnapshot,
  );
  const posts = [...allPosts].sort((a, b) => {
    const scoreA = a.stats.likes + a.stats.comments + a.stats.reposts;
    const scoreB = b.stats.likes + b.stats.comments + b.stats.reposts;
    return scoreB - scoreA;
  });
  return (
    <>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </>
  );
}
