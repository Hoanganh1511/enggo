"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Compass,
  Hash,
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
  Cpu,
  Palette,
  Megaphone,
  Briefcase,
  Wallet,
  Users,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import type { FeedCategoryGroup } from "@/lib/api/feed-categories";
import { CONTENT_TYPES, type ContentType } from "@/lib/discover/post-kind-meta";

// Icon rieng cho tung Content Type - CHI la UI cua component nay, truoc day
// nam trong HomeLayoutShell.tsx, dong bo dua ve day cung voi Content Type list.
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

// Icon nhom nghe nghiep - map tu `icon` (slug lucide) backend tra ve. Dung
// map tuong minh thay vi tra cuu dong trong lucide-react de tree-shaking van
// hoat dong va khong bao gio render ra undefined.
const GROUP_ICON: Record<string, LucideIcon> = {
  cpu: Cpu,
  palette: Palette,
  megaphone: Megaphone,
  briefcase: Briefcase,
  wallet: Wallet,
  users: Users,
  "graduation-cap": GraduationCap,
};

const rowClass =
  "flex h-9 w-full shrink-0 cursor-pointer items-center gap-2 rounded-md px-3 text-left text-sm font-medium transition-colors duration-150 ease-out";
const rowActive = "text-primary";
const rowInactive = "text-ink-muted hover:bg-hover-bg hover:text-ink";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pt-4 pb-1.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
      {children}
    </p>
  );
}

