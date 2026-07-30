"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import ProfileFeedBox from "@/components/profile/ProfileFeedBox";
import { useAllPosts } from "@/lib/discover/use-all-posts";

// Tab "Bai dang" - toan bo bai cua chinh chu profile nay (khong gioi han 10
// nhu tab Trang chu).
export default function ProfilePostsTabPage() {
  const { username } = useParams<{ username: string }>();
  const allPosts = useAllPosts();

  const posts = useMemo(
    () => allPosts.filter((p) => p.author.username === decodeURIComponent(username)),
    [allPosts, username],
  );

  return <ProfileFeedBox heading="Tất cả bài đăng" posts={posts} />;
}
