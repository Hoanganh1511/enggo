"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import { X, ImagePlus, Send, Layers, Plus } from "lucide-react";
import type { ApiSeries } from "@/lib/api/types";
import { createDocumentAction } from "@/actions/documents/create-document";
import { getPostExtensions, POST_PROSE_CLASS } from "./post-extensions";
import { PostEditorToolbar } from "./PostEditorToolbar";
import { SimpleModal } from "@/components/ui/simple-modal";
import { CreateSeriesModal } from "./CreateSeriesModal";
import { useWorkspaceShell } from "./workspace-shell-context";

// Ban "reactor" cua trang soan bai viet (app/(main)/u/[username]/workspaces/
// new/page.tsx + PostEditor.tsx) - mo trong SimpleModal thay vi dieu huong
// sang trang rieng, kich hoat tu nut "Viết bài mới" trong DetailsPanel
// (WorkspaceSwitcher.tsx). CHI mode "create" (sua bai van dung trang rieng
// /workspaces/[slug]/edit, khong dong bo vao day - ngoai pham vi yeu cau).
export function PostEditorModal({
  open,
  onClose,
  groupId,
  seriesId,
}: {
  open: boolean;
  onClose: () => void;
  groupId: string;
  // Gan bai viet moi vao 1 series co san (nhom "cung chu de") - dung boi nut
  // "Thêm bài viết cùng chủ đề" trong ArticleReaderPane.tsx.
  seriesId?: string;
}) {
  const router = useRouter();
  const { username, workspace, groupDocs, refreshGroupDocs } = useWorkspaceShell();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  // Danh muc (DocumentSeries, vd "aws - IAM") de gan bai viet moi vao NGAY
  // luc tao - truoc day chi gan duoc SAU khi tao, bang cach chon nhieu bai roi
  // "Gộp thành 1 nhóm" (xem GroupArticlesSection.tsx). Chi cho chon khi mo
  // composer o che do chung (khong co seriesId co san tu "Thêm bài viết cùng
  // chủ đề" - luc do da co dinh 1 danh muc roi, khong can chon lai).
  const [selectedSeriesId, setSelectedSeriesId] = useState(seriesId ?? "");
  const [createSeriesOpen, setCreateSeriesOpen] = useState(false);
  // Series MOI tao ngay trong modal nay (qua "+ Danh mục mới") - chua nam
  // trong groupDocs (bai dau tien cua no la bai DANG soan, chua ton tai) nen
  // phai gop tay vao seriesOptions thay vi doi refreshGroupDocs.
  const [extraSeries, setExtraSeries] = useState<ApiSeries[]>([]);
  const seriesOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const d of groupDocs) {
      if (d.series && !seen.has(d.series.id)) seen.set(d.series.id, d.series.name);
    }
    for (const s of extraSeries) seen.set(s.id, s.name);
    return [...seen.entries()].map(([id, name]) => ({ id, name }));
  }, [groupDocs, extraSeries]);
  // Luon cho chon/tao danh muc khi khong bi khoa boi seriesId co san - kho
  // khi chua co danh muc nao (seriesOptions rong) VAN hien de nguoi dung tao
  // moi ngay tai day, khong an ca khu vuc di.
  const canPickSeries = !seriesId;

  const editor = useEditor({
    extensions: [
      ...getPostExtensions(),
      Placeholder.configure({
        placeholder:
          "Bắt đầu viết bài của bạn… gõ '/' hoặc dùng thanh công cụ ở trên.",
      }),
    ],
    immediatelyRender: false,
    // Xem comment trong PostEditor.tsx - Tiptap v3 can bat rieng de toolbar
    // (editor.isActive()/selection) tu lam moi khi go/chon van ban.
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: { class: POST_PROSE_CLASS + " px-1 py-4" },
    },
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
    setSelectedSeriesId(seriesId ?? "");
    setExtraSeries([]);
    editor?.commands.clearContent();
  }

  // KHONG dung useTransition() o day: router.push/router.refresh goi BEN
  // TRONG 1 startTransition se khien MOI state update phat sinh tu do (ke ca
  // onClose() dong modal) bi React gom chung vao transition dang cho, nen
  // modal/nut "Đang lưu..." dung im cho toi khi ca router.refresh() (refetch
  // lai layout + trang moi, co the vai giay) xong - CAM GIAC nhu bi treo dù
  // request tao bai da thanh cong tu lau. Dung state thuong (setIsSaving) de
  // "Đang lưu..." CHI phan anh dung luc dang goi createDocumentAction, modal
  // dong ngay khi co ket qua.
  async function save(publish: boolean) {
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
    setIsSaving(true);
    try {
      const saved = await createDocumentAction({
        ...contentPayload,
        knowledgeGroupId: groupId,
        seriesId: seriesId ?? (selectedSeriesId || undefined),
      });
      resetForm();
      onClose();
      refreshGroupDocs();
      // Xem PostEditor.tsx: router.refresh() sau push de tranh Router
      // Cache phia client giu ban RSC cu cua trang doc. Dung dung URL cua
      // cay /workspace/[username]/[workspaceId] (KHONG phai /u/.../workspaces
      // cu) - modal nay chi duoc mo tu trong cay do (xem WorkspaceShell.tsx).
      router.push(`/workspace/${username}/${workspace.id}/${saved.slug}`);
      router.refresh();
    } catch (err) {
      console.error("createDocumentAction failed", err);
      setError("Có lỗi khi lưu, thử lại sau.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <SimpleModal
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            onClose();
            resetForm();
          }
        }}
        title="Viết bài mới"
        description="Bài viết sẽ được gắn vào nhóm kiến thức đang chọn."
        maxWidthClassName="max-w-2xl"
        footer={
          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => save(false)}
              className="h-9 cursor-pointer rounded-md border border-border px-4 text-xs font-semibold text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg disabled:cursor-not-allowed disabled:opacity-60"
            >
              Lưu nháp
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => save(true)}
              className="flex h-9 items-center gap-1.5 rounded-md bg-gradient-to-r from-[#20c5d8] to-[#326eea] px-4 text-xs font-semibold text-white transition-opacity duration-150 ease-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={13} strokeWidth={2.25} />
              {isSaving ? "Đang lưu..." : "Xuất bản"}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {/* Danh muc (series) - hien khi khong bi khoa boi seriesId co san
              (xem comment o selectedSeriesId phia tren). Van hien du khi nhom
              CHUA co danh muc nao, kem nut tao moi ngay tai day. */}
          {canPickSeries && (
            <div className="flex items-center gap-2">
              <Layers size={14} strokeWidth={1.9} className="shrink-0 text-ink-faint" />
              <select
                value={selectedSeriesId}
                onChange={(e) => setSelectedSeriesId(e.target.value)}
                className="h-8 min-w-0 flex-1 cursor-pointer rounded-md border border-border bg-surface-muted px-2 text-xs font-medium text-ink-muted outline-none"
              >
                <option value="">Không thuộc danh mục nào</option>
                {seriesOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setCreateSeriesOpen(true)}
                className="flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-md border border-dashed border-border px-2 text-xs font-medium text-ink-faint transition-colors duration-150 ease-out hover:border-primary hover:text-primary"
              >
                <Plus size={12} strokeWidth={2.25} />
                Danh mục mới
              </button>
            </div>
          )}

          {/* Cover */}
          {coverImageUrl ? (
            <div className="relative h-36 w-full overflow-hidden rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImageUrl}
                alt=""
                className="size-full object-cover"
              />
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
            rows={3}
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
          <div className="overflow-hidden rounded-xl border border-border bg-surface transition-colors duration-150 ease-out focus-within:border-primary/50">
            {editor && <PostEditorToolbar editor={editor} />}
            <div className="px-4">
              <EditorContent editor={editor} className="min-h-90" />
            </div>
          </div>

          {error && <p className="text-xs font-medium text-danger">{error}</p>}
        </div>
      </SimpleModal>
      <CreateSeriesModal
        open={createSeriesOpen}
        onOpenChange={setCreateSeriesOpen}
        groupId={groupId}
        documentIds={[]}
        onCreated={(series) => {
          setExtraSeries((p) => [...p, series]);
          setSelectedSeriesId(series.id);
        }}
      />
    </>
  );
}
