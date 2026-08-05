import { SectionSkeleton } from "@/components/discover/home-feed/EditorialFeed";

// Route-level Suspense fallback (Next tu bao boc page.tsx trong Suspense
// dung file nay) - hien khi server dang fetch posts. Dung lai SectionSkeleton
// cua EditorialFeed de dung hinh dang thuc te (carousel the anh), khop token
// mau bg-surface-muted cua design system thay vi hardcode white/N nhu ban cu.
export default function HomeFeedLoading() {
  return (
    <div className="flex flex-col gap-10">
      <SectionSkeleton />
      <SectionSkeleton />
      <SectionSkeleton />
    </div>
  );
}
