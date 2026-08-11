"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Link2, Paperclip, ChevronRight, X } from "lucide-react";

const DRAWER_TABS = [
  { key: "docs", label: "Tài liệu", icon: FileText },
  { key: "link", label: "Link", icon: Link2 },
  { key: "files", label: "Tệp đính kèm", icon: Paperclip },
] as const;

type DrawerTabKey = (typeof DRAWER_TABS)[number]["key"];

// Truoc day la tab "Tài liệu/Link/Tệp đính kèm" nam ngang dau main chat
// (CommunityChatView.tsx), GIO chuyen thanh 1 box o right panel: bam vao 1
// muc se MO DRAWER truot tu phai (thay vi doi noi dung inline trong main
// chat nhu truoc) - ca 3 muc CHUA co du lieu rieng tung kenh nen drawer chi
// hien placeholder "sap ra mat".
export function CommunityChannelDrawer() {
  const [activeTab, setActiveTab] = useState<DrawerTabKey | null>(null);
  const active = DRAWER_TABS.find((t) => t.key === activeTab);

  return (
    <>
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <p className="mb-3 text-sm font-bold text-ink">Nội dung khác</p>
        <div className="flex flex-col gap-0.5">
          {DRAWER_TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
            >
              <Icon size={16} strokeWidth={2} className="shrink-0 text-ink-muted" />
              <span className="flex-1">{label}</span>
              <ChevronRight size={14} strokeWidth={2} className="shrink-0 text-ink-faint" />
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <>
            <motion.div
              key="drawer-backdrop"
              className="fixed inset-0 z-40 bg-ink/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onClick={() => setActiveTab(null)}
            />
            <motion.div
              key="drawer-panel"
              className="fixed top-0 right-0 z-50 flex h-full w-80 flex-col bg-surface shadow-xl sm:w-96"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between border-b border-border p-4">
                <p className="flex items-center gap-2 text-base font-bold text-ink">
                  <active.icon size={18} strokeWidth={2.25} className="text-community-accent" />
                  {active.label}
                </p>
                <button
                  type="button"
                  aria-label="Đóng"
                  onClick={() => setActiveTab(null)}
                  className="flex size-8 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg hover:text-ink"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>
              <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-ink-faint">
                Nội dung {active.label.toLowerCase()} sẽ sớm ra mắt.
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
