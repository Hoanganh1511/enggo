"use client";

import { useSyncExternalStore } from "react";
import MasonryFeed from "@/components/discover/MasonryFeed";
import {
  getPosts,
  subscribeFeed,
  getServerSnapshot,
} from "@/lib/discover/feed-store";
import { filterPostsByHomeTab } from "@/lib/discover/post-kind-meta";

// "Su kien" - truoc la placeholder "dang xay dung", gio da co data that: kind
// "event" duoc chuyen homeTab tu "posts" sang "events" (xem post-kind-meta.ts)
// nen khong con lan sang tab "Bai dang" nua. Dung MasonryFeed (khong phai
// FeedColumns) vi chi co 1 kind duy nhat trong tab nay - FeedColumns se luon
// de trong cot "Hoat dong & chia se" (group "personal"), lang phi layout.
export default function EventsTabPage() {
  const allPosts = useSyncExternalStore(
    subscribeFeed,
    getPosts,
    getServerSnapshot,
  );
  const posts = filterPostsByHomeTab(allPosts, "events");
  return (
    <MasonryFeed posts={posts} emptyMessage="Chưa có sự kiện nào sắp diễn ra." />
  );
}
