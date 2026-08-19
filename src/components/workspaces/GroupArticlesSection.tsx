"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Layers, ListChecks, LoaderCircle, Plus, Search, X } from "lucide-react";
import type { ApiDocumentSummary, ApiKnowledgeGroup } from "@/lib/api/types";
import { ArticleCard } from "./ArticleCard";
import { CreateSeriesModal } from "./CreateSeriesModal";
import { PostEditorModal } from "./PostEditorModal";
import { useWorkspaceShell } from "./workspace-shell-context";

type SortOption = "latest" | "oldest" | "popular";

const CTA_GRADIENT = "linear-gradient(to right, #20c5d8, #269ce9, #326eea)";

// "Trang" Bai viet - danh sach bai viet CUA 1 NHOM, chuyen nguyen ven tu
// GroupArticleToc.tsx (panel trai cu, da xoa) sang day theo yeu cau refactor
// sidebar: sidebar gio chi con dieu huong, danh sach bai viet that (search/
// sort/loc theo series/chon nhieu de gop series) co "trang" rieng, nhieu cho
// hon thay vi nhoi trong 1 panel 260px. Logic KHONG doi, chi doi noi o.
export function GroupArticlesSection({
  group,
  docs,
  loading,
}: {
  group: ApiKnowledgeGroup;
  docs: ApiDocumentSummary[];
  loading: boolean;
}) {
  const { username, workspace, refreshGroupDocs } = useWorkspaceShell();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("latest");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [createSeriesOpen, setCreateSeriesOpen] = useState(false);
  const [activeSeriesId, setActiveSeriesId] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);

  // Trang doc bai viet la /workspace/[username]/[workspaceId]/[slug] - segment
  // cuoi URL la slug bai dang doc, dung de highlight dung hang trong list.
  const activeSlug = pathname.split("/").pop();
  const activeDocId = docs.find((d) => d.slug === activeSlug)?.id;

  const publishOrder = useMemo(() => {
    const sorted = [...docs].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return new Map(sorted.map((d, i) => [d.id, i]));
  }, [docs]);

  const seriesList = useMemo(() => {
    const seen = new Map<string, string>();
    for (const d of docs) {
      if (d.series && !seen.has(d.series.id)) seen.set(d.series.id, d.series.name);
    }
    return [...seen.entries()].map(([id, name]) => ({ id, name }));
  }, [docs]);

  const filteredDocs = useMemo(() => {
    const q = search.trim().toLowerCase();
    let filtered = q ? docs.filter((d) => d.title.toLowerCase().includes(q)) : docs;
    if (activeSeriesId) filtered = filtered.filter((d) => d.series?.id === activeSeriesId);
    const sorted = [...filtered];
    if (sort === "latest") {
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else if (sort === "oldest") {
      sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    } else {
      sorted.sort((a, b) => b.viewCount - a.viewCount);
    }
    return sorted;
  }, [docs, search, sort, activeSeriesId]);

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 px-6 pt-5 pb-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-[17px] font-bold" style={{ color: "var(--ink)" }}>
            Bài viết trong nhóm
          </h1>
          <div className="flex items-center gap-2">
            {group.viewerCanWrite && (
              <button
                type="button"
                onClick={() => {
                  setSelectMode((v) => !v);
                  setSelectedIds(new Set());
                }}
                title="Chọn nhiều bài viết để gộp thành 1 nhóm cùng chủ đề"
                className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-[9px] px-3 text-[12px] font-medium transition-colors duration-150 ease-out"
                style={
                  selectMode
                    ? { background: "var(--community-accent)", color: "#fff" }
                    : {
                        background: "var(--surface-muted)",
                        border: "1px solid var(--border)",
                        color: "var(--ink-muted)",
                      }
                }
              >
                {selectMode ? <X size={13} strokeWidth={2} /> : <ListChecks size={13} strokeWidth={1.9} />}
                {selectMode ? "Huỷ" : "Chọn"}
              </button>
            )}
            {group.viewerCanWrite && (
              <button
                type="button"
                onClick={() => setComposerOpen(true)}
                className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-[9px] px-3.5 text-[12px] font-semibold text-white transition-opacity duration-150 ease-out hover:opacity-90"
                style={{ background: CTA_GRADIENT }}
              >
                <Plus size={14} strokeWidth={2.25} />
                Thêm bài viết
              </button>
            )}
          </div>
        </div>

        {seriesList.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setActiveSeriesId(null)}
              className="cursor-pointer rounded-[9px] px-2.5 py-1 text-[11px] font-medium transition-colors duration-150 ease-out"
              style={
                activeSeriesId === null
                  ? { background: "var(--active-bg)", color: "var(--primary)" }
                  : {
                      background: "var(--surface-muted)",
                      border: "1px solid var(--border)",
                      color: "var(--ink-muted)",
                    }
              }
            >
              Tất cả
            </button>
            {seriesList.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSeriesId(s.id)}
                title={s.name}
                className="max-w-56 cursor-pointer truncate rounded-[9px] px-2.5 py-1 text-[11px] font-medium transition-colors duration-150 ease-out"
                style={
                  activeSeriesId === s.id
                    ? { background: "var(--active-bg)", color: "var(--primary)" }
                    : {
                        background: "var(--surface-muted)",
                        border: "1px solid var(--border)",
                        color: "var(--ink-muted)",
                      }
                }
              >
                {s.name}
              </button>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center gap-2">
          <div
            className="flex h-9 flex-1 items-center gap-1.5 rounded-[9px] px-3"
            style={{ background: "var(--surface-muted)", border: "1px solid var(--border)" }}
          >
            <Search size={13} strokeWidth={1.9} style={{ color: "var(--ink-faint)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm bài viết trong nhóm..."
              className="min-w-0 flex-1 bg-transparent text-[12px] outline-none"
              style={{ color: "var(--ink)" }}
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="h-9 shrink-0 rounded-[9px] px-2.5 text-[12px]"
            style={{ background: "var(--surface-muted)", border: "1px solid var(--border)", color: "var(--ink-muted)" }}
          >
            <option value="latest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="popular">Phổ biến</option>
          </select>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
        {loading ? (
          <div className="flex flex-col items-center gap-2 py-10">
            <LoaderCircle size={18} strokeWidth={1.9} className="animate-spin" style={{ color: "var(--ink-faint)" }} />
            <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
              Đang tải bài viết...
            </p>
          </div>
        ) : docs.length === 0 ? (
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
              onClick={() => {
                setSearch("");
                setActiveSeriesId(null);
              }}
              className="cursor-pointer text-[11px] font-medium"
              style={{ color: "var(--primary)" }}
            >
              Xoá bộ lọc
            </button>
          </div>
        ) : selectMode ? (
          filteredDocs.map((d) => (
            <ArticleCard
              key={d.id}
              doc={d}
              index={publishOrder.get(d.id) ?? 0}
              username={username}
              workspaceId={workspace.id}
              selectable
              selected={selectedIds.has(d.id)}
              onToggleSelect={() => toggleSelected(d.id)}
            />
          ))
        ) : (
          filteredDocs.map((d) => (
            <ArticleCard
              key={d.id}
              doc={d}
              index={publishOrder.get(d.id) ?? 0}
              username={username}
              workspaceId={workspace.id}
              active={d.id === activeDocId}
            />
          ))
        )}
      </div>

      {/* Thanh hanh dong noi khi dang chon >=2 bai - gop thanh 1 series moi. */}
      <AnimatePresence>
        {selectMode && selectedIds.size >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="mx-6 mb-4 flex shrink-0 items-center justify-between gap-3 rounded-[9px] px-3.5 py-2.5 shadow-panel"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: "var(--ink-muted)" }}>
              <Layers size={13} strokeWidth={1.9} />
              Đã chọn {selectedIds.size} bài viết
            </span>
            <button
              type="button"
              onClick={() => setCreateSeriesOpen(true)}
              className="cursor-pointer rounded-full px-3.5 py-1.5 text-[11px] font-semibold text-white transition-opacity duration-150 ease-out"
              style={{ background: "var(--community-accent)" }}
            >
              Gộp thành 1 nhóm
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <CreateSeriesModal
        open={createSeriesOpen}
        onOpenChange={setCreateSeriesOpen}
        groupId={group.id}
        documentIds={[...selectedIds]}
        onCreated={() => {
          refreshGroupDocs();
          setSelectMode(false);
          setSelectedIds(new Set());
        }}
      />

      <PostEditorModal
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        groupId={group.id}
      />
    </div>
  );
}
