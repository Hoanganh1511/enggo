import Image from "next/image";
import { LayoutGrid, Users, UserCheck, Star, Quote } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { hexToRgba } from "@/lib/skill-tree/status-style";

const COMMUNITY_ACCENT = "#7c3aed"; // == --community-accent trong globals.css

// So lieu TONG QUAN toan nen tang (khac stat rieng tung community da co o
// CommunityDiscoveryCard) - CHUA co API tong hop so nay o backend nen la mock
// tinh, dung de tao cam giac quy mo ngay duoi banner, giong tinh than cac con
// so "an tuong" note.com/LinkedIn Learning hay dung o trang landing. (Port
// nguyen tu SeriesStatsBar.tsx cu - noi dung 100% trang tri, khong phu thuoc
// du lieu Series nao ca.)
const STATS: { icon: LucideIcon; value: string; label: string }[] = [
  { icon: LayoutGrid, value: "2.4K+", label: "Cộng đồng đang hoạt động" },
  { icon: Users, value: "58K+", label: "Thành viên tích cực" },
  { icon: UserCheck, value: "1.2K+", label: "Mentor & Leader" },
  { icon: Star, value: "120+", label: "Chủ đề đa dạng" },
];

const QUOTE_AVATARS = [
  "https://i.pravatar.cc/64?u=quote-1",
  "https://i.pravatar.cc/64?u=quote-2",
  "https://i.pravatar.cc/64?u=quote-3",
];

// Thanh so lieu ngay duoi CommunityHeroBanner o trang "Đi cùng mọi người" -
// 4 stat tong quan gon lai 1 ben (KHONG flex-1 - noi dung ngan, ep gian deu
// se thua dien tich vo ich), khoi cau o ben con lai la "flex-1" duy nhat
// (chiem het khoang trong con lai) vi cau trich dan dai/ngan tuy cau, can
// khong gian thoai mai hon nhieu so voi 4 con so ngan gon kia.
export function CommunityStatsBar() {
  return (
    <section className="flex flex-wrap items-stretch divide-y divide-border  bg-surface sm:flex-nowrap sm:divide-y-0">
      <div className="flex-1 flex flex-wrap divide-x divide-y divide-border sm:flex-nowrap sm:divide-y-0">
        {STATS.map(({ icon: Icon, value, label }) => (
          <div
            key={label}
            className="flex-1 flex shrink-0 items-center gap-2.5 px-4 py-5 sm:px-5"
          >
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-lg"
              style={{
                background: hexToRgba(COMMUNITY_ACCENT, 0.12),
                color: COMMUNITY_ACCENT,
              }}
            >
              <Icon size={17} strokeWidth={2} />
            </span>
            <span className="min-w-0">
              <span className="block text-lg leading-tight font-bold text-ink">
                {value}
              </span>
              <span className="line-clamp-1 text-xs text-ink-faint">
                {label}
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="flex w-full max-w-120  items-center gap-3 border-border px-5 py-5 sm:border-l">
        <Quote
          size={22}
          strokeWidth={0}
          fill="currentColor"
          className="hidden shrink-0 text-ink-faint sm:block"
        />
        <div className="min-w-0 flex-1">
          <p className="font-card text-sm leading-snug font-semibold text-ink">
            Đi nhanh thì đi một mình, đi xa thì đi cùng nhau.
          </p>
          <p className="mt-1 text-xs text-ink-faint">— Tục ngữ châu Phi</p>
        </div>
        <div className="flex shrink-0 -space-x-2">
          {QUOTE_AVATARS.map((url, i) => (
            <Image
              key={i}
              src={url}
              alt=""
              width={28}
              height={28}
              className="size-7 shrink-0 rounded-full border-2 border-surface object-cover"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
