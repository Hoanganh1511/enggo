"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  Bell,
  CalendarDays,
  FileIcon,
  FileText,
  FoldersIcon,
  Image as ImageIcon,
  Info,
  MapPin,
  MoreHorizontal,
  Search,
  ShieldOff,
  User2Icon,
  Video,
  type LucideIcon,
} from "lucide-react";
import type { ApiConversationUser } from "@/lib/api/types";
import type { UserProfileApiShape } from "@/lib/api/users";
import { getUserProfileAction } from "@/actions/users/get-profile";
import { blockUserAction } from "@/actions/discover/follow-user";
import { ConfirmModal } from "@/components/ui/confirm-modal";

function formatJoinDate(iso: string): string {
  const d = new Date(iso);
  return `tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`;
}

// 3 nut hanh dong tren cung - DEU chua co tinh nang that dang sau (khong co
// he thong goi video, khong co tim kiem trong 1 hoi thoai) nen de disabled +
// nhan "Sắp có" thay vi gia vo bam duoc, dung nguyen tac da ap dung xuyen
// suot session (GroupSectionPlaceholder.tsx, Profile Universe...).
const QUICK_ACTIONS: { icon: LucideIcon; label: string }[] = [
  { icon: Video, label: "Gọi video" },
  { icon: Search, label: "Tìm kiếm" },
  { icon: MoreHorizontal, label: "Thêm" },
];

