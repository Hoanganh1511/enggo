import {
  LayoutGrid,
  Users,
  CalendarDays,
  Trophy,
  Hash,
  FileText,
  BookOpen,
} from "lucide-react";
import type { Community } from "@/content/community-mock";
import { cn } from "@/lib/utils";
import { CommunitySidebarShell } from "./CommunitySidebarShell";

const QUICK_NAV = [
  { icon: LayoutGrid, label: "Tổng quan" },
  { icon: Users, label: "Thành viên" },
  { icon: CalendarDays, label: "Sự kiện" },
  { icon: Trophy, label: "Bảng xếp hạng" },
];

// Sidebar trai cho giao dien MEMBER (khong phai Admin) - nav nhanh (tinh,
// UI-only) + danh sach kenh (KENH KIEN THUC, doi active theo channel dang
// chon) + muc "CONG CU" (Tai lieu & Link/Wiki - lien ket tinh, chua co trang
// rieng). "Đang cho duyet" cua chinh nguoi xem KHONG hien o day - sidebar
// Member khong co khai niem duyet, day la viec cua Admin (xem
// CommunityAdminSidebar.tsx).
export function CommunityChannelSidebar({
  community,
  activeChannelSlug,
  onSelectChannel,
}: {
  community: Community;
  activeChannelSlug: string;
  onSelectChannel: (slug: string) => void;
}) {
  return (
    <CommunitySidebarShell community={community}>
      <nav className="flex flex-col gap-0.5 px-1">
        {QUICK_NAV.map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
          >
            <Icon size={16} strokeWidth={2.25} />
            {label}
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-0.5 px-1">
        <p className="px-1 pb-1 text-[10px] font-semibold tracking-wide text-ink-faint uppercase">
          Kênh kiến thức
        </p>
        {community.channels
          .filter((c) => c.group === "knowledge")
          .map((channel) => (
            <button
              key={channel.slug}
              type="button"
              onClick={() => onSelectChannel(channel.slug)}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors duration-150 ease-out",
                channel.slug === activeChannelSlug
                  ? "bg-community-accent/10 font-medium text-community-accent"
                  : "text-ink hover:bg-hover-bg",
              )}
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <Hash size={14} strokeWidth={2.25} className="shrink-0" />
                <span className="truncate">{channel.name}</span>
              </span>
              {channel.messageCount > 0 && (
                <span className="shrink-0 text-xs text-ink-faint">
                  {channel.messageCount}
                </span>
              )}
            </button>
          ))}
      </div>

      <div className="flex flex-col gap-0.5 px-1">
        <p className="px-1 pb-1 text-[10px] font-semibold tracking-wide text-ink-faint uppercase">
          Công cụ
        </p>
        <a
          href="#docs-links"
          className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
        >
          <FileText size={15} strokeWidth={2.25} />
          Tài liệu & Link
        </a>
        <button
          type="button"
          className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
        >
          <BookOpen size={15} strokeWidth={2.25} />
          Wiki
        </button>
      </div>
    </CommunitySidebarShell>
  );
}
