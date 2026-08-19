"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Lock, Search, Sparkles } from "lucide-react";
import type { ApiKnowledgeGroup } from "@/lib/api/types";
import { CreateGroupButton } from "./CreateGroupButton";
import { GroupIconGlyph } from "./group-icons";
import { RequestCollabModal } from "./RequestCollabModal";
import { useWorkspaceShell } from "./workspace-shell-context";

const PAGE_SIZE = 9;

// Mau "concept" rieng cua khu vuc Workspace (gradient xanh duong loang nhe
// trang - #20c5d8/#269ce9/#326eea, xem docs/workspace-style-guide.md muc 8) -
// KHONG dung var(--primary) (#0891b2, mot mau teal cu, KHAC concept nay) cho
// bat ky text/accent nao trong man nay nua. Chi lay 1 stop dai dien
// (#269ce9) cho text/icon dac (khong the dung ca dai gradient cho text ro
// duoc), con vien the van dung dai gradient day du (xem KnowledgeGroupCard).
const CONCEPT_BLUE = "#269ce9";

const MONTH_LABELS = [
  "Th.1", "Th.2", "Th.3", "Th.4", "Th.5", "Th.6",
  "Th.7", "Th.8", "Th.9", "Th.10", "Th.11", "Th.12",
];

function monthKey(iso: string) {
  return iso.slice(0, 7); // "2026-03"
}

function monthLabel(key: string) {
  const [y, m] = key.split("-");
  return `${MONTH_LABELS[Number(m) - 1]}/${y}`;
}

