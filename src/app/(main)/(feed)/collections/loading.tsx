import Skeleton from "@/components/ui/skeleton";

// Route-level Suspense fallback cho /collections ("Bộ sưu tập của mọi
// người") - khop dung khung that: CollectionsHero.tsx (back link + banner
// anh nen) + CollectionsBrowseView.tsx (hang pill scope/sort/view o cot
// chinh, luoi CollectionBrowseCard.tsx 4 cot, sidebar loc CollectionsSidebarFilters.tsx
// o cot phu, CHI hien tu lg nhu trang that).
export default function CollectionsLoading() {
  return (
    <div>
      <Skeleton className="mb-3 h-4 w-20" />
      <Skeleton className="h-[210px] w-full rounded-2xl md:h-[238px]" />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-28 rounded-full" />
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Skeleton className="h-9 w-36 rounded-lg" />
              <Skeleton className="h-9 w-18 rounded-lg" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-border bg-surface">
                <Skeleton className="aspect-video w-full rounded-none" />
                <div className="p-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="mt-2 h-3.5 w-3/4" />
                </div>
                <div className="flex items-center justify-between px-4 pb-4">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="flex flex-col gap-5">
            <Skeleton className="h-10 w-full rounded-lg" />
            <div className="rounded-xl border border-border bg-surface p-3.5">
              <Skeleton className="mb-3 h-4 w-16" />
              <div className="space-y-2.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-3.5 w-full" />
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3.5">
              <Skeleton className="mb-3 h-4 w-16" />
              <div className="space-y-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-3.5 w-full" />
                ))}
              </div>
            </div>
            <Skeleton className="h-44 w-full rounded-xl" />
          </div>
        </aside>
      </div>
    </div>
  );
}
