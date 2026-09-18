import { LoadingSpinner } from "./loading-spinner";
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
      className={cn("absolute inset-0 z-40 rounded-xl bg-surface/60 backdrop-blur-[1.5px]", className)}
      role="status"
      aria-live="polite"
    >
      {/* [2026-09-18] Spinner FIXED giua VIEWPORT - bug nguoi dung bao: "mới
          chỉ làm mờ" (khong thay spinner dau). Nguyen nhan: khoi spinner
          truoc day chi `flex items-center justify-center` BEN TRONG chinh
          div nay - voi 1 Entry dai (nhieu Accordion), div nay cao hang nghin
          px nen "giữa" cua no nam ngoai tam nhin hien tai neu dang cuon o
          giua/cuoi trang luc bam Lưu, chi con thay duoc lop mo phu ben tren.
          `fixed` + `top/left-1/2` thoat khoi chieu cao cua div cha, luon bam
          dung GIUA MAN HINH THAT du dang cuon toi dau. */}
      <div className="fixed top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3">
        <LoadingSpinner size={28} className="text-ink-muted" />
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
