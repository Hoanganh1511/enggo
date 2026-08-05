import { Suspense } from "react";
import HomeLayoutShell from "@/components/discover/HomeLayoutShell";
import HomeLayoutShellSkeleton from "@/components/discover/HomeLayoutShellSkeleton";
import { getFeedCategoryTree } from "@/lib/api/feed-categories";

// Route group "(feed)" - KHONG xuat hien trong URL (/home, /series, /contest
// giu nguyen), chi gom 3 trang DANH SACH nay duoi 1 layout.tsx sidebar
// DUY NHAT (tranh sidebar remount khi chuyen qua lai giua 3 trang, xem
// quyet dinh 2026-08-03). Cac trang CHI TIET (/series/[slug], /contest/[slug])
// CO Y DAT NGOAI group nay (xem series/[slug]/page.tsx, contest/[slug]/page.tsx
// o (main)/ truc tiep, khong phai (main)/(feed)/) - detail KHONG can sidebar
// bo loc linh vuc nghe nghiep (bo loc chi co nghia voi danh sach), day la
// cach dung route group de 1 phan cua "series"/"contest" co sidebar, phan
// con lai (chi tiet) khong co, ma khong can boc/un-boc layout thu cong.
//
// Van tu boc <Suspense> rieng (khong await thang getFeedCategoryTree() o
// day) - giong pattern u/[username]/layout.tsx - de lan dau vao 1 trong 3
// trang danh sach nay hien skeleton khop hinh dang thay vi spinner rong tran
// khung cua (main)/loading.tsx.
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
