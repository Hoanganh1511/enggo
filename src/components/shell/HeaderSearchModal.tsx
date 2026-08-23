"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, UserRound, Search } from "lucide-react";
import { SimpleModal } from "@/components/ui/simple-modal";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { searchUsersAction } from "@/actions/users/search-users";
import type { UserSearchItem } from "@/lib/api/users";

const PAGE_LIMIT = 10;
const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 350;

// Modal tim kiem tren header - THAY the o nhap+popover/drawer cua
// HeaderSearch.tsx cu (da xoa) bang SimpleModal dung chung toan app, GIU
// NGUYEN logic tim nguoi dung that (debounce/phan trang/huy request cu) -
// chi doi khung UI ben ngoai, khong viet lai tu dau. Mo qua icon Search o
// cum ben phai TopHeaderBar.tsx.
export function HeaderSearchModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<UserSearchItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [isSearching, startSearchTransition] = useTransition();
  const [isLoadingMore, startLoadMoreTransition] = useTransition();
  const requestIdRef = useRef(0);

  const trimmedQuery = query.trim();
  const debouncedQuery = useDebouncedValue(trimmedQuery, DEBOUNCE_MS);

  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      startSearchTransition(() => {
        setItems([]);
        setCursor(null);
        setSearched(false);
      });
      return;
    }
    const requestId = ++requestIdRef.current;
    startSearchTransition(async () => {
      const page = await searchUsersAction(debouncedQuery, undefined, PAGE_LIMIT);
      if (requestIdRef.current !== requestId) return;
      setItems(page.items);
      setCursor(page.nextCursor);
      setSearched(true);
    });
  }, [debouncedQuery]);

  // Reset ve trang thai rong moi lan MO modal (khong giu ket qua/tu khoa cua
  // lan tim truoc) - dat trong onOpenChange (event handler that, khong phai
  // effect) nen khong vi pham react-hooks/set-state-in-effect.
  function handleOpenChange(next: boolean) {
    if (next) {
      setQuery("");
      setItems([]);
      setCursor(null);
      setSearched(false);
    }
    onOpenChange(next);
  }

  function loadMore() {
    if (!cursor || isLoadingMore) return;
    startLoadMoreTransition(async () => {
      const page = await searchUsersAction(debouncedQuery, cursor, PAGE_LIMIT);
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
    });
  }

  return (
    <SimpleModal
      open={open}
      onOpenChange={handleOpenChange}
      title="Tìm kiếm"
      maxWidthClassName="max-w-lg"
    >
      <div
        className="flex h-11 w-full items-center gap-2 rounded-lg px-4"
        style={{
          border: "1px solid var(--search-border)",
          background: "var(--surface-muted)",
        }}
      >
        <Search
          size={16}
          strokeWidth={1.9}
          style={{ color: "var(--icon)" }}
          className="shrink-0"
        />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm người dùng..."
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          style={{ color: "var(--ink)" }}
        />
        {isSearching && (
          <LoadingSpinner size={14} style={{ color: "var(--icon)" }} />
        )}
      </div>

      <div className="mt-3">
        <SearchResults
          searched={searched}
          isSearching={isSearching}
          items={items}
          cursor={cursor}
          isLoadingMore={isLoadingMore}
          onLoadMore={loadMore}
          onNavigate={() => onOpenChange(false)}
        />
      </div>
    </SimpleModal>
  );
}

// Danh sach ket qua - port nguyen tu HeaderSearch.tsx cu, khong doi logic.
function SearchResults({
  searched,
  isSearching,
  items,
  cursor,
  isLoadingMore,
  onLoadMore,
  onNavigate,
}: {
  searched: boolean;
  isSearching: boolean;
  items: UserSearchItem[];
  cursor: string | null;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onNavigate: () => void;
}) {
  if (!searched && isSearching) {
    return (
      <div className="flex items-center justify-center gap-2 py-6">
        <LoadingSpinner size={15} style={{ color: "var(--ink-faint)" }} />
        <span className="text-xs" style={{ color: "var(--ink-faint)" }}>
          Đang tìm...
        </span>
      </div>
    );
  }

  if (!searched) {
    return (
      <p
        className="py-6 text-center text-xs"
        style={{ color: "var(--ink-faint)" }}
      >
        Nhập ít nhất 2 ký tự để tìm kiếm.
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p
        className="py-6 text-center text-xs"
        style={{ color: "var(--ink-faint)" }}
      >
        Không tìm thấy người dùng phù hợp.
      </p>
    );
  }

  return (
    <>
      {items.map((u) => (
        <Link
          key={u.id}
          href={`/u/${u.username ?? u.id}`}
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors duration-150 ease-out hover:bg-hover-bg"
        >
          {u.avatarUrl ? (
            <Image
              src={u.avatarUrl}
              alt={u.displayName}
              width={28}
              height={28}
              className="size-7 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-full"
              style={{
                background: "var(--surface-muted)",
                color: "var(--ink-faint)",
              }}
            >
              <UserRound size={14} strokeWidth={1.9} />
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span
              className="flex items-center gap-1 truncate text-[12px] font-semibold"
              style={{ color: "var(--ink)" }}
            >
              {u.displayName}
              {u.isVerified && (
                <BadgeCheck
                  size={12}
                  strokeWidth={2}
                  className="shrink-0"
                  style={{ color: "var(--primary)" }}
                />
              )}
            </span>
            {u.username && (
              <span
                className="block truncate text-[10px]"
                style={{ color: "var(--ink-faint)" }}
              >
                @{u.username}
              </span>
            )}
          </span>
        </Link>
      ))}

      {cursor && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={isLoadingMore}
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md py-2 text-[11px] font-medium transition-colors duration-150 ease-out hover:bg-hover-bg disabled:cursor-not-allowed"
          style={{ color: "var(--primary)" }}
        >
          {isLoadingMore ? (
            <>
              <LoadingSpinner size={12} />
              Đang tải...
            </>
          ) : (
            "Xem thêm"
          )}
        </button>
      )}
    </>
  );
}
