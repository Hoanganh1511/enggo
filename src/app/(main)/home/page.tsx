"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EditorialFeed } from "@/components/discover/home-feed/EditorialFeed";
import { SingleTypeFeedList } from "@/components/discover/home-feed/SingleTypeFeedList";
import { listPostsAction } from "@/actions/discover/list-posts";
import {
  getKindsByContentType,
  CONTENT_TYPES,
  type ContentType,
} from "@/lib/discover/post-kind-meta";
import {
  KNOWLEDGE_WORLDS,
  getTopicBySlug,
  slugToCategoryEnum,
} from "@/lib/discover/knowledge-worlds";
import type { Post } from "@/content/home-feed-mock";

// Trang Home DUY NHAT - thay 6 route con cu (/achievements /progress
// /for-it /vote /events, xem lich su git) bang 1 route dieu khien qua query
// param. Topic (?topic=) va Content Type (?type=, chon o HomeSidebar.tsx) la
// 2 truc loc DOC LAP, ket hop dong thoi qua 1 lan fetch server that (KHONG
// con doc/loc client tren feed-store co dinh 50 bai nhu truoc - bat buoc de
// ket hop dung ca 2 truc cung luc).
//
// "world" (?world=): khi CHUA chon Topic con cu the nao trong World dang mo,
// van phai loc duoc theo CA World do - gop category cua TAT CA topic con
// trong world lam 1 mang truyen cho backend (category=FRONTEND,BACKEND,...).
// Thieu buoc nay la ly do bam 1 World (vd "Build") truoc day khong thay gi
// doi tren feed - sidebar chi mo rong danh sach topic, khong he anh huong
// fetch.
export default function HomeFeedPage() {
  const searchParams = useSearchParams();
  const worldSlug = searchParams.get("world");
  const topicSlug = searchParams.get("topic");
  const typeParam = searchParams.get("type");
  // Truc loc NGHE NGHIEP (sidebar) - doc lap voi world/topic o tren. Khong
  // can validate o day nhu topic/type: slug sai chi lam backend tra ve rong
  // chu khong vo Prisma (day la quan he bang, khong phai enum).
  const groupSlug = searchParams.get("group");
  const fieldSlug = searchParams.get("field");

  // Bo qua gia tri topic/type khong hop le (vd go tay URL sai) thay vi gui
  // thang xuong backend - category sai enum se lam Prisma throw loi 500.
  const topic = topicSlug ? getTopicBySlug(topicSlug) : undefined;
  const world = !topic && worldSlug
    ? KNOWLEDGE_WORLDS.find((w) => w.slug === worldSlug)
    : undefined;
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
    const category = topic
      ? [slugToCategoryEnum(topic.slug)]
      : world
        ? world.topics.map((t) => slugToCategoryEnum(t.slug))
        : undefined;
    listPostsAction({
      category,
      kind: contentType ? getKindsByContentType(contentType) : undefined,
      // Chon 1 nhanh con -> loc dung nhanh do; chon nhom cha -> gui slug nhom
      // (backend tu mo rong ra moi nhanh con, xem post.service.ts). Chon nhanh
      // thi bo qua nhom de 2 dieu kien khong chong nhau.
      careerCategory: fieldSlug ? [fieldSlug] : undefined,
      careerGroup: !fieldSlug && groupSlug ? groupSlug : undefined,
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
    // topic/world la object reference ON DINH (lay tu KNOWLEDGE_WORLDS - mang
    // hang so, .find()/lookup tra ve dung 1 reference cho cung 1 slug) nen
    // dua thang vao dependency an toan, khong gay fetch lai vo ich moi render.
    // group/field la string tu URL nen luon on dinh.
  }, [topic, world, contentType, groupSlug, fieldSlug]);

  return (
    <div className="items-start gap-6">
      <div className="min-w-0">
        {/* Chua chon Content Type nao -> layout editorial day du 7 section;
            da chon 1 loai cu the -> danh sach don gian dung dung khuon the
            loai do (xem SingleTypeFeedList.tsx). */}
        {contentType ? (
          <SingleTypeFeedList
            posts={posts}
            loading={loading}
            type={contentType}
          />
        ) : (
          <EditorialFeed posts={posts} loading={loading} />
        )}
      </div>
    </div>
  );
}