// Man tong quan CHINH cua 1 workspace - danh muc phang kieu "AWS product
// catalog" (sidebar bo loc + luoi the + o tim kiem + phan trang) THAY THE
// ban "khu vuon tri thuc" truoc do (qua cau ky/nang cho nhu cau "don gian").
// Van giu dung 1 nguyen tac xuyen suot ca 2 ban: gradient xanh cua concept
// CHI con xuat hien o VIEN NHE cua the (khong con nen pastel toan trang nhu
// ban vuon nua) - xem KnowledgeGroupCard ben duoi. Sidebar loc THEO THANG
// TAO (khong phai theo quyen xem) - giu dung tinh than "to chuc theo thoi
// gian" da lam xuyen suot tinh nang nay, chi doi tu hien thi "tang" sang 1
// danh sach bo loc phang.
export function KnowledgeGroupCatalog() {
  const { workspace, groups, isSelf, selectGroup, addGroup, username } =
    useWorkspaceShell();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lockedGroup, setLockedGroup] = useState<ApiKnowledgeGroup | null>(null);

  const months = useMemo(() => {
    const byMonth = new Map<string, number>();
    for (const g of groups) {
      const key = monthKey(g.createdAt);
      byMonth.set(key, (byMonth.get(key) ?? 0) + 1);
    }
    return [...byMonth.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, count]) => ({ key, label: monthLabel(key), count }));
  }, [groups]);

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    return groups.filter((g) => {
      if (selectedMonth && monthKey(g.createdAt) !== selectedMonth) return false;
      if (q && !g.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [groups, selectedMonth, search]);

  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / PAGE_SIZE));
  const pageGroups = filteredGroups.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const headerLabel = selectedMonth
    ? months.find((m) => m.key === selectedMonth)?.label
    : "Tất cả nhóm kiến thức";

  function openGroup(g: ApiKnowledgeGroup) {
    const locked = g.visibility === "PRIVATE" && !g.viewerCanWrite;
    if (locked) {
      setLockedGroup(g);
      return;
    }
    // Cap nhat state NGAY (choreography truot vao quen thuoc) truoc khi URL
    // kip doi - WorkspaceBrowseView.tsx se tu dong bo lai qua selectGroupById
    // khi route moi mount, luc do state da dung san nen la no-op.
    selectGroup(g);
    router.push(`/workspace/${username}/${workspace.id}/group/${g.id}`);
  }

  return (
    // Truoc day co 1 khoi rieng "WORKSPACE / {ten}" o day, chiem ca 1 hang
    // chi de hien ten - da bo (nguoi dung phan anh "tốn hẳn một khoảng lớn
    // diện tích... phần còn lại thừa rất nhiều"): danh tinh workspace gio
    // nam o breadcrumb CO DINH phia tren (WorkspaceMain.tsx) + panel tong
    // quan o cot phai (WorkspaceOverviewPanel.tsx), khong lap lai o day nua.
    <div className="min-h-full p-6">
      {groups.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24">
          <Sparkles size={26} strokeWidth={1.5} style={{ color: "var(--ink-faint)" }} />
          <p className="text-[13px]" style={{ color: "var(--ink-faint)" }}>
            Chưa có nhóm kiến thức nào.
          </p>
          {isSelf && (
            <CreateGroupButton
              workspaceId={workspace.id}
              username={username}
              onCreated={addGroup}
            />
          )}
        </div>
      ) : (
        <div className="flex items-start gap-6">
          <MonthFilterSidebar
            months={months}
            selected={selectedMonth}
            totalCount={groups.length}
            onSelect={(key) => {
              setSelectedMonth(key);
              setPage(1);
            }}
          />

          <div className="min-w-0 flex-1 rounded-lg p-5" style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[19px] font-bold" style={{ color: "var(--ink)" }}>
                {headerLabel} ({filteredGroups.length})
              </h2>
              {isSelf && (
                <CreateGroupButton
                  workspaceId={workspace.id}
                  username={username}
                  onCreated={addGroup}
                />
              )}
            </div>

            <div className="mb-5 flex items-center gap-3">
              <div
                className="flex h-10 flex-1 items-center gap-2 rounded-lg px-3"
                style={{ border: "1px solid var(--border)", background: "var(--surface-muted)" }}
              >
                <Search size={15} strokeWidth={1.9} style={{ color: "var(--ink-faint)" }} />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Tìm nhóm kiến thức..."
                  className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
                  style={{ color: "var(--ink)" }}
                />
              </div>
              {totalPages > 1 && (
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              )}
            </div>

            {filteredGroups.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16">
                <p className="text-[13px]" style={{ color: "var(--ink-faint)" }}>
                  Không tìm thấy nhóm kiến thức phù hợp.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSelectedMonth(null);
                    setPage(1);
                  }}
                  className="cursor-pointer text-[12px] font-semibold"
                  style={{ color: CONCEPT_BLUE }}
                >
                  Xoá bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {pageGroups.map((g) => (
                  <KnowledgeGroupCard key={g.id} group={g} onOpen={() => openGroup(g)} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <RequestCollabModal
        group={lockedGroup}
        open={lockedGroup !== null}
        onOpenChange={(next) => {
          if (!next) setLockedGroup(null);
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SIDEBAR - loc theo thang tao                                              */
/* -------------------------------------------------------------------------- */

function MonthFilterSidebar({
  months,
  selected,
  totalCount,
  onSelect,
}: {
  months: { key: string; label: string; count: number }[];
  selected: string | null;
  totalCount: number;
  onSelect: (key: string | null) => void;
}) {
  return (
    <aside
      className="w-[230px] shrink-0 rounded-lg p-4"
      style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
    >
      <h2 className="mb-3 text-[13px] font-bold" style={{ color: "var(--ink)" }}>
        Thời gian tạo
      </h2>
      <nav className="flex flex-col gap-0.5">
        <FilterRow
          label="Tất cả nhóm kiến thức"
          count={totalCount}
          active={selected === null}
          onClick={() => onSelect(null)}
        />
        {months.map((m) => (
          <FilterRow
            key={m.key}
            label={m.label}
            count={m.count}
            active={selected === m.key}
            onClick={() => onSelect(m.key)}
          />
        ))}
      </nav>
    </aside>
  );
}

function FilterRow({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors duration-150 ease-out hover:text-ink"
      style={{
        color: active ? CONCEPT_BLUE : "var(--ink-muted)",
        fontWeight: active ? 600 : 400,
        background: active ? "var(--active-bg)" : undefined,
      }}
    >
      <span className="truncate">{label}</span>
      <span className="shrink-0 text-[11px]" style={{ color: "var(--ink-faint)" }}>
        ({count})
      </span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* CARD                                                                       */
/* -------------------------------------------------------------------------- */

function KnowledgeGroupCard({ group, onOpen }: { group: ApiKnowledgeGroup; onOpen: () => void }) {
  const locked = group.visibility === "PRIVATE" && !group.viewerCanWrite;

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      className="group flex min-h-[164px] cursor-pointer flex-col gap-3 rounded-lg p-4 text-left shadow-sm transition-shadow duration-150 ease-out hover:shadow-md"
      style={{
        border: "1px solid transparent",
        // Vien "xanh duong loang nhe trang" DUNG NGHIA: 1 huong gradient
        // duy nhat (khong con tron 3 stop cua CTA_GRADIENT voi mau xam
        // border nhu ban truoc, nhin ngoi teal/duc) - dam o 1 goc (50% xanh)
        // roi NHAT DAN ve chinh mau nen cua the (10% xanh, gan nhu var(--surface))
        // o goc doi dien, dung 1 stop dai dien CONCEPT_BLUE. var(--surface)
        // lam diem "loang toi" nen tu doi theo theme (trang o light mode,
        // toi o dark mode) thay vi hardcode "white".
        background: `linear-gradient(var(--surface), var(--surface)) padding-box, linear-gradient(135deg, color-mix(in srgb, ${CONCEPT_BLUE} 50%, var(--surface)), color-mix(in srgb, ${CONCEPT_BLUE} 10%, var(--surface))) border-box`,
        opacity: locked ? 0.85 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-lg"
            style={{
              background: `color-mix(in srgb, ${CONCEPT_BLUE} 14%, transparent)`,
              color: CONCEPT_BLUE,
            }}
          >
            <GroupIconGlyph name={group.icon} size={14} />
          </span>
          {/* Title: NANG BAC ro ret so voi mo ta (nguoi dung phan anh "font
              size... không đủ chênh lệch để phân biệt vai trò") - to hon
              (17px, tang tu 15px), dam hon (font-bold thay semibold), giam
              line-clamp con anh huong toi mat do doc luoi 3 cot. */}
          <h3
            className="line-clamp-1 min-w-0 text-[15px] leading-tight font-bold group-hover:underline"
            style={{ color: CONCEPT_BLUE }}
          >
            {group.name}
          </h3>
        </div>
        {locked && (
          <Lock size={13} strokeWidth={2.1} className="mt-0.5 shrink-0" style={{ color: "var(--ink-faint)" }} />
        )}
      </div>
      {/* Mo ta: LUI BAC ro ret - nho hon + nhat hon (ink-faint thay
          ink-muted) de mat tu nhien do tro thang vao title truoc, mo ta chi
          la thong tin phu. */}
      <p
        className="line-clamp-2 flex-1 text-[12px] leading-relaxed"
        style={{ color: "var(--ink-faint)" }}
      >
        {group.description || "Chưa có mô tả."}
      </p>
      <div className="flex flex-wrap gap-1.5">
        <Pill>{group.visibility === "PRIVATE" ? "Riêng tư" : "Công khai"}</Pill>
        <Pill>{group.postCount} bài viết</Pill>
      </div>
    </motion.button>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
      style={{ background: "var(--surface-muted)", color: "var(--ink-muted)" }}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* PAGINATION                                                                 */
/* -------------------------------------------------------------------------- */

function pageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const keep = new Set([1, total, current, current - 1, current + 1]);
  const result: (number | "ellipsis")[] = [];
  let lastShown = 0;
  for (let p = 1; p <= total; p++) {
    if (!keep.has(p)) continue;
    if (p - lastShown > 1) result.push("ellipsis");
    result.push(p);
    lastShown = p;
  }
  return result;
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="flex size-8 cursor-pointer items-center justify-center rounded-md disabled:cursor-not-allowed disabled:opacity-40"
        style={{ color: "var(--ink-muted)" }}
        aria-label="Trang trước"
      >
        <ChevronLeft size={16} strokeWidth={2} />
      </button>
      {pageNumbers(page, totalPages).map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e-${i}`} className="px-1 text-[12px]" style={{ color: "var(--ink-faint)" }}>
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className="flex size-8 cursor-pointer items-center justify-center rounded-md text-[12px] font-semibold transition-colors duration-150 ease-out"
            style={{
              color: p === page ? "#ffffff" : "var(--ink-muted)",
              background: p === page ? CONCEPT_BLUE : undefined,
            }}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="flex size-8 cursor-pointer items-center justify-center rounded-md disabled:cursor-not-allowed disabled:opacity-40"
        style={{ color: "var(--ink-muted)" }}
        aria-label="Trang sau"
      >
        <ChevronRight size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
