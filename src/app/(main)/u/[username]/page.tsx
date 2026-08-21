"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Compass,
  MessageSquare,
  PenLine,
  Plus,
  Rocket,
  Settings,
  Sparkles,
  Zap,
} from "lucide-react";
import { ProfileComingSoonBlock } from "@/components/profile/ProfileComingSoonBlock";
import { useProfileContext } from "@/components/profile/profile-context";
import { createConversationAction } from "@/actions/chat/create-conversation";
import { formatCompact } from "@/lib/format-number";

// Tab "Trang chu" - trang landing kieu "Career Universe" (port tu source
// treecareer-profile-universe-v2). Cac khoi Universe/Journey/Projects/
// Activity/Metric CHUA co du lieu that o backend (khong co skill tree/
// timeline/projects/activity log rieng cho user) nen la ProfileComingSoonBlock
// trung thuc thay vi mock nhu source goc - xem ProfileComingSoonBlock.tsx.
// Feed bai dang that van xem duoc o tab "Bài đăng" rieng (khong doi). Cum
// Theo doi/Nhan tin/3 stat CHUYEN tu ProfileSidebar.tsx sang day (theo yeu
// cau nguoi dung) - doc profile/following/pending qua useProfileContext()
// (ProfileShell.tsx la provider duy nhat, xem profile-context.tsx).
export default function ProfileHomeTabPage() {
  const { profile, following, pending, onToggleFollow, activeHref, onNavClick } =
    useProfileContext();
  const router = useRouter();
  const [messaging, setMessaging] = useState(false);

  async function handleMessage() {
    if (!profile.username || messaging) return;
    setMessaging(true);
    try {
      const conversation = await createConversationAction(profile.username);
      router.push(`/messages?c=${conversation.id}`);
    } finally {
      setMessaging(false);
    }
  }

  return (
    <div>
      <div className="px-5 pt-8 lg:px-8">
        {profile.isSelf ? (
          <Link
            href="/settings"
            className="flex h-9 w-full max-w-xs items-center justify-center gap-1.5 rounded-full bg-[#5a4ccf] text-[12px] font-semibold text-white transition-opacity duration-150 ease-out hover:opacity-90 sm:w-auto sm:px-5"
          >
            <Settings size={13} strokeWidth={2} />
            Chỉnh sửa hồ sơ
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleFollow}
              disabled={pending}
              className={`flex h-9 items-center justify-center gap-1.5 rounded-full px-5 text-[12px] font-semibold transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-60 ${
                following
                  ? "border border-slate-200 bg-white text-[#182338] hover:bg-slate-50"
                  : "bg-[#5a4ccf] text-white hover:opacity-90"
              }`}
            >
              {!following && <Plus size={13} strokeWidth={2.5} />}
              {following ? "Đang theo dõi" : "Theo dõi"}
            </button>
            <button
              type="button"
              onClick={handleMessage}
              disabled={messaging}
              title="Nhắn tin"
              className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border border-slate-200 bg-white text-[#182338] transition-colors duration-150 ease-out hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MessageSquare size={14} strokeWidth={1.9} />
            </button>
          </div>
        )}

        <div className="mt-5 grid max-w-xs grid-cols-3 gap-2 border-y border-slate-200/70 py-4 text-center">
          <Stat value={profile.postCount} label="Bài viết" />
          <StatLink
            href={`/u/${profile.username}/following`}
            value={profile.followingCount}
            label="Đang theo dõi"
            active={activeHref === `/u/${profile.username}/following`}
            onNavClick={onNavClick}
          />
          <StatLink
            href={`/u/${profile.username}/followers`}
            value={profile.followerCount}
            label="Người theo dõi"
            active={activeHref === `/u/${profile.username}/followers`}
            onNavClick={onNavClick}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0">
          <div className="px-5 pt-6 pb-0 lg:px-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✦</span>
                  <h2 className="font-hand text-[30px] font-semibold tracking-[-0.02em] text-[#182338]">
                    My Career Universe
                  </h2>
                </div>
                <p className="mt-1 text-[13px] text-slate-500">
                  Mỗi hành tinh là một kỹ năng. Mỗi quỹ đạo là hành trình của
                  mình.
                </p>
              </div>
              <button
                type="button"
                disabled
                className="flex h-10 cursor-not-allowed items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-[12px] font-medium text-slate-400 shadow-sm"
              >
                <Sparkles size={15} /> Chế độ khám phá <ChevronDown size={14} />
              </button>
            </div>
          </div>

          <div className="px-5 pt-6 lg:px-8">
            <ProfileComingSoonBlock
              icon={Sparkles}
              title="Career Universe"
              description="Bản đồ kỹ năng trực quan - từng hành tinh là một kỹ năng, đang được xây dựng."
              minHeight="420px"
            />
          </div>

          <div className="px-5 pt-6 lg:px-8">
            <ProfileComingSoonBlock
              icon={Compass}
              title="Hành trình của mình"
              description="Dòng thời gian các dấu mốc quan trọng trên hành trình phát triển sự nghiệp."
            />
          </div>

          <section className="px-5 pt-8 pb-10 lg:px-8">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h3 className="font-hand text-[23px] font-semibold text-[#182338]">
                  Dự án nổi bật
                </h3>
                <p className="text-[12px] text-slate-500">
                  Những thứ mình đang xây dựng
                </p>
              </div>
            </div>
            <ProfileComingSoonBlock
              icon={Rocket}
              title="Dự án"
              description="Danh sách dự án nổi bật của bạn sẽ hiển thị ở đây."
            />
          </section>
        </section>

        <aside className="border-l border-slate-200/70 px-5 pt-8 pb-8 xl:px-6">
          <ProfileComingSoonBlock
            icon={Zap}
            title="Chỉ số của mình"
            description="Biểu đồ tổng hợp học tập, phát triển, chia sẻ..."
          />
          <div className="mt-5">
            <ProfileComingSoonBlock
              icon={PenLine}
              title="Hoạt động gần đây"
              description="Nhật ký hoạt động của bạn sẽ hiển thị ở đây."
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="text-[15px] font-bold text-[#182338]">
        {formatCompact(value)}
      </div>
      <div className="mt-1 text-[9px] text-slate-400">{label}</div>
    </div>
  );
}

function StatLink({
  href,
  value,
  label,
  active,
  onNavClick,
}: {
  href: string;
  value: number;
  label: string;
  active: boolean;
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}) {
  return (
    <Link
      href={href}
      onClick={(e) => onNavClick(e, href)}
      className="block hover:opacity-80"
    >
      <div
        className={`text-[15px] font-bold ${active ? "text-[#5a4ccf]" : "text-[#182338]"}`}
      >
        {formatCompact(value)}
      </div>
      <div className="mt-1 text-[9px] text-slate-400">{label}</div>
    </Link>
  );
}
