import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Flame,
  FileText,
  CalendarDays,
  Users,
  Trophy,
  Info,
  Plus,
} from "lucide-react";
import type { Community } from "@/content/community-mock";
import { formatCompact } from "@/lib/format-number";

const QUICK_LINKS = [
  { icon: Star, label: "Bài viết nổi bật", href: "#featured" },
  { icon: Flame, label: "Series đang chạy", href: "#", countKey: "activeSeriesCount" as const },
  { icon: FileText, label: "Tài liệu cộng đồng", href: "#documents" },
  { icon: CalendarDays, label: "Lịch thi & sự kiện", href: "#event" },
  { icon: Users, label: "Thành viên", href: "#" },
  { icon: Trophy, label: "Bảng xếp hạng", href: "#leaderboard" },
  { icon: Info, label: "Giới thiệu cộng đồng", href: "#" },
];

// Cot trai trang chi tiet cong dong - nav noi bo (anchor #id trong cung
// trang, KHONG phai route rieng - cong dong chi 1 trang duy nhat hien tai)
// + loi tat tao bai + 2 khoi thong tin phu (chung chi pho bien, su kien sap
// toi). Tat ca CHI doc mock, chua co tuong tac that (xem community-mock.ts).
export function CommunitySidebarLeft({ community }: { community: Community }) {
  return (
    <aside className="flex w-64 shrink-0 flex-col gap-4">
      <div className="rounded-lg border border-border bg-surface p-3">
        <p className="px-1 pb-2 text-xs font-semibold text-ink-faint">
          Truy cập nhanh
        </p>
        <nav className="flex flex-col gap-0.5">
          {QUICK_LINKS.map(({ icon: Icon, label, href, countKey }) => (
            <a
              key={label}
              href={href}
              className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
            >
              <span className="flex items-center gap-2">
                <Icon size={15} strokeWidth={1.75} />
                {label}
              </span>
              {countKey && (
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  {community[countKey]}
                </span>
              )}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="mt-2 flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-md bg-primary text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-primary-hover"
        >
          <Plus size={15} strokeWidth={2.25} />
          Tạo bài viết
        </button>
      </div>

      {/* Community sinh tu Series (buildCommunityFromSeries trong
          community-mock.ts) chua co du lieu chung chi/su kien that - an han
          ca khoi thay vi hien danh sach rong vo nghia. */}
      {community.certificates.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="px-1 pb-2 text-xs font-semibold text-ink-faint">
            Chứng chỉ phổ biến
          </p>
          <div className="flex flex-col gap-0.5">
            {community.certificates.slice(0, 5).map((cert) => (
              <Link
                key={cert.slug}
                href="#"
                className="flex items-center gap-2.5 rounded-md px-1 py-1.5 transition-colors duration-150 ease-out hover:bg-hover-bg"
              >
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
                  style={{ background: cert.accent }}
                >
                  {cert.name.charAt(0)}
                </span>
                <span className="min-w-0">
                  <span className="line-clamp-1 block text-sm font-medium text-ink">
                    {cert.name}
                  </span>
                  <span className="text-[11px] text-ink-faint">
                    {formatCompact(cert.followerCount)} người theo dõi
                  </span>
                </span>
              </Link>
            ))}
          </div>
          <Link
            href="#"
            className="mt-1 block px-1 text-xs font-medium text-primary hover:underline"
          >
            Xem tất cả →
          </Link>
        </div>
      )}

      {community.upcomingEvent && (
        <div className="rounded-lg border border-border bg-surface p-3">
          <div className="flex items-center justify-between px-1 pb-2">
            <p className="text-xs font-semibold text-ink-faint">
              Sự kiện sắp diễn ra
            </p>
            <Link href="#" className="text-xs font-medium text-primary hover:underline">
              Xem lịch
            </Link>
          </div>
          <div className="flex flex-col gap-1.5 px-1">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              <CalendarDays size={13} strokeWidth={2} className="shrink-0 text-primary" />
              {community.upcomingEvent.title}
            </p>
            <p className="text-xs text-ink-faint">
              {community.upcomingEvent.dateLabel}
            </p>
            <p className="text-xs text-ink-faint">
              {community.upcomingEvent.location}
            </p>
            <div className="flex items-center gap-1.5 pt-1">
              <div className="flex -space-x-1.5">
                {community.upcomingEvent.participantAvatarUrls.map((url, i) => (
                  <Image
                    key={i}
                    src={url}
                    alt=""
                    width={18}
                    height={18}
                    className="size-4.5 shrink-0 rounded-full border border-surface object-cover"
                  />
                ))}
              </div>
              <span className="text-[11px] text-ink-faint">
                +{community.upcomingEvent.participantCount}
              </span>
            </div>
            <button
              type="button"
              className="mt-1 flex h-8 w-full cursor-pointer items-center justify-center rounded-md bg-surface-muted text-xs font-semibold text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
            >
              Tham gia
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
