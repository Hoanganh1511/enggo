"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
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
  ChevronDown,
  ChevronRight,
  Lock,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Spinner from "@/components/ui/spinner";
import {
  getServerSnapshot,
  getSidebarCollapsed,
  setSidebarCollapsed,
  subscribeSidebarCollapsed,
} from "@/lib/career-tree/sidebar-collapsed-store";
import { profile } from "@/content/user-profile";
import AppSwitcherMenu from "./app-switcher-menu";
import Logo from "../ui/logo";

// Con "Skill Tree" nam trong nhom "My Town" ben duoi - cac muc nay TRUOC O
// day la inner-nav rieng cua trang Skill Tree (SkillTreeSidebar.tsx), gio
// gop het vao sidebar chinh de dieu huong nhat quan tu bat ky trang nao.
// Chi "Skill Tree" co href/man hinh that, 7 muc con lai la placeholder
// "Upcoming" (giu nguyen y nghia nhu ban INNER_NAV cu).
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
  {
    key: "achievements",
    title: "Achievements",
    icon: Trophy,
    available: false,
  },
  { key: "goals", title: "Goals", icon: Target, available: false },
  { key: "notes", title: "Notes", icon: StickyNote, available: false },
];

// href co the thieu (Cai dat chua co route that) - cac item nay van la
// button tinh nhu cu, chi item co href moi dieu huong that. "Career Tree" va
// "Skill Tree" (trong "My Town") deu la trampoline (redirect sang workspace
// dau tien) nen pathname THAT SU sau khi vao se khac han href. matchPrefixes
// liet ke moi prefix duoc tinh la "dang o muc nay" de highlight dung, doc
// lap voi href (noi dieu huong toi khi bam).
const NAV_ITEMS: {
  title: string;
  icon: typeof Home;
  href?: string;
  matchPrefixes?: string[];
  children?: NavChild[];
}[] = [
  {
    title: "Trang chủ",
    icon: Home,
    href: "/home",
    matchPrefixes: ["/home"],
  },
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
    icon: Home,
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

const Sidebar = () => {
  const isCollapsed = useSyncExternalStore(
    subscribeSidebarCollapsed,
    getSidebarCollapsed,
    getServerSnapshot,
  );
  const toggleCollapsed = () => setSidebarCollapsed(!isCollapsed);
  const pathname = usePathname();

  const router = useRouter();
  // "/career-tree", "/home", "/skill-tree" deu la trampoline can fetch du
  // lieu (workspace list, roi tiers/nodes cua trang dich) truoc khi render
  // xong - Link thuan khong co phan hoi gi trong luc do nen cam giac "cham"
  // du navigation thuc chat van chay. useTransition + router.push() (dung
  // pattern da co o workspace-switcher.tsx) de hien spinner ngay tai item
  // dang cho, thay vi im lang cho tan luc trang moi render.
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  // Mac dinh mo "My Town" neu dang o trong /skill-tree, nguoc lai thu gon -
  // sau do nguoi dung tu bam mo/dong, khong dong bo lai theo pathname nua.
  const [expandedGroup, setExpandedGroup] = useState(
    () => true,
    // pathname.startsWith("/skill-tree"),
  );

  const handleNavigate = (href: string) => {
    if (pathname === href) return;
    setPendingHref(href);
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <nav
      className={`z-10 fixed inset-y-0 shadow-sm left-0 flex shrink-0 flex-col overflow-y-auto border-r border-border bg-surface px-4 py-2 transition-[width] duration-200 ${
        isCollapsed ? "w-16 items-center" : "w-66"
      }`}
    >
      <div
        className={`flex items-center gap-1 ${isCollapsed ? "justify-center" : "w-58"}`}
      >
        {!isCollapsed && (
          <>
            <AppSwitcherMenu />
            <div className="flex items-center">
              <Logo orientation="icon-only" className="size-6 shrink-0" />
              <span className="ml-1 text-sm font-bold text-ink">
                Tree Career
              </span>
            </div>
          </>
        )}
        <button
          type="button"
          title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          onClick={toggleCollapsed}
          className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-icon transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-icon-hover ${
            isCollapsed ? "" : "ml-auto"
          }`}
        >
          {isCollapsed ? (
            <PanelLeftOpen strokeWidth={1.75} className="size-4.5" />
          ) : (
            <PanelLeftClose strokeWidth={1.75} className="size-4.5" />
          )}
        </button>
      </div>
      <div className="py-4 flex flex-1 flex-col gap-1.5">
        {NAV_ITEMS.map(
          ({ title, icon: Icon, href, matchPrefixes, children }) => {
            const isActive = matchPrefixes
              ? matchPrefixes.some((prefix) => pathname.startsWith(prefix))
              : !!href && pathname === href;
            const isItemPending = isPending && pendingHref === href;
            const className = cn(
              "flex h-11 shrink-0 cursor-pointer items-center gap-3 rounded-md border border-transparent transition-all duration-200 hover:bg-hover-bg",
              isActive ? "bg-active-bg text-primary" : "text-icon",
              isCollapsed ? "w-11 justify-center" : "w-full px-4",
            );

            const content = (
              <>
                {isItemPending ? (
                  <Spinner size={18} className="shrink-0" />
                ) : (
                  <Icon
                    strokeWidth={isActive ? 2.5 : 1.75}
                    className="size-4.5 shrink-0"
                  />
                )}

                {!isCollapsed && (
                  <span className="flex-1 truncate text-left text-[13px] font-semibold tracking-[0.01em]">
                    {title}
                  </span>
                )}
                {!isCollapsed &&
                  children &&
                  (expandedGroup ? (
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
                  ))}
              </>
            );

            const handleClick = () => {
              if (children) {
                // Sidebar dang thu gon (chi con icon) thi khong co cho hien
                // danh sach con - bam vao thi di thang toi "Skill Tree" (muc
                // duy nhat co man hinh that trong nhom).
                if (isCollapsed) {
                  const skillTree = children.find((c) => c.href);
                  if (skillTree?.href) handleNavigate(skillTree.href);
                } else {
                  setExpandedGroup((v) => !v);
                }
                return;
              }
              if (href) handleNavigate(href);
            };

            return (
              <div key={title}>
                <button
                  type="button"
                  title={title}
                  disabled={!href && !children}
                  onClick={handleClick}
                  className={cn(
                    className,
                    !href && !children && "cursor-default",
                  )}
                >
                  {content}
                </button>

                {children && expandedGroup && !isCollapsed && (
                  <div className="mt-1 flex flex-col gap-0.5 pl-4">
                    {children.map((child) => {
                      const childActive = child.matchPrefixes
                        ? child.matchPrefixes.some((prefix) =>
                            pathname.startsWith(prefix),
                          )
                        : !!child.href && pathname === child.href;
                      const childPending =
                        isPending && pendingHref === child.href;
                      return (
                        <button
                          key={child.key}
                          type="button"
                          title={child.title}
                          disabled={!child.href || childPending}
                          onClick={() =>
                            child.href && handleNavigate(child.href)
                          }
                          className={cn(
                            "flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-md px-3 text-left text-[13px] font-medium transition-colors duration-150 ease-out",
                            childActive
                              ? "bg-active-bg text-primary"
                              : "text-ink-muted hover:bg-hover-bg hover:text-ink",
                            !child.href && "cursor-default",
                          )}
                        >
                          {childPending ? (
                            <Spinner size={14} className="shrink-0" />
                          ) : (
                            <child.icon
                              size={14}
                              strokeWidth={1.75}
                              className="shrink-0"
                            />
                          )}
                          <span className="flex-1 truncate">{child.title}</span>
                          <span
                            className={`shrink-0 rounded-full   text-[10px] font-medium ${
                              child.available
                                ? " text-emerald-600 dark:text-emerald-400"
                                : " text-ink-faint"
                            }`}
                          >
                            {child.available ? <></> : <Lock size={13} />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          },
        )}
      </div>
      <div
        className={`flex items-center gap-2 p-2 ${isCollapsed ? "justify-center" : ""}`}
      >
        <span
          title={isCollapsed ? profile.name : undefined}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-sky-500 text-sm font-semibold text-white"
        >
          {profile.name.charAt(0)}
        </span>
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-semibold text-ink">
                {profile.name}
              </p>
              <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                {profile.planLabel}
              </span>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Sidebar;
