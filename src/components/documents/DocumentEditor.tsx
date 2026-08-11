"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEditor, EditorContent } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import { X, ImagePlus, Send, FileText } from "lucide-react";
import type { ApiDocument } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { createDocumentAction } from "@/actions/documents/create-document";
import { updateDocumentAction } from "@/actions/documents/update-document";
import {
  getDocumentExtensions,
  DOC_PROSE_CLASS,
} from "./document-extensions";
import { DocumentEditorToolbar } from "./DocumentEditorToolbar";

// Editor tai lieu lon - dung cho ca tao moi (mode "create") lan sua
// (mode "edit"). Gom: anh bia (URL), tieu de, mo ta ngan, tags, editor Tiptap
// day du (toolbar + bang/anh/callout), va cum nut Luu nhap / Xuat ban.
export function DocumentEditor({
  mode,
  document: doc,
}: {
  mode: "create" | "edit";
  document?: ApiDocument;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(doc?.title ?? "");
  const [summary, setSummary] = useState(doc?.summary ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(doc?.coverImageUrl ?? "");
  const [tags, setTags] = useState<string[]>(doc?.tags ?? []);
  const [tagDraft, setTagDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startTransition] = useTransition();

  const editor = useEditor({
    extensions: [
      ...getDocumentExtensions(),
      Placeholder.configure({
        placeholder: "Bắt đầu viết tài liệu của bạn… gõ '/' hoặc dùng thanh công cụ ở trên.",
      }),
    ],
    content: doc?.content ?? undefined,
    immediatelyRender: false,
    editorProps: { attributes: { class: DOC_PROSE_CLASS + " min-h-[420px] px-1 py-4" } },
  });

  function addTag() {
    const t = tagDraft.trim().replace(/^#/, "");
    if (t && !tags.includes(t) && tags.length < 8) setTags((p) => [...p, t]);
    setTagDraft("");
  }

  function save(publish: boolean) {
    setError(null);
    if (!title.trim()) {
      setError("Tài liệu cần có tiêu đề.");
      return;
    }
    if (!editor) return;
    const payload = {
      title: title.trim(),
      summary: summary.trim() || undefined,
      coverImageUrl: coverImageUrl.trim() || undefined,
      content: editor.getJSON() as Record<string, unknown>,
      tags,
      isPublished: publish,
    };
    startTransition(async () => {
      try {
        const saved =
          mode === "create"
            ? await createDocumentAction(payload)
            : await updateDocumentAction(doc!.id, payload);
        router.push(`/u/${saved.author.username}/docs/${saved.slug}`);
      } catch {
        setError("Có lỗi khi lưu, thử lại sau.");
      }
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 py-6">
      {/* Cover */}
      {coverImageUrl ? (
        <div className="relative h-52 w-full overflow-hidden rounded-2xl border border-border">
          {/* img thuong (khong next/image) - URL nguoi dung nhap tuy y, khong
              qua remotePatterns duoc */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverImageUrl} alt="" className="size-full object-cover" />
          <button
            type="button"
            onClick={() => setCoverImageUrl("")}
            className="absolute top-3 right-3 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            const url = window.prompt("Dán URL ảnh bìa (https://...)");
            if (url) setCoverImageUrl(url);
          }}
          className="flex h-16 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-sm text-ink-faint transition-colors duration-150 ease-out hover:border-community-accent hover:text-community-accent"
        >
          <ImagePlus size={18} strokeWidth={2} />
          Thêm ảnh bìa
        </button>
      )}

      {/* Title */}
      <textarea
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tiêu đề tài liệu"
        rows={1}
        className="resize-none border-none bg-transparent text-[34px] leading-tight font-bold tracking-tight text-ink outline-none placeholder:text-ink-faint/50"
      />

      {/* Summary */}
      <input
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="Mô tả ngắn (tùy chọn) — hiển thị ở thẻ danh sách"
        className="border-none bg-transparent text-base text-ink-muted outline-none placeholder:text-ink-faint/50"
      />

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-ink-muted"
          >
            #{tag}
            <button
              type="button"
              onClick={() => setTags((p) => p.filter((t) => t !== tag))}
              className="cursor-pointer hover:text-danger"
            >
              <X size={11} strokeWidth={2.5} />
            </button>
          </span>
        ))}
        {tags.length < 8 && (
          <input
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag();
              }
            }}
            onBlur={addTag}
            placeholder="+ thẻ"
            className="w-20 border-none bg-transparent text-xs text-ink outline-none placeholder:text-ink-faint"
          />
        )}
      </div>

      {/* Editor */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {editor && <DocumentEditorToolbar editor={editor} />}
        <div className="px-4">
          <EditorContent editor={editor} />
        </div>
      </div>

      {error && <p className="text-sm font-medium text-danger">{error}</p>}

      {/* Footer actions */}
      <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-surface/95 py-3 backdrop-blur-sm">
        <span className="flex items-center gap-1.5 text-xs text-ink-faint">
          <FileText size={13} strokeWidth={2} />
          {mode === "create" ? "Tài liệu mới" : "Đang chỉnh sửa"}
          {doc && !doc.isPublished && " · bản nháp"}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => save(false)}
            className={cn(
              "h-9 cursor-pointer rounded-full border border-border px-4 text-sm font-semibold text-ink-muted hover:bg-hover-bg disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            Lưu nháp
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => save(true)}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-community-accent px-5 text-sm font-semibold text-white hover:bg-community-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={14} strokeWidth={2.25} />
            {isSaving ? "Đang lưu…" : "Xuất bản"}
          </button>
        </div>
      </div>
    </div>
  );
}
