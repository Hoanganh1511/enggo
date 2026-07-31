"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import PostComposer from "./PostComposer";
import HomeRightPanel from "./HomeRightPanel";
import TrendingPulseStrip from "./TrendingPulseStrip";
import HomeCategoryBar from "./HomeCategoryBar";
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

// Moi tab 1 mau icon rieng (sang/pastel), CO DINH khong doi theo active -
// dung dung pattern iconColor cua ProfileNav.tsx (xem file do de biet quy
// uoc chon mau).
const TABS: {
  href: string;
  label: string;
  icon: typeof FileText;
  iconColor: string;
}[] = [
  { href: "/home", label: "Bài đăng", icon: FileText, iconColor: "#38bdf8" },
  {
    href: "/home/achievements",
    label: "Thành tích",
    icon: Trophy,
    iconColor: "#fbbf24",
  },
  {
    href: "/home/progress",
    label: "Tiến độ",
    icon: BarChart3,
    iconColor: "#818cf8",
  },
  { href: "/home/for-it", label: "For IT", icon: Code2, iconColor: "#c084fc" },
  { href: "/home/vote", label: "Vote", icon: Star, iconColor: "#fb7185" },
  {
    href: "/home/events",
    label: "Sự kiện",
    icon: CalendarDays,
    iconColor: "#ec4899",
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
  const searchParams = useSearchParams();
  const router = useRouter();
  // Cac trang tab render tuc thi (client, doc tu feed-store) nen loading.tsx
  // khong bao gio hien - khong co gi de suspend. Nhung React transition van
  // ton 1 nhip, va trong nhip do bam vao tab KHONG CO PHAN HOI GI. Nen tu lo:
  // to sang tab vua bam NGAY LAP TUC (optimistic) thay vi cho pathname doi,
  // kem spinner + lam mo noi dung cu trong luc cho.
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  // Rieng cho nut Dong/Noi bat trong HomeCategoryBar - khac pendingHref vi
  // khong doi pathname, chi doi query string "mode" tren trang hien tai.
  const [pendingMode, setPendingMode] = useState<string | null>(null);

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
  // HomeCategoryBar hien o ca /home va cac trang Linh vuc con
  // (/home/category/[slug]) - deu la "che do duyet theo Bai dang".
  const isHomeTab = activeHref === "/home" || activeHref.startsWith("/home/category/");

  const activeMode =
    (isPending && pendingMode !== null ? pendingMode : searchParams.get("mode")) ??
    "activity";

  const handleTabClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    // Giu nguyen <Link> de middle-click/mo tab moi van chay; chi chan click
    // thuong de tu dieu huong kem trang thai cho.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (activeHref === href) return;
    setPendingHref(href);
    startTransition(() => router.push(href));
  };

  // Rieng nut Dong/Noi bat - chi doi query string "mode" tren CUNG pathname
  // hien tai (khong dung pendingHref, tranh lam sai lech activeHref cua
  // TABS/Linh vuc dang dua vao so sanh chuoi thuan pathname).
  const handleModeChange = (mode: string) => {
    setPendingMode(mode);
    const qs = new URLSearchParams(searchParams.toString());
    if (mode === "activity") qs.delete("mode");
    else qs.set("mode", mode);
    const query = qs.toString();
    startTransition(() =>
      router.push(`${pathname}${query ? `?${query}` : ""}`),
    );
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
    <div className="flex min-h-0 min-w-0 flex-1 px-6 gap-6 overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-gutter-stable">
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
          <div className="my-6 grid grid-cols-[3fr_1fr] gap-4 px-35">
            {/* Grid-cols GIU CO DINH (khong doi theo isHomeTab) - doi ngay
                lap tuc se lam layout co lai truoc khi AnimatePresence chay
                xong animation exit (150ms), gay giat/nhay vi tri. Chi noi
                dung o cell dau tien an/hien co animation, khung cot khong
                bao gio xe dich.
                HomeCategoryBar chi hien o "Bai dang" + cac trang Linh vuc con
                (/home/category/[slug]) - cac tab khac (Thanh tich/Tien do/
                For IT/Vote/Su kien) khong co nghia loc theo chuyen muc nay. */}
            <AnimatePresence>
              {isHomeTab && (
                <motion.div
                  key="home-category-bar"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  <HomeCategoryBar
                    mode={activeMode}
                    onModeChange={handleModeChange}
                    activeHref={activeHref}
                    onNavClick={handleTabClick}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid min-w-0 grid-cols-3 gap-1">
              {TABS.map((tab) => {
                const active =
                  activeHref === tab.href ||
                  (tab.href === "/home" && activeHref.startsWith("/home/category/"));
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    onClick={(e) => handleTabClick(e, tab.href)}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs transition-colors duration-150 ease-out ${
                      active
                        ? "bg-active-bg font-semibold text-primary"
                        : "font-medium text-ink-muted hover:bg-hover-bg hover:text-ink"
                    }`}
                  >
                    <tab.icon
                      size={16}
                      strokeWidth={2.25}
                      style={{ color: tab.iconColor }}
                    />
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </div>
          {/* Noi dung rieng cua tung tab. Lam mo trong luc chuyen tab de
              nguoi dung thay ro "danh sach cu sap bi thay", thay vi man hinh
              dung im roi nhay coc sang noi dung moi.
              Tab "Bài đăng" dung MasonryFeed (1 luong, kieu Pinterest); 4 tab
              con lai van dung FeedColumns (2 cot theo nghia). */}
          <div
            className={`px-35 transition-opacity duration-150 ease-out ${
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
