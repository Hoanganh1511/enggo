"use client";

import { useEffect, useMemo, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEditor, EditorContent } from "@tiptap/react";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
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
// (8) [Upgrade] He kinh + co khi (GlassAssembly/MechanicalAssembly/
//     RightPanelSwitchTargets/CompactGlassModule) duoc port lai tu ban
//     "treecareer-knowledge-ironman-v10-5-verified-motion" (thay ban v6.3 cu
//     o (1)-(7)) - fix chinh: canh tay co khi gio nam TRONG CUNG 1 cay
//     transform voi kinh (khong tu tinh rotateY rieng nhu MechanicalDock cu,
//     tranh lech goc luc kinh nghieng manh), tach outer "layout shell" (chi
//     Framer layout) khoi inner "glass assembly" (chi 3D compositor) de
//     Framer layout va rotateY/scale khong tranh giu 1 transform luc promote/
//     park panel phai, va doi deployment tu spring sang cubic-bezier xac
//     dinh (back-facing rotateY ±86° -> flip -> overscale 104.5% -> settle).
//     CompactGlassModule (the thu gon ben phai) doi tu "chi hien tieu de mo"
//     sang hien so lieu THAT (so muc luc, % health, so bai lien quan) thay vi
//     so demo cua source, tiep tuc dung nguyen tac (1)-(7) o tren.

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

// Dung chung boi KnowledgeHealth (panel Tong quan) va CompactGlassModule (the
// "Tong quan" thu gon) - 1 cong thuc DUY NHAT, tranh 2 noi hien 2 con so khac
// nhau cho cung 1 khai niem "health".
function computeKnowledgeHealth(doc: ApiDocument, relatedCount: number): number {
  return relatedCount === 0
    ? doc.isPublished
      ? 100
      : 0
    : Math.min(100, 60 + relatedCount * 7);
}

