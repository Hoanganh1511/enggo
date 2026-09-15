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
    // [2026-09-15] grid grid-cols-[repeat(2,max-content)] + justify-start
    // (khong con flex-wrap tu do) - yeu cau nguoi dung: "nó phải dồn 2 cột
    // bên trái cơ mà, chứ có phải bừa phứa như này đâu" - flex-wrap TRUOC DO
    // de moi box tu do xep 3-4 cai/hang tren man hinh rong (dung "dồn vào
    // nhau" nhung LAI mat luon bo cuc 2 COT co chu dich). Grid VOI cot
    // "max-content" (khong phai 1fr/mac dinh cua grid-cols-2 truoc do nua -
    // day chinh la nguyen nhan GAY khoang trang lon lan truoc, xem lich su
    // duoi) chi rong DUNG BANG noi dung ben trong (van bi tran max-w-100 tu
    // chinh item), CONG justify-start de ca khoi grid neo VE BEN TRAI thay
    // vi dan deu/stretch het hang - dung 2 cot, dam sat nhau, khong con
    // khoang trong thua.
    <div className="font-content mt-6 grid grid-cols-1 justify-start gap-2 sm:grid-cols-[repeat(2,max-content)]">
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
          // [2026-09-16 fix] min-w-100 (400px) truoc day CO DINH moi kich
          // thuoc man hinh - tren mobile (grid-cols-1, cot rong = full
          // viewport, thuong < 400px) ep box RONG HON CA man hinh, tran
          // ngang/bi cat (nguoi dung hoi rieng ve responsive khu Series).
          // Chuyen thanh sm:min-w-100 (CHI ap dung tu breakpoint sm tro len,
          // dung luc grid chuyen sang 2 cot max-content that su can 1 kich
          // thuoc toi thieu dong deu) + w-full lam nen mobile (chiem het be
          // rong cot 1-cot, khong bi ep qua kho).
          className="flex w-full min-w-0 max-w-100 items-start gap-2.5 rounded-xl border border-[rgba(20,22,26,0.22)] bg-[#f5f6f8] px-3.5 py-3 transition-colors duration-150 ease-out hover:bg-hover-bg/60 sm:min-w-100"
        >
          <span className="font-mono text-[12px] text-ink-faint">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span
            className="min-w-0 flex-1 text-[14.5px]"
            style={{ color: "#14161A", letterSpacing: "0.5px" }}
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
