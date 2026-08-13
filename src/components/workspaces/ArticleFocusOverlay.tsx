"use client";

import { useEffect, useMemo, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEditor, EditorContent } from "@tiptap/react";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock3,
  Eye,
  ListTree,
  LoaderCircle,
  Network,
  ShieldCheck,
} from "lucide-react";
import type { ApiDocument, ApiDocumentSummary } from "@/lib/api/types";
import { formatRelativeTime } from "@/lib/format-time";
import { formatCompact } from "@/lib/format-number";
import { getPostExtensions, POST_PROSE_CLASS } from "./post-extensions";
import type { TocItem } from "./WorkspaceDetail";

// "Focus mode" toan man hinh luc mo 1 bai viet - bê nguyên UI/UX/animation
// (glass panel trien khai tu 2 canh man hinh, khop noi co khi, HUD hieu
// suat) tu source rieng "treecareer-knowledge-ironman-v6.3". Khac source:
// (1) KHONG dung lai TopBar/WorkspaceRail/WorkspaceOverview/Core cua source
//     (do la 1 "vo demo" gia lap toan bo trang, trong khi WorkspaceDetail
//     that cua app da co san sidebar/header/group-overview that - overlay
//     nay chi phu LEN TREN trang that, nen "backdrop" chinh la chinh trang
//     WorkspaceDetail bi lam mo qua .pre-focus-blur, khong ve lai);
// (2) ArticlePanel render noi dung Tiptap THAT (doc.content that, khong
//     phai mang "sections" mau voi body/dia gram/code-block gia dinh san
//     cho tung section - nhung block "kien truc/code" minh hoa trong source
//     la NOI DUNG BIA, khong gan voi bai viet that nao ca);
// (3) OutlinePanel dung TOC DANG CAY that (h1/h2/h3 that, tai su dung logic
//     "chi auto-expand section chua active heading" da xay o ban truoc, gan
//     voi visual "cham sang nhap nhay" cua source);
// (4) RelatedPanel noi bai dang doc voi CAC BAI KHAC that trong CUNG nhom
//     kien thuc (siblingDocs) - source co them 3 modal "Gan bai lien quan/
//     Sua ten node/Chon icon dai dien" gia lap 1 knowledge-graph tuy chinh
//     (khong co model du lieu that: quan he trong app CHI la "cung 1 nhom
//     kien thuc", khong co node/edge do nguoi dung tu dinh nghia) - BO 3
//     modal nay, chi giu "chon 1 satellite -> mo That bai do";
// (5) StatusPanel: trang thai xuat ban la READ-ONLY phan anh doc.isPublished
//     THAT (source cho bam de toggle cuc bo, khong luu gi ca) - "Knowledge
//     Health" van la demo minh hoa (gan nhan ro, chua co AI backend tinh
//     chi so nay that), rieng Coverage tinh THAT tu ty le bai da xuat ban
//     trong nhom (cung cong thuc da dung o TechArticleSidebar truoc day);
// (6) Performance HUD (CPU/GPU/RAM) giu nguyen dang DEMO thuan tuy trang tri
//     (khong co telemetry that de gan vao, giong tinh than voi cac "panel
//     demo cho toi khi co API that" da co san trong header-command-panels/);
// (7) Thanh goi y phim tat duoi cung CHI liet ke phim THAT SU hoat dong
//     (ESC/J/K/G) - source con ghi "← → NAVIGATE" va "A ASK AI" nhung
//     KHONG wire handler nao ca, bo di tranh gay hieu lam tinh nang gia.

