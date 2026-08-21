"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { HomeSidebar } from "./HomeSidebar";
import type { FeedCategoryGroup } from "@/lib/api/feed-categories";
import type { ContentType } from "@/lib/discover/post-kind-meta";

// Layout cho trang Home duy nhat (page.tsx) - dieu khien toan bo UI loc qua
// query param tren CUNG 1 route, KHONG con dieu huong giua nhieu route con
// nhu ban truoc (xem lich su git: 5 route /achievements /progress /for-it
// /vote /events da gop lai). 2 truc query DOC LAP voi nhau:
// - group/field: linh vuc nghe nghiep 2 tang (HomeSidebar).
// - type: Content Type (HomeSidebar) - "dinh dang noi dung".
// Doi type KHONG dong cham group/field va nguoc lai - moi handler chi
// set/xoa dung param cua no, giu nguyen phan con lai cua query string.
//
// `world`/`topic` (Knowledge Worlds) KHONG con loi vao tu sidebar nua (da bi
// cay nghe nghiep thay the) nhung home/page.tsx VAN doc chung, vi section
// "Chủ đề đang được quan tâm" trong EditorialFeed.tsx con link toi
// /home?topic=... - nen pushParams o day khong duoc xoa 2 param do.
//
// Shell nay dung CHUNG cho 3 trang DANH SACH /home, /series, /contest (xem
// (main)/(feed)/layout.tsx) - CAC TRANG CHI TIET /series/[slug], /contest/[slug]
// KHONG dung shell nay (co y dat ngoai route group (feed), xem
// docs/engineering-log.md) vi bo loc linh vuc nghe nghiep o day chi co
// nghia voi danh sach, khong lien quan gi toi 1 series/cuoc thi cu the.
const HomeLayoutShell = ({
  children,
  categoryTree,
}: {
  children: React.ReactNode;
  categoryTree: FeedCategoryGroup[];
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  // Chi de lam mo noi dung + optimistic label trong luc transition (doi query
  // string tren cung route, khong co gi de "cho" ngoai 1 nhip render).
  const [isPending, startTransition] = useTransition();
  const [pendingParams, setPendingParams] = useState<Record<
    string,
    string | null
  > | null>(null);

  const getParam = (key: string) =>
    (isPending && pendingParams && key in pendingParams
      ? pendingParams[key]
      : searchParams.get(key)) ?? null;

  const group = getParam("group");
  const field = getParam("field");
  const type = getParam("type") as ContentType | null;

  // Set/xoa 1 nhom param, giu nguyen cac param con lai - dung chung cho ca 3
  // loai thay doi (group/field/type) de khong lap lai logic build query
  // string 3 lan.
  //
  // Luon dieu huong ve "/home" chu KHONG dung usePathname(): shell nay con
  // duoc dung o /series va /contest (2 trang DANH SACH, khong phai trang chi
  // tiet), ma cac bo loc chi co y nghia voi feed bai viet - bam 1 linh vuc
  // khi dang o /contest phai dua nguoi dung ve feed dang loc theo linh vuc
  // do, khong phai gan query vo nghia vao /contest.
  const pushParams = (patch: Record<string, string | null>) => {
    setPendingParams(patch);
    const qs = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) qs.delete(key);
      else qs.set(key, value);
    }
    const query = qs.toString();
    startTransition(() => router.push(`/home${query ? `?${query}` : ""}`));
  };

  // Xoa CA group+field trong 1 lan push - KHONG duoc tach thanh 2 lenh rieng
  // (pushParams({group}) roi pushParams({field:null})): "searchParams" tu
  // useSearchParams() chua kip cap nhat giua 2 lenh (chi cap nhat sau khi
  // React render lai), nen lenh thu 2 se doc lai URL CU (chua co group moi)
  // roi build lai tu do - de mat luon thay doi cua lenh thu 1. Day chinh la
  // bug "bam nhom khong thay gi doi" da gap o ban Knowledge World truoc day.
  const handleGroupChange = (nextGroup: string | null) =>
    pushParams({ group: nextGroup, field: null });

  const handleFieldChange = (nextField: string | null) =>
    pushParams({ field: nextField, group: null });

  const handleTypeChange = (nextType: ContentType) =>
    pushParams({ type: nextType === type ? null : nextType });

  // "Tat ca" - xoa CA 5 param trong 1 lan push (khong the ghep tu cac handler
  // rieng le: neu param nao von da rong san thi lenh do khong doi URL ti nao,
  // con type thi khong co handler nao xoa duoc no ngoai toggle theo dung 1
  // gia tri dang chon). Xoa luon world/topic vi nguoi dung co the dang o
  // /home?topic=... den tu section "Chủ đề đang được quan tâm".
  const handleClearAll = () =>
    pushParams({
      group: null,
      field: null,
      type: null,
      world: null,
      topic: null,
    });

  // Cuon toi + focus thang vao PostComposer dang co san ben duoi (id
  // "post-composer"/"post-composer-input") - component nay chi render trong
  // pham vi /home nen luon co composer, khong can dieu huong nhu nut "Dang
  // bai" tren header (xem top-header-bar.tsx, phai xu ly ca truong hop o trang
  // khac).
  const handleComposeClick = () => {
    document
      .getElementById("post-composer")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById("post-composer-input")?.focus();
  };

  // Nut "Viết bài" tren header (TopHeaderBar.tsx) dieu huong ve
  // /home?compose=1 khi dang o trang KHAC /home - tu cuon+focus composer
  // ngay khi shell nay mount voi param do, roi don param di (khong giu URL
  // ?compose=1 mai, tranh cuon lai moi lan back/forward).
  useEffect(() => {
    if (searchParams.get("compose") !== "1") return;
    handleComposeClick();
    const qs = new URLSearchParams(searchParams.toString());
    qs.delete("compose");
    const query = qs.toString();
    router.replace(`/home${query ? `?${query}` : ""}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // KHONG con overflow-hidden/overflow-y-auto o day - de sidebar va feed
  // CUNG cuon trong 1 vung cuon DUY NHAT la MainContentArea (ancestor, xem
  // main-content-area.tsx) thay vi feed tu cuon rieng trong 1 hop con. Sidebar
  // "sticky" CAN dieu nay: overflow khac "visible" o bat ky to tien nao nam
  // giua sticky element va vung cuon that su deu lam gay sticky (khong con
  // "dinh" duoc nua) - day chinh la ly do sticky khong hoat dong truoc do.
  return (
    <div className="flex min-w-0 flex-1 gap-6 px-4 pt-4">
      <HomeSidebar
        categoryTree={categoryTree}
        group={group}
        field={field}
        onGroupChange={handleGroupChange}
        onFieldChange={handleFieldChange}
        type={type}
        onTypeChange={handleTypeChange}
        onClearAll={handleClearAll}
      />

      <div className="min-w-0 flex-1 rounded-md">{children}</div>
    </div>
  );
};

export default HomeLayoutShell;
