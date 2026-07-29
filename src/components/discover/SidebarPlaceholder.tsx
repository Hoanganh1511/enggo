import { Sparkles, type LucideIcon } from "lucide-react";

// Placeholder tam thoi cho 2 sidebar canh feed "Bai dang" (xem
// app/(main)/home/page.tsx) - CHUA co noi dung that, chi giu cho truoc theo
// yeu cau "cho truoc, noi dung sau". Thay/xoa component nay khi co noi dung
// that cho tung ben.
export function SidebarPlaceholder({
  label,
  icon: Icon = Sparkles,
  widthClass = "w-64",
}: {
  label: string;
  icon?: LucideIcon;
  /** Tailwind width class - cho phep 2 ben rong khac nhau (vd trai hep hon
      phai) tuy noi dung du kien cua tung ben, mac dinh w-64. */
  widthClass?: string;
}) {
  return (
    <aside
      className={`flex ${widthClass} shrink-0 flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-surface px-4 py-10 text-center`}
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-surface-muted text-ink-faint">
        <Icon size={16} strokeWidth={1.75} />
      </span>
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <p className="text-[11px] text-ink-faint">
        Nội dung sẽ được cập nhật sau
      </p>
    </aside>
  );
}

export default SidebarPlaceholder;
