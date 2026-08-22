"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import {
  Bell,
  BellOff,
  Camera,
  FileIcon,
  ImageIcon,
  LoaderCircle,
  LogOut,
  MoreHorizontal,
  Pencil,
  Pin,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast/toast-store";
import { formatMessagePreview } from "@/lib/chat-message-preview";
import {
  GROUP_AVATAR_COLORS,
  type ApiChatMessage,
  type ApiConversationSummary,
  type GroupAvatarColor,
} from "@/lib/api/types";
import {
  leaveGroupAction,
  listMediaAction,
  listPinnedMessagesAction,
  updateGroupInfoAction,
} from "@/actions/chat/group-info";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { GroupAvatar } from "./GroupAvatar";
import { ConversationAvatar } from "./ConversationAvatar";
import { GroupMembersModal } from "./GroupMembersModal";
import { GroupMediaModal } from "./GroupMediaModal";

// Cung 1 bo mau/style voi CreateGroupModal.tsx (xem GROUP_COLOR_SWATCHES o
// do) - Group Info va Create Group phai nhin nhu 2 phan cua cung 1 san pham.
const GROUP_COLOR_SWATCHES: Record<GroupAvatarColor, string> = {
  violet: "#6D4AFF",
  blue: "#2563EB",
  emerald: "#0D9488",
  amber: "#F97316",
  rose: "#EF4444",
  slate: "#64748B",
};

