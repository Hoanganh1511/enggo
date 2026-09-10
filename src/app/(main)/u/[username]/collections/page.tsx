import ProfileArticleGrid from "@/components/profile/ProfileArticleGrid";
import { ProfileSuggestionsRow } from "@/components/profile/ProfileSuggestionsRow";

// Tab "Bo suu tap" - chua co du lieu that, hien trang thai rong (khong
// gia lap noi dung). Nut tao khong duoc truyen -> ProfileContentHeader tu
// hien "Sắp có".
export default function ProfileCollectionsTabPage() {
  return (
    <>
      <ProfileArticleGrid
        heading="Bộ sưu tập"
        description="Tổng hợp những nội dung bạn muốn lưu lại để xem sau."
        posts={[]}
        createLabel="Bộ sưu tập"
      />
      <ProfileSuggestionsRow />
    </>
  );
}
