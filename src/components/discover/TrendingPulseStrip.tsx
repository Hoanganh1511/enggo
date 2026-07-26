import { TRENDING_SKILLS } from "@/content/home-feed-mock";

// Dai "pulse" ngang o dau feed - thay cho card "Kien thuc duoc de cap nhieu"
// truoc day nam o cot phai (da bo de cot phai chi con "Co the ban quan tam").
// Muc dich: luot xem nhanh kien thuc dang hot ngay khi vao trang, khong can
// nhin sang cot phai moi thay.
const TrendingPulseStrip = () => {
  return (
    <div className="mb-4 flex items-center gap-3.5 overflow-hidden rounded-xl border border-border bg-surface px-4 py-3">
      <div className="flex shrink-0 items-center gap-2 border-r border-border pr-3.5 text-sm font-semibold whitespace-nowrap text-primary">
        🌱 Kỹ năng của bạn +3 tuần này
      </div>
      <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TRENDING_SKILLS.map((skill, i) => (
          <div
            key={skill.name}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1.5 text-xs whitespace-nowrap text-ink-muted transition-colors duration-150 ease-out hover:border-primary hover:text-ink"
          >
            <span className="font-bold text-ink-faint">{i + 1}</span>
            <span className="font-semibold text-ink">{skill.name}</span>
            <span>· {skill.posts.toLocaleString("en-US")}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingPulseStrip;
