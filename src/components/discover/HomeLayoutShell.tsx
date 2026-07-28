"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import PostComposer from "./PostComposer";
import HomeRightPanel from "./HomeRightPanel";
import TrendingPulseStrip from "./TrendingPulseStrip";
import { MoonIcon, Plus } from "lucide-react";

const TABS = [
  { href: "/home", label: "Bài đăng" },
  { href: "/home/achievements", label: "Thành tích mới" },
  { href: "/home/progress", label: "Tiến độ" },
  { href: "/home/for-it", label: "For IT" },
  { href: "/home/vote", label: "Vote" },
];

// Layout dung chung cho 5 trang tab (home/page.tsx,
// home/achievements/page.tsx, home/progress/page.tsx, home/for-it/page.tsx,
// home/vote/page.tsx) - moi tab loc theo "kind" cua post (xem
// filterPostsByHomeTab trong post-kind-meta.ts) thay vi theo trang thai
// follow/diem tuong tac nhu bo tab cu. Search bar, o soan bai (PostComposer)
// va cot phai (HomeRightPanel) nam O DAY thay vi trong tung page, nen KHONG
// bi remount khi chuyen tab (dung dac tinh layout.tsx cua Next.js App Router:
// layout khong remount khi doi route con cung cap). "children" chi la danh
// sach post rieng cua tung tab.
const HomeLayoutShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  // Cuon toi + focus thang vao PostComposer dang co san ben duoi (id
  // "post-composer"/"post-composer-input") - component nay chi render trong
  // pham vi /home nen luon co composer, khong can dieu huong nhu nut "Dang
  // bai" ben Sidebar (xem sidebar.tsx, phai xu ly ca truong hop dang o trang
  // khac).
  const handleComposeClick = () => {
    document
      .getElementById("post-composer")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById("post-composer-input")?.focus();
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 gap-6 overflow-hidden ">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {/* <TrendingPulseStrip /> */}
        {/* Toolbar noi - truoc la thanh ngang neo giua-duoi man hinh, gio
            chuyen thanh dock doc neo giua-phai man hinh (khong choan noi
            dung, khong che tab/feed o duoi), dung style icon-button vuong
            (rounded-md) nhu phan con lai cua app thay vi pill tron. */}
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
            title="Chuyển giao diện sáng/tối"
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-icon transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-icon-hover"
          >
            <MoonIcon size={16} strokeWidth={1.75} />
          </button>
        </div>
        <PostComposer />
        <div className=" flex-1 rounded-xl">
          <div className="mb-4  flex shrink-0 items-center gap-7  ">
            {TABS.map((tab) => {
              const active = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`relative flex h-11 shrink-0 items-center text-sm font-medium transition-colors duration-150 ease-out ${
                    active ? "text-primary" : "text-ink hover:text-ink-muted"
                  }`}
                >
                  {tab.label}
                  {active && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </div>
          {/* 1 box chung cho ca 3 tab - moi post la 1 hang ngan cach bang
              duong ke (divide-y), khong con la card rieng co border/bo goc
              cua tung bai nhu truoc, de style thong nhat va gon hon. Viec
              chia 2 cot theo loai bai viet nam trong FeedColumns.tsx (tung
              page tu truyen posts vao do), o day chi con render 1 lan. */}
          {children}
        </div>
      </div>

      {/* <HomeRightPanel /> */}
    </div>
  );
};

export default HomeLayoutShell;
