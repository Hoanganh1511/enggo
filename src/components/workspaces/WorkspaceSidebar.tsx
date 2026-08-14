"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowLeft, ChevronLeft, Folder, Globe, Lock, Menu } from "lucide-react";
import type { ApiKnowledgeGroup } from "@/lib/api/types";
import { colorOf } from "./node-color";
import { CreateGroupButton } from "./CreateGroupButton";
import { PANEL_SPRING } from "./motion";

// Gradient dung chung cho nut CTA/hanh dong noi bat trong khu vuc Workspace
// (xem docs/workspace-style-guide.md muc 8) - bang mau co dinh, khong doi
// theo theme, cung nhom voi WorkspaceButton.tsx.
const CTA_GRADIENT =
  "linear-gradient(to right, #20c5d8, #269ce9, #326eea)";

// Sidebar trai (danh sach Knowledge Group) truot vao tu ngoai le man hinh -
// dung CHUNG 1 spring voi ArticleDetailPanel (PANEL_SPRING) de 2 ben "ha
// canh" dong toc do, chi doi chieu x.
const sidebarVariants: Variants = {
  hidden: { x: -260, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: PANEL_SPRING,
  },
};

// Tung nhom kien thuc trong sidebar "tha rem" xuong theo thu tu (stagger
// theo index). Mau sac tung item da khac nhau qua colorOf(g.id) nen hieu ung
// tha lan luot tu nhien tao cam giac "rem cau vong". KHONG dung filter:blur()
// - filter khong duoc GPU composite re nhu transform/opacity, browser phai
// repaint tung frame; voi nhieu item tha stagger cung luc day la 1 nguyen
// nhan giat khi mount.
const groupItemVariants: Variants = {
  hidden: { opacity: 0, y: -18, scale: 0.92 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 380,
      damping: 24,
      delay: 0.12 + index * 0.06,
    },
  }),
};

// React.memo: WorkspaceDetail re-render rat thuong xuyen vi nhung ly do
// KHONG lien quan gi toi danh sach nhom (chon doc, doi tab panel phai...).
// Tach rieng + memo de item CHI re-render khi group/index/active/onSelect
// that su doi (onSelect on dinh nho selectGroup da boc useCallback).
const KnowledgeBranchItem = memo(function KnowledgeBranchItem({
  group,
  index,
  active,
  onSelect,
}: {
  group: ApiKnowledgeGroup;
  index: number;
  active: boolean;
  onSelect: (g: ApiKnowledgeGroup) => void;
}) {
  return (
    <motion.button
      custom={index}
      variants={groupItemVariants}
      initial="hidden"
      animate="visible"
      type="button"
      onClick={() => onSelect(group)}
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.985 }}
      className={`flex items-center gap-2.5 rounded-[11px] p-2.5 text-left transition-colors duration-150 ease-out${active ? " group-item-plasma" : ""}`}
      style={
        active
          ? {
              background:
                "linear-gradient(100deg, var(--active-bg-strong), var(--surface))",
              border: "1px solid var(--active-border)",
              boxShadow: "inset 2px 0 var(--primary)",
            }
          : { border: "1px solid transparent" }
      }
    >
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-[9px]"
        style={{
          color: colorOf(group.id),
          background: `color-mix(in srgb, ${colorOf(group.id)} 12%, transparent)`,
        }}
      >
        <Folder size={15} strokeWidth={1.9} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className="block truncate text-[11px] font-semibold"
          style={{ color: "var(--ink)" }}
        >
          {group.name}
        </span>
        <span
          className="mt-0.5 flex items-center gap-1 text-[9px]"
          style={{ color: "var(--ink-faint)" }}
        >
          {group.visibility === "PRIVATE" ? (
            <Lock size={9} />
          ) : (
            <Globe size={9} />
          )}
          {group.postCount} bài viết
        </span>
      </span>
      {group.pendingRequests.length > 0 && (
        <span
          className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
          style={{
            background: "var(--primary)",
            color: "var(--on-primary)",
          }}
        >
          {group.pendingRequests.length}
        </span>
      )}
    </motion.button>
  );
});

