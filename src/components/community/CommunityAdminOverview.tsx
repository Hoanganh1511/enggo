import Image from "next/image";
import type { Community } from "@/lib/community/types";
import { formatCompact } from "@/lib/format-number";

// Man hinh "Tong quan" cua Admin - ban to hon cua so lieu da hien o
// CommunityRightPanelAdmin.tsx (cot phai), dat lam noi dung chinh khi chon
// muc nav dau tien. Hero dau trang dung "/overview-background.png" (nui +
// co dinh nui, cung phong cach "hanh trinh" voi CommunityChannelHero.tsx).
export function CommunityAdminOverview({
  community,
}: {
  community: Community;
}) {
  return (
    <div className="flex h-full flex-1 flex-col gap-5 overflow-y-auto py-4 pl-6">
      <div className="relative shrink-0 overflow-hidden rounded-2xl border border-border">
        <Image
          src="/overview-background.png"
          alt=""
          fill
          sizes="900px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-surface/90 via-surface/70 to-surface/30" />
        <div className="relative z-10 p-5">
          <h1 className="text-xl font-bold tracking-tight text-ink">
            Tổng quan cộng đồng
          </h1>
          <p className="text-sm text-ink-muted">
            Số liệu và hoạt động tổng quan của cộng đồng
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border p-4">
          <p className="text-2xl font-bold text-ink">
            {formatCompact(community.memberCount)}
          </p>
          <p className="text-xs text-ink-faint">Thành viên</p>
        </div>
        {community.adminStats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border p-4">
            <p className="text-2xl font-bold text-ink">{stat.value}</p>
            <p className="text-xs text-ink-faint">{stat.label}</p>
            {stat.deltaLabel && (
              <p className="mt-1 text-xs font-medium text-success">
                ↑{stat.deltaLabel}
              </p>
            )}
          </div>
        ))}
      </div>

      {community.recentActivity.length > 0 && (
        <div className="rounded-lg border border-border">
          <p className="border-b border-border px-4 py-3 text-sm font-semibold text-ink">
            Hoạt động gần đây
          </p>
          <div className="flex flex-col divide-y divide-border">
            {community.recentActivity.map((item, i) => (
              <p key={i} className="px-4 py-3 text-sm text-ink-muted">
                <span className="font-medium text-ink">{item.actorName}</span>{" "}
                {item.action}
                <span className="ml-2 text-xs text-ink-faint">
                  {item.timeLabel}
                </span>
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
