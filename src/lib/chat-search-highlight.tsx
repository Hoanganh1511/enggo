import type { ReactNode } from "react";

// Marker dieu khien (U+0001 = bat dau khop, U+0002 = ket thuc khop) server
// tra ve trong `snippet` (ts_headline, xem ChatSearchService o backend) -
// KHONG phai the HTML - server co y KHONG tra "<mark>" that de tranh XSS
// (noi dung tin nhan do nguoi dung nhap, dangerouslySetInnerHTML se nguy
// hiem). Tach thu cong o day + dung React element that, khong ghep chuoi HTML.
const MATCH_START = "\u0001";
const MATCH_END = "\u0002";

// Render 1 snippet co marker thanh mang node - doan giua 2 marker duoc boc
// <mark> (nen vang pastel), phan con lai la text thuong.
export function renderHighlightedSnippet(snippet: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let buffer = "";
  let inMatch = false;
  let key = 0;

  const flush = () => {
    if (!buffer) return;
    nodes.push(
      inMatch ? (
        <mark
          key={key++}
          className="rounded-sm bg-amber-100 px-0.5 font-semibold text-[#182338]"
        >
          {buffer}
        </mark>
      ) : (
        <span key={key++}>{buffer}</span>
      ),
    );
    buffer = "";
  };

  for (const ch of snippet) {
    if (ch === MATCH_START) {
      flush();
      inMatch = true;
    } else if (ch === MATCH_END) {
      flush();
      inMatch = false;
    } else {
      buffer += ch;
    }
  }
  flush();

  return nodes;
}
