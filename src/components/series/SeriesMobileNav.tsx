"use client";

import Link from "next/link";
import { ArrowLeft, ListTree, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { ContentSeriesCategory, ContentSeriesEntrySummary } from "@/lib/api/content-series";
import { SeriesSidebar } from "./SeriesSidebar";
import { useSeriesSidebarDrawerStore } from "@/stores/series-sidebar-drawer-store";

type Props = {
  slug: string;
  seriesTitle: string;
  categories: ContentSeriesCategory[];
  entries: ContentSeriesEntrySummary[];
};

// [2026-09-14] Truoc day <aside> cay category/entry CHI hien tu lg tro len
// (hidden ... lg:block, xem layout.tsx) - duoi lg (dien thoai/tablet dung)
// KHONG co gi thay the: mat luon ca link "Tất cả series" LAN toan bo cay
// dieu huong, chi con Prev/Next o cuoi trang (nguoi dung hoi "responsive het
// tren mobile chua" - day la 1 lo that su, khong phai suy doan). 2 component
// duoi bu lai CHO RIENG mobile (lg:hidden ca 2 phia):
// - SeriesMobileTopBar: 1 thanh ngang LUON hien (thay <aside> bi an), giu lai
//   link back + ten series + gear admin + 1 nut mo drawer cay dieu huong.
// - SeriesSidebarDrawer: bang cay THAT (dung lai SeriesSidebar.tsx) trong 1
//   drawer truot tu trai, cung ky thuat AnimatePresence + backdrop voi
//   DashboardSidebarDrawer.tsx (nav chinh cua app) de dong bo UX 2 loai
//   drawer trong cung 1 app.
export function SeriesMobileTopBar({ seriesTitle }: Omit<Props, "slug" | "categories" | "entries">) {
  const toggle = useSeriesSidebarDrawerStore((s) => s.toggle);

  return (
    <div className="-mx-4 -mt-6 flex items-center justify-between gap-2 border-b border-border bg-[#f5f6f8] px-4 py-3 sm:-mx-6 lg:hidden">
      <Link
        href="/series"
        className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-ink-faint hover:text-ink"
      >
        <ArrowLeft size={13} />
        Tất cả series
      </Link>
      <p className="min-w-0 flex-1 truncate text-center text-[13px] font-semibold text-ink">
        {seriesTitle}
      </p>
      {/* Nut gear "Quản lý series" - DA BO (yeu cau nguoi dung: sua Series
          chuyen han sang trang Quan ly profile, khong con truy cap tu day). */}
      <button
        type="button"
        onClick={toggle}
        aria-label="Mục lục series"
        title="Mục lục series"
        className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg hover:text-ink"
      >
        <ListTree size={16} />
      </button>
    </div>
  );
}

export function SeriesSidebarDrawer({ slug, seriesTitle, categories, entries }: Props) {
  const open = useSeriesSidebarDrawerStore((s) => s.open);
  const setOpen = useSeriesSidebarDrawerStore((s) => s.setOpen);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto bg-[#f5f6f8] p-6 shadow-panel lg:hidden"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="mb-4 flex items-center justify-between gap-2 px-2.5">
              <Link
                href="/series"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-faint hover:text-ink"
              >
                <ArrowLeft size={13} />
                Tất cả series
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng mục lục"
                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg hover:text-ink"
              >
                <X size={15} />
              </button>
            </div>
            <p className="mb-4 truncate px-2.5 text-[13px] font-semibold text-ink">{seriesTitle}</p>
            {/* Link "Quản lý series" - DA BO (cung ly do voi SeriesMobileTopBar
                o tren). */}
            <SeriesSidebar
              basePath={`/series/${slug}`}
              categories={categories}
              entries={entries}
              onNavigate={() => setOpen(false)}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
