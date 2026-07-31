"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import MasonryFeed from "@/components/discover/MasonryFeed";
import { SidebarPlaceholder } from "@/components/discover/SidebarPlaceholder";
import {
  getPosts,
  subscribeFeed,
  getServerSnapshot,
} from "@/lib/discover/feed-store";
import { filterPostsByHomeTab } from "@/lib/discover/post-kind-meta";

// "Bài đăng" - tab mac dinh, chi hien cac kind chia se doi thuong (text/
// image/gallery/video/question/idea/event) - xem homeTab trong
// post-kind-meta.ts de biet kind nao thuoc tab nao.
//
// Rieng tab nay dung MasonryFeed (1 luong duy nhat, xep kieu Pinterest) thay
// vi FeedColumns (2 cot chia theo nghia) - noi dung o day da duoc tab loc san
// nen viec chia them "Hoat dong & chia se" / "Tu lieu & cap nhat" khong con y
// nghia. 4 tab con lai van dung FeedColumns.
//
// 2 sidebar 2 ben (SidebarPlaceholder, chua co noi dung that - gach cho
// truoc) thu hep cot giua lai de masonry (minColumnWidth=280 trong
// MasonryFeed.tsx) tu nhien xep con 3 cot thay vi 4 tren man hinh thuong.
// Ca 2 sidebar deu da thu nho so voi mac dinh w-64 cua SidebarPlaceholder:
// trai con w-48 (192px), phai con w-[205px] (giam 20% tu 256px) - theo dung
// 2 lan yeu cau rieng cho tung ben.
export default function PostsTabPage() {
  const allPosts = useSyncExternalStore(
    subscribeFeed,
    getPosts,
    getServerSnapshot,
  );
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") ?? "activity";

  const posts = useMemo(() => {
    let list = filterPostsByHomeTab(allPosts, "posts");
    // "hot" - sap xep theo luot thich giam dan thay vi thu tu mac dinh (moi
    // nhat truoc, tu API).
    if (mode === "hot") {
      list = [...list].sort((a, b) => b.stats.likes - a.stats.likes);
    }
    return list;
  }, [allPosts, mode]);

  return (
    <div className="grid grid-cols-[3fr_1fr] items-start gap-6">
      {/* <SidebarPlaceholder label="Sidebar trái" widthClass="w-48" /> */}
      <div className="min-w-0">
        <MasonryFeed posts={posts} />
      </div>
      <SidebarPlaceholder label="Sidebar phải" widthClass="w-full" />
    </div>
  );
}
