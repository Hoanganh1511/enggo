import Skeleton from "@/components/ui/skeleton";

// Route-level Suspense fallback (Next tu boc page.tsx - toan bo page la 1
// Server Component await Promise.all, nen suspend het ca trang cho toi khi
// xong). Khop dung khung that: hero (dai ngan mobile / 70-30 desktop -
// ArticlesHero.tsx), hang "Tác giả nổi bật" (CreatorRail.tsx), hang "Chủ đề
// đang hot" (TopicsRail.tsx).
export default function ArticlesLoading() {
  return (
    <div className="flex flex-col">
      <Skeleton className="h-16 w-full rounded-xl sm:h-20 lg:hidden" />
      <div className="hidden gap-4 lg:grid lg:grid-cols-[7fr_3fr]">
        <Skeleton className="min-h-[210px] w-full rounded-2xl md:min-h-[238px]" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:grid-rows-2 sm:gap-4">
          <Skeleton className="h-full min-h-[100px] w-full rounded-2xl sm:col-span-2" />
          <Skeleton className="h-full min-h-[100px] w-full rounded-2xl" />
          <Skeleton className="h-full min-h-[100px] w-full rounded-2xl" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-surface p-4 lg:hidden">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="mt-2 h-3 w-48" />
        </div>
      </div>

      <div className="mt-8 mb-4 flex items-center gap-2.5">
        <Skeleton className="size-[18px] rounded-full" />
        <Skeleton className="h-5 w-36" />
      </div>
      <div className="flex gap-5 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex min-w-[64px] shrink-0 flex-col items-center gap-2">
            <Skeleton className="size-12 shrink-0 rounded-full" />
            <Skeleton className="h-2.5 w-12" />
          </div>
        ))}
      </div>

      <div className="mt-8 mb-4 flex items-center gap-2.5">
        <Skeleton className="size-[18px] rounded-full" />
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[86px] w-[205px] shrink-0 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
