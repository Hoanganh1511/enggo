import Link from "next/link";
import { BadgeCheck, Check, Hash, Lock, Users } from "lucide-react";
import type { ApiCommunitySummary } from "@/lib/api/types";
import { formatCompact } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import { CommunityJoinButton } from "./CommunityJoinButton";

// Palette cham mau cho monogram - hash tu ten cong dong de moi cong dong 1
// mau on dinh (giong cach lich tham chieu dung nhieu mau su kien) ma van toi
// gian. Mau tuoi -> hien tot tren ca light & dark.
const ACCENTS = [
  "#3b82f6",
  "#22c55e",
  "#a855f7",
  "#ec4899",
  "#f59e0b",
  "#14b8a6",
];

function accentOf(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % 997;
  return ACCENTS[h % ACCENTS.length];
}

function Dot({ color }: { color: string }) {
  return (
    <span
      className="size-1.5 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

// 1 "o" cong dong trong LUOI dang lich (/communities) - thiet ke lai toi gian
// theo UI lich: khong anh bia/shadow, cac o lien ke chung duong ke mong, thong
// tin dang "su kien" (cham mau + dong ngan). Monogram goc trai giong "so ngay"
// cua o lich. Vao cong dong CHI qua nut CommunityJoinButton (than o khong phai
// link) - giu rule dieu huong chat nhu ban card cu.
export function CommunityDiscoveryCard({
  community,
}: {
  community: ApiCommunitySummary;
}) {
  const accent = accentOf(community.name);
  const joined = community.viewerStatus === "member";

  return (
    <div className="group flex min-h-44 flex-col border-r border-b border-border p-3 transition-colors duration-150 ease-out hover:bg-hover-bg">
      {/* Hang tren: monogram (nhu "so ngay" o goc o lich) + trang thai (o goc
          phai, giong icon lap lai cua lich). */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
          style={{ backgroundColor: accent }}
        >
          {community.name.trim().charAt(0).toUpperCase() || "#"}
        </span>
        {joined ? (
          <span
            className="flex items-center gap-1 rounded-full bg-community-accent/12 px-1.5 py-0.5 text-[10px] font-medium text-community-accent"
            title="Đã tham gia"
          >
            <Check size={10} strokeWidth={2.5} />
          </span>
        ) : !community.isPublic ? (
          <Lock
            size={13}
            strokeWidth={2}
            className="shrink-0 text-ink-faint"
          />
        ) : null}
      </div>

      {/* Ten + mo ta (giu cho co dinh de cac dong "su kien" ben duoi thang
          hang giua cac o). */}
      <h3 className="line-clamp-1 text-sm font-semibold text-ink">
        {community.name}
      </h3>
      <p className="mt-0.5 line-clamp-2 min-h-8 text-[11px] leading-snug text-ink-faint">
        {community.description}
      </p>

      {/* Cac dong thong tin dang "su kien lich" - cham mau + text ngan. */}
      <div className="mt-2 flex flex-col gap-1 text-[11px] text-ink-muted">
        <span className="flex items-center gap-1.5">
          <Dot color="#3b82f6" />
          {formatCompact(community.memberCount)} thành viên
        </span>
        <span className="flex items-center gap-1.5">
          <Dot color="#22c55e" />
          {community.channelCount} kênh
        </span>
        {community.owner?.username && (
          <Link
            href={`/u/${community.owner.username}`}
            className="flex min-w-0 items-center gap-1.5 hover:text-ink"
          >
            <Dot color="#a855f7" />
            <span className="truncate">{community.owner.name}</span>
            {community.owner.verified && (
              <BadgeCheck
                size={11}
                strokeWidth={2.25}
                className="shrink-0 text-primary"
              />
            )}
          </Link>
        )}
      </div>

      {/* Nut hanh dong ghim day (mt-auto) - thang hang tuyet doi giua cac o. */}
      <div className="mt-auto pt-2.5">
        <CommunityJoinButton
          communityId={community.id}
          slug={community.slug}
          isPublic={community.isPublic}
          viewerStatus={community.viewerStatus}
          className="h-7 w-full text-[11px]"
        />
      </div>
    </div>
  );
}

export function CommunityDiscoveryCardSkeleton() {
  return (
    <div className="flex min-h-44 flex-col gap-2 border-r border-b border-border p-3">
      <div className="size-7 animate-pulse rounded-md bg-surface-muted" />
      <div className="h-3.5 w-2/3 animate-pulse rounded bg-surface-muted" />
      <div className="h-3 w-full animate-pulse rounded bg-surface-muted" />
      <div className="mt-1 h-2.5 w-1/2 animate-pulse rounded bg-surface-muted" />
      <div className="h-2.5 w-1/3 animate-pulse rounded bg-surface-muted" />
      <div className="mt-auto h-7 w-full animate-pulse rounded-sm bg-surface-muted" />
    </div>
  );
}
