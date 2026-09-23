// Node/mergeAttributes PHAI lay tu "@tiptap/core" (khong phai "@tiptap/react")
// - xem comment dau glossary-hint-extension.tsx ve ly do (RSC "react-server"
// build khien "Node" import sai ban, gay "Node.create is not a function").
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { FootnoteView } from "./footnote-view";

function escapeHtmlAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Node inline "chú thích cuối trang" (footnote, `[^1]` trong tai lieu Markdown
// tham khao nguoi dung gui) - 1 SO NHO dang superscript NGAY SAU vi tri chen,
// so thu tu (1, 2, 3...) la CSS COUNTER THUAN (khong luu so cu the, tu dong
// dung khi them/xoa/doi thu tu cac chu thich khac trong bai - xem comment
// CSS trong POST_PROSE_CLASS). Noi dung chu thich luu vao CHINH thuoc tinh
// HTML "title" (khong phai 1 data-attribute rieng nhu GlossaryHint) - day la
// diem khac biet CHU DICH: trang doc cong khai cua Series Entry render qua
// DocsMarkdown.tsx (markdown + rehype-raw ra HTML TINH, KHONG co React/JS
// chay o do - xem comment GlossaryHint ve ly do no phai "xuong cap" thanh
// text luc luu, vi 1 nut bam mo popover se KHONG lam gi ca trong ngu canh
// tinh nay). "title" la thuoc tinh HTML CO SAN, trinh duyet TU HIEN tooltip
// khi hover - khong can 1 dong JS nao ca, nen hoat dong dung y het o CA 2 noi
// (luc soan LAN luc doc tinh), khac GlossaryHint. Vi vay Footnote KHONG can
// xuong cap luc luu nhu GlossaryHint - giu nguyen la 1 atom, embed thang HTML
// (giong tinh than StatAccordion/FlowDiagram) de "sống lại" nguyen ven, van
// bam MO popover sua duoc binh thuong khi quay lai soan tiep.
export const Footnote = Node.create({
  name: "footnote",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      content: {
        default: "",
        parseHTML: (el) => el.getAttribute("title") ?? "",
        renderHTML: (attrs) => ({ title: (attrs.content as string) ?? "" }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "sup[data-footnote]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["sup", mergeAttributes(HTMLAttributes, { class: "footnote-ref", "data-footnote": "" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FootnoteView);
  },

  // Markdown fallback - embed THANG raw HTML (data-content la CHINH thuoc
  // tinh "title", xem addAttributes o tren) de doc dung khi mo lai Entry,
  // giu nguyen kha nang bam sua tiep.
  addStorage() {
    return {
      markdown: {
        serialize: (state: { write: (s?: string) => void }, node: { attrs: Record<string, unknown> }) => {
          const content = (node.attrs.content as string) ?? "";
          state.write(`<sup class="footnote-ref" data-footnote title="${escapeHtmlAttr(content)}"></sup>`);
        },
      },
    };
  },
});
