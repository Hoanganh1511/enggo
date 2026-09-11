import { auth } from "@/auth";
import { listPublicCollectionsAction } from "@/actions/discover/collections/list-public-collections";
import { listMyCollectionsAction } from "@/actions/discover/collections/list-my-collections";
import { CollectionsHero } from "@/components/discover/articles-hub/CollectionsHero";
import { MyCollectionsSection } from "@/components/discover/articles-hub/MyCollectionsSection";
import { CollectionsBrowseView } from "@/components/discover/articles-hub/CollectionsBrowseView";

// /collections - trang KHAM PHA "Bo suu tap cua moi nguoi" (khac han
// /u/[username]/collections la tab quan ly bo suu tap CUA RIENG 1 nguoi,
// van giu nguyen CollectionCard.tsx/CollectionsGrid.tsx cu, token app
// chinh). Trang nay CONG KHAI - khong redirect /login (giong /home hien
// tai; /articles va /tracking thi bi KHOA HOAN TOAN - moi tai khoan, xem
// layout.tsx tuong ung), chi hanh dong Theo dõi/Tạo mới/khu "Bộ sưu tập của
// tôi" moi can dang nhap (xem CollectionsSidebarFilters.tsx/
// MyCollectionsSection.tsx). Server Component thuan + 2 client island
// (MyCollectionsSection.tsx, CollectionsBrowseView.tsx).
export default async function CollectionsPage() {
  const session = await auth();
  const viewerUsername = session?.username ?? null;

  const [initial, myCollections] = await Promise.all([
    listPublicCollectionsAction({ scope: "all" }).catch(() => ({
      items: [],
      nextCursor: null,
      facets: { topics: [], allCount: 0, followingCount: 0 },
    })),
    viewerUsername ? listMyCollectionsAction().catch(() => []) : Promise.resolve([]),
  ]);

  return (
    <div>
      <CollectionsHero />
      {viewerUsername && (
        <MyCollectionsSection
          username={viewerUsername}
          initialCollections={myCollections}
        />
      )}
      <CollectionsBrowseView
        initial={initial}
        isLoggedIn={Boolean(viewerUsername)}
        viewerUsername={viewerUsername}
      />
    </div>
  );
}