type RightModule = "outline" | "status" | "related";
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
  const [rightActive, setRightActive] = useState<RightModule>("outline");

  // Choreography dong: khac voi de AnimatePresence tu xu ly "exit" (chay
  // NGAY khi component unmount), o day can 1 nhip "closing" rieng de CA 5
  // mieng kinh + rail bay ra CUNG LUC theo dung huong tung mieng vao truoc
  // khi thuc su unmount - AnimatePresence exit rieng le se khong dong bo
  // dep bang cach nay (giong nguyen tac trong source).
  function handleClose() {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, 760);
  }

  const tocTree = useMemo(() => buildTocTree(toc), [toc]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
        return;
      }
      const key = event.key.toLowerCase();
      if (key === "g") setRightActive("related");
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
  }, [closing, tocTree, activeTocId]);

  // React Portal: render THANG vao document.body, khong qua bat ky ancestor
  // nao cua WorkspaceDetail. Neu khong co portal, overlay se bi "nhot" trong
  // stacking context cua div cha (workspace/[username]/layout.tsx co
  // <div className="relative z-10 h-full"> boc quanh {children}) - position:
  // relative + z-index khac auto tao 1 stacking context MOI, khien moi
  // z-index BEN TRONG (ke ca z-[200] cua overlay) chi duoc so sanh CUC BO
  // trong context do, khong bao gio "thoat ra" de so voi TopHeaderBar (z-20)
  // hay ControlCenterReactor (z-80) o nhanh cay khac - day la ly do header/
  // nut Control Center van hien de tren overlay du z-index thap hon nhieu.
  return createPortal(
    // isolate + z-index rat cao (khong chi z-200) - ControlCenterReactor
    // (fixed, z-80) van len duoc tren overlay du da portal ra document.body,
    // nen dung "isolation: isolate" de CHINH element nay tu tao 1 stacking
    // context moc lap o muc goc, dam bao z-index cua no la con so DUY NHAT
    // duoc dem khi so sanh voi BAT KY phan tu fixed nao khac trong app -
    // khong con phu thuoc suy doan chinh xac ve cay stacking context cua
    // toan bo app (de vo tinh bi 1 phan tu z-index cao khac o dau do de len).
    <div className="focus-mechanical-stage pointer-events-none fixed inset-0 isolate z-999999">
      <FocusBackdrop />
      {/* ScreenEdgeRails (tia + khop co khi tu mep man hinh) da bo - vi tri
          "top: X%" cua rail duoc tinh de khop 1 layout co WorkspaceRail/
          TopBar rieng cua source, khong con dung trong overlay full-viewport
          cua app nay nua nen rail hay cham dung vao giua noi dung panel
          phai, doc khong duoc du hieu ung z-index/isolation nao. */}

      <GlassPanel
        side="left"
        closing={closing}
        className="top-[6%] left-[4%] h-[84vh] w-[52%]"
      >
        <ArticlePanel
          doc={doc}
          docLoading={docLoading}
          scrollRef={scrollRef}
          onTocChange={onTocChange}
          toc={toc}
          activeTocId={activeTocId}
        />
      </GlassPanel>

      <RightGlassPanel
        id="outline"
        index={0}
        active={rightActive}
        closing={closing}
        onActivate={() => setRightActive("outline")}
        title="Mục lục"
      >
        <OutlinePanel tree={tocTree} activeId={activeTocId} />
      </RightGlassPanel>

      <RightGlassPanel
        id="status"
        index={1}
        active={rightActive}
        closing={closing}
        onActivate={() => setRightActive("status")}
        title="Tổng quan"
      >
        <StatusPanel doc={doc} relatedCount={siblingDocs.length} />
      </RightGlassPanel>

      <RightGlassPanel
        id="related"
        index={2}
        active={rightActive}
        closing={closing}
        onActivate={() => setRightActive("related")}
        title="Mạng lưới kiến thức"
      >
        <RelatedPanel
          doc={doc}
          siblingDocs={siblingDocs}
          onOpenDoc={onOpenDoc}
        />
      </RightGlassPanel>

      {/* <motion.button
        type="button"
        onClick={handleClose}
        whileHover={{ scale: 1.02, borderColor: "rgba(65,224,255,.45)" }}
        whileTap={{ scale: 0.97 }}
        className="focus-hud-text pointer-events-auto fixed top-20 right-6 z-220 flex items-center gap-2 rounded-lg border border-cyan-300/15 bg-[#04121d]/90 px-3 py-2 text-[9px] tracking-[.14em] text-slate-400 shadow-[0_0_22px_rgba(40,220,255,.08)] backdrop-blur-xl hover:text-cyan-100"
      >
        <ChevronDown size={11} className="rotate-90" /> ĐÓNG (ESC)
      </motion.button> */}

      <PerformanceHUD />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: closing ? 0 : 1, y: closing ? 18 : 0 }}
        transition={{ delay: closing ? 0 : 0.8, duration: 0.35 }}
        className="focus-hud-text pointer-events-none fixed bottom-4 left-1/2 z-[120] -translate-x-1/2 rounded-full border border-cyan-300/15 bg-[#04121d]/90 px-5 py-2 text-[8px] tracking-[.15em] text-slate-500 backdrop-blur-xl"
      >
        ESC ĐÓNG · J K CHUYỂN MỤC · G MẠNG LƯỚI KIẾN THỨC
      </motion.div>
    </div>,
    document.body,
  );
}

/* ---------------- BACKDROP + RAILS ---------------- */

function FocusBackdrop() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.65 }}
      className="pointer-events-none fixed inset-0 z-[60] bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,8,17,.12)_38%,rgba(0,5,10,.32)_100%)]"
    >
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
        className="absolute top-1/2 left-1/2 h-px w-[92vw] -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-300/45 to-transparent"
      />
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.7, delay: 0.05 }}
        className="absolute top-1/2 left-1/2 h-[90vh] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-cyan-300/55 to-transparent shadow-[0_0_15px_rgba(64,224,255,.6)]"
      />
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="absolute top-1/2 left-1/2 size-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/[.14] shadow-[0_0_50px_rgba(35,214,255,.08)]"
      />
    </motion.div>
  );
}

