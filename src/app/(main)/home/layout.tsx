import { Suspense } from "react";
import HomeLayoutShell from "@/components/discover/HomeLayoutShell";
import HomeLayoutShellSkeleton from "@/components/discover/HomeLayoutShellSkeleton";
import { getFeedCategoryTree } from "@/lib/api/feed-categories";

// Layout rieng cho /home - truoc day gom chung voi /series, /contest duoi 1
// route group "(feed)/" de 3 trang dung CHUNG 1 instance HomeLayoutShell
// (tranh sidebar remount khi chuyen qua lai giua 3 trang). Gio /series va
// /contest KHONG con dung sidebar linh vuc nghe nghiep nay nua (chuyen ra
// khoi (main)/(feed), xem quyet dinh trong docs/engineering-log.md) nen
// route group do khong con ly do de gom nhieu route - rut gon lai thanh
// layout rieng, don gian cho DUY NHAT /home.
//
// Van tu boc <Suspense> rieng (khong await thang getFeedCategoryTree() o
// day) - giong pattern u/[username]/layout.tsx - de lan dau vao /home hien
// skeleton khop hinh dang thay vi spinner rong tran khung cua (main)/loading.tsx.
export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<HomeLayoutShellSkeleton />}>
      <HomeLayoutContent>{children}</HomeLayoutContent>
    </Suspense>
  );
}

async function HomeLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const categoryTree = await getFeedCategoryTree().catch(() => []);
  return (
    <HomeLayoutShell categoryTree={categoryTree}>{children}</HomeLayoutShell>
  );
}
