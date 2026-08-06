"use client";

import { useState } from "react";
import Image from "next/image";
import { Hash } from "lucide-react";
import type {
  CommunityActiveMember,
  CommunityChannel,
} from "@/content/community-mock";
import { formatCompact } from "@/lib/format-number";
import { cn } from "@/lib/utils";

// Box thong tin kenh dang xem - truoc day la 1 hero ngang o dau main chat
// (CommunityChatView.tsx), GIO chuyen sang box rieng o right panel (hep hon
// nhieu) nen bo cuc doi thanh COT DOC: banner anh (dai ngan) o tren, ten +
// mo ta + avatar/so lieu + nut tham gia xep chong xuong duoi, thay vi 1
// hang ngang nhu ban cu.
//
// "channel.bannerImageUrl" la CHO SAN de dien link anh nen RIENG cho 1 kenh
// vao sau (community-mock.ts). Chua dien thi fallback ve cloud-banner.png
// (khong con phu them mountain-banner.png nhu ban hero cu - banner o day qua
// hep de nui/co "tran ra ngoai" nhin dep nhu truoc).
export function CommunityChannelInfoCard({
  channel,
  memberCount,
  activeMembers,
}: {
  channel: CommunityChannel;
  memberCount: number;
  activeMembers: CommunityActiveMember[];
}) {
  // Da la thanh vien Community (chi Member workspace moi render box nay)
  // nen mac dinh coi nhu da tham gia kenh - UI-only, chua co API tham gia
  // rieng tung kenh.
  const [joined, setJoined] = useState(true);
  const previewMembers = activeMembers.slice(0, 3);

  return (
    <div className="shrink-0 overflow-hidden rounded-lg border border-border bg-white shadow-sm">
      <div className="relative h-20 w-full">
        {channel.bannerImageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${channel.bannerImageUrl})` }}
          />
        ) : (
          <Image
            src="/cloud-banner.png"
            alt=""
            fill
            sizes="288px"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-white via-white/10 to-transparent" />
        <span className="absolute right-3 bottom-3 flex size-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-community-accent to-community-accent-dark text-white shadow-sm">
          <Hash size={16} strokeWidth={2.25} />
        </span>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold text-ink">
            {channel.name}
          </h2>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-muted">
            {channel.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          {previewMembers.length > 0 && (
            <div className="flex -space-x-1.5">
              {previewMembers.map((member) => (
                <Image
                  key={member.name}
                  src={member.avatarUrl}
                  alt={member.name}
                  width={22}
                  height={22}
                  className="size-5.5 shrink-0 rounded-full border-2 border-surface object-cover"
                />
              ))}
            </div>
          )}
          <span className="truncate text-xs font-medium text-ink-muted">
            {channel.messageCount} bài viết · {formatCompact(memberCount)} thành
            viên
          </span>
        </div>

        <button
          type="button"
          onClick={() => setJoined((v) => !v)}
          className={cn(
            "w-full cursor-pointer rounded-full py-1.5 text-xs font-semibold transition-colors duration-150 ease-out",
            joined
              ? "border border-border bg-surface text-ink-muted hover:bg-hover-bg"
              : "bg-community-accent text-white hover:bg-community-accent-hover",
          )}
        >
          {joined ? "Đã tham gia" : "Tham gia kênh"}
        </button>
      </div>
    </div>
  );
}
