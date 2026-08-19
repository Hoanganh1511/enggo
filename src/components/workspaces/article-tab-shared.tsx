import type { Variants } from "framer-motion";

// Variants dung chung cho noi dung ben trong bo tab Overview/Outline/Resources
// (ArticleTabs.tsx va cac tab con) - moi section fade+truot len 1 chut, cac
// section CON trong 1 tab no ra lan luot (staggerChildren) thay vi hien cung
// luc, dong bo cam giac voi cach panel/toolbar khac trong khu vuc workspace.
export const sidebarStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045 } },
};

export const sidebarFadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function SidebarSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-2 text-[9px] font-bold tracking-wide"
      style={{ color: "var(--ink-faint)" }}
    >
      {children}
    </div>
  );
}

// The metric nho (icon + nhan + tri) dung chung trong panel Tong quan -
// ArticleOverview.tsx (so lieu bai viet) va GroupProgressWidget.tsx (so lieu
// nhom). Dat o day (khong phai trong ArticleOverview.tsx) de tranh import
// vong: GroupProgressWidget can dung lai component nay nhung ArticleOverview
// lai can render GroupProgressWidget.
export function SidebarMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="rounded-[11px] p-2.5"
      style={{
        border: "1px solid var(--border)",
        background: "var(--surface-muted)",
      }}
    >
      <div
        className="flex items-center gap-1 text-[9px]"
        style={{ color: "var(--ink-faint)" }}
      >
        {icon}
        {label}
      </div>
      <div
        className="mt-1 truncate text-[12px] font-semibold"
        style={{ color: "var(--ink)" }}
      >
        {value}
      </div>
    </div>
  );
}
