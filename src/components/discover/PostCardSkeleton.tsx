import Skeleton from "@/components/ui/skeleton";

// Skeleton khop dung 2 bien the that cua PostCard.tsx (xem file do):
// "card" - the doc lap co vien/bo goc, badge kind dan dau, tac gia lui xuong
// footer; "timeline" - hang thuong, avatar 40px + ten/username/thoi gian dan
// dau cung 1 hang.
const PostCardSkeleton = ({
  variant = "timeline",
  bodyHeight = "h-24",
}: {
  variant?: "timeline" | "card";
  bodyHeight?: string;
}) => {
  if (variant === "card") {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Skeleton className="size-5 rounded-full" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
          <Skeleton className="size-5 rounded-md" />
        </div>

        <div className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-4/5" />
        </div>
        <Skeleton className={`w-full rounded-md ${bodyHeight}`} />

        <div className="flex items-center gap-1.5 border-t border-border pt-3">
          <Skeleton className="size-6 shrink-0 rounded-full" />
          <Skeleton className="h-3 w-24 rounded-md" />
          <Skeleton className="h-2.5 w-10 rounded-md" />
        </div>

        <div className="flex items-center gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-3.5 w-8 rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 py-4">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3.5 w-28 rounded-md" />
          <Skeleton className="h-3 w-16 rounded-md" />
          <Skeleton className="h-3 w-10 rounded-md" />
        </div>
        <div className="mt-2 flex flex-col gap-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-3/5" />
        </div>
        <div className="mt-3 flex items-center gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-3.5 w-8 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostCardSkeleton;
