"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";

// Banner co dinh day man hinh, dismiss duoc - moi bam vao Cong dong kien
// thuc that (/communities) da co san, khong bia route moi. Dong cho phien
// xem trang hien tai (khong luu localStorage - khong yeu cau phai nho lau
// dai).
export function WorkspaceDiscoverBanner() {
  const [dismissed, setDismissed] = useState(false);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16, transition: { duration: 0.15 } }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="shadow-panel fixed bottom-4 left-1/2 z-30 flex w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 items-center gap-3 rounded-2xl px-4 py-3"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full"
            style={{
              background: "color-mix(in srgb, var(--primary) 12%, transparent)",
              color: "var(--primary)",
            }}
          >
            <Sparkles size={16} strokeWidth={2} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>
              Khám phá thêm workspace
            </p>
            <p className="truncate text-[11px]" style={{ color: "var(--ink-faint)" }}>
              Tìm kiếm và tham gia vào những cộng đồng kiến thức phù hợp với bạn.
            </p>
          </div>

          <Link
            href="/communities"
            className="flex shrink-0 items-center gap-1 rounded-full px-3.5 py-1.5 text-[12px] font-semibold whitespace-nowrap text-white transition-opacity duration-150 ease-out hover:opacity-90"
            style={{ background: "var(--primary)" }}
          >
            Khám phá ngay →
          </Link>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Đóng"
            className="flex shrink-0 cursor-pointer items-center justify-center rounded-full p-1 transition-colors duration-150 ease-out hover:bg-surface-muted"
            style={{ color: "var(--ink-faint)" }}
          >
            <X size={14} strokeWidth={2} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
