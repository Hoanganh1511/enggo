"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEditor, EditorContent } from "@tiptap/react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Highlighter,
  History,
  LoaderCircle,
  MessageCircle,
  Pencil,
  StickyNote,
  type LucideIcon,
} from "lucide-react";
import type { ApiDocument } from "@/lib/api/types";
import { formatRelativeTime } from "@/lib/format-time";
import { getPostExtensions, POST_PROSE_CLASS } from "./post-extensions";
import { PostEditor } from "./PostEditor";
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
// trang nay, khong lien quan gi den routing):
//   "idle"      -> bam nut "Chỉnh sửa" tren ReaderToolbar.
//   "toast"     -> hien 1 toast nho "Dang chuyen mode Edit" (het han sau 1
//                  khoang thoi gian co dinh - day la thong bao thuan tuy,
//                  khong cho doi task that nao ca nen dung timeout la hop ly).
//   "collapsing"-> ArticleBody "bap bung" (opacity nhap nhay vai lan) roi
//                  thu nho ve giua va bien mat - ket thuc bang onAnimationComplete
//                  THAT (khong doan timeout) moi chuyen tiep "preparing".
//   "preparing" -> spinner ngan (dang mo trinh soan thao).
//   "editing"   -> PostEditor (mode="edit") THAT hien ra, voi bo toolbar cua
//                  no tach rieng thanh 1 the kinh (FloatingEditorToolbar
//                  trong PostEditor.tsx) tu lat+mo dan xuong vi tri top:0.
// Luu qua updateDocumentAction that; luu xong cap nhat state `doc` cuc bo
// (khong propagate nguoc ve danh sach groupDocs trong WorkspaceShell - giong
// han vi ban cu, chi hien anh huong ngay tren trang dang xem).

type EditPhase = "idle" | "toast" | "collapsing" | "preparing" | "editing";

const articleCollapseVariants = {
  idle: { opacity: 1, scale: 1 },
  collapsing: {
    opacity: [1, 0.35, 1, 0.25, 0.9, 0],
    scale: [1, 1, 1, 1, 0.94, 0.25],
    transition: {
      duration: 0.85,
      times: [0, 0.15, 0.32, 0.48, 0.72, 1],
      ease: "easeInOut" as const,
    },
  },
};

// `doc.id` duoc dung lam key luc render component nay (xem [slug]/page.tsx)
// de React TU REMOUNT khi dieu huong sang 1 bai viet KHAC (cung route
// pattern [slug], Next.js co the tai su dung component instance) - tranh
// phai dong bo state cuc bo `doc`/`toc`/`editPhase` bang 1 effect (anti-
// pattern "mirror prop vao state", ESLint react-hooks/set-state-in-effect
// se bao loi neu lam vay).
export function ArticleReaderPane({ doc: initialDoc }: { doc: ApiDocument }) {
  const { workspace, username, selectedGroup, groupDocs, selectGroupById } =
    useWorkspaceShell();
  const [doc, setDoc] = useState(initialDoc);
  const [sideTab, setSideTab] = useState<ArticleTabId>("overview");
  const [editPhase, setEditPhase] = useState<EditPhase>("idle");
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeTocId, setActiveTocId] = useState("");
  const postScrollRef = useRef<HTMLDivElement>(null);

  // Dam bao sidebar/danh sach nhom dung voi nhom cua bai dang doc - can
  // thiet vi nguoi dung co the vao THANG url bai viet (khong qua click tu
  // list o trang browse), luc do selectedGroup mac dinh (nhom dau tien) co
  // the SAI.
  useEffect(() => {
    selectGroupById(doc.knowledgeGroupId);
  }, [doc.knowledgeGroupId, selectGroupById]);

  useEffect(() => {
    if (editPhase === "toast") {
      const t = setTimeout(() => setEditPhase("collapsing"), 900);
      return () => clearTimeout(t);
    }
    if (editPhase === "preparing") {
      const t = setTimeout(() => setEditPhase("editing"), 520);
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
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        className="flex h-[52px] shrink-0 items-center gap-3 px-4"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        <Link
          href={`/workspace/${username}/${workspace.id}`}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors duration-150 ease-out hover:text-primary-hover!"
          style={{
            border: "1px solid var(--border)",
            color: "var(--ink-muted)",
            background: "var(--surface)",
          }}
        >
          <ArrowLeft size={15} strokeWidth={1.9} />
        </Link>
        <span
          className="min-w-0 flex-1 truncate text-[13px] font-semibold"
          style={{ color: "var(--ink)" }}
        >
          {doc.title}
        </span>
      </div>

      <div className="flex min-h-0 flex-1">
        <main
          className="relative min-w-0 flex-1 overflow-hidden"
          style={{ background: "var(--surface)" }}
        >
          {editPhase === "preparing" ? (
            <EditorPreparingStage />
          ) : editPhase === "editing" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="h-full px-6 lg:px-10"
            >
              <PostEditor
                mode="edit"
                document={doc}
                floatingToolbar
                onCancel={() => setEditPhase("idle")}
                onSaved={(saved) => {
                  setDoc(saved);
                  setEditPhase("idle");
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={editPhase === "collapsing" ? "collapsing" : "idle"}
              variants={articleCollapseVariants}
              style={{ transformOrigin: "center center" }}
              onAnimationComplete={(def) => {
                if (def === "collapsing") setEditPhase("preparing");
              }}
              className="h-full"
            >
              <ArticleBody
                key={doc.id}
                doc={doc}
                scrollRoot={postScrollRef}
                onTocChange={setToc}
              />
            </motion.div>
          )}
          <AnimatePresence>
            {editPhase === "toast" && <EditModeToast key="edit-toast" />}
          </AnimatePresence>
        </main>

        <motion.aside
          initial={{ x: 520, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={PANEL_SPRING}
          className="flex w-130 shrink-0 flex-col overflow-hidden"
          style={{
            borderLeft: "1px solid var(--border)",
            background: "var(--surface)",
          }}
        >
          <AnimatePresence>
            {editPhase === "idle" && (
              <ReaderToolbar
                key="reader-toolbar"
                canEdit={doc.isOwner}
                onEdit={() => setEditPhase("toast")}
                onNotes={() => setSideTab("resources")}
              />
            )}
          </AnimatePresence>
          <ArticleTabs
            tab={sideTab}
            setTab={setSideTab}
            doc={doc}
            group={selectedGroup}
            workspaceName={workspace.name}
            siblingDocs={siblingDocs}
            username={username}
            workspaceId={workspace.id}
            toc={toc}
            activeTocId={activeTocId}
          />
        </motion.aside>
      </div>
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
}: {
  canEdit: boolean;
  onEdit: () => void;
  onNotes: () => void;
}) {
  const items: { icon: LucideIcon; label: string; onClick: () => void }[] = [
    ...(canEdit ? [{ icon: Pencil, label: "Chỉnh sửa", onClick: onEdit }] : []),
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
