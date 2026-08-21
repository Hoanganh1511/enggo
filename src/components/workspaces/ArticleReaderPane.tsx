"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEditor, EditorContent } from "@tiptap/react";
import {
  Blocks,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileTextIcon,
  Folder,
  Highlighter,
  History,
  Layers,
  LoaderCircle,
  MessageCircle,
  Pencil,
  StickyNote,
  type LucideIcon,
} from "lucide-react";
import type { ApiDocument } from "@/lib/api/types";
import { formatRelativeTime } from "@/lib/format-time";
import { toast } from "@/lib/toast/toast-store";
import { getPostExtensions, POST_PROSE_CLASS } from "./post-extensions";
import { PostEditor } from "./PostEditor";
import { PostEditorModal } from "./PostEditorModal";
import { CreateSeriesModal } from "./CreateSeriesModal";
import type { TocItem } from "./toc";
import { PANEL_SPRING } from "./motion";
import { ArticleTabs, type ArticleTabId } from "./ArticleTabs";
import { useWorkspaceShell } from "./workspace-shell-context";

// Trang doc 1 bai viet toan van - render tai
// /workspace/[username]/[workspaceId]/[slug]/page.tsx (Server Component da
// fetch san `doc`, xem [slug]/page.tsx). Chia se sidebar/nhom dang chon voi
// trang browse qua WorkspaceShellContext (layout.tsx chung, KHONG remount
// khi dieu huong giua 2 trang) - KHONG con readerPhase/onClose/onSidebarExited
// nhu ban cu (WorkspaceDetail.tsx quan ly toan bo bang client state trong 1
// trang duy nhat, khong co URL that cho tung bai viet). Dong bai viet gio la
// dieu huong That (Link) ve trang browse - trinh duyet tu lo back/forward.
//
// Edit mode: 1 chuoi buoc rieng dieu phoi boi EditPhase (state cuc bo trong
// trang nay, khong lien quan gi den routing) - CO Y DON GIAN, khong con hieu
// ung chuyen canh phuc tap (truoc day co them buoc "collapsing" cho
// ArticleBody bap bung/thu nho + toolbar lat 4 pha, gay ram ra/lag):
//   "idle"      -> bam nut "Chỉnh sửa" tren ReaderToolbar.
//   "toast"     -> hien 1 toast nho "Dang chuyen mode Edit" (het han sau 1
//                  khoang thoi gian co dinh - day la thong bao thuan tuy,
//                  khong cho doi task that nao ca nen dung timeout la hop ly).
//   "preparing" -> tat bai viet, hien spinner ngan (dang mo trinh soan thao).
//   "editing"   -> PostEditor (mode="edit") THAT hien ra.
// Luu qua updateDocumentAction that; luu xong cap nhat state `doc` cuc bo
// (khong propagate nguoc ve danh sach groupDocs trong WorkspaceShell - giong
// han vi ban cu, chi hien anh huong ngay tren trang dang xem).

type EditPhase = "idle" | "toast" | "preparing" | "editing";