// Dung de quy doi "35vw" (chieu rong panel phai luc active) ra so px thuan,
// de RightGlassPanel co the animate width bang cung 1 don vi voi luc compact
// (180px) - xem ghi chu trong GlassAssembly ve viec bo Framer "layout".
function useViewportWidth(): number {
  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1280,
  );
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
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
  const viewportWidth = useViewportWidth();

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

  // So lieu THAT cho CompactGlassModule (the thu gon ben phai) - tiep tuc
  // nguyen tac "khong bia so demo" da ap dung cho StatusPanel/RelatedPanel.
  const flatTocIds = useMemo(() => flattenIds(tocTree), [tocTree]);
  const readProgress =
    flatTocIds.length > 0
      ? Math.round(
          ((flatTocIds.indexOf(activeTocId) + 1) / flatTocIds.length) * 100,
        )
      : 0;
  const relatedCount = siblingDocs.length;
  const health = doc ? computeKnowledgeHealth(doc, relatedCount) : null;
  // 7 = 6 satellite toi da RelatedPanel hien (xem `satellites = siblingDocs.
  // slice(0,6)`) + 1 node trung tam - "day" o day la ty le lap day khung
  // graph dang hien tren man, khong phai 1 chi so tuyet doi bia dat.
  const graphFill = Math.min(100, Math.round(((relatedCount + 1) / 7) * 100));

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

  // Fix: cuon chuot (wheel) khong toi duoc cac vung .focus-panel-scroll khi
  // chung nam sau 2 lop 3D transform long nhau (focus-mechanical-stage +
  // focus-glass-assembly, ca 2 deu co "perspective" + "preserve-3d").
  //
  // Da xac nhan bang console truc tiep tren may nguoi dung: goi
  // document.elementFromPoint(clientX, clientY) khi con tro dang o giua
  // panel KHONG tra ve phan tu noi dung ben trong (khong phai .focus-glass-
  // surface, cang khong phai .focus-panel-scroll) ma tra ve THANG
  // .focus-glass-layout-shell - tuc la co che hit-test theo diem cua trinh
  // duyet dung lai o box NGOAI CUNG, khong "xuyen" duoc vao nhanh con dang
  // bi rotateY (day chinh la ly do wheel native cua trinh duyet cung khong
  // toi duoc .focus-panel-scroll). Vi elementFromPoint tu no da sai o day,
  // moi cach dua vao ket qua cua no (kha ca event.target lan
  // elementFromPoint) deu vo dung bat ke bat wheel o bubble hay capture
  // phase.
  //
  // Thay vi hit-test theo diem, kiem tra hinh hoc TRUC TIEP:
  // getBoundingClientRect() cua 1 phan tu LUON phan anh dung vi tri da
  // render (da tinh moi transform cua no VA cua to tien) bat ke rotateY bao
  // nhieu - khong phu thuoc engine hit-test dang loi o day. Duyet qua tat ca
  // .focus-panel-scroll dang co trong DOM (bai viet + Muc luc/Tong quan/
  // Mang luoi), tim vung co rect chua toa do con tro, roi tu cong don deltaY
  // vao scrollTop cua no.
  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      const scrollers = document.querySelectorAll<HTMLElement>(".focus-panel-scroll");
      for (const el of scrollers) {
        const rect = el.getBoundingClientRect();
        if (
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        ) {
          event.preventDefault();
          el.scrollTop += event.deltaY;
          return;
        }
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () =>
      window.removeEventListener("wheel", onWheel, { capture: true });
  }, []);

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
    // top thay vi inset-0: .focus-mechanical-stage co "perspective" nen no tu
    // tao containing block MOI cho moi con position:fixed ben trong (GlassPanel/
    // RightGlassPanel/backdrop) - moi gia tri top-[%]/h-[vh] cua chung tu do
    // tinh theo KHUNG NAY (khong con la full viewport). Rut ngan dinh khung
    // xuong duoi TopHeaderBar (--header-height) la du de day CA 2 mieng kinh
    // lan backdrop xuong duoi thanh header, khong can sua tung panel rieng.
    <div className="focus-mechanical-stage pointer-events-none fixed inset-x-0 bottom-0 top-[calc(var(--header-height)+14px)] isolate z-999999">
      <FocusBackdrop closing={closing} />
      {/* ScreenEdgeRails (tia + khop co khi tu mep man hinh) da bo - vi tri
          "top: X%" cua rail duoc tinh de khop 1 layout co WorkspaceRail/
          TopBar rieng cua source, khong con dung trong overlay full-viewport
          cua app nay nua nen rail hay cham dung vao giua noi dung panel
          phai, doc khong duoc du hieu ung z-index/isolation nao. */}

      <GlassPanel closing={closing}>
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
        viewportWidth={viewportWidth}
        onActivate={() => setRightActive("outline")}
        title="Mục lục"
        stat={{
          value: String(tocTree.length).padStart(2, "0"),
          unit: "SECTIONS",
          fillPercent: readProgress,
        }}
      >
        <OutlinePanel tree={tocTree} activeId={activeTocId} />
      </RightGlassPanel>

      <RightGlassPanel
        id="status"
        index={1}
        active={rightActive}
        closing={closing}
        viewportWidth={viewportWidth}
        onActivate={() => setRightActive("status")}
        title="Tổng quan"
        stat={{
          value: health === null ? "—" : `${health}%`,
          unit: "HEALTH",
          fillPercent: health ?? 0,
        }}
      >
        <StatusPanel doc={doc} relatedCount={relatedCount} />
      </RightGlassPanel>

      <RightGlassPanel
        id="related"
        index={2}
        active={rightActive}
        closing={closing}
        viewportWidth={viewportWidth}
        onActivate={() => setRightActive("related")}
        title="Mạng lưới kiến thức"
        stat={{
          value: String(relatedCount + 1).padStart(2, "0"),
          unit: "NODES",
          fillPercent: graphFill,
        }}
      >
        <RelatedPanel
          doc={doc}
          siblingDocs={siblingDocs}
          onOpenDoc={onOpenDoc}
        />
      </RightGlassPanel>

      <RightPanelSwitchTargets active={rightActive} onActivate={setRightActive} />

      <motion.button
        type="button"
        onClick={handleClose}
        whileHover={{ scale: 1.02, borderColor: "rgba(65,224,255,.45)" }}
        whileTap={{ scale: 0.97 }}
        className="focus-hud-text pointer-events-auto fixed top-3 right-5 z-[155] flex items-center gap-2 rounded-lg border border-cyan-300/15 bg-[#04121d]/90 px-3 py-2 text-[8px] tracking-[.14em] text-slate-500 shadow-[0_0_22px_rgba(40,220,255,.08)] backdrop-blur-xl hover:text-cyan-100"
      >
        <ArrowLeft size={11} /> THOÁT FOCUS
      </motion.button>

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

/* ---------------- BACKDROP ---------------- */

