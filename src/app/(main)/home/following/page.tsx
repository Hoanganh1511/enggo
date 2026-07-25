"use client";

import { useSyncExternalStore } from "react";
import PostCard from "@/components/discover/PostCard";
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
    <>
      {posts.length === 0 ? (
        <p className="py-5 text-sm text-ink-faint">
          Bạn chưa follow ai có bài đăng mới.
        </p>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </>
  );
}
