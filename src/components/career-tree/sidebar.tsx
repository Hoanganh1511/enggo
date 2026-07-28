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
  ChevronDown,
  ChevronRight,
  Plus,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Spinner from "@/components/ui/spinner";
import Logo from "@/components/ui/logo";
import NotificationBell from "./notification-bell";

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

type SidebarProps = {
  // Nhan san <Suspense><CurrentUser/></Suspense> tu layout.tsx (Server
  // Component) - cung ly do nhu accountSlot cua TopHeaderBar cu (xem
  // layout.tsx): Sidebar la "use client" nen khong tu import CurrentUser
  // truc tiep duoc (auth() se mat request context).
  accountSlot?: ReactNode;
};

const Sidebar = ({ accountSlot }: SidebarProps) => {
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

  // Nut "Dang bai": neu dang o /home thi focus thang vao PostComposer dang
  // co san (id "post-composer-input", xem PostComposer.tsx); tu trang khac
  // thi dieu huong ve /home kem query "compose=1" de PostComposer tu mo +
  // focus ngay sau khi mount (khong co composer o cac trang ngoai /home).
  const handleCompose = () => {
    if (pathname.startsWith("/home")) {
      document.getElementById("post-composer-input")?.focus();
      return;
    }
    router.push("/home?compose=1");
  };

  return (
    <nav className="flex w-56  flex-col overflow-y-auto   px-3 py-1">
      {/* Logo - chuyen tu TopHeaderBar cu vao day (xem layout.tsx, header
          ngang da comment lai, layout gio la 3 cot Sidebar/noi dung/panel
          phai). */}
      <div className="flex h-14 shrink-0 items-center gap-1 px-1">
        <Logo orientation="icon-only" className="size-6 shrink-0" />
        <span className="ml-1 text-sm font-bold text-ink">Tree Career</span>
      </div>

      <div className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(
          ({ title, icon: Icon, href, matchPrefixes, children }) => {
            const isActive = matchPrefixes
              ? matchPrefixes.some((prefix) => pathname.startsWith(prefix))
              : !!href && pathname === href;
            const isItemPending = isPending && pendingHref === href;
            const className = cn(
              "flex h-10.5 w-full shrink-0 cursor-pointer items-center gap-3 rounded-lg border border-transparent px-3 transition-all duration-200 hover:bg-hover-bg",
              isActive ? "bg-white/5 text-primary" : "text-icon",
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

                <span
                  className={cn(
                    "flex-1 truncate text-left text-[13px] tracking-[0.01em]",
                    isActive ? "font-bold" : "font-medium",
                  )}
                >
                  {title}
                </span>
                {children &&
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
                setExpandedGroup((v) => !v);
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

                {children && expandedGroup && (
                  <div className="mt-0.5 flex flex-col gap-0.5 pl-4.5">
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
                            "flex h-8.5 shrink-0 cursor-pointer items-center gap-2 rounded-lg px-3 text-left text-[13px] font-medium transition-colors duration-150 ease-out",
                            childActive
                              ? "bg-active-bg text-primary"
                              : "text-ink-muted hover:bg-hover-bg hover:text-ink",
                            !child.href && "cursor-default",
                          )}
                        >
                          <child.icon
                            size={14}
                            strokeWidth={1.75}
                            className="shrink-0"
                          />
                          <span className="flex-1 truncate">{child.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          },
        )}
        <button
          type="button"
          onClick={handleCompose}
          className="mt-3 flex h-10 w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-button-primary-bg text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-button-primary-hover"
        >
          <Plus size={16} strokeWidth={2.5} />
          Đăng bài
        </button>
      </div>

      {/* Nut Dang bai - dua nguoi dung ve /home va mo composer (xem
          handleCompose ben tren va PostComposer.tsx, doc query "compose"). */}

      {/* Cum ben phai cu (chat/thong bao/account) chuyen tu TopHeaderBar
          xuong day. AccountMenu (accountSlot) da tu hien avatar + dropdown
          ten/email/logout that (xem current-user.tsx), nen khong can hien
          lai profile mock rieng nhu truoc nua. */}
      <div className="mt-2 flex items-center justify-between gap-1  p-2 pt-3">
        {accountSlot}
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Tin nhắn (sắp ra mắt)"
            className="relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-icon transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-icon-hover"
          >
            <MessageCircle strokeWidth={1.75} className="size-4.5" />
          </button>
          <NotificationBell />
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