// Panel thong tin nhom - thay the MessageInfoPanel.tsx (1-1) khi
// activeConversation.isGroup. Ten/mau/mo ta la cap NHOM (bat ky ai sua duoc,
// chua co khai niem "admin" - xem UpdateGroupInfoDto o backend), khac han
// isFavorite/isMuted/isRestricted la cai dat RIENG cua nguoi xem. Quyen rieng
// tu/Quyen thanh vien va "Them thanh vien" de disabled + "Sắp có" vi CHUA co
// ACL/them-thanh-vien-sau-khi-tao o backend - khong tao fake functionality.
export function GroupInfoPanel({
  conversation,
  myName,
  myAvatarUrl,
  onClose,
  onUpdated,
  onToggleMute,
  onOpenSearch,
  onJumpToMessage,
  onLeft,
}: {
  conversation: ApiConversationSummary;
  myName: string;
  myAvatarUrl: string | null | undefined;
  onClose: () => void;
  onUpdated: (c: ApiConversationSummary) => void;
  onToggleMute: () => void;
  onOpenSearch: () => void;
  onJumpToMessage: (id: string) => void;
  onLeft: () => void;
}) {
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(conversation.groupName ?? "");
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [savingIdentity, setSavingIdentity] = useState(false);

  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState(
    conversation.groupDescription ?? "",
  );
  const [savingDescription, setSavingDescription] = useState(false);

  const [media, setMedia] = useState<ApiChatMessage[] | null>(null);
  const [pinned, setPinned] = useState<ApiChatMessage[] | null>(null);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [, startFetchTransition] = useTransition();

  // Boc setState dau effect trong startTransition (cung pattern voi
  // MessageInfoPanel.tsx) de khong bi ESLint react-hooks/set-state-in-effect
  // chan - day la "mirror prop vao state cuc bo de sua duoc" hop le, khong
  // phai side-effect that.
  useEffect(() => {
    startFetchTransition(() => {
      setNameDraft(conversation.groupName ?? "");
      setDescriptionDraft(conversation.groupDescription ?? "");
    });
  }, [conversation.groupName, conversation.groupDescription]);

  useEffect(() => {
    let cancelled = false;
    startFetchTransition(() => {
      setMedia(null);
      setPinned(null);
    });
    listMediaAction(conversation.id)
      .then((page) => {
        if (!cancelled) setMedia(page.items);
      })
      .catch(() => {
        if (!cancelled) setMedia([]);
      });
    listPinnedMessagesAction(conversation.id)
      .then((items) => {
        if (!cancelled) setPinned(items);
      })
      .catch(() => {
        if (!cancelled) setPinned([]);
      });
    return () => {
      cancelled = true;
    };
  }, [conversation.id]);

  async function saveName() {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === conversation.groupName) {
      setEditingName(false);
      setNameDraft(conversation.groupName ?? "");
      return;
    }
    setSavingIdentity(true);
    try {
      const updated = await updateGroupInfoAction(conversation.id, {
        name: trimmed,
      });
      onUpdated(updated);
      setEditingName(false);
    } catch {
      toast.danger("Không thể đổi tên nhóm, thử lại sau.");
    } finally {
      setSavingIdentity(false);
    }
  }

  async function saveColor(color: GroupAvatarColor) {
    setColorPickerOpen(false);
    if (color === conversation.groupAvatarColor) return;
    setSavingIdentity(true);
    try {
      const updated = await updateGroupInfoAction(conversation.id, {
        avatarColor: color,
      });
      onUpdated(updated);
    } catch {
      toast.danger("Không thể đổi màu nhóm, thử lại sau.");
    } finally {
      setSavingIdentity(false);
    }
  }

  async function saveDescription() {
    const trimmed = descriptionDraft.trim();
    setSavingDescription(true);
    try {
      const updated = await updateGroupInfoAction(conversation.id, {
        description: trimmed,
      });
      onUpdated(updated);
      setEditingDescription(false);
    } catch {
      toast.danger("Không thể cập nhật mô tả, thử lại sau.");
    } finally {
      setSavingDescription(false);
    }
  }

  async function handleLeave() {
    setLeaving(true);
    try {
      await leaveGroupAction(conversation.id);
      onLeft();
    } finally {
      setLeaving(false);
    }
  }

  const memberCount = conversation.participants.length + 1;
  const stackMembers = conversation.participants.slice(0, 5);
  const latestPin = pinned?.[0] ?? null;

  return (
    <aside className="hidden w-[380px] shrink-0 flex-col overflow-y-auto border-l border-[#E7E9EF] bg-white xl:flex">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#E7E9EF] px-5 py-4">
        <h2 className="text-[15px] font-bold text-[#172033]">Thông tin nhóm</h2>
        <button
          type="button"
          onClick={onClose}
          className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-[#7A8496] transition-colors duration-150 ease-out hover:bg-[#F4F1FF] hover:text-[#6D4AFF]"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-6 px-5 py-6">
        {/* Identity */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <GroupAvatar color={conversation.groupAvatarColor} size={100} />
            <div className="relative">
              <button
                type="button"
                onClick={() => setColorPickerOpen((v) => !v)}
                disabled={savingIdentity}
                className="absolute right-0 bottom-0 grid size-8 cursor-pointer place-items-center rounded-full border-2 border-white bg-[#F6F3FF] text-[#6D4AFF] shadow-[0_2px_6px_rgba(23,32,51,.15)] transition-opacity duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-60"
                title="Đổi màu nhóm"
              >
                <Camera size={13} />
              </button>
              {colorPickerOpen && (
                <div className="absolute top-10 right-0 z-10 flex items-center gap-2 rounded-full border border-[#E7E9EF] bg-white p-2 shadow-[0_8px_28px_rgba(15,23,42,.12)]">
                  {GROUP_AVATAR_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => void saveColor(c)}
                      aria-label={`Chọn màu ${c}`}
                      className="relative size-6 shrink-0 cursor-pointer rounded-full transition-transform duration-150 ease-out hover:scale-110"
                      style={{
                        background: GROUP_COLOR_SWATCHES[c],
                        boxShadow:
                          conversation.groupAvatarColor === c
                            ? `0 0 0 2px #fff, 0 0 0 3.5px ${GROUP_COLOR_SWATCHES[c]}`
                            : undefined,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3.5 w-full">
            {editingName ? (
              <input
                autoFocus
                value={nameDraft}
                maxLength={50}
                disabled={savingIdentity}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={() => void saveName()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                  if (e.key === "Escape") {
                    setNameDraft(conversation.groupName ?? "");
                    setEditingName(false);
                  }
                }}
                className="w-full rounded-lg border border-[#6D4AFF] bg-white px-2.5 py-1 text-center text-[17px] font-bold text-[#172033] outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditingName(true)}
                className="group inline-flex cursor-pointer items-center gap-1.5"
              >
                <b className="text-[17px] text-[#172033]">
                  {conversation.groupName ?? "Nhóm"}
                </b>
                <Pencil
                  size={12}
                  className="text-[#7A8496] opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100"
                />
              </button>
            )}
            <p className="mt-1 text-[13px] text-[#7A8496]">
              {memberCount} thành viên
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-2">
          <QuickAction icon={UserPlus} label="Thêm" disabled />
          <QuickAction icon={Search} label="Tìm kiếm" onClick={onOpenSearch} />
          <QuickAction
            icon={conversation.isMuted ? BellOff : Bell}
            label="Thông báo"
            active={conversation.isMuted}
            onClick={onToggleMute}
          />
          <QuickAction icon={MoreHorizontal} label="Khác" disabled />
        </div>

        {/* Members */}
        <Section
          title="Thành viên"
          icon={Users}
          action={memberCount > 6 ? "Xem tất cả" : undefined}
          onAction={() => setMembersModalOpen(true)}
        >
          <button
            type="button"
            onClick={() => setMembersModalOpen(true)}
            className="flex cursor-pointer items-center"
          >
            <span className="ring-2 ring-white rounded-full">
              <ConversationAvatar name={myName} avatarUrl={myAvatarUrl} size={36} />
            </span>
            {stackMembers.map((m) => (
              <span key={m.id} className="-ml-2.5 rounded-full ring-2 ring-white">
                <ConversationAvatar name={m.name} avatarUrl={m.avatarUrl} size={36} />
              </span>
            ))}
            {memberCount > 6 && (
              <span className="-ml-2.5 grid size-9 shrink-0 place-items-center rounded-full bg-[#F6F3FF] text-[12px] font-semibold text-[#6D4AFF] ring-2 ring-white">
                +{memberCount - 6}
              </span>
            )}
          </button>
        </Section>

        {/* Description */}
        <Section title="Mô tả nhóm">
          {editingDescription ? (
            <div className="flex flex-col gap-2">
              <textarea
                autoFocus
                value={descriptionDraft}
                maxLength={500}
                disabled={savingDescription}
                onChange={(e) => setDescriptionDraft(e.target.value)}
                placeholder="Thêm mô tả cho nhóm..."
                rows={3}
                className="w-full resize-none rounded-xl border border-[#6D4AFF] bg-white px-3 py-2 text-[13px] text-[#172033] outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDescriptionDraft(conversation.groupDescription ?? "");
                    setEditingDescription(false);
                  }}
                  className="cursor-pointer rounded-lg px-3 py-1.5 text-[12px] font-semibold text-[#7A8496] hover:bg-[#F7F8FC]"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => void saveDescription()}
                  disabled={savingDescription}
                  className="cursor-pointer rounded-lg bg-[#6D4AFF] px-3 py-1.5 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Lưu
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditingDescription(true)}
              className="group flex w-full cursor-pointer items-start justify-between gap-2 rounded-xl bg-[#F7F8FC] px-3 py-2.5 text-left"
            >
              <span
                className={cn(
                  "text-[13px] leading-relaxed",
                  conversation.groupDescription ? "text-[#172033]" : "text-[#7A8496]",
                )}
              >
                {conversation.groupDescription || "Thêm mô tả cho nhóm..."}
              </span>
              <Pencil
                size={13}
                className="mt-0.5 shrink-0 text-[#7A8496] opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100"
              />
            </button>
          )}
        </Section>

        {/* Shared media */}
        <Section
          title="File & Media"
          icon={ImageIcon}
          action={media && media.length > 0 ? "Xem tất cả" : undefined}
          onAction={() => setMediaModalOpen(true)}
        >
          {media === null ? (
            <div className="flex justify-center py-6">
              <LoaderCircle size={18} className="animate-spin text-[#7A8496]" />
            </div>
          ) : media.length === 0 ? (
            <EmptyRow icon={ImageIcon} text="Chưa có file/media nào được chia sẻ." />
          ) : (
            <div className="grid grid-cols-4 gap-1.5">
              {media.slice(0, 8).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMediaModalOpen(true)}
                  className="aspect-square cursor-pointer overflow-hidden rounded-lg bg-[#F7F8FC]"
                >
                  {(m.type === "IMAGE" || m.type === "GIF") && m.attachmentUrl ? (
                    <Image
                      src={m.attachmentUrl}
                      alt=""
                      width={80}
                      height={80}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="grid size-full place-items-center text-[#7A8496]">
                      <FileIcon size={18} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </Section>

        {/* Pinned message */}
        <Section title="Tin nhắn đã ghim" icon={Pin}>
          {pinned === null ? (
            <div className="flex justify-center py-6">
              <LoaderCircle size={18} className="animate-spin text-[#7A8496]" />
            </div>
          ) : !latestPin ? (
            <EmptyRow icon={Pin} text="Chưa có tin nhắn nào được ghim." />
          ) : (
            <button
              type="button"
              onClick={() => onJumpToMessage(latestPin.id)}
              className="w-full cursor-pointer rounded-xl bg-[#F7F8FC] px-3 py-2.5 text-left transition-colors duration-150 ease-out hover:bg-[#F4F1FF]"
            >
              <p className="truncate text-[13px] text-[#172033]">
                {formatMessagePreview(latestPin)}
              </p>
            </button>
          )}
        </Section>

        {/* Settings */}
        <Section title="Cài đặt nhóm">
          <div className="flex flex-col gap-1">
            <SettingsRow label="Quyền riêng tư" />
            <SettingsRow label="Quyền thành viên" />
          </div>
        </Section>

        {/* Leave group */}
        <button
          type="button"
          onClick={() => setConfirmLeaveOpen(true)}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#E7E9EF] py-2.5 text-[13px] font-semibold text-[#EF4444] transition-colors duration-150 ease-out hover:bg-red-50"
        >
          <LogOut size={15} />
          Rời nhóm
        </button>
      </div>

      <ConfirmModal
        open={confirmLeaveOpen}
        onOpenChange={setConfirmLeaveOpen}
        title="Rời khỏi nhóm?"
        description="Bạn sẽ không nhận được tin nhắn mới từ nhóm này nữa. Cần được thêm lại để tham gia."
        confirmLabel="Rời nhóm"
        danger
        onConfirm={handleLeave}
      />

      <GroupMembersModal
        open={membersModalOpen}
        onOpenChange={setMembersModalOpen}
        participants={conversation.participants}
        myName={myName}
        myAvatarUrl={myAvatarUrl}
      />

      <GroupMediaModal
        open={mediaModalOpen}
        onOpenChange={setMediaModalOpen}
        conversationId={conversation.id}
      />
      {leaving && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-white/40">
          <LoaderCircle size={22} className="animate-spin text-[#6D4AFF]" />
        </div>
      )}
    </aside>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
  disabled,
  active,
}: {
  icon: typeof Bell;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? "Sắp có" : undefined}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-xl border py-3 text-[11px] font-semibold transition-colors duration-150 ease-out",
        disabled
          ? "cursor-not-allowed border-[#E7E9EF] text-[#7A8496]"
          : active
            ? "cursor-pointer border-[#6D4AFF] bg-[#F6F3FF] text-[#6D4AFF]"
            : "cursor-pointer border-[#E7E9EF] text-[#172033] hover:bg-[#F7F8FC]",
      )}
    >
      <Icon size={18} strokeWidth={2} className={disabled ? "text-[#7A8496]" : "text-[#6D4AFF]"} />
      {label}
    </button>
  );
}

function Section({
  title,
  icon: Icon,
  action,
  onAction,
  children,
}: {
  title: string;
  icon?: typeof Users;
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2.5 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-[13px] font-bold text-[#172033]">
          {Icon && <Icon size={15} strokeWidth={2} className="text-[#6D4AFF]" />}
          {title}
        </h3>
        {action && (
          <button
            type="button"
            onClick={onAction}
            className="cursor-pointer text-[12px] font-semibold text-[#6D4AFF] hover:underline"
          >
            {action}
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function SettingsRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between px-0.5 py-1 text-[13px] text-[#172033]">
      <span>{label}</span>
      <span title="Sắp có" className="cursor-not-allowed text-[12px] text-[#7A8496]">
        Sắp có
      </span>
    </div>
  );
}

function EmptyRow({ icon: Icon, text }: { icon: typeof ImageIcon; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl bg-[#F7F8FC] py-6 text-center">
      <Icon size={18} strokeWidth={1.6} className="text-[#7A8496]" />
      <p className="max-w-[220px] text-[12px] leading-relaxed text-[#7A8496]">{text}</p>
    </div>
  );
}
