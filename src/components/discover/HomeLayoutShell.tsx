"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import PostComposer from "./PostComposer";
import HomeRightPanel from "./HomeRightPanel";
import TrendingPulseStrip from "./TrendingPulseStrip";
import { MoonIcon, Plus } from "lucide-react";

const TABS = [
  { href: "/home", label: "For you" },
  { href: "/home/following", label: "Following" },
  { href: "/home/trending", label: "Trending" },
];

// Layout dung chung cho 3 trang For you/Following/Trending
// (home/page.tsx, home/following/page.tsx, home/trending/page.tsx) - search
// bar, o soan bai (PostComposer) va cot phai (HomeRightPanel) nam O DAY thay
// vi trong tung page, nen KHONG bi remount khi chuyen tab (dung dac tinh
// layout.tsx cua Next.js App Router: layout khong remount khi doi route con
// cung cap). "children" chi la danh sach post rieng cua tung tab.
const HomeLayoutShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    // Viec gioi han + can giua max-width da chuyen len AppShellRow (gom ca
    // Sidebar) - o day chi con la flex-1 binh thuong, chi bo sung py-2 cho
    // thoang tren/duoi.
    <div className="flex min-h-0 min-w-0 flex-1 gap-6 overflow-hidden ">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {/* <TrendingPulseStrip /> */}
        <div className="z-99 backdrop-blur-lg border-primary border border-b-0 rounded-t-lg bg-[rgba(13,19,28,0.7)] min-w-200 min-h-10 justify-between flex items-center gap-3 px-3 py-3  fixed bottom-0 left-1/2 -translate-x-1/2">
          <div className="flex-1 px-2 bg-white/10  h-full rounded-lg">
            <button className="size-8 flex items-center justify-center rounded-lg hover:bg-gray-100/5">
              <MoonIcon className="size-4" />
            </button>
          </div>
          <button
            type="button"
            className="flex min-w-20 h-8 shrink-0 cursor-pointer  justify-center items-center rounded-md bg-button-primary-bg px-3.5 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-button-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Đăng bài
            <Plus size={16} strokeWidth={3} className="ml-1" />
          </button>
          <div className=" px-2 bg-white/10  h-full rounded-lg">
            <button className="size-8 flex items-center justify-center rounded-lg hover:bg-gray-100/5">
              <MoonIcon className="size-4" />
            </button>
          </div>
        </div>
        <PostComposer />
        <div className="mt-4 flex-1 rounded-xl border border-border bg-gray-700/5 px-6">
          <div className=" -mx-6 flex shrink-0 items-center gap-7 border-b border-border  px-6">
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

      <HomeRightPanel />
    </div>
  );
};

export default HomeLayoutShell;
