"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import { motion, type Easing } from "framer-motion";
import { X, ImagePlus, Send, FileText } from "lucide-react";
import type { ApiDocument } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { createDocumentAction } from "@/actions/documents/create-document";
import { updateDocumentAction } from "@/actions/documents/update-document";
import {
  getPostExtensions,
  getOverviewExtensions,
  POST_PROSE_CLASS,
  OVERVIEW_PROSE_CLASS,
} from "./post-extensions";
import { PostEditorToolbar } from "./PostEditorToolbar";
import { OverviewEditorToolbar } from "./OverviewEditorToolbar";

// Editor bai viet lon - dung cho ca tao moi (mode "create") lan sua
// (mode "edit"). Gom: anh bia (URL), tieu de, mo ta ngan, tags, editor Tiptap
// day du (toolbar + bang/anh/callout), va cum nut Luu nhap / Xuat ban. Tao
// moi LUON gan voi 1 Knowledge Group cu the (groupId bat buoc, xem
// app/(main)/u/[username]/workspaces/new/page.tsx) - khong cho tao "bai viet
// roi" ngoai nhom nao ca.
export function PostEditor({
  mode,
  document: doc,
  groupId,
  onSaved,
  floatingToolbar = false,
  onCancel,
}: {
  mode: "create" | "edit";
  document?: ApiDocument;
  groupId?: string;
  // Khi nhung PostEditor vao 1 noi KHONG phai trang rieng (vd panel sua
  // trong ArticleReaderPane) - goi onSaved(saved) THAY VI router.push mac
  // dinh, de noi nhung tu quyet dinh lam gi tiep (dong panel + cap nhat
  // state tai cho) ma khong bi dieu huong ra khoi trang.
  onSaved?: (saved: ApiDocument) => void;
  // Tach bo toolbar dinh dang ra 1 the kinh noi rieng (sticky, tu lat+mo
  // dan xuat hien) thay vi nam trong khung border cung EditorContent - dung
  // cho ArticleReaderPane's edit-mode choreography. Cac noi dung khac
  // (trang /workspaces/new, /workspaces/[slug]/edit) khong truyen prop nay,
  // giu nguyen layout toolbar-trong-khung nhu truoc.
  floatingToolbar?: boolean;
  // Nut dong/huy hien thi canh toolbar khi floatingToolbar - chi co y nghia
  // khi PostEditor duoc nhung vao 1 flow co the "thoat" ma khong luu.
  onCancel?: () => void;
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
      ...getPostExtensions(),
      Placeholder.configure({
        placeholder:
          "Bắt đầu viết bài của bạn… gõ '/' hoặc dùng thanh công cụ ở trên.",
      }),
    ],
    content: doc?.content ?? undefined,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: POST_PROSE_CLASS + " min-h-[420px] px-1 py-4" },
    },
  });

  const overviewEditor = useEditor({
    extensions: [
      ...getOverviewExtensions(),
      Placeholder.configure({
        placeholder: "Tóm tắt các ý chính… hiển thị dưới tiêu đề trong danh sách.",
      }),
    ],
    content: doc?.overview ?? undefined,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: OVERVIEW_PROSE_CLASS + " min-h-[64px] px-3 py-2" },
    },
  });

  function addTag() {
    const t = tagDraft.trim().replace(/^#/, "");
    if (t && !tags.includes(t) && tags.length < 8) setTags((p) => [...p, t]);
    setTagDraft("");
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
      overview:
        overviewEditor && !overviewEditor.isEmpty
          ? (overviewEditor.getJSON() as Record<string, unknown>)
          : undefined,
      coverImageUrl: coverImageUrl.trim() || undefined,
      content: editor.getJSON() as Record<string, unknown>,
      tags,
      isPublished: publish,
    };
    startTransition(async () => {
      try {
        const saved =
          mode === "create"
            ? await createDocumentAction({
                ...contentPayload,
                knowledgeGroupId: groupId!,
              })
            : await updateDocumentAction(doc!.id, contentPayload);
        if (onSaved) onSaved(saved);
        else {
          // router.push roi thoi la CHUA du - Router Cache phia client cua
          // Next co the van giu ban RSC cu cua trang doc (neu vua ghe qua no
          // truoc khi bam Sua), khien vua luu xong quay lai van thay noi dung
          // CU (vd callout van hien "Lưu ý" du da doi variant "danger"
          // trong luc soan). router.refresh() ep lam moi cay Router Cache
          // NGAY SAU khi dieu huong, dam bao trang dich luon fetch du lieu
          // that moi tu server thay vi tai lai ban cache.
          router.push(`/u/${saved.author.username}/workspaces/${saved.slug}`);
          router.refresh();
        }
      } catch {
        setError("Có lỗi khi lưu, thử lại sau.");
      }
    });
  }

  // Noi dung field (cover/title/summary/tags/editor/error) dung CHUNG cho ca
  // 2 layout ben duoi - chi khac nhau o cho SCROLL va vi tri thanh footer.
  const fields = (
    <div className="flex w-full flex-col gap-4">
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
        placeholder="Tiêu đề bài viết"
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

      {/* Overview - tong quan noi dung, editor mini (toolbar han che), hien
          thanh 1 box duoi tieu de trong danh sach bai viet (xem ArticleCard). */}
      <div>
        <p className="mb-1.5 text-xs font-medium text-ink-faint">
          Tổng quan nội dung (tùy chọn)
        </p>
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          {overviewEditor && <OverviewEditorToolbar editor={overviewEditor} />}
          <EditorContent editor={overviewEditor} />
        </div>
      </div>

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
      {floatingToolbar ? (
        <>
          {editor && (
            <FloatingEditorToolbar editor={editor} onCancel={onCancel} />
          )}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="px-4">
              <EditorContent editor={editor} />
            </div>
          </div>
        </>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          {editor && <PostEditorToolbar editor={editor} />}
          <div className="px-4">
            <EditorContent editor={editor} />
          </div>
        </div>
      )}

      {error && <p className="text-sm font-medium text-danger">{error}</p>}
    </div>
  );

  // Footer actions - luon dung 1 layout, chi khac cho "sticky" (trang doc
  // lap, page scroll toan bo - giu nguyen hanh vi cu) hay "khong sticky"
  // (embedded trong ArticleReaderPane - xem ly do o duoi).
  const footer = (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur-sm",
        floatingToolbar ? "rounded-lg shadow-panel" : "sticky bottom-0 rounded-lg",
      )}
    >
      <span className="flex items-center gap-1.5 text-xs text-ink-faint">
        <FileText size={13} strokeWidth={2} />
        {mode === "create" ? "Bài viết mới" : "Đang chỉnh sửa"}
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
  );

  // floatingToolbar (nhung trong ArticleReaderPane): truoc day ca khoi
  // fields+footer nam CHUNG 1 vung scroll voi footer "sticky bottom-0" ->
  // luc scroll giua chung, footer noi/de len ngay tren noi dung dang doc
  // (khong tham my, dung nhu phan hoi). Fix: TACH rieng - fields nam trong
  // 1 vung scroll RIENG (flex-1 overflow-y-auto), footer la 1 hang CO DINH
  // (shrink-0) NAM NGOAI vung scroll do, khong con sticky nua vi no da o
  // dung cho co dinh cua no trong flex-col, khong the bi noi dung "chay
  // qua" duoc nua.
  //
  // "mx-auto max-w-3xl" CHI dat 1 LAN o container NGOAI CUNG (bao ca vung
  // scroll lan footer) - truoc day fields va footer moi ben tu can giua
  // RIENG, nen scrollbar cua vung scroll (chi fields co) lam be rong kha
  // dung cua NO hep hon vai px so voi footer (khong co scrollbar), khien 2
  // cot can giua lech nhau vai px du cung max-w-3xl. Dat 1 lan o ngoai roi
  // de fields/footer chi "w-full" ben trong thi ca 2 LUON chung dung 1 cap
  // canh trai/phai, khong the lech nua.
  if (floatingToolbar) {
    return (
      <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="pt-6 pb-10">{fields}</div>
        </div>
        <div className="pt-3 pb-4">{footer}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 py-6">
      {fields}
      {footer}
    </div>
  );
}

