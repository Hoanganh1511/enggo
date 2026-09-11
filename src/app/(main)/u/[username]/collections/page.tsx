import { auth } from "@/auth";
import { listUserCollectionsAction } from "@/actions/discover/collections/list-user-collections";
import { CollectionsGrid } from "@/components/collections/CollectionsGrid";
import { ProfileSuggestionsRow } from "@/components/profile/ProfileSuggestionsRow";

// Tab "Bo suu tap" - da noi du lieu THAT (truoc day hard-code posts={[]}).
// Chi hien bo sung tap CONG KHAI neu xem profile nguoi khac (backend tu loc
// qua listUserCollectionsAction, xem PostCollectionService.listByUsername) -
// chinh chu xem thi thay ca Rieng tu. canCreate CHI true khi dung chinh chu
// profile nay (khong tao thay bo suu tap cho nguoi khac duoc).
export default async function ProfileCollectionsTabPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);
  const [collections, session] = await Promise.all([
    listUserCollectionsAction(decodedUsername).catch(() => []),
    auth(),
  ]);
  const isSelf = session?.username === decodedUsername;

  return (
    <>
      <CollectionsGrid
        heading="Bộ sưu tập"
        description="Tổng hợp những nội dung bạn muốn lưu lại để xem sau."
        collections={collections}
        canCreate={isSelf}
      />
      {collections.length === 0 && <ProfileSuggestionsRow />}
    </>
  );
}
