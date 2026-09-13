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

  addAttributes() {
    return {
      explanation: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-explanation") ?? "",
        renderHTML: (attrs) => ({ "data-explanation": (attrs.explanation as string) ?? "" }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-glossary-hint]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes, { "data-glossary-hint": "" }), "?"];
  },

  addNodeView() {
    return ReactNodeViewRenderer(GlossaryHintView);
  },
});