// Toolbar dinh dang tach rieng thanh 1 the kinh (dung cho floatingToolbar).
// Xuat hien qua 1 chuoi CHUYEN DONG lien tuc, 4 pha tren CUNG 1 timeline
// (dung keyframe arrays dung "times" thay vi spring, vi spring khong ho tro
// nhieu waypoint):
//   1. (0 -> 0.28)  keo cheo tu goc duoi-trai len (x,y cung dich chuyen).
//   2. (0.28 -> 0.72) tiep tuc keo NGANG ve dung vi tri x=0.
//   3. (0.52 -> 0.86) lat (rotateX) tu up mat sau ve dung chieu, gan cuoi
//      doan ngang de "lat" xay ra ngay khi vua toi noi.
//   4. (0.86 -> 1)  "khop noi lap rap": scale nay len roi on dinh lai
//      (1 -> 1.06 -> 1) ngay sau khi lat xong, mo phong cam giac ruynh 1
//      cai vua khop vao vi tri.
// Do mo (blur) CHI la 1 class TINH duoc bat/tat DUNG 1 LAN qua onUpdate theo
// dung tien do rotateX thuc te - KHONG animate gia tri filter qua Framer
// (dung nguyen tac da chot trong docs/workspace-style-guide.md: animate
// filter lien tuc gay mo du/giat), nen o day filter chi doi trang thai roi
// dung yen, khong noi suy tung frame.
const TOOLBAR_ENTRANCE_TIMES = [0, 0.28, 0.52, 0.72, 0.86, 0.93, 1];
const TOOLBAR_ENTRANCE_EASE: Easing[] = [
  "easeOut",
  "easeInOut",
  "easeIn",
  "easeOut",
  [0.34, 1.56, 0.64, 1],
  "easeIn",
];

