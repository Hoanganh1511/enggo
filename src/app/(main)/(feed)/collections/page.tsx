import { auth } from "@/auth";
import { listPublicCollectionsAction } from "@/actions/discover/collections/list-public-collections";
import { CollectionsHero } from "@/components/discover/articles-hub/CollectionsHero";
import { CollectionsBrowseView } from "@/components/discover/articles-hub/CollectionsBrowseView";

// /collections - trang KHAM PHA "Bo suu tap cua moi nguoi" (khac han
// /u/[username]/collections la tab quan ly bo suu tap CUA RIENG 1 nguoi,
// van giu nguyen CollectionCard.tsx/CollectionsGrid.tsx cu, token app
// chinh). Trang nay CONG KHAI - khong redirect /login (giong /articles,
// /home hien tai), chi hanh dong Theo dõi/Tạo mới moi can dang nhap (xem
// CollectionsSidebarFilters.tsx). Server Component thuan + 1 client island
// duy nhat (CollectionsBrowseView.tsx).
export default async function CollectionsPage() {
  const session = await auth();
  const viewerUsername = session?.username ?? null;

  const initial = await listPublicCollectionsAction({ scope: "all" }).catch(
    () => ({
      items: [],
      nextCursor: null,
      facets: { topics: [], allCount: 0, followingCount: 0 },
    }),
  );

  return (
    <div>
      <CollectionsHero />
      <CollectionsBrowseView
        initial={initial}
        isLoggedIn={Boolean(viewerUsername)}
        viewerUsername={viewerUsername}
      />
    </div>
  );
}
