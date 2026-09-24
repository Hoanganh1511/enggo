import type { Editor } from "@tiptap/react";
import { TextSelection } from "@tiptap/pm/state";

// [2026-09-20 fix #2] Thay 1 lan boc "[paragraph, block, paragraph]" CO
// DINH (fix truoc) bang ham nay - bug nguoi dung bao: "giờ nó thừa khoảng
// trống ở trên, tôi không làm sao để xóa dòng thừa mà tôi ko cần điền đó
// đi được": boc CO DINH tao ra 1 doan van MOI o truoc du CON TRO DANG DUNG
// SAN o 1 doan van RONG co san (vd vua bam Enter, hoac accordion/o Grid moi
// tao san 1 dong rong de go) - ket qua la 2 dong rong chong nhau (1 cu +
// 1 moi), thay vi 1. Ham nay tu KIEM TRA: neu con tro dang o 1 doan van
// RONG, dung LUON doan van do lam "khoang trong phia truoc" (khong tao them
// dong moi) va CHI chen [block, doan van rong sau] NGAY SAU no bang 1
// transaction THAT (khong qua insertContent - insertContent co the "nuot"
// mat doan van rong do thay vi giu lai, day chinh la nguyen nhan bug GOC
// truoc do "click vào không thể trỏ vào được"). Neu con tro dang o giua/cuoi
// 1 doan van CO CHU (khong rong), moi that su can boc CA 2 dau nhu cu.
//
// [2026-09-24] Tach rieng khoi PostEditorToolbar.tsx ra file nay - can dung
// CHUNG boi ca toolbar (nut bam) LAN slash-command-items.tsx (go "/") de
// khong trung lap logic quan trong nay o 2 noi.
export function insertBlockWithSpacing(editor: Editor, blockJson: Record<string, unknown>) {
  editor
    .chain()
    .focus()
    .command(({ tr, state }) => {
      const { $from, empty } = state.selection;
      const parent = $from.parent;
      const cursorOnEmptyParagraph = empty && parent.type.name === "paragraph" && parent.content.size === 0;
      const paragraphType = state.schema.nodes.paragraph;
      const blockNode = state.schema.nodeFromJSON(blockJson);
      const trailingParagraph = paragraphType.create();
      let blockStart: number;
      if (cursorOnEmptyParagraph) {
        blockStart = $from.after();
        tr.insert(blockStart, [blockNode, trailingParagraph]);
      } else {
        const leadingParagraph = paragraphType.create();
        blockStart = $from.pos + leadingParagraph.nodeSize;
        tr.insert($from.pos, [leadingParagraph, blockNode, trailingParagraph]);
      }
      // [2026-09-20 fix] Con tro TRUOC DAY khong duoc di chuyen sau khi chen -
      // ProseMirror tu map vi tri chon CU (dong trong PHIA TRUOC khoi, dung de
      // "chua khoang trong") toi sau transaction, nen con tro/focus VAN nam o
      // dong trong do thay vi vao khoi/xuong dong sau - yeu cau nguoi dung
      // (kem anh chup man hinh 1 ProfileBlock vua chen, con tro dang o dong
      // rong PHIA TREN no): "insert xong thì con trỏ phải ở dưới và bên trên
      // k còn chứ ?". Chu dong dat lai selection vao dong trong NGAY SAU khoi
      // vua chen (trailingParagraph) - dung tinh than "chen xong san sang go
      // tiep ngay ben duoi", khong con dong trong PHIA TRUOC "vo chu" giu con tro.
      const afterBlock = blockStart + blockNode.nodeSize;
      tr.setSelection(TextSelection.near(tr.doc.resolve(afterBlock), 1));
      return true;
    })
    .run();
}
