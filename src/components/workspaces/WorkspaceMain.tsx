"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, LoaderCircle, Sparkles } from "lucide-react";
import type { ApiDocumentSummary, ApiKnowledgeGroup } from "@/lib/api/types";
import { KnowledgeGroupCatalog } from "./KnowledgeGroupCatalog";
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

// Trung tam khi da chon 1 nhom KHONG con hien danh sach bai viet nua (danh
// sach + tim kiem/sap xep/gop series da CHUYEN het sang GroupArticleToc.tsx,
// theo yeu cau) - o day chi con trang thai TAM THOI truoc khi
// WorkspaceBrowseView.tsx tu dong dieu huong thang toi bai viet moi nhat
// (xem effect o do). Nhom chua co bai viet nao thi dung lai o day (khong co
// gi de dieu huong toi).
function GroupCenterStatus({
  docs,
  loading,
}: {
  docs: ApiDocumentSummary[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <LoaderCircle
          size={22}
          strokeWidth={1.9}
          className="animate-spin"
          style={{ color: "var(--ink-faint)" }}
        />
        <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
          Đang tải bài viết...
        </p>
      </div>
    );
  }
  if (docs.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <Sparkles
          size={22}
          strokeWidth={1.5}
          style={{ color: "var(--ink-faint)" }}
        />
        <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
          Nhóm này chưa có bài viết nào.
        </p>
      </div>
    );
  }
  // Co bai viet -> WorkspaceBrowseView dang dieu huong toi bai moi nhat,
  // chi la 1 nhip cho ngan.
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <LoaderCircle
        size={22}
        strokeWidth={1.9}
        className="animate-spin"
        style={{ color: "var(--ink-faint)" }}
      />
      <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
        Đang mở bài viết mới nhất...
      </p>
    </div>
  );
}

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
          nhom se goi clearSelectedGroup (ve catalog), khong can dieu huong
          that qua URL. */}
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
          <button
            type="button"
            onClick={clearSelectedGroup}
            className="cursor-pointer truncate transition-colors duration-150 ease-out hover:text-ink"
            style={{ color: "var(--ink-muted)" }}
          >
            {workspace.name}
          </button>
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
              className="absolute inset-0"
            >
              <GroupCenterStatus docs={docs} loading={loading} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
