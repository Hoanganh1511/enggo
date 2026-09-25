"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { getPostExtensions, POST_PROSE_CLASS } from "@/components/compose/post-extensions";
import { PostEditorToolbar } from "@/components/compose/PostEditorToolbar";
import { SelectionColorMenu } from "@/components/compose/SelectionColorMenu";
import { TableControlsMenu } from "@/components/compose/TableControlsMenu";
import { EntryHeadingsToc } from "@/components/compose/EntryHeadingsToc";
import { FindReplacePanel } from "@/components/compose/FindReplacePanel";
import { uploadPostImageAction } from "@/actions/discover/upload-post-image";
import { convertHeicToJpegIfNeeded } from "@/lib/heic-convert";
import { getApiErrorMessage } from "@/lib/api/client";
import { toast } from "@/lib/toast/toast-store";

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
  saving = false,
}: {
  value: string;
  onChange: (markdown: string) => void;
  // Panel "Mục lục" (EntryHeadingsToc) la `fixed` - NEO THANG vao man hinh,
  // KHONG nam trong pham vi hop cua LayoutSpinnerOverlay (absolute inset-0
  // bam theo to tien "relative" trong SeriesEntryForm.tsx, chi phu dung phan
  // NOI DUNG THAT cua form, khong chac chan vuon toi het vung man hinh noi
  // TOC dang neo) - yeu cau nguoi dung: "Lớp phủ loading tại sao không che
  // hết?" (kem anh: TOC ben phai van net cang trong khi phan con lai da mo
  // di luc luu). Thay vi co gang mo rong hinh hoc cua overlay dung toi dung
  // vi tri TOC (de vo tinh anh huong CA cac trang khac dung chung
  // LayoutSpinnerOverlay), truyen THANG trang thai `saving` xuong de TOC tu
  // mo/khoa chinh no - doc lap voi hinh dang/z-index cua overlay.
  saving?: boolean;
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
      // [2026-09-25] Dan (Ctrl+V) 1 anh THAT (vd screenshot copy tu ngoai) -
      // yeu cau nguoi dung: "Copy ảnh paste trực tiếp vào thì không hiện".
      // Nguyen nhan: KHONG co handlePaste rieng o day (khac Composer.tsx da
      // co san CHINH tinh nang nay tu truoc) - Tiptap/trinh duyet MAC DINH
      // se thu chen anh dan duoc thanh 1 the <img src="data:..."> (base64)
      // ngay tren clipboard, nhung Image.configure({ allowBase64: false })
      // (post-extensions.ts) TU CHOI hoan toan cac src dang base64 - ket qua
      // la 1 the <img> KHONG CO src hop le, hien ra icon "ảnh hỏng" (dung y
      // het anh chup nguoi dung gui). Fix: chan hanh vi mac dinh, tu UPLOAD
      // that (dung CHUNG duong upload voi ImagePickerModal.tsx/Composer.tsx)
      // roi chen bang URL that da luu tren server, khong bao gio dung base64.
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []);
        const imageFile = files.find((f) => f.type.startsWith("image/"));
        if (!imageFile) return false; // khong phai anh - de Tiptap tu xu ly paste binh thuong (text/HTML)
        event.preventDefault();
        void (async () => {
          try {
            const uploadFile = await convertHeicToJpegIfNeeded(imageFile);
            const formData = new FormData();
            formData.append("file", uploadFile);
            formData.append("kind", "image");
            const uploaded = await uploadPostImageAction(formData);
            editor?.chain().focus().setImage({ src: uploaded.url }).run();
          } catch (err) {
            toast.danger(getApiErrorMessage(err, "Dán ảnh thất bại, thử lại sau."));
          }
        })();
        return true; // da tu xu ly - chan Tiptap chen them noi dung thua tu clipboard.
      },
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
      {/* "Tìm kiếm"/"Tìm & Thay thế" (Ctrl+F/Ctrl+H) - xem
          search-replace-extension.tsx. */}
      <FindReplacePanel editor={editor} />
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
      {/* Panel "Mục lục" (H2 > H3 > H4) - neo goc phai man hinh, chiem lai
          khoang trong ben phai sau khi bo cot Live preview cu (xem
          SeriesEntryForm.tsx) - yeu cau nguoi dung: "Chưa thêm 1 phần diện
          tích bên phải để hiện cho TOC nữa". */}
      <EntryHeadingsToc editor={editor} disabled={saving} />
    </div>
  );
}
