import Image from "next/image";
import { Folder, FileText, Video, Link2, Bot } from "lucide-react";
import type {
  Community,
  CommunityChannel,
  CommunityResourceKind,
} from "@/content/community-mock";
import { formatCompact } from "@/lib/format-number";
import { CommunityRightPanelShell } from "./CommunityRightPanelShell";
import { CommunityChannelInfoCard } from "./CommunityChannelInfoCard";
import { CommunityChannelDrawer } from "./CommunityChannelDrawer";

const RESOURCE_ICON: Record<
  CommunityResourceKind,
  { icon: typeof Folder; className: string }
> = {
  doc: { icon: Folder, className: "bg-community-accent/10 text-community-accent" },
  pdf: { icon: FileText, className: "bg-danger/10 text-danger" },
  video: { icon: Video, className: "bg-danger/10 text-danger" },
  link: { icon: Link2, className: "bg-primary/10 text-primary" },
};

// Cot phai cho giao dien MEMBER - 3 "box" trang rieng biet (giong thiet ke
// tham khao): "Thành viên nổi bật" (xep hang theo points), "Tài liệu hữu ích"
// (gop chung docsAndLinks + usefulLinks, phan biet icon theo kind), "Hỏi AI
// Mentor" (CTA tinh, chua co tinh nang that). Moi khoi tu an neu mang rong.
export function CommunityRightPanelMember({
  community,
  channel,
}: {
  community: Community;
  channel: CommunityChannel | undefined;
}) {
  const resources = [
    ...community.docsAndLinks.map((doc) => ({
      title: doc.title,
      subtitle: doc.meta,
      kind: doc.kind ?? ("pdf" as const),
    })),
    ...community.usefulLinks.map((link) => ({
      title: link.title,
      subtitle: link.domain,
      kind: link.kind ?? ("link" as const),
    })),
  ].slice(0, 4);

  return (
    <CommunityRightPanelShell>
      {channel && (
        <CommunityChannelInfoCard
          channel={channel}
          memberCount={community.memberCount}
          activeMembers={community.activeMembers}
        />
      )}

      {community.activeMembers.length > 0 && (
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-ink">Thành viên nổi bật</p>
            <button
              type="button"
              className="cursor-pointer text-xs font-medium text-community-accent hover:underline"
            >
              Xem tất cả
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {community.activeMembers.map((member) => (
              <div key={member.name} className="flex items-center gap-2.5">
                <Image
                  src={member.avatarUrl}
                  alt={member.name}
                  width={36}
                  height={36}
                  className="size-9 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{member.name}</p>
                  <span className="inline-block rounded-full bg-community-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-community-accent">
                    {member.roleBadge ?? member.statusLabel}
                  </span>
                </div>
                {member.points !== undefined && (
                  <span className="shrink-0 text-xs font-semibold text-ink-muted">
                    {formatCompact(member.points)} điểm
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {resources.length > 0 && (
        <div id="docs-links" className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-ink">Tài liệu hữu ích</p>
            <button
              type="button"
              className="cursor-pointer text-xs font-medium text-community-accent hover:underline"
            >
              Xem tất cả
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {resources.map((resource) => {
              const { icon: Icon, className } = RESOURCE_ICON[resource.kind];
              return (
                <div key={resource.title} className="flex items-center gap-2.5">
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${className}`}
                  >
                    <Icon size={15} strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-medium text-ink">{resource.title}</p>
                    <p className="line-clamp-1 text-xs text-ink-faint">{resource.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <CommunityChannelDrawer />

      <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-white p-5 text-center shadow-sm">
        <span className="flex size-11 items-center justify-center rounded-full bg-community-accent/10 text-community-accent">
          <Bot size={20} strokeWidth={2} />
        </span>
        <p className="text-sm font-bold text-ink">Hỏi AI Mentor</p>
        <p className="text-xs text-ink-faint">Trợ lý AI luôn sẵn sàng hỗ trợ bạn!</p>
        <button
          type="button"
          className="mt-1 w-full cursor-pointer rounded-full bg-community-accent py-2 text-sm font-semibold text-white hover:bg-community-accent-hover"
        >
          Trò chuyện ngay
        </button>
      </div>
    </CommunityRightPanelShell>
  );
}
