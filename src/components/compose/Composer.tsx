"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import { generateHTML } from "@tiptap/core";
import Placeholder from "@tiptap/extension-placeholder";
import {
  ChevronDown,
  Image as ImageIcon,
  WandSparkles,
  Sparkles,
  MessageSquare,
  Heart,
  Search,
  Lock,
  Eye,
  X,
  Check,
  HelpCircle,
  PanelRight,
} from "lucide-react";
import { createPostAction } from "@/actions/discover/create-post";
import { uploadPostImageAction } from "@/actions/discover/upload-post-image";
import {
  KNOWLEDGE_WORLDS,
  slugToCategoryEnum,
} from "@/lib/discover/knowledge-worlds";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { getPostExtensions, POST_PROSE_CLASS } from "@/components/workspaces/post-extensions";
import { PostEditorToolbar } from "@/components/workspaces/PostEditorToolbar";

type PublishVisibility = "draft" | "public" | "limited";
type RightTab = "publish" | "style" | "ai";

// Port tu source composer-knowledge-hub-main.zip, doi tong mau toi -> sang
// (token app). Giai doan 1 (xem plan "Compose — bien cac phan Sap co thanh
// that") da lam THAT:
// - Editor dinh dang day du - tai dung NGUYEN bo Tiptap cua Document
//   (getPostExtensions/POST_PROSE_CLASS/PostEditorToolbar, xem
//   post-extensions.ts) thay vi textarea phang truoc day.
// - Anh bia + anh chen trong bai - upload THAT qua POST /uploads (dung
//   duong da chay cho chat, xem upload-post-image.ts).
// - Tags - state that, gui kem luc dang bai.
// - Danh muc + Đăng bài + Xem trước: giu nguyen tu truoc, van that.
// - Đăng bài luu `data.richContent` (Tiptap JSON, nguon THAT de render bai -
//   xem ArticleBody.tsx) + `data.content` la excerpt phang (feed
//   card/getPostTitle/ToC cu van doc duoc, khong doi shape).
// - Con lai (draft/cong khai gioi han, cong tac binh luan/thich/tim kiem/tra
//   phi, AI ho tro/AI chat, tab Phong cach) - Giai doan sau, van disabled
//   trung thuc + "Sắp có" dung quy uoc da chot.
// Gioi han kich thuoc anh (bia/chen) - khop voi FileInterceptor o backend
// (UploadController, 25MB), bao truoc thay vi de request that bai roi moi bao.
const MAX_IMAGE_BYTES = 25 * 1024 * 1024;

