import Skeleton from "@/components/ui/skeleton";

// Fallback cho DUNG luc getFeedCategoryTree() dang fetch trong home/layout.tsx,
// series/layout.tsx, contest/layout.tsx (moi cai await THANG, khong Suspense
// rieng truoc day - khien ca sidebar LAN noi dung bien mat, roi (main)/loading.tsx
// (spinner rong tran khung) hien thay - day la nguyen nhan "nhay toan bo
// trang" khi chuyen sang /series). Khop dung khung flex + w-56 cua sidebar
// that (xem HomeLayoutShell.tsx, HomeSidebar.tsx) de khong lech layout (CLS)
// giua luc fallback va luc shell that render xong.
export default function HomeLayoutShellSkeleton() {
  return (
    <div className="flex min-w-0 flex-1 gap-6 px-4 pt-4">
      <aside className="flex w-56 shrink-0 flex-col gap-1">
        <Skeleton className="h-8 w-full rounded-md" />
        <div className="mt-3 flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full rounded-md" />
          ))}
        </div>
      </aside>
      <div className="min-w-0 flex-1 rounded-md">
        <div className="flex flex-col gap-10">
          {Array.from({ length: 2 }).map((_, i) => (
            <section key={i}>
              <Skeleton className="mb-4 h-6 w-48 rounded-md" />
              <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton
                    key={j}
                    className="aspect-1280/670 w-56 shrink-0 rounded-xl"
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
