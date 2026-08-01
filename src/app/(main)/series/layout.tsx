import HomeLayoutShell from "@/components/discover/HomeLayoutShell";
import { getFeedCategoryTree } from "@/lib/api/feed-categories";

// Dung CHUNG shell voi /home (xem home/layout.tsx) de sidebar trai khong
// bien mat khi sang trang "Đi cùng mọi người". Cac bo loc trong sidebar
// (group/field/type) van chi thuoc ve feed bai viet - bam vao chung khi dang
// o day se dieu huong ve /home kem query tuong ung (xem pushParams trong
// HomeLayoutShell.tsx).
export default async function SeriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categoryTree = await getFeedCategoryTree().catch(() => []);
  return (
    <HomeLayoutShell categoryTree={categoryTree}>{children}</HomeLayoutShell>
  );
}
