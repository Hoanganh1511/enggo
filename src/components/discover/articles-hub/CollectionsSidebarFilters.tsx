"use client";

import { Folder, Plus, Search, ShieldCheck, Sparkles, Users } from "lucide-react";
import { COLLECTION_TOPIC_LABELS, type CollectionTopic } from "@/lib/api/collections";
import type { CollectionFacets } from "@/lib/api/collections";

type Scope = "all" | "following";
type Sort = "newest" | "most-posts" | "az";

const SCOPE_ROWS: (
  | { kind: "real"; value: Scope; label: string; icon: typeof Sparkles }
  | { kind: "coming-soon"; label: string; icon: typeof Sparkles }
)[] = [
  { kind: "real", value: "all", label: "Tất cả", icon: Sparkles },
  { kind: "coming-soon", label: "Từ quản trị viên", icon: ShieldCheck },
  { kind: "real", value: "following", label: "Từ người bạn theo dõi", icon: Users },
  { kind: "coming-soon", label: "Cộng đồng", icon: Folder },
];

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: "newest", label: "Mới nhất" },
  { value: "most-posts", label: "Nhiều bài viết" },
  { value: "az", label: "A → Z" },
];

// Sidebar loc /collections - CHI la control khac tro vao CUNG state voi
// hang pill tren CollectionsBrowseView.tsx (khong tu fetch, khong giu state
// rieng) - tranh 2 nguon su that lech nhau. "Chủ đề" doc facets.topics that
// tu backend (PostCollectionService.listPublic groupBy), khong bia so.
export function CollectionsSidebarFilters({
  search,
  onSearchChange,
  scope,
  onScopeChange,
  topic,
  onTopicChange,
  sort,
  onSortChange,
  facets,
  isLoggedIn,
  onOpenCreate,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  scope: Scope;
  onScopeChange: (v: Scope) => void;
  topic: CollectionTopic | null;
  onTopicChange: (v: CollectionTopic | null) => void;
  sort: Sort;
  onSortChange: (v: Sort) => void;
  facets: CollectionFacets;
  isLoggedIn: boolean;
  onOpenCreate: () => void;
}) {
  const topicCounts = new Map(facets.topics.map((t) => [t.topic, t.count]));

  return (
    <div className="flex flex-col gap-5">
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--muted)]" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm bộ sưu tập..."
          className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pr-3 pl-9 text-sm text-[var(--foreground)] outline-none focus:border-blue-300"
        />
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
        <h3 className="mb-2 text-[13px] font-bold text-[var(--foreground)]">Lọc theo</h3>
        <div className="flex flex-col gap-0.5">
          {SCOPE_ROWS.map((row) => {
            const Icon = row.icon;
            if (row.kind === "coming-soon") {
              return (
                <span
                  key={row.label}
                  title="Sắp có"
                  className="flex cursor-not-allowed items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-[var(--muted)]/50"
                >
                  <Icon size={14} strokeWidth={1.8} />
                  <span className="flex-1 truncate">{row.label}</span>
                </span>
              );
            }
            const active = row.value === scope;
            return (
              <button
                key={row.value}
                type="button"
                onClick={() => onScopeChange(row.value)}
                className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] font-medium transition-colors duration-150 ease-out ${
                  active ? "bg-rose-50 text-rose-600" : "text-[var(--muted)] hover:bg-slate-50"
                }`}
              >
                <Icon size={14} strokeWidth={1.8} />
                <span className="flex-1 truncate">{row.label}</span>
                <span className="tabular-nums">
                  {row.value === "all" ? facets.allCount : facets.followingCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
        <h3 className="mb-2 text-[13px] font-bold text-[var(--foreground)]">Chủ đề</h3>
        <div className="flex flex-col gap-0.5">
          {(Object.entries(COLLECTION_TOPIC_LABELS) as [CollectionTopic, string][]).map(
            ([value, label]) => {
              const active = value === topic;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onTopicChange(active ? null : value)}
                  className={`flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-left text-[13px] transition-colors duration-150 ease-out ${
                    active ? "font-semibold text-[var(--foreground)]" : "text-[var(--muted)] hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">{label}</span>
                  <span className="tabular-nums">{topicCounts.get(value) ?? 0}</span>
                </button>
              );
            },
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
        <h3 className="mb-2 text-[13px] font-bold text-[var(--foreground)]">Sắp xếp</h3>
        <div className="flex flex-col gap-1.5">
          {SORT_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2 text-[13px] text-[var(--foreground)]">
              <input
                type="radio"
                name="collections-sort"
                checked={sort === opt.value}
                onChange={() => onSortChange(opt.value)}
                className="accent-[var(--primary)]"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-4 text-center">
        <div className="mx-auto mb-2 flex size-9 items-center justify-center rounded-full bg-rose-50 text-rose-500">
          <Users size={16} strokeWidth={1.8} />
        </div>
        <p className="text-[13px] font-semibold text-[var(--foreground)]">
          Tạo bộ sưu tập của riêng bạn
        </p>
        <p className="mt-1 text-[12px] text-[var(--muted)]">
          Lưu và sắp xếp những bài viết yêu thích theo chủ đề của bạn.
        </p>
        {isLoggedIn ? (
          <button
            type="button"
            onClick={onOpenCreate}
            className="mt-3 flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-rose-500 text-sm font-semibold text-white transition-opacity duration-150 ease-out hover:opacity-90"
          >
            <Plus size={14} strokeWidth={2.5} />
            Tạo bộ sưu tập
          </button>
        ) : (
          <a
            href="/login"
            className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-rose-500 text-sm font-semibold text-white transition-opacity duration-150 ease-out hover:opacity-90"
          >
            <Plus size={14} strokeWidth={2.5} />
            Đăng nhập để tạo
          </a>
        )}
      </div>
    </div>
  );
}
