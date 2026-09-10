"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { uploadPostImageAction } from "@/actions/discover/upload-post-image";
import { updateProfileAction } from "@/actions/users/update-profile";
import { getApiErrorMessage } from "@/lib/api/client";
import { convertHeicToJpegIfNeeded } from "@/lib/heic-convert";
import { useCurrentAvatarStore } from "@/stores/current-avatar-store";

const MAX_IMAGE_BYTES = 25 * 1024 * 1024;

type ProfileImageField = "avatarUrl" | "coverImageUrl";

// Dung chung cho moi noi doi avatar/cover THAT (ProfileSidebar.tsx,
// SettingsSections.tsx) - tranh lap lai y het logic validate size/upload S3/
// luu PATCH /users/me o 2 noi. `onUploaded` de component goi tu cap nhat
// state hien thi cua rieng no (khac nhau: onProfileUpdate() vs setAvatarUrl()).
//
// Avatar (khong phai cover) can header (AccountMenu, nhanh KHAC trong cay
// component) thay doi ngay - dung useCurrentAvatarStore (Zustand, cap nhat
// dong bo, khong round-trip mang) lam nguon THAT chinh. useSession().update()
// van goi kem theo kieu best-effort (khong await, nuot loi) de JWT co co hoi
// mang avatar moi cho lan sau, nhung KHONG con la duong duy nhat quyet dinh
// UI - da xac nhan qua log server no im lang khong gui request that su o may
// that (xem current-avatar-store.ts).
export function useProfileImageUpload(
  field: ProfileImageField,
  onUploaded: (url: string) => void,
) {
  const { update: updateSession } = useSession();
  const setCurrentAvatarUrl = useCurrentAvatarStore((s) => s.setAvatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Ảnh vượt quá 25MB.");
      return;
    }
    setIsUploading(true);
    setError(null);
    try {
      const uploadFile = await convertHeicToJpegIfNeeded(file);
      if (uploadFile.size > MAX_IMAGE_BYTES) {
        setError("Ảnh vượt quá 25MB.");
        return;
      }
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("kind", "image");
      const uploaded = await uploadPostImageAction(formData);
      await updateProfileAction({ [field]: uploaded.url });
      onUploaded(uploaded.url);
      if (field === "avatarUrl") {
        setCurrentAvatarUrl(uploaded.url);
        updateSession({ image: uploaded.url }).catch(() => {
          // Best-effort - store o tren da la nguon that cho UI trong tab nay.
        });
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Tải ảnh thất bại, thử lại sau."));
    } finally {
      setIsUploading(false);
    }
  }

  return { isUploading, error, upload };
}