function Joint({ size, lit = false }: { size: number; lit?: boolean }) {
  return (
    <motion.span
      animate={lit ? { rotate: [0, 9, -6, 0] } : undefined}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      style={{ width: size, height: size }}
      className="relative block shrink-0 rounded-full border border-slate-600/80 bg-[#07111a] shadow-[inset_0_0_8px_rgba(0,0,0,.8),0_0_10px_rgba(50,215,255,.16)]"
    >
      <span className="absolute inset-[18%] rounded-full border border-cyan-300/20" />
      <span
        className={`absolute top-1/2 left-1/2 size-[28%] -translate-x-1/2 -translate-y-1/2 rounded-full ${lit ? "bg-cyan-300 shadow-[0_0_11px_rgba(65,224,255,.95)]" : "bg-slate-700"}`}
      />
      <span className="absolute top-[-5px] left-1/2 h-[10px] w-px -translate-x-1/2 bg-slate-600" />
      <span className="absolute bottom-[-5px] left-1/2 h-[10px] w-px -translate-x-1/2 bg-slate-600" />
    </motion.span>
  );
}

/* ---------------- GLASS DEPLOYMENT ---------------- */

function GlassPanel({
  side,
  closing,
  className,
  children,
}: {
  side: "left" | "right";
  closing: boolean;
  className: string;
  children: React.ReactNode;
}) {
  const left = side === "left";
  const delay = 0.28;

  return (
    <motion.section
      initial={{
        x: left ? "-125vw" : "125vw",
        y: 12,
        z: -220,
        rotateY: left ? 42 : -42,
        rotateX: 5,
        rotateZ: left ? -4 : 4,
        opacity: 0,
        scale: 0.82,
      }}
      animate={{
        x: closing ? (left ? "-125vw" : "125vw") : 0,
        y: closing ? 18 : 0,
        z: closing ? -240 : 0,
        rotateY: closing ? (left ? 42 : -42) : left ? 13 : -13,
        rotateX: closing ? 7 : 0,
        rotateZ: closing ? (left ? -5 : 5) : left ? -1.5 : 1.5,
        opacity: closing ? 0 : 1,
        scale: closing ? 0.76 : 1,
      }}
      transition={{
        delay: closing ? 0 : delay,
        duration: closing ? 0.72 : undefined,
        type: closing ? "tween" : "spring",
        stiffness: 68,
        damping: 16,
        mass: 0.95,
      }}
      style={{
        // z-index tuong minh - thieu no thi mac dinh "auto" (~0), trong khi
        // FocusBackdrop (z-60) va ScreenEdgeRails (z-88) co z-index DUONG
        // tuong minh nen se LUON de len GlassPanel bat ke thu tu DOM (2
        // stacking context deu la position:fixed, so z-index thuan tuy
        // khong quan tam DOM truoc/sau). Dat 100 - cao hon backdrop/rail,
        // ngang tam RightGlassPanel (96-105) de bai viet luon doc duoc ro.
        zIndex: 100,
        transformOrigin: left ? "left center" : "right center",
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
        willChange: "transform, opacity",
      }}
      className={`focus-glass focus-tech-cut motion-panel pointer-events-auto fixed overflow-visible ${className}`}
    >
      <span
        className={left ? "focus-panel-glow-left" : "focus-panel-glow-right"}
      />
      <span className="focus-panel-scan" />

      <motion.div
        initial={{
          opacity: 0,
          x: left ? -25 : 25,
          rotateY: left ? -35 : 35,
          scale: 0.7,
        }}
        animate={{
          opacity: closing ? 0 : 1,
          x: closing ? (left ? -48 : 48) : 0,
          rotateY: closing ? (left ? -28 : 28) : 0,
          scale: closing ? 0.65 : 1,
        }}
        transition={
          closing
            ? { duration: 0.28 }
            : {
                delay: delay + 0.16,
                type: "spring",
                stiffness: 170,
                damping: 14,
              }
        }
        className={`pointer-events-none absolute top-1/2 z-[4] -translate-y-1/2 ${left ? "-left-[128px]" : "-right-[128px]"}`}
        style={{ transformStyle: "preserve-3d" }}
      >
        <MechanicalDock left={left} angle={left ? 13 : -13} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.35, rotateZ: left ? -25 : 25 }}
        animate={{
          opacity: closing ? 0 : 1,
          scale: closing ? 0.35 : 1,
          rotateZ: 0,
        }}
        transition={{
          delay: closing ? 0 : delay + 0.32,
          type: "spring",
          stiffness: 220,
          damping: 13,
        }}
        className={`pointer-events-none absolute -top-[17px] z-[4] ${left ? "left-[42px]" : "right-[42px]"}`}
      >
        <Hinge />
      </motion.div>

      <div className="focus-panel-depth-edge" />
      <div className="relative z-[20] h-full min-h-0">{children}</div>
    </motion.section>
  );
}

