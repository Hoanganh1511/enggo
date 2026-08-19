"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  Layers,
  ListChecks,
  LoaderCircle,
  Menu,
  Search,
  X,
} from "lucide-react";
import type { ApiDocumentSummary, ApiKnowledgeGroup } from "@/lib/api/types";
import { SidebarSectionLabel } from "./article-tab-shared";
import { PANEL_SPRING } from "./motion";
import { ArticleCard } from "./ArticleCard";
import { CreateSeriesModal } from "./CreateSeriesModal";
import { GroupIconGlyph } from "./group-icons";
import { EditGroupButton } from "./EditGroupButton";
import { GroupGoalButton } from "./GroupGoalModal";
import { PostEditorModal } from "./PostEditorModal";
import { WorkspaceButton } from "./WorkspaceButton";
import { useWorkspaceShell } from "./workspace-shell-context";

// Gradient dung chung cho nut CTA/hanh dong noi bat trong khu vuc Workspace
// (xem docs/workspace-style-guide.md muc 8).
const CTA_GRADIENT = "linear-gradient(to right, #20c5d8, #269ce9, #326eea)";

const panelVariants = {
  hidden: { x: -260, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: PANEL_SPRING },
};

type SortOption = "latest" | "oldest" | "popular";

// Left panel thay the WorkspaceSidebar.tsx (da xoa) - danh sach nhom chuyen
// sang man tong quan KnowledgeGroupCatalog.tsx, panel nay CHI con lo 1 viec:
// quan ly TOAN BO bai viet cua nhom dang chon. Rong 400px (250 + 150, theo
// yeu cau) - du cho search/sort/chon-nhieu-de-gop-series CHUYEN NGUYEN VEN
// tu day BranchStage cua WorkspaceMain.tsx sang day (khong con trung lap o
// giua nua - trung tam gio LUON dieu huong thang toi bai viet moi nhat, xem
// WorkspaceBrowseView.tsx). Hien khi da chon 1 nhom, tren CA trang browse
// LAN trang doc bai viet (2 route dung chung layout.tsx nay).
export function GroupArticleToc({
  group,
  docs,
  loading,
}: {
  group: ApiKnowledgeGroup;
  docs: ApiDocumentSummary[];
  loading: boolean;
}) {
  const { clearSelectedGroup, username, workspace, refreshGroupDocs, isSelf } =
    useWorkspaceShell();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("latest");
  // Che do "chon nhieu bai de gop thanh 1 nhom cung chu de" - bat len thi
  // render FLAT (bo qua renderItems gop series ben duoi) de chon cho don
  // gian, khong phai xu ly chon-long-trong-1-series-co-san.
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [createSeriesOpen, setCreateSeriesOpen] = useState(false);
  // Tab loc theo series ("nhóm cùng chủ đề") ngay duoi title - null = "Tất
  // cả". Xem seriesList/renderItems ben duoi.
  const [activeSeriesId, setActiveSeriesId] = useState<string | null>(null);
  // Composer "Viết bài mới" - tuong tu nut cung ten trong ArticleDetailPanel.tsx
  // (cot phai), them ban sao o day de luon bam duoc ngay tu panel trai, khong
  // phu thuoc panel phai dang hien gi (ArticleDetailPanel/WorkspaceOverviewPanel).
  const [composerOpen, setComposerOpen] = useState(false);

  // Trang doc bai viet la /workspace/[username]/[workspaceId]/[slug] - segment
  // cuoi URL la slug bai dang doc. Trang browse thi segment cuoi la workspaceId,
  // se khong khop bat ky doc.slug nao (khong hang nao active) - dung y.
  const activeSlug = pathname.split("/").pop();
  const activeDocId = docs.find((d) => d.slug === activeSlug)?.id;

  // So thu tu "#1, #2, #3..." la 1 dinh danh ON DINH theo thoi gian DANG bai
  // (createdAt, bai dang truoc luon giu so nho hon) - tach rieng khoi thu tu
  // HIEN THI cua list (co the doi theo sort/search).
  const publishOrder = useMemo(() => {
    const sorted = [...docs].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );
    return new Map(sorted.map((d, i) => [d.id, i]));
  }, [docs]);

  // Danh sach series ("nhóm cùng chủ đề") xuat hien trong nhom hien tai -
  // dung lam cac tab loc duoi title, giu thu tu xuat hien dau tien trong
  // `docs` (khong sap xep lai rieng).
  const seriesList = useMemo(() => {
    const seen = new Map<string, string>();
    for (const d of docs) {
      if (d.series && !seen.has(d.series.id)) {
        seen.set(d.series.id, d.series.name);
      }
    }
    return [...seen.entries()].map(([id, name]) => ({ id, name }));
  }, [docs]);

  const filteredDocs = useMemo(() => {
    const q = search.trim().toLowerCase();
    let filtered = q
      ? docs.filter((d) => d.title.toLowerCase().includes(q))
      : docs;
    if (activeSeriesId) {
      filtered = filtered.filter((d) => d.series?.id === activeSeriesId);
    }
    const sorted = [...filtered];
    // "latest"/"oldest" theo thoi gian TAO bai (createdAt), khong phai lan
    // sua cuoi (updatedAt) - mac dinh "latest" la thu tu duy nhat dang hien
    // (UI doi sort dang tat), bai moi tao luon len dau.
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
      title={collapsed ? "Mở panel" : "Đóng panel"}
      aria-label={collapsed ? "Mở panel" : "Đóng panel"}
    >
      {collapsed ? (
        <Menu size={14} strokeWidth={2.2} />
      ) : (
        <ChevronLeft size={14} strokeWidth={2.2} />
      )}
    </motion.button>
  );

  const aside = (
    <motion.aside
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      className="shadow-panel flex shrink-0 flex-col overflow-hidden rounded-[13px] backdrop-blur-md"
      style={{
        border: "1px solid var(--border)",
        background: "color-mix(in srgb, var(--surface) 82%, transparent)",
      }}
    >
      <motion.div
        animate={{ width: collapsed ? 56 : 320 }}
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
              <div className="flex items-center justify-between gap-2">
                {/* Link (khong phai button don thuan): khi dang o trang doc
                    bai viet ([slug]/page.tsx), can DIEU HUONG ve trang browse
                    de man tong quan (KnowledgeGroupCatalog.tsx) - von chi
                    render trong page.tsx browse - thuc su hien ra, khong chi
                    doi state chon nhom. */}
                <Link
                  href={`/workspace/${username}/${workspace.id}`}
                  onClick={clearSelectedGroup}
                  className="flex cursor-pointer items-center gap-1 text-[9px] font-bold tracking-wide transition-colors duration-150 ease-out hover:text-ink"
                  style={{ color: "var(--ink-faint)" }}
                >
                  <ArrowLeft size={10} strokeWidth={2.2} />
                  TẤT CẢ NHÓM
                </Link>
                {toggleButton}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5">
                <GroupIconGlyph
                  name={group.icon}
                  size={13}
                  strokeWidth={2}
                  className="shrink-0 text-ink-muted"
                />
                <h2
                  className="min-w-0 flex-1 truncate text-sm font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  {group.name}
                </h2>
                {/* key={group.id}: buoc remount khi CHUYEN nhom - GroupArticleToc
                    KHONG remount khi doi group (cung 1 vi tri trong cay, xem
                    WorkspaceShell.tsx), nhung editor Tiptap ben trong
                    GroupGoalButton chi doc `content` MOT LAN luc tao, se giu
                    noi dung nhom CU neu khong ep remount o day. */}
                <GroupGoalButton key={group.id} group={group} />
                {/* Sua ten/mo ta/quyen xem - CHI chu workspace (isSelf) moi
                    duoc, backend gate bang assertGroupOwner (chat hon
                    viewerCanWrite ma collaborator APPROVED cung co). */}
                {isSelf && <EditGroupButton group={group} />}
              </div>

              {group.viewerCanWrite && (
                <WorkspaceButton
                  onClick={() => setComposerOpen(true)}
                  size="sm"
                  className="mt-2.5 w-full justify-center"
                >
                  Thêm bài viết mới
                </WorkspaceButton>
              )}
            </div>
          )}
        </div>

        {!collapsed && (
          <>
            <div className="shrink-0 px-4 pt-3 pb-2">
              <SidebarSectionLabel>BÀI VIẾT TRONG NHÓM</SidebarSectionLabel>
              {seriesList.length > 0 && (
                <div className="-mx-0.5 flex flex-wrap gap-1.5 px-0.5">
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
                      className="max-w-36 cursor-pointer truncate rounded-[9px] px-2.5 py-1 text-[11px] font-medium transition-colors duration-150 ease-out"
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
              {/* <div
                className="flex h-8 items-center gap-1.5 rounded-[9px] px-2.5"
                style={{
                  background: "var(--surface-muted)",
                  border: "1px solid var(--border)",
                }}
              >
                <Search
                  size={12}
                  strokeWidth={1.9}
                  style={{ color: "var(--ink-faint)" }}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm bài viết trong nhóm..."
                  className="min-w-0 flex-1 bg-transparent text-[11px] outline-none"
                  style={{ color: "var(--ink)" }}
                />
              </div>
              <div className="mt-1.5 flex items-center gap-1.5">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="h-8 min-w-0 flex-1 rounded-[9px] px-2 text-[11px]"
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
                {group.viewerCanWrite && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectMode((v) => !v);
                      setSelectedIds(new Set());
                    }}
                    title="Chọn nhiều bài viết để gộp thành 1 nhóm cùng chủ đề"
                    className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-[9px] px-2.5 text-[11px] font-medium transition-colors duration-150 ease-out"
                    style={
                      selectMode
                        ? {
                            background: "var(--community-accent)",
                            color: "#fff",
                          }
                        : {
                            background: "var(--surface-muted)",
                            border: "1px solid var(--border)",
                            color: "var(--ink-muted)",
                          }
                    }
                  >
                    {selectMode ? (
                      <X size={13} strokeWidth={2} />
                    ) : (
                      <ListChecks size={13} strokeWidth={1.9} />
                    )}
                    {selectMode ? "Huỷ" : "Chọn"}
                  </button>
                )}
              </div> */}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                    style={{ color: "var(--ink-faint)" }}
                  />
                </div>
              ) : docs.length === 0 ? (
                <p
                  className="py-8 text-center text-[11px]"
                  style={{ color: "var(--ink-faint)" }}
                >
                  Nhóm này chưa có bài viết nào.
                </p>
              ) : filteredDocs.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8">
                  <p
                    className="text-[11px]"
                    style={{ color: "var(--ink-faint)" }}
                  >
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
                // Danh sach phang - khong con gop cac bai cung series vao 1
                // box rieng (SeriesGroupCard) o tab "Tất cả" nua, loc theo
                // series gio da co thanh tab rieng ben tren (theo phan hoi).
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
                  className="mx-3 mb-3 flex shrink-0 flex-col gap-2 rounded-[9px] px-3 py-2.5 shadow-panel"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span
                    className="flex items-center gap-1.5 text-[11px] font-medium"
                    style={{ color: "var(--ink-muted)" }}
                  >
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
          </>
        )}
      </motion.div>
    </motion.aside>
  );

  return (
    <>
      {aside}
      <PostEditorModal
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        groupId={group.id}
      />
    </>
  );
}
