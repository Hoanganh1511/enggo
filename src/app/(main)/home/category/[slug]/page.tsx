"use client";

import { use, useEffect, useMemo, useState } from "react";
import { notFound, useSearchParams } from "next/navigation";
import MasonryFeed from "@/components/discover/MasonryFeed";
import { SidebarPlaceholder } from "@/components/discover/SidebarPlaceholder";
import { listPostsAction } from "@/actions/discover/list-posts";
import {
  getLinhVucBySlug,
  slugToCategoryEnum,
} from "@/lib/discover/category-taxonomy";
import type { Post } from "@/content/home-feed-mock";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// Trang "Linh vuc" (vd /home/category/frontend) - KHAC /home va cac tab con
// khac: khong doc tu feed-store dung chung (feed-store chi fetch "tat ca bai
// gan day", khong loc theo category), ma TU FETCH RIENG qua API that
// (GET /posts?category=FRONTEND, loc o DB - xem post.controller.ts
// career-tree-api) moi lan slug doi.
export default function CategoryTabPage({ params }: PageProps) {
  const { slug } = use(params);
  const linhVuc = getLinhVucBySlug(slug);
  if (!linhVuc) notFound();

  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") ?? "activity";

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listPostsAction({ category: slugToCategoryEnum(slug), limit: 50 })
      .then((result) => {
        if (!cancelled) setPosts(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const sortedPosts = useMemo(() => {
    if (mode !== "hot") return posts;
    return [...posts].sort((a, b) => b.stats.likes - a.stats.likes);
  }, [posts, mode]);

  return (
    <div className="grid grid-cols-[3fr_1fr] items-start gap-6">
      <div className="min-w-0">
        <h1 className="mb-3 text-sm font-bold text-ink">{linhVuc.label}</h1>
        <MasonryFeed
          posts={sortedPosts}
          loading={loading}
          emptyMessage={`Chưa có bài viết nào thuộc ${linhVuc.label}.`}
        />
      </div>
      <SidebarPlaceholder label="Sidebar phải" widthClass="w-full" />
    </div>
  );
}