function FloatingEditorToolbar({
  editor,
  onCancel,
}: {
  editor: Editor;
  onCancel?: () => void;
}) {
  const [flipped, setFlipped] = useState(true);
  return (
    <motion.div
      initial={{ opacity: 0, x: -64, y: 46, rotateX: -115, scale: 0.94 }}
      animate={{
        opacity: [0, 1, 1, 1, 1, 1, 1],
        x: [-64, -58, -16, 0, 0, 0, 0],
        y: [46, 40, 6, 0, 0, 0, 0],
        rotateX: [-115, -115, -115, -55, 0, 0, 0],
        scale: [0.94, 0.96, 0.98, 1, 1, 1.06, 1],
      }}
      transition={{
        duration: 0.9,
        times: TOOLBAR_ENTRANCE_TIMES,
        ease: TOOLBAR_ENTRANCE_EASE,
      }}
      onUpdate={(latest) => {
        const rx = typeof latest.rotateX === "number" ? latest.rotateX : 0;
        if (flipped && Math.abs(rx) < 35) setFlipped(false);
      }}
      className={cn(
        "sticky top-0 z-10 mb-3 flex items-center gap-1 rounded-2xl border px-2 py-1.5 shadow-panel",
        flipped && "blur-[3px]",
      )}
      style={{
        transformPerspective: 900,
        borderColor: "var(--border)",
        background: "color-mix(in srgb, var(--surface) 88%, transparent)",
        backdropFilter: "blur(14px)",
      }}
    >
      <PostEditorToolbar editor={editor} />
      {onCancel && (
        <>
          <span
            className="mx-1 h-5 w-px shrink-0"
            style={{ background: "var(--border)" }}
          />
          <button
            type="button"
            onClick={onCancel}
            className="ml-auto flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink-faint transition-colors duration-150 ease-out hover:text-danger"
          >
            <X size={15} strokeWidth={1.9} />
          </button>
        </>
      )}
    </motion.div>
  );
}
