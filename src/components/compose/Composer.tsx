"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import { generateHTML } from "@tiptap/core";
import Placeholder from "@tiptap/extension-placeholder";
import {
  ChevronDown,
  Image as ImageIcon,
  ImagePlus,
  Settings2,
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
  Send,
  Globe,
  FileText,
  Users,
  RefreshCw,
  PenLine,
  ListTree,
  Wand2,
  FileSearch,
  RotateCcw,
  SpellCheck2,
  Plus,
  Folder,
} from "lucide-react";
import { createPostAction } from "@/actions/discover/create-post";
import { updatePostAction } from "@/actions/discover/update-post";
import { uploadPostImageAction } from "@/actions/discover/upload-post-image";
import { listMyCollectionsAction } from "@/actions/discover/collections/list-my-collections";
import { addToCollectionAction } from "@/actions/discover/collections/add-to-collection";
import { CreateCollectionModal } from "@/components/collections/CreateCollectionModal";
import type { PostCollectionApiShape } from "@/lib/api/collections";
import { improvePostDraftAction } from "@/actions/post-assistant/improve-post-draft";
import { chatAboutPostDraftAction } from "@/actions/post-assistant/chat-about-post-draft";
import { getApiErrorMessage } from "@/lib/api/client";
import { convertHeicToJpegIfNeeded } from "@/lib/heic-convert";
import { validateCoverImageFile, validateCoverImageDimensions } from "@/lib/validate-cover-image";
import { loadImageBitmap, cropAndResizeCoverImage } from "@/lib/resize-cover-image";
import type { ChatMessage } from "@/lib/api/types";
import { formatTimeOnly } from "@/lib/format-time";
import {
  KNOWLEDGE_WORLDS,
  slugToCategoryEnum,
  categoryEnumToSlug,
} from "@/lib/discover/knowledge-worlds";
import type { Post } from "@/content/home-feed-mock";
import { getPostTitle } from "@/components/discover/home-feed/post-display";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { getPostExtensions, POST_PROSE_CLASS } from "@/components/workspaces/post-extensions";
import { PostEditorToolbar } from "@/components/workspaces/PostEditorToolbar";

type PublishVisibility = "draft" | "public" | "limited";
type RightTab = "publish" | "ai";

// 4 goi y nhanh cho "AI hỗ trợ" (popover trong toolbar, desktop lan mobile
// deu dung) - nguoi dung van go duoc yeu cau tu do (input ben duoi), day chi
// la loi tat cho cac yeu cau hay dung nhat.
const IMPROVE_PRESETS = ["Viết tiếp", "Rút gọn", "Diễn đạt lại", "Sửa lỗi chính tả"];

// 6 the goi y trong tab "Trợ lý AI" (mobile, xem mockup) - CA 6 deu goi lai
// applyImprove() ~ dung 1 endpoint /post-assistant/improve GENERIC san co
// (nhan content+instruction bat ky), KHONG can backend moi - chi la 6 chuoi
// instruction khac nhau.
const AI_ACTION_CARDS: {
  icon: typeof PenLine;
  label: string;
  desc: string;
  instruction: string;
}[] = [
  { icon: PenLine, label: "Viết mở bài", desc: "Tạo đoạn mở đầu thu hút", instruction: "Viết đoạn mở bài thu hút cho bài viết này" },
  { icon: ListTree, label: "Viết dàn ý", desc: "Tạo cấu trúc bài viết chi tiết", instruction: "Viết dàn ý (outline) chi tiết cho bài viết này" },
  { icon: Wand2, label: "Mở rộng nội dung", desc: "Phát triển ý tưởng của bạn", instruction: "Mở rộng và phát triển thêm nội dung bài viết này" },
  { icon: FileSearch, label: "Tóm tắt nội dung", desc: "Rút gọn bài viết", instruction: "Tóm tắt ngắn gọn nội dung bài viết này" },
  { icon: RotateCcw, label: "Diễn đạt lại", desc: "Viết lại hay hơn, tự nhiên hơn", instruction: "Diễn đạt lại nội dung cho hay hơn, tự nhiên hơn" },
  { icon: SpellCheck2, label: "Kiểm tra chính tả", desc: "Phát hiện lỗi và sửa ngữ pháp", instruction: "Kiểm tra và sửa lỗi chính tả, ngữ pháp" },
];

const DRAFT_STORAGE_KEY = "compose-draft";

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
// Anh bia rieng co bo tieu chi CHAT hon backend (FileInterceptor cho phep
// toi 25MB chung cho moi loai anh) - 10MB/1200x600/ty le 2:1 la yeu cau
// SAN PHAM danh rieng cho anh bia bai viet, xem validate-cover-image.ts.

