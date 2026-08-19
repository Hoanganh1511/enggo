"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { ApiDocumentSummary, ApiKnowledgeGroup } from "@/lib/api/types";
import { KnowledgeGroupCatalog } from "./KnowledgeGroupCatalog";
import { GroupSectionRouter } from "./GroupSectionRouter";
import { useWorkspaceShell } from "./workspace-shell-context";

// Doi nhom (key doi theo group.id) -> AnimatePresence cho noi dung cu thu nho
// + mo dan noi dung moi phinh to - CHI chay 1 LAN khi group.id THAT SU doi,
// khong con tach rieng key loading/ready nhu truoc (gay remount thua + cam
// giac cho ca cum roi hien 1 luc).
const stageVariants = {
  initial: { opacity: 0, scale: 0.4 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 22 },
  },
  exit: {
    opacity: 0,
    scale: 0.4,
    transition: { duration: 0.18, ease: "easeIn" },
  },
} as const;

export function WorkspaceMain({
  group,
  docs,
  loading,
  panelsReady,
  username,
}: {
  group: ApiKnowledgeGroup | null;
  docs: ApiDocumentSummary[];
  loading: boolean;
  panelsReady: boolean;
  username: string;
}) {
  const { workspace, clearSelectedGroup } = useWorkspaceShell();

  return (
    <main
      className="shadow-panel flex min-w-0 flex-1 flex-col overflow-hidden rounded-[13px] backdrop-blur-md"
      style={{
        border: "1px solid var(--border)",
        background: "color-mix(in srgb, var(--surface) 82%, transparent)",
      }}
    >
      {/* Breadcrumb CO DINH, hien o CA 2 trang thai (catalog/nhom da chon) -
          nguoi dung phan anh dung o man chi tiet 1 nhom khong biet bam dau de
          quay lai man chon workspace. Bam ten workspace khi dang o trong 1
          nhom gio DIEU HUONG that ve /workspace/[username]/[workspaceId]
          (danh muc, group/[groupId]/page.tsx da co URL rieng) - clearSelectedGroup
          chi la don dep state ngay lap tuc, tranh 1 nhip cho route moi mount
          xong moi tu dong bo (xem WorkspaceBrowseView.tsx). */}
      <div
        className="flex shrink-0 items-center gap-1.5 px-6 pt-4 pb-1 text-[12px]"
        style={{ color: "var(--ink-faint)" }}
      >
        <Link
          href={`/workspace/${username}`}
          className="flex items-center gap-1 transition-colors duration-150 ease-out hover:text-ink"
        >
          <ArrowLeft size={12} strokeWidth={2.2} />
          Tất cả workspace
        </Link>
        <span>/</span>
        {group ? (
          <Link
            href={`/workspace/${username}/${workspace.id}`}
            onClick={clearSelectedGroup}
            className="truncate transition-colors duration-150 ease-out hover:text-ink"
            style={{ color: "var(--ink-muted)" }}
          >
            {workspace.name}
          </Link>
        ) : (
          <span
            className="truncate font-semibold"
            style={{ color: "var(--ink)" }}
          >
            {workspace.name}
          </span>
        )}
        {group && (
          <>
            <span>/</span>
            <span
              className="truncate font-semibold"
              style={{ color: "var(--ink)" }}
            >
              {group.name}
            </span>
          </>
        )}
      </div>

      <div className="relative min-h-0 flex-1">
        <AnimatePresence mode="wait">
          {!group ? (
            <motion.div
              key="catalog"
              variants={stageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 overflow-y-auto"
            >
              <KnowledgeGroupCatalog />
            </motion.div>
          ) : !panelsReady ? null : (
            <motion.div
              key={`${group.id}-ready`}
              variants={stageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 overflow-hidden"
            >
              <GroupSectionRouter group={group} docs={docs} loading={loading} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
