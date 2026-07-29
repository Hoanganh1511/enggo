"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Settings,
  TreePine,
  Building2,
  Compass,
  Hexagon,
  Orbit,
  Mountain,
  History,
  Trophy,
  Target,
  StickyNote,
  Bookmark,
  ChevronDown,
  MessageCircle,
  Plus,
  Search,
} from "lucide-react";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Spinner from "@/components/ui/spinner";
import Logo from "../ui/logo";
import NotificationBell from "./notification-bell";

// Cac muc con cua "My Town" - truoc la inner-nav cua trang Skill Tree, roi
// thanh nhom xo xuong trong Sidebar, gio la dropdown tren header. Chi "Skill"
// co man hinh that, 7 muc con lai van la placeholder "Sắp có".
type NavChild = {
  key: string;
  title: string;
  icon: typeof Home;
  href?: string;
  matchPrefixes?: string[];
  available: boolean;
};

const MY_TOWN_CHILDREN: NavChild[] = [
  { key: "overview", title: "Overview", icon: Compass, available: false },
  {
    key: "skill",
    title: "Skill",
    icon: Hexagon,
    href: "/skill-tree",
    matchPrefixes: ["/skill-tree"],
    available: true,
  },
  { key: "galaxy-view", title: "Galaxy View", icon: Orbit, available: false },
  { key: "skyline", title: "Skyline", icon: Mountain, available: false },
  { key: "timeline", title: "Timeline", icon: History, available: false },
  { key: "achievements", title: "Achievements", icon: Trophy, available: false },
  { key: "goals", title: "Goals", icon: Target, available: false },
  { key: "notes", title: "Notes", icon: StickyNote, available: false },
];

// "Career Tree" va "Skill Tree" deu la trampoline (redirect sang workspace dau
// tien) nen pathname THAT SU sau khi vao khac han href - matchPrefixes liet ke
// moi prefix duoc tinh la "dang o muc nay" de highlight dung, doc lap voi href.
const NAV_ITEMS: {
  title: string;
  icon: typeof Home;
  href?: string;
  matchPrefixes?: string[];
  children?: NavChild[];
}[] = [
  { title: "Trang chủ", icon: Home, href: "/home", matchPrefixes: ["/home"] },
  {
    title: "Career Tree",
    icon: TreePine,
    href: "/career-tree",
    matchPrefixes: ["/career-tree", "/w/"],
  },
  {
    title: "My Town",
    icon: Building2,
    matchPrefixes: ["/skill-tree"],
    children: MY_TOWN_CHILDREN,
  },
  {
    title: "Bookmarks",
    icon: Bookmark,
    href: "/bookmarks",
    matchPrefixes: ["/bookmarks"],
  },
  {
    title: "Cài đặt",
    icon: Settings,
    href: "/settings",
    matchPrefixes: ["/settings"],
  },
];

const iconButtonClass =
  "relative flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-icon transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-icon-hover";

type TopHeaderBarProps = {
  // Nhan san <Suspense><CurrentUser/></Suspense> tu layout.tsx (Server
  // Component) thay vi tu import CurrentUser o day - vi day la "use client",
  // neu tu import va render 1 Server Component ngay trong JSX cua no thi
  // Server Component do MAT request context (headers()/cookies() ben trong
  // auth() se bao loi "outside a request scope"). Server Component chi duoc
  // compose vao Client Component qua props/children dung tu phia Server.
  accountSlot: ReactNode;
};

