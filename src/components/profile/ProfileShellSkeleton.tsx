import Skeleton from "@/components/ui/skeleton";
import SectionContainer from "@/components/ui/section-container";

// Fallback cho DUNG luc dang fetch profile o layout.tsx (lan dau vao trang
// profile) - khac voi [username]/loading.tsx (chi la skeleton cho {children},
// khong the hien ra trong luc nay vi layout.tsx chua render xong). Khop
// khung sidebar note.com that (ProfileSidebar.tsx: card avatar 72px, sidebar
// w-72) + tab ngang (ProfileTabBar.tsx) de khong bi giat khi chuyen tu
// skeleton sang noi dung that.
export default function ProfileShellSkeleton() {
  return (
    <SectionContainer as="div" maxWidth="7xl" className="flex gap-6 py-6">
      <div className="hidden w-72 shrink-0 flex-col gap-4 lg:flex">
        <div className="rounded-lg border border-border bg-surface p-5">
          <Skeleton className="size-18 rounded-full" />
          <Skeleton className="mt-3 h-5 w-32 rounded-md" />
          <Skeleton className="mt-2 h-3.5 w-full rounded-md" />
          <Skeleton className="mt-1.5 h-3.5 w-2/3 rounded-md" />
          <Skeleton className="mt-4 h-10 w-full rounded-full" />
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="mt-2 h-3.5 w-full rounded-md" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex gap-4 border-b border-border pb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-16 rounded-md" />
          ))}
        </div>
        <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-1280/670 w-full rounded-xl" />
              <Skeleton className="mt-2 h-4 w-full rounded-md" />
              <Skeleton className="mt-1.5 h-4 w-2/3 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