// initialPost co gia tri -> che do SUA bai da dang (tinh nang Sua bai) thay
// vi tao moi - xem /compose/[id]/page.tsx (nguon duy nhat truyen prop nay).
export function Composer({ initialPost }: { initialPost?: Post } = {}) {
  const router = useRouter();
  const isEditMode = Boolean(initialPost);
  const hydratedRef = useRef(false);
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
  const [excerpt, setExcerpt] = useState("");
  const coverInputRef = useRef<HTMLInputElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restoredRef = useRef(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  // Compose Giai doan 2 - 3 co that (khac "Đặt bài viết trả phí" van disabled,
  // xem Toggle o duoi), default true khop @default cua cot o backend.
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [likesEnabled, setLikesEnabled] = useState(true);
  const [searchable, setSearchable] = useState(true);
  // Panel "Thêm vào bộ sưu tập" - fetch 1 lan luc mount (Composer da "use
  // client" san). Bai CHUA co id luc dang soan nen chi luu
  // selectedCollectionId cuc bo, goi addToCollectionAction SAU KHI publish
  // thanh cong (xem handlePublish) - khong the goi truoc do vi chua co postId.
  const [myCollections, setMyCollections] = useState<PostCollectionApiShape[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [collectionMenuOpen, setCollectionMenuOpen] = useState(false);
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);
  // "AI hỗ trợ" (popover trong toolbar) - instruction rong = dung preset da
  // chon, khac rong = nguoi dung tu go (uu tien hon preset).
  const [aiPopoverOpen, setAiPopoverOpen] = useState(false);
  const [aiInstruction, setAiInstruction] = useState("");
  const [isImproving, setIsImproving] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  // Tab "Trợ lý AI" - chat cuc bo (KHONG luu DB, mat khi roi trang), giong
  // WorkspaceAiAssistant.tsx.
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatDraft, setChatDraft] = useState("");
  const [isChatting, setIsChatting] = useState(false);

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
      // Dan (Ctrl+V) 1 anh THAT (vd screenshot copy tu ngoai) vao THAN BAI -
      // truoc day khong co gi ca, Tiptap mac dinh chi hieu text/HTML tren
      // clipboard, anh bi lang le bo qua (bao loi nguoi dung). Rieng KHONG
      // dung lai uploadCoverImage() (ham do ep crop 2:1 + kich thuoc toi
      // thieu - dung rieng cho anh BIA, se cat sai/tu choi nham anh noi dung
      // thuong) - chi HEIC-convert roi upload thang, giong tinh than nut
      // "Ảnh (URL)" nhung co upload that thay vi doi dan URL tay.
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
            setError(getApiErrorMessage(err, "Dán ảnh thất bại, thử lại sau."));
          }
        })();
        return true; // da tu xu ly - chan Tiptap chen them noi dung thua tu clipboard (vd ten file).
      },
    },
    onUpdate: () => scheduleAutosave(),
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

  // Autosave nhap (localStorage, khong backend - xem plan redesign Compose
  // mobile). Debounce 1s sau khi doi title/excerpt/tags/categorySlug/
  // visibility; noi dung editor tu goi qua onUpdate (xem useEditor ben
  // duoi) vi editor.state khong nam trong dependency array on dinh duoc.
  function scheduleAutosave() {
    // Sua bai KHONG duoc dung/ghi vao nhap cuc bo "bai moi" - 2 khai niem
    // tach biet, dung chung key se lam nhap that lac dau vao bai dang sua
    // (hoac nguoc lai, mat noi dung dang sua neu 1 nhap cu con sot lai).
    if (isEditMode) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      if (!editor) return;
      try {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            title,
            excerpt,
            tags,
            categorySlug,
            visibility,
            content: editor.getJSON(),
            savedAt: Date.now(),
          }),
        );
        setLastSavedAt(Date.now());
      } catch {
        // localStorage day/bi chan - im lang, autosave chi la luoi an toan.
      }
    }, 1000);
  }

  useEffect(() => {
    scheduleAutosave();
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, excerpt, tags, categorySlug, visibility]);

  // Khoi phuc nhap 1 LAN duy nhat khi editor san sang - CHI khi trang dang
  // thuc su rong (chua go gi), tranh ghi de neu nguoi dung da bat dau viet
  // truoc khi effect nay chay.
  useEffect(() => {
    if (!editor || restoredRef.current || isEditMode) return;
    restoredRef.current = true;
    if (title.trim() || !editor.isEmpty) return;
    // setTimeout(0) - day setState ra khoi than effect (react-hooks/
    // set-state-in-effect), chi chay 1 LAN luc mount nen do tre 1 tick
    // khong anh huong trai nghiem.
    setTimeout(() => {
      try {
        const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (!raw) return;
        const draft = JSON.parse(raw) as {
          title?: string;
          excerpt?: string;
          tags?: string[];
          categorySlug?: string | null;
          visibility?: PublishVisibility;
          content?: object;
          savedAt?: number;
        };
        if (draft.title) setTitle(draft.title);
        if (draft.excerpt) setExcerpt(draft.excerpt);
        if (Array.isArray(draft.tags)) setTags(draft.tags);
        if (draft.categorySlug) setCategorySlug(draft.categorySlug);
        if (draft.visibility) setVisibility(draft.visibility);
        if (draft.content) editor.commands.setContent(draft.content);
        if (draft.savedAt) setLastSavedAt(draft.savedAt);
      } catch {
        // Nhap hong/khong doc duoc - bo qua, khong chan trang soan.
      }
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  // Che do SUA bai - nap du lieu bai da dang vao form/editor, CHI 1 LAN luc
  // editor san sang (hydratedRef, cung tinh than voi restoredRef o tren).
  // Composer chi tung tao/sua kind "text" - initialPost.kind khac "text"
  // (ve ly thuyet khong xay ra tren du lieu that vi day la CACH DUY NHAT tao
  // bai) thi bo qua, khong co gi de hydrate.
  useEffect(() => {
    if (!editor || !initialPost || hydratedRef.current) return;
    hydratedRef.current = true;
    if (initialPost.kind !== "text") return;
    // setTimeout(0) - day setState ra khoi than effect (react-hooks/
    // set-state-in-effect), cung ky thuat voi effect khoi phuc nhap o tren.
    setTimeout(() => {
      // Bai cu (dang truoc khi title thanh cot that) khong co initialPost.title
      // - fallback ve getPostTitle() (suy tu dong dau content, dung logic
      // hien dang dung o moi noi hien thi tieu de khac) thay vi de trong.
      setTitle(initialPost.title || getPostTitle(initialPost));
      if (initialPost.excerpt) setExcerpt(initialPost.excerpt);
      if (initialPost.tags) setTags(initialPost.tags);
      if (initialPost.category) setCategorySlug(categoryEnumToSlug(initialPost.category));
      if (initialPost.visibility) setVisibility(initialPost.visibility);
      if (initialPost.coverImage) setCoverImageUrl(initialPost.coverImage);
      if (typeof initialPost.commentsEnabled === "boolean") setCommentsEnabled(initialPost.commentsEnabled);
      if (typeof initialPost.likesEnabled === "boolean") setLikesEnabled(initialPost.likesEnabled);
      if (typeof initialPost.searchable === "boolean") setSearchable(initialPost.searchable);
      if (initialPost.richContent) editor.commands.setContent(initialPost.richContent);
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  // Panel "Thêm vào bộ sưu tập" - fetch 1 lan luc mount, khong phu thuoc
  // editor (khac 2 effect tren, day chi la load 1 danh sach tinh).
  useEffect(() => {
    listMyCollectionsAction()
      .then(setMyCollections)
      .catch(() => {
        // im lang - panel se hien danh sach rong, khong chan soan bai.
      });
  }, []);

  function addTag() {
    const t = tagDraft.trim().replace(/^#/, "");
    if (t && !tags.includes(t) && tags.length < 8) setTags((p) => [...p, t]);
    setTagDraft("");
  }

  // Validate ĐỦ tiêu chí (định dạng/dung lượng/kích thước, xem
  // validate-cover-image.ts) TRƯỚC khi upload - moi loi deu la UserFacingError
  // voi thong diep RO RANG tung tieu chi (khong chung chung), duoc
  // getApiErrorMessage nhan dien va hien nguyen van. Anh dat het tieu chi ->
  // tu dong crop ve dung ty le 2:1 + resize toi da 1600px + nen JPEG 0.85
  // ("hệ thống tự resize/compress") TRUOC khi gui len server, dam bao bai
  // viet nao cung hien anh bia dung ty le, khong bi meo/qua nang.
  async function uploadCoverImage(file: File) {
    setIsUploadingCover(true);
    setError(null);
    try {
      const heicConverted = await convertHeicToJpegIfNeeded(file);
      validateCoverImageFile(heicConverted);
      const bitmap = await loadImageBitmap(heicConverted);
      validateCoverImageDimensions(bitmap.width, bitmap.height);
      const processedBlob = await cropAndResizeCoverImage(bitmap);
      const processedFile = new File(
        [processedBlob],
        heicConverted.name.replace(/\.[^.]+$/, "") + ".jpg",
        { type: "image/jpeg" },
      );
      const formData = new FormData();
      formData.append("file", processedFile);
      formData.append("kind", "image");
      const uploaded = await uploadPostImageAction(formData);
      setCoverImageUrl(uploaded.url);
    } catch (err) {
      setError(getApiErrorMessage(err, "Tải ảnh bìa thất bại, thử lại sau."));
    } finally {
      setIsUploadingCover(false);
    }
  }

  async function handlePublish() {
    if (!editor || !canPublish) return;
    setIsPosting(true);
    setError(null);
    const richContent = editor.getJSON();
    // "Tóm tắt bài viết" nguoi dung tu go (excerpt state) uu tien; rong thi
    // fallback tu cat content nhu truoc (backend cung tu fallback neu khong
    // gui gi, day chi la fallback PHIA CLIENT cho `data.content` - field
    // rieng, khac cot `excerpt` that o duoi).
    const fallbackContent = title.trim()
      ? `${title.trim()}\n\n${editor.getText()}`
      : editor.getText();
    const category = categorySlug
      ? slugToCategoryEnum(categorySlug)
      : undefined;
    const data = {
      content: excerpt.trim() || fallbackContent.slice(0, 600),
      richContent,
      coverImage: coverImageUrl || undefined,
      tags,
    };
    const opts = {
      category,
      visibility,
      commentsEnabled,
      likesEnabled,
      searchable,
      excerpt: excerpt.trim() || undefined,
      title: title.trim() || undefined,
    };
    try {
      if (isEditMode && initialPost) {
        await updatePostAction(initialPost.id, data, opts);
        if (selectedCollectionId) {
          await addToCollectionAction(selectedCollectionId, initialPost.id).catch(() => {
            // best-effort - khong chan dieu huong neu loi (giong don dep
            // localStorage ben duoi).
          });
        }
        router.push(`/p/${initialPost.id}`);
      } else {
        const created = await createPostAction("text", data, opts);
        if (selectedCollectionId) {
          await addToCollectionAction(selectedCollectionId, created.id).catch(() => {
            // best-effort
          });
        }
        try {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        } catch {
          // im lang - khong critical, chi la don dep nhap con lai.
        }
        router.push(`/p/${created.id}`);
      }
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          isEditMode ? "Không lưu được bài viết, thử lại sau." : "Không đăng được bài, thử lại sau.",
        ),
      );
      setIsPosting(false);
    }
  }

  // "AI hỗ trợ" - goi API that (post-assistant/improve), roi CHEN ket qua vao
  // editor: neu dang co vung chon THAT thi thay the vung do, khong thi chen
  // o CUOI tai lieu (khong dung vi tri con tro don thuan vi con tro co the
  // dang o dau tai lieu, chen cuoi de doan moi luon noi tiep noi dung cu).
  async function applyImprove(instruction: string) {
    if (!editor || !instruction.trim() || isImproving) return;
    setIsImproving(true);
    setAiError(null);
    try {
      const { suggestion } = await improvePostDraftAction(
        editor.getText(),
        instruction.trim(),
      );
      const chain = editor.chain().focus();
      if (!editor.state.selection.empty) {
        chain.deleteSelection().insertContent(suggestion).run();
      } else {
        chain.insertContentAt(editor.state.doc.content.size, `\n${suggestion}`).run();
      }
      setAiInstruction("");
      setAiPopoverOpen(false);
    } catch (err) {
      setAiError(getApiErrorMessage(err, "AI không phản hồi được, thử lại sau."));
    } finally {
      setIsImproving(false);
    }
  }

  // Tab "Trợ lý AI" - chat nhieu luot, gui kem TOAN BO lich su cuc bo moi lan
  // (khong luu DB, giong WorkspaceAiAssistant.tsx) + noi dung draft hien tai
  // (editor.getText()) de AI biet dang gop y cho bai nao.
  async function sendChat() {
    if (!editor || !chatDraft.trim() || isChatting) return;
    const nextMessages: ChatMessage[] = [
      ...chatMessages,
      { role: "user", content: chatDraft.trim() },
    ];
    setChatMessages(nextMessages);
    setChatDraft("");
    setIsChatting(true);
    try {
      const { answer } = await chatAboutPostDraftAction(
        editor.getText(),
        nextMessages,
      );
      setChatMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (err) {
      const reason = getApiErrorMessage(err, "mình không phản hồi được, thử lại sau nhé.");
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Xin lỗi, ${reason}` },
      ]);
    } finally {
      setIsChatting(false);
    }
  }

  return (
    <main className="min-h-[calc(100dvh-var(--header-height))] bg-background px-5 py-5 text-ink">
      {/* "Đến phần cấu hình" - duoi xl, khung Cai dat/AI (aside, xem duoi)
          nam SAU toan bo than bai trong DOM (grid 1 cot), phai cuon qua het
          bai (co the rat dai) moi toi noi - fixed goc duoi-phai, LUON bam
          duoc bat ke dang cuon toi dau, khong chi luc o dau trang. Dat lam
          FAB duy nhat o goc do tren trang compose (MobileComposeFab.tsx da
          tu an tren "/compose"* de tranh de len nut nay). */}
      <button
        type="button"
        onClick={() => {
          setRightTab("publish");
          asideRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        aria-label="Đến phần cấu hình bài viết"
        className="fixed right-4 bottom-4 z-30 flex h-12 cursor-pointer items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-surface shadow-lg hover:opacity-90 xl:hidden"
      >
        <Settings2 className="h-4 w-4" />
        Cấu hình
      </button>

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
                {isPosting
                  ? isEditMode
                    ? "Đang lưu..."
                    : "Đang đăng..."
                  : isEditMode
                    ? "Lưu thay đổi"
                    : "Đăng bài"}
              </button>
            </div>
          </div>

          {/* Mobile (<lg) - dropzone anh bia ro rang hon khi CHUA co anh
              (thay cho chi 1 icon nho trong hero). Da co anh roi thi hero
              ben duoi (moi kich thuoc) da du de doi/xoa, khong can dropzone
              nay nua. Co che upload GIU NGUYEN (uploadCoverImage). */}
          {!coverImageUrl && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) uploadCoverImage(file);
              }}
              onClick={() => coverInputRef.current?.click()}
              className="mb-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface-muted py-8 text-center lg:hidden"
            >
              <ImagePlus size={24} className="text-ink-faint" />
              <p className="text-sm text-ink-muted">
                {isUploadingCover ? (
                  "Đang tải ảnh..."
                ) : (
                  <>
                    Kéo thả ảnh hoặc{" "}
                    <span className="font-semibold text-primary">chọn file</span>
                  </>
                )}
              </p>
              <p className="text-xs text-ink-faint">
                JPG, PNG, WebP · tối đa 10MB · khuyến nghị 1600×800px (tỉ lệ 2:1)
              </p>
            </div>
          )}

          {/* KHONG con overflow-hidden o day - "position: sticky" cua toolbar
              ben duoi tinh mon theo TO TIEN CO overflow != visible GAN NHAT
              (spec CSS), neu de o day (div nay auto-height, khong tu cuon)
              sticky se VO TAC DUNG (toolbar troi theo ca khoi card thay vi
              dinh lai). Vung cuon that cua app la MainContentArea.tsx
              (overflow-auto, header KHONG nam trong do) nen chuyen len lam
              to tien sticky dung, chi con "rounded-2xl border" o day. Bo
              overflow-hidden cung dong nghia MAT boc goc tron cho anh bia -
              chuyen rieng xuong div ngay duoi (rounded-t-2xl overflow-hidden,
              chi can boc goc TREN vi no luon la khoi dau tien). */}
          <div className="rounded-2xl border border-border bg-surface shadow-[0_8px_30px_rgba(16,24,40,.08)]">
            <div
              className="relative flex h-[320px] flex-col justify-end overflow-hidden rounded-t-2xl bg-surface-muted p-9"
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
                accept="image/jpeg,image/png,image/webp,.heic,.heif"
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
                maxLength={150}
                className={`w-full bg-transparent text-4xl font-bold tracking-tight outline-none md:text-5xl ${
                  coverImageUrl
                    ? "text-white placeholder:text-white/60"
                    : "text-ink placeholder:text-ink-faint"
                }`}
              />
              <p
                className={`mt-1 text-right text-xs tabular-nums ${
                  coverImageUrl ? "text-white/60" : "text-ink-faint"
                }`}
              >
                {title.length}/150
              </p>
            </div>

            {editor && !previewMode && (
              // sticky top-0: bam theo luc cuon bai dai, moc theo vung cuon
              // THAT cua app (MainContentArea.tsx, overflow-auto) - header
              // ngang khong nam trong vung cuon do nen top-0 la du, khong can
              // tru them --header-height. z-10 + border-b (them, khac ban
              // cu chi co border-t) de tach ro toolbar khoi noi dung bai dang
              // troi ben duoi khi da dinh lai.
              <div className="sticky top-0 z-10 flex items-center gap-1 border-t border-b border-border bg-surface-muted px-3 py-1.5">
                <PostEditorToolbar editor={editor} bare />
                <PopoverRoot open={aiPopoverOpen} onOpenChange={setAiPopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="ml-auto flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/60 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                    >
                      <WandSparkles className="h-4 w-4" /> AI hỗ trợ
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    open={aiPopoverOpen}
                    align="end"
                    className="z-50 w-80 rounded-lg border border-border bg-surface p-3 shadow-dropdown"
                  >
                    <p className="mb-2 text-xs font-semibold text-ink-faint uppercase">
                      Gợi ý nhanh
                    </p>
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {IMPROVE_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          disabled={isImproving}
                          onClick={() => applyImprove(preset)}
                          className="cursor-pointer rounded-full border border-border px-2.5 py-1 text-xs text-ink-muted transition hover:bg-hover-bg disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        value={aiInstruction}
                        onChange={(e) => setAiInstruction(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") applyImprove(aiInstruction);
                        }}
                        placeholder="Hoặc tự mô tả yêu cầu..."
                        className="h-9 flex-1 rounded-lg border border-border bg-background px-2.5 text-sm text-ink outline-none focus:border-blue-300"
                      />
                      <button
                        type="button"
                        disabled={isImproving || !aiInstruction.trim()}
                        onClick={() => applyImprove(aiInstruction)}
                        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                    {isImproving && (
                      <p className="mt-2 text-xs text-ink-faint">Đang tạo gợi ý...</p>
                    )}
                    {aiError && (
                      <p className="mt-2 text-xs text-danger">{aiError}</p>
                    )}
                  </PopoverContent>
                </PopoverRoot>
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

              <div className="mt-6 hidden items-center gap-3 rounded-xl border border-border bg-surface-muted px-4 py-4 text-sm text-ink-muted lg:flex">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-cyan-600">
                  <Sparkles className="h-4 w-4" />
                </span>
                &ldquo;Bạn có muốn viết về điều gì đó bạn vừa học được và có thể
                hữu ích cho người khác không?&rdquo;
              </div>

              {/* Mobile (<lg) - "Gợi ý cho bạn": bam 1 chip = dien san cau
                  hoi vao khung chat that (chatDraft) roi chuyen sang tab
                  "Trợ lý AI" (khong logic AI moi, tai dung sendChat da co). */}
              <div className="mt-6 rounded-xl border border-border bg-surface-muted p-4 lg:hidden">
                <div className="mb-3 flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                    <Sparkles size={14} className="text-cyan-600" /> Gợi ý cho bạn
                  </p>
                  <RefreshCw size={13} className="text-ink-faint" />
                </div>
                <div className="flex flex-col gap-1.5">
                  {[
                    "Viết mở bài thu hút cho bài viết về...",
                    "Viết dàn ý chi tiết cho chủ đề này",
                    "Diễn đạt lại đoạn văn này hay hơn",
                  ].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setChatDraft(s);
                        setRightTab("ai");
                        asideRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }}
                      className="cursor-pointer rounded-lg border border-border bg-surface px-3 py-2 text-left text-xs text-ink-muted hover:bg-hover-bg"
                    >
                      &ldquo;{s}&rdquo;
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-[11px] leading-5 text-ink-faint">
                  Mẹo: Sử dụng ## để tạo tiêu đề, **bold** để in đậm.
                </p>
              </div>
            </div>

            {/* Thanh trang thai duoi cung - desktop giu NGUYEN (hidden lg:flex),
                mobile them dong autosave that (xem scheduleAutosave o tren). */}
            <div className="hidden items-center justify-between border-t border-border bg-surface-muted px-5 py-3 text-sm text-ink-faint lg:flex">
              <div className="flex items-center gap-3">
                <span>{words} chữ</span>
                <button
                  type="button"
                  onClick={() => setRightTab("ai")}
                  className="cursor-pointer rounded-lg bg-blue-50/60 px-3 py-2 text-blue-600 transition hover:bg-blue-100"
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
            <div className="flex items-center justify-between border-t border-border bg-surface-muted px-4 py-2.5 text-xs text-ink-faint lg:hidden">
              <span>
                {words} từ
                {lastSavedAt && ` · Đã lưu nháp lúc ${formatTimeOnly(new Date(lastSavedAt).toISOString())}`}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRightTab("ai")}
                  aria-label="Mở Trợ lý AI"
                  className="cursor-pointer text-ink-faint hover:text-ink"
                >
                  <WandSparkles className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  aria-label="Chọn ảnh bìa"
                  className="cursor-pointer text-ink-faint hover:text-ink"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside ref={asideRef} className="space-y-4">
          <PanelTabs active={rightTab} setActive={setRightTab} />

          {rightTab === "publish" ? (
            <>
              <Panel title="Chế độ xuất bản">
                {/* Mobile (<lg) - the (card) co icon, khop mockup. Desktop
                    (hidden lg:block) giu nguyen danh sach Radio hien co. */}
                <div className="grid grid-cols-3 gap-2 lg:hidden">
                  <VisibilityCard
                    icon={Globe}
                    checked={visibility === "public"}
                    onClick={() => setVisibility("public")}
                    title="Công khai"
                    desc="Mọi người đều xem"
                  />
                  <VisibilityCard
                    icon={FileText}
                    checked={visibility === "draft"}
                    onClick={() => setVisibility("draft")}
                    title="Bản nháp"
                    desc="Chỉ mình bạn thấy"
                  />
                  <VisibilityCard
                    icon={Users}
                    checked={visibility === "limited"}
                    onClick={() => setVisibility("limited")}
                    title="Giới hạn"
                    desc="Ai có link mới xem"
                  />
                </div>
                <div className="hidden lg:block">
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
                    desc="Chỉ mình bạn thấy, không hiện trên feed"
                  />
                  <Radio
                    checked={visibility === "limited"}
                    onClick={() => setVisibility("limited")}
                    title="Công khai giới hạn"
                    desc="Không hiện trên feed/tìm kiếm, ai có link vẫn xem được"
                  />
                </div>
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

              <Panel title="Tóm tắt bài viết">
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  maxLength={300}
                  rows={3}
                  placeholder="Viết vài dòng mô tả ngắn về bài viết..."
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-blue-300"
                />
                <p className="mt-1 text-right text-xs text-ink-faint tabular-nums">
                  {excerpt.length}/300
                </p>
              </Panel>

              <Panel title="Thêm vào bộ sưu tập">
                <PopoverRoot open={collectionMenuOpen} onOpenChange={setCollectionMenuOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition-colors duration-150 ease-out ${
                        selectedCollectionId
                          ? "border-blue-300 bg-blue-50 text-blue-600"
                          : "border-border text-ink-muted hover:bg-hover-bg"
                      }`}
                    >
                      {myCollections.find((c) => c.id === selectedCollectionId)?.title ?? "Chọn bộ sưu tập"}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    open={collectionMenuOpen}
                    align="start"
                    className="z-50 max-h-72 w-64 overflow-y-auto rounded-lg border border-border bg-surface p-1.5 shadow-dropdown"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setCollectionMenuOpen(false);
                        setCreateCollectionOpen(true);
                      }}
                      className="mb-1 flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-primary hover:bg-hover-bg"
                    >
                      <Plus size={14} strokeWidth={2.2} /> Tạo bộ sưu tập mới
                    </button>
                    {selectedCollectionId && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCollectionId(null);
                          setCollectionMenuOpen(false);
                        }}
                        className="mb-1 flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-danger hover:bg-hover-bg"
                      >
                        <X size={14} /> Bỏ chọn
                      </button>
                    )}
                    {myCollections.length === 0 ? (
                      <p className="px-2 py-3 text-center text-xs text-ink-faint">
                        Bạn chưa có bộ sưu tập nào.
                      </p>
                    ) : (
                      myCollections.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedCollectionId(c.id);
                            setCollectionMenuOpen(false);
                          }}
                          className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-ink hover:bg-hover-bg"
                        >
                          <Folder size={14} strokeWidth={1.8} className="shrink-0 text-ink-faint" />
                          <span className="flex-1 truncate">{c.title}</span>
                          {selectedCollectionId === c.id && (
                            <Check size={14} className="shrink-0 text-blue-500" />
                          )}
                        </button>
                      ))
                    )}
                  </PopoverContent>
                </PopoverRoot>
              </Panel>

              <CreateCollectionModal
                open={createCollectionOpen}
                onOpenChange={setCreateCollectionOpen}
                onCreated={(created) => {
                  setMyCollections((prev) => [created, ...prev]);
                  setSelectedCollectionId(created.id);
                }}
              />

              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="font-medium text-ink">
                  Hãy để cảm hứng muốn viết luôn ở bên bạn.
                </p>
                <p className="mt-2 text-sm text-ink-muted">
                  &ldquo;Những ý tưởng hay sẽ tìm thấy người phù hợp.&rdquo;
                </p>
              </div>

              <Panel title="Các cài đặt khác">
                <Toggle
                  label="Cho phép bình luận"
                  icon={<MessageSquare />}
                  checked={commentsEnabled}
                  onClick={() => setCommentsEnabled((v) => !v)}
                />
                <Toggle
                  label="Cho phép thích"
                  icon={<Heart />}
                  checked={likesEnabled}
                  onClick={() => setLikesEnabled((v) => !v)}
                />
                <Toggle
                  label="Hiển thị trên công cụ tìm kiếm"
                  icon={<Search />}
                  checked={searchable}
                  onClick={() => setSearchable((v) => !v)}
                />
                <Toggle label="Đặt bài viết trả phí" icon={<Lock />} disabled />
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
            <Panel title="Trợ lý AI">
              {/* Mobile (<lg) - 6 the goi y, deu goi applyImprove() (endpoint
                  /post-assistant/improve co san, generic - xem
                  AI_ACTION_CARDS). Desktop khong doi (khong co khoi nay,
                  presets 4-nut van o popover "AI hỗ trợ" tren toolbar). */}
              <div className="mb-4 flex flex-col gap-1.5 lg:hidden">
                {AI_ACTION_CARDS.map((card) => (
                  <button
                    key={card.label}
                    type="button"
                    disabled={isImproving}
                    onClick={() => applyImprove(card.instruction)}
                    className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border bg-background px-3 py-2.5 text-left transition hover:bg-hover-bg disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <card.icon size={15} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ink">{card.label}</span>
                      <span className="block text-xs text-ink-faint">{card.desc}</span>
                    </span>
                  </button>
                ))}
                {isImproving && (
                  <p className="text-xs text-ink-faint">Đang tạo gợi ý...</p>
                )}
                {aiError && <p className="text-xs text-danger">{aiError}</p>}
              </div>

              <div className="flex max-h-[420px] flex-col gap-3">
                <div className="flex-1 space-y-2.5 overflow-y-auto">
                  {chatMessages.length === 0 ? (
                    <p className="text-sm leading-6 text-ink-faint">
                      Hỏi hoặc nhờ AI góp ý cho bài đang viết — AI sẽ đọc đúng nội
                      dung hiện tại trong editor mỗi lần bạn gửi.
                    </p>
                  ) : (
                    chatMessages.map((m, i) => (
                      <div
                        key={i}
                        className={`rounded-lg px-3 py-2 text-sm leading-6 ${
                          m.role === "user"
                            ? "ml-4 bg-blue-50 text-blue-900"
                            : "mr-4 bg-surface-muted text-ink"
                        }`}
                      >
                        {m.content}
                      </div>
                    ))
                  )}
                  {isChatting && (
                    <p className="mr-4 rounded-lg bg-surface-muted px-3 py-2 text-sm text-ink-faint">
                      Đang trả lời...
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    value={chatDraft}
                    onChange={(e) => setChatDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendChat();
                    }}
                    placeholder="Nhắn cho AI..."
                    className="h-9 flex-1 rounded-lg border border-border bg-background px-2.5 text-sm text-ink outline-none focus:border-blue-300"
                  />
                  <button
                    type="button"
                    disabled={isChatting || !chatDraft.trim()}
                    onClick={sendChat}
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
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
    { key: "publish", label: "Cài đặt" },
    { key: "ai", label: "Trợ lý AI" },
  ];
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-surface">
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

