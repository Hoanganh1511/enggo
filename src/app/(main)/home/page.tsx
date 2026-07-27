"use client";

import { useSyncExternalStore } from "react";
import FeedColumns from "@/components/discover/FeedColumns";
import {
  getPosts,
  subscribeFeed,
  getServerSnapshot,
} from "@/lib/discover/feed-store";

// "For you" - tab mac dinh, hien tat ca bai post (mock + bai vua dang qua
// PostComposer, xem lib/discover/feed-store.ts).
export default function ForYouPage() {
  const posts = useSyncExternalStore(
    subscribeFeed,
    getPosts,
    getServerSnapshot,
  );
  return <FeedColumns posts={posts} />;
}
