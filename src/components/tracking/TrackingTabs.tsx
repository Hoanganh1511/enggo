"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  CalendarClock,
  Compass,
  HeartPulse,
  ListChecks,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/tracking/goals", label: "Mục tiêu", icon: Compass },
  { href: "/tracking/weekly", label: "Lịch tuần", icon: CalendarClock },
  { href: "/tracking/daily", label: "Hôm nay", icon: ListChecks },
  { href: "/tracking/energy", label: "Năng lượng", icon: Activity },
  { href: "/tracking/wellness", label: "Sức khoẻ", icon: HeartPulse },
  { href: "/tracking/accountability", label: "Nhóm", icon: Users },
  { href: "/tracking/analytics", label: "Phân tích", icon: BarChart3 },
];

// Dieu huong 7 module con cua /tracking - RIENG cho khu vuc nay (khac
// HomeDashboardSidebar chi co 1 muc "Tracking" duy nhat tro toi day). Dung
// Link that (khong phai state cuc bo nhu PanelTabs trong Composer.tsx) vi
// day la 7 route THAT, can F5/deep-link duoc.
export function TrackingTabs() {
  const pathname = usePathname();
  return (
    <nav className="scrollbar-none flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1.5">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition",
              active
                ? "bg-primary text-surface"
                : "text-ink-muted hover:bg-hover-bg",
            )}
          >
            <tab.icon size={15} strokeWidth={2} aria-hidden="true" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