export function Composer() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<PublishVisibility>("public");
  const [rightTab, setRightTab] = useState<RightTab>("publish");
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const coverInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      ...getPostExtensions(),
      Placeholder.configure({
        placeholder: "Hãy bắt đầu viết nội dung tại đây...",
      }),
    ],
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: { class: POST_PROSE_CLASS + " min-h-[230px]" },
    },
  });

  // shouldRerenderOnTransaction dam bao editor.getText() o day luon la ban
  // moi nhat moi lan component re-render do go phim (khac Tiptap v2) - tinh
  // truc tiep trong render (khong useMemo) vi editor.state la object moi
  // moi transaction, deps array se khong bao gio "on dinh" dung nghia.
  const editorText = editor?.getText().trim() ?? "";
  const words = editorText ? editorText.split(/\s+/).length : 0;
  const canPublish = Boolean(editor && !editor.isEmpty && !isPosting);
  const categoryLabel = KNOWLEDGE_WORLDS.flatMap((w) => w.topics).find(
    (t) => t.slug === categorySlug,
  )?.label;

  function addTag() {
    const t = tagDraft.trim().replace(/^#/, "");
    if (t && !tags.includes(t) && tags.length < 8) setTags((p) => [...p, t]);
    setTagDraft("");
  }

  async function uploadCoverImage(file: File) {
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Ảnh bìa vượt quá 25MB.");
      return;
    }
    setIsUploadingCover(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "image");
      const uploaded = await uploadPostImageAction(formData);
      setCoverImageUrl(uploaded.url);
    } catch {
      setError("Tải ảnh bìa thất bại, thử lại sau.");
    } finally {
      setIsUploadingCover(false);
    }
  }

  async function handlePublish() {
    if (!editor || !canPublish) return;
    setIsPosting(true);
    setError(null);
    const richContent = editor.getJSON();
    const excerptSource = title.trim()
      ? `${title.trim()}\n\n${editor.getText()}`
      : editor.getText();
    const excerpt = excerptSource.slice(0, 600);
    const category = categorySlug
      ? slugToCategoryEnum(categorySlug)
      : undefined;
    try {
      const created = await createPostAction(
        "text",
        {
          content: excerpt,
          richContent,
          coverImage: coverImageUrl || undefined,
          tags,
        },
        category,
      );
      router.push(`/p/${created.id}`);
    } catch {
      setError("Không đăng được bài, thử lại sau.");
      setIsPosting(false);
    }
  }

  return (
    <main className="min-h-[calc(100dvh-var(--header-height))] bg-background px-5 py-5 text-ink">
      <div className="mx-auto grid grid-cols-1 gap-5 3xl:max-w-[1500px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-sm text-ink-faint">
              <span>{words} chữ</span>
              {error && <span className="text-danger">{error}</span>}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPreviewMode((v) => !v)}
                className={`cursor-pointer rounded-lg border px-3 py-2 text-sm transition ${
                  previewMode
                    ? "border-blue-300 bg-blue-50 text-blue-600"
                    : "border-border text-ink-muted hover:bg-hover-bg"
                }`}
              >
                {previewMode ? "Đang xem trước" : "Xem trước"}
              </button>
              <button
                type="button"
                disabled={!canPublish}
                onClick={handlePublish}
                className="cursor-pointer rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-surface transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPosting ? "Đang đăng..." : "Đăng bài"}
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_8px_30px_rgba(16,24,40,.08)]">
            <div
              className="relative flex h-[220px] flex-col justify-end bg-surface-muted p-9"
              style={
                coverImageUrl
                  ? {
                      backgroundImage: `linear-gradient(0deg, rgba(0,0,0,.45), rgba(0,0,0,.1)), url(${coverImageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) uploadCoverImage(file);
                }}
              />
              <button
                type="button"
                disabled={isUploadingCover}
                title={coverImageUrl ? "Đổi ảnh bìa" : "Tải ảnh bìa"}
                onClick={() => coverInputRef.current?.click()}
                className={`mb-auto mt-5 flex h-14 w-14 cursor-pointer items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  coverImageUrl
                    ? "border-white/40 bg-black/30 text-white hover:bg-black/45"
                    : "border-border bg-surface text-ink-faint hover:bg-hover-bg"
                }`}
              >
                <ImageIcon className="h-6 w-6" />
              </button>
              {coverImageUrl && (
                <button
                  type="button"
                  title="Bỏ ảnh bìa"
                  onClick={() => setCoverImageUrl("")}
                  className="absolute top-4 right-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tiêu đề bài viết"
                className={`w-full bg-transparent text-4xl font-bold tracking-tight outline-none md:text-5xl ${
                  coverImageUrl
                    ? "text-white placeholder:text-white/60"
                    : "text-ink placeholder:text-ink-faint"
                }`}
              />
            </div>

            {editor && !previewMode && (
              <div className="flex items-center gap-1 border-t border-border bg-surface-muted px-3 py-1.5">
                <PostEditorToolbar editor={editor} bare />
                <button
                  type="button"
                  disabled
                  title="AI hỗ trợ soạn bài — sắp có"
                  className="ml-auto flex shrink-0 cursor-not-allowed items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/60 px-3 py-2 text-sm font-medium text-blue-400"
                >
                  <WandSparkles className="h-4 w-4" /> AI hỗ trợ
                </button>
              </div>
            )}

            <div className="min-h-[420px] px-9 py-10 md:px-20">
              {previewMode && editor ? (
                <div className="font-content min-h-[230px]">
                  {title.trim() && (
                    <h1 className="mb-4 text-3xl font-bold text-ink">
                      {title}
                    </h1>
                  )}
                  {editor.isEmpty ? (
                    <p className="text-ink-faint">
                      Chưa có nội dung để xem trước.
                    </p>
                  ) : (
                    <div
                      className={POST_PROSE_CLASS}
                      dangerouslySetInnerHTML={{
                        __html: generateHTML(
                          editor.getJSON(),
                          getPostExtensions(),
                        ),
                      }}
                    />
                  )}
                </div>
              ) : (
                <EditorContent editor={editor} />
              )}

              <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-surface-muted px-4 py-4 text-sm text-ink-muted">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-cyan-600">
                  <Sparkles className="h-4 w-4" />
                </span>
                &ldquo;Bạn có muốn viết về điều gì đó bạn vừa học được và có thể
                hữu ích cho người khác không?&rdquo;
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border bg-surface-muted px-5 py-3 text-sm text-ink-faint">
              <div className="flex items-center gap-3">
                <span>{words} chữ</span>
                <button
                  type="button"
                  disabled
                  title="Trò chuyện với AI — sắp có"
                  className="cursor-not-allowed rounded-lg bg-blue-50/60 px-3 py-2 text-blue-400"
                >
                  ✦ AI để trao đổi
                </button>
              </div>
              <div className="flex items-center gap-4">
                <HelpCircle className="h-4 w-4" />
                <span>Gợi ý</span>
                <PanelRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <PanelTabs active={rightTab} setActive={setRightTab} />

          {rightTab === "publish" ? (
            <>
              <Panel title="Cài đặt xuất bản">
                <Radio
                  checked={visibility === "public"}
                  onClick={() => setVisibility("public")}
                  title="Công khai"
                  desc="Mọi người đều có thể xem"
                />
                <Radio
                  checked={visibility === "draft"}
                  onClick={() => setVisibility("draft")}
                  title="Bản nháp"
                  desc="Sắp có — hiện đăng luôn thành bài công khai"
                  disabled
                />
                <Radio
                  checked={visibility === "limited"}
                  onClick={() => setVisibility("limited")}
                  title="Công khai giới hạn"
                  desc="Sắp có"
                  disabled
                />
              </Panel>

              <Panel title="Danh mục">
                <PopoverRoot
                  open={categoryMenuOpen}
                  onOpenChange={setCategoryMenuOpen}
                >
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition ${
                        categorySlug
                          ? "border-blue-300 bg-blue-50 text-blue-600"
                          : "border-border text-ink-muted hover:bg-hover-bg"
                      }`}
                    >
                      {categoryLabel ?? "Chọn danh mục"}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    open={categoryMenuOpen}
                    align="start"
                    className="z-50 max-h-96 w-64 overflow-y-auto rounded-lg border border-border bg-surface p-1.5 shadow-dropdown"
                  >
                    {categorySlug && (
                      <button
                        type="button"
                        onClick={() => {
                          setCategorySlug(null);
                          setCategoryMenuOpen(false);
                        }}
                        className="mb-1 flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-danger hover:bg-hover-bg"
                      >
                        <X size={14} /> Bỏ chọn
                      </button>
                    )}
                    {KNOWLEDGE_WORLDS.map((world) => (
                      <div key={world.slug} className="mb-1 last:mb-0">
                        <p className="px-2 py-1 text-[10px] font-semibold tracking-wide text-ink-faint uppercase">
                          {world.label}
                        </p>
                        {world.topics.map((t) => (
                          <button
                            key={t.slug}
                            type="button"
                            onClick={() => {
                              setCategorySlug(t.slug);
                              setCategoryMenuOpen(false);
                            }}
                            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-ink hover:bg-hover-bg"
                          >
                            <span className="flex-1 truncate">{t.label}</span>
                            {categorySlug === t.slug && (
                              <Check
                                size={14}
                                className="shrink-0 text-blue-500"
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    ))}
                  </PopoverContent>
                </PopoverRoot>
              </Panel>

              <Panel title="Thẻ">
                <div className="flex flex-wrap items-center gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink-muted"
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
                      className="w-20 rounded-md border-none bg-transparent px-1 py-1 text-xs text-ink outline-none placeholder:text-ink-faint"
                    />
                  )}
                </div>
              </Panel>

              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="font-medium text-ink">
                  Hãy để cảm hứng muốn viết luôn ở bên bạn.
                </p>
                <p className="mt-2 text-sm text-ink-muted">
                  &ldquo;Những ý tưởng hay sẽ tìm thấy người phù hợp.&rdquo;
                </p>
              </div>

              <Panel title="Các cài đặt khác">
                <Toggle label="Cho phép bình luận" icon={<MessageSquare />} />
                <Toggle label="Cho phép thích" icon={<Heart />} />
                <Toggle
                  label="Hiển thị trên công cụ tìm kiếm"
                  icon={<Search />}
                />
                <Toggle label="Đặt bài viết trả phí" icon={<Lock />} />
              </Panel>

              <button
                type="button"
                onClick={() => setPreviewMode((v) => !v)}
                className="w-full cursor-pointer rounded-xl border border-border bg-surface py-3 text-sm font-medium text-ink hover:bg-hover-bg"
              >
                <Eye className="mr-2 inline h-4 w-4" /> Preview để xem trước
              </button>
            </>
          ) : (
            <Panel title={rightTab === "style" ? "Phong cách" : "Trợ lý AI"}>
              <p className="text-sm leading-6 text-ink-muted">Sắp có.</p>
            </Panel>
          )}
        </aside>
      </div>
    </main>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="mb-4 text-sm font-semibold text-ink">{title}</h3>
      {children}
    </div>
  );
}

