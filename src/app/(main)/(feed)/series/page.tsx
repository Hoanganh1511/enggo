import {
  SERIES,
  RECOMMENDED_SERIES,
  COMMUNITY_GOALS,
} from "@/content/series-mock";
import { CommunityCard } from "@/components/discover/series/CommunityCard";
import { SeriesToolbar } from "@/components/discover/series/SeriesToolbar";
import { CommunityGoalCard } from "@/components/discover/series/CommunityGoalCard";
import { FeaturedSeriesBanner } from "@/components/discover/series/FeaturedSeriesBanner";
import { SeriesStatsBar } from "@/components/discover/series/SeriesStatsBar";

// Trang "Đi cùng mọi người" - danh sach cac series (lo trinh hoc do CHINH
// nguoi dung tao ra, xem series-mock.ts). Truoc day day la 1 section nam
// tren /home; da tach han ra route rieng vi no khong lien quan gi toi feed
// bai viet, va nut o HomeSidebar gio dieu huong sang day thay vi cuon.
//
// Dung luoi auto-fill thay vi carousel ngang nhu tren trang chu: o trang
// danh sach chuyen biet, nguoi dung muon xem het cung luc chu khong phai
// luot ngang tung the.
function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold tracking-tight text-ink">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-ink-faint">{subtitle}</p>}
    </div>
  );
}

export default function SeriesListPage() {
  return (
    // Khong tu them px/py ngang doc: shell cha (HomeLayoutShell qua
    // (feed)/layout.tsx) da co san px-4 pt-4 cho vung noi dung ben phai
    // sidebar - them nua se lech so voi /home. Luu y: /series/[slug] (trang
    // chi tiet) nam NGOAI (feed)/ nen KHONG duoc huong padding nay, phai tu
    // co padding rieng (xem SeriesDetailContainer.tsx).
    <div className="flex flex-col gap-6 pb-10">
      {/* <header className="flex flex-col gap-1">
        <h1 className="text-2xl leading-tight font-bold tracking-tight text-ink">
          Đi cùng mọi người
        </h1>
        <p className="text-sm text-ink-muted">
          Tham gia lộ trình học cùng cộng đồng có chung mục tiêu, cùng nhau tiến
          bộ mỗi ngày.
        </p>
      </header> */}

      <FeaturedSeriesBanner />

      <SeriesStatsBar />

      <section id="series-sections">
        <h2 className="mb-4 text-xl font-bold tracking-tight text-ink">
          Khám phá cộng đồng phù hợp với bạn ✨
        </h2>
        <SeriesToolbar />
        {/* Co dinh toi da 5 cot (khac auto-fill cua khoi "Muc tieu cong
            dong" ben duoi) - the community can dung 5/hang de nhin lien
            mach thay vi so cot doi theo do rong container. */}
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {SERIES.map((series) => (
            <CommunityCard key={series.slug} series={series} />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle
          title="Đề xuất cho bạn"
          subtitle="Gợi ý dựa trên kỹ năng và nội dung bạn đang theo dõi"
        />
        {/* Co dinh toi da 5 cot (khac auto-fill cua khoi "Muc tieu cong
            dong" ben duoi) - the community can dung 5/hang de nhin lien
            mach thay vi so cot doi theo do rong container. */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {RECOMMENDED_SERIES.map(({ series, reasonLine }) => (
            <div key={`rec-${series.slug}`} className="flex flex-col gap-1.5">
              <p className="line-clamp-1 text-[11px] text-ink-faint">
                {reasonLine}
              </p>
              <CommunityCard series={series} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle
          title="Mục tiêu cộng đồng"
          subtitle="Không cần xin tham gia — ai đóng góp cũng được tính vào tiến độ chung"
        />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
          {COMMUNITY_GOALS.map((goal) => (
            <CommunityGoalCard key={goal.slug} goal={goal} />
          ))}
        </div>
      </section>
    </div>
  );
}
