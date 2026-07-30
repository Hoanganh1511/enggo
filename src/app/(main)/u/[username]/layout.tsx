import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProfileByUsername } from "@/lib/api/users";
import ProfileShell from "@/components/profile/ProfileShell";
import ProfileShellSkeleton from "@/components/profile/ProfileShellSkeleton";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
};

// Layout dung chung cho tat ca tab cua 1 profile (home/posts/playlists/
// collections/likes/history - xem cac page.tsx con) - fetch profile 1 LAN o
// day, ProfileHeader/ProfileNav/sidebar/footer nam trong ProfileShell KHONG
// bi remount khi doi tab (dac tinh layout.tsx cua App Router, giong
// HomeLayoutShell). "children" chi la noi dung feed rieng cua tung tab, moi
// tab la 1 route that (/u/[username]/<tab>) de mang duoc username tren URL.
//
// Phan fetch duoc tach rieng ra ProfileLayoutContent + tu boc <Suspense> -
// vi loading.tsx (nested INSIDE layout.tsx theo quy uoc Next.js) chi hien ra
// SAU KHI layout.tsx render xong, nen neu await ngay o day (khong Suspense
// rieng) thi luc dang fetch KHONG CO GI de ve ca (ke ca loading.tsx), trinh
// duyet tu hien spinner mac dinh cua no thay vi skeleton. Fallback nay
// (ProfileShellSkeleton) chi hien 1 lan duy nhat luc vao trang profile lan
// dau - chuyen tab con sau do khong remount layout nen khong suspend lai.
export default function ProfileLayout({ children, params }: LayoutProps) {
  return (
    <Suspense fallback={<ProfileShellSkeleton />}>
      <ProfileLayoutContent params={params}>{children}</ProfileLayoutContent>
    </Suspense>
  );
}

async function ProfileLayoutContent({
  children,
  params,
}: LayoutProps) {
  const { username } = await params;
  const profile = await getProfileByUsername(
    decodeURIComponent(username),
  ).catch(() => null);

  if (!profile) notFound();

  return <ProfileShell profile={profile}>{children}</ProfileShell>;
}
