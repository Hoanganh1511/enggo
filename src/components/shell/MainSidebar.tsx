"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  BookText,
  Home,
  Mail,
  Settings,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
  // "startsWith" cho route co con (vd /messages/x, /workspace/user/id) -
  // "exact" cho route can khop chinh xac (vd /home, tranh /home... khac vo tinh
  // active nham).
  match: "exact" | "startsWith";
};

// Sidebar icon doc, THEM MOI ben canh TopHeaderBar.tsx (KHONG thay the) theo
// yeu cau nguoi dung - khac voi AppSidebar.tsx cu (da bi xoa truoc day theo
// chinh yeu cau nguoi dung de chuyen sang header ngang kieu note.com, xem
// comment trong TopHeaderBar.tsx/(main)/layout.tsx). Lan nay ca 2 cung ton
// tai song song. Chi tro toi cac trang THAT da co san trong app (khong bia
// them trang moi) - vai muc trung voi AccountMenu (Workspace/Cai dat) la co
// chu dich, giong cach nhieu app (Slack, Notion) van lap lai 1 vai muc chinh
// o ca rail nhanh lan menu tai khoan.
function useSidebarItems(): SidebarItem[] {
  const { data: session } = useSession();
  const username = session?.username;
  return [
    {
      key: "home",
      label: "Trang chủ",
      icon: Home,
      href: "/home",
      match: "exact",
    },
    {
      key: "messages",
      label: "Tin nhắn",
      icon: Mail,
      href: "/messages",
      match: "startsWith",
    },
    {
      key: "communities",
      label: "Cộng đồng",
      icon: Users,
      href: "/communities",
      match: "startsWith",
    },
    {
      key: "contest",
      label: "Cuộc thi",
      icon: Trophy,
      href: "/contest",
      match: "startsWith",
    },
    {
      key: "workspace",
      label: "Không gian làm việc",
      icon: BookText,
      href: username ? `/workspace/${username}` : "#",
      match: "startsWith",
    },
    {
      key: "settings",
      label: "Cài đặt",
      icon: Settings,
      href: "/settings",
      match: "startsWith",
    },
  ];
}

export function MainSidebar() {
  const pathname = usePathname();
  const items = useSidebarItems();

  return (
    <aside
      className="flex h-full w-16 shrink-0 flex-col items-center gap-1 py-4 shadow-[2px_0_12px_rgba(0,0,0,.08)]"
      style={{ background: "#CC561E" }}
    >
      {items.map((item) => {
        const active =
          item.match === "exact"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.key}
            href={item.href}
            title={item.label}
            aria-label={item.label}
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-xl transition-colors duration-150 ease-out",
              active
                ? "bg-white text-[#FF9100] shadow-sm"
                : "text-white/75 hover:bg-white/15 hover:text-white",
            )}
          >
            <Icon size={20} strokeWidth={1.9} />
          </Link>
        );
      })}
    </aside>
  );
}
