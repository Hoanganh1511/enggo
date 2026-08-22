import {
  BookOpen,
  CalendarHeart,
  LineChart,
  type LucideIcon,
  Moon,
  Quote,
  Timer,
} from "lucide-react";

type FeatureCard = {
  title: string;
  icon: LucideIcon;
  iconBg: string;
  bullets: [string, string, string];
};

// Noi dung DEMO TAM - nguoi dung yeu cau demo 6 the + moi the 3 gach dau
// dong mo ta tinh nang, CHUA co tinh nang that dung sau (chi la mockup bo
// cuc cho trang /home dang trong rong) - sua lai text that khi co spec that.
const FEATURE_CARDS: FeatureCard[] = [
  {
    title: "GL Focus Study",
    icon: Timer,
    iconBg: "bg-sky-500",
    bullets: [
      "Đếm giờ học theo phiên (Pomodoro tuỳ chỉnh)",
      "Thống kê tổng thời gian tập trung theo ngày/tuần",
      "Nhắc nghỉ giải lao, tránh học liền mạch quá lâu",
    ],
  },
  {
    title: "GL Journal",
    icon: BookOpen,
    iconBg: "bg-rose-500",
    bullets: [
      "Viết nhật ký hằng ngày, lưu theo mốc thời gian",
      "Gắn tâm trạng (mood) cho mỗi bài viết",
      "Xem lại theo dòng thời gian, tìm theo từ khoá",
    ],
  },
  {
    title: "GL Sleep Tracker",
    icon: Moon,
    iconBg: "bg-violet-500",
    bullets: [
      "Ghi giờ đi ngủ, giờ thức dậy mỗi ngày",
      "Đánh giá chất lượng giấc ngủ theo thang điểm",
      "Biểu đồ xu hướng giấc ngủ 14 ngày gần nhất",
    ],
  },
  {
    title: "GL Weekly Review",
    icon: LineChart,
    iconBg: "bg-indigo-500",
    bullets: [
      "Tổng kết điểm số các mặt trong tuần",
      "Biểu đồ radar so sánh điểm giữa các tuần",
      "Ghi chú điều làm tốt/cần cải thiện mỗi tuần",
    ],
  },
  {
    title: "GL Important Dates",
    icon: CalendarHeart,
    iconBg: "bg-amber-500",
    bullets: [
      "Lưu ngày quan trọng (sinh nhật, deadline, kỷ niệm)",
      "Nhắc trước theo số ngày tuỳ chỉnh",
      "Phân loại theo nhóm cá nhân/công việc/gia đình",
    ],
  },
  {
    title: "GL Quotes",
    icon: Quote,
    iconBg: "bg-emerald-500",
    bullets: [
      "Lưu câu trích dẫn yêu thích theo chủ đề",
      "Gợi ý 1 câu quote mỗi ngày để truyền cảm hứng",
      "Xuất quote thành ảnh đẹp để chia sẻ",
    ],
  },
];

// Grid 3 cot x 2 hang (dung khop 6 the) - dat tam vao /home dang de trong,
// demo bo cuc cho 6 tinh nang sap toi (xem comment FEATURE_CARDS).
export function HomeFeatureGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {FEATURE_CARDS.map(({ title, icon: Icon, iconBg, bullets }) => (
        <div
          key={title}
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,.04)] transition-shadow duration-150 ease-out hover:shadow-[0_4px_16px_rgba(15,23,42,.08)] sm:p-5"
        >
          <div
            className={`grid size-10 shrink-0 place-items-center rounded-xl sm:size-11 ${iconBg}`}
          >
            <Icon size={19} className="text-white" strokeWidth={2} />
          </div>
          <h3 className="mt-3 text-[17px] font-bold text-[#182338] sm:mt-3.5 sm:text-[19px]">
            {title}
          </h3>
          <ul className="mt-2 flex flex-col gap-1.5">
            {bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-start gap-2 text-[13.5px] leading-relaxed text-slate-500 sm:text-[15px]"
              >
                <span className="mt-2 size-1 shrink-0 rounded-full bg-slate-300" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
