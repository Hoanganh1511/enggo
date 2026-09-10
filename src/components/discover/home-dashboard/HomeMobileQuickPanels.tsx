"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Compass, Flame, SquarePen, X } from "lucide-react";

type PanelKey = "roadmap" | "progress";

// <1024px: "My Learning Roadmap" va "Tiến độ tuần này" (HomeRoadmapCard/
// HomeWeeklyProgressCard, an inline qua class `hidden lg:block` o
// home/page.tsx) thu gon thanh 2 nut tron fixed goc duoi-phai, bam mo
// drawer truot tu TRAI (dung chung animation voi drawer sidebar mobile,
// xem HomeDashboardSidebar.tsx) - noi dung ben trong la chinh Server
// Component da render san, truyen qua children/props (khong can fetch lai).
// Nut "Viết bài" (icon-only) dat TREN CUNG cum nay - thay cho pill chu
// "Viết bài" trong header, gio an tren mobile (xem TopHeaderBar.tsx) vi la
// hanh dong chinh, can noi bat nhat trong cum.
export function HomeMobileQuickPanels({
  roadmap,
  weeklyProgress,
}: {
  roadmap: ReactNode;
  weeklyProgress: ReactNode;
}) {
  const [open, setOpen] = useState<PanelKey | null>(null);

  return (
    <>
      <div className="fixed right-4 bottom-4 z-30 flex flex-col gap-2.5 lg:hidden">
        <Link
          href="/compose"
          aria-label="Viết bài"
          className="flex size-12 cursor-pointer items-center justify-center rounded-full bg-black/90 text-white shadow-lg hover:opacity-90"
        >
          <SquarePen size={19} aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={() => setOpen("roadmap")}
          aria-label="Xem lộ trình học"
          className="flex size-12 cursor-pointer items-center justify-center rounded-full bg-white text-blue-600 shadow-lg ring-1 ring-[#edf0f4] hover:bg-slate-50"
        >
          <Compass size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setOpen("progress")}
          aria-label="Xem tiến độ tuần này"
          className="flex size-12 cursor-pointer items-center justify-center rounded-full bg-white text-orange-500 shadow-lg ring-1 ring-[#edf0f4] hover:bg-slate-50"
        >
          <Flame size={20} aria-hidden="true" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="quick-panel-backdrop"
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onClick={() => setOpen(null)}
            />
            <motion.div
              key="quick-panel-drawer"
              className="fixed inset-y-0 left-0 z-50 w-[min(22rem,85vw)] overflow-y-auto bg-white px-5 py-6 shadow-xl lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label="Đóng"
                className="absolute top-4 right-4 flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} aria-hidden="true" />
              </button>
              <div className="mt-10">{open === "roadmap" ? roadmap : weeklyProgress}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