// `doc.id` duoc dung lam key luc render component nay (xem [slug]/page.tsx)
// de React TU REMOUNT khi dieu huong sang 1 bai viet KHAC (cung route
// pattern [slug], Next.js co the tai su dung component instance) - tranh
// phai dong bo state cuc bo `doc`/`toc`/`editPhase` bang 1 effect (anti-
// pattern "mirror prop vao state", ESLint react-hooks/set-state-in-effect
// se bao loi neu lam vay).
export function ArticleReaderPane({ doc: initialDoc }: { doc: ApiDocument }) {
  const {
    workspace,
    username,
    selectedGroup,
    groupDocs,
    selectGroupById,
    refreshGroupDocs,
    clearSelectedGroup,
    setActiveSection,
  } = useWorkspaceShell();
  const [doc, setDoc] = useState(initialDoc);
  const [sideTab, setSideTab] = useState<ArticleTabId>("overview");
  const [editPhase, setEditPhase] = useState<EditPhase>("idle");
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeTocId, setActiveTocId] = useState("");
  const postScrollRef = useRef<HTMLDivElement>(null);
  const [addRelatedOpen, setAddRelatedOpen] = useState(false);
  const [createSeriesOpen, setCreateSeriesOpen] = useState(false);

  // Nut "Thêm bài viết cùng chủ đề" (ReaderToolbar) - neu bai hien tai CHUA
  // thuoc series nao, mo CreateSeriesModal de hoi ten nhom (tao series MOI gan
  // luon bai nay vao, documentIds: [doc.id]) truoc khi mo composer; da co san
  // series thi mo thang composer voi seriesId do. Composer (PostEditorModal)
  // tu gan seriesId cho bai MOI luc tao qua CreateDocumentDto.seriesId.
  function handleAddRelated() {
    if (doc.series) {
      setAddRelatedOpen(true);
      return;
    }
    setCreateSeriesOpen(true);
  }

  // Dam bao sidebar/danh sach nhom dung voi nhom cua bai dang doc - can
  // thiet vi nguoi dung co the vao THANG url bai viet (khong qua click tu
  // list o trang browse), luc do selectedGroup mac dinh (nhom dau tien) co
  // the SAI.
  useEffect(() => {
    selectGroupById(doc.knowledgeGroupId);
  }, [doc.knowledgeGroupId, selectGroupById]);

  useEffect(() => {
    if (editPhase === "toast") {
      const t = setTimeout(() => setEditPhase("preparing"), 900);
      return () => clearTimeout(t);
    }
    if (editPhase === "preparing") {
      const t = setTimeout(() => setEditPhase("editing"), 300);
      return () => clearTimeout(t);
    }
  }, [editPhase]);

  // Scroll-spy cho tab "Muc luc": dung IntersectionObserver voi root la
  // CHINH container cuon cua bai viet (postScrollRef, gan boi ArticleBody) -
  // khong dung window vi no nam trong the overflow-y-auto rieng, khong phai
  // body. rootMargin bop khung quan sat con lai 1 dai mong gan dinh container
  // ("da doc qua" = di qua dai nay) - dung "heading dau tien (theo thu tu tai
  // lieu) dang nam trong dai" lam active, giong quy uoc scrollspy pho bien.
  useEffect(() => {
    if (toc.length === 0) return;
    const container = postScrollRef.current;
    if (!container) return;
    const els = toc
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;

    const setInitial = () => setActiveTocId(els[0].id);
    setInitial();

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const current = els.find((el) => visible.has(el.id));
        if (current) setActiveTocId(current.id);
      },
      { root: container, rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [toc]);

  const siblingDocs = groupDocs.filter((d) => d.id !== doc.id);

  return (
    <div className="relative flex min-h-0 flex-1 gap-3">
      {/* Card giua: breadcrumb + noi dung bai viet gop chung 1 khoi bo tron
          (rounded-[13px] + border, dong bo voi sidebar/aside - xem
          WorkspaceShell.tsx/GroupArticleToc.tsx) thay vi breadcrumb la 1
          thanh rieng troi qua ca 2 cot nhu truoc. */}
      <div
        className="shadow-panel relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-[13px] backdrop-blur-md"
        style={{
          border: "1px solid var(--border)",
          background: "color-mix(in srgb, var(--surface) 82%, transparent)",
        }}
      >
        {/* Breadcrumb thay cho nut back + tieu de rieng le truoc day - vua dieu
            huong (click workspace/nhom) vua cho biet dang o dau, khong can 2
            vung rieng nua. Chuyen tu ArticleOverview.tsx (tab "Tong quan") len
            day - khong con lap lai o do. */}
        <div
          className="flex h-13 shrink-0 items-center gap-1.5 overflow-hidden px-4 text-[13px]"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <Link
            href={`/workspace/${username}/${workspace.id}`}
            // Xoa selectedGroup - thieu dong nay thi dieu huong ve trang
            // browse van con giu state nhom dang chon (WorkspaceShell.tsx),
            // khien WorkspaceBrowseView tu dong nhay THANG lai bai viet moi
            // nhat cua CHINH nhom nay thay vi ve man chon nhom kien thuc
            // (KnowledgeGroupCatalog) - dung y nguoi dung phan anh "vẫn nháy
            // ở màn chi tiết bài viết hiện tại".
            onClick={clearSelectedGroup}
            className="flex shrink-0 items-center gap-1 font-medium text-ink-muted transition-colors duration-150 ease-out hover:text-ink hover:underline hover:underline-offset-2"
          >
            <Blocks size={13} strokeWidth={1.9} className="shrink-0" />
            <span className="truncate">{workspace.name}</span>
          </Link>
          <ChevronRight
            size={13}
            strokeWidth={1.9}
            className="shrink-0"
            style={{ color: "var(--ink-faint)" }}
          />
          <Link
            href={`/workspace/${username}/${workspace.id}/group/${doc.knowledgeGroupId}`}
            // Ve TRANG NHOM that (Tong quan) - truoc day tro nham ve URL danh
            // muc (KnowledgeGroupCatalog), tu hoi ban dau khi nhom CHUA co URL
            // rieng (group/[groupId]/page.tsx). Ep activeSection ve "overview"
            // vi state co the dang giu 1 "trang" khac tu truoc do (vd "Bài
            // viết"), trong khi bam ten nhom o day nghia la "ve tong quan
            // nhom", khong phai "giu nguyen trang dang xem".
            onClick={() => setActiveSection("overview")}
            className="flex min-w-0 shrink items-center gap-1 font-medium text-ink-muted transition-colors duration-150 ease-out hover:text-ink hover:underline hover:underline-offset-2"
          >
            <Folder size={13} strokeWidth={1.9} className="shrink-0" />
            <span className="min-w-0 truncate">
              {selectedGroup?.name ?? "..."}
            </span>
          </Link>
          <ChevronRight
            size={13}
            strokeWidth={1.9}
            className="shrink-0"
            style={{ color: "var(--ink-faint)" }}
          />
          <span
            className="flex min-w-0 flex-1 items-center gap-1 font-semibold"
            style={{ color: "var(--ink)" }}
          >
            <FileTextIcon size={13} strokeWidth={1.9} className="shrink-0" />
            <span className="min-w-0 truncate">{doc.title}</span>
          </span>
        </div>

        <main className="relative min-h-0 flex-1 overflow-hidden">
          {editPhase === "preparing" ? (
            <EditorPreparingStage />
          ) : editPhase === "editing" ? (
            <div className="h-full px-6 lg:px-10">
              <PostEditor
                mode="edit"
                document={doc}
                floatingToolbar
                onCancel={() => setEditPhase("idle")}
                onSaved={(saved, publish) => {
                  setDoc(saved);
                  // Luu NHAP: o lai che do sua (khong thoat), chi bao da luu
                  // - theo phan hoi nguoi dung. Xuat ban van thoat nhu cu (da
                  // "xong" bai, khong con ly do o lai man sua nua).
                  if (publish) {
                    setEditPhase("idle");
                  } else {
                    toast.success("Đã lưu thay đổi nháp.");
                  }
                }}
              />
            </div>
          ) : (
            <ArticleBody
              key={doc.id}
              doc={doc}
              scrollRoot={postScrollRef}
              onTocChange={setToc}
            />
          )}
          <AnimatePresence>
            {editPhase === "toast" && <EditModeToast key="edit-toast" />}
          </AnimatePresence>
        </main>
      </div>

      <motion.aside
        initial={{ x: 520, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={PANEL_SPRING}
        className="shadow-panel flex w-90 shrink-0 flex-col overflow-hidden rounded-[13px] backdrop-blur-md"
        style={{
          border: "1px solid var(--border)",
          background: "color-mix(in srgb, var(--surface) 82%, transparent)",
        }}
      >
        <AnimatePresence>
          {editPhase === "idle" && (
            <ReaderToolbar
              key="reader-toolbar"
              canEdit={doc.isOwner}
              onEdit={() => setEditPhase("toast")}
              onNotes={() => setSideTab("resources")}
              onAddRelated={handleAddRelated}
            />
          )}
        </AnimatePresence>
        <ArticleTabs
          tab={sideTab}
          setTab={setSideTab}
          doc={doc}
          siblingDocs={siblingDocs}
          group={selectedGroup}
          username={username}
          workspaceId={workspace.id}
          toc={toc}
          activeTocId={activeTocId}
          onChecklistLogPublicChange={(next) =>
            setDoc((prev) => ({ ...prev, checklistLogPublic: next }))
          }
        />
      </motion.aside>
      <PostEditorModal
        open={addRelatedOpen}
        onClose={() => setAddRelatedOpen(false)}
        groupId={doc.knowledgeGroupId}
        seriesId={doc.series?.id}
      />
      <CreateSeriesModal
        open={createSeriesOpen}
        onOpenChange={setCreateSeriesOpen}
        groupId={doc.knowledgeGroupId}
        documentIds={[doc.id]}
        defaultName={doc.title}
        onCreated={(series) => {
          setDoc((prev) => ({
            ...prev,
            series: { id: series.id, name: series.name, category: series.category },
          }));
          refreshGroupDocs();
          setAddRelatedOpen(true);
        }}
      />
    </div>
  );
}

/* ---------------- EDIT MODE: TOAST + PREPARING STAGE ---------------- */

// Toast bao "Dang chuyen mode Edit" - thuan bao hieu, tu het han sau 1
// khoang co dinh (khong co task that nao de cho ca nen dung timeout o cap
// component cha la hop ly, khac voi cac cho khac trong file nay dung tin
// hieu that). Dinh vi giua-tren <main> qua left-1/2 + x:"-50%" CUA CHINH
// Framer (khong dung class Tailwind -translate-x-1/2, vi Framer se ghi de
// toan bo style.transform khi animate x/y/scale, xung dot voi class do).
function EditModeToast() {
  return (
    <motion.div
      initial={{ opacity: 0, x: "-50%", y: -14, scale: 0.96 }}
      animate={{ opacity: 1, x: "-50%", y: 0, scale: 1 }}
      exit={{
        opacity: 0,
        x: "-50%",
        y: -10,
        scale: 0.96,
        transition: { duration: 0.15 },
      }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none absolute top-4 left-1/2 z-30 flex items-center gap-2 rounded-full border px-3.5 py-2 text-[12px] font-medium shadow-panel"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
        color: "var(--ink)",
      }}
    >
      <LoaderCircle
        size={13}
        strokeWidth={2}
        className="animate-spin"
        style={{ color: "var(--primary)" }}
      />
      Đang chuyển mode Edit…
    </motion.div>
  );
}

function EditorPreparingStage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-full flex-col items-center justify-center gap-3"
    >
      <LoaderCircle
        size={22}
        strokeWidth={1.9}
        className="animate-spin"
        style={{ color: "var(--primary)" }}
      />
      <span className="text-[11px]" style={{ color: "var(--ink-faint)" }}>
        Đang mở trình soạn thảo…
      </span>
    </motion.div>
  );
}

