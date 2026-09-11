"use client";

import type { NormalizedPost } from "@/lib/discover/normalize-post";
import { HomeArticleCard } from "@/components/discover/home-dashboard/HomeArticleCard";
import { EmptyState } from "@/components/discover/home-dashboard/EmptyState";

// Luoi bai viet THAT thay cho NewestSection.tsx (da xoa - toan bo la mock,
// khong noi du lieu that). Tai dung HomeArticleCard da co san o /home thay vi
// viet lai the bai rieng - "use client" CHI o file nay (HomeArticleCard dung
// framer-motion, can boundary client de render tu page.tsx la Server
// Component thuan). Khong nhom theo category/xep 10 hang nhu ban mock cu -
// chua du bai that de lam vay (xem loading.tsx/page.tsx), hien phang "moi
// nhat" la trung thuc nhat voi luong du lieu hien co.
export function ArticlesPostGrid({ posts }: { posts: NormalizedPost[] }) {
  if (posts.length === 0) {
    return <EmptyState message="Chưa có bài viết nào." />;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {posts.map((post, i) => (
        <HomeArticleCard key={post.id} post={post} index={i} />
      ))}
    </div>
  );
}
