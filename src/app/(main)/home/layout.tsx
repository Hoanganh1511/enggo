import HomeLayoutShell from "@/components/discover/HomeLayoutShell";
import { getFeedCategoryTree } from "@/lib/api/feed-categories";

// Layout cho trang Home duy nhat (page.tsx, dieu khien qua query param
// group/field/type) - xem HomeLayoutShell.tsx de biet ly do dat search
// bar/composer/cot phai o day thay vi trong page.
//
// Cay linh vuc nghe nghiep fetch o DAY (server component) roi truyen xuong:
// apiFetch dung auth() nen chi chay duoc phia server, khong goi thang tu
// HomeSidebar ("use client") duoc.
export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categoryTree = await getFeedCategoryTree().catch(() => []);
  return (
    <HomeLayoutShell categoryTree={categoryTree}>{children}</HomeLayoutShell>
  );
}