function FocusBackdrop({ closing }: { closing: boolean }) {
  const ease = [0.22, 1, 0.36, 1] as const;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: closing ? 0 : 1 }}
      transition={{
        duration: closing ? 0.14 : 0.42,
        ease: closing ? "easeOut" : ease,
      }}
      className="pointer-events-none fixed inset-0 z-[60] bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,8,17,.12)_38%,rgba(0,5,10,.32)_100%)]"
    >
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: closing ? 0 : 1, opacity: closing ? 0 : 1 }}
        transition={{ duration: closing ? 0.1 : 0.45, ease }}
        className="absolute top-1/2 left-1/2 h-px w-[92vw] -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-300/45 to-transparent"
      />
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: closing ? 0 : 1, opacity: closing ? 0 : 1 }}
        transition={{ duration: closing ? 0.1 : 0.52, delay: closing ? 0 : 0.02, ease }}
        className="absolute top-1/2 left-1/2 h-[90vh] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-cyan-300/55 to-transparent shadow-[0_0_15px_rgba(64,224,255,.6)]"
      />
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: closing ? 0.92 : 1, opacity: closing ? 0 : 1 }}
        transition={{ duration: closing ? 0.12 : 0.58, delay: closing ? 0 : 0.06, ease }}
        className="absolute top-1/2 left-1/2 size-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/[.14] shadow-[0_0_50px_rgba(35,214,255,.08)]"
      />
    </motion.div>
  );
}

/* ---------------- MECHANICAL ARMS ---------------- */
// V10.5: canh tay co khi nam TRONG CUNG 1 cay transform voi kinh
// (xem GlassAssembly ben duoi) - no CHI khop noi vat ly quanh cac hinge,
// KHONG tu tinh rotateY rieng nhu MechanicalDock/Hinge cu (do la nguyen
// nhan canh tay/pivot bi lech goc voi mep kinh luc kinh nghieng manh).

function MechanicalAssembly({
  side,
  compact = false,
  active = true,
}: {
  side: "left" | "right";
  compact?: boolean;
  active?: boolean;
}) {
  const left = side === "left";
  const length = compact ? 82 : active ? 138 : 108;
  const secondLength = compact ? 46 : active ? 72 : 58;
  const elbowAngle = left ? -12 : 12;
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <div
      className={`focus-mechanical-assembly ${left ? "focus-mechanical-assembly-left" : "focus-mechanical-assembly-right"}`}
      style={{
        width: compact ? 154 : 238,
        height: 104,
        ...(left ? { right: "100%" } : { left: "100%" }),
        top: "50%",
        transform: `translateY(-50%) ${left ? "scaleX(-1)" : ""}`,
        transformOrigin: left ? "right center" : "left center",
      }}
      aria-hidden="true"
    >
      <div className="focus-mechanical-anchor absolute left-0 top-1/2">
        <span className="focus-mechanical-collar" />
        <span className="focus-mechanical-pivot focus-mechanical-pivot-large" />
      </div>

      <motion.div
        className="focus-mechanical-link absolute left-[18px] top-1/2"
        style={{ width: length, transformOrigin: "left center" }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, width: length, opacity: active ? 1 : 0.72 }}
        transition={{ duration: 0.42, delay: 0.035, ease }}
      >
        <span className="focus-mechanical-beam" />
        <span className="focus-mechanical-screw focus-mechanical-screw-a" />
        <span className="focus-mechanical-screw focus-mechanical-screw-b" />
      </motion.div>

      {/* Elbow neo dung tai diem cuoi cua doan A - con no ke thua rotate cua
          no nen pivot cuoi khong the troi khoi beam. */}
      <motion.div
        className="absolute left-[18px] top-1/2"
        style={{ width: length, height: 1, transformOrigin: "left center" }}
      >
        <motion.div
          className="focus-mechanical-elbow absolute left-full top-0"
          style={{ width: secondLength, transformOrigin: "left center", rotate: elbowAngle }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, width: secondLength, opacity: active ? 1 : 0.68 }}
          transition={{ duration: 0.38, delay: 0.065, ease }}
        >
          <span className="focus-mechanical-beam focus-mechanical-beam-secondary" />
          <span className="focus-mechanical-screw focus-mechanical-screw-a" />
          <span className="focus-mechanical-screw focus-mechanical-screw-b" />
          <span className="focus-mechanical-pivot focus-mechanical-pivot-small focus-mechanical-pivot-end" />
        </motion.div>
      </motion.div>

      {/* Hinge dung tai diem cuoi doan A. */}
      <motion.span
        className="focus-mechanical-pivot focus-mechanical-pivot-small focus-mechanical-pivot-mid"
        style={{ left: 18 + length - 4 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: active ? 1 : 0.7 }}
        transition={{ duration: 0.26, delay: 0.085, ease }}
      />

      <motion.span
        className="focus-mechanical-actuator"
        style={{ left: 28, width: Math.max(62, length - 28), transformOrigin: "left center" }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{
          scaleX: 1,
          width: Math.max(62, length - 28),
          opacity: active ? 0.85 : 0.48,
        }}
        transition={{ duration: 0.42, delay: 0.045, ease }}
      />
    </div>
  );
}

