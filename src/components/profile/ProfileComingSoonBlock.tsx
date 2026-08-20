import type { LucideIcon } from "lucide-react";

// Placeholder trung thuc cho cac khoi Universe/Journey/Projects/Activity/
// Metric (port tu source treecareer-profile-universe-v2) - CHUA co du lieu
// that o backend (khong co skill tree/timeline/projects/activity log rieng,
// xem khao sat truoc khi lam) nen KHONG bia du lieu gia, chi 1 trang thai
// rong trung thuc giu dung khung/vi tri nhu thiet ke goc (cung nguyen tac da
// dung o GroupSectionPlaceholder.tsx ben Workspace). Mau navy/paper CO DINH
// theo dung concept cua source, khong dung token var(--...) chung cua app -
// giong tinh than cac component "reactor" khac da duoc ghi nhan ngoai le.
export function ProfileComingSoonBlock({
  icon: Icon,
  title,
  description,
  minHeight,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  minHeight?: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-[0_2px_12px_rgba(15,23,42,.03)]"
      style={minHeight ? { minHeight } : undefined}
    >
      <span className="grid size-11 place-items-center rounded-full bg-[#f4f3ed] text-[#5a4ccf]">
        <Icon size={20} strokeWidth={1.6} />
      </span>
      <h3 className="font-hand text-[19px] font-semibold text-[#182338]">
        {title}
      </h3>
      <p className="max-w-xs text-[11.5px] leading-5 text-slate-500">
        {description}
      </p>
      <span className="rounded-full bg-[#f0edff] px-2.5 py-1 text-[9px] font-bold tracking-wide text-[#5a4ccf]">
        SẮP RA MẮT
      </span>
    </div>
  );
}
