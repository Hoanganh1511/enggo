"use client";

import { useState } from "react";
import {
  LayoutGrid,
  Flame,
  Star,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  X,
  FileText,
  BookOpen,
  FolderGit2,
  HelpCircle,
  Trophy,
  TrendingUp,
  CalendarDays,
  BarChart3,
  Hammer,
  Brain,
  Bot,
  Palette,
  Rocket,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  KNOWLEDGE_WORLDS,
  getWorldByTopicSlug,
} from "@/lib/discover/knowledge-worlds";
import { CONTENT_TYPES, type ContentType } from "@/lib/discover/post-kind-meta";

export type FeedMode = "activity" | "hot";

// Icon rieng cho tung Content Type - CHI la UI cua component nay (tach biet
// khoi data nhu quy uoc WORLD_ICON o duoi), truoc day nam trong
// HomeLayoutShell.tsx, dong bo dua ve day cung voi Content Type list.
const CONTENT_TYPE_ICON: Record<
  ContentType,
  { icon: typeof FileText; color: string }
> = {
  post: { icon: FileText, color: "#38bdf8" },
  resource: { icon: BookOpen, color: "#8b5cf6" },
  project: { icon: FolderGit2, color: "#6366f1" },
  question: { icon: HelpCircle, color: "#a855f7" },
  achievement: { icon: Trophy, color: "#fbbf24" },
  progress: { icon: TrendingUp, color: "#10b981" },
  event: { icon: CalendarDays, color: "#ec4899" },
  vote: { icon: BarChart3, color: "#fb7185" },
};

const WORLD_ICON: Record<string, typeof Hammer> = {
  build: Hammer,
  think: Brain,
  ai: Bot,
  create: Palette,
  career: Rocket,
  business: Briefcase,
};

const rowClass =
  "flex h-9 w-full shrink-0 cursor-pointer items-center gap-2 rounded-md px-3 text-left text-sm font-medium transition-colors duration-150 ease-out";
const rowActive = "bg-active-bg text-primary";
const rowInactive = "text-ink-muted hover:bg-hover-bg hover:text-ink";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pt-4 pb-1.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
      {children}
    </p>
  );
}

