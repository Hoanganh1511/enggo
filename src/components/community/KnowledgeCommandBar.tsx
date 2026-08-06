"use client";

import {
  Sparkles,
  LayoutGrid,
  NotebookPen,
  HelpCircle,
  Paperclip,
  Pin,
  Users,
  Clock,
  Eye,
  GraduationCap,
  FileText,
  Code2,
  Video,
  Trophy,
  Search,
  ChevronDown,
  PenSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type KnowledgeCategory =
  | "all"
  | "learning"
  | "question"
  | "resource"
  | "pinned"
  | "mentor";

export type KnowledgeFilters = {
  category: KnowledgeCategory;
  search: string;
  mentorOnly: boolean;
  hasFile: boolean;
  hasCode: boolean;
  mostHelpful: boolean;
  unreadOnly: boolean;
  videoOnly: boolean;
};

export const DEFAULT_KNOWLEDGE_FILTERS: KnowledgeFilters = {
  category: "all",
  search: "",
  mentorOnly: false,
  hasFile: false,
  hasCode: false,
  mostHelpful: false,
  unreadOnly: false,
  videoOnly: false,
};

function ToggleChip({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: typeof Clock;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-colors duration-150 ease-out",
        active
          ? "border-community-accent/30 bg-community-accent/10 text-community-accent"
          : "border-border text-ink-muted hover:bg-hover-bg",
      )}
    >
      <Icon size={12} strokeWidth={2} />
      {label}
    </button>
  );
}

// "Knowledge Command Bar" - thanh loc + tao bai o dau feed kenh, thay the
// group nut "Đăng bài" don gian truoc day. Tab danh muc (All/Learning/
// Questions/Resources/Pinned/Mentors) LOC THAT + dem so luong THAT tu
// channel.messages/pinnedCount (khong bia so lieu ao nhu anh tham khao) -
// hang duoi (Mentor/Has File/Has Code/Most Helpful) cung loc/sap xep THAT
// vi deu suy tu field co san (authorBadge/attachmentName/codeBlock/reactions).
// "Newest"/"AI Picks"/"Unread"/"Video" la UI-only (chua co du lieu that ve
// thoi gian sap xep rieng, trang thai da doc, hay loai video) - CommunityChatView.tsx
// se KHONG loc theo may co nay, chi giu de dung bo cuc voi thiet ke tham khao.
export function KnowledgeCommandBar({
  channelName,
  totalCount,
  learningCount,
  questionCount,
  resourceCount,
  pinnedCount,
  mentorCount,
  filters,
  onFiltersChange,
  onCreatePost,
}: {
  channelName: string;
  totalCount: number;
  learningCount: number;
  questionCount: number;
  resourceCount: number;
  pinnedCount: number;
  mentorCount: number;
  filters: KnowledgeFilters;
  onFiltersChange: (filters: KnowledgeFilters) => void;
  onCreatePost: () => void;
}) {
  function setCategory(category: KnowledgeCategory) {
    onFiltersChange({ ...filters, category });
  }
  function toggle(key: keyof Omit<KnowledgeFilters, "category" | "search">) {
    onFiltersChange({ ...filters, [key]: !filters[key] });
  }

  const categories: {
    key: KnowledgeCategory;
    label: string;
    icon: typeof LayoutGrid;
    count: number;
  }[] = [
    { key: "all", label: "All", icon: LayoutGrid, count: totalCount },
    {
      key: "learning",
      label: "Learning",
      icon: NotebookPen,
      count: learningCount,
    },
    {
      key: "question",
      label: "Questions",
      icon: HelpCircle,
      count: questionCount,
    },
    {
      key: "resource",
      label: "Resources",
      icon: Paperclip,
      count: resourceCount,
    },
    { key: "pinned", label: "Pinned", icon: Pin, count: pinnedCount },
    { key: "mentor", label: "Mentors", icon: Users, count: mentorCount },
  ];

  return (
    <div className="mb-2 shrink-0 rounded-lg border border-community-accent/15 bg-linear-to-br from-community-accent/8 via-white to-white p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-sm font-bold text-community-accent">
          <Sparkles size={15} strokeWidth={2.25} />
          Knowledge Command Bar
        </p>
        <button
          type="button"
          onClick={onCreatePost}
          className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-community-accent px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-community-accent-hover"
        >
          <PenSquare size={13} strokeWidth={2.25} />
          Chia sẻ
        </button>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {categories.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => setCategory(key)}
            className={cn(
              "flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors duration-150 ease-out",
              filters.category === key
                ? "border-community-accent bg-white text-community-accent shadow-sm"
                : "border-border bg-white/60 text-ink-muted hover:bg-white",
            )}
          >
            <Icon size={13} strokeWidth={2.25} />
            {label} ({count})
          </button>
        ))}
      </div>
    </div>
  );
}
