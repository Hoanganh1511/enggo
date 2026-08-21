"use client";

import { useMemo } from "react";
import ProfileArticleGrid from "@/components/profile/ProfileArticleGrid";
import { useAllPosts } from "@/lib/discover/use-all-posts";

// Tab "Thich" - danh sach bai nguoi xem (khong phan biet tac gia) da thich,
// khong loc theo chinh chu profile nhu cac tab khac.
export default function ProfileLikesTabPage() {
  const allPosts = useAllPosts();
  const posts = useMemo(() => allPosts.filter((p) => p.liked), [allPosts]);

  return <ProfileArticleGrid heading="Bài viết đã thích" posts={posts} />;
}
