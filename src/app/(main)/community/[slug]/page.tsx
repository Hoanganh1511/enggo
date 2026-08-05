import { notFound } from "next/navigation";
import { getCommunityBySlug } from "@/content/community-mock";
import { SERIES, RECOMMENDED_SERIES } from "@/content/series-mock";
import { CommunityWorkspace } from "@/components/community/CommunityWorkspace";

// Trang chi tiet 1 Community - MOCK HOAN TOAN (chua co model/endpoint that,
// xem content/community-mock.ts). Da lam lai hoan toan theo thiet ke kenh
// chat (Discord/Slack-style): giao dien MEMBER (kenh + tin nhan) hoac ADMIN
// (duyet yeu cau tham gia + tong quan), re nhanh qua community.isOwner - xem
// CommunityWorkspace.tsx va quyet dinh trong docs/engineering-log.md.
//
// Layout 3 cot RIENG cua no (KHONG dung HomeLayoutShell/(feed) group - noi
// dung o day la kenh/quan tri rieng cua 1 cong dong, khac han bo loc linh
// vuc nghe nghiep cua feed chinh) nen nam thang duoi (main), chi thua huong
// TopHeaderBar + MainContentArea tu (main)/layout.tsx.
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
    // "h-full" (khong phai flex-1 don thuan) + "overflow-hidden" - trang nay
    // luon KHIT DUNG chieu cao vung noi dung (MainContentArea), khong tu no
    // cuon: cac cot ben trong (sidebar/kenh chat/panel phai) tu co
    // overflow-y-auto RIENG (xem CommunityWorkspace.tsx va cac component
    // con), giong dung hanh vi Discord/Slack thay vi cuon ca trang.
    <div className="h-full min-w-0 overflow-hidden ">
      <CommunityWorkspace community={community} />
    </div>
  );
}
