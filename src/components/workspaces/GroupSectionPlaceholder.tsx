"use client";

import type { LucideIcon } from "lucide-react";

// "Sap ra mat" - dung cho cac muc nav DA CO tren GroupSidebar.tsx nhung CHUA
// xay trang that (Roadmap/Kien thuc/Muc tieu/Viec can lam/On tap/Tien do/
// Thanh vien/Cai dat) trong dot refactor IA nay. Co CHU DICH khong hien du
// lieu gia (theo yeu cau "không tạo fake functionality giả vờ hoạt động") -
// chi 1 trang thai rong trung thuc, dieu huong/nhan dien duoc, cho phase sau
// thay the bang noi dung that.
export function GroupSectionPlaceholder({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <span
        className="flex size-12 items-center justify-center rounded-full"
        style={{ background: "var(--surface-muted)", color: "var(--ink-faint)" }}
      >
        <Icon size={22} strokeWidth={1.5} />
      </span>
      <div>
        <h2 className="text-[15px] font-semibold" style={{ color: "var(--ink)" }}>
          {title}
        </h2>
        <p className="mt-1 max-w-xs text-[12.5px] leading-relaxed" style={{ color: "var(--ink-faint)" }}>
          {description}
        </p>
      </div>
      <span
        className="rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide"
        style={{ background: "var(--active-bg)", color: "var(--primary)" }}
      >
        SẮP RA MẮT
      </span>
    </div>
  );
}
