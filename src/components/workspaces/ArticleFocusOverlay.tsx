"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEditor, EditorContent } from "@tiptap/react";
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock3,
  Eye,
  FileText,
  Highlighter,
  Link2,
  ListTree,
  LoaderCircle,
  MessageCircle,
  Network,
  PanelRight,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  StickyNote,
  X,
} from "lucide-react";
import type { ApiDocument, ApiDocumentSummary } from "@/lib/api/types";
import { formatRelativeTime } from "@/lib/format-time";
import { formatCompact } from "@/lib/format-number";
import { togglePinDocumentAction } from "@/actions/documents/toggle-pin-document";
import { getPostExtensions, POST_PROSE_CLASS } from "./post-extensions";
import type { TocItem } from "./WorkspaceDetail";

// "Focus mode" toan man hinh luc mo 1 bai viet.
//
// (0) [2026-08] Doi source tham chieu: BO he kinh co khi 3D
//     ("treecareer-knowledge-ironman-v10-5-verified-motion" - GlassAssembly/
//     MechanicalAssembly/rotateY/perspective), chuyen sang
//     "treecareer-article-reader" (layout phang, khong 3D transform nao ca).
//     Ly do: he 3D cu gay loi hit-test cua trinh duyet KHONG THE SUA TRIET
//     DE - da xac nhan qua console tren may nguoi dung (elementFromPoint
//     dung lai o box ngoai cung, khong "xuyen" duoc vao noi dung dang bi
//     rotateY) rang ca wheel LAN hover/click deu bi anh huong, du da thu:
//     bo contain:paint, bo perspective long nhau, bo Framer "layout", bo
//     transform-style:preserve-3d/backface-visibility tren phan tu khong
//     mang transform - van khong het. Layout phang (khong perspective/
//     rotateY nao) loai bo hoan toan nhom loi nay tu goc, dong thoi nhe hon
//     nhieu (khong con nhieu lop compositing/GPU layer chong nhau) - dung
//     dung nguyen nhan "lag, nang, cham" nguoi dung phan anh.
// (1) KHONG dung lai Top/Rail cua source (gia lap toan bo trang, sidebar
//     workspace/tim kiem workspace rieng) - WorkspaceDetail that cua app da
//     co san sidebar/header/group-overview that. Overlay nay CHI choan phan
//     dien tich cua main+DetailsPanel (WorkspaceDetail.tsx tu dong phoi hieu
//     ung dong/mo rieng cho 2 phan do qua mainPhase truoc khi mount/sau khi
//     unmount overlay nay - xem KnowledgeUniverseCanvas.tsx), sidebar
//     Knowledge Group trai (250px) khong bi anh huong gi ca.
// (2) <article> render noi dung Tiptap THAT (doc.content that) - source
//     dung 1 bai IAM mau viet cung trong code, khong dung.
// (3) Outline dung TOC DANG CAY that (h1-h4 that, tu dong mo rong nhanh
//     chua active) - source dung mang "sections" tinh, phang, mau.
// (4) Relations noi bai dang doc voi CAC BAI KHAC that trong CUNG nhom kien
//     thuc (siblingDocs) - source noi voi 1 danh sach node ten dich vu AWS
//     co dinh, khong lien quan bai that.
// (5) Status: trang thai xuat ban la READ-ONLY phan anh doc.isPublished
//     THAT. "Knowledge Health" van la demo minh hoa (gan nhan ro, chua co
//     AI backend tinh chi so nay that), rieng % nay tinh THAT tu ty le bai
//     da xuat ban trong nhom (cung cong thuc da dung o TechArticleSidebar
//     truoc day).
// (6) Bookmark: source chi doi mau icon cuc bo, khong luu gi. O day, VOI
//     CHU BAI VIET (doc.isOwner), nut nay goi that
//     togglePinDocumentAction (cung action PostView.tsx dang dung) - AN nut
//     voi nguoi khong phai chu vi "ghim" la khai niem gan voi ho so tac
//     gia, khong phai bookmark ca nhan cho nguoi doc (app chua co model
//     nay).
// (7) Ghi chu / Tai lieu / Hoat dong: KHONG co model DB nao chua du lieu
//     nay (Document khong co truong "resources dinh kem"/"activity log"/
//     "notes"). Theo yeu cau nguoi dung, GIU CA 3 tab nhung chi hoat dong
//     CUC BO (state React thuan, mat khi dong overlay) va co nhan
//     "· DEMO"/"CHUA LUU SERVER" ro rang - khong gia vo la tinh nang that.
// (8) Search (⌘K): loc THAT muc luc theo tieu de heading (du lieu that tu
//     toc), khac cac tab demo o (7) - day la hanh vi that cua source, chi
//     ap dung dung nguyen (source cung CHI loc outline, khong search noi
//     dung bai viet).
// (9) Selection toolbar (bam giu chuot chon text): port dung hanh vi cua
//     source - nut "Highlight"/"Discuss" trong source cung KHONG thuc su ap
//     dung highlight/tao thao luan nao ca (chi dong popover), CHI "Note"/
//     "Link" chuyen tab that. Giu dung vay, khong tu bien them logic ma
//     source khong co.

