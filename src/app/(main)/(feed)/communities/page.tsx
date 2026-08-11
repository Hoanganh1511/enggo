import { listCommunitiesAction } from "@/actions/community/list-communities";
import { CommunityHeroBanner } from "@/components/discover/CommunityHeroBanner";
import { CommunityCampus3DLoader } from "@/components/discover/CommunityCampus3DLoader";
import { CreateCommunityButton } from "@/components/discover/CreateCommunityButton";

// Trang "Đi cùng mọi người" - danh sach Community THAT trong DB. Hero banner
// giu nguyen (trang tri, khong phu thuoc du lieu). Phan luoi the truoc day
// (CommunityDiscoveryCard) da duoc THAY THE bang scene 3D "Digital Campus"
// (CommunityCampus3D) - moi Community la 1 toa nha, click vao zoom-in
// cinematic roi dieu huong toi /communities/[slug]. Adapt tu prototype r3f
// rieng "treecareer-knowledge-building-interior" (chi lay man Campus, xem
// comment dau CommunityCampus3D.tsx).
//
// CommunityToolbar (category pills/sort/grid-list toggle) bi BO khi chuyen
// sang scene 3D - cac dieu khien do von la UI-shell chua gan logic that, va
// khong con hop voi 1 scene 3D (khong co "list view" de toggle sang).
//
// Nam trong route group "(feed)" (giong /home, /contest) de dung chung
// HomeLayoutShell (sidebar dieu huong 3 trang danh sach) - trang chi tiet
// /communities/[slug] nam NGOAI group nay, xem page.tsx tuong ung.
//
// Layout: 1 khung Campus 3D DUY NHAT chua toan bo community (truoc day co
// chia doi thanh 2 khung kep hero o giua - da gop lai theo yeu cau). Hero
// banner (ban compact, xem CommunityHeroBanner.tsx) nam tren dau campus.
export default async function CommunitiesListPage() {
  const communities = await listCommunitiesAction();
  const totalMembers = communities.reduce((sum, c) => sum + c.memberCount, 0);

  return (
    <div className="flex flex-col gap-6 pb-10">
      <CommunityHeroBanner totalMembers={totalMembers} compact />

      <section id="communities-grid">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight text-ink">
            Khám phá cộng đồng phù hợp với bạn ✨
          </h2>
          <CreateCommunityButton />
        </div>
        <CommunityCampus3DLoader communities={communities} />
      </section>
    </div>
  );
}
