import Skeleton from "@/components/ui/skeleton";

// Khop DUNG kich thuoc/bo cuc that cua FollowListView.tsx - dung LAI y het
// class container (padding/gap/w-56/rounded-lg...) cua component that, chi
// doi phan chu/anh sang Skeleton, de khong bi lech 1px nao luc chuyen tu
// skeleton sang du lieu that.
export default function FollowListSkeleton() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      {/* Luoi the - dung y het FollowCard that: p-3 gap-3 border rounded-lg,
          avatar size-12, ten h-3.5, username h-3, nut h-8 */}
      <div className="min-w-0 flex-1">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-lg shadow-xs bg-surface p-3"
            >
              <Skeleton className="size-12 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-3.5 w-24 rounded-md" />
                <Skeleton className="mt-1.5 h-3 w-16 rounded-md" />
              </div>
              <Skeleton className="h-8 w-16 shrink-0 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