// Panel thong tin ben phai man /messages - the danh thiep + gioi thieu (data
// THAT, fetch qua getUserProfileAction vi ApiConversationUser tra ve tu
// /conversations chi co id/username/name/avatarUrl/verified, thieu createdAt/
// location can cho phan "Giới thiệu"). File & Media / Tai lieu hien EMPTY
// STATE trung thuc - chat CHUA co he thong dinh kem file/anh nao ca (moi tin
// nhan chi la text), nen KHONG bia luoi anh/blur "Xem thêm" nhu mockup goc du
// nguoi dung co mo ta - giu dung nguyen tac "không tạo fake functionality
// giả vờ hoạt động" da chot xuyen suot session nay. "Chặn" la nut DUY NHAT
// trong khoi "Tùy chỉnh nhóm" noi that toi API (FollowService.blockUser co
// san o backend) - "Thông báo" (mute hoi thoai) chua co field nao luu tren
// ConversationParticipant nen van la toggle trang tri.
export function MessageInfoPanel({
  otherUser,
}: {
  otherUser: ApiConversationUser;
}) {
  const [profile, setProfile] = useState<UserProfileApiShape | null>(null);
  const [confirmBlockOpen, setConfirmBlockOpen] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [, startFetchTransition] = useTransition();

  // Boc trong startFetchTransition (cung pattern voi MessagesShell.tsx) de
  // setProfile(null)/setBlocked(false) dau effect khong bi ESLint
  // react-hooks/set-state-in-effect chan.
  useEffect(() => {
    if (!otherUser.username) return;
    let cancelled = false;
    startFetchTransition(async () => {
      setProfile(null);
      setBlocked(false);
      const p = await getUserProfileAction(otherUser.username!).catch(
        () => null,
      );
      if (cancelled) return;
      if (p) setProfile(p);
    });
    return () => {
      cancelled = true;
    };
  }, [otherUser.username]);

  async function handleBlock() {
    if (!otherUser.username) return;
    await blockUserAction(otherUser.username);
    setBlocked(true);
  }

  return (
    <aside className="hidden w-[320px] shrink-0 flex-col overflow-y-auto border-l border-slate-200 bg-[#fbfbfc] p-5 xl:flex">
      {/* Card danh thiep */}
      <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-5 py-7 text-center">
        {otherUser.avatarUrl ? (
          <Image
            src={otherUser.avatarUrl}
            alt={otherUser.name}
            width={72}
            height={72}
            className="size-18 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            className="grid size-18 shrink-0 place-items-center rounded-full text-[22px] font-semibold text-white"
            style={{ background: "var(--primary)" }}
          >
            {otherUser.name.trim().charAt(0).toUpperCase()}
          </span>
        )}
        <div className="mt-3 flex items-center gap-1.5">
          <b className="text-[17px] text-[#182338]">{otherUser.name}</b>
          {otherUser.verified && (
            <BadgeCheck
              size={16}
              strokeWidth={2}
              fill="currentColor"
              stroke="white"
              className="shrink-0 text-sky-500"
            />
          )}
        </div>
        {otherUser.username && (
          <p className="mt-0.5 text-[13px] text-slate-500">
            @{otherUser.username}
          </p>
        )}
      </div>

      {/* 4 nut hanh dong */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.label}
            type="button"
            disabled
            title="Sắp có"
            className="flex cursor-not-allowed flex-col items-center gap-1.5 rounded-xl border-2 border-slate-200 py-3 text-[11px] font-semibold "
          >
            <a.icon size={19} strokeWidth={2.25} className="text-primary" />
            {a.label}
          </button>
        ))}
      </div>

      {/* Gioi thieu */}
      <InfoSection title="Giới thiệu" icon={User2Icon}>
        {!profile ? (
          <div className="space-y-2">
            <div className="h-3.5 w-32 animate-pulse rounded bg-slate-100" />
            <div className="h-3.5 w-24 animate-pulse rounded bg-slate-100" />
          </div>
        ) : (
          <div className="space-y-2">
            <InfoRow icon={CalendarDays}>
              Tham gia từ {formatJoinDate(profile.createdAt)}
            </InfoRow>
            {profile.location && (
              <InfoRow icon={MapPin}>{profile.location}</InfoRow>
            )}
          </div>
        )}
      </InfoSection>

      {/* File & Media */}
      <InfoSection title="File & Media" action="Xem tất cả" icon={FoldersIcon}>
        <EmptyRow icon={ImageIcon} text="Chưa có ảnh/video nào được chia sẻ." />
      </InfoSection>

      {/* Tai lieu */}
      <InfoSection title="Tài liệu" icon={FileIcon}>
        <EmptyRow icon={FileText} text="Chưa có tài liệu nào được chia sẻ." />
      </InfoSection>

      {/* Tuy chinh nhom */}
      <InfoSection title="Tùy chỉnh">
        <div className="flex items-center justify-between text-[13px] text-[#182338]">
          <span className="flex items-center gap-2">
            <Bell size={16} strokeWidth={1.9} className="text-slate-400" />
            Thông báo
          </span>
          <span
            title="Sắp có"
            className="relative h-5 w-9 shrink-0 cursor-not-allowed rounded-full bg-slate-200"
          >
            <span className="absolute top-1 left-1 size-3 rounded-full bg-white" />
          </span>
        </div>
        <button
          type="button"
          onClick={() => setConfirmBlockOpen(true)}
          disabled={blocked}
          className="mt-3 flex w-full cursor-pointer items-center gap-2 rounded-lg px-1 py-1.5 text-left text-[13px] font-medium text-danger transition-colors duration-150 ease-out hover:bg-danger/8 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ShieldOff size={16} strokeWidth={1.9} />
          {blocked ? "Đã chặn" : `Chặn ${otherUser.name}`}
        </button>
      </InfoSection>

      <ConfirmModal
        open={confirmBlockOpen}
        onOpenChange={setConfirmBlockOpen}
        title={`Chặn ${otherUser.name}?`}
        description="Người này sẽ không theo dõi/tương tác được với bạn nữa. Bạn có thể bỏ chặn sau trong Cài đặt."
        confirmLabel="Chặn"
        danger
        onConfirm={handleBlock}
      />
    </aside>
  );
}

function InfoSection({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon?: LucideIcon;
  action?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5 border-t border-slate-200 pt-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-[13px] font-bold text-[#182338]">
          {Icon && (
            <Icon size={16} strokeWidth={2} className="shrink-0 text-primary" />
          )}
          {title}
        </h3>
        {action && (
          <button
            type="button"
            disabled
            title="Sắp có"
            className="cursor-not-allowed text-[11px] font-medium text-slate-300"
          >
            {action}
          </button>
        )}
      </div>
      <div className="p-2">{children}</div>
    </section>
  );
}

function InfoRow({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-center gap-2 text-[13px] text-slate-600">
      <Icon size={14} strokeWidth={1.9} className="shrink-0 text-slate-400" />
      {children}
    </p>
  );
}

function EmptyRow({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl bg-white py-6 text-center">
      <Icon size={20} strokeWidth={1.6} className="text-slate-300" />
      <p className="max-w-[220px] text-[12px] leading-relaxed text-slate-400">
        {text}
      </p>
    </div>
  );
}
