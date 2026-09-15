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
  label,
}: {
  active: boolean;
  className?: string;
  // Dong chu mo ta NGAY DUOI spinner (vd "Đang khởi tạo Entry "Tên bài"") -
  // yeu cau nguoi dung: overlay truoc day CHI co spinner tron, khong noi ro
  // dang lam gi. Optional - cac noi dung LayoutSpinnerOverlay khac (chua
  // truyen label) van hoat dong y het truoc, chi rieng spinner khong chu.
  label?: React.ReactNode;
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
      <div className="flex flex-col items-center gap-3">
        <Spinner size={28} />
        {label && (
          <p className="max-w-xs text-center text-[13px] font-medium text-ink">
            {label}
            <LoadingDots />
          </p>
        )}
      </div>
    </div>
  );
}

// 3 dau cham "bập bồng" LAN LUOT tung dot (khong nhay cung luc) - dung
// animation "bounce" co san cua Tailwind + animationDelay so le tung cham
// (150ms/dot) de tao hieu ung dang song, yeu cau nguoi dung: "kèm theo dấu 3
// dots anim bập bồng từng dot một".
function LoadingDots() {
  return (
    <span className="ml-0.5 inline-flex" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        >
          .
        </span>
      ))}
    </span>
  );
}
