import { cn } from "@/lib/utils";

// Rut ra tu pattern 2-div dang lap inline san trong growth-card.tsx (track
// bg-surface-muted + fill dat width theo %) - tach thanh component vi rieng
// trang Series ("Đi cùng mọi người") da dung lai o 4 cho (the series, hero
// trang chi tiet, hang bang xep hang, muc tieu cong dong). KHONG sua
// growth-card.tsx de dung lai cai nay - ngoai pham vi.
export function ProgressBar({
  percent,
  barClassName = "bg-primary",
  className,
}: {
  percent: number;
  barClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-surface-muted",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-300 ease-out",
          barClassName,
        )}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}
