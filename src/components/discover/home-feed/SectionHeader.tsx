import Link from "next/link";
import { ChevronRight } from "lucide-react";

// Tieu de dung chung cho moi section cua EditorialFeed - chu lon, nhieu
// khoang trong, KHONG border nang (khac han header the PostCard cu) de tao
// cam giac "trang bao" thay vi dashboard. "subtitle" tuy chon cho vai section
// can 1 dong mo ta ngan (vd Trending Topics). "viewAllHref" tuy chon - moi
// hang gio chi fetch dung 10 bai (xem home/page.tsx), can link "Xem tat ca"
// de dan sang SingleTypeFeedList (view day du, co the phan trang rieng) thay
// vi nguoi dung ket lai o 10 bai co dinh khong loi thoat.
export function SectionHeader({
  title,
  subtitle,
  viewAllHref,
}: {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-ink">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-ink-faint">{subtitle}</p>
        )}
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="flex shrink-0 items-center gap-0.5 text-sm font-medium text-ink-muted transition-colors duration-150 ease-out hover:text-ink"
        >
          Xem tất cả
          <ChevronRight size={16} strokeWidth={2} />
        </Link>
      )}
    </div>
  );
}
