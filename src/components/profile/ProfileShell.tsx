"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import ProfileHeader from "./ProfileHeader";
import ProfileNav from "./ProfileNav";
import ProfileFooter from "./ProfileFooter";
import SectionContainer from "@/components/ui/section-container";
import ProfileSidePanel from "./ProfileSidePanel";
import { UserProfileApiShape } from "@/lib/api/users";
import {
  followUserAction,
  unfollowUserAction,
} from "@/actions/discover/follow-user";

// Khung chung quanh moi tab cua trang profile (xem [username]/layout.tsx) -
// ProfileHeader + ProfileNav (gio la Link that, mang username tren URL) +
// sidebar + footer nam O DAY, "children" la noi dung feed rieng cua tung tab
// (page.tsx con). State follow (following/followerCount/pending) so huu O
// DAY vi ProfileHeader (nut bam) va ProfileNav (hien so) deu can dung chung,
// khong duoc moi noi tu quan ly rieng se bi lech nhau.
//
// Tab "Workspace" KHONG con la 1 route con o day nua (da chuyen sang
// /workspace/[username], route doc lap - xem WorkspaceSwitcher.tsx), nen
// ProfileShell luon hien cover/user-info/ProfileNav binh thuong, khong can
// co che "focus" (an di) nhu truoc.
const ProfileShell = ({
  profile,
  children,
}: {
  profile: UserProfileApiShape;
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [following, setFollowing] = useState(profile.isFollowing);
  const [followerCount, setFollowerCount] = useState(profile.followerCount);
  const [pending, setPending] = useState(false);

  const activeHref = isPending && pendingHref ? pendingHref : pathname;

  function handleNavClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (pathname === href) return;
    setPendingHref(href);
    startTransition(() => router.push(href));
  }

  async function handleToggleFollow() {
    const next = !following;
    setFollowing(next); // optimistic
    setFollowerCount((c) => c + (next ? 1 : -1)); // optimistic

    setPending(true);
    try {
      await (next
        ? followUserAction(profile.username!)
        : unfollowUserAction(profile.username!));
    } catch {
      setFollowing(!next); // rollback neu API loi
      setFollowerCount((c) => c + (next ? -1 : 1)); // rollback
    } finally {
      setPending(false);
    }
  }

  return (
    // min-h tinh bang 100vh tru chieu cao TopHeaderBar (h-14 = 3.5rem) va
    // padding doc cua MainContentArea (pt-4 + pb-4 = 2rem) - dam bao Footer
    // luon it nhat cham day viewport thay vi troi len ngay sau noi dung khi
    // trang it du lieu (vd danh sach follower rong/it nguoi).
    <div className="flex min-h-[calc(100vh-5.5rem)] flex-col">
      <ProfileHeader
        profile={profile}
        following={following}
        pending={pending}
        onToggleFollow={handleToggleFollow}
      />

      <SectionContainer as="div" className="flex flex-1 flex-col">
        <ProfileNav
          username={profile.username!}
          activeHref={activeHref}
          onNavClick={handleNavClick}
          isSelf={profile.isSelf}
          postCount={profile.postCount}
          followingCount={profile.followingCount}
          followerCount={followerCount}
          createdAt={profile.createdAt}
          websiteUrl={profile.websiteUrl}
        />

        <div
          className={`flex flex-1 gap-6 py-4 transition-opacity duration-150 ease-out ${
            isPending ? "pointer-events-none opacity-50" : "opacity-100"
          }`}
        >
          <div className="min-w-0 flex-1">{children}</div>
          {/* <ProfileSidePanel /> */}
        </div>

        <ProfileFooter displayName={profile.displayName} />
      </SectionContainer>
    </div>
  );
};

export default ProfileShell;
