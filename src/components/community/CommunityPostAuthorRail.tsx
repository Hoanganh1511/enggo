import Image from "next/image";
import { Zap } from "lucide-react";
import type { CommunityAuthorProfile } from "@/content/community-mock";
import { formatCompact } from "@/lib/format-number";

// Cot trai co dinh cua post card - avatar 60px + badge Level + XP luy ke +
// 3 chi so dong gop, can giua, ngan cach voi noi dung ben phai bang 1 duong
// vien doc rat mong. CHI hien Level/XP/chi so khi co "profile" (du lieu bien
// soan tay hoac suy tu Series that trong community-mock.ts) - khong co thi
// chi con avatar. An hoan toan duoi 768px (xem CommunityPostCard.tsx, luc do
// avatar nho hien lai trong header thay the).
export function CommunityPostAuthorRail({
  avatarUrl,
  name,
  profile,
}: {
  avatarUrl: string;
  name: string;
  profile: CommunityAuthorProfile | undefined;
}) {
  return (
    <div className="hidden w-24 shrink-0 flex-col items-center gap-2 border-r border-black/6 pr-4 text-center md:flex">
      <Image
        src={avatarUrl}
        alt={name}
        width={60}
        height={60}
        className="size-15 rounded-full object-cover"
      />
      {profile && (
        <>
          <span className="rounded-full bg-community-accent px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
            Lv.{profile.level}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-community-accent">
            <Zap size={11} strokeWidth={2} fill="currentColor" />
            {formatCompact(profile.totalXp)} XP
          </span>
          <div className="mt-1 flex flex-col gap-1 text-[11px] text-ink-faint">
            <span>💬 {profile.answerCount}</span>
            <span>📚 {profile.resourceCount}</span>
            <span>👍 {profile.helpfulCount}%</span>
          </div>
        </>
      )}
    </div>
  );
}
