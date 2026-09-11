import Skeleton from "@/components/ui/skeleton";

// Route-level Suspense fallback (Next tu boc page.tsx - ca trang la 1 Server
// Component await Promise.all nen suspend het cho toi khi xong). Khop dung
// khung "knowledge dashboard" that: hero (HomeHero.tsx), luoi "Browse by
// category" (HomeCategoryGrid.tsx) + luoi bai viet (HomeArticleSection.tsx)
// o cot chinh, 4 the sidebar (Roadmap/WeeklyProgress/Quote/Activity) o cot
// phu - dung 2 cot grid y het page.tsx (khong phai ban cu dung SectionSkeleton
// cua EditorialFeed, sai hoan toan bo cuc trang hien tai).
function SidebarCardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <Skeleton className="h-4 w-32" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function HomeFeedLoading() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:-mr-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        <Skeleton className="h-65 w-full rounded-2xl sm:h-75 lg:h-83.75" />

        <div className="mt-8 mb-4">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border p-4">
              <Skeleton className="mb-4 size-8 rounded-lg" />
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="mt-2 h-3 w-1/2" />
            </div>
          ))}
        </div>

        <div className="mt-8 mb-4 flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-full max-w-[320px] rounded-lg" />
        </div>
        <div className="mb-4 flex gap-7 border-b border-border pb-3">
          <Skeleton className="h-3.5 w-14" />
          <Skeleton className="h-3.5 w-14" />
          <Skeleton className="h-3.5 w-20" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-16/10 w-full rounded-lg" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-1.5 h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>

      <aside className="space-y-5">
        <div className="hidden lg:block">
          <SidebarCardSkeleton lines={2} />
        </div>
        <div className="hidden lg:block">
          <SidebarCardSkeleton lines={2} />
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
        <SidebarCardSkeleton lines={4} />
      </aside>
    </div>
  );
}
