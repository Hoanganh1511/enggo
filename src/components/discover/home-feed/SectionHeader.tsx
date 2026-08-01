// Tieu de dung chung cho moi section cua EditorialFeed - chu lon, nhieu
// khoang trong, KHONG border nang (khac han header the PostCard cu) de tao
// cam giac "trang bao" thay vi dashboard. "subtitle" tuy chon cho vai section
// can 1 dong mo ta ngan (vd Trending Topics).
export function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold tracking-tight text-ink">{title}</h2>
      {subtitle && (
        <p className="mt-0.5 text-sm text-ink-faint">{subtitle}</p>
      )}
    </div>
  );
}