export function WorkspaceSidebar({
  workspaceName,
  groups,
  selectedGroupId,
  onSelectGroup,
  isSelf,
  workspaceId,
  username,
  onGroupCreated,
}: {
  workspaceName: string;
  groups: ApiKnowledgeGroup[];
  selectedGroupId: string | null;
  onSelectGroup: (g: ApiKnowledgeGroup) => void;
  isSelf: boolean;
  workspaceId: string;
  username: string;
  onGroupCreated: (group: ApiKnowledgeGroup) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleButton = (
    <motion.button
      type="button"
      onClick={() => setCollapsed((v) => !v)}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 420, damping: 20 }}
      className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-white"
      style={{
        background: CTA_GRADIENT,
        border: "1px solid rgba(255,255,255,0.3)",
        boxShadow: "0 7px 18px rgba(40,125,235,0.24)",
      }}
      title={collapsed ? "Mở sidebar" : "Đóng sidebar"}
      aria-label={collapsed ? "Mở sidebar" : "Đóng sidebar"}
    >
      {collapsed ? (
        <Menu size={14} strokeWidth={2.2} />
      ) : (
        <ChevronLeft size={14} strokeWidth={2.2} />
      )}
    </motion.button>
  );

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="flex shrink-0 flex-col overflow-hidden"
      style={{
        borderRight: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      {/* width tween rieng, tach khoi "variants" cua chinh motion.aside nay
          (dang dung cho hieu ung truot vao luc mount) - dong ve 1 dai hep
          (56px, du cho nut toggle) thay vi 0 de nut van luon bam duoc de mo
          lai, khong bi mat dang cung sidebar. */}
      <motion.div
        animate={{ width: collapsed ? 56 : 250 }}
        transition={PANEL_SPRING}
        className="flex h-full min-h-0 flex-col"
      >
        <div
          className="flex shrink-0 items-start gap-2 px-3 py-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          {collapsed ? (
            toggleButton
          ) : (
            <div className="min-w-0 flex-1">
              <Link
                href={`/workspace/${username}`}
                className="mb-2 flex h-7 w-fit shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-[11px] font-medium transition-colors duration-150 ease-out hover:text-primary-hover!"
                style={{
                  border: "1px solid var(--border)",
                  color: "var(--ink-muted)",
                  background: "var(--surface)",
                }}
              >
                <ArrowLeft size={13} strokeWidth={1.9} />
                Workspaces
              </Link>
              {/* Nut toggle dat CANH ten workspace theo yeu cau - cung 1
                  hang voi h2, khong con la nut noi troi rieng o mep sidebar. */}
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span
                    className="text-[9px] font-bold tracking-wide"
                    style={{ color: "var(--ink-faint)" }}
                  >
                    WORKSPACE
                  </span>
                  <h2
                    className="mt-0.5 truncate text-sm font-semibold"
                    style={{ color: "var(--ink)" }}
                  >
                    {workspaceName}
                  </h2>
                </div>
                {toggleButton}
              </div>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto p-3">
            {groups.map((g, index) => (
              <KnowledgeBranchItem
                key={g.id}
                group={g}
                index={index}
                active={g.id === selectedGroupId}
                onSelect={onSelectGroup}
              />
            ))}
            {groups.length === 0 && (
              <p
                className="p-3 text-center text-[11px]"
                style={{ color: "var(--ink-faint)" }}
              >
                Chưa có nhóm kiến thức nào.
              </p>
            )}
            {isSelf && (
              <CreateGroupButton
                workspaceId={workspaceId}
                username={username}
                onCreated={onGroupCreated}
              />
            )}
          </div>
        )}
      </motion.div>
    </motion.aside>
  );
}
