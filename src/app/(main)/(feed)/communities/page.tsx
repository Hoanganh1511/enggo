import { listCommunitiesAction } from "@/actions/community/list-communities";
import { CommunityDiscoveryCard } from "@/components/discover/CommunityDiscoveryCard";
import { CommunityHeroBanner } from "@/components/discover/CommunityHeroBanner";
import { CommunityStatsBar } from "@/components/discover/CommunityStatsBar";
import { CommunityToolbar } from "@/components/discover/CommunityToolbar";
import { CreateCommunityButton } from "@/components/discover/CreateCommunityButton";

// Trang "Đi cùng mọi người" - danh sach Community THAT trong DB. Khong con
// khai niem "Series" rieng (lo trinh hoc/progress/reward/difficulty) nua -
// series-mock.ts va toan bo UI dua tren no da bi xoa, moi thu gio la
// Community. Phan giao dien trang tri (Hero/StatsBar/Toolbar) duoc PORT LAI
// nguyen ven tu FeaturedSeriesBanner/SeriesStatsBar/SeriesToolbar cu (noi
// dung cac component do 100% tinh/trang tri, khong phu thuoc du lieu Series
// nao ca nen khong mat gi khi chuyen sang Community) - chi rieng luoi the
// (CommunityDiscoveryCard) la viet lai hoan toan vi CommunityCard cu dua vao
// nhieu field Series khong ton tai o Community (coverImageUrl/difficulty/
// duration/reward).
//
// Nam trong route group "(feed)" (giong /home, /contest) de dung chung
// HomeLayoutShell (sidebar dieu huong 3 trang danh sach) - trang chi tiet
// /communities/[slug] nam NGOAI group nay, xem page.tsx tuong ung.
export default async function CommunitiesListPage() {
  const communities = await listCommunitiesAction();
  const totalMembers = communities.reduce((sum, c) => sum + c.memberCount, 0);

  return (
    <div className="flex flex-col gap-6 pb-10">
      <CommunityHeroBanner totalMembers={totalMembers} />

      <CommunityStatsBar />

      <section id="communities-grid">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight text-ink">
            Khám phá cộng đồng phù hợp với bạn ✨
          </h2>
          <CreateCommunityButton />
        </div>
        <CommunityToolbar />
        {communities.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-faint">
            Chưa có cộng đồng nào.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {communities.map((community) => (
              <CommunityDiscoveryCard key={community.slug} community={community} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