// Sidebar dieu huong trai cua trang Home - THAY the "Knowledge Discovery Bar"
// ngang truoc day (HomeCategoryBar.tsx da xoa) bang danh sach doc, tham khao
// dung layout sidebar that cua note.com: muc "Tat ca" tren cung, danh sach
// phang, nhom Knowledge World thu gon/mo rong duoc (accordion). Logic loc
// (query param world/topic/type/mode, quy tac reset Topic khi doi World) GIU
// NGUYEN Y HET - chi doi hinh thuc trinh bay tu ngang/pill sang doc/list, va
// gop them Content Type (truoc o rieng luoi trong HomeLayoutShell.tsx) vao
// chung sidebar nay.
export function HomeSidebar({
  mode,
  onModeChange,
  world,
  topic,
  onWorldChange,
  onTopicChange,
  type,
  onTypeChange,
}: {
  mode: FeedMode | string;
  onModeChange: (mode: FeedMode) => void;
  world: string | null;
  topic: string | null;
  onWorldChange: (world: string | null) => void;
  onTopicChange: (topic: string | null) => void;
  type: ContentType | null;
  onTypeChange: (type: ContentType) => void;
}) {
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);

  // Topic (neu co) luon "thang" world truyen tu URL - phong truong hop URL bi
  // sua tay lech nhau (topic thuoc world khac voi world param).
  const activeWorldSlug = topic
    ? (getWorldByTopicSlug(topic)?.slug ?? world)
    : world;
  const isAll = !activeWorldSlug && !type;

  const handleAllClick = () => {
    onWorldChange(null);
    onTopicChange(null);
  };

  const handleWorldClick = (slug: string) => {
    if (slug === activeWorldSlug) {
      onWorldChange(null);
      onTopicChange(null);
    } else {
      onWorldChange(slug);
      onTopicChange(null);
    }
  };

  const handleTopicClick = (slug: string) => {
    onTopicChange(slug === topic ? null : slug);
  };

  return (
    <aside className="flex w-46 shrink-0 flex-col gap-1 overflow-y-auto pb-6">
      <button
        type="button"
        onClick={handleAllClick}
        className={cn(rowClass, isAll ? rowActive : rowInactive)}
      >
        <LayoutGrid size={15} strokeWidth={1.75} className="shrink-0" />
        Tất cả
      </button>

      <div className="my-1 h-px shrink-0 bg-border" />

      <button
        type="button"
        onClick={() => onModeChange("activity")}
        className={cn(
          rowClass,
          mode === "activity" ? "bg-active-bg text-amber-500" : rowInactive,
        )}
      >
        <Flame size={15} strokeWidth={1.75} className="shrink-0" />
        Live
      </button>
      <button
        type="button"
        onClick={() => onModeChange("hot")}
        className={cn(
          rowClass,
          mode === "hot" ? "bg-active-bg text-violet-500" : rowInactive,
        )}
      >
        <Star size={15} strokeWidth={1.75} className="shrink-0" />
        Trending
      </button>

      <div className="my-1 h-px shrink-0 bg-border" />

      {/* Loai noi dung thu gon thanh 1 dropdown (thay vi 8 hang lien tiep) -
          8 hang day chiem qua nhieu chieu cao, day han "Kham pha chu de"
          xuong duoi phai cuon moi thay - trong khi Content Type la truc loc
          PHU, dung it hon Topic. */}
      <PopoverRoot open={typeMenuOpen} onOpenChange={setTypeMenuOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(rowClass, type ? rowActive : rowInactive)}
          >
            {(() => {
              const TriggerIcon = type ? CONTENT_TYPE_ICON[type].icon : SlidersHorizontal;
              return (
                <TriggerIcon size={15} strokeWidth={1.75} className="shrink-0" />
              );
            })()}
            <span className="flex-1 truncate">
              {type
                ? CONTENT_TYPES.find((ct) => ct.key === type)?.label
                : "Loại nội dung"}
            </span>
            <ChevronDown size={14} strokeWidth={1.75} className="shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          open={typeMenuOpen}
          align="start"
          className="z-50 w-52 rounded-lg border border-border bg-surface p-1.5 shadow-dropdown"
        >
          {type && (
            <button
              type="button"
              onClick={() => {
                onTypeChange(type);
                setTypeMenuOpen(false);
              }}
              className="mb-1 flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-danger transition-colors duration-150 ease-out hover:bg-hover-bg"
            >
              <X size={14} strokeWidth={1.75} className="shrink-0" />
              Bỏ chọn
            </button>
          )}
          {CONTENT_TYPES.map((ct) => {
            const { icon: Icon, color } = CONTENT_TYPE_ICON[ct.key];
            const active = ct.key === type;
            return (
              <button
                key={ct.key}
                type="button"
                onClick={() => {
                  onTypeChange(ct.key);
                  setTypeMenuOpen(false);
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors duration-150 ease-out",
                  active
                    ? "bg-active-bg font-medium text-primary"
                    : "text-ink hover:bg-hover-bg",
                )}
              >
                <Icon
                  size={15}
                  strokeWidth={1.75}
                  className="shrink-0"
                  style={{ color: active ? undefined : color }}
                />
                {ct.label}
              </button>
            );
          })}
        </PopoverContent>
      </PopoverRoot>

      <div className="my-1 h-px shrink-0 bg-border" />

      <SectionLabel>Khám phá chủ đề</SectionLabel>
      {KNOWLEDGE_WORLDS.map((w) => {
        const Icon = WORLD_ICON[w.slug];
        const active = w.slug === activeWorldSlug;
        return (
          <div key={w.slug} className="flex flex-col">
            <button
              type="button"
              onClick={() => handleWorldClick(w.slug)}
              className={cn(rowClass, active ? rowActive : rowInactive)}
            >
              <Icon size={15} strokeWidth={1.75} className="shrink-0" />
              <span className="flex-1 truncate">{w.label}</span>
              {active ? (
                <ChevronDown
                  size={14}
                  strokeWidth={1.75}
                  className="shrink-0"
                />
              ) : (
                <ChevronRight
                  size={14}
                  strokeWidth={1.75}
                  className="shrink-0"
                />
              )}
            </button>
            {active && (
              <div className="flex flex-col gap-0.5 py-1 pl-9">
                {w.topics.map((t) => {
                  const topicActive = t.slug === topic;
                  return (
                    <button
                      key={t.slug}
                      type="button"
                      onClick={() => handleTopicClick(t.slug)}
                      className={cn(
                        "flex h-7 shrink-0 cursor-pointer items-center rounded-md px-2 text-left text-xs font-medium transition-colors duration-150 ease-out",
                        topicActive
                          ? "bg-active-bg text-primary"
                          : "text-ink-faint hover:bg-hover-bg hover:text-ink-muted",
                      )}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}
