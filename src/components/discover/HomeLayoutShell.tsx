"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import PostComposer from "./PostComposer";
import HomeRightPanel from "./HomeRightPanel";
import TrendingPulseStrip from "./TrendingPulseStrip";
import {
  MoonIcon,
  Plus,
  FileText,
  Trophy,
  BarChart3,
  Code2,
  Star,
  CalendarDays,
} from "lucide-react";
import { ensureFeedLoaded } from "@/lib/discover/feed-store";

// Mau accent rieng cho tab "Sự kiện" - dung chung mau da dinh nghia cho kind
// "event" trong post-kind-meta.ts (POST_KIND_META.event.accent) de nhat
// quan, khong bia mau moi. Cac tab con lai KHONG co iconColor rieng - icon tu
// nhan mau theo trang thai active/inactive cua ca tab (xem className Link).
const EVENT_ACCENT = "#ec4899";

const TABS: {
  href: string;
  label: string;
  icon: typeof FileText;
  iconColor?: string;
}[] = [
  { href: "/home", label: "Bài đăng", icon: FileText },
  { href: "/home/achievements", label: "Thành tích mới", icon: Trophy },
  { href: "/home/progress", label: "Tiến độ", icon: BarChart3 },
  { href: "/home/for-it", label: "For IT", icon: Code2 },
  { href: "/home/vote", label: "Vote", icon: Star },
  {
    href: "/home/events",
    label: "Sự kiện",
    icon: CalendarDays,
    iconColor: EVENT_ACCENT,
  },
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
  const router = useRouter();
  // Cac trang tab render tuc thi (client, doc tu feed-store) nen loading.tsx
  // khong bao gio hien - khong co gi de suspend. Nhung React transition van
  // ton 1 nhip, va trong nhip do bam vao tab KHONG CO PHAN HOI GI. Nen tu lo:
  // to sang tab vua bam NGAY LAP TUC (optimistic) thay vi cho pathname doi,
  // kem spinner + lam mo noi dung cu trong luc cho.
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Fetch feed That 1 LAN duy nhat cho ca 5 tab - dat o layout dung chung
  // (khong phai tung page.tsx) vi cac tab la sibling doc chung 1 feed-store,
  // fetch lai o tung page se goi API thua moi lan chuyen tab. ensureFeedLoaded
  // tu no-op neu da loading/loaded (xem feed-store.ts).
  useEffect(() => {
    void ensureFeedLoaded();
  }, []);

  // Khong can useEffect de don pendingHref: transition xong -> isPending false
  // -> tu dong roi ve pathname (luc nay da la route moi).
  const activeHref = isPending && pendingHref ? pendingHref : pathname;

  const handleTabClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    // Giu nguyen <Link> de middle-click/mo tab moi van chay; chi chan click
    // thuong de tu dieu huong kem trang thai cho.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (pathname === href) return;
    setPendingHref(href);
    startTransition(() => router.push(href));
  };

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
        {/* <PostComposer /> */}
        <div className=" flex-1 rounded-xl">
          {/* Nen trang + vien + shadow GIONG PostCard variant="card" (xem
              PostCard.tsx) - dung chinh gia tri shadow do de dong bo "the
              trang" trong toan app, khong tu bia bo gia tri rieng o day. */}
          <div className="mb-4 flex shrink-0 items-center gap-1 rounded-lg border border-border bg-surface px-2 py-1.5 shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.1)]">
            {TABS.map((tab) => {
              const active = activeHref === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={(e) => handleTabClick(e, tab.href)}
                  className={`relative flex h-9 shrink-0 items-center gap-1.5 rounded-md px-3.5 text-sm transition-colors duration-150 ease-out ${
                    active
                      ? "font-semibold text-primary"
                      : "font-medium text-ink-muted hover:bg-hover-bg hover:text-ink"
                  }`}
                >
                  <tab.icon
                    size={15}
                    strokeWidth={active ? 2.25 : 1.75}
                    style={tab.iconColor ? { color: tab.iconColor } : undefined}
                  />
                  {tab.label}
                  {active && (
                    <span className="absolute inset-x-3.5 bottom-0 h-0.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </div>
          {/* Noi dung rieng cua tung tab. Lam mo trong luc chuyen tab de
              nguoi dung thay ro "danh sach cu sap bi thay", thay vi man hinh
              dung im roi nhay coc sang noi dung moi.
              Tab "Bài đăng" dung MasonryFeed (1 luong, kieu Pinterest); 4 tab
              con lai van dung FeedColumns (2 cot theo nghia). */}
          <div
            className={`transition-opacity duration-150 ease-out ${
              isPending ? "pointer-events-none opacity-50" : "opacity-100"
            }`}
          >
            {children}
          </div>
        </div>
      </div>

      {/* <HomeRightPanel /> */}
    </div>
  );
};

export default HomeLayoutShell;
