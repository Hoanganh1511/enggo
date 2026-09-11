"use client";

import { useEffect, useRef, useState } from "react";
import {
  Folder,
  Globe,
  LayoutGrid,
  List as ListIcon,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { CollectionBrowseCard } from "./CollectionBrowseCard";
import { CollectionBrowseListItem } from "./CollectionBrowseListItem";
import { CollectionsSidebarFilters } from "./CollectionsSidebarFilters";
import { SelectMenu } from "@/components/ui/select-menu";
import { CreateCollectionModal } from "@/components/collections/CreateCollectionModal";
import { listPublicCollectionsAction } from "@/actions/discover/collections/list-public-collections";
import type {
  CollectionTopic,
  ListPublicCollectionsResult,
} from "@/lib/api/collections";

type Scope = "all" | "following";
type Sort = "newest" | "most-posts" | "az";

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: "newest", label: "Mới nhất" },
  { value: "most-posts", label: "Nhiều bài viết" },
  { value: "az", label: "A → Z" },
];

const TOP_SCOPE_TABS: (
  | { kind: "real"; value: Scope; label: string; icon: typeof Sparkles }
  | { kind: "coming-soon"; label: string; icon: typeof Sparkles }
)[] = [
  { kind: "real", value: "all", label: "Tất cả", icon: Sparkles },
  { kind: "coming-soon", label: "Từ quản trị viên", icon: ShieldCheck },
  { kind: "real", value: "following", label: "Từ người bạn theo dõi", icon: Users },
  { kind: "coming-soon", label: "Cộng đồng", icon: Globe },
];

// Client island DUY NHAT cua /collections - nhan `initial` fetch SAN o
// page.tsx (scope "all", khong filter, tranh 1 request thua luc vao trang
// lan dau). Tu quan state scope/topic/sort/search/viewMode, goi lai
// listPublicCollectionsAction moi khi doi filter (debounce chung 300ms,
// don gian hon debounce rieng cho o tim kiem). Chua modal Tao moi + sidebar
// TRONG CHINH component nay (khong tach rieng 2 noi o page.tsx) de sidebar
// va hang pill chia se DUNG 1 nguon state, tranh 2 UI lech nhau.
export function CollectionsBrowseView({
  initial,
  isLoggedIn,
  viewerUsername,
}: {
  initial: ListPublicCollectionsResult;
  isLoggedIn: boolean;
  viewerUsername: string | null;
}) {
  const [scope, setScope] = useState<Scope>("all");
  const [topic, setTopic] = useState<CollectionTopic | null>(null);
  const [sort, setSort] = useState<Sort>("newest");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const isFirstRun = useRef(true);

  function reload() {
    setLoading(true);
    listPublicCollectionsAction({
      scope,
      topic: topic ?? undefined,
      sort,
      search: search.trim() || undefined,
    })
      .then(setData)
      .catch(() => {
        // im lang - giu ket qua cu, khong lam vo trang.
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const t = setTimeout(reload, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, topic, sort, search]);

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {TOP_SCOPE_TABS.map((t) => {
              const Icon = t.icon;
              if (t.kind === "coming-soon") {
                return (
                  <button
                    key={t.label}
                    type="button"
                    disabled
                    title="Sắp có"
                    className="flex h-9 cursor-not-allowed items-center gap-1.5 rounded-full border border-[var(--border)] px-3.5 text-[13px] font-medium text-[var(--muted)]/50"
                  >
                    <Icon size={14} strokeWidth={1.8} />
                    {t.label}
                  </button>
                );
              }
              const active = t.value === scope;
              const count = t.value === "all" ? data.facets.allCount : data.facets.followingCount;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setScope(t.value)}
                  className={`flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-colors duration-150 ease-out ${
                    active
                      ? "bg-[var(--foreground)] text-white"
                      : "border border-[var(--border)] text-[var(--muted)] hover:bg-slate-50"
                  }`}
                >
                  <Icon size={14} strokeWidth={1.8} />
                  {t.label} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="w-36">
              <SelectMenu
                value={sort}
                onChange={setSort}
                options={SORT_OPTIONS}
                placeholder="Sắp xếp"
              />
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Dạng lưới"
                className={`grid size-8 cursor-pointer place-items-center rounded-md ${
                  viewMode === "grid" ? "bg-slate-100 text-[var(--foreground)]" : "text-[var(--muted)]"
                }`}
              >
                <LayoutGrid size={15} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="Dạng danh sách"
                className={`grid size-8 cursor-pointer place-items-center rounded-md ${
                  viewMode === "list" ? "bg-slate-100 text-[var(--foreground)]" : "text-[var(--muted)]"
                }`}
              >
                <ListIcon size={15} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>

        <div className={`mt-5 ${loading ? "opacity-60" : ""}`}>
          {data.items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--border)] py-16 text-center">
              <Folder size={20} strokeWidth={1.6} className="text-[var(--muted)]" />
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Không tìm thấy bộ sưu tập nào.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.items.map((c) => (
                <CollectionBrowseCard key={c.id} collection={c} viewerUsername={viewerUsername} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {data.items.map((c) => (
                <CollectionBrowseListItem key={c.id} collection={c} viewerUsername={viewerUsername} />
              ))}
            </div>
          )}
        </div>
      </div>

      <aside className="hidden lg:block">
        <CollectionsSidebarFilters
          search={search}
          onSearchChange={setSearch}
          scope={scope}
          onScopeChange={setScope}
          topic={topic}
          onTopicChange={setTopic}
          sort={sort}
          onSortChange={setSort}
          facets={data.facets}
          isLoggedIn={isLoggedIn}
          onOpenCreate={() => setCreateOpen(true)}
        />
      </aside>

      <CreateCollectionModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => {
          setCreateOpen(false);
          reload();
        }}
      />
    </div>
  );
}
