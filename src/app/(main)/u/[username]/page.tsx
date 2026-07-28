import { notFound } from "next/navigation";
import { getProfileByUsername } from "@/content/user-profile";
import ProfileView from "@/components/profile/ProfileView";

type PageProps = {
  params: Promise<{ username: string }>;
};

// Trang profile cong khai - dinh tuyen theo @username (KHONG theo user id):
// id la UUID noi bo, khong nen lo ra URL (xem muc 4.1 trong
// career-tree-api/docs/user-schema-design.md).
//
// Du lieu hien lay tu mock (src/content/user-profile.ts). Khi noi backend
// that: doi getProfileByUsername thanh 1 Server Action goi API, va bo sung
// kiem tra quyen xem theo profileVisibility + quan he follow/block truoc khi
// tra du lieu (chong IDOR).
export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;
  const profile = getProfileByUsername(decodeURIComponent(username));

  if (!profile) notFound();

  return <ProfileView profile={profile} />;
}
