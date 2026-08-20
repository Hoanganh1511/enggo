import Skeleton from "@/components/ui/skeleton";

// Fallback cho DUNG luc dang fetch profile o layout.tsx (lan dau vao trang
// profile) - khac voi [username]/loading.tsx (chi la skeleton cho {children},
// khong the hien ra trong luc nay vi layout.tsx chua render xong). Khop
// khung sidebar navy that (ProfileSidebar.tsx: avatar size-[132px], sidebar
// w-[240px]) de khong bi giat khi chuyen tu skeleton sang noi dung that.
export default function ProfileShellSkeleton() {
  return (
    <div className="flex min-h-[calc(100vh-5.5rem)] bg-[#f8f8f5]">
      <div className="hidden w-[240px] shrink-0 flex-col bg-[#111b2d] p-5 lg:flex">
        <Skeleton className="mx-auto size-[132px] rounded-full bg-white/10" />
        <Skeleton className="mx-auto mt-4 h-5 w-32 rounded-md bg-white/10" />
        <Skeleton className="mx-auto mt-2 h-3 w-20 rounded-md bg-white/10" />
        <Skeleton className="mx-auto mt-5 h-9 w-full rounded-full bg-white/10" />
        <div className="mt-5 grid grid-cols-3 gap-2 border-y border-white/10 py-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="mx-auto h-8 w-12 rounded-md bg-white/10" />
          ))}
        </div>
        <div className="mt-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-xl bg-white/10" />
          ))}
        </div>
      </div>

      <div className="min-w-0 flex-1 px-5 py-8 lg:px-8">
        <Skeleton className="h-8 w-64 rounded-md" />
        <Skeleton className="mt-2 h-3.5 w-80 rounded-md" />
        <Skeleton className="mt-5 h-[400px] w-full rounded-2xl" />
      </div>
    </div>
  );
}
