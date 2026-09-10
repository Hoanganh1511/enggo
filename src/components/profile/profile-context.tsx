"use client";

import { createContext, useContext } from "react";
import type { UserProfileApiShape } from "@/lib/api/users";

// Cho phep {children} cua ProfileShell.tsx (tuc cac page.tsx con nhu tab
// "Trang chu") doc duoc profile/trang thai follow ma KHONG can ProfileShell
// truyen qua props (Next.js khong cho lam vay voi layout->children) - xem
// ProfileShell.tsx (provider duy nhat) va page.tsx (vd dung dau tien, khoi
// "Theo dõi"/"Nhắn tin"/stat da chuyen tu ProfileSidebar.tsx sang day).
export type ProfileContextValue = {
  profile: UserProfileApiShape;
  following: boolean;
  pending: boolean;
  onToggleFollow: () => void;
  activeHref: string;
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
  // Cap nhat cuc bo sau khi doi avatar/cover THAT (PATCH /users/me da luu
  // xong o backend, day chi lam UI phan anh ngay khong can reload trang) -
  // xem ProfileSidebar.tsx.
  onProfileUpdate: (patch: Partial<UserProfileApiShape>) => void;
};

export const ProfileContext = createContext<ProfileContextValue | null>(null);

export function useProfileContext(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfileContext must be used within ProfileShell");
  }
  return ctx;
}
