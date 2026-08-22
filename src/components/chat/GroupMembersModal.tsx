"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Users, X } from "lucide-react";
import type { ApiConversationUser } from "@/lib/api/types";
import { ConversationAvatar } from "./ConversationAvatar";

// Danh sach thanh vien READ-ONLY (khong co "xoa thanh vien"/"cap quyen" -
// chua co khai niem admin/ACL o backend, xem GroupInfoPanel.tsx). Dialog
// rieng theo dung phong cach CreateGroupModal.tsx (premium purple) de Group
// Info va Create Group nhin nhu 1 san pham.
export function GroupMembersModal({
  open,
  onOpenChange,
  participants,
  myName,
  myAvatarUrl,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participants: ApiConversationUser[];
  myName: string;
  myAvatarUrl: string | null | undefined;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#172033]/45 backdrop-blur-sm" />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[80vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_28px_70px_-16px_rgba(23,32,51,.3)] focus:outline-none"
        >
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#E5E7EB] px-6 py-5">
            <div className="flex items-center gap-3">
              <span
                className="grid size-9 shrink-0 place-items-center rounded-xl text-white"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-hover))" }}
              >
                <Users size={17} />
              </span>
              <Dialog.Title className="text-[17px] font-bold text-[#172033]">
                Thành viên ({participants.length + 1})
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Đóng"
                className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-[#7A8496] transition-colors duration-150 ease-out hover:bg-primary-soft hover:text-primary"
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
            <div className="flex h-14 items-center gap-3 rounded-xl px-3">
              <ConversationAvatar name={myName} avatarUrl={myAvatarUrl} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-[#172033]">
                  {myName}
                </p>
                <p className="text-[12px] text-[#7A8496]">Bạn</p>
              </div>
            </div>
            {participants.map((p) => (
              <div key={p.id} className="flex h-14 items-center gap-3 rounded-xl px-3">
                <ConversationAvatar
                  name={p.name}
                  avatarUrl={p.avatarUrl}
                  online={p.online}
                  size={40}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-[#172033]">
                    {p.name}
                  </p>
                  {p.username && (
                    <p className="truncate text-[12px] text-[#7A8496]">
                      @{p.username}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
