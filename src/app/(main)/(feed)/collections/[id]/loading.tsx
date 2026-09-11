import Skeleton from "@/components/ui/skeleton";

// Route-level Suspense fallback cho /collections/[id] - khop dung khung
// that trong page.tsx: back link + anh bia ti le 3/1 + tieu de/mo ta/thong
// tin (so bai/rieng tu-cong khai/cap nhat) + luoi NoteCard.tsx 4 cot. KHONG
// gioi han max-w (page.tsx that cung chi "w-full", layout cha (feed)/layout.tsx
// khong co max-width) - truoc day co max-w-5xl khien skeleton hep hon han
// trang that luc noi dung load xong, gay "nhay" layout ro ret.
export default function CollectionDetailLoading() {
  return (
    <div className="w-full">
      <Skeleton className="h-4 w-20" />

      <Skeleton className="mt-4 aspect-3/1 w-full rounded-xl" />

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-7 w-64 max-w-full" />
          <Skeleton className="mt-2 h-4 w-full max-w-md" />
          <div className="mt-3 flex items-center gap-2">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-3.5 w-28" />
          </div>
        </div>
        <Skeleton className="h-9 w-24 shrink-0 rounded-full" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="aspect-16/10 w-full rounded-lg" />
            <Skeleton className="mt-2.5 h-4 w-full" />
            <Skeleton className="mt-1.5 h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
