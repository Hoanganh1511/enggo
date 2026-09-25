// Node/mergeAttributes PHAI lay tu "@tiptap/core" (khong phai "@tiptap/react"
// du @tiptap/react co re-export lai 2 cai nay) - @tiptap/react co 1 ban build
// rieng cho moi truong Server Component (dieu kien "react-server" trong
// exports field) khien "Node" import tu do KHONG phai class Node THAT khi
// module nay bi Turbopack danh gia phia server, gay "Node.create is not a
// function" (xem docs/engineering-log.md 2026-09-10). ReactNodeViewRenderer
// van phai lay tu "@tiptap/react" (dung DUY NHAT ben trong addNodeView(),
// khong bao gio duoc GOI luc build schema tinh nen an toan du bi anh huong
// boi dieu kien "react-server").
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { GlossaryHintView } from "./glossary-hint-view";

// Node inline "chu thich thuat ngu" - 1 icon dau hoi nho DUNG NGAY SAU 1 cum
// tu (khong phai mark boc quanh cum tu - cum tu giu nguyen, chi them 1 node
// rieng ke ben, xem toolbar "them chu thich" trong PostEditorToolbar.tsx).
// Click icon mo popover: doc thuong thi CHI xem noi dung giai thich (khong
// sua duoc); editor.isEditable=true (dang soan) thi co them nut sua/xoa. La
// atom node (khong co noi dung con), NodeView React dung CHUNG 1 component
// cho CA che do soan (PostEditor) lan che do doc (ArticleReaderPane/PostView
// deu dung useEditor({editable:false}) THAT, khong phai generateHTML tinh -
// nen NodeView React nay hoat dong dung y het o ca 2 noi, khong can lam
// rieng 1 ban "read-only" tinh bang HTML).
//
// File nay KHONG "use client" (khac GlossaryHintView o glossary-hint-view.tsx)
// vi Node.create({...}) can doc duoc tu Server Component (ArticleBody.tsx
// build schema tinh qua renderTiptapHTML() - xem docs/engineering-log.md
// 2026-09-10). ReactNodeViewRenderer() chi TAO ra 1 NodeView constructor gan
// voi component - ban than no khong dung hook/DOM nen goi duoc o day, hook
// THAT nam trong GlossaryHintView (client component rieng).
export const GlossaryHint = Node.create({
  name: "glossaryHint",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  // [2026-09-25] Luu explanation vao CHINH thuoc tinh HTML "title" (khong
  // phai "data-explanation" nhu truoc) - yeu cau nguoi dung: "khi ra bài
  // viết nó cũng phải hiện dấu hỏi, khi người dùng hover vào sẽ hiện dạng
  // tooltip/popover... không phải lỗi như hiện tại: show hết lời giải thích
  // dài ngoằng ra". Cung ly do/ky thuat da dung cho Footnote (xem
  // footnote-extension.tsx): trang doc cong khai cua Series Entry render qua
  // DocsMarkdown.tsx (markdown + rehype-raw ra HTML TINH, KHONG co JS chay o
  // do) - "title" la thuoc tinh CO SAN, trinh duyet TU hien tooltip khi
  // hover, khong can 1 dong JS nao. Truoc day addStorage() ben duoi XUONG
  // CAP explanation thanh text in nghieng trong ngoac MOI LAN LUU (vi popover
  // bam-de-mo cua chinh no se KHONG lam gi ca trong ngu canh tinh) - day
  // CHINH LA bug nguoi dung bao (thay het chu giai thich ngay trong bai,
  // khong an sau dau "?" nao ca).
  addAttributes() {
    return {
      explanation: {
        default: "",
        parseHTML: (el) => el.getAttribute("title") ?? "",
        renderHTML: (attrs) => ({ title: (attrs.explanation as string) ?? "" }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-glossary-hint]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes, { class: "glossary-hint", "data-glossary-hint": "" }), "?"];
  },

  addNodeView() {
    return ReactNodeViewRenderer(GlossaryHintView);
  },
  // Markdown fallback - GIU LAI atom (khong con xuong cap nhu truoc): embed
  // THANG raw HTML (title = CHINH thuoc tinh o addAttributes) de doc dung
  // khi mo lai Entry sau nay, giu nguyen kha nang bam sua tiep (giong tinh
  // than StatAccordion/FlowDiagram/Footnote).
  addStorage() {
    return {
      markdown: {
        serialize: (state: { write: (s?: string) => void }, node: { attrs: Record<string, unknown> }) => {
          const explanation = ((node.attrs.explanation as string) ?? "").trim();
          const escaped = explanation
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
          state.write(`<span class="glossary-hint" data-glossary-hint title="${escaped}">?</span>`);
        },
      },
    };
  },
});
