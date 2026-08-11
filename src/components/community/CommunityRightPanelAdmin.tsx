import type { Community } from "@/lib/community/types";
import { formatCompact } from "@/lib/format-number";
import { CommunityRightPanelShell } from "./CommunityRightPanelShell";

// Cot phai cho giao dien ADMIN - "Tong quan cong dong" (4 o so lieu: thanh
// vien that + 3 muc tu community.adminStats) va "Hoat dong gan day". Moi
// khoi la 1 "box" trang rieng biet (dong bo voi CommunityRightPanelMember.tsx)
// vi CommunityRightPanelShell khong con nen rieng nua.
export function CommunityRightPanelAdmin({
  community,
}: {
  community: Community;
}) {
  return (
    <CommunityRightPanelShell>
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <p className="mb-3 text-sm font-bold text-ink">Tổng quan cộng đồng</p>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-lg border border-border p-2.5">
            <p className="text-lg leading-tight font-bold text-ink">
              {formatCompact(community.memberCount)}
            </p>
            <p className="text-xs text-ink-faint">Thành viên</p>
          </div>
          {community.adminStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border p-2.5"
            >
              <p className="text-lg leading-tight font-bold text-ink">
                {stat.value}
              </p>
              <p className="text-xs text-ink-faint">{stat.label}</p>
              {stat.deltaLabel && (
                <p className="mt-0.5 text-[11px] font-medium text-success">
                  ↑{stat.deltaLabel}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {community.recentActivity.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <p className="mb-3 text-sm font-bold text-ink">Hoạt động gần đây</p>
          <div className="flex flex-col gap-2.5">
            {community.recentActivity.map((item, i) => (
              <p key={i} className="text-sm leading-snug text-ink-muted">
                <span className="font-medium text-ink">{item.actorName}</span>{" "}
                {item.action}
                <span className="block text-xs text-ink-faint">
                  {item.timeLabel}
                </span>
              </p>
            ))}
          </div>
        </div>
      )}
    </CommunityRightPanelShell>
  );
}
