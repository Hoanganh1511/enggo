// Node/mergeAttributes PHAI lay tu "@tiptap/core" (khong phai "@tiptap/react"
// du @tiptap/react co re-export lai 2 cai nay) - @tiptap/react co 1 ban build
// rieng cho moi truong Server Component (dieu kien "react-server" trong
// exports field) khien "Node" import tu do KHONG phai class Node THAT khi
// module nay bi Turbopack danh gia phia server, gay "Node.create is not a
// function" (xem docs/engineering-log.md 2026-09-10). ReactNodeViewRenderer
// van phai lay tu "@tiptap/react" (dung DUY NHAT ben trong addNodeView(),
// khong bao gio duoc GOI luc build schema tinh nen an toan du bi anh huong
// boi dieu kien "react-server").
import { Node, mergeAttributes, getHTMLFromFragment } from "@tiptap/core";
import { Fragment } from "@tiptap/pm/model";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { GlossaryHintView } from "./glossary-hint-view";

// Kieu toi thieu rieng (giong TiptapNode trong post-extensions.ts) - chi can
// .type.schema cho getHTMLFromFragment, khong muon import ca kieu Node that
// cua ProseMirror vao day chi de 1 lan dung.
type MinimalTiptapNode = {
  attrs: Record<string, unknown>;
  type: { schema: unknown };
};
type MinimalMarkdownState = { write: (s: string) => void };

// 1 "khoi" giai thich - CHI 3 dang yeu cau nguoi dung: "văn bản bình thường,
// list dots, list number". Khong co inline formatting (bold/link...) o day -
// giu don gian dung pham vi yeu cau, giong tinh than getOverviewExtensions()
// (post-extensions.ts) da gioi han tuong tu cho 1 nhu cau khac.
export type GlossaryBlock =
  | { type: "paragraph"; text: string }
  | { type: "bulletList"; items: string[] }
  | { type: "orderedList"; items: string[] };

export function newGlossaryParagraph(): GlossaryBlock {
  return { type: "paragraph", text: "" };
}
export function newGlossaryList(type: "bulletList" | "orderedList"): GlossaryBlock {
  return { type, items: [""] };
}

function glossaryBlocksToDom(blocks: GlossaryBlock[]): unknown[] {
  return blocks
    .filter((b) => (b.type === "paragraph" ? b.text.trim() : b.items.some((i) => i.trim())))
    .map((b) => {
      if (b.type === "paragraph") return ["p", {}, b.text];
      const tag = b.type === "bulletList" ? "ul" : "ol";
      return [tag, {}, ...b.items.filter((i) => i.trim()).map((item) => ["li", {}, item])];
    });
}

