import ProfileArticleGrid from "@/components/profile/ProfileArticleGrid";
import { ProfileSuggestionsRow } from "@/components/profile/ProfileSuggestionsRow";

// Tab "Danh sach phat" - chua co du lieu that, hien trang thai rong (khong
// gia lap noi dung). Nut tao/subTabs khong duoc truyen -> ProfileContentHeader
// tu hien "Sắp có".
export default function ProfilePlaylistsTabPage() {
  return (
    <>
      <ProfileArticleGrid
        heading="Danh sách phát"
        description="Sắp xếp bài viết, ý tưởng thành các danh sách theo chủ đề."
        posts={[]}
        createLabel="Danh sách phát"
      />
      <ProfileSuggestionsRow />
    </>
  );
}