/* ---------------- ARTICLE BODY ---------------- */

const WORDS_PER_MINUTE = 200;

function ArticleBody({
  doc,
  scrollRoot,
  onTocChange,
}: {
  doc: ApiDocument;
  scrollRoot: React.RefObject<HTMLDivElement | null>;
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

  // Thoi luong doc UOC TINH tu CHINH noi dung that (editor.getText() cua
  // Tiptap da mount) - khong phai so lieu bia dat, chia theo toc do doc
  // trung binh 200 tu/phut. editor co the chua san sang o frame dau (null)
  // nen fallback ve 1 phut thay vi hien so am/0.
  const readMinutes = useMemo(() => {
    const text = editor?.getText() ?? "";
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
  }, [editor]);

  return (
    <div ref={scrollRoot} className="h-full overflow-y-auto">
      {/* STICKY: title + 4 nut toolbar CUNG 1 box flex - dinh o dau vung
          scroll (top-0 cua CHINH scrollRoot, khong bi le do padding vi day
          la CON TRUC TIEP cua scrollRoot, khong nam trong wrapper co padding
          nao ca). Nen dac + border-bottom de noi dung phia duoi khong "lo"
          qua luc dinh lai. */}
      <div className=" z-10 px-6 py-4 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-start justify-between gap-4">
          <h1
            className="text-3xl font-bold tracking-[-.02em] md:text-[42px]"
            style={{ color: "var(--ink)" }}
          >
            {doc.title}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        {doc.summary && (
          <p
            className="mt-6 text-sm leading-6"
            style={{ color: "var(--ink-muted)" }}
          >
            {doc.summary}
          </p>
        )}

        {/* CUM THONG TIN - flex-wrap: tac gia, thoi luong doc, cap nhat bao
            lau, trang thai xuat ban. */}
        <div
          className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs border-t border-b border-border py-3"
          style={{ color: "var(--ink-faint)" }}
        >
          <span className="flex items-center gap-2">
            <Image
              src={doc.author.avatarUrl}
              alt={doc.author.name}
              width={22}
              height={22}
              className="size-5.5 rounded-full object-cover"
            />
            <span className="font-semibold" style={{ color: "var(--ink)" }}>
              {doc.author.name}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock3 size={12} strokeWidth={1.9} />
            {readMinutes} phút đọc
          </span>
          <span className="flex items-center gap-1.5">
            <History size={12} strokeWidth={1.9} />
            Cập nhật {dateLabel}
          </span>
          <span
            className="flex items-center gap-1.5"
            style={{
              color: doc.isPublished ? "var(--success)" : "var(--warning)",
            }}
          >
            <CheckCircle2 size={12} strokeWidth={1.9} />
            {doc.isPublished ? "Đã xuất bản" : "Bản nháp — chỉ bạn thấy"}
          </span>
        </div>

        {doc.coverImageUrl && (
          <div
            className="mt-6 aspect-video w-full overflow-hidden rounded-[13px]"
            style={{ border: "1px solid var(--border)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={doc.coverImageUrl}
              alt=""
              className="size-full object-cover"
            />
          </div>
        )}

        <div className="mt-6">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}

/* ---------------- TOOLBAR CANH TIEU DE, TRONG STICKY BAR ---------------- */
function ReaderToolbar({
  canEdit,
  onEdit,
  onNotes,
  onAddRelated,
}: {
  canEdit: boolean;
  onEdit: () => void;
  onNotes: () => void;
  onAddRelated: () => void;
}) {
  const items: { icon: LucideIcon; label: string; onClick: () => void }[] = [
    ...(canEdit ? [{ icon: Pencil, label: "Chỉnh sửa", onClick: onEdit }] : []),
    ...(canEdit
      ? [
          {
            icon: Layers,
            label: "Thêm bài viết cùng chủ đề",
            onClick: onAddRelated,
          },
        ]
      : []),
    { icon: StickyNote, label: "Ghi chú", onClick: onNotes },
    { icon: Highlighter, label: "Chú thích", onClick: onNotes },
    { icon: MessageCircle, label: "Thảo luận", onClick: onNotes },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="flex shrink-0 items-center gap-2 py-2 px-3"
    >
      {items.map((item) => (
        <ToolbarButton key={item.label} {...item} />
      ))}
    </motion.div>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 420, damping: 20 }}
      className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg shadow-panel transition-colors duration-150 ease-out hover:text-primary-hover!"
      style={{
        border: "1px solid var(--border)",
        background: "var(--surface)",
        color: "var(--ink-muted)",
      }}
    >
      <Icon size={16} strokeWidth={1.9} />
    </motion.button>
  );
}
