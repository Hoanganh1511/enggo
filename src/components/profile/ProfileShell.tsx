"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ProfileSidebar } from "./ProfileSidebar";
import { ProfileContext } from "./profile-context";
import { UserProfileApiShape } from "@/lib/api/users";
import {
  followUserAction,
  unfollowUserAction,
} from "@/actions/discover/follow-user";

// Khung chung quanh moi tab cua trang profile (xem [username]/layout.tsx) -
// port tu source treecareer-profile-universe-v2 ("navy sidebar" thay cho
// cover-photo header cu). ProfileSidebar (avatar/ten/bio/stat/nav that) nam
// O DAY, "children" la noi dung rieng cua tung tab (page.tsx con), render
// trong vung giay (#f8f8f5) ben phai sidebar. State follow (following/
// followerCount/pending) so huu o day vi ca nut Theo doi (ProfileSidebar)
// lan so lieu "Nguoi theo doi" (cung ProfileSidebar) deu can dung chung.
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
    // min-h tinh bang 100vh tru chieu cao TopHeaderBar (h-14 = 3.5rem) va
    // padding doc cua MainContentArea (pt-4 + pb-4 = 2rem) - dam bao vung
    // giay ben phai luon it nhat cham day viewport, khong bi ngan cut nham
    // khi trang it noi dung.
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
      <div className="flex min-h-[calc(100vh-5.5rem)] bg-[#f8f8f5]">
        <ProfileSidebar
          profile={mergedProfile}
          activeHref={activeHref}
          onNavClick={handleNavClick}
        />

        <main
          className={`min-w-0 flex-1 transition-opacity duration-150 ease-out ${
            isPending ? "pointer-events-none opacity-50" : "opacity-100"
          }`}
        >
          {children}
        </main>
      </div>
    </ProfileContext.Provider>
  );
};

export default ProfileShell;
