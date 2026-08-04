"use client";

import { useState } from "react";
import {
  MessageCircle,
  HelpCircle,
  FileText,
  GraduationCap,
  Bell,
  ChevronDown,
  LayoutGrid,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "discussion", label: "Thảo luận", icon: MessageCircle },
  { key: "qa", label: "Hỏi đáp", icon: HelpCircle },
  { key: "documents", label: "Tài liệu", icon: FileText },
  { key: "courses", label: "Khoá học & Ưu đãi", icon: GraduationCap },
  { key: "announcements", label: "Thông báo", icon: Bell },
] as const;

// UI SHELL CHUA GAN LOGIC THAT - moi tab la 1 LOAI NOI DUNG khac han nhau
// (thao luan/hoi dap/tai lieu/khoa hoc/thong bao), lam du noi dung ca 5 tab
// vuot xa pham vi 1 lan yeu cau nay. Component nay chi doi active state +
// hien dung vi tri/style theo thiet ke; noi dung ben duoi (CommunityFeed)
// hien LUON la "Thao luan" bat ke tab nao dang chon.
export function CommunityMainTabs() {
  const [active, setActive] = useState<(typeof TABS)[number]["key"]>(
    "discussion",
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border">
      <div className="flex flex-wrap items-center gap-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            className={cn(
              "flex h-10 cursor-pointer items-center gap-1.5 border-b-2 px-3 text-sm font-medium transition-colors duration-150 ease-out",
              active === key
                ? "border-primary text-primary"
                : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            <Icon size={15} strokeWidth={1.75} />
            {label}
          </button>
        ))}
      </div>

      <div className="mb-1.5 flex shrink-0 items-center gap-2">
        <button
          type="button"
          className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-border px-2.5 text-sm text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
        >
          Mới nhất
          <ChevronDown size={13} strokeWidth={2} />
        </button>
        <div className="flex items-center gap-0.5 rounded-md border border-border p-0.5">
          <span className="flex size-7 items-center justify-center rounded-sm bg-hover-bg text-ink">
            <LayoutGrid size={13} strokeWidth={2} />
          </span>
          <span className="flex size-7 items-center justify-center rounded-sm text-ink-faint">
            <List size={13} strokeWidth={2} />
          </span>
        </div>
      </div>
    </div>
  );
}
