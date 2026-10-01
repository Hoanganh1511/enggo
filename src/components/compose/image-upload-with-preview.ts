import type { Editor } from "@tiptap/react";

// [2026-10-02] Chen ANH NGAY luc paste/dan (truoc day: cho upload xong (1-2s)
// MOI chen node anh - trong luc cho nguoi dung khong thay gi, de tuong paste
// khong an thua, xem yeu cau nguoi dung: "lúc paste ảnh vào không có UI/UX gì
// cho việc đang chuẩn bị ảnh"). Gio chen node "image" NGAY voi src la 1
// object URL LOCAL (xem URL.createObjectURL) + uploading:true - NodeView
// (image-view.tsx) tu ve preview THAT cua anh vua dan kem overlay "Đang tải
// ảnh lên...". `uploadId` (UUID rieng cho LAN nay) la CHIA KHOA de tim lai
// DUNG node sau khi upload xong bang resolveUploadingImage() - KHONG dung vi
// tri (position) vi nguoi dung co the da go them chu lam doc lech vi tri
// trong luc cho upload.
function generateUploadId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `upl-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function insertUploadingImagePlaceholder(
  editor: Editor,
  file: File,
  pos?: number,
): { uploadId: string; previewSrc: string } {
  const uploadId = generateUploadId();
  const previewSrc = URL.createObjectURL(file);
  const attrs = { src: previewSrc, uploading: true, uploadId };
  if (pos === undefined) {
    editor.chain().focus().insertContent({ type: "image", attrs }).run();
  } else {
    editor.chain().focus().insertContentAt(pos, { type: "image", attrs }).run();
  }
  return { uploadId, previewSrc };
}

// Tim node "image" dang mang DUNG uploadId nay (bat ke no da bi doc dich
// chuyen vi tri the nao trong luc cho) - tra ve null neu khong tim thay (vd
// nguoi dung da tu xoa ảnh placeholder do truoc khi upload kip xong).
function findUploadingImagePos(editor: Editor, uploadId: string): number | null {
  let found: number | null = null;
  editor.state.doc.descendants((node, pos) => {
    if (found !== null) return false;
    if (node.type.name === "image" && node.attrs.uploadId === uploadId) {
      found = pos;
      return false;
    }
    return true;
  });
  return found;
}

// Goi SAU KHI upload xong (thanh cong hoac that bai) - luon revoke object URL
// local (tranh ri bo nho, xem MDN URL.revokeObjectURL) bat ke ket qua the nao.
export function resolveUploadingImage(
  editor: Editor,
  uploadId: string,
  previewSrc: string,
  result: { url: string } | null,
) {
  URL.revokeObjectURL(previewSrc);
  const pos = findUploadingImagePos(editor, uploadId);
  if (pos === null) return;
  const node = editor.state.doc.nodeAt(pos);
  if (!node) return;
  if (result) {
    editor.view.dispatch(
      editor.state.tr.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        src: result.url,
        uploading: false,
        uploadId: null,
      }),
    );
  } else {
    // Upload that bai - xoa han node placeholder (anh local da revoke, khong
    // con gi de hien) thay vi de lai 1 "ảnh hỏng" vo nghia trong noi dung.
    editor.view.dispatch(editor.state.tr.delete(pos, pos + node.nodeSize));
  }
}
