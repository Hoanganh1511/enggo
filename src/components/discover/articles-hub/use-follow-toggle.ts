"use client";

import { useState } from "react";
import { followUserAction, unfollowUserAction } from "@/actions/discover/follow-user";

// Trich tu PersonCollectionsCard (RecentCollectionsSection.tsx) - dung CHUNG
// cho moi noi can nut Theo dõi/Đang theo dõi toggle optimistic (card bo suu
// tap tren /collections, danh sach nguoi tren /home). KHONG dong bo voi
// ArticleStickyAuthorBar.tsx (co state rieng kem theo bio/social links, de
// nguyen khong gop).
export function useFollowToggle(username: string, initialIsFollowing: boolean) {
  const [following, setFollowing] = useState(initialIsFollowing);
  const [pending, setPending] = useState(false);

  async function toggle() {
    const next = !following;
    setFollowing(next); // optimistic
    setPending(true);
    try {
      await (next ? followUserAction(username) : unfollowUserAction(username));
    } catch {
      setFollowing(!next); // rollback neu API loi
    } finally {
      setPending(false);
    }
  }

  return { following, pending, toggle };
}