// [2026-10-03 redesign] Node inline "chu thich thuat ngu" - TRUOC DAY la 1
// ATOM rieng (icon dau hoi) dung SAU 1 cum tu, giai thich CHI la text thuong
// (luu trong thuoc tinh HTML "title", trinh duyet tu hien tooltip). Yeu cau
// nguoi dung: "select text sau đó chọn tính năng đó để điền chú thích...
// người dùng sẽ thấy nó có style nào đó để biết từ ngữ này có thể hover vào
// để xem giải thích. Khi hover vào 1.5s, animation nước ngập chữ... thì hiển
// thị popover giải thích... có thể giải thích với... text bình thường, list
// dots, list number".
//
// Gio CHINH cum tu da chon la NOI DUNG THAT cua node (content:"text*", xem
// addNodeView() - NodeViewContent thay the nut "?" cu) - cho phep style
// THANG len cum tu (gach chan cham + hieu ung "nuoc dang" khi hover, xem
// .glossary-term trong globals.css). `explanation` gio la 1 MANG CO CAU TRUC
// (GlossaryBlock[], JSON blob - giong tinh than CardGrid.items) thay vi 1
// chuoi text don, cho phep danh sach cham/so. Popover hien THUAN CSS (hover +
// transition-delay, xem globals.css) - hoat dong dung y het tren CA editor
// LAN trang da xuat ban (DocsMarkdown, KHONG co JS) vi HTML popover LUON co
// san trong DOM (render qua renderHTML() ben duoi), khong can JS mount/toggle.
export const GlossaryHint = Node.create({
  name: "glossaryHint",
  group: "inline",
  inline: true,
  content: "text*",
  // selectable:false - xem comment day du o GridCell (post-extensions.ts) -
  // cung 1 ly do: co 1 nut dieu khien contentEditable=false (banh rang sua
  // giai thich) ngay canh vung noi dung that.
  selectable: false,

  addAttributes() {
    return {
      explanation: {
        default: [] as GlossaryBlock[],
        // parseHTML doc tu DOM con ".glossary-term-popover" (KHONG phai 1
        // thuoc tinh phang) - giai thich la HTML THAT (p/ul/ol), khong con
        // nhet vao 1 chuoi thuoc tinh duy nhat nhu "title" cu. Fallback: du
        // lieu CU (truoc redesign nay) khong co the con nay, chi co thuoc
        // tinh "title" (text thuong) - doc lai thanh 1 khoi "paragraph" DUY
        // NHAT thay vi mat trang, giu nguyen tinh than "khong xoa du lieu cu"
        // da ap dung cho PrereqBlock/Callout truoc do.
        parseHTML: (el) => {
          const popover = el.querySelector(":scope > .glossary-term-popover");
          if (!popover) {
            const legacyTitle = el.getAttribute("title")?.trim();
            return legacyTitle ? [{ type: "paragraph", text: legacyTitle }] : [];
          }
          const blocks: GlossaryBlock[] = [];
          popover.childNodes.forEach((child) => {
            if (!(child instanceof HTMLElement)) return;
            if (child.tagName === "P") {
              blocks.push({ type: "paragraph", text: child.textContent ?? "" });
            } else if (child.tagName === "UL" || child.tagName === "OL") {
              blocks.push({
                type: child.tagName === "UL" ? "bulletList" : "orderedList",
                items: Array.from(child.querySelectorAll(":scope > li")).map((li) => li.textContent ?? ""),
              });
            }
          });
          return blocks;
        },
        // renderHTML rong - noi dung THAT duoc renderHTML() cua CHINH node
        // (ben duoi) tu ghep vao 1 the con rieng, khong phai 1 thuoc tinh.
        renderHTML: () => ({}),
      },
    };
  },

  // [2026-10-03 fix crash that su] contentElement dung 1 HAM (khong phai
  // chuoi selector tinh) - CUNG 1 bug class voi PrereqBlock hom qua (xem
  // docs/engineering-log.md): du lieu CU (truoc redesign nay) la 1 ATOM RONG
  // (noi dung CHI la ky tu "?", khong co the con ".glossary-term" nao) - neu
  // contentElement la chuoi tinh, ProseMirror tim ".glossary-term" KHONG
  // THAY, tra ve null, va crash NGAY LUC PARSE ("Cannot read properties of
  // null") khi mo lai 1 bai da luu TRUOC ban redesign nay. Fallback ve CHINH
  // phan tu goc (el) khi khong tim thay - noi dung se la bat ky text nao nam
  // TRUC TIEP trong span do (vd ky tu "?" cu) thay vi crash, chap nhan duoc
  // (xau ve mat hien thi, KHONG mat trang/mat du lieu) - chi can mo lai sua
  // 1 lan la tu chuyen sang dinh dang moi khi luu.
  parseHTML() {
    return [
      {
        tag: "span[data-glossary-hint]",
        contentElement: (el) => el.querySelector(":scope > .glossary-term") ?? el,
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const explanation = (node.attrs.explanation as GlossaryBlock[]) ?? [];
    return [
      "span",
      mergeAttributes(HTMLAttributes, { class: "glossary-hint", "data-glossary-hint": "" }),
      ["span", { class: "glossary-term" }, 0],
      ["span", { class: "glossary-term-popover" }, ...glossaryBlocksToDom(explanation)],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(GlossaryHintView);
  },

  // Markdown fallback - dung CHUNG ky thuat voi Callout (post-extensions.ts):
  // getHTMLFromFragment() GOI THANG renderHTML() o tren, dam bao HTML xuat ra
  // LUON khop 100% voi NodeView dang hien trong editor (khong con 2 noi dinh
  // nghia giao dien rieng re de lech nhau - xem bai hoc da ghi trong
  // docs/engineering-log.md 2026-10-02 muc 3).
  addStorage() {
    return {
      markdown: {
        serialize: (state: MinimalMarkdownState, node: MinimalTiptapNode) => {
          const schema = node.type.schema;
          const html = getHTMLFromFragment(Fragment.from(node as never), schema as never);
          state.write(html);
        },
      },
    };
  },
});
