import Skeleton from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
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
  );
}
