import {
  LayoutGrid,
  UserPlus,
  Users,
  Hash,
  Pin,
  FileText,
  CalendarDays,
  BarChart3,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Community } from "@/content/community-mock";
import { cn } from "@/lib/utils";
import { CommunitySidebarShell } from "./CommunitySidebarShell";

export type AdminSection =
  | "overview"
  | "requests"
  | "members"
  | "channels"
  | "pinned"
  | "docs"
  | "events"
  | "stats"
  | "settings";

// Chi 2 muc THAT SU co noi dung rieng (xem CommunityWorkspace.tsx):
// "overview" (Tong quan) va "requests" (Yeu cau tham gia, co badge so luong
// cho duyet). Cac muc con lai CHI doi active state + hien placeholder "Sap
// ra mat" - lam du CA 9 trang quan tri that vuot xa pham vi 1 lan yeu cau,
// xem thao luan luc xac nhan pham vi.
const ADMIN_NAV: { section: AdminSection; icon: LucideIcon; label: string }[] = [
  { section: "overview", icon: LayoutGrid, label: "Tổng quan" },
  { section: "requests", icon: UserPlus, label: "Yêu cầu tham gia" },
  { section: "members", icon: Users, label: "Thành viên" },
  { section: "channels", icon: Hash, label: "Kênh & Danh mục" },
  { section: "pinned", icon: Pin, label: "Nội dung ghim" },
  { section: "docs", icon: FileText, label: "Tài liệu & Link" },
  { section: "events", icon: CalendarDays, label: "Sự kiện" },
  { section: "stats", icon: BarChart3, label: "Thống kê" },
  { section: "settings", icon: Settings, label: "Cài đặt cộng đồng" },
];

export function CommunityAdminSidebar({
  community,
  activeSection,
  onSelectSection,
  pendingRequestCount,
}: {
  community: Community;
  activeSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  pendingRequestCount: number;
}) {
  return (
    <CommunitySidebarShell community={community} adminBadge>
      <nav className="flex flex-col gap-0.5 px-1">
        <p className="px-1 pb-1 text-[10px] font-semibold tracking-wide text-ink-faint uppercase">
          Quản trị
        </p>
        {ADMIN_NAV.map(({ section, icon: Icon, label }) => (
          <button
            key={section}
            type="button"
            onClick={() => onSelectSection(section)}
            className={cn(
              "flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors duration-150 ease-out",
              section === activeSection
                ? "bg-community-accent/10 font-medium text-community-accent"
                : "text-ink-muted hover:bg-hover-bg hover:text-ink",
            )}
          >
            <span className="flex items-center gap-2.5">
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </span>
            {section === "requests" && pendingRequestCount > 0 && (
              <span className="rounded-full bg-community-accent px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {pendingRequestCount}
              </span>
            )}
          </button>
        ))}
      </nav>
    </CommunitySidebarShell>
  );
}
