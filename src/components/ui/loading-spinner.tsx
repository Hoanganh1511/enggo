import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

// Spinner DUNG CHUNG cho toan app - THAY the moi cho <LoaderCircle
// className="animate-spin"/> (lucide-react) truoc day dung rai rac truc
// tiep o tung component. Hinh VUONG (khong phai tron) - 1 doan line day 3px
// "chay" quanh vien bang stroke-dashoffset animation (xem @keyframes
// spinner-square-trace trong globals.css), khac han kieu xoay tron truyen
// thong. Mau ke thua currentColor tu className truyen vao (dung y het cach
// dung LoaderCircle cu - truyen className="text-slate-400" v.v. de doi mau).
export function LoadingSpinner({
  size = 16,
  className,
  style,
}: {
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
      style={style}
      role="status"
      aria-label="Đang tải"
    >
      {/* Vien mo lam nen - luon hien, ro rang day la 1 vong vuong day du. */}
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="3"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.15"
      />
      {/* Doan line "chay" quanh vien - strokeDasharray = [do dai doan sang,
          do dai doan an], tong = chu vi hinh vuong (~76 voi kich thuoc tren)
          de dashoffset chay tron 1 vong khong bi giat. */}
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="3"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="20 56"
        className="animate-spinner-square-trace"
      />
    </svg>
  );
}
