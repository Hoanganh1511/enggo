"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Folder, LoaderCircle, Search, Sparkles } from "lucide-react";
import type { ApiDocumentSummary, ApiKnowledgeGroup } from "@/lib/api/types";
import { formatRelativeTime } from "@/lib/format-time";
import { colorOf } from "./node-color";
import { RequestCollabButton } from "./RequestCollabButton";
import { ArticleCard } from "./ArticleCard";

type SortOption = "latest" | "oldest" | "popular";

// Doi nhom (key doi) -> AnimatePresence cho noi dung cu thu nho + mo dan
// roi noi dung moi (ke ca "loading" trong luc cho docs) phinh to kem nay -
// dam giu nguyen tu WorkspaceDetail.tsx cu, khong doi.
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
  workspaceId,
}: {
  group: ApiKnowledgeGroup | null;
  docs: ApiDocumentSummary[];
  loading: boolean;
  panelsReady: boolean;
  username: string;
  workspaceId: string;
}) {
  return (
    <main
      className="relative min-w-0 flex-1 overflow-hidden"
      style={{ background: "var(--surface)" }}
    >
      {/* panelsReady: cho ArticleDetailPanel truot vao xong (hoac khong co
          gi de cho) roi moi hien trang thai/loading. */}
      <AnimatePresence mode="wait">
        {!panelsReady ? null : !group ? (
          <motion.div
            key="empty"
            variants={stageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 flex h-full flex-col items-center justify-center gap-2"
          >
            <Sparkles size={26} strokeWidth={1.5} style={{ color: "var(--ink-faint)" }} />
            <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
              Chọn 1 nhóm kiến thức bên trái.
            </p>
          </motion.div>
        ) : loading ? (
          <motion.div
            key={`${group.id}-loading`}
            variants={stageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 flex h-full flex-col items-center justify-center gap-2"
          >
            <LoaderCircle
              size={22}
              strokeWidth={1.9}
              className="animate-spin"
              style={{ color: "var(--ink-faint)" }}
            />
            <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
              Đang tải...
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={`${group.id}-ready`}
            variants={stageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0"
          >
            {group.viewerCanWrite || group.visibility === "PUBLIC" ? (
              <BranchStage
                group={group}
                docs={docs}
                username={username}
                workspaceId={workspaceId}
              />
            ) : (
              <div className="flex h-full items-center justify-center p-6">
                <RequestCollabButton groupId={group.id} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function BranchStage({
  group,
  docs,
  username,
  workspaceId,
}: {
  group: ApiKnowledgeGroup;
  docs: ApiDocumentSummary[];
  username: string;
  workspaceId: string;
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("latest");

  const filteredDocs = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? docs.filter((d) => d.title.toLowerCase().includes(q))
      : docs;
    const sorted = [...filtered];
    if (sort === "latest") {
      sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } else if (sort === "oldest") {
      sorted.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
    } else {
      sorted.sort((a, b) => b.viewCount - a.viewCount);
    }
    return sorted;
  }, [docs, search, sort]);

  const lastUpdated =
    docs.length > 0
      ? docs.reduce((max, d) => (d.updatedAt > max ? d.updatedAt : max), docs[0].updatedAt)
      : group.updatedAt;

  return (
    <motion.div
      className="flex h-full flex-col"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="shrink-0 px-6 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-[9px]"
            style={{
              color: colorOf(group.id),
              background: `color-mix(in srgb, ${colorOf(group.id)} 12%, transparent)`,
            }}
          >
            <Folder size={15} strokeWidth={1.9} />
          </span>
          <h1 className="text-[15px] font-semibold" style={{ color: "var(--ink)" }}>
            {group.name}
          </h1>
        </div>
        <p className="mt-1 text-[11px]" style={{ color: "var(--ink-faint)" }}>
          {group.postCount} bài viết · Cập nhật gần nhất {formatRelativeTime(lastUpdated)}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <div
            className="flex h-8 flex-1 items-center gap-1.5 rounded-[9px] px-2.5"
            style={{
              background: "var(--surface-muted)",
              border: "1px solid var(--border)",
            }}
          >
            <Search size={13} strokeWidth={1.9} style={{ color: "var(--ink-faint)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm bài viết trong nhánh..."
              className="min-w-0 flex-1 bg-transparent text-[11px] outline-none"
              style={{ color: "var(--ink)" }}
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="h-8 shrink-0 rounded-[9px] px-2 text-[11px]"
            style={{
              background: "var(--surface-muted)",
              border: "1px solid var(--border)",
              color: "var(--ink-muted)",
            }}
          >
            <option value="latest">Mới cập nhật</option>
            <option value="oldest">Cũ nhất</option>
            <option value="popular">Phổ biến</option>
          </select>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
        {docs.length === 0 ? (
          <p className="py-10 text-center text-xs" style={{ color: "var(--ink-faint)" }}>
            Nhóm này chưa có bài viết nào.
          </p>
        ) : filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10">
            <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
              Không tìm thấy bài viết phù hợp.
            </p>
            <button
              type="button"
              onClick={() => setSearch("")}
              className="cursor-pointer text-[11px] font-medium"
              style={{ color: "var(--primary)" }}
            >
              Xoá bộ lọc
            </button>
          </div>
        ) : (
          filteredDocs.map((d, i) => (
            <ArticleCard
              key={d.id}
              doc={d}
              index={i}
              username={username}
              workspaceId={workspaceId}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}
