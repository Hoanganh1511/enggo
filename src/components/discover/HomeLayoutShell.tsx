"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import PostComposer from "./PostComposer";
import HomeRightPanel from "./HomeRightPanel";
import TrendingPulseStrip from "./TrendingPulseStrip";

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
        <PostComposer />
        <div className="mt-6 flex-1 rounded-xl border border-border bg-surface px-6">
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
              cua tung bai nhu truoc, de style thong nhat va gon hon. */}
          <div className="divide-y divide-border">{children}</div>
        </div>
      </div>

      <HomeRightPanel />
    </div>
  );
};

export default HomeLayoutShell;
