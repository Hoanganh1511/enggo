import { notFound } from "next/navigation";
import { CommunityWorkspace } from "@/components/community/CommunityWorkspace";
import { getCommunityAction } from "@/actions/community/get-community";
import { adaptCommunity } from "@/lib/community/adapt";
import { ApiError } from "@/lib/api/client";

// Trang chi tiet 1 Community - DU LIEU THAT tu career-tree-api (khong con la
// mock nua, xem CommunityAccessService/CommunityService). Giao dien MEMBER
// (kenh + tin nhan) hoac ADMIN (duyet yeu cau tham gia + tong quan), re nhanh
// qua community.isOwner (suy tu viewer.role that tra ve tu server, khong con
// bia) - xem CommunityWorkspace.tsx.
//
// Route so nhieu "/communities/[slug]" (doi tu "/community/[slug]" cu) de
// khop dung convention backend (moi endpoint deu la /communities/...).
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
  let community;
  try {
    const api = await getCommunityAction(slug);
    community = adaptCommunity(api);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
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