// The che do xuat ban dang card (mobile, xem VisibilityCard trong Composer) -
// cung state/interaction voi Radio ben duoi (desktop), chi khac trinh bay.
function VisibilityCard({
  icon: Icon,
  checked,
  onClick,
  title,
  desc,
}: {
  icon: typeof Globe;
  checked: boolean;
  onClick: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition ${
        checked
          ? "border-blue-400 bg-blue-50 text-blue-700"
          : "border-border text-ink-muted hover:bg-hover-bg"
      }`}
    >
      <Icon size={18} strokeWidth={1.85} />
      <span className="text-xs font-semibold">{title}</span>
      <span className="text-[10px] leading-3.5 text-ink-faint">{desc}</span>
    </button>
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

// Cong tac o "Cac cai dat khac" - Compose Giai doan 2: bind/likes/searchable
// gio la co THAT (cot that o Post, xem post.service.ts), "Đặt bài viết trả
// phí" van disabled (can he thong thanh toan, ngoai pham vi).
function Toggle({
  label,
  icon,
  checked,
  onClick,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  checked?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between py-2"
      title={disabled ? "Sắp có" : undefined}
    >
      <span className="flex items-center gap-2 text-sm text-ink-muted">
        <span className="text-ink-faint">{icon}</span>
        {label}
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        aria-pressed={checked}
        className={`h-5 w-9 rounded-full p-0.5 transition ${
          disabled
            ? "cursor-not-allowed bg-surface-muted"
            : checked
              ? "cursor-pointer bg-blue-600"
              : "cursor-pointer bg-surface-muted"
        }`}
      >
        <span
          className={`block h-4 w-4 rounded-full bg-white transition-transform ${
            checked && !disabled ? "translate-x-4" : "translate-x-0"
          } ${disabled ? "bg-ink-faint" : ""}`}
        />
      </button>
    </div>
  );
}
