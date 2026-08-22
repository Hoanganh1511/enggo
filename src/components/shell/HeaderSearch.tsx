"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Search, LoaderCircle, BadgeCheck, UserRound, X } from "lucide-react";
import {
  PopoverRoot,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { searchUsersAction } from "@/actions/users/search-users";
import type { UserSearchItem } from "@/lib/api/users";

const PAGE_LIMIT = 10;
const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 350;

// O tim kiem tren header - tim nguoi dung theo ten hien thi/username/email/id
// (xem UserService.search o backend cho quy uoc khop). Debounce 350ms.
// Responsive: desktop (md+) giu nguyen o nhap + dropdown Popover nhu truoc;
// mobile (< md) chi hien 1 nut icon, bam vao mo "drawer" truot xuong tu duoi
// header (KHONG dung Popover cho drawer - do la 1 sheet toan chieu rong,
// khac han pattern dropdown-canh-trigger cua Popover), tranh o nhap day du
// lam header tran ngang tren man hinh hep. Ca 2 bien the dung CHUNG 1 bo
// state/logic tim kiem (query/items/cursor...), chi khac phan khung hien thi.
export function HeaderSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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
      // Boc qua startTransition du la reset dong bo - effect khong duoc goi
      // setState truc tiep (ESLint react-hooks/set-state-in-effect), quy uoc
      // da dung o WorkspaceShell.tsx.
      startSearchTransition(() => {
        setItems([]);
        setCursor(null);
        setSearched(false);
      });
      return;
    }
    // requestId: bo qua ket qua cua 1 request CU tra ve tre hon request MOI
    // hon (vd go nhanh "a" -> "ab" -> "abc", request cua "a" co the ve sau
    // request cua "abc" do do tre mang khac nhau).
    const requestId = ++requestIdRef.current;
    startSearchTransition(async () => {
      const page = await searchUsersAction(debouncedQuery, undefined, PAGE_LIMIT);
      if (requestIdRef.current !== requestId) return;
      setItems(page.items);
      setCursor(page.nextCursor);
      setSearched(true);
    });
  }, [debouncedQuery]);

  function loadMore() {
    if (!cursor || isLoadingMore) return;
    startLoadMoreTransition(async () => {
      const page = await searchUsersAction(debouncedQuery, cursor, PAGE_LIMIT);
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
    });
  }

  const dropdownVisible = open && trimmedQuery.length >= MIN_QUERY_LENGTH;

  const results = (
    <SearchResults
      searched={searched}
      isSearching={isSearching}
      items={items}
      cursor={cursor}
      isLoadingMore={isLoadingMore}
      onLoadMore={loadMore}
      onNavigate={() => {
        setOpen(false);
        setMobileOpen(false);
      }}
    />
  );

  return (
    <>
      {/* Desktop/tablet - giu nguyen o nhap + dropdown Popover nhu ban cu. */}
      <div className="hidden md:block">
        <PopoverRoot open={dropdownVisible} onOpenChange={setOpen}>
          <PopoverAnchor asChild>
            <div
              className="flex h-[38px] w-full max-w-[210px] items-center gap-2 rounded-[20px] px-3.5"
              style={{
                border: "1px solid var(--search-border)",
                background: "var(--surface)",
              }}
            >
              <Search
                size={15}
                strokeWidth={1.75}
                style={{ color: "var(--icon)" }}
                className="shrink-0"
              />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder="Tìm kiếm..."
                className="min-w-0 flex-1 bg-transparent text-xs outline-none"
                style={{ color: "var(--ink)" }}
              />
              {isSearching && (
                <LoaderCircle
                  size={13}
                  strokeWidth={2}
                  className="shrink-0 animate-spin"
                  style={{ color: "var(--icon)" }}
                />
              )}
            </div>
          </PopoverAnchor>

          <PopoverContent
            open={dropdownVisible}
            align="end"
            sideOffset={8}
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="z-50 w-72 overflow-hidden rounded-lg"
            style={{
              background:
                "linear-gradient(145deg, var(--surface-raised), var(--surface))",
              border: "1px solid var(--border-strong)",
              boxShadow: "var(--shadow-dropdown)",
            }}
          >
            <div className="max-h-96 overflow-y-auto p-1.5">{results}</div>
          </PopoverContent>
        </PopoverRoot>
      </div>

      {/* Mobile - chi 1 nut icon, bam mo drawer truot xuong tu top. */}
      <div className="md:hidden">
        <button
          type="button"
          title="Tìm kiếm"
          onClick={() => setMobileOpen(true)}
          className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full"
          style={{ color: "var(--icon)" }}
        >
          <Search size={18} strokeWidth={1.9} />
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                className="fixed inset-x-0 top-0 z-50 overflow-hidden rounded-b-2xl shadow-lg"
                style={{ background: "var(--surface)" }}
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <div
                  className="flex items-center gap-2 border-b p-3"
                  style={{ borderColor: "var(--border)" }}
                >
                  <Search
                    size={16}
                    strokeWidth={1.75}
                    style={{ color: "var(--icon)" }}
                    className="shrink-0"
                  />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                    style={{ color: "var(--ink)" }}
                  />
                  {isSearching && (
                    <LoaderCircle
                      size={14}
                      strokeWidth={2}
                      className="shrink-0 animate-spin"
                      style={{ color: "var(--icon)" }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full"
                    style={{ color: "var(--icon)" }}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="max-h-[70vh] overflow-y-auto p-1.5">
                  {results}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// Danh sach ket qua tim kiem - dung CHUNG cho ca dropdown desktop lan drawer
// mobile (chi khac khung/vien ben ngoai boc no), tranh lap lai ~70 dong JSX.
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
        <LoaderCircle
          size={15}
          strokeWidth={1.9}
          className="animate-spin"
          style={{ color: "var(--ink-faint)" }}
        />
        <span className="text-xs" style={{ color: "var(--ink-faint)" }}>
          Đang tìm...
        </span>
      </div>
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
              <LoaderCircle size={12} strokeWidth={2} className="animate-spin" />
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
