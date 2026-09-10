"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { MoreHorizontal, Pencil, Share2, Trash2, X } from "lucide-react";
import { UserAvatarImage } from "@/components/ui/user-avatar-image";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { updateProfileAction } from "@/actions/users/update-profile";
import { useCurrentAvatarStore } from "@/stores/current-avatar-store";
import { useProfileContext } from "./profile-context";

type ImageKind = "avatar" | "cover";

// layoutId KHOP DUNG voi motion.div boc anh nho trong ProfileSidebar.tsx
// (PROFILE_AVATAR_LAYOUT_ID/PROFILE_COVER_LAYOUT_ID) - framer-motion tu
// noi 2 phan tu chung layoutId thanh 1 hieu ung "phong to tu vi tri goc"
// (shared layout transition) khi component nay mount/unmount, thay vi bop
// choc hien/an dot ngot. Dat o file dung chung (khong export tu component)
// de ca 2 noi cung 1 nguon, tranh go nham 1 ben.
export const PROFILE_AVATAR_LAYOUT_ID = "profile-avatar-photo";
export const PROFILE_COVER_LAYOUT_ID = "profile-cover-photo";

// Xem anh toan man hinh (avatar/cover) + bottom sheet hanh dong (Chia se/
// Doi anh/Xoa anh - CHI hien voi chu so huu) - theo mockup nguoi dung gui.
// Khong dung SimpleModal (dialog giua man hinh) vi day la trai nghiem
// toan-man-hinh-toi khac han; tu ve overlay rieng, chi muon ConfirmModal cho
// buoc xac nhan xoa (hanh dong pha huy). Component nay PHAI duoc goi ben
// trong <AnimatePresence> o ProfileSidebar.tsx de hieu ung dong (ca luc mo
// lan luc dong) chay dung - tu no khong tu boc AnimatePresence rieng.
export function ProfileImageViewer({
  onClose,
  kind,
  imageUrl,
  onChangePhoto,
}: {
  onClose: () => void;
  kind: ImageKind;
  imageUrl: string;
  // Kich hoat file picker da co san o ProfileSidebar.tsx (input ref dung
  // chung, tranh 2 noi cung upload).
  onChangePhoto: () => void;
}) {
  const { profile, onProfileUpdate } = useProfileContext();
  const setCurrentAvatarUrl = useCurrentAvatarStore((s) => s.setAvatarUrl);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  async function handleShare() {
    setSheetOpen(false);
    if (typeof window === "undefined") return;
    try {
      if (navigator.share) {
        await navigator.share({ url: imageUrl });
        return;
      }
      await navigator.clipboard.writeText(imageUrl);
      setShareFeedback("Đã sao chép liên kết ảnh.");
      setTimeout(() => setShareFeedback(null), 2000);
    } catch {
      // Nguoi dung tu huy hop thoai share cua he dieu hanh - im lang.
    }
  }

  async function handleDelete() {
    if (kind === "avatar") {
      await updateProfileAction({ avatarUrl: null });
      onProfileUpdate({ avatarUrl: "" });
      setCurrentAvatarUrl("");
    } else {
      await updateProfileAction({ coverImageUrl: null });
      onProfileUpdate({ coverImageUrl: null });
    }
    onClose();
  }

  const changeLabel = kind === "avatar" ? "Đổi ảnh đại diện" : "Thay ảnh bìa";
  const layoutId =
    kind === "avatar" ? PROFILE_AVATAR_LAYOUT_ID : PROFILE_COVER_LAYOUT_ID;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-40 flex flex-col bg-black/80 backdrop-blur-sm"
    >
      <div className="flex shrink-0 items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          className="flex size-9 cursor-pointer items-center justify-center rounded-full text-white hover:bg-white/10"
        >
          <X size={20} strokeWidth={2} />
        </button>
        {profile.isSelf && (
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex size-9 cursor-pointer items-center justify-center rounded-full text-white hover:bg-white/10"
          >
            <MoreHorizontal size={20} strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center px-6">
        {kind === "avatar" ? (
          <motion.div
            layoutId={layoutId}
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
            className="size-70 max-h-[70vw] max-w-[70vw] overflow-hidden rounded-full drop-shadow-[0_0_60px_rgba(255,255,255,0.25)]"
          >
            <UserAvatarImage
              src={imageUrl}
              name={profile.displayName}
              size={280}
              className="size-full"
            />
          </motion.div>
        ) : (
          <motion.div
            layoutId={layoutId}
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
            className="relative h-full w-full overflow-hidden"
          >
            <Image src={imageUrl} alt="" fill className="object-contain" sizes="100vw" />
          </motion.div>
        )}
      </div>

      {kind === "cover" && (
        <div className="shrink-0 px-4 pb-6">
          <p className="text-sm font-semibold text-white">Ảnh bìa</p>
          <p className="text-xs text-white/60">{profile.displayName}</p>
        </div>
      )}

      {shareFeedback && (
        <div className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-ink">
          {shareFeedback}
        </div>
      )}

      {sheetOpen && (
        <>
          <div
            className="fixed inset-0 z-10 bg-black/40"
            onClick={() => setSheetOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-20 rounded-t-2xl bg-surface pb-[max(env(safe-area-inset-bottom),16px)]">
            <div className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-border" />
            <div className="flex flex-col px-2 pt-2">
              <button
                type="button"
                onClick={handleShare}
                className="flex h-12 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm font-medium text-ink hover:bg-hover-bg"
              >
                <Share2 size={17} strokeWidth={1.8} />
                Chia sẻ ảnh
              </button>
              <button
                type="button"
                onClick={() => {
                  setSheetOpen(false);
                  onChangePhoto();
                }}
                className="flex h-12 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm font-medium text-ink hover:bg-hover-bg"
              >
                <Pencil size={17} strokeWidth={1.8} />
                {changeLabel}
              </button>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setSheetOpen(false);
                    setConfirmDeleteOpen(true);
                  }}
                  className="flex h-12 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm font-medium text-danger hover:bg-danger/10"
                >
                  <Trash2 size={17} strokeWidth={1.8} />
                  Xóa ảnh
                </button>
              )}
            </div>
            <div className="p-2 pt-1">
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="h-12 w-full cursor-pointer rounded-lg bg-surface-muted text-sm font-semibold text-ink hover:bg-hover-bg"
              >
                Hủy
              </button>
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title={kind === "avatar" ? "Xóa ảnh đại diện?" : "Xóa ảnh bìa?"}
        description="Bạn có thể tải ảnh mới lên bất cứ lúc nào sau đó."
        confirmLabel="Xóa ảnh"
        danger
        onConfirm={handleDelete}
      />
    </motion.div>
  );
}
