import { SeriesSkeleton } from "./SeriesSkeleton";

// Bo skeleton layout THEO DUNG VI TRI cua tung khoi that (dac ta "skeleton
// screen" - khoi hinh hoc dat DUNG cho, khong phai 1 spinner chung chung) -
// xem 3 tang Suspense trong (read)/layout.tsx (Sidebar) + [entrySlug]/page.tsx
// (Header/Body/Toc/Extras). Moi ham la 1 layout THUAN (khong props, khong
// state) vi day chi la fallback tinh trong luc cho.

// Batch 1 - khung cay category/entry ben trai (xem SeriesSidebar.tsx thuc te:
// 1 dong tieu de category + vai dong entry thut le duoi).
export function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {[0, 1].map((group) => (
        <div key={group} className="flex flex-col gap-2">
          <SeriesSkeleton className="ml-2.5 h-3 w-20" />
          <div className="mt-1 flex flex-col gap-2 pl-4.5">
            <SeriesSkeleton className="h-3 w-32" />
            <SeriesSkeleton className="h-3 w-28" />
            <SeriesSkeleton className="h-3 w-36" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Batch 1 - breadcrumb + tieu de + subtitle cua 1 Entry (xem phan dau
// [entrySlug]/page.tsx thuc te).
export function EntryHeaderSkeleton() {
  return (
    <div className="font-content">
      <SeriesSkeleton className="h-3.5 w-56" />
      <SeriesSkeleton className="mt-3 h-8 w-3/4" />
      <SeriesSkeleton className="mt-2.5 h-4 w-1/2" />
    </div>
  );
}

// Batch 2 - than bai (nhieu dong van ban do rong khac nhau, mo phong 1 doan
// van + 1 khoi code/anh) - dat NGAY duoi EntryHeaderSkeleton, cung vi tri
// than bai that (DocsMarkdown).
export function EntryBodySkeleton() {
  return (
    <div className="mt-6 flex flex-col gap-3">
      <SeriesSkeleton className="h-4 w-full" />
      <SeriesSkeleton className="h-4 w-11/12" />
      <SeriesSkeleton className="h-4 w-4/5" />
      <SeriesSkeleton className="mt-2 h-32 w-full" />
      <SeriesSkeleton className="mt-2 h-4 w-full" />
      <SeriesSkeleton className="h-4 w-3/5" />
    </div>
  );
}

// Batch 2 - "On This Page" (aside ben phai, khop DocsToc.tsx: 1 nhan nho +
// vai dong muc luc).
export function EntryTocSkeleton() {
  return (
    <div className="flex flex-col gap-2 border-l border-border pl-3">
      <SeriesSkeleton className="h-2.5 w-16" />
      <SeriesSkeleton className="mt-1 h-3 w-28" />
      <SeriesSkeleton className="h-3 w-24" />
      <SeriesSkeleton className="h-3 w-32" />
    </div>
  );
}

// Batch 3 - Cai dat/Chia se/Prev-Next (nhom cuoi trang, it quan trong nhat -
// xem SeriesInstallWidget/SeriesShareButtons/SeriesEntryPagination).
export function EntryExtrasSkeleton() {
  return (
    <div className="mt-8 flex flex-col gap-6">
      <div className="flex gap-2">
        <SeriesSkeleton className="h-8 w-8 rounded-full" />
        <SeriesSkeleton className="h-8 w-8 rounded-full" />
        <SeriesSkeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="flex gap-3">
        <SeriesSkeleton className="h-16 flex-1" />
        <SeriesSkeleton className="h-16 flex-1" />
      </div>
    </div>
  );
}

// Batch 3 - "Where this fits" (aside ben phai, duoi TOC).
export function EntryWhereFitsSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <SeriesSkeleton className="h-2.5 w-24" />
      <SeriesSkeleton className="h-3 w-full" />
      <SeriesSkeleton className="h-3 w-4/5" />
    </div>
  );
}
