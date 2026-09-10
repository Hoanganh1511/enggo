"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { uploadPostImageAction } from "@/actions/discover/upload-post-image";
import { updateProfileAction } from "@/actions/users/update-profile";
import { getApiErrorMessage } from "@/lib/api/client";

const MAX_IMAGE_BYTES = 25 * 1024 * 1024;

type ProfileImageField = "avatarUrl" | "coverImageUrl";

// Dung chung cho moi noi doi avatar/cover THAT (ProfileSidebar.tsx,
// SettingsSections.tsx) - tranh lap lai y het logic validate size/upload S3/
// luu PATCH /users/me/dong bo session o 2 noi. `onUploaded` de component goi
// tu cap nhat state hien thi cua rieng no (khac nhau: onProfileUpdate() vs
// setAvatarUrl()); avatar (khong phai cover) luon dong bo lai session
// next-auth vi header/AccountMenu doc avatar tu session.user.image - xem
// ghi chu trong auth.ts.
export function useProfileImageUpload(
  field: ProfileImageField,
  onUploaded: (url: string) => void,
) {
  const { update: updateSession } = useSession();
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
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "image");
      const uploaded = await uploadPostImageAction(formData);
      await updateProfileAction({ [field]: uploaded.url });
      onUploaded(uploaded.url);
      if (field === "avatarUrl") {
        await updateSession({ image: uploaded.url });
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Tải ảnh thất bại, thử lại sau."));
    } finally {
      setIsUploading(false);
    }
  }

  return { isUploading, error, upload };
}
