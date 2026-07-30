import ProfileFeedBox from "@/components/profile/ProfileFeedBox";

// Tab "Danh sach phat" - chua co du lieu that, hien trang thai rong (khong
// gia lap noi dung).
export default function ProfilePlaylistsTabPage() {
  return <ProfileFeedBox heading="Danh sách phát" posts={[]} />;
}
