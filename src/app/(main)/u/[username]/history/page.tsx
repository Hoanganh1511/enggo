"use client";

import { useMemo } from "react";
import ProfileArticleGrid from "@/components/profile/ProfileArticleGrid";
import { useAllPosts } from "@/lib/discover/use-all-posts";

// Tab "Lich su" - chi co nghia voi chinh chu (an voi nguoi khac o ProfileTabBar),
// hien 8 bai gan nhat nguoi xem tung xem qua (chua co bang luu lich su that,
// tam lay 8 bai dau tien tu feed).
export default function ProfileHistoryTabPage() {
  const allPosts = useAllPosts();
  const posts = useMemo(() => allPosts.slice(0, 8), [allPosts]);

  return <ProfileArticleGrid heading="Lịch sử xem" posts={posts} />;
}
