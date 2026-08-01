import HomeLayoutShell from "@/components/discover/HomeLayoutShell";
import { getFeedCategoryTree } from "@/lib/api/feed-categories";

// Dung CHUNG shell voi /home va /series de sidebar trai khong bien mat khi
// sang trang "Chủ đề & Cuộc thi".
export default async function ContestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categoryTree = await getFeedCategoryTree().catch(() => []);
  return (
    <HomeLayoutShell categoryTree={categoryTree}>{children}</HomeLayoutShell>
  );
}
