"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DocsMarkdown } from "@/components/docs/DocsMarkdown";
import { SeriesStatsBar } from "./SeriesStatsBar";
import { SeriesInstallWidget } from "./SeriesInstallWidget";
import { SeriesEmailSignup } from "./SeriesEmailSignup";
import type {
  ContentSeriesStat,
  ContentSeriesInstallTab,
  ContentSeriesExternalLink,
} from "@/lib/api/content-series";

// Xem truoc trang /series/[slug] THAT - dung LAI dung cac component da hien
// thi o trang cong khai (SeriesStatsBar/SeriesInstallWidget/SeriesEmailSignup/
// DocsMarkdown) thay vi ve lai UI rieng, dam bao preview KHOP CHINH XAC 100%
// voi cai nguoi doc that su thay (yeu cau nguoi dung: "biết cụ thể điền cái
// này sẽ hiển thị tương ứng ở đâu") - khong co rui ro preview va trang that
// lech nhau vi sua 1 component se tu dong phan anh ca 2 noi.
//
// Khong hien "Tac gia" o day vi trang Overview cong khai HIEN TAI cung KHONG
// render authorName/avatar o dau ca (field nay moi chi luu du lieu, danh cho
// Entry Author Bar tuong lai) - preview trung thuc voi that te, khong bia ra
// 1 khoi khong ton tai tren trang that.
//
// motion/AnimatePresence: cac khoi TUY CHON (Install/Email) fade+cao dan khi
// bat/tat, `layout` tren khung ngoai giup toan bo preview tu gian/co lai
// mem mai thay vi giat cuc khi noi dung doi do dai - "đồng bộ" voi RepeaterField
// ben form (cung dung cung 1 kieu animation nhe).
export function SeriesLivePreview({
  title,
  description,
  stats,
  installTabs,
  externalLinks,
  emailCourseEnabled,
  emailCourseTitle,
  emailCourseDescription,
}: {
  title: string;
  description: string;
  stats: ContentSeriesStat[];
  installTabs: ContentSeriesInstallTab[];
  externalLinks: ContentSeriesExternalLink[];
  emailCourseEnabled: boolean;
  emailCourseTitle: string;
  emailCourseDescription: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-muted/40 p-4">
      <p className="mb-3 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
        Xem trước trang Series
      </p>
      <motion.div layout className="rounded-xl border border-border bg-surface p-6">
        <motion.h1
          layout="position"
          className="font-content text-[24px] font-extrabold tracking-tight text-ink"
        >
          {title.trim() || "Tiêu đề Series..."}
        </motion.h1>
        <motion.div layout className="mt-3">
          <DocsMarkdown markdown={description.trim() || "*Mô tả sẽ hiện ở đây...*"} />
        </motion.div>

        <motion.div layout>
          <SeriesStatsBar stats={stats} externalLinks={externalLinks} />
        </motion.div>

        <AnimatePresence initial={false}>
          {installTabs.length > 0 && (
            <motion.div
              key="install"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mt-8 overflow-hidden"
            >
              <h2 className="font-content mb-3 text-[15px] font-semibold text-ink">Cài đặt</h2>
              <SeriesInstallWidget tabs={installTabs} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {emailCourseEnabled && (
            <motion.div
              key="email"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mt-8 overflow-hidden"
            >
              <SeriesEmailSignup
                title={emailCourseTitle.trim() || "Nhận bài mới qua email"}
                description={emailCourseDescription}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