export function HomeSidebar({
  categoryTree,
  group,
  field,
  onGroupChange,
  onFieldChange,
  type,
  onTypeChange,
  onClearAll,
}: {
  // Cay nghe nghiep 2 tang lay tu GET /feed/categories/tree (fetch o layout,
  // xem home/layout.tsx) - THAY THE cay "Khám phá chủ đề" (Knowledge Worlds)
  // hardcode truoc day. Backend da an san nhom rong va sap nhom soi dong nhat
  // len dau nen o day chi render theo dung thu tu nhan duoc.
  categoryTree: FeedCategoryGroup[];
  group: string | null;
  field: string | null;
  onGroupChange: (group: string | null) => void;
  onFieldChange: (field: string | null) => void;
  type: ContentType | null;
  onTypeChange: (type: ContentType) => void;
  // Xoa CA group+field+type trong 1 lan push (khong the ghep tu cac handler
  // rieng le - neu group/field von da rong san thi lenh do khong doi gi URL
  // ca, con onTypeChange chi biet TOGGLE 1 type cu the chu khong biet cach
  // "xoa hang bat ky dang chon" - day chinh la bug "bam Tat ca khong thay gi"
  // da gap).
  onClearAll: () => void;
}) {
  const pathname = usePathname();
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  // Mac dinh MO HET moi nhom lan dau load (yeu cau da chot). Tach rieng khoi
  // filter dang chon: bam ten nhom = loc theo ca nhom, bam mui ten = chi
  // mo/dong danh sach con.
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(categoryTree.map((g) => g.slug)),
  );

  // Sidebar dung chung cho /home, /communities va /contest (xem
  // HomeLayoutShell.tsx) nen trang thai active phai xet CA route: cac bo loc
  // chi thuoc ve feed.
  const onCommunities = pathname.startsWith("/communities");
  const onContest = pathname.startsWith("/contest");
  const onFeed = !onCommunities && !onContest;

  // Nhom cha dang active: suy tu field dang chon neu co, khong thi lay group.
  const activeGroupSlug =
    (field
      ? categoryTree.find((g) => g.categories.some((c) => c.slug === field))
          ?.slug
      : null) ?? group;
  const isAll = onFeed && !activeGroupSlug && !field && !type;

  // Goi DUY NHAT onGroupChange - handleGroupChange ben HomeLayoutShell.tsx da
  // tu xoa `field` ATOMIC trong cung 1 pushParams (tach lam 2 lenh se dinh
  // dung race condition da sua o ban Knowledge World truoc day: searchParams
  // chua kip cap nhat giua 2 lenh nen lenh sau doc lai URL cu roi de mat thay
  // doi cua lenh truoc).
  const handleGroupClick = (slug: string) => {
    onGroupChange(slug === activeGroupSlug ? null : slug);
  };

  const handleFieldClick = (slug: string) => {
    onFieldChange(slug === field ? null : slug);
  };

  return (
    // sticky top-4: dinh sidebar tai vi tri cach dinh vung cuon 16px (khop
    // pt-4 cua hang cha trong HomeLayoutShell.tsx), khong troi theo feed khi
    // cuon xuong. max-h+overflow-y-auto rieng de van tu cuon duoc NEU noi dung
    // sidebar cao hon man hinh, khong bi cat mat.
    <aside className="sticky top-4 flex max-h-[calc(100vh-2rem)] w-56 shrink-0 flex-col gap-1 overflow-y-auto pb-6">
      <button
        type="button"
        onClick={onClearAll}
        className={cn(rowClass, isAll ? "text-sky-500" : rowInactive)}
      >
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full text-white transition-opacity duration-150 ease-out",
            !isAll && "opacity-40",
          )}
          style={{ background: "#0ea5e9" }}
        >
          <LayoutGrid size={13} strokeWidth={2.25} />
        </span>
        Tất cả
      </button>

      <div className="my-1 h-px shrink-0 bg-border" />

      {/* 2 route rieng (khong phai filter cua feed) nen active xet theo
          PATHNAME chu khong theo query param nhu cac hang con lai. */}
      <Link
        href="/communities"
        className={cn(rowClass, onCommunities ? "text-amber-500" : rowInactive)}
      >
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full text-white transition-opacity duration-150 ease-out",
            !onCommunities && "opacity-40",
          )}
          style={{ background: "#f59e0b" }}
        >
          <Compass size={13} strokeWidth={2.25} />
        </span>
        Đi cùng mọi người
      </Link>

      <Link
        href="/contest"
        className={cn(rowClass, onContest ? "text-rose-500" : rowInactive)}
      >
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full text-white transition-opacity duration-150 ease-out",
            !onContest && "opacity-40",
          )}
          style={{ background: "#f43f5e" }}
        >
          <Hash size={13} strokeWidth={2.25} />
        </span>
        Chủ đề & Cuộc thi
      </Link>

      <div className="my-1 h-px shrink-0 bg-border" />

      {/* Loai noi dung thu gon thanh 1 dropdown (thay vi 8 hang lien tiep) -
          8 hang day chiem qua nhieu chieu cao, day han cay linh vuc xuong
          duoi phai cuon moi thay - trong khi Content Type la truc loc PHU. */}
      <PopoverRoot open={typeMenuOpen} onOpenChange={setTypeMenuOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(rowClass, type ? rowActive : rowInactive)}
          >
            {(() => {
              const TriggerIcon = type
                ? CONTENT_TYPE_ICON[type].icon
                : SlidersHorizontal;
              return (
                <TriggerIcon
                  size={15}
                  strokeWidth={1.75}
                  className="shrink-0"
                />
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
                    ? "font-medium text-primary"
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

      <SectionLabel>Lĩnh vực nghề nghiệp</SectionLabel>
      {categoryTree.map((g) => {
        // "Chia sẻ chung" (bai khong gan nganh nghe) khong co nhom con - render
        // nhu 1 hang phang, khong co mui ten mo/dong.
        const isLeafGroup = g.categories.length === 0;
        const Icon = GROUP_ICON[g.icon ?? ""] ?? Sparkles;
        const active = g.slug === activeGroupSlug;
        const isOpen = expandedGroups.has(g.slug);

        if (isLeafGroup) {
          return (
            <button
              key={g.slug}
              type="button"
              onClick={() => handleFieldClick(g.slug)}
              className={cn(
                rowClass,
                g.slug === field ? rowActive : rowInactive,
              )}
            >
              <Icon size={15} strokeWidth={1.75} className="shrink-0" />
              <span className="flex-1 truncate">{g.name}</span>
              <span className="shrink-0 text-[11px] text-ink-faint">
                {g.postCount}
              </span>
            </button>
          );
        }

        return (
          <div key={g.slug} className="flex flex-col">
            {/* Hang chia 2 vung bam doc lap: icon+ten LOC theo ca nhom, mui
                ten CHI mo/dong danh sach con - khong dung cham filter. */}
            <div
              className={cn(
                "flex h-9 w-full shrink-0 items-center rounded-md text-sm font-medium transition-colors duration-150 ease-out",
                active ? rowActive : rowInactive,
              )}
            >
              <button
                type="button"
                onClick={() => handleGroupClick(g.slug)}
                className="flex h-full min-w-0 flex-1 cursor-pointer items-center gap-2 px-3 text-left"
              >
                <Icon size={15} strokeWidth={1.75} className="shrink-0" />
                <span className="flex-1 truncate">{g.name}</span>
              </button>
              <button
                type="button"
                aria-label={isOpen ? "Thu gọn" : "Mở rộng"}
                onClick={() =>
                  setExpandedGroups((prev) => {
                    const next = new Set(prev);
                    if (next.has(g.slug)) next.delete(g.slug);
                    else next.add(g.slug);
                    return next;
                  })
                }
                className="flex h-full w-8 shrink-0 cursor-pointer items-center justify-center"
              >
                {isOpen ? (
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
            </div>
            {isOpen && (
              <div className="flex flex-col gap-0.5 py-1 pl-9">
                {g.categories.map((c) => {
                  const fieldActive = c.slug === field;
                  return (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => handleFieldClick(c.slug)}
                      className={cn(
                        "flex h-7 shrink-0 cursor-pointer items-center gap-2 rounded-md px-2 text-left text-xs font-medium transition-colors duration-150 ease-out",
                        fieldActive
                          ? "text-primary"
                          : "text-ink-faint hover:bg-hover-bg hover:text-ink-muted",
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate">{c.name}</span>
                      <span className="shrink-0 text-[10px] text-ink-faint">
                        {c.postCount}
                      </span>
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
