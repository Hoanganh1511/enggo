"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { getUserProfileAction } from "@/actions/users/get-profile";
import { useCurrentAvatarStore } from "@/stores/current-avatar-store";

// Nguon THAT DUY NHAT cho avatar hien tren header (AccountMenu) o MOI trang,
// khong chi rieng trang profile cua chinh minh. Truoc day useCurrentAvatarStore
// chi duoc "chua lanh" tu ProfileSidebar.tsx (chi chay khi nguoi dung tinh co
// vao dung /u/[username] cua chinh ho) - neu ho vao thang /home, /articles,
// /settings... ma chua tung ghe profile trong phien do, header roi lai
// session.user.image (token.picture, CHI dien 1 lan luc dang nhap tu anh
// Google, co the KHAC HAN avatar that dang luu o backend neu ho tung doi
// anh that o phien truoc). Component nay (mount 1 lan o (main)/layout.tsx,
// giong tien le FeedBootstrap.tsx) fetch dung profile that cua chinh nguoi
// dung ngay khi vao app, dam bao header luon dung tu request dau tien - "1
// nguon quy chuan" thay vi phu thuoc thu tu dieu huong.
export function AvatarBootstrap() {
  const { data: session } = useSession();
  const setAvatarUrl = useCurrentAvatarStore((s) => s.setAvatarUrl);

  useEffect(() => {
    if (!session?.username) return;
    getUserProfileAction(session.username)
      .then((profile) => setAvatarUrl(profile.avatarUrl))
      .catch(() => {
        // Loi mang/API - im lang, header roi lai session.user.image (fallback
        // co san trong Avatar cua account-menu.tsx), khong chan trang.
      });
  }, [session?.username, setAvatarUrl]);

  return null;
}
