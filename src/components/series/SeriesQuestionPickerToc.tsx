import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { QuestionPickerTocItem } from "@/lib/docs/question-picker-toc";

// Grid "TOC dang box" - TU DONG hien khi Entry co >=2 heading H2 (xem
// extractQuestionPickerToc), moi box la 1 LINK ANCHOR nhay thang toi dung
// section trong than bai ben duoi (id khop voi id THAT DocsMarkdown.tsx gan
// cho heading do) - khac ban truoc (chen tay qua Composer, mo/dong inline)
// vi day gio la 1 tinh nang TU DONG cua trang doc, khong con la 1 "cong cu
// soan bai" nua.
//
// Yeu cau nguoi dung (khop dung anh mau tham khao): CHI hien so thu tu +
// noi dung H2, KHONG hien mo ta (item.description khong dung o day nua,
// van giu trong QuestionPickerTocItem/extractQuestionPickerToc phong khi
// can lai sau). Hover NHE (chi doi nen mo, KHONG doi mau vien nhu ban truoc
// - "hiệu ứng khi hover vào cũng nhẹ nhàng thôi"). Them icon ChevronDown o
// CUOI box (yeu cau nguoi dung: "chưa có icon mũi tên xuống ở cuối box").
export function SeriesQuestionPickerToc({
  items,
}: {
  items: QuestionPickerTocItem[];
}) {
  if (items.length < 2) return null;

  return (
    <div className="font-content mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
      {items.map((item, i) => (
        <Link
          key={item.id}
          href={`#${item.id}`}
          className="flex items-center gap-2.5 rounded-xl border border-border px-3.5 py-3 transition-colors duration-150 ease-out hover:bg-hover-bg/60"
        >
          <span className="font-mono text-[12px] text-ink-faint">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span
            className="min-w-0 flex-1 truncate text-[14.5px] "
            style={{ color: "rgba(20, 22, 26,0.86)" }}
          >
            {item.question}
          </span>
          <ChevronDown
            size={14}
            strokeWidth={2}
            className="shrink-0 text-ink-faint"
            aria-hidden="true"
          />
        </Link>
      ))}
    </div>
  );
}
