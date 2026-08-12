"use client";

import { useState, useTransition, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import { X, ImagePlus, Send } from "lucide-react";
import { createDocumentAction } from "@/actions/documents/create-document";
import { getPostExtensions, POST_PROSE_CLASS } from "./post-extensions";
import { PostEditorToolbar } from "./PostEditorToolbar";
import TransformModal from "@/components/ui/transform-modal";
import { ModalErrorText } from "@/components/ui/modal-form";

// Ban "reactor" cua trang soan bai viet (app/(main)/u/[username]/workspaces/
// new/page.tsx + PostEditor.tsx) - mo trong TransformModal thay vi dieu
// huong sang trang rieng, kich hoat tu nut "Viết bài mới" trong DetailsPanel
// (WorkspaceSwitcher.tsx). CHI mode "create" (sua bai van dung trang rieng
// /workspaces/[slug]/edit, khong dong bo vao day - ngoai pham vi yeu cau).
//
// PostEditorToolbar/POST_PROSE_CLASS dung TOKEN CSS (var(--ink-muted),
// var(--border)...) de tu doi theo theme sang/toi cua APP - nhung modal nay
// luon nen toi co dinh (giong TransformModal). Thay vi fork lai toolbar chi
// de doi mau, override CUC BO cac bien token do ngay tren div bao ngoai
// (React inline style) bang dung gia tri theme toi "Nebula" da co san trong
// globals.css - moi Tailwind class token (text-ink-muted, border-border...)
// tu dong nhan gia tri toi nay ma khong dung gi den component dung chung.
const darkTokenOverride = {
  "--surface": "#0a1322",
  "--surface-muted": "#07101c",
  "--border": "#18283c",
  "--ink": "#e7edf8",
  "--ink-muted": "#9aaac0",
  "--ink-faint": "#66788f",
  "--hover-bg": "#101f32",
  "--primary": "#22d3ee",
  "--warning": "#f59e0b",
  "--success": "#10b981",
} as CSSProperties;

export function PostEditorModal({
  open,
  onClose,
  groupId,
}: {
  open: boolean;
  onClose: () => void;
  groupId: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startTransition] = useTransition();

  const editor = useEditor({
    extensions: [
      ...getPostExtensions(),
      Placeholder.configure({
        placeholder: "Bắt đầu viết bài của bạn… gõ '/' hoặc dùng thanh công cụ ở trên.",
      }),
    ],
    immediatelyRender: false,
    editorProps: { attributes: { class: POST_PROSE_CLASS + " min-h-[260px] px-1 py-4" } },
  });

  function addTag() {
    const t = tagDraft.trim().replace(/^#/, "");
    if (t && !tags.includes(t) && tags.length < 8) setTags((p) => [...p, t]);
    setTagDraft("");
  }

  function resetForm() {
    setTitle("");
    setSummary("");
    setCoverImageUrl("");
    setTags([]);
    setTagDraft("");
    setError(null);
    editor?.commands.clearContent();
  }

  function save(publish: boolean) {
    setError(null);
    if (!title.trim()) {
      setError("Bài viết cần có tiêu đề.");
      return;
    }
    if (!editor) return;
    const contentPayload = {
      title: title.trim(),
      summary: summary.trim() || undefined,
      coverImageUrl: coverImageUrl.trim() || undefined,
      content: editor.getJSON() as Record<string, unknown>,
      tags,
      isPublished: publish,
    };
    startTransition(async () => {
      try {
        const saved = await createDocumentAction({
          ...contentPayload,
          knowledgeGroupId: groupId,
        });
        resetForm();
        onClose();
        router.push(`/u/${saved.author.username}/workspaces/${saved.slug}`);
      } catch {
        setError("Có lỗi khi lưu, thử lại sau.");
      }
    });
  }

  return (
    <TransformModal
      open={open}
      onClose={() => {
        onClose();
        resetForm();
      }}
      title="Viết bài mới"
      description="Bài viết sẽ được gắn vào nhóm kiến thức đang chọn."
      footer={
        <div className="flex items-center justify-between border-t border-white/[0.06] px-6 py-4">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => save(false)}
            className="h-9 cursor-pointer rounded-md border border-white/10 px-4 text-xs font-semibold text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Lưu nháp
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => save(true)}
            className="flex h-9 items-center gap-1.5 rounded-md bg-linear-to-r from-cyan-500 to-blue-500 px-4 text-xs font-semibold text-white transition-opacity duration-150 ease-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={13} strokeWidth={2.25} />
            {isSaving ? "Đang lưu..." : "Xuất bản"}
          </button>
        </div>
      }
    >
      <div
        style={darkTokenOverride}
        className="flex max-h-[420px] flex-col gap-4 overflow-y-auto pr-1"
      >
        {/* Cover */}
        {coverImageUrl ? (
          <div className="relative h-36 w-full overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImageUrl} alt="" className="size-full object-cover" />
            <button
              type="button"
              onClick={() => setCoverImageUrl("")}
              className="absolute top-2 right-2 flex size-7 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              const url = window.prompt("Dán URL ảnh bìa (https://...)");
              if (url) setCoverImageUrl(url);
            }}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-xs text-ink-faint transition-colors duration-150 ease-out hover:border-primary hover:text-primary"
          >
            <ImagePlus size={16} strokeWidth={2} />
            Thêm ảnh bìa
          </button>
        )}

        {/* Title */}
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tiêu đề bài viết"
          rows={1}
          className="resize-none border-none bg-transparent text-2xl leading-tight font-bold tracking-tight text-ink outline-none placeholder:text-ink-faint/50"
        />

        {/* Summary */}
        <input
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Mô tả ngắn (tùy chọn)"
          className="border-none bg-transparent text-sm text-ink-muted outline-none placeholder:text-ink-faint/50"
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
                className="cursor-pointer hover:text-red-400"
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
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          {editor && <PostEditorToolbar editor={editor} />}
          <div className="px-4">
            <EditorContent editor={editor} />
          </div>
        </div>

        {error && <ModalErrorText>{error}</ModalErrorText>}
      </div>
    </TransformModal>
  );
}
