import { notFound } from "next/navigation";
import { getCommunityBySlug } from "@/content/community-mock";
import { SERIES, RECOMMENDED_SERIES } from "@/content/series-mock";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { CommunitySidebarLeft } from "@/components/community/CommunitySidebarLeft";
import { CommunitySidebarRight } from "@/components/community/CommunitySidebarRight";
import { CommunityMainTabs } from "@/components/community/CommunityMainTabs";
import { CommunityComposer } from "@/components/community/CommunityComposer";
import { CommunityFeed } from "@/components/community/CommunityFeed";

// Trang chi tiet 1 Community - MOCK HOAN TOAN (chua co model/endpoint that,
// xem content/community-mock.ts). Layout 3 cot RIENG cua no (KHONG dung
// HomeLayoutShell/(feed) group - sidebar o day la dieu huong noi bo 1 cong
// dong, khac han bo loc linh vuc nghe nghiep cua feed chinh) nen nam thang
// duoi (main), chi thua huong TopHeaderBar + MainContentArea tu (main)/layout.tsx.
//
// Avatar composer dung 1 seed pravatar co dinh ("current-user") thay vi goi
// auth() that - trang nay 100% mock nen khong ket noi session that, tranh ca
// lam segment nay bi coi la dynamic vi 1 lan await auth() khong can thiet
// (xem ly do trong current-user.tsx).
export default async function CommunityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Card series o "Đi cùng mọi người" dan thang toi day, dung slug cua chinh
  // series - can truyen ca SERIES lan RECOMMENDED_SERIES de getCommunityBySlug
  // sinh Community cho nhung slug chua co ban bien soan tay (xem
  // community-mock.ts).
  const allSeries = [...SERIES, ...RECOMMENDED_SERIES.map((r) => r.series)];
  const community = getCommunityBySlug(slug, allSeries);
  if (!community) notFound();

  return (
    <div className="flex min-w-0 flex-1 gap-6 px-4 pt-4 pb-10">
      <CommunitySidebarLeft community={community} />

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <CommunityHeader community={community} />
        <CommunityMainTabs />
        <CommunityComposer currentUserAvatarUrl="https://i.pravatar.cc/80?u=current-user" />
        <CommunityFeed posts={community.posts} />
      </div>

      <CommunitySidebarRight community={community} />
    </div>
  );
}
