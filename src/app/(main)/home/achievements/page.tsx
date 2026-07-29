"use client";

import { useSyncExternalStore } from "react";
import {
  getPosts,
  subscribeFeed,
  getServerSnapshot,
} from "@/lib/discover/feed-store";
import { filterPostsByHomeTab } from "@/lib/discover/post-kind-meta";
import { TodayAchieversStrip } from "@/components/discover/achievements/TodayAchieversStrip";
import { AchievementsMasonry } from "@/components/discover/achievements/AchievementsMasonry";

// "Thanh tich moi" - rut gon chi con 2 muc theo yeu cau: (1) dai nho "hom
// nay" (TodayAchieversStrip, chiem it khong gian, kem hint chuoi neu co du
// lieu that), (2) luoi chinh moi kind 1 mau the rieng (AchievementsMasonry).
// Da bo Header/Stats/ViewToggle/SidebarRight - khong con nhung muc do.
export default function AchievementsTabPage() {
  const allPosts = useSyncExternalStore(
    subscribeFeed,
    getPosts,
    getServerSnapshot,
  );
  const achievementPosts = filterPostsByHomeTab(allPosts, "achievements");

  return (
    <div className="flex flex-col gap-4">
      <TodayAchieversStrip posts={achievementPosts} />
      <AchievementsMasonry posts={achievementPosts} />
    </div>
  );
}
