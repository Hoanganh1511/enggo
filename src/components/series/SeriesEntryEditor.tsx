"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { getPostExtensions, POST_PROSE_CLASS } from "@/components/compose/post-extensions";
import { PostEditorToolbar } from "@/components/compose/PostEditorToolbar";
import { SelectionColorMenu } from "@/components/compose/SelectionColorMenu";
import { TableControlsMenu } from "@/components/compose/TableControlsMenu";

// Editor RICH cho Nội dung Entry - DUNG DUNG 1 bo extension/toolbar VOI
// Composer.tsx (yeu cau nguoi dung: "đồng bộ tất cả giống compose" - lan
// truoc tu y rut gon rieng 1 bo nho hon vi tuong lam vay "an toan" cho
// markdown, nguoi dung KHONG dong y). getPostExtensions() nguyen ban + them
// DUY NHAT Markdown (tiptap-markdown) de van xuat ra STRING markdown luu
// vao contentMarkdown (khop DocsMarkdown.tsx o trang doc, KHONG doi sang
// luu JSON nhu Post - ngoai pham vi yeu cau). Cac node RIENG cua Post
// (Callout/GoDeeper/TocBlock/CuratedList/GlossaryHint) da duoc khai bao
// serialize markdown RIENG (addStorage() trong post-extensions.ts/
// glossary-hint-extension.tsx) de KHONG bi Markdown extension bo qua/loi -
// xuong cap thanh markdown gon (vd Callout -> blockquote) thay vi mat trang.
// `value` CHI dung de KHOI TAO 1 LAN (uncontrolled sau do, dung Tiptap thay
// vi state React dieu khien tung ky tu).
export function SeriesEntryEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (markdown: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      ...getPostExtensions(),
      Placeholder.configure({ placeholder: "Viết nội dung bài học tại đây..." }),
      Markdown.configure({ tightLists: true, linkify: false }),
    ],
    content: value,
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: { class: POST_PROSE_CLASS + " min-h-64 px-3 py-2.5" },
    },
    onUpdate: ({ editor }) => {
      // tiptap-markdown khong ship type khai bao (.d.ts) rieng - "markdown" o
      // day la storage do CHINH extension Markdown dang ky luc runtime, ep
      // kieu tai cho thay vi module augmentation toan cuc (chi 1 noi dung).
      const markdownStorage = editor.storage as unknown as { markdown: { getMarkdown: () => string } };
      onChange(markdownStorage.markdown.getMarkdown());
    },
  });

  if (!editor) {
    return <div className="min-h-64 rounded-lg border border-border bg-surface" />;
  }

  return (
    // KHONG dung overflow-hidden o day (khac ban truoc) - PostEditorToolbar
    // (non-bare) tu khai bao "sticky top-0" de bam theo vung cuon THAT cua
    // app (MainContentArea.tsx, overflow-auto - xem comment o do). Nhung
    // overflow:hidden tren BAT KY to tien nao cung TU DONG bien to tien do
    // thanh 1 "scroll container" theo dung dac ta CSS, khien sticky bi GIOI
    // HAN bam trong pham vi chinh no (cao bang toan bo editor, gom ca noi
    // dung dai) thay vi bam theo cua so cuon THAT ben ngoai - day chinh la
    // ly do toolbar "không bám theo màn hình" nguoi dung bao. Mat goc bo
    // tron o day (chi con o toolbar/EditorContent tu style rieng) la danh
    // doi chap nhan duoc de sticky hoat dong dung.
    <div className="rounded-lg border border-border bg-surface">
      <PostEditorToolbar editor={editor} />
      {/* Bubble menu chon mau chu/nen - hien noi khi CO vung van ban dang
          duoc bôi đen (yeu cau nguoi dung: "khi một vùng text được focus
          (con trỏ giữ bôi tô) thì nút đó sẽ hiện lên, chọn màu nền, màu
          chữ"). */}
      <SelectionColorMenu editor={editor} />
      {/* Thanh dieu khien bang (hang/cot: chen/xoa) - hien noi khi con tro
          dang o trong 1 bang (yeu cau nguoi dung: "Table trong này chưa có
          các button bố trí hợp lý để tăng giảm số lượng cột, hàng, chèn,
          xóa"). */}
      <TableControlsMenu editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
