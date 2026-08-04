import { Suspense } from "react";
import HomeLayoutShell from "@/components/discover/HomeLayoutShell";
import HomeLayoutShellSkeleton from "@/components/discover/HomeLayoutShellSkeleton";
import { getFeedCategoryTree } from "@/lib/api/feed-categories";

// Route group "(feed)" - KHONG xuat hien trong URL (/home, /series, /contest
// giu nguyen), chi dung de gom 3 route nay duoi 1 layout.tsx THAT DUY NHAT.
// Truoc day moi route co layout.tsx rieng (dung chung component
// HomeLayoutShell nhung la 3 INSTANCE khac nhau) - Next.js coi day la 3 cay
// segment doc lap nen sidebar bi remount + nhay skeleton moi lan chuyen giua
// /home <-> /series <-> /contest. Gom vao 1 layout that o day thi sidebar
// (HomeLayoutShell/HomeSidebar) chi mount 1 LAN DUY NHAT va giu nguyen khi
// dieu huong qua lai giua 3 trang con, dung y goc cua comment cu "sidebar
// khong bien mat khi chuyen giua cac trang" (truoc day chua that su dat
// duoc, chi la du dinh).
//
// Van tu boc <Suspense> rieng (khong await thang getFeedCategoryTree() o
// day) - giong pattern u/[username]/layout.tsx - de lan dau vao 1 trong 3
// route nay hien skeleton khop hinh dang thay vi spinner rong tran khung cua
// (main)/loading.tsx.
export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<HomeLayoutShellSkeleton />}>
      <FeedLayoutContent>{children}</FeedLayoutContent>
    </Suspense>
  );
}

async function FeedLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const categoryTree = await getFeedCategoryTree().catch(() => []);
  return (
    <HomeLayoutShell categoryTree={categoryTree}>{children}</HomeLayoutShell>
  );
}