function PanelTabs({
  active,
  setActive,
}: {
  active: RightTab;
  setActive: (x: RightTab) => void;
}) {
  const tabs: { key: RightTab; label: string }[] = [
    { key: "publish", label: "Xuất bản" },
    { key: "style", label: "Phong cách" },
    { key: "ai", label: "Trợ lý AI" },
  ];
  return (
    <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-border bg-surface">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => setActive(tab.key)}
          className={`cursor-pointer px-2 py-3 text-xs transition ${
            active === tab.key
              ? "border-b-2 border-blue-500 text-ink"
              : "text-ink-faint hover:text-ink-muted"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function Radio({
  checked,
  onClick,
  title,
  desc,
  disabled,
}: {
  checked: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`mb-4 flex w-full items-start gap-3 text-left last:mb-0 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          checked ? "border-blue-500 bg-blue-500" : "border-border"
        }`}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
      <span>
        <b className="block text-sm font-medium text-ink">{title}</b>
        <small className="mt-1 block text-xs leading-5 text-ink-faint">
          {desc}
        </small>
      </span>
    </button>
  );
}

// Cong tac o "Cac cai dat khac" - CHUA co field that nao o backend cho
// comments/likes/searchable/paid (Post model khong co cac cot nay) - disabled
// trung thuc thay vi toggle duoc ma khong luu lai gi (dung tinh than da chot
// o home-dashboard/articles-hub).
function Toggle({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2" title="Sắp có">
      <span className="flex items-center gap-2 text-sm text-ink-muted">
        <span className="text-ink-faint">{icon}</span>
        {label}
      </span>
      <button
        type="button"
        disabled
        className="h-5 w-9 cursor-not-allowed rounded-full bg-surface-muted p-0.5"
      >
        <span className="block h-4 w-4 rounded-full bg-ink-faint" />
      </button>
    </div>
  );
}
