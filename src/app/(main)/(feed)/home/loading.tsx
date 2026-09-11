import Skeleton from "@/components/ui/skeleton";

// Route-level Suspense fallback (Next tu boc page.tsx - toan bo page la 1
// Server Component await Promise.all, nen suspend het ca trang cho toi khi
// xong). Khop dung khung that: hero (dai ngan mobile / 70-30 desktop -
// ArticlesHero.tsx - KHONG con card tom tat ho so mobile duoi hero,
// MobileProfileSummaryRow.tsx da xoa theo yeu cau nguoi dung), hang "Tác
// giả nổi bật" (CreatorRail.tsx), hang "Bộ sưu tập đang được chú ý"
// (AttentionCollectionsRail.tsx - tile 166x205, DA doi tu 86px), luoi "Bài
// viết mới nhất" (ArticlesPostGrid.tsx), roi den nhieu hang "... theo tung
// nhom" (NewestSection.tsx, tile 212x~118 - aspect 1.8 - so luong hang THAT
// phu thuoc bao nhieu nhom co bai, o day chi uoc luong 2 hang cho khung
// skeleton).
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
          <Skeleton key={i} className="h-[166px] w-[205px] shrink-0 rounded-xl" />
        ))}
      </div>

      <div className="mt-8 mb-4 flex items-center gap-2.5">
        <Skeleton className="size-[18px] rounded-full" />
        <Skeleton className="h-5 w-44" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-border bg-surface">
            <Skeleton className="h-[135px] w-full rounded-none" />
            <div className="p-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-3/4" />
              <Skeleton className="mt-3 h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>

      {Array.from({ length: 2 }).map((_, row) => (
        <div key={row}>
          <div className="mt-8 mb-4 flex items-center gap-2.5">
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-53 shrink-0 overflow-hidden rounded-xl border border-border bg-surface">
                <Skeleton className="aspect-[1.8] w-full rounded-none" />
                <div className="p-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="mt-1.5 h-4 w-2/3" />
                  <Skeleton className="mt-3 h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
