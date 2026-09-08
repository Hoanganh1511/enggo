"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutGrid, Search, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useServiceFavorites } from "@/lib/use-service-favorites";
import { HOME_FEATURES } from "@/components/discover/home-features-data";
import { ServiceCard } from "./ServiceCard";

type ActiveFilter = "all" | "favorites";

// Trang /services - CHI con 1 dich vu that (GL Life Book, xem
// home-features-data.ts) sau khi bo toan bo he thong category cu (theo yeu
// cau nguoi dung). Sidebar rut gon lai chi con tab All/Favorites (khong con
// ServiceSelector/CategoryList/toolbar pill filter theo category - khong con
// y nghia gi voi 1 dich vu duy nhat). Favorite THAT (luu localStorage qua
// useServiceFavorites, khong phai gia lap).
export function ServicesShell() {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const { favorites, toggleFavorite } = useServiceFavorites();

  const debouncedQuery = useDebouncedValue(query.trim().toLowerCase(), 250);

  const scopedServices = useMemo(() => {
    if (activeFilter === "favorites") {
      return HOME_FEATURES.filter((s) => favorites.has(s.slug));
    }
    return HOME_FEATURES;
  }, [activeFilter, favorites]);

  const filteredServices = useMemo(() => {
    if (!debouncedQuery) return scopedServices;
    return scopedServices.filter((s) => {
      const haystack = `${s.title} ${s.description}`.toLowerCase();
      return haystack.includes(debouncedQuery);
    });
  }, [scopedServices, debouncedQuery]);

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (
        e.key === "Escape" &&
        document.activeElement === searchRef.current
      ) {
        setQuery("");
        searchRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  const headerTitle = activeFilter === "favorites" ? "Favorites" : "All Services";
  const headerDescription =
    activeFilter === "favorites"
      ? "Các dịch vụ bạn đã đánh dấu yêu thích."
      : "Bộ công cụ giúp bạn quản lý toàn diện cuộc sống.";

  return (
    <div className="flex min-h-full">
      {/* SIDEBAR */}
      <aside className="sticky top-0 hidden h-fit w-64 shrink-0 flex-col gap-5 border-r border-border p-5 lg:flex">
        <div className="flex rounded-lg bg-surface-muted p-1">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={cn(
              "flex-1 cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors duration-150 ease-out",
              activeFilter === "all"
                ? "bg-white text-ink shadow-sm"
                : "text-ink-muted",
            )}
          >
            All Services
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("favorites")}
            className={cn(
              "flex-1 cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors duration-150 ease-out",
              activeFilter === "favorites"
                ? "bg-white text-ink shadow-sm"
                : "text-ink-muted",
            )}
          >
            Favorites
          </button>
        </div>

        <div className="mt-auto rounded-lg border border-dashed border-border bg-surface-muted/60 p-4">
          <span className="grid size-8 place-items-center rounded-full bg-white text-amber-500 shadow-sm">
            <Sparkles size={15} strokeWidth={2} />
          </span>
          <p className="mt-2.5 text-sm font-semibold text-ink">
            More coming soon
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Chúng tôi luôn cập nhật thêm những công cụ giúp bạn quản lý cuộc
            sống tốt hơn mỗi ngày.
          </p>
        </div>
      </aside>

      {/* MAIN */}
      <main className="min-w-0 flex-1 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-medium text-ink-faint">
              <LayoutGrid size={13} />
              Services
            </div>
            <h1 className="mt-1 text-[26px] font-extrabold text-ink sm:text-[32px]">
              {headerTitle}
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-ink-muted">
              {headerDescription}
            </p>
          </div>

          <div className="flex h-10 w-full max-w-xs shrink-0 items-center gap-2 rounded-lg border border-border bg-surface px-3">
            <Search size={15} className="shrink-0 text-ink-faint" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services..."
              className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="shrink-0 cursor-pointer text-ink-faint hover:text-ink"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {filteredServices.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-surface-muted text-ink-faint">
              <Search size={20} />
            </span>
            <p className="text-sm font-semibold text-ink">No services found</p>
            <p className="max-w-xs text-sm text-ink-muted">
              Không tìm thấy công cụ phù hợp.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveFilter("all");
                setQuery("");
              }}
              className="mt-1 cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-semibold text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
            >
              Clear filters
            </button>
          </div>
        ) : (
          // Xep DOC, moi dich vu 1 hang full-width (khong con luoi nhieu
          // cot) - the nay giu dung ty le/khoang cach nhu anh mau (icon lon,
          // decor ro, cum 3 nut rieng ben duoi), nhoi vao 1 o luoi hep truoc
          // day lam vo het bo cuc.
          <div className="mt-6 flex flex-col gap-8">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.slug}
                service={service}
                isFavorite={favorites.has(service.slug)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
