"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { HomeSidebar } from "./HomeSidebar";
import SectionContainer from "@/components/ui/section-container";
import type { ContentType } from "@/lib/discover/post-kind-meta";
import { MoonIcon, Plus, MessageCircle } from "lucide-react";

// Layout cho trang Home duy nhat (page.tsx) - dieu khien toan bo UI loc qua
// query param tren CUNG 1 route, KHONG con dieu huong giua nhieu route con
// nhu ban truoc (xem lich su git: 5 route /achievements /progress /for-it
// /vote /events da gop lai). 3 truc query DOC LAP voi nhau:
// - mode: Live/Trending (HomeSidebar) - doi kieu sap xep.
// - world/topic: Knowledge World/Topic (HomeSidebar) - "chu de".
// - type: Content Type (HomeSidebar) - "dinh dang noi dung".
// Doi type/mode KHONG dong cham world/topic va nguoc lai - moi handler chi
// set/xoa dung param cua no, giu nguyen phan con lai cua query string.
//
// Sidebar trai (HomeSidebar.tsx) thay the "Knowledge Discovery Bar" ngang
// truoc day (HomeCategoryBar.tsx da xoa) - theo dung layout sidebar cua
// note.com, danh sach doc thay vi pill ngang phia tren feed.
const HomeLayoutShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
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

  const mode = getParam("mode") ?? "activity";
  const world = getParam("world");
  const topic = getParam("topic");
  const type = getParam("type") as ContentType | null;

  // Set/xoa 1 nhom param, giu nguyen cac param con lai - dung chung cho ca 4
  // loai thay doi (mode/world/topic/type) de khong lap lai logic build query
  // string 4 lan.
  const pushParams = (patch: Record<string, string | null>) => {
    setPendingParams(patch);
    const qs = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) qs.delete(key);
      else qs.set(key, value);
    }
    const query = qs.toString();
    startTransition(() =>
      router.push(`${pathname}${query ? `?${query}` : ""}`),
    );
  };

  const handleModeChange = (nextMode: string) =>
    pushParams({ mode: nextMode === "activity" ? null : nextMode });

  const handleWorldChange = (nextWorld: string | null) =>
    pushParams({ world: nextWorld });

  const handleTopicChange = (nextTopic: string | null) =>
    pushParams({ topic: nextTopic });

  const handleTypeChange = (nextType: ContentType) =>
    pushParams({ type: nextType === type ? null : nextType });

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

  return (
    <div className="flex min-h-0 min-w-0 flex-1 px-6 pt-4 gap-6 overflow-hidden">
      <HomeSidebar
        mode={mode}
        onModeChange={handleModeChange}
        world={world}
        topic={topic}
        onWorldChange={handleWorldChange}
        onTopicChange={handleTopicChange}
        type={type}
        onTypeChange={handleTypeChange}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-gutter-stable">
        {/* Toolbar noi - neo giua-phai man hinh (khong choan noi dung), dung
            style icon-button vuong (rounded-md) nhu phan con lai cua app
            thay vi pill tron. */}
        <div className="fixed top-1/2 right-5 z-50 flex -translate-y-1/2 flex-col items-center gap-1 rounded-lg border border-border bg-surface/80 p-1.5 shadow-dropdown backdrop-blur-lg">
          <button
            type="button"
            title="Đăng bài"
            onClick={handleComposeClick}
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md bg-button-primary-bg text-white transition-colors duration-150 ease-out hover:bg-button-primary-hover"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
          <span className="my-0.5 h-px w-6 shrink-0 bg-border" />
          <button
            type="button"
            title="Tin nhắn (sắp ra mắt)"
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-icon transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-icon-hover"
          >
            <MessageCircle size={16} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            title="Chuyển giao diện sáng/tối"
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-icon transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-icon-hover"
          >
            <MoonIcon size={16} strokeWidth={1.75} />
          </button>
        </div>
        <div className="flex-1 rounded-xl">
          {/* Noi dung feed (page.tsx) - lam mo trong luc chuyen filter de
              nguoi dung thay ro "danh sach cu sap bi thay", thay vi man hinh
              dung im roi nhay coc sang noi dung moi. */}

          {children}
        </div>
      </div>
    </div>
  );
};

export default HomeLayoutShell;
