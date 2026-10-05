"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { getPostExtensions, POST_PROSE_CLASS } from "@/components/compose/post-extensions";
import { PostEditorToolbar } from "@/components/compose/PostEditorToolbar";
import { SelectionFloatingMenu } from "@/components/compose/SelectionFloatingMenu";
import { EntryHeadingsToc } from "@/components/compose/EntryHeadingsToc";
import { FindReplacePanel } from "@/components/compose/FindReplacePanel";
import { uploadPostImageAction } from "@/actions/discover/upload-post-image";
import { convertHeicToJpegIfNeeded } from "@/lib/heic-convert";
import { getApiErrorMessage } from "@/lib/api/client";
import { toast } from "@/lib/toast/toast-store";
import { insertUploadingImagePlaceholder, resolveUploadingImage } from "@/components/compose/image-upload-with-preview";

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
      // transformPastedText:true - yeu cau nguoi dung: dan text THUONG (vd
      // copy tu ChatGPT) co cu phap markdown (bang/heading/list/bold...)
      // phai TU DUNG thanh node THAT trong editor, khong bi Tiptap mac
      // dinh tach moi dong thanh 1 doan van rieng (dung bug nguoi dung vua
      // gap: dan 1 bang markdown, luu lai thanh cac dong CACH NHAU boi dong
      // trong, pha vo cu phap bang GFM - bang bien thanh text tho o trang
      // doc). tiptap-markdown DA CO SAN co nay (MarkdownClipboard - xem
      // node_modules/tiptap-markdown/src/extensions/tiptap/clipboard.js),
      // hook vao dung "clipboardTextParser" cua ProseMirror de parse text
      // dan qua CHINH parser markdown-it dang dung (thay vi hanh vi mac
      // dinh: tach theo tung dong rong thanh doan van) - khong can code
      // rieng. Van TON TRONG "dan dang plain text" (Ctrl+Shift+V, giu
      // nguyen van ban tho khong dien giai) vi thu vien tu kiem tra co nay
      // TRUOC, bo qua parse markdown neu nguoi dung giu Shift luc dan.
      Markdown.configure({ tightLists: true, linkify: false, transformPastedText: true }),
    ],
    content: value,
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editorProps: {
      // spellcheck="false" - yeu cau nguoi dung: "bỏ cái gợi ý từ gì nền đen
      // này đi" (popup goi y chinh ta MAC DINH cua trinh duyet - Edge/Chrome
      // tu gach chan do + hien goi y khi tu "sai chinh ta" theo tu dien
      // TIENG ANH cua may, trong khi noi dung o day thuong la tieng Viet xen
      // thuat ngu/code tieng Anh, gay goi y sai lech lien tuc va gay roi mat
      // khi soan). Day la thuoc tinh HTML chuan, KHONG lien quan gi Tiptap -
      // trinh duyet tu TAT han spellcheck/goi y cho vung contentEditable nay.
      attributes: { class: POST_PROSE_CLASS + " min-h-64 px-3 py-2.5", spellcheck: "false" },
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
        if (!editor) return true;
        // Chen preview NGAY (xem image-upload-with-preview.ts) - khac truoc
        // day (cho upload xong moi chen, khong co gi hien thi trong luc cho).
        const { uploadId, previewSrc } = insertUploadingImagePlaceholder(editor, imageFile);
        void (async () => {
          try {
            const uploadFile = await convertHeicToJpegIfNeeded(imageFile);
            const formData = new FormData();
            formData.append("file", uploadFile);
            formData.append("kind", "image");
            const uploaded = await uploadPostImageAction(formData);
            resolveUploadingImage(editor, uploadId, previewSrc, uploaded);
          } catch (err) {
            resolveUploadingImage(editor, uploadId, previewSrc, null);
            toast.danger(getApiErrorMessage(err, "Dán ảnh thất bại, thử lại sau."));
          }
        })();
        return true; // da tu xu ly - chan Tiptap chen them noi dung thua tu clipboard.
      },
      // [2026-09-30] Keo-tha (drag & drop) 1 file anh tu NGOAI trinh duyet
      // (vd tu File Explorer/Finder) tha vao vung soan - yeu cau nguoi dung:
      // "Triển khai tính năng giúp kéo ảnh từ bên ngoài và thả vào ô là cũng
      // upload". Cung 1 duong upload voi handlePaste o tren, chi khac cho
      // CHEN: dung view.posAtCoords(event.x/y) de biet CHINH XAC tha vao vi
      // tri nao trong tai lieu (khong phai luon chen o cuoi/o con tro dang
      // dung), roi insertContentAt DUNG vi tri do - khop hanh vi nguoi dung ky
      // vong khi keo-tha (anh xuat hien dung cho tha, khong "nhay" di noi
      // khac). Tiptap MAC DINH da co the tu xu ly drop-anh-thanh-base64 (nhu
      // paste) - van phai chan tay giong het ly do handlePaste da giai thich
      // (Image.configure({allowBase64:false}) se tu choi, ra "ảnh hỏng").
      handleDrop: (view, event) => {
        const files = Array.from(event.dataTransfer?.files ?? []);
        const imageFile = files.find((f) => f.type.startsWith("image/"));
        if (!imageFile) return false; // khong phai anh - de Tiptap tu xu ly drop binh thuong (vd keo doan text)
        event.preventDefault();
        if (!editor) return true;
        const coords = { left: event.clientX, top: event.clientY };
        const pos = view.posAtCoords(coords)?.pos ?? view.state.selection.from;
        const { uploadId, previewSrc } = insertUploadingImagePlaceholder(editor, imageFile, pos);
        void (async () => {
          try {
            const uploadFile = await convertHeicToJpegIfNeeded(imageFile);
            const formData = new FormData();
            formData.append("file", uploadFile);
            formData.append("kind", "image");
            const uploaded = await uploadPostImageAction(formData);
            resolveUploadingImage(editor, uploadId, previewSrc, uploaded);
          } catch (err) {
            resolveUploadingImage(editor, uploadId, previewSrc, null);
            toast.danger(getApiErrorMessage(err, "Thả ảnh thất bại, thử lại sau."));
          }
        })();
        return true; // da tu xu ly - chan hanh vi drop mac dinh cua trinh duyet/Tiptap.
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

  // [2026-10-01] Khoa editor (setEditable(false)) trong luc dang luu - bug
  // nguoi dung bao kem anh chup: dang dung trong 1 bang roi bam Luu, thanh
  // dieu khien bang (SelectionFloatingMenu.tsx, merge tu TableControlsMenu cu)
  // VAN con hien SAC NET ngay giua man hinh da mo/blur boi LayoutSpinnerOverlay
  // (SeriesEntryForm.tsx) - BubbleMenu nay portal thang ra document.body voi
  // z-50 (CAO HON z-40 cua overlay, co chu dich tu truoc de KHONG bi overlay
  // de len luc dang soan binh thuong), nen luc dang luu no "nổi" han len tren
  // lop mo, nhin nhu bi ket/vo giao dien. shouldShow cua CA SelectionFloatingMenu
  // LAN TableControlsMenu (du file sau da khong con dung) deu co san dieu kien
  // "!ed.isEditable -> an" - chi can CHINH THANG editable=false trong luc
  // saving la ca 2 menu tu an, khong can sua rieng tung bubble menu.
  useEffect(() => {
    editor?.setEditable(!saving);
  }, [editor, saving]);

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
      {/* Menu noi THONG NHAT (mau chu/nen + thao tac bang) - GOP 2 BubbleMenu
          doc lap truoc day (SelectionColorMenu/TableControlsMenu) thanh 1 -
          bug nguoi dung bao: "có nhiều loại group buttons... chúng đè ẩn
          nhau hết rồi" (2 popup rieng tinh CUNG toa do quanh CUNG vung chon
          luc bôi đen văn bản NGAY TRONG 1 o bang, de len nhau). Xem
          SelectionFloatingMenu.tsx ve logic xac dinh phan nao hien + thu tu. */}
      <SelectionFloatingMenu editor={editor} />
      <EditorContent editor={editor} />
      {/* Panel "Mục lục" (H2 > H3 > H4) - neo goc phai man hinh, chiem lai
          khoang trong ben phai sau khi bo cot Live preview cu (xem
          SeriesEntryForm.tsx) - yeu cau nguoi dung: "Chưa thêm 1 phần diện
          tích bên phải để hiện cho TOC nữa". */}
      <EntryHeadingsToc editor={editor} disabled={saving} />
    </div>
  );
}
