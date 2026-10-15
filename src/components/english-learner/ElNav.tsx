"use client";

// [2026-10-15] Thanh dieu huong CHUNG cho moi trang English Learner - tuong
// duong "Breadcrumb"/"Sidebar" trong spec (muc 9 "Components") nhung don
// gian hoa thanh 1 hang tab ngang (khong phai sidebar doc rieng) - giu dung
// tinh than "minimal, editorial, calm... không tạo giao diện giống admin
// dashboard" thay vi ve them 1 sidebar moi chi de co.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, LayoutGrid, RotateCcw, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/learn", label: "Tổng quan", icon: Home },
  { href: "/courses", label: "Khóa học", icon: LayoutGrid },
  { href: "/vocabulary", label: "Từ vựng", icon: BookOpen },
  { href: "/mistakes", label: "Sổ lỗi sai", icon: XCircle },
  { href: "/reviews", label: "Ôn tập", icon: RotateCcw },
];

export function ElNav() {
  const pathname = usePathname();
  return (
    <nav className="mb-6 flex items-center gap-1 border-b border-border pb-0.5">
      {TABS.map((t) => {
        const active = pathname === t.href || pathname.startsWith(`${t.href}/`);
        const Icon = t.icon;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-[13px] font-medium transition-colors",
              active
                ? "border-primary text-ink"
                : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            <Icon size={14} aria-hidden="true" />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
