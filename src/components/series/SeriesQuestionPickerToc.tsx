import Link from "next/link";
import type { QuestionPickerTocItem } from "@/lib/docs/question-picker-toc";

// Grid "TOC dang box" - TU DONG hien khi Entry co >=2 heading H2 (xem
// extractQuestionPickerToc), moi box la 1 LINK ANCHOR nhay thang toi dung
// section trong than bai ben duoi (id khop voi id THAT DocsMarkdown.tsx gan
// cho heading do) - khac ban truoc (chen tay qua Composer, mo/dong inline)
// vi day gio la 1 tinh nang TU DONG cua trang doc, khong con la 1 "cong cu
// soan bai" nua.
export function SeriesQuestionPickerToc({ items }: { items: QuestionPickerTocItem[] }) {
  if (items.length < 2) return null;

  return (
    <div className="font-content mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
      {items.map((item, i) => (
        <Link
          key={item.id}
          href={`#${item.id}`}
          className="group flex items-start gap-2.5 rounded-xl border border-border px-3.5 py-3 transition-colors duration-150 ease-out hover:border-border-strong hover:bg-hover-bg"
        >
          <span className="mt-0.5 font-mono text-[12px] text-ink-faint">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-semibold text-ink">{item.question}</span>
            {item.description && (
              <span className="mt-0.5 line-clamp-1 block text-[13px] text-ink-faint">
                {item.description}
              </span>
            )}
          </span>
        </Link>
      ))}
    </div>
  );
}