// Header ngang la thanh dieu huong DUY NHAT cua app - toan bo chuc nang cua
// Sidebar cu (logo, nhom nav, My Town, nut Dang bai, tin nhan, thong bao,
// account) da gom het len day, khong con cot trai nua.
const TopHeaderBar = ({ accountSlot }: TopHeaderBarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  // Cac muc trampoline can fetch du lieu truoc khi render xong - Link thuan
  // khong co phan hoi gi trong luc do nen cam giac "cham". useTransition +
  // router.push() de hien spinner ngay tai muc dang cho.
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [townOpen, setTownOpen] = useState(false);

  const handleNavigate = (href: string) => {
    if (pathname === href) return;
    setPendingHref(href);
    startTransition(() => router.push(href));
  };

  // Nut "Dang bai": dang o /home thi focus thang vao PostComposer co san (id
  // "post-composer-input"); tu trang khac thi ve /home kem query "compose=1"
  // de composer tu mo + focus sau khi mount.
  const handleCompose = () => {
    if (pathname.startsWith("/home")) {
      document.getElementById("post-composer-input")?.focus();
      return;
    }
    router.push("/home?compose=1");
  };

  return (
    <header className="z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-surface px-4 xl:px-6">
      <div className="flex shrink-0 items-center">
        <Logo orientation="icon-only" className="size-6 shrink-0" />
        <span className="ml-1 hidden text-sm font-bold text-ink sm:inline">
          Tree Career
        </span>
      </div>

      {/* Nhom dieu huong chinh */}
      <nav className="ml-2 flex shrink-0 items-center gap-0.5">
        {NAV_ITEMS.map(({ title, icon: Icon, href, matchPrefixes, children }) => {
          const isActive = matchPrefixes
            ? matchPrefixes.some((prefix) => pathname.startsWith(prefix))
            : !!href && pathname === href;
          const isItemPending = isPending && pendingHref === href;

          const itemClass = cn(
            "flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-[13px] transition-colors duration-150 ease-out",
            isActive
              ? "bg-active-bg font-semibold text-primary"
              : "font-medium text-ink-muted hover:bg-hover-bg hover:text-ink",
          );

          const label = (
            <span className="hidden truncate lg:inline">{title}</span>
          );

          if (children) {
            return (
              <PopoverRoot
                key={title}
                open={townOpen}
                onOpenChange={setTownOpen}
              >
                <PopoverTrigger asChild>
                  <button type="button" title={title} className={itemClass}>
                    <Icon
                      strokeWidth={isActive ? 2.25 : 1.75}
                      className="size-4.5 shrink-0"
                    />
                    {label}
                    <ChevronDown
                      size={13}
                      strokeWidth={1.75}
                      className="shrink-0"
                    />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  open={townOpen}
                  align="start"
                  className="z-50 w-56 rounded-lg border border-border bg-surface p-1.5 shadow-dropdown"
                >
                  {children.map((child) => {
                    const childActive = child.matchPrefixes
                      ? child.matchPrefixes.some((p) => pathname.startsWith(p))
                      : !!child.href && pathname === child.href;
                    return (
                      <button
                        key={child.key}
                        type="button"
                        disabled={!child.href}
                        onClick={() => {
                          if (!child.href) return;
                          setTownOpen(false);
                          handleNavigate(child.href);
                        }}
                        className={cn(
                          "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors duration-150 ease-out",
                          childActive
                            ? "bg-active-bg font-medium text-primary"
                            : "text-ink hover:bg-hover-bg",
                          !child.href &&
                            "cursor-not-allowed text-ink-faint hover:bg-transparent",
                        )}
                      >
                        <child.icon
                          size={15}
                          strokeWidth={1.75}
                          className="shrink-0"
                        />
                        <span className="flex-1 truncate">{child.title}</span>
                        {!child.available && (
                          <span className="text-[10px] text-ink-faint">
                            Sắp có
                          </span>
                        )}
                      </button>
                    );
                  })}
                </PopoverContent>
              </PopoverRoot>
            );
          }

          return (
            <button
              key={title}
              type="button"
              title={title}
              onClick={() => href && handleNavigate(href)}
              className={itemClass}
            >
              {isItemPending ? (
                <Spinner size={18} className="shrink-0" />
              ) : (
                <Icon
                  strokeWidth={isActive ? 2.25 : 1.75}
                  className="size-4.5 shrink-0"
                />
              )}
              {label}
            </button>
          );
        })}
      </nav>

      {/* O tim kiem - chiem phan con lai, gioi han be ngang cho de doc */}
      <div className="ml-2 hidden min-w-0 flex-1 justify-center md:flex">
        <div className="flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-search-border bg-surface-muted px-3 text-ink-faint">
          <Search size={15} strokeWidth={1.75} className="shrink-0" />
          <input
            placeholder="Tìm kiếm các kỹ năng, con người..."
            className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px]">
            ⌘K
          </span>
        </div>
      </div>

      {/* Cum ben phai */}
      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={handleCompose}
          className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-md bg-button-primary-bg px-3 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-button-primary-hover"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span className="hidden sm:inline">Đăng bài</span>
        </button>
        <button
          type="button"
          title="Tin nhắn (sắp ra mắt)"
          className={iconButtonClass}
        >
          <MessageCircle strokeWidth={1.75} className="size-4.5" />
        </button>
        <NotificationBell />
        {accountSlot}
      </div>
    </header>
  );
};

export default TopHeaderBar;
