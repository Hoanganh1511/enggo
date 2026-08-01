import Skeleton from "@/components/ui/skeleton";
import SectionContainer from "@/components/ui/section-container";

// Fallback cho DUNG luc dang fetch profile o layout.tsx (lan dau vao trang
// profile) - khac voi [username]/loading.tsx (chi la skeleton cho {children},
// khong the hien ra trong luc nay vi layout.tsx chua render xong). Khop kich
// thuoc that cua ProfileHeader (cover h-60, avatar size-24) + ProfileNav
// (hang tab + so lieu ben phai).
export default function ProfileShellSkeleton() {
  return (
    <div className="-mt-4 bg-surface">
      <div className="relative h-60 w-full overflow-hidden bg-surface-muted">
        <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
        <SectionContainer as="div" className="absolute inset-x-0 bottom-0 pb-4">
          <div className="flex items-end gap-4">
            <Skeleton className="size-24 shrink-0 rounded-full border-4 border-surface" />
            <div className="flex min-w-0 flex-1 items-end justify-between gap-3 pb-1">
              <div className="min-w-0">
                <Skeleton className="h-7 w-48 rounded-md" />
                <Skeleton className="mt-2 h-3.5 w-32 rounded-md" />
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Skeleton className="h-9 w-24 rounded-md" />
                <Skeleton className="h-9 w-24 rounded-md" />
                <Skeleton className="size-9 rounded-md" />
              </div>
            </div>
          </div>
        </SectionContainer>
      </div>

      <div className="border-y border-border bg-surface">
        <SectionContainer as="div" className="flex items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-16 rounded-md" />
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <Skeleton className="h-3.5 w-20 rounded-md" />
            <Skeleton className="h-3.5 w-20 rounded-md" />
            <Skeleton className="hidden h-3.5 w-32 rounded-md sm:block" />
          </div>
        </SectionContainer>
      </div>

      <SectionContainer as="div" className="py-4">
        <div className="rounded-lg border border-border bg-surface">
          <div className="border-b border-border px-4 py-3">
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="divide-y divide-border px-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 py-4">
                <Skeleton className="size-9 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="mt-2 h-3.5 w-full" />
                  <Skeleton className="mt-1.5 h-3.5 w-4/5" />
                  <Skeleton className="mt-3 h-40 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionContainer>
    </div>
  );
}
