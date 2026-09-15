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
    // flex-wrap (khong con grid grid-cols-2) - yeu cau nguoi dung: "Cho dồn
    // vào nhau chứ sao lại cách ra thế?" Luc con la grid-cols-2, moi box du
    // da gioi han max-w-100 (400px) van bi GAN CHET vao 1 cot rong 50% man
    // hinh (grid tu chia cot theo % bat ke noi dung/max-width ben trong), de
    // lo 1 khoang trang RAT LON giua 2 box tren man hinh rong. flex-wrap de
    // box 2 tu NAM SAT box 1 (chi cach dung 1 khoang gap-2) neu con cho,
    // chi xuong dong khi thuc su khong vua - dung "dồn vào nhau" nguoi dung
    // mo ta. min-w-70 giu box khong bi qua hep khi cau hoi ngan (vd "Design").
    <div className="font-content mt-6 flex flex-wrap gap-2">
      {items.map((item, i) => (
        <Link
          key={item.id}
          href={`#${item.id}`}
          // max-w-100 (400px) - yeu cau nguoi dung: "đừng để dài full màn
          // thế. Để max width là tầm 400px thôi. Xong dài hơn thì xuống
          // dòng". KHONG con `truncate` tren span cau hoi (1 dong + ellipsis) -
          // thay bang wrap tu do nhieu dong khi cau hoi dai qua 400px, dung
          // y "xuống dòng" nguoi dung mo ta.
          // Nen/vien rieng (khong dung bg-surface/border-border mac dinh) -
          // yeu cau nguoi dung: "Cho nền TOC box : bg-[#f5f6f8], border:
          // rgba(20, 22, 26, 0.22)".
          className="flex min-w-70 max-w-100 flex-1 items-start gap-2.5 rounded-xl border border-[rgba(20,22,26,0.22)] bg-[#f5f6f8] px-3.5 py-3 transition-colors duration-150 ease-out hover:bg-hover-bg/60"
        >
          <span className="font-mono text-[12px] text-ink-faint">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="min-w-0 flex-1 text-[14.5px]" style={{ color: "#14161A" }}>
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