function RightGlassPanel({
  id,
  index,
  active,
  closing,
  onActivate,
  title,
  children,
}: {
  id: RightModule;
  index: number;
  closing: boolean;
  active: RightModule;
  onActivate: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const isActive = active === id;
  const collapsedTop = `${11 + index * 12}%`;

  return (
    <motion.section
      onClick={onActivate}
      initial={{
        x: "125vw",
        y: 18,
        z: -240,
        top: isActive ? "9%" : collapsedTop,
        right: isActive ? "-42%" : "-10%",
        width: isActive ? "39%" : "9.5%",
        height: isActive ? "76vh" : "9vh",
        rotateY: -42,
        rotateX: 7,
        rotateZ: 5,
        opacity: 0,
        scale: 0.72,
      }}
      animate={{
        x: closing ? "125vw" : isActive ? 0 : 34,
        y: closing ? 18 : 0,
        z: closing ? -240 : isActive ? 0 : -80,
        top: closing ? "9%" : isActive ? "9%" : collapsedTop,
        right: closing ? "-2%" : isActive ? "4%" : "1.4%",
        width: closing ? "9%" : isActive ? "39%" : "9.5%",
        height: closing ? "9vh" : isActive ? "76vh" : "9vh",
        rotateY: closing ? -42 : isActive ? -11 : -27,
        rotateX: closing ? 7 : isActive ? 0 : 7,
        rotateZ: closing ? 5 : isActive ? 1 : index % 2 ? -3 : 3,
        opacity: closing ? 0 : isActive ? 1 : 0.55,
        scale: closing ? 0.72 : isActive ? 1 : 0.82,
      }}
      transition={
        closing
          ? // Luc dong: dung tween thoi gian co dinh (khop 0.72s voi
            // GlassPanel ben trai va ScreenEdgeRails) thay vi spring - spring
            // co thoi gian "on dinh" khong the doan truoc, khien 3 module
            // ben phai ket thuc lech nhip voi phan con lai cua canh dong bo.
            { type: "tween", duration: 0.72, ease: [0.22, 0.75, 0.2, 1] }
          : {
              type: "spring",
              stiffness: isActive ? 72 : 105,
              damping: isActive ? 17 : 18,
              mass: 1,
            }
      }
      style={{
        position: "fixed",
        transformOrigin: "right center",
        transformStyle: "preserve-3d",
        perspective: "1200px",
        backfaceVisibility: "hidden",
        willChange: "transform, opacity",
        zIndex: isActive ? 105 : 96 + index,
        cursor: "pointer",
      }}
      className="focus-glass focus-tech-cut motion-panel pointer-events-auto overflow-hidden"
    >
      <span className="focus-panel-glow-right" />
      <span className="focus-panel-scan" />
      <div className="focus-panel-depth-edge" />

      {/* Shutter "transformer" luc thu gon - chi la 1 duong quet doc nhap
          nhay, khong lam noi dung ben trong kho doc duoc (che boi lop mo
          ben duoi). */}
      <AnimatePresence>
        {!isActive && (
          <motion.div
            initial={{ opacity: 0, scaleX: 1 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
          >
            <motion.div
              animate={{ x: ["-8%", "8%", "-8%"] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-y-0 left-1/2 w-px bg-cyan-300/25 shadow-[0_0_10px_rgba(65,224,255,.55)]"
            />
            <div className="absolute inset-x-0 bottom-0 h-px bg-cyan-300/25" />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onActivate();
        }}
        className={`focus-hud-text absolute top-3 right-3 z-50 rounded border px-2 py-1 text-[7px] tracking-[.12em] transition ${
          isActive
            ? "border-cyan-300/25 bg-cyan-300/[.06] text-cyan-100"
            : "border-white/[.08] bg-black/20 text-slate-600 hover:border-cyan-300/25 hover:text-cyan-200"
        }`}
      >
        {isActive ? "ACTIVE" : "MỞ"}
      </button>

      <div className="relative z-[20] h-full min-h-0 overflow-hidden">
        {children}
      </div>

      {!isActive && (
        <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-[#020b14]/35 backdrop-blur-[1px]">
          <span className="focus-hud-text truncate px-3 text-[7px] tracking-[.14em] text-slate-500">
            {title}
          </span>
        </div>
      )}
    </motion.section>
  );
}

function MechanicalDock({ left, angle }: { left: boolean; angle: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: left ? -18 : 18, scale: 0.75 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{
        opacity: 0,
        x: left ? -72 : 72,
        scale: 0.55,
        rotateY: left ? 26 : -26,
        transition: { duration: 0.38, ease: "easeIn" },
      }}
      transition={{ type: "spring", stiffness: 180, damping: 15 }}
      className={`focus-mechanical-dock relative flex items-center ${left ? "flex-row-reverse" : ""}`}
      style={{
        transform: `rotateY(${angle}deg)`,
        transformStyle: "preserve-3d",
        transformOrigin: left ? "right center" : "left center",
      }}
    >
      <div className="relative h-[3px] w-[128px] rounded-full bg-gradient-to-r from-cyan-300/10 via-cyan-300/65 to-cyan-300/10">
        <motion.span
          animate={{ x: left ? [-4, 4, -4] : [4, -4, 4] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 h-1 w-10 -translate-y-1/2 rounded-full bg-cyan-300/40 shadow-[0_0_14px_rgba(65,224,255,.75)]"
        />
      </div>
      <Joint size={39} lit />
      <div className="mx-1 h-7 w-12 rounded-[5px] border border-slate-600/80 bg-[#07131c] shadow-[inset_0_0_8px_rgba(0,0,0,.9),0_0_12px_rgba(65,224,255,.12)]" />
      <Joint size={27} />
      <div className="mx-1 h-5 w-8 rounded-[4px] border border-slate-700/80 bg-[#07131c]" />
      <Joint size={18} />
    </motion.div>
  );
}

function Hinge() {
  return (
    <div className="relative grid size-7 place-items-center rounded-md border border-cyan-300/30 bg-[#06131d] shadow-[0_0_13px_rgba(65,224,255,.25)]">
      <span className="size-2 rounded-full bg-orange-300 shadow-[0_0_10px_rgba(255,160,60,.8)]" />
    </div>
  );
}

/* ---------------- ARTICLE ---------------- */

function ArticlePanel({
  doc,
  docLoading,
  scrollRef,
  onTocChange,
  toc,
  activeTocId,
}: {
  doc: ApiDocument | null;
  docLoading: boolean;
  scrollRef: RefObject<HTMLDivElement | null>;
  onTocChange: (items: TocItem[]) => void;
  toc: TocItem[];
  activeTocId: string;
}) {
  const dateLabel = useMemo(
    () => (doc ? formatRelativeTime(doc.updatedAt) : ""),
    [doc],
  );
  const activeIndex = Math.max(
    0,
    toc.findIndex((t) => t.id === activeTocId),
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 border-b border-white/[.07] bg-[#061522]/78 px-7 py-5">
        {docLoading || !doc ? (
          <div className="flex items-center gap-2 text-slate-500">
            <LoaderCircle size={14} className="animate-spin" />
            <span className="focus-hud-text text-[9px] tracking-[.14em]">
              ĐANG TẢI BÀI VIẾT...
            </span>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="focus-hud-text text-[8px] tracking-[.17em] text-cyan-300/65">
                ARTICLE CONTENT
                {doc.tags.length > 0
                  ? ` / ${doc.tags.map((t) => t.toUpperCase()).join(" / ")}`
                  : ""}
              </div>
              <h1 className="mt-2 text-[27px] leading-[1.1] font-semibold tracking-[-.025em] text-slate-100">
                {doc.title}
              </h1>
              {doc.summary && (
                <p className="mt-2 text-[10px] leading-5 text-slate-500">
                  {doc.summary}
                </p>
              )}
            </div>
            <span
              className={`focus-hud-text flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[7px] ${
                doc.isPublished
                  ? "border-emerald-300/20 bg-emerald-300/[.05] text-emerald-200"
                  : "border-amber-300/20 bg-amber-300/[.05] text-amber-200"
              }`}
            >
              <span
                className={`focus-energy-pulse size-1.5 rounded-full ${doc.isPublished ? "bg-emerald-300" : "bg-amber-300"}`}
              />
              {doc.isPublished ? "PUBLISHED" : "DRAFT"}
            </span>
          </div>
        )}
        {doc && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            <span className="focus-hud-text rounded border border-cyan-300/10 bg-cyan-300/[.035] px-2 py-1 text-[7px] text-slate-600">
              {dateLabel}
            </span>
            <span className="focus-hud-text rounded border border-cyan-300/10 bg-cyan-300/[.035] px-2 py-1 text-[7px] text-slate-600">
              {formatCompact(doc.viewCount)} lượt xem
            </span>
            {doc.tags.map((tag) => (
              <span
                key={tag}
                className="focus-hud-text rounded border border-cyan-300/10 bg-cyan-300/[.035] px-2 py-1 text-[7px] text-slate-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div
        ref={scrollRef}
        className="focus-panel-scroll min-h-0 flex-1 overflow-y-auto px-7 py-6"
      >
        {doc && (
          <ArticleBody
            key={doc.id}
            doc={doc}
            scrollRoot={scrollRef}
            onTocChange={onTocChange}
          />
        )}
      </div>

      <footer className="focus-hud-text shrink-0 border-t border-white/[.06] px-7 py-2 text-[7px] text-slate-700">
        ARTICLE STREAM CONNECTED · {String(activeIndex + 1).padStart(2, "0")} /{" "}
        {String(toc.length).padStart(2, "0")}
      </footer>
    </div>
  );
}

// Tach rieng khoi ArticlePanel - CHI mount khi doc DA CO (khong nullable),
// remount qua key={doc.id} moi lan doi bai (vd bam 1 satellite trong
// RelatedPanel). Ly do bat buoc phai tach: useEditor cua Tiptap CHI doc
// content luc KHOI TAO editor - neu goi useEditor({content: doc?.content ??
// null}) ngay trong ArticlePanel (component mount tu luc doc con null, vi
// overlay mo NGAY lap tuc de choi hieu ung trien khai roi moi cho fetch),
// editor se bi tao RONG vinh vien, doc sau do co ve cung KHONG lam editor
// nap lai noi dung (Tiptap khong tu dong "phan ung" voi content prop doi -
// day chinh la nguyen nhan bai viet khong hien gi ca).
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
        ".ProseMirror h1, .ProseMirror h2, .ProseMirror h3",
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

  return (
    <div className="mx-auto max-w-[720px]">
      {doc.coverImageUrl && (
        // aspect-video (16:9) thay vi h-56 co dinh (~3.2:1, qua det) -
        // coverImageUrl la URL nguoi dung tu dan (chua co upload/crop
        // server-side), thuc te thuong la anh 16:9 (vd thumbnail YouTube) -
        // ep vao khung qua det se crop mat phan lon anh, de bi "cat ngang"
        // chu/hoa tiet bake san trong anh.
        <div className="mb-6 aspect-video w-full overflow-hidden rounded-2xl border border-cyan-300/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={doc.coverImageUrl}
            alt=""
            className="size-full object-cover"
          />
        </div>
      )}
      <div className="flex items-center gap-3 border-b border-white/[.06] pb-5">
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

/* ---------------- OUTLINE ---------------- */

function OutlinePanel({
  tree,
  activeId,
}: {
  tree: TocNode[];
  activeId: string;
}) {
  const [manualOpenIds, setManualOpenIds] = useState<Record<string, boolean>>(
    {},
  );

  function toggleSection(id: string, currentlyOpen: boolean) {
    setManualOpenIds((v) => ({ ...v, [id]: !currentlyOpen }));
  }

  return (
    <div className="flex h-full min-h-0 flex-col p-5">
      <PanelHeader no="01" title="MỤC LỤC" icon={<ListTree size={14} />} />
      <div className="mb-3 flex justify-between text-[9px] text-slate-700">
        <span className="focus-hud-text">ARTICLE NAVIGATION</span>
        <span className="focus-hud-text">{tree.length} SECTIONS</span>
      </div>
      <div className="focus-panel-scroll min-h-0 flex-1 overflow-y-auto pr-1">
        {tree.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-slate-600">
            Bài viết không có mục lục.
          </p>
        ) : (
          <div className="relative pl-1">
            <div className="absolute top-3 bottom-3 left-[4px] w-px bg-gradient-to-b from-cyan-300/60 via-cyan-300/20 to-transparent" />
            {tree.map((node, i) => (
              <OutlineRow
                key={node.id}
                node={node}
                index={i}
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
  activeId,
  manualOpenIds,
  onToggle,
}: {
  node: TocNode;
  index: number;
  activeId: string;
  manualOpenIds: Record<string, boolean>;
  onToggle: (id: string, currentlyOpen: boolean) => void;
}) {
  const hasChildren = node.children.length > 0;
  const defaultOpen = containsActive(node, activeId);
  const open = manualOpenIds[node.id] ?? defaultOpen;
  const isActive = node.id === activeId || containsActive(node, activeId);

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          scrollToHeading(node.id);
          if (hasChildren) onToggle(node.id, open);
        }}
        className={`group relative flex w-full items-center gap-3 rounded-md py-2.5 pr-2 text-left ${isActive ? "bg-cyan-300/[.055]" : "hover:bg-white/[.02]"}`}
      >
        <motion.span
          animate={
            isActive
              ? {
                  scale: [1, 1.55, 1],
                  boxShadow: "0 0 14px rgba(65,224,255,.95)",
                }
              : { scale: 1, boxShadow: "0 0 0 transparent" }
          }
          transition={{ duration: 0.75 }}
          className={`relative z-10 ml-0.5 size-2 shrink-0 rounded-full border ${isActive ? "border-cyan-100 bg-cyan-300" : "border-slate-700 bg-[#07111a]"}`}
        />
        <span
          className={`min-w-0 flex-1 truncate text-[13px] ${isActive ? "font-medium text-cyan-100" : "text-slate-600 group-hover:text-slate-300"}`}
        >
          {index + 1}. {node.text}
        </span>
        {hasChildren && (
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            className="text-slate-700"
          >
            <ChevronDown size={11} />
          </motion.span>
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden pl-[26px]"
          >
            {node.children.map((child, j) => {
              const childActive = child.id === activeId;
              return (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => scrollToHeading(child.id)}
                  className={`group flex w-full items-center gap-2 py-1.5 text-left text-[12px] ${childActive ? "text-cyan-200" : "text-slate-600 hover:text-slate-300"}`}
                >
                  <span
                    className={`h-px w-2 bg-slate-700 ${childActive ? "bg-cyan-300/70" : ""}`}
                  />
                  {index + 1}.{j + 1} {child.text}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
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
    <div className="focus-panel-scroll h-full overflow-y-auto p-5">
      <PanelHeader no="02" title="TỔNG QUAN" icon={<ShieldCheck size={14} />} />

      <div className="mb-3 flex items-center justify-between">
        <span
          className={`focus-hud-text flex items-center gap-1.5 rounded-full border px-2 py-1 text-[9px] ${
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
        <StatusMetric
          icon={<Eye size={11} />}
          label="LƯỢT XEM"
          value={formatCompact(doc.viewCount)}
        />
        <StatusMetric
          icon={<CircleDot size={11} />}
          label="THẺ"
          value={String(doc.tags.length)}
        />
        <StatusMetric
          icon={<Network size={11} />}
          label="LIÊN QUAN"
          value={String(relatedCount)}
        />
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
    <div className="border border-white/[.055] bg-white/[.018] p-2">
      <div className="focus-hud-text flex items-center gap-1 text-[8px] text-slate-700">
        {icon}
        {label}
      </div>
      <div className="focus-hud-text mt-1 text-[14px] text-slate-200">
        {value}
      </div>
    </div>
  );
}

// "Knowledge Health" - panel DEMO minh hoa (chua co AI backend tinh chi so
// nay that), gan nhan ro trong UI. Duy nhat % nay tinh THAT tu ty le bai da
// xuat ban trong nhom (cung cong thuc voi TechArticleSidebar truoc day).
function KnowledgeHealth({
  doc,
  relatedCount,
}: {
  doc: ApiDocument;
  relatedCount: number;
}) {
  const health =
    relatedCount === 0
      ? doc.isPublished
        ? 100
        : 0
      : Math.min(100, 60 + relatedCount * 7);

  return (
    <button
      type="button"
      className="mt-3 flex w-full cursor-default items-center gap-2 rounded-lg border border-white/[.055] bg-white/[.018] p-2 text-left"
    >
      <div className="relative grid size-11 shrink-0 place-items-center rounded-full border border-cyan-300/25">
        <div className="focus-orbit-spin absolute inset-1 rounded-full border border-transparent border-t-cyan-300/80 border-r-violet-300/40" />
        <span className="focus-hud-text text-[11px] text-cyan-100">
          {health}%
        </span>
      </div>
      <div className="flex-1">
        <div className="focus-hud-text text-[9px] text-slate-600">
          KNOWLEDGE HEALTH · DEMO
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[.05]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${health}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-300"
          />
        </div>
      </div>
    </button>
  );
}

/* ---------------- RELATED ---------------- */

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
    <div className="relative flex h-full min-h-0 flex-col p-5">
      <PanelHeader
        no="03"
        title="MẠNG LƯỚI KIẾN THỨC"
        icon={<Network size={14} />}
      />

      <div className="mb-3">
        <div className="focus-hud-text text-[10px] tracking-[.14em] text-slate-500">
          KNOWLEDGE RELATION MAP
        </div>
        <div className="mt-1 text-[13px] text-slate-300">
          Các bài viết khác trong cùng nhóm kiến thức
        </div>
      </div>

      <div className="tech-grid relative min-h-0 flex-1 overflow-hidden rounded-xl border border-cyan-300/[.08] bg-[#03101a]/45">
        <div className="pointer-events-none absolute top-0 left-1/2 h-full w-px bg-gradient-to-b from-transparent via-cyan-300/10 to-transparent" />
        <div className="pointer-events-none absolute top-1/2 left-0 h-px w-full bg-gradient-to-r from-transparent via-cyan-300/10 to-transparent" />

        <span className="absolute top-1/2 left-1/2 z-30 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-200/55 bg-cyan-300/[.08] text-cyan-100 shadow-[0_0_45px_rgba(40,220,255,.18)]">
          <span className="absolute inset-1.5 rounded-full border border-cyan-300/25" />
          <span className="focus-orbit-spin absolute inset-0 rounded-full border border-dashed border-cyan-300/20" />
          <div className="relative grid size-9 place-items-center rounded-full bg-gradient-to-br from-cyan-200 via-cyan-400 to-blue-500 text-[#03131f] shadow-[0_0_20px_rgba(40,220,255,.55)]">
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
            const angle =
              -Math.PI / 2 + i * ((Math.PI * 2) / satellites.length);
            const x = 50 + Math.cos(angle) * 38;
            const y = 50 + Math.sin(angle) * 34;
            const on = selected === sat.id;
            return (
              <div key={sat.id}>
                <motion.span
                  animate={{ opacity: on ? 1 : 0.38, scaleX: on ? 1 : 0.95 }}
                  className="pointer-events-none absolute top-1/2 left-1/2 h-px origin-left bg-gradient-to-r from-cyan-300/60 to-violet-300/10"
                  style={{
                    width: "38%",
                    transform: `rotate(${(angle * 180) / Math.PI}deg)`,
                  }}
                />
                <div
                  className="absolute"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSelected(on ? null : sat.id)}
                    animate={
                      on
                        ? {
                            boxShadow: "0 0 22px rgba(65,224,255,.38)",
                            borderColor: "rgba(70,224,255,.65)",
                          }
                        : {}
                    }
                    className="relative max-w-[150px] -translate-x-1/2 -translate-y-1/2 truncate border border-cyan-300/15 bg-[#06131f]/95 px-3 py-2 text-left text-[12px] text-slate-300 shadow-[0_8px_22px_rgba(0,0,0,.2)]"
                  >
                    {sat.title}
                  </motion.button>

                  <AnimatePresence>
                    {on && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.8 }}
                        animate={{ opacity: 1, y: 5, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.8 }}
                        className="absolute top-full left-1/2 z-40 -translate-x-1/2"
                      >
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDoc(sat.id);
                          }}
                          className="focus-hud-text flex items-center gap-1.5 rounded-md border border-cyan-300/25 bg-[#06131f] px-2.5 py-1.5 text-[10px] text-cyan-200 shadow-[0_0_16px_rgba(40,220,255,.14)]"
                          title="Mở bài viết"
                        >
                          <ArrowUpRight size={11} /> MỞ BÀI VIẾT
                        </motion.button>
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
        <span className="focus-hud-text text-[10px] text-slate-600">
          <span className="focus-energy-pulse mr-2 inline-block size-1.5 rounded-full bg-cyan-300 shadow-[0_0_9px_rgba(65,224,255,.8)]" />
          {satellites.length + 1} NODES
        </span>
        <span className="focus-hud-text text-[10px] text-slate-700">
          CÙNG NHÓM KIẾN THỨC
        </span>
      </div>
    </div>
  );
}

/* ---------------- PERFORMANCE HUD (demo trang tri, khong co telemetry that) ---------------- */

function PerformanceHUD() {
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((v) => v + 1), 1200);
    return () => window.clearInterval(id);
  }, []);

  const cpu = 31 + ((tick * 7) % 29);
  const gpu = 42 + ((tick * 5) % 24);
  const ram = 58 + ((tick * 3) % 18);

  return (
    <motion.div
      animate={{ width: open ? 250 : 150 }}
      className="focus-hud-text pointer-events-auto fixed right-6 bottom-6 z-[150] overflow-hidden rounded-xl border border-cyan-300/15 bg-[#04111b]/90 shadow-[0_0_30px_rgba(40,210,255,.08)] backdrop-blur-xl"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-full items-center gap-2 px-3 text-left hover:bg-cyan-300/[.035]"
      >
        <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_9px_rgba(65,224,255,.9)]" />
        <span className="text-[7px] tracking-[.15em] text-cyan-100">
          SYSTEM PERFORMANCE
        </span>
        <span className="ml-auto text-[8px] text-slate-600">
          {open ? "−" : "+"}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/[.05] p-3"
          >
            <div className="grid grid-cols-3 gap-2">
              {[
                ["CPU", cpu],
                ["GPU", gpu],
                ["RAM", ram],
              ].map(([name, value]) => (
                <div
                  key={String(name)}
                  className="rounded-lg border border-white/[.05] bg-white/[.018] p-2"
                >
                  <div className="text-[6px] text-slate-700">{name}</div>
                  <div className="mt-1 text-[11px] text-slate-200">
                    {value}%
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[.05]">
                    <motion.div
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.7 }}
                      className="h-full bg-gradient-to-r from-cyan-400 to-violet-400"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between text-[6px] text-slate-700">
              <span>DEMO</span>
              <span>KHÔNG PHẢI SỐ LIỆU THẬT</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PanelHeader({
  no,
  title,
  icon,
}: {
  no: string;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex shrink-0 items-start justify-between border-b border-white/[.055] pb-2.5">
      <div>
        <div className="focus-hud-text flex items-center gap-2 text-[11px] tracking-[.17em] text-cyan-300/65">
          {icon}
          {title}
        </div>
        <div className="focus-hud-text mt-1 text-[10px] text-slate-600">
          MODULE / {no}
        </div>
      </div>
      <span className="focus-hud-text text-[10px] text-slate-600">{no}</span>
    </div>
  );
}
