import { SeriesSkeleton } from "@/components/series/SeriesSkeleton";

// Skeleton THEO DUNG BO CUC that cua trang sua Entry (SeriesEntryForm.tsx) -
// yeu cau nguoi dung: "Trang chỉnh sửa bài viết chưa cập nhật trang loading
// skeleton theo những thay đổi mới à" (ban truoc chi la 1 <Spinner/> tron
// giua trang, khong con khop voi bo cuc THAT sau 1 loat thay doi: bo cot
// Live preview 2 cot cu, them toolbar day du + panel Mục lục co dinh ben
// phai + box nut Preview/Xem bài viết/Lưu o goc duoi phai). Dung chung
// SeriesSkeleton (shimmer) voi cac trang doc Series khac (series-skeletons.tsx)
// de dong bo 1 kieu skeleton DUY NHAT trong toan bo khu vuc Series.
export default function EditSeriesEntryLoading() {
  return (
    <div>
      <SeriesSkeleton className="mb-4 h-3.5 w-28" />
      <SeriesSkeleton className="mb-6 h-7 w-2/5" />

      {/* Khop voi <form className="... xl:pr-72"> that - danh CHO khoang
          trong ben phai cho panel Mục lục, tranh skeleton "rong" hon noi
          dung that se hien ra ngay sau do (nhay layout luc chuyen tiep). */}
      <div className="flex min-w-0 flex-col gap-5 xl:pr-72">
        {/* Cac o form phia tren editor (tieu de/slug/icon/subtitle...). */}
        <div className="flex flex-col gap-2">
          <SeriesSkeleton className="h-3 w-20" />
          <SeriesSkeleton className="h-9 w-full" />
        </div>
        <div className="flex gap-3">
          <SeriesSkeleton className="h-9 w-1/2" />
          <SeriesSkeleton className="h-9 w-1/2" />
        </div>

        {/* Khoi editor - toolbar (nhieu nut vuong nho) + vung soan noi dung. */}
        <div className="rounded-lg border border-border bg-surface">
          <div className="flex flex-wrap items-center gap-1 border-b border-border p-1.5">
            {Array.from({ length: 18 }).map((_, i) => (
              <SeriesSkeleton key={i} className="size-7 shrink-0" />
            ))}
          </div>
          <div className="flex flex-col gap-3 p-3">
            <SeriesSkeleton className="h-4 w-11/12" />
            <SeriesSkeleton className="h-4 w-4/5" />
            <SeriesSkeleton className="h-4 w-3/5" />
            <SeriesSkeleton className="mt-2 h-28 w-full" />
            <SeriesSkeleton className="mt-2 h-4 w-11/12" />
            <SeriesSkeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>

      {/* Panel "Mục lục" co dinh ben phai - khop EntryHeadingsToc.tsx. */}
      <div className="fixed top-28 right-6 bottom-24 z-40 hidden w-56 flex-col gap-2 xl:flex">
        <SeriesSkeleton className="h-2.5 w-14" />
        <SeriesSkeleton className="mt-1 h-3 w-4/5" />
        <SeriesSkeleton className="h-3 w-3/5" />
        <SeriesSkeleton className="ml-3 h-3 w-3/5" />
        <SeriesSkeleton className="ml-3 h-3 w-1/2" />
        <SeriesSkeleton className="h-3 w-2/3" />
      </div>

      {/* Box nut goc duoi phai - khop cum Preview/Xem bài viết/Lưu Entry. */}
      <div className="fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-full bg-surface p-1.5 shadow-lg">
        <SeriesSkeleton className="h-9 w-24 rounded-full" />
        <SeriesSkeleton className="h-9 w-28 rounded-full" />
        <SeriesSkeleton className="h-9 w-24 rounded-full" />
      </div>
    </div>
  );
}
