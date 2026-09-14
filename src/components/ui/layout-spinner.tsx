import Spinner from "./spinner";
import { cn } from "@/lib/utils";

// "Spinner layout" (dat ten theo yeu cau nguoi dung) - phu 1 LOP MO NHE +
// spinner xoay CHINH GIUA len toan bo vung THAN cua 1 page (khong phai toan
// man hinh - khong che header/sidebar ngoai cung cua app). Component CHA
// truyen vao phai co class "relative" de overlay nay (absolute inset-0) bam
// dung kich thuoc vung than trang do, vi du SeriesEntryForm.tsx dung luc
// dang tao/luu Entry.
export function LayoutSpinnerOverlay({
  active,
  className,
}: {
  active: boolean;
  className?: string;
}) {
  if (!active) return null;
  return (
    <div
      className={cn(
        "absolute inset-0 z-40 flex items-center justify-center rounded-xl bg-surface/60 backdrop-blur-[1.5px]",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Spinner size={28} />
    </div>
  );
}
