import Image from "next/image";
import { Globe2, Users, Bell, ChevronDown, FileBadge2 } from "lucide-react";
import type { Community } from "@/content/community-mock";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatCompact } from "@/lib/format-number";

// Banner dau trang chi tiet cong dong - gradient toi rieng (khac han the
// trang/surface con lai cua app) vi day la 1 "khong gian" tach biet, giong
// cach cover photo cua 1 group thay vi 1 section thuong. State
// joined/notify CHI local (chua co API Community that - xem
// content/community-mock.ts).
export function CommunityHeader({ community }: { community: Community }) {
  return (
    <div className="overflow-hidden rounded-xl bg-gradient-to-br from-[#2b1f6b] via-[#382a86] to-[#4c3aa8] p-6 text-white sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-white/70">
            {community.isPublic && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1">
                <Globe2 size={12} strokeWidth={2} />
                Cộng đồng công khai
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1">
              <Users size={12} strokeWidth={2} />
              {formatCompact(community.memberCount)} thành viên
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <FileBadge2 size={26} strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl leading-tight font-bold tracking-tight">
                {community.name}
              </h1>
              <p className="mt-0.5 text-sm text-white/80">
                {community.tagline}
              </p>
            </div>
          </div>

          <p className="max-w-xl text-sm leading-relaxed text-white/70">
            {community.description}
          </p>

          <div className="flex flex-wrap items-center gap-1.5">
            {community.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/85"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md bg-white px-3 text-xs font-semibold text-[#2b1f6b] transition-opacity duration-150 ease-out hover:opacity-90"
            >
              {community.joined ? "Đã tham gia" : "Tham gia"}
              <ChevronDown size={14} strokeWidth={2.25} />
            </button>
            <button
              type="button"
              aria-label="Thông báo"
              className="flex size-8 cursor-pointer items-center justify-center rounded-md bg-white/10 transition-colors duration-150 ease-out hover:bg-white/20"
            >
              <Bell size={14} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-4 sm:w-64">
          <div className="rounded-lg bg-white/10 p-4">
            <p className="text-xs font-medium text-white/70">
              Thành tích cộng đồng
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold">
                  {formatCompact(community.memberCount)}
                </p>
                <p className="text-[10px] text-white/60">Thành viên</p>
              </div>
              <div>
                <p className="text-lg font-bold">
                  {formatCompact(community.postCount)}
                </p>
                <p className="text-[10px] text-white/60">Bài viết</p>
              </div>
              <div>
                <p className="text-lg font-bold">
                  {community.activeSeriesCount}
                </p>
                <p className="text-[10px] text-white/60">Series đang chạy</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white/10 p-4">
            <p className="text-xs font-medium text-white/70">
              Mục tiêu tháng {new Date().getMonth() + 1}
            </p>
            <p className="mt-1 text-xs text-white/85">
              {community.goal.label}
            </p>
            <ProgressBar
              percent={(community.goal.current / community.goal.target) * 100}
              className="mt-2 bg-white/15"
              barClassName="bg-white"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] font-medium text-white/80">
                {community.goal.current} / {community.goal.target}
              </span>
              <div className="flex items-center">
                <div className="flex -space-x-1.5">
                  {community.goal.contributorAvatarUrls.map((url, i) => (
                    <Image
                      key={i}
                      src={url}
                      alt=""
                      width={18}
                      height={18}
                      className="size-4.5 shrink-0 rounded-full border border-[#382a86] object-cover"
                    />
                  ))}
                </div>
                {community.goal.extraContributorCount > 0 && (
                  <span className="ml-1 text-[11px] text-white/70">
                    +{community.goal.extraContributorCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
