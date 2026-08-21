"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ProfileSidebar } from "./ProfileSidebar";
import { ProfileTabBar } from "./ProfileTabBar";
import { ProfileContext } from "./profile-context";
import SectionContainer from "@/components/ui/section-container";
import { UserProfileApiShape } from "@/lib/api/users";
import {
  followUserAction,
  unfollowUserAction,
} from "@/actions/discover/follow-user";

// Khung chung quanh moi tab cua trang profile (xem [username]/layout.tsx) -
// port layout note.com (sidebar identity/follow/Magazine + tab ngang tren
// dau noi dung chinh, thay cho "navy sidebar Universe" ban truoc). Dung TOKEN
// mau chuan (bg-surface/text-ink...) thay vi bang mau rieng nhu Universe -
// note.com trung tinh (den/trang/xam), khong can ngoai le fixed-palette.
// ProfileSidebar/ProfileTabBar deu doc qua ProfileContext (profile-context.tsx),
// KHONG nhan props nua. State follow (following/followerCount/pending) so
// huu o day vi ca ProfileSidebar (nut Theo doi + so lieu) lan cac noi dung
// con (vd nut Nhắn tin) deu can dung chung.
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

  const mergedProfile = { ...profile, followerCount };

  return (
    <ProfileContext.Provider
      value={{
        profile: mergedProfile,
        following,
        pending,
        onToggleFollow: handleToggleFollow,
        activeHref,
        onNavClick: handleNavClick,
      }}
    >
      <SectionContainer as="div" maxWidth="7xl" className="flex gap-6 py-6">
        <ProfileSidebar />

        <main
          className={`min-w-0 flex-1 transition-opacity duration-150 ease-out ${
            isPending ? "pointer-events-none opacity-50" : "opacity-100"
          }`}
        >
          <ProfileTabBar />
          {children}
        </main>
      </SectionContainer>
    </ProfileContext.Provider>
  );
};

export default ProfileShell;
