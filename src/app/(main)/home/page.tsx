"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EditorialFeed } from "@/components/discover/home-feed/EditorialFeed";
import { SingleTypeFeedList } from "@/components/discover/home-feed/SingleTypeFeedList";
import { SidebarPlaceholder } from "@/components/discover/SidebarPlaceholder";
import { listPostsAction } from "@/actions/discover/list-posts";
import {
  getKindsByContentType,
  CONTENT_TYPES,
  type ContentType,
} from "@/lib/discover/post-kind-meta";
import {
  getTopicBySlug,
  slugToCategoryEnum,
} from "@/lib/discover/knowledge-worlds";
import type { Post } from "@/content/home-feed-mock";

// Trang Home DUY NHAT - thay 6 route con cu (/achievements /progress
// /for-it /vote /events, xem lich su git) bang 1 route dieu khien qua query
// param. Topic (?topic=, chon o HomeCategoryBar.tsx) va Content Type
// (?type=, chon o HomeLayoutShell.tsx) la 2 truc loc DOC LAP, ket hop dong
// thoi qua 1 lan fetch server that (KHONG con doc/loc client tren feed-store
// co dinh 50 bai nhu truoc - bat buoc de ket hop dung ca 2 truc cung luc).
// "world" (?world=) chi anh huong UI cua HomeCategoryBar, khong can cho fetch
// o day.
export default function HomeFeedPage() {
  const searchParams = useSearchParams();
  const topicSlug = searchParams.get("topic");
  const typeParam = searchParams.get("type");
  const mode = searchParams.get("mode") ?? "activity";

  // Bo qua gia tri topic/type khong hop le (vd go tay URL sai) thay vi gui
  // thang xuong backend - category sai enum se lam Prisma throw loi 500.
  const topic = topicSlug ? getTopicBySlug(topicSlug) : undefined;
  const contentType = CONTENT_TYPES.some((t) => t.key === typeParam)
    ? (typeParam as ContentType)
    : undefined;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Dung dung pattern "reset-then-fetch" chinh thuc cua React docs (You
    // Might Not Need An Effect - Fetching Data) - setState dong bo ngay dau
    // effect de bao "dang tai" truoc khi ket qua ve, khong phai bug.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    listPostsAction({
      category: topic ? slugToCategoryEnum(topic.slug) : undefined,
      kind: contentType ? getKindsByContentType(contentType) : undefined,
      // Tang tu 50 len 70 - EditorialFeed can du bai de chia thanh nhieu
      // section (Featured/Latest/Resources/Projects/Questions/Achievements)
      // thay vi chi 1 luoi duy nhat nhu MasonryFeed truoc day.
      limit: 70,
    })
      .then((result) => {
        if (!cancelled) setPosts(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [topic, contentType]);

  const sortedPosts = useMemo(() => {
    if (mode !== "hot") return posts;
    return [...posts].sort((a, b) => b.stats.likes - a.stats.likes);
  }, [posts, mode]);

  return (
    <div className="items-start gap-6">
      <div className="min-w-0">
        {/* Chua chon Content Type nao -> layout editorial day du 7 section;
            da chon 1 loai cu the -> danh sach don gian dung dung khuon the
            loai do (xem SingleTypeFeedList.tsx). */}
        {contentType ? (
          <SingleTypeFeedList
            posts={sortedPosts}
            loading={loading}
            type={contentType}
          />
        ) : (
          <EditorialFeed posts={sortedPosts} loading={loading} />
        )}
      </div>
      {/* <SidebarPlaceholder label="Sidebar phải" widthClass="w-full" /> */}
    </div>
  );
}