/* ---------------- GLASS DEPLOYMENT ---------------- */
// GlassAssembly: OUTER motion.div chi so huu layout geometry (frame + Framer
// `layout`), INNER motion.div chi so huu 3D compositor transform (back-face
// -> flip -> overscale -> settle). Tach lam 2 lop de Framer layout (chay khi
// promote/park panel phai) va rotateY/scale (chay khi trien khai/dong) khong
// tranh giu chung 1 transform - day la nguyen nhan chinh gay giat/jump o ban
// cu (RightGlassPanel dieu huong top/right/width/height CUNG mot luc voi
// rotateY/rotateX/rotateZ/scale tren CUNG 1 motion.section).

function GlassAssembly({
  side,
  closing,
  delay = 0,
  frame,
  children,
  active = true,
  compact = false,
  onClick,
}: {
  side: "left" | "right";
  closing: boolean;
  delay?: number;
  frame: {
    top: string;
    left?: string;
    right?: string;
    width: string | number;
    height: string;
  };
  children: React.ReactNode;
  active?: boolean;
  compact?: boolean;
  onClick?: () => void;
}) {
  const left = side === "left";
  const hiddenX = left ? "-112vw" : "112vw";
  const restingRotateY = left ? 11 : -11;
  const parkedRotateY = left ? 17 : -17;
  const parkedRotateZ = left ? -1.2 : 1.2;
  const activeRotateZ = left ? -1.1 : 0.8;
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    // Khong dung Framer "layout" o day (V10.5 goc dung "layout" de dieu
    // huong frame doi tren panel phai) - da xac nhan qua console tren may
    // nguoi dung rang khi mot phan tu dung "layout", elementFromPoint()
    // (co che hit-test cua CHINH trinh duyet) khong xuyen duoc vao nhanh
    // con dang bi rotateY nua, lam hover/click bi mat hoan toan ben trong
    // panel do. Dung animate={frame} thuan (khong "layout") thay the -
    // van giu dung 0.58s/ease nhu source, chi khac o cho khong con tao
    // lop compositing/theo doi rieng cua co che layout-projection nua.
    // Doi hoi frame.width la SO PX thuan (khong con chuoi "vw"/"px" lan
    // lon) o noi goi RightGlassPanel, vi Framer animate thuan khong tu quy
    // doi don vi khac nhau (đo la viec "layout" lam, gio khong con dung no
    // nua) - xem RightGlassPanel.
    <motion.div
      initial={false}
      animate={{ ...frame }}
      style={{
        position: "fixed",
        zIndex: active ? 118 : 100,
        opacity: closing ? 0 : 1,
        pointerEvents: closing ? "none" : "auto",
      }}
      transition={{ duration: 0.58, ease }}
      className="focus-glass-layout-shell"
    >
      <motion.div
        initial={{
          x: hiddenX,
          opacity: 0,
          scale: 0.84,
          rotateY: left ? 86 : -86,
          rotateX: 0,
          rotateZ: compact ? parkedRotateZ : activeRotateZ,
        }}
        animate={{
          x: closing ? hiddenX : 0,
          opacity: closing ? 0 : 1,
          scale: closing ? 0.92 : 1,
          rotateY: closing ? (left ? 86 : -86) : compact ? parkedRotateY : restingRotateY,
          rotateX: 0,
          rotateZ: closing ? (left ? -1.1 : 0.8) : compact ? parkedRotateZ : activeRotateZ,
        }}
        transition={{
          x: { duration: closing ? 0.58 : 0.7, delay: closing ? 0 : delay, ease },
          rotateY: { duration: closing ? 0.34 : 0.44, delay: closing ? 0 : delay + 0.2, ease },
          rotateZ: { duration: closing ? 0.3 : 0.34, delay: closing ? 0 : delay + 0.18, ease },
          scale: { duration: closing ? 0.3 : 0.4, delay: closing ? 0 : delay + 0.2, ease },
          opacity: { duration: closing ? 0.18 : 0.34, delay: closing ? 0 : delay + 0.02, ease: "easeOut" },
        }}
        style={{
          width: "100%",
          height: "100%",
          transformOrigin: left ? "left center" : "right center",
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          willChange: "transform, opacity",
          contain: "layout style",
        }}
        className="focus-glass-assembly focus-motion-optimized"
        onClick={compact ? onClick : undefined}
      >
        <MechanicalAssembly side={side} active={active} compact={compact} />
        <div className="focus-glass focus-tech-cut focus-glass-surface absolute inset-0 overflow-hidden">
          <span className={left ? "focus-panel-glow-left" : "focus-panel-glow-right"} />
          <span className="focus-panel-scan" />
          <div className="focus-panel-depth-edge" />
          <div className="relative z-[20] h-full min-h-0 overflow-hidden">{children}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function GlassPanel({
  closing,
  children,
}: {
  closing: boolean;
  children: React.ReactNode;
}) {
  return (
    <GlassAssembly
      side="left"
      closing={closing}
      delay={0.03}
      frame={{ top: "6.5%", left: "2.6%", width: "47.2vw", height: "85vh" }}
      active
    >
      {children}
    </GlassAssembly>
  );
}

// Lop hit-zone rieng, dat TREN CUNG (z-[170]) va phu toan bo vi tri cua 2
// panel phai dang thu gon - dam bao chung luon bam duoc du panel active lon
// (stacking context bi bien doi 3D rieng) co the "nuot" pointer event cua
// panel thu gon o vien duoi cung.
function RightPanelSwitchTargets({
  active,
  onActivate,
}: {
  active: RightModule;
  onActivate: (id: RightModule) => void;
}) {
  const ids = ["outline", "status", "related"] as const;
  const parked = ids.filter((id) => id !== active);
  return (
    <div className="pointer-events-none fixed inset-0 z-[170]" aria-label="Chuyển màn kính">
      {parked.map((id, index) => (
        <button
          key={id}
          type="button"
          aria-label={`Mở ${id}`}
          onPointerDown={(e) => {
            e.stopPropagation();
            onActivate(id);
          }}
          onClick={(e) => {
            e.stopPropagation();
            onActivate(id);
          }}
          className="pointer-events-auto absolute right-[1.8%] w-[180px] cursor-pointer rounded-[14px] border border-transparent bg-transparent"
          style={{ top: index === 0 ? "10%" : "51%", height: "31vh" }}
        />
      ))}
    </div>
  );
}

function RightGlassPanel({
  id,
  index,
  active,
  closing,
  onActivate,
  title,
  stat,
  viewportWidth,
  children,
}: {
  id: RightModule;
  index: number;
  closing: boolean;
  active: RightModule;
  onActivate: () => void;
  title: string;
  stat: { value: string; unit: string; fillPercent: number };
  viewportWidth: number;
  children: React.ReactNode;
}) {
  const isActive = active === id;
  const inactiveIds = (["outline", "status", "related"] as const).filter(
    (item) => item !== active,
  );
  const compactIndex = Math.max(0, inactiveIds.indexOf(id));

  // width tinh ra SO PX thuan (thay vi chuoi "35vw"/"180px" lan don vi) -
  // GlassAssembly khong con dung Framer "layout" nua nen can top/right/
  // width/height cung 1 kieu don vi de animate thuan (khong "layout") noi
  // suy dung; 35vw == 0.35 * viewportWidth ve mat gia tri nen doi don vi
  // khong lam sai kich thuoc thuc te.
  const frame = isActive
    ? {
        top: "9%",
        right: "13.6%",
        width: Math.round(viewportWidth * 0.35),
        height: "78vh",
      }
    : {
        top: compactIndex === 0 ? "10%" : "51%",
        right: "1.8%",
        width: 180,
        height: "31vh",
      };

  return (
    <GlassAssembly
      side="right"
      closing={closing}
      delay={0.06 + index * 0.025}
      frame={frame}
      active={isActive}
      compact={!isActive}
      onClick={onActivate}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onActivate();
        }}
        className={`focus-hud-text absolute top-3 right-4 z-[50] rounded border px-2.5 py-1.5 text-[8px] tracking-[.12em] transition-colors ${
          isActive
            ? "border-cyan-300/30 bg-cyan-300/[.07] text-cyan-100 shadow-[0_0_18px_rgba(45,220,255,.10)]"
            : "border-white/[.09] bg-black/20 text-slate-500 hover:border-cyan-300/25 hover:text-cyan-200"
        }`}
      >
        {isActive ? "ACTIVE" : "MỞ"}
      </button>

      <AnimatePresence initial={false} mode="wait">
        {isActive ? (
          <motion.div
            key={`full-${id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full min-h-0"
          >
            {children}
          </motion.div>
        ) : (
          <motion.div
            key={`compact-${id}`}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="h-full min-h-0"
          >
            <CompactGlassModule id={id} title={title} stat={stat} />
          </motion.div>
        )}
      </AnimatePresence>
    </GlassAssembly>
  );
}

// The thu gon ben phai - hien so lieu THAT (do ArticleFocusOverlay tinh tu
// doc/toc/siblingDocs) thay vi so demo cua source, tiep tuc nguyen tac
// "khong bia du lieu gia" da ap dung cho StatusPanel/RelatedPanel.
function CompactGlassModule({
  id,
  title,
  stat,
}: {
  id: RightModule;
  title: string;
  stat: { value: string; unit: string; fillPercent: number };
}) {
  const config = {
    outline: { code: "01", kicker: "NAVIGATION", Icon: ListTree, hint: "NHẤN ĐỂ MỞ MỤC LỤC" },
    status: { code: "02", kicker: "ARTICLE STATE", Icon: ShieldCheck, hint: "ĐỒNG BỘ TRỰC TIẾP" },
    related: { code: "03", kicker: "KNOWLEDGE GRAPH", Icon: Network, hint: "MẠNG LƯỚI KIẾN THỨC" },
  }[id];
  const Icon = config.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative flex h-full min-h-0 flex-col justify-between p-3.5"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className="grid size-8 place-items-center rounded-lg border border-cyan-300/15 bg-cyan-300/[.045] text-cyan-200">
            <Icon size={14} />
          </span>
          <span className="focus-hud-text text-[7px] tracking-[.14em] text-slate-700">
            MODULE / {config.code}
          </span>
        </div>

        <div className="mt-4 focus-hud-text text-[6px] tracking-[.16em] text-cyan-300/55">
          {config.kicker}
        </div>
        <div className="mt-1 text-[10px] font-semibold tracking-[.08em] text-slate-300">
          {title.toUpperCase()}
        </div>
      </div>

      <div>
        <div className="flex items-end justify-between border-t border-white/[.06] pt-3">
          <div>
            <div className="text-[19px] font-semibold leading-none text-slate-200">
              {stat.value}
            </div>
            <div className="mt-1 focus-hud-text text-[6px] tracking-[.13em] text-slate-700">
              {stat.unit}
            </div>
          </div>
          <span className="grid size-6 place-items-center rounded-full border border-cyan-300/15 text-cyan-300/60">
            <ChevronRight size={11} />
          </span>
        </div>

        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[.05]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stat.fillPercent}%` }}
            transition={{ delay: 0.18, duration: 0.7, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-cyan-300/80 via-cyan-300/45 to-violet-400/65"
          />
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(65,224,255,.8)]" />
          <span className="focus-hud-text truncate text-[6px] tracking-[.1em] text-slate-600">
            {config.hint}
          </span>
        </div>
      </div>
    </motion.div>
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
          <div className="pl-1">
            {tree.map((node, i) => (
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

// De quy theo do sau THAT cua heading (h1>h2>h3>h4, khong gioi han 2 cap
// cung nhu ban cu) - moi cap sau chi lui indent + thu nho kieu chu, dung
// chung 1 component thay vi phai viet rieng "hang cha/hang con" nhu truoc.
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
        className={`group relative flex w-full items-center gap-3 rounded-md py-2.5 pr-2 text-left ${isActive ? "bg-cyan-300/[.055]" : "hover:bg-white/[.02]"}`}
      >
        {isTop ? (
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
        ) : (
          <span
            className={`h-px w-2 shrink-0 ${isActive ? "bg-cyan-300/70" : "bg-slate-700"}`}
          />
        )}
        <span
          className={`min-w-0 flex-1 truncate text-left ${isTop ? "text-[13px]" : "text-[12px]"} ${
            isActive ? "font-medium text-cyan-100" : "text-slate-600 group-hover:text-slate-300"
          }`}
        >
          {isTop ? `${index + 1}. ${node.text}` : node.text}
        </span>
        {hasChildren && isTop && (
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
  const health = computeKnowledgeHealth(doc, relatedCount);

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
