"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { HeaderServicesPopover } from "./HeaderServicesPopover";

type NavItem = {
  key: string;
  label: string;
  href: string;
  match: "exact" | "startsWith";
};

// Nav ngang o giua header (thay cho o tim kiem cu) - CHI tro toi trang THAT
// da co san trong app (giong nguyen tac da ap dung o MainSidebar.tsx da bo),
// KHONG dung mega-menu dropdown nhu anh mau nguoi dung dua (Products/
// Resources co dropdown) vi app khong co du lieu danh muc con that de hien -
// bia dropdown rong se vi pham nguyen tac "khong tao fake functionality".
// Rieng "Services" (thay cho "Tin nhắn" cu, "Trang chủ" da bo hang) LA popover
// that (HeaderServicesPopover.tsx) vi 6 dich vu GL o /home la du lieu THAT -
// /messages van con loi vao qua icon MessageCircle o cum ben phai header
// (TopHeaderBar.tsx) nen doi text muc nay khong mat chuc nang gi.
// "Không gian làm việc" trung voi 1 muc trong AccountMenu.tsx - co chu dich
// (xem comment tuong tu trong MainSidebar.tsx da bo, van giu tinh than do).
function useNavItems(): NavItem[] {
  const { data: session } = useSession();
  const username = session?.username;
  return [
    { key: "docs", label: "Docs", href: "/docs", match: "startsWith" },
    { key: "pricing", label: "Pricing", href: "/pricing", match: "startsWith" },
    // { key: "communities", label: "Cộng đồng", href: "/communities", match: "startsWith" },
    // { key: "contest", label: "Cuộc thi", href: "/contest", match: "startsWith" },
    // {
    //   key: "workspace",
    //   label: "Không gian làm việc",
    //   href: username ? `/workspace/${username}` : "/home",
    //   match: "startsWith",
    // },
  ];
}

export function HeaderNav() {
  const pathname = usePathname();
  const items = useNavItems();

  return (
    <nav className="hidden items-center gap-1 md:flex">
      <HeaderServicesPopover />
      {items.map((item) => {
        const active =
          item.match === "exact"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap text-ink transition-colors duration-150 ease-out",
              active ? "bg-primary-soft text-primary" : "hover:bg-hover-bg",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