type ToolId =
  | "outline"
  | "notes"
  | "resources"
  | "relations"
  | "activity"
  | "status";

type TocNode = TocItem & { children: TocNode[] };

function buildTocTree(flat: TocItem[]): TocNode[] {
  const roots: TocNode[] = [];
  const stack: TocNode[] = [];
  for (const item of flat) {
    const node: TocNode = { ...item, children: [] };
    while (stack.length && stack[stack.length - 1].level >= item.level) {
      stack.pop();
    }
    if (stack.length === 0) roots.push(node);
    else stack[stack.length - 1].children.push(node);
    stack.push(node);
  }
  return roots;
}

function containsActive(node: TocNode, activeId: string): boolean {
  if (node.id === activeId) return true;
  return node.children.some((c) => containsActive(c, activeId));
}

function flattenIds(nodes: TocNode[]): string[] {
  return nodes.flatMap((n) => [n.id, ...flattenIds(n.children)]);
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function scrollToHeading(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Dung chung boi KnowledgeHealth (tab Trang thai).
function computeKnowledgeHealth(doc: ApiDocument, relatedCount: number): number {
  return relatedCount === 0
    ? doc.isPublished
      ? 100
      : 0
    : Math.min(100, 60 + relatedCount * 7);
}

const TOOLS: { id: ToolId; label: string; icon: typeof ListTree }[] = [
  { id: "outline", label: "Mục lục", icon: ListTree },
  { id: "notes", label: "Ghi chú", icon: StickyNote },
  { id: "resources", label: "Tài liệu", icon: FileText },
  { id: "relations", label: "Liên kết", icon: Link2 },
  { id: "activity", label: "Hoạt động", icon: Activity },
  { id: "status", label: "Trạng thái", icon: Activity },
];

export function ArticleFocusOverlay({
  doc,
  docLoading,
  siblingDocs,
  toc,
  activeTocId,
  scrollRef,
  onTocChange,
  onOpenDoc,
  onClose,
}: {
  doc: ApiDocument | null;
  docLoading: boolean;
  siblingDocs: ApiDocumentSummary[];
  toc: TocItem[];
  activeTocId: string;
  scrollRef: RefObject<HTMLDivElement | null>;
  onTocChange: (items: TocItem[]) => void;
  onOpenDoc: (id: string) => void;
  onClose: () => void;
}) {
  const [closing, setClosing] = useState(false);
  const [tool, setTool] = useState<ToolId>("outline");
  const [query, setQuery] = useState("");
  const [selectOpen, setSelectOpen] = useState(false);

  function handleClose() {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, 320);
  }

  const tocTree = useMemo(() => buildTocTree(toc), [toc]);
  const relatedCount = siblingDocs.length;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (selectOpen) {
          setSelectOpen(false);
          return;
        }
        handleClose();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("focus-search")?.focus();
        return;
      }
      const key = event.key.toLowerCase();
      if (key === "g") setTool("relations");
      if (key === "j" || key === "k") {
        const ids = flattenIds(tocTree);
        if (ids.length === 0) return;
        const index = ids.indexOf(activeTocId);
        const next =
          key === "j"
            ? Math.min(ids.length - 1, index + 1)
            : Math.max(0, index - 1);
        scrollToHeading(ids[Math.max(next, 0)]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing, selectOpen, tocTree, activeTocId]);

  // React Portal - xem giai thich chi tiet ve isolation/stacking-context o
  // ban truoc (van dung nguyen, khong lien quan gi den viec bo he 3D).
  //
  // left-[250px] thay vi inset-x-0: WorkspaceDetail.tsx da doi tu lam mo CA
  // TRANG (.pre-focus-blur) sang dieu phoi 1 hieu ung rieng cho main+
  // DetailsPanel (xoay vao tam / truot phai, xem mainPhase +
  // MAP_TRANSITION_MS) - sidebar Knowledge Group trai (250px, cung do cung
  // gia tri hardcode trong WorkspaceDetail.tsx) phai o LAI BINH THUONG,
  // khong bi che/mo, nen overlay nay chi choan dung phan dien tich ma
  // main+DetailsPanel vua "nhuong lai", khong con phu toan man hinh.
  return createPortal(
    <div className="focus-reader-stage pointer-events-none fixed left-[250px] right-0 bottom-0 top-[calc(var(--header-height)+14px)] isolate z-999999">
      <FocusBackdrop closing={closing} />

      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{
          opacity: closing ? 0 : 1,
          y: closing ? 10 : 0,
          scale: closing ? 0.985 : 1,
        }}
        transition={{ duration: closing ? 0.22 : 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="focus-glass focus-reader-shell pointer-events-auto absolute inset-3 flex flex-col overflow-hidden rounded-2xl md:inset-6"
      >
        <FocusHeader
          doc={doc}
          onClose={handleClose}
          onToggleSelect={() => setSelectOpen((v) => !v)}
          query={query}
          onQueryChange={setQuery}
        />

        <div className="flex h-full min-h-0 flex-1 gap-4 px-4 pb-4 lg:px-6">
          <article
            ref={scrollRef}
            onMouseUp={() =>
              window.getSelection()?.toString().trim() && setSelectOpen(true)
            }
            className="focus-panel-scroll min-w-0 flex-1 overflow-y-auto pr-2"
          >
            {doc && !docLoading ? (
              <ArticleBody
                key={doc.id}
                doc={doc}
                scrollRoot={scrollRef}
                onTocChange={onTocChange}
              />
            ) : (
              <div className="flex h-64 items-center justify-center gap-2 text-slate-500">
                <LoaderCircle size={16} className="animate-spin" />
                <span className="focus-hud-text text-[9px] tracking-[.14em]">
                  ĐANG TẢI BÀI VIẾT...
                </span>
              </div>
            )}
          </article>

          <aside className="focus-glass hidden w-[360px] shrink-0 flex-col overflow-hidden rounded-2xl xl:flex">
            <ToolsTabBar tool={tool} setTool={setTool} />
            <div className="min-h-0 flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tool}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                  className="h-full"
                >
                  {tool === "outline" && (
                    <OutlinePanel tree={tocTree} activeId={activeTocId} query={query} />
                  )}
                  {tool === "notes" && <NotesPanel />}
                  {tool === "resources" && <ResourcesPanel />}
                  {tool === "relations" && (
                    <RelatedPanel
                      doc={doc}
                      siblingDocs={siblingDocs}
                      onOpenDoc={onOpenDoc}
                    />
                  )}
                  {tool === "activity" && <ActivityPanel />}
                  {tool === "status" && (
                    <StatusPanel doc={doc} relatedCount={relatedCount} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </aside>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: closing ? 0 : 1 }}
          transition={{ delay: closing ? 0 : 0.3, duration: 0.25 }}
          className="focus-hud-text flex shrink-0 items-center justify-center gap-1 border-t border-white/[.06] py-2 text-[8px] tracking-[.14em] text-slate-600"
        >
          ESC ĐÓNG · J K CHUYỂN MỤC · G LIÊN KẾT · ⌘K TÌM KIẾM MỤC LỤC
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {selectOpen && (
          <SelectionToolbar
            close={() => setSelectOpen(false)}
            note={() => {
              setTool("notes");
              setSelectOpen(false);
            }}
            link={() => {
              setTool("relations");
              setSelectOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>,
    document.body,
  );
}

/* ---------------- BACKDROP ---------------- */

function FocusBackdrop({ closing }: { closing: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: closing ? 0 : 1 }}
      transition={{ duration: closing ? 0.16 : 0.3 }}
      className="pointer-events-none fixed inset-0 z-0 bg-[#01060d]/70 backdrop-blur-sm"
    />
  );
}

/* ---------------- HEADER ---------------- */

function FocusHeader({
  doc,
  onClose,
  onToggleSelect,
  query,
  onQueryChange,
}: {
  doc: ApiDocument | null;
  onClose: () => void;
  onToggleSelect: () => void;
  query: string;
  onQueryChange: (v: string) => void;
}) {
  return (
    <div className="flex h-[53px] shrink-0 items-center gap-3 border-b border-white/[.07] bg-[#040d18]/70 px-4">
      <button
        type="button"
        onClick={onClose}
        className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-white/5 hover:text-cyan-200"
      >
        <ArrowLeft size={15} />
      </button>
      <span className="min-w-0 flex-1 truncate text-[11px] text-slate-400">
        {doc ? doc.title : "Đang tải..."}
      </span>
      <div className="relative hidden w-full max-w-[280px] md:block">
        <Search
          className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500"
          size={13}
        />
        <input
          id="focus-search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Tìm trong mục lục..."
          className="h-8 w-full rounded-lg border border-white/[.09] bg-white/[.025] pl-8 text-[11px] outline-none focus:border-cyan-300/30"
        />
        <kbd className="absolute top-1.5 right-2.5 rounded bg-white/5 px-1.5 text-[8px] text-slate-600">
          ⌘K
        </kbd>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onToggleSelect}
          className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-white/5 hover:text-cyan-200"
        >
          <PanelRight size={14} />
        </button>
        {doc?.isOwner && <BookmarkButton key={doc.id} doc={doc} />}
        <button
          type="button"
          className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-white/5"
        >
          <Settings2 size={14} />
        </button>
      </div>
    </div>
  );
}

// Tach rieng + key={doc.id} - useState(doc.isPinned) chi doc doc luc khoi
// tao, remount qua key moi lan doi bai tranh state cu (giong ly do tach
// ArticleBody khoi ArticlePanel truoc day).
function BookmarkButton({ doc }: { doc: ApiDocument }) {
  const [pinned, setPinned] = useState(doc.isPinned);
  const [, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const next = !pinned;
      setPinned(next);
      await togglePinDocumentAction(doc.id, doc.author.username, next);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={pinned ? "Bỏ ghim" : "Ghim lên đầu hồ sơ"}
      className={`grid size-8 place-items-center rounded-lg ${
        pinned ? "bg-cyan-400/10 text-cyan-300" : "text-slate-500 hover:bg-white/5"
      }`}
    >
      <Bookmark size={14} className={pinned ? "fill-current" : undefined} />
    </button>
  );
}

/* ---------------- ARTICLE ---------------- */

function ArticleBody({
  doc,
  scrollRoot,
  onTocChange,
}: {
  doc: ApiDocument;
  scrollRoot: RefObject<HTMLDivElement | null>;
  onTocChange: (items: TocItem[]) => void;
}) {
  const editor = useEditor({
    extensions: getPostExtensions(),
    content: doc.content,
    editable: false,
    immediatelyRender: false,
    editorProps: { attributes: { class: POST_PROSE_CLASS } },
  });

  useEffect(() => {
    if (!editor) return;
    const root = scrollRoot.current;
    if (!root) return;
    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>(
        ".ProseMirror h1, .ProseMirror h2, .ProseMirror h3, .ProseMirror h4",
      ),
    );
    const items: TocItem[] = nodes.map((el, i) => {
      const id = `wd-h-${i}-${(el.textContent ?? "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 40)}`;
      el.id = id;
      el.style.scrollMarginTop = "24px";
      return {
        id,
        text: el.textContent ?? "",
        level: Number(el.tagName.slice(1)),
      };
    });
    onTocChange(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, doc.id, doc.content]);

  const dateLabel = useMemo(
    () => formatRelativeTime(doc.updatedAt),
    [doc.updatedAt],
  );

  return (
    <div className="mx-auto max-w-[720px] pt-6 pb-24">
      <div className="focus-hud-text text-[9px] tracking-[.16em] text-cyan-300/60">
        BÀI VIẾT
        {doc.tags.length > 0
          ? ` / ${doc.tags.map((t) => t.toUpperCase()).join(" / ")}`
          : ""}
      </div>
      <h1 className="mt-4 text-3xl font-bold tracking-[-.03em] text-slate-100 md:text-4xl">
        {doc.title}
      </h1>
      {doc.summary && (
        <p className="mt-3 text-sm leading-6 text-slate-400">{doc.summary}</p>
      )}
      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-lg border border-white/[.08] bg-white/[.025] px-2.5 py-1.5 text-[9px] text-slate-500">
          {dateLabel}
        </span>
        <span className="rounded-lg border border-white/[.08] bg-white/[.025] px-2.5 py-1.5 text-[9px] text-slate-500">
          {formatCompact(doc.viewCount)} lượt xem
        </span>
        <span
          className={`rounded-lg border px-2.5 py-1.5 text-[9px] ${
            doc.isPublished
              ? "border-emerald-300/20 bg-emerald-300/[.05] text-emerald-200"
              : "border-amber-300/20 bg-amber-300/[.05] text-amber-200"
          }`}
        >
          {doc.isPublished ? "Đã xuất bản" : "Bản nháp"}
        </span>
      </div>

      {doc.coverImageUrl && (
        <div className="mt-8 aspect-video w-full overflow-hidden rounded-2xl border border-cyan-300/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={doc.coverImageUrl}
            alt=""
            className="size-full object-cover"
          />
        </div>
      )}

      <div className="mt-8 flex items-center gap-3 border-b border-white/[.06] pb-5">
        <Image
          src={doc.author.avatarUrl}
          alt={doc.author.name}
          width={26}
          height={26}
          className="size-[26px] rounded-full object-cover"
        />
        <span className="text-xs font-semibold text-slate-300">
          {doc.author.name}
        </span>
      </div>
      <div className="mt-6">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

/* ---------------- TOOLS TAB BAR ---------------- */

function ToolsTabBar({
  tool,
  setTool,
}: {
  tool: ToolId;
  setTool: (t: ToolId) => void;
}) {
  return (
    <div className="flex shrink-0 overflow-x-auto border-b border-white/[.07] p-2">
      {TOOLS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setTool(id)}
          className={`flex min-w-[52px] flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2 text-[8px] ${
            tool === id
              ? "bg-cyan-400/[.08] text-cyan-200"
              : "text-slate-600 hover:text-slate-300"
          }`}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
}

function PanelHeader({
  no,
  title,
  icon,
  action,
}: {
  no: string;
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex shrink-0 items-center gap-2 border-b border-white/[.06] pb-3 text-[9px] tracking-[.14em] text-slate-500">
      <span className="text-cyan-300">{icon}</span>
      {title}
      <span className="ml-auto text-[8px] text-slate-700">MODULE / {no}</span>
      {action}
    </div>
  );
}

/* ---------------- OUTLINE ---------------- */

function OutlinePanel({
  tree,
  activeId,
  query,
}: {
  tree: TocNode[];
  activeId: string;
  query: string;
}) {
  const [manualOpenIds, setManualOpenIds] = useState<Record<string, boolean>>(
    {},
  );
  const filteredTree = query.trim()
    ? tree.filter((n) => n.text.toLowerCase().includes(query.toLowerCase()))
    : tree;

  function toggleSection(id: string, currentlyOpen: boolean) {
    setManualOpenIds((v) => ({ ...v, [id]: !currentlyOpen }));
  }

  return (
    <div className="flex h-full min-h-0 flex-col p-4">
      <PanelHeader no="01" title="MỤC LỤC" icon={<ListTree size={13} />} />
      <div className="focus-panel-scroll min-h-0 flex-1 overflow-y-auto pr-1">
        {filteredTree.length === 0 ? (
          <p className="py-8 text-center text-[12px] text-slate-600">
            {query.trim()
              ? "Không tìm thấy mục nào khớp."
              : "Bài viết không có mục lục."}
          </p>
        ) : (
          <div className="pl-1">
            {filteredTree.map((node, i) => (
              <OutlineRow
                key={node.id}
                node={node}
                index={i}
                depth={0}
                activeId={activeId}
                manualOpenIds={manualOpenIds}
                onToggle={toggleSection}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OutlineRow({
  node,
  index,
  depth,
  activeId,
  manualOpenIds,
  onToggle,
}: {
  node: TocNode;
  index: number;
  depth: number;
  activeId: string;
  manualOpenIds: Record<string, boolean>;
  onToggle: (id: string, currentlyOpen: boolean) => void;
}) {
  const hasChildren = node.children.length > 0;
  const defaultOpen = containsActive(node, activeId);
  const open = manualOpenIds[node.id] ?? defaultOpen;
  const isActive = node.id === activeId || containsActive(node, activeId);
  const isTop = depth === 0;

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          scrollToHeading(node.id);
          if (hasChildren) onToggle(node.id, open);
        }}
        style={{ paddingLeft: depth * 20 }}
        className={`group relative flex w-full items-center gap-3 rounded-lg py-2.5 pr-2 text-left ${isActive ? "bg-cyan-300/[.08] text-cyan-100" : "text-slate-500 hover:bg-cyan-300/[.05]"}`}
      >
        <span
          className={`size-2 shrink-0 rounded-full border ${isActive ? "border-cyan-300 bg-cyan-300" : "border-slate-700 bg-[#071724]"}`}
        />
        <span
          className={`min-w-0 flex-1 truncate text-left ${isTop ? "text-[11px]" : "text-[10px]"}`}
        >
          {isTop ? `${String(index + 1).padStart(2, "0")}. ${node.text}` : node.text}
        </span>
        {hasChildren && isTop ? (
          <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-slate-700">
            <ChevronDown size={12} />
          </motion.span>
        ) : (
          isTop && <ChevronRight className="text-slate-700" size={13} />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {node.children.map((child, j) => (
              <OutlineRow
                key={child.id}
                node={child}
                index={j}
                depth={depth + 1}
                activeId={activeId}
                manualOpenIds={manualOpenIds}
                onToggle={onToggle}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- NOTES (demo cuc bo - khong co model DB, khong luu) ---------------- */

type LocalNote = { id: number; color: string; title: string; body: string };

const INITIAL_NOTES: LocalNote[] = [
  {
    id: 1,
    color: "#f3bd32",
    title: "Cần xem lại đoạn này",
    body: "Ghi chú của bạn chỉ lưu trong phiên xem này, chưa có tính năng lưu ghi chú lên server.",
  },
];

function NotesPanel() {
  const [notes, setNotes] = useState(INITIAL_NOTES);

  return (
    <div className="p-4">
      <PanelHeader
        no="—"
        title="GHI CHÚ · DEMO"
        icon={<StickyNote size={13} />}
        action={
          <button
            type="button"
            onClick={() =>
              setNotes((n) => [
                {
                  id: Date.now(),
                  color: "#24d8ff",
                  title: "Ghi chú mới",
                  body: "Nhập nội dung của bạn...",
                },
                ...n,
              ])
            }
            className="ml-2 grid size-7 place-items-center rounded-lg bg-cyan-400/10 text-cyan-300"
          >
            <Plus size={14} />
          </button>
        }
      />
      <p className="mb-3 text-[9px] text-slate-700">
        Ghi chú cục bộ, chưa lưu server - mất khi bạn đóng chế độ tập trung.
      </p>
      <div className="focus-panel-scroll space-y-2.5 overflow-y-auto">
        {notes.map((n) => (
          <div
            key={n.id}
            className="flex gap-2 rounded-xl border border-white/[.07] bg-white/[.02] p-3"
          >
            <i className="w-1 shrink-0 rounded-full" style={{ background: n.color }} />
            <div className="min-w-0">
              <b className="block text-[10px] text-slate-300">{n.title}</b>
              <span className="mt-1 block text-[9px] leading-4 text-slate-600">
                {n.body}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- RESOURCES (demo - Document chua co truong dinh kem) ---------------- */

const DEMO_RESOURCES = [
  "AWS Official Documentation",
  "Kiến trúc tham khảo.png",
  "Ghi chú buổi build.pdf",
];

function ResourcesPanel() {
  return (
    <div className="p-4">
      <PanelHeader no="—" title="TÀI LIỆU · DEMO" icon={<FileText size={13} />} />
      <p className="mb-3 text-[9px] text-slate-700">
        Chưa có tính năng đính kèm tài liệu thật cho bài viết.
      </p>
      <div className="space-y-2">
        {DEMO_RESOURCES.map((x) => (
          <div
            key={x}
            className="flex items-center gap-3 rounded-xl border border-white/[.06] p-3 opacity-60"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-cyan-300/[.06] text-cyan-300">
              <FileText size={14} />
            </span>
            <span className="text-[10px] text-slate-400">{x}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- ACTIVITY (demo - chua co activity log that) ---------------- */

const DEMO_ACTIVITY = [
  "Xem trước tính năng hoạt động bài viết",
  "Chưa có nhật ký hoạt động thật",
];

function ActivityPanel() {
  return (
    <div className="p-4">
      <PanelHeader no="—" title="HOẠT ĐỘNG · DEMO" icon={<Activity size={13} />} />
      <p className="mb-3 text-[9px] text-slate-700">
        Chưa có bảng ghi hoạt động thật gắn với bài viết.
      </p>
      <div className="space-y-4">
        {DEMO_ACTIVITY.map((x) => (
          <div key={x} className="flex gap-3 opacity-60">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-cyan-300" />
            <span className="text-[10px] text-slate-500">{x}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- RELATIONS ---------------- */

function RelatedPanel({
  doc,
  siblingDocs,
  onOpenDoc,
}: {
  doc: ApiDocument | null;
  siblingDocs: ApiDocumentSummary[];
  onOpenDoc: (id: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const satellites = siblingDocs.slice(0, 6);

  return (
    <div className="relative flex h-full min-h-0 flex-col p-4">
      <PanelHeader no="02" title="MẠNG LƯỚI KIẾN THỨC" icon={<Network size={13} />} />
      <p className="mb-3 text-[11px] text-slate-500">
        Các bài viết khác trong cùng nhóm kiến thức
      </p>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-cyan-300/[.08] bg-[#03101a]/45">
        <span className="absolute top-1/2 left-1/2 z-30 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-200/55 bg-cyan-300/[.08] text-cyan-100">
          <div className="relative grid size-9 place-items-center rounded-full bg-gradient-to-br from-cyan-200 via-cyan-400 to-blue-500 text-[#03131f]">
            <ShieldCheck size={17} />
          </div>
          <span className="absolute -bottom-6 max-w-[110px] truncate text-center text-[10px] text-cyan-200/70">
            {doc ? truncate(doc.title, 20) : "..."}
          </span>
        </span>

        {satellites.length === 0 ? (
          <div className="absolute inset-0 grid place-items-center px-8 text-center">
            <span className="text-[12px] text-slate-600">
              Chưa có bài viết liên quan khác trong nhóm.
            </span>
          </div>
        ) : (
          satellites.map((sat, i) => {
            const angle = -Math.PI / 2 + i * ((Math.PI * 2) / satellites.length);
            const x = 50 + Math.cos(angle) * 38;
            const y = 50 + Math.sin(angle) * 34;
            const on = selected === sat.id;
            return (
              <div key={sat.id}>
                <span
                  className="pointer-events-none absolute top-1/2 left-1/2 h-px origin-left bg-gradient-to-r from-cyan-300/50 to-transparent"
                  style={{
                    width: "38%",
                    opacity: on ? 1 : 0.35,
                    transform: `rotate(${(angle * 180) / Math.PI}deg)`,
                  }}
                />
                <div className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
                  <button
                    type="button"
                    onClick={() => setSelected(on ? null : sat.id)}
                    className={`relative max-w-[150px] -translate-x-1/2 -translate-y-1/2 truncate rounded-lg border px-3 py-2 text-left text-[11px] text-slate-300 ${on ? "border-cyan-300/60 shadow-[0_0_18px_rgba(65,224,255,.3)]" : "border-cyan-300/15"} bg-[#06131f]/95`}
                  >
                    {sat.title}
                  </button>
                  <AnimatePresence>
                    {on && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 6 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute top-full left-1/2 z-40 -translate-x-1/2"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDoc(sat.id);
                          }}
                          className="focus-hud-text flex items-center gap-1.5 rounded-md border border-cyan-300/25 bg-[#06131f] px-2.5 py-1.5 text-[10px] text-cyan-200"
                        >
                          <ArrowUpRight size={11} /> MỞ BÀI VIẾT
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/[.06] pt-3">
        <span className="focus-hud-text text-[9px] text-slate-600">
          {satellites.length + 1} NODES
        </span>
        <span className="focus-hud-text text-[9px] text-slate-700">
          CÙNG NHÓM KIẾN THỨC
        </span>
      </div>
    </div>
  );
}

/* ---------------- STATUS ---------------- */

function StatusPanel({
  doc,
  relatedCount,
}: {
  doc: ApiDocument | null;
  relatedCount: number;
}) {
  if (!doc) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoaderCircle size={16} className="animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="focus-panel-scroll h-full overflow-y-auto p-4">
      <PanelHeader no="03" title="TỔNG QUAN" icon={<ShieldCheck size={13} />} />

      <div className="mb-3 flex items-center justify-between">
        <span
          className={`flex items-center gap-1.5 rounded-full border px-2 py-1 text-[9px] ${
            doc.isPublished
              ? "border-emerald-300/20 bg-emerald-300/[.05] text-emerald-200"
              : "border-amber-300/20 bg-amber-300/[.05] text-amber-200"
          }`}
        >
          <CheckCircle2 size={11} /> {doc.isPublished ? "PUBLISHED" : "DRAFT"}
        </span>
        <span className="focus-hud-text text-[9px] text-slate-700">
          <Clock3 size={10} className="mr-1 inline" />
          {formatRelativeTime(doc.updatedAt)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatusMetric icon={<Eye size={11} />} label="LƯỢT XEM" value={formatCompact(doc.viewCount)} />
        <StatusMetric icon={<CircleDot size={11} />} label="THẺ" value={String(doc.tags.length)} />
        <StatusMetric icon={<Network size={11} />} label="LIÊN QUAN" value={String(relatedCount)} />
      </div>

      <KnowledgeHealth doc={doc} relatedCount={relatedCount} />
    </div>
  );
}

function StatusMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[.055] bg-white/[.018] p-2">
      <div className="focus-hud-text flex items-center gap-1 text-[8px] text-slate-700">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-[14px] text-slate-200">{value}</div>
    </div>
  );
}

function KnowledgeHealth({
  doc,
  relatedCount,
}: {
  doc: ApiDocument;
  relatedCount: number;
}) {
  const health = computeKnowledgeHealth(doc, relatedCount);

  return (
    <div className="mt-3 rounded-xl border border-white/[.055] bg-white/[.018] p-4">
      <div className="focus-hud-text text-[9px] text-slate-600">
        KNOWLEDGE HEALTH · DEMO
      </div>
      <b className="mt-2 block text-3xl text-cyan-200">{health}%</b>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${health}%` }}
          transition={{ duration: 0.7 }}
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400"
        />
      </div>
    </div>
  );
}

/* ---------------- SELECTION TOOLBAR ---------------- */
// Port dung hanh vi cua source: "Highlight"/"Discuss" chi dong popover
// (source cung KHONG ap dung highlight/tao thao luan that nao ca), "Note"/
// "Link" chuyen tab that.

function SelectionToolbar({
  close,
  note,
  link,
}: {
  close: () => void;
  note: () => void;
  link: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      className="focus-glass pointer-events-auto fixed bottom-8 left-1/2 z-[50] flex -translate-x-1/2 gap-1 rounded-xl p-1.5 shadow-2xl"
    >
      <button
        type="button"
        onClick={close}
        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[10px] text-slate-300 hover:bg-cyan-300/10"
      >
        <Highlighter size={14} /> Highlight
      </button>
      <button
        type="button"
        onClick={note}
        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[10px] text-slate-300 hover:bg-cyan-300/10"
      >
        <StickyNote size={14} /> Ghi chú
      </button>
      <button
        type="button"
        onClick={close}
        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[10px] text-slate-300 hover:bg-cyan-300/10"
      >
        <MessageCircle size={14} /> Thảo luận
      </button>
      <button
        type="button"
        onClick={link}
        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[10px] text-slate-300 hover:bg-cyan-300/10"
      >
        <Link2 size={14} /> Liên kết
      </button>
      <button
        type="button"
        onClick={close}
        className="grid size-7 place-items-center text-slate-500"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
