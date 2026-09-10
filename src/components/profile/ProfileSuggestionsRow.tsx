import { BookOpen, Heart, Lightbulb, type LucideIcon } from "lucide-react";

const SUGGESTIONS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: BookOpen,
    title: "Nhật ký cá nhân",
    description: "Lưu lại những suy nghĩ, hành trình của bạn.",
  },
  {
    icon: Lightbulb,
    title: "Ý tưởng & Học hỏi",
    description: "Tổng hợp những điều bạn đang học và khám phá.",
  },
  {
    icon: Heart,
    title: "Điều yêu thích",
    description: "Những bài viết, chủ đề bạn quan tâm nhất.",
  },
];

// "Gợi ý cho bạn" - goi y CHU DE (UI copy tinh, khong phai du lieu nguoi
// dung that) cho Danh sach phat/Bo suu tap khi con rong, giup nguoi dung
// hinh dung se dung tinh nang nay the nao. Nut "+" disabled "Sắp có" vi
// chua co backend tao Danh sach phat/Bo suu tap that.
export function ProfileSuggestionsRow() {
  return (
    <div className="mt-2">
      <h3 className="text-sm font-bold text-ink">Gợi ý cho bạn</h3>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {SUGGESTIONS.map((s) => (
          <div
            key={s.title}
            className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <s.icon size={16} strokeWidth={1.8} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{s.title}</p>
              <p className="mt-0.5 text-xs text-ink-faint">{s.description}</p>
            </div>
            <button
              type="button"
              disabled
              title="Sắp có"
              className="flex size-6 shrink-0 cursor-not-allowed items-center justify-center rounded-full border border-border text-ink-faint"
            >
              +
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
