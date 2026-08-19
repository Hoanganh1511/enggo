"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  FileText,
  ListChecks,
  ListTree,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { ApiDocument, ApiDocumentSummary, ApiKnowledgeGroup } from "@/lib/api/types";
import type { TocItem } from "./toc";
import { sidebarStagger } from "./article-tab-shared";
import { ArticleOverview } from "./ArticleOverview";
import { ArticleToc } from "./ArticleToc";
import { ArticleResources } from "./ArticleResources";
import { ArticleChecklist } from "./ArticleChecklist";

export type ArticleTabId = "overview" | "outline" | "checklist" | "resources";

const SIDE_TABS: { id: ArticleTabId; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Tổng quan", icon: ShieldCheck },
  { id: "outline", label: "Mục lục", icon: ListTree },
  { id: "checklist", label: "Checklist", icon: ListChecks },
  { id: "resources", label: "Tài liệu", icon: FileText },
];

// Bo tab dung chung Overview/Muc luc/Tai lieu cua 1 bai viet - dung boi CA
// ArticleReaderPane (dang doc toan van, co scroll-spy that) LAN
// ArticleDetailPanel (preview khi dang browse, chua co body hien thi) - khac
// nhau qua props (activeTocId/onNodeClick/primaryAction), KHONG phai 2
// implementation rieng (xem WORKSPACE_UI_SPEC.md muc 7-8).
export function ArticleTabs({
  tab,
  setTab,
  doc,
  siblingDocs,
  group,
  username,
  workspaceId,
  toc,
  activeTocId,
  onChecklistLogPublicChange,
}: {
  tab: ArticleTabId;
  setTab: (t: ArticleTabId) => void;
  doc: ApiDocument | null;
  siblingDocs: ApiDocumentSummary[];
  // Nhom kien thuc chua bai dang doc - dung de hien GroupProgressWidget.tsx
  // (muc tieu chung chi cua CA nhom) trong tab Tong quan.
  group: ApiKnowledgeGroup | null;
  username: string;
  workspaceId: string;
  toc: TocItem[];
  activeTocId: string;
  onChecklistLogPublicChange: (next: boolean) => void;
}) {
  return (
    <>
      <div
        className="flex shrink-0 items-center gap-1 p-2"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--surface-header)",
        }}
      >
        {SIDE_TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className="group relative flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] py-2 text-[11px] font-medium transition-colors duration-150 ease-out"
              style={{ color: active ? "var(--primary)" : "var(--ink-faint)" }}
            >
              {active && (
                <motion.div
                  layoutId="sideTabGlow"
                  className="absolute inset-0 rounded-t-sm"
                  style={{
                    background: "var(--active-bg)",
                    boxShadow:
                      "0 0 14px color-mix(in srgb, var(--primary) 22%, transparent)",
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <Icon size={13} strokeWidth={1.9} className="relative z-10" />
              <span className="relative z-10">{label}</span>
              {active && (
                <motion.div
                  layoutId="sideTabUnderline"
                  className="absolute right-0 -bottom-px left-0 h-0.5 overflow-hidden r"
                  style={{ background: "var(--primary)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                >
                  {/* Shimmer chi chay 1 LAN moi khi tab nay VUA duoc kich hoat
                      (element nay tu mount lai khi active chuyen sang tab
                      khac) - khong phai vong lap trang tri vo han, nen van
                      hop le voi nguyen tac "khong glow/pulse thuan trang
                      tri" trong style guide. */}
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                    className="h-full w-1/2"
                    style={{
                      background: "color-mix(in srgb, white 65%, transparent)",
                    }}
                  />
                </motion.div>
              )}
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            variants={sidebarStagger}
            initial="hidden"
            animate="show"
          >
            {tab === "overview" && (
              <ArticleOverview
                doc={doc}
                siblingDocs={siblingDocs}
                group={group}
                username={username}
                workspaceId={workspaceId}
              />
            )}
            {tab === "outline" && (
              <ArticleToc toc={toc} activeId={activeTocId} />
            )}
            {tab === "checklist" && doc && (
              <div className="p-4">
                <ArticleChecklist
                  documentId={doc.id}
                  isOwner={doc.isOwner}
                  logPublic={doc.checklistLogPublic}
                  onLogPublicChange={onChecklistLogPublicChange}
                />
              </div>
            )}
            {tab === "resources" && <ArticleResources />}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
