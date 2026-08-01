import FollowListSkeleton from "@/components/profile/FollowListSkeleton";

// KHONG boc them SectionContainer o day - {children} da nam san trong 1 lop
// SectionContainer cua ProfileShell.tsx roi, boc them se bi cong don padding
// ngang (mx-auto + max-width x 2), lech han so voi luc co du lieu that.
// Ghi de loading.tsx feed-skeleton chung o layout tren (khong khop layout
// sidebar+luoi cua trang nay) - Next.js uu tien loading.tsx gan segment nhat.
export default function ProfileFollowingLoading() {
  return <FollowListSkeleton />;
}
