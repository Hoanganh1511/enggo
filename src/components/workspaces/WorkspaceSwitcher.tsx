"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  FileText,
  Folder,
  Globe,
  List,
  LoaderCircle,
  Lock,
  Network,
  Pin,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";
import type {
  ApiDocumentSummary,
  ApiKnowledgeGroup,
  ApiWorkspaceWithGroups,
} from "@/lib/api/types";
import { getWorkspaceGroupsAction } from "@/actions/knowledge-groups/get-workspace-groups";
import { getGroupDocumentsAction } from "@/actions/knowledge-groups/get-group-documents";
import { useRipple } from "@/components/ui/ripple";
import { CreateWorkspaceButton } from "./CreateWorkspaceButton";
import { CreateWorkspaceModal } from "./CreateWorkspaceModal";
import { useWorkspaceToolbar } from "./workspace-toolbar-context";
import { CreateGroupButton } from "./CreateGroupButton";
import { PostEditorModal } from "./PostEditorModal";
import { RequestCollabButton } from "./RequestCollabButton";
import { KnowledgeGroupCollabRequestsPanel } from "./KnowledgeGroupCollabRequestsPanel";

// Toan bo giao dien trang nay bê nguyên UI/UX tu source rieng
// "knowledge-workspace-react" (Topbar + sidebar + "Knowledge Map" dang quy
// dao + Details panel), nhung dung TOKEN CSS (var(--...) tu globals.css)
// thay vi hardcode hex - tu dong doi theo theme he thong (light "Cloud" /
// dark "Nebula"). Khac source o cho MOI so lieu deu la DU LIEU THAT: node
// quy dao = Document/bai viet that trong 1 KnowledgeGroup, khong co % tien
// do gia, gio hoc tuan, sparkline, hay activity feed.
//
// TOAN BO tab nay (moi phase: chon workspace LAN "Knowledge Map") la 1 man
// "vu tru" CHIEM FULL VIEWPORT duoi header - component nay duoc render boi 1
// route DOC LAP (/workspace/[username], xem page.tsx cung thu muc), KHONG
// nam duoi u/[username]/layout.tsx nen tu no da khong co cover/user-info/
// ProfileNav bao quanh, khong can co che "focus" nao nua.

// Bang mau accent theo-tung-item (hash tu id) - GIU HARDCODE co chu dich,
// giong nhom "Knowledge category colors" trong spec: can vivid/on-brand va
// KHONG doi theo theme (khac voi text/border/surface phai theo token).
const NODE_COLORS = [
  "#8c6cff",
  "#31d9d1",
  "#f5a442",
  "#54d28d",
  "#b676ff",
  "#f0b542",
  "#34c7d8",
  "#5b9cff",
];
function colorOf(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % 997;
  return NODE_COLORS[h % NODE_COLORS.length];
}

// The workspace o man chon dau tien - tach thanh component rieng (thay vi
// inline trong .map()) vi useRipple() la 1 hook, khong the goi ben trong
// vong lap/callback. Hover nhe (nang len + vien ngat sang mau accent rieng
// cua workspace) + click nay ra hieu ung "giot nuoc" (useRipple) DUNG CHUNG
// voi CreateWorkspaceButton - 2 loai the trong cung luoi chon workspace nen
// phai cung 1 kieu tuong tac. isLoading (rieng workspace vua bam) hien
// spinner de nguoi dung biet dang cho load nhom kien thuc.
//
// Luc thoat (isExiting): thay vi chi mo dan-di-len nhu truoc, tat ca the
// (ke ca CreateWorkspaceButton) bi "hut" ve dung tam luoi - toa do pullOffset
// duoc WorkspaceSwitcher do bang getBoundingClientRect() ngay khi bat dau
// exiting (xem effect o ngoai) roi truyen xuong, nen the o BAT KY vi tri nao
// trong luoi (dau, cuoi, hang duoi) deu hoi tu chinh xac ve 1 diem duy nhat -
// hieu ung "ho den" that su chu khong phai uoc luong.
function WorkspaceCard({
  ws,
  index,
  isExiting,
  isLoading,
  pullOffset,
  cardRef,
  onSelect,
}: {
  ws: ApiWorkspaceWithGroups;
  index: number;
  isExiting: boolean;
  isLoading: boolean;
  pullOffset?: { x: number; y: number };
  cardRef: (el: HTMLButtonElement | null) => void;
  onSelect: () => void;
}) {
  const accent = ws.color ?? "var(--primary)";
  const { onPointerDown, rippleLayer } = useRipple(accent);

  return (
    <motion.button
      ref={cardRef}
      type="button"
      onClick={onSelect}
      onPointerDown={onPointerDown}
      initial={{ opacity: 0, y: 8 }}
      animate={
        !isExiting
          ? {
              opacity: 1,
              y: 0,
              scale: 1,
              rotate: 0,
              transition: { delay: index * 0.05, duration: 0.15, ease: "easeOut" },
            }
          : {
              opacity: 0,
              scale: 0.05,
              x: pullOffset?.x ?? 0,
              y: pullOffset?.y ?? 0,
              rotate: index % 2 === 0 ? 50 : -50,
              transition: {
                delay: index * 0.03,
                duration: 0.5,
                ease: [0.55, 0, 1, 0.45],
              },
            }
      }
      whileHover={{
        y: -3,
        borderColor: accent,
        boxShadow: `0 10px 30px color-mix(in srgb, ${accent} 18%, transparent)`,
        transition: { duration: 0.18, ease: "easeOut" },
      }}
      className="relative flex min-h-32 flex-col items-start gap-2 overflow-hidden rounded-2xl p-4 text-left backdrop-blur-sm"
      style={{
        background: "color-mix(in srgb, var(--surface) 88%, transparent)",
        border: "1px solid var(--border)",
      }}
    >
      {rippleLayer}
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-lg"
        style={{
          backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`,
          color: accent,
        }}
      >
        {ws.icon ?? "📁"}
      </span>
      <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
        {ws.name}
      </span>
      {ws.description && (
        <span className="line-clamp-2 text-xs" style={{ color: "var(--ink-faint)" }}>
          {ws.description}
        </span>
      )}
      <span className="mt-auto text-[11px]" style={{ color: "var(--ink-faint)" }}>
        {ws.groups.length} nhóm kiến thức
      </span>

      {isLoading && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center backdrop-blur-sm"
          style={{ background: "color-mix(in srgb, var(--surface) 65%, transparent)" }}
        >
          <LoaderCircle
            size={20}
            strokeWidth={1.9}
            className="animate-spin"
            style={{ color: accent }}
          />
        </motion.span>
      )}
    </motion.button>
  );
}

type Phase = "list" | "exiting" | "workspace";
const MAX_MAP_NODES = 10;

// Chuyen doi giua cac nhom kien thuc (sidebar): noi dung CU thu nho vao tam
// va mo dan, noi dung MOI (ke ca trang thai loading trong luc cho
// getGroupDocumentsAction) tu tam phinh to ra kem nay nhe (spring hoi
// overshoot) - dung CHUNG 1 bo variant cho moi mat xich (empty -> loading ->
// ready) de ca chuoi chuyen dong nhat quan.
const stageVariants = {
  initial: { opacity: 0, scale: 0.4 },
  animate: {
    opacity: 1,
    scale: 1,
    // damping 17 -> 22: bot floaty/wobble luc "ha canh", rut ngan thoi gian
    // settle that su (khong doi stiffness de giu nguyen do "phinh to" nhanh
    // luc bat dau).
    transition: { type: "spring", stiffness: 300, damping: 22 },
  },
  exit: {
    opacity: 0,
    scale: 0.4,
    transition: { duration: 0.18, ease: "easeIn" },
  },
} as const;

// Sidebar trai (danh sach Knowledge Group) truot vao tu ngoai le man hinh -
// dung CHUNG 1 spring voi DetailsPanel (aside phai, xem PANEL_SPRING) de 2
// ben "ha canh" dong toc do, chi doi chieu x.
const PANEL_SPRING = {
  type: "spring",
  stiffness: 420,
  damping: 32,
  mass: 0.65,
} as const;

const sidebarVariants: Variants = {
  hidden: { x: -260, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: PANEL_SPRING,
  },
};

// Tung nhom kien thuc trong sidebar "tha rem" xuong theo thu tu (stagger
// theo index), mo dan tu mo blur - dong bo phong cach voi toolVariants cua
// ControlCenterReactor. Mau sac tung item da khac nhau qua colorOf(g.id) nen
// hieu ung tha lan luot tu nhien tao cam giac "rem cau vong".
const groupItemVariants: Variants = {
  hidden: { opacity: 0, y: -18, scale: 0.92, filter: "blur(4px)" },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 380,
      damping: 24,
      delay: 0.12 + index * 0.06,
    },
  }),
};

export function WorkspaceSwitcher({
  workspaces,
  username,
  isSelf,
}: {
  workspaces: ApiWorkspaceWithGroups[];
  username: string;
  isSelf: boolean;
}) {
  const [phase, setPhase] = useState<Phase>("list");
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<ApiWorkspaceWithGroups | null>(null);
  const [groups, setGroups] = useState<ApiKnowledgeGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupDocs, setGroupDocs] = useState<ApiDocumentSummary[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [view, setView] = useState<"map" | "list">("map");
  const [isPending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  // "Tao workspace" khong con la 1 nut rieng - dang ky lam 1 tool trong
  // ControlCenterReactor (o layout.tsx, boc NGOAI component nay) qua context,
  // vi la nguoi CHU trang (isSelf) moi thay tool nay. CreateWorkspaceModal
  // dung chung voi CreateWorkspaceButton (nut CTA khi man con rong).
  const { registerTool } = useWorkspaceToolbar();
  useEffect(() => {
    if (!isSelf) return;
    registerTool({
      id: "create-workspace",
      label: "Tạo workspace",
      icon: Plus,
      tone: "cyan",
      onClick: () => setCreateOpen(true),
    });
    return () => registerTool(null);
  }, [isSelf, registerTool]);
  // Choreography luc vao 1 workspace: DetailsPanel (aside phai) truot vao tu
  // ngoai le man hinh, CHI SAU KHI no "ha canh" xong (onAnimationComplete)
  // moi cho stage giua hien cac hieu ung loading/zoom co san - tranh cam
  // giac moi thu bung ra cung luc, tao cam giac lap ghep tuan tu kieu
  // transformer. False = dang cho panel on dinh; true = cho stage bat dau
  // hien noi dung.
  const [panelsReady, setPanelsReady] = useState(false);

  // "Ho den" luc thoat man chon workspace: gridRef la luoi chua tat ca the
  // workspace, cardEls gom tham chieu DOM cua tung the (key = ws.id) - do
  // bang getBoundingClientRect() NGAY khi chuyen sang "exiting" (truoc khi
  // browser kip ve frame moi, xem useLayoutEffect ben duoi) de tinh do lech
  // tu tam moi the toi tam luoi, roi luu vao pullOffsets truyen xuong cho
  // WorkspaceCard lam diem den cua animate x/y - nho vay the o bat ky vi tri
  // nao (dau, cuoi, hang duoi cung) deu hoi tu dung 1 diem duy nhat thay vi
  // chi mo dan tai cho.
  const gridRef = useRef<HTMLDivElement | null>(null);
  const cardEls = useRef<Map<string, HTMLElement>>(new Map());
  const [pullOffsets, setPullOffsets] = useState<
    Record<string, { x: number; y: number }>
  >({});

  function registerCardEl(key: string, el: HTMLElement | null) {
    if (el) cardEls.current.set(key, el);
    else cardEls.current.delete(key);
  }

  useLayoutEffect(() => {
    if (phase !== "exiting" || !gridRef.current) return;
    const gridRect = gridRef.current.getBoundingClientRect();
    const centerX = gridRect.left + gridRect.width / 2;
    const centerY = gridRect.top + gridRect.height / 2;
    const next: Record<string, { x: number; y: number }> = {};
    cardEls.current.forEach((el, key) => {
      const r = el.getBoundingClientRect();
      next[key] = {
        x: centerX - (r.left + r.width / 2),
        y: centerY - (r.top + r.height / 2),
      };
    });
    setPullOffsets(next);
  }, [phase]);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? null;
  const selectedDoc = groupDocs.find((d) => d.id === selectedDocId) ?? null;

  function loadGroupDocs(g: ApiKnowledgeGroup) {
    setGroupDocs([]);
    setSelectedDocId(null);
    if (g.viewerCanWrite || g.visibility === "PUBLIC") {
      startTransition(async () => {
        setGroupDocs(await getGroupDocumentsAction(g.id));
      });
    }
  }

  function selectWorkspace(ws: ApiWorkspaceWithGroups) {
    if (phase !== "list") return;
    setSelectedWorkspace(ws);
    setGroups(ws.groups);
    setPhase("exiting");
    setPanelsReady(false);
    const totalExitMs = Math.max(450, workspaces.length * 40 + 150);
    setTimeout(() => {
      setPhase("workspace");
      startTransition(async () => {
        const fresh = await getWorkspaceGroupsAction(ws.id);
        setGroups(fresh);
        if (fresh.length > 0) {
          setSelectedGroupId(fresh[0].id);
          loadGroupDocs(fresh[0]);
        } else {
          // Khong co nhom nao -> khong co DetailsPanel de truot vao/bao
          // "da on dinh", tu mo khoa luon cho stage (se hien trang thai
          // "Chon 1 nhom kien thuc ben trai").
          setPanelsReady(true);
        }
      });
    }, totalExitMs);
  }

  function selectGroup(g: ApiKnowledgeGroup) {
    setSelectedGroupId(g.id);
    loadGroupDocs(g);
  }

  function backToList() {
    setSelectedWorkspace(null);
    setGroups([]);
    setSelectedGroupId(null);
    setGroupDocs([]);
    setSelectedDocId(null);
    setPanelsReady(false);
    setPhase("list");
  }

  return (
    // Khong con dat background/CosmicBackdrop rieng o day - nen "deep space"
    // (StarfieldBackground) gio nam o workspace/[username]/layout.tsx, phia
    // SAU component nay (z-0), nen de trong suot cho no hien qua.
    <div className="relative flex size-full flex-col overflow-hidden">
      {isSelf && (
        <CreateWorkspaceModal
          open={createOpen}
          onOpenChange={setCreateOpen}
          username={username}
        />
      )}
      {(phase === "list" || phase === "exiting") && (
        <div className="relative z-10 flex h-full flex-col items-center overflow-y-auto px-6 py-12">
          <div className="mb-9 mt-auto text-center">
            <h1
              className="text-2xl font-bold sm:text-3xl"
              style={{ color: "var(--ink)" }}
            >
              Workspace của {isSelf ? "bạn" : `@${username}`}
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--ink-faint)" }}>
              Mỗi workspace là 1 vùng kiến thức riêng - chọn 1 cái để bước vào.
            </p>
          </div>

          {workspaces.length === 0 ? (
            isSelf ? (
              <div className="mb-auto w-full max-w-xs">
                <CreateWorkspaceButton username={username} />
              </div>
            ) : (
              <p
                className="mb-auto text-sm"
                style={{ color: "var(--ink-faint)" }}
              >
                Người dùng này chưa có workspace nào.
              </p>
            )
          ) : (
            <div
              ref={gridRef}
              className="mb-auto grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {workspaces.map((ws, i) => (
                <WorkspaceCard
                  key={ws.id}
                  ws={ws}
                  index={i}
                  isExiting={phase !== "list"}
                  isLoading={phase === "exiting" && selectedWorkspace?.id === ws.id}
                  pullOffset={pullOffsets[ws.id]}
                  cardRef={(el) => registerCardEl(ws.id, el)}
                  onSelect={() => selectWorkspace(ws)}
                />
              ))}
            </div>
          )}
          <div className="mb-auto" />
        </div>
      )}

      {phase === "workspace" && selectedWorkspace && (
        <motion.div
          key={`workspace-${selectedWorkspace.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="relative z-10 flex h-full flex-col"
        >
          <div className="flex min-h-0 flex-1">
            {/* Sidebar - ten workspace + danh sach Knowledge Group, TU no
                choan het chieu cao (giong source knowledge-workspace-react-
                radial-toolbars: heading "WORKSPACE" + ten nam trong sidebar,
                khong phai trong toolbar cua main display). */}
            <motion.aside
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              className="flex w-[250px] shrink-0 flex-col overflow-y-auto"
              style={{ borderRight: "1px solid var(--border)" }}
            >
              <div
                className="shrink-0 px-3 py-3"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <span
                  className="text-[9px] font-bold tracking-wide"
                  style={{ color: "var(--ink-faint)" }}
                >
                  WORKSPACE
                </span>
                <h2
                  className="mt-0.5 truncate text-sm font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  {selectedWorkspace.name}
                </h2>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto p-3">
                {groups.map((g, index) => {
                  const active = g.id === selectedGroupId;
                  return (
                    <motion.button
                      key={g.id}
                      layout
                      custom={index}
                      variants={groupItemVariants}
                      initial="hidden"
                      animate="visible"
                      type="button"
                      onClick={() => selectGroup(g)}
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.985 }}
                      className="flex items-center gap-2.5 rounded-[11px] p-2.5 text-left transition-colors duration-150 ease-out"
                      style={
                        active
                          ? {
                              background:
                                "linear-gradient(100deg, var(--active-bg-strong), var(--surface))",
                              border: "1px solid var(--active-border)",
                              boxShadow: "inset 2px 0 var(--primary)",
                            }
                          : { border: "1px solid transparent" }
                      }
                    >
                      <span
                        className="flex size-8 shrink-0 items-center justify-center rounded-[9px]"
                        style={{
                          color: colorOf(g.id),
                          background: `color-mix(in srgb, ${colorOf(g.id)} 12%, transparent)`,
                        }}
                      >
                        <Folder size={15} strokeWidth={1.9} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className="block truncate text-[11px] font-semibold"
                          style={{ color: "var(--ink)" }}
                        >
                          {g.name}
                        </span>
                        <span
                          className="mt-0.5 flex items-center gap-1 text-[9px]"
                          style={{ color: "var(--ink-faint)" }}
                        >
                          {g.visibility === "PRIVATE" ? (
                            <Lock size={9} />
                          ) : (
                            <Globe size={9} />
                          )}
                          {g.postCount} bài viết
                        </span>
                      </span>
                      {g.pendingRequests.length > 0 && (
                        <span
                          className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                          style={{
                            background: "var(--primary)",
                            color: "var(--on-primary)",
                          }}
                        >
                          {g.pendingRequests.length}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
                {groups.length === 0 && (
                  <p
                    className="p-3 text-center text-[11px]"
                    style={{ color: "var(--ink-faint)" }}
                  >
                    Chưa có nhóm kiến thức nào.
                  </p>
                )}
                {isSelf && (
                  <CreateGroupButton
                    workspaceId={selectedWorkspace.id}
                    username={username}
                    onCreated={(group) => {
                      setGroups((prev) => [...prev, group]);
                      setSelectedGroupId(group.id);
                      setGroupDocs([]);
                    }}
                  />
                )}
              </div>
            </motion.aside>

            {/* Cot chinh: header rieng (back + Ban do/Danh sach) nam TREN
                content-grid, KHONG choan qua sidebar - giong bo cuc
                "workspace-toolbar" trong <main> cua source
                knowledge-workspace-react-radial-toolbars. */}
            <div className="flex min-w-0 flex-1 flex-col">
              <div
                className="flex h-[52px] shrink-0 items-center justify-between px-4"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <button
                  type="button"
                  onClick={backToList}
                  className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors duration-150 ease-out hover:text-primary-hover!"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--ink-muted)",
                    background: "var(--surface)",
                  }}
                >
                  <ArrowLeft size={15} strokeWidth={1.9} />
                </button>
                <div
                  className="flex items-center gap-1 rounded-[10px] p-[3px]"
                  style={{
                    background: "var(--surface-muted)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setView("map")}
                    className="flex h-[27px] items-center gap-1.5 rounded-[7px] px-2.5 text-[11px]"
                    style={
                      view === "map"
                        ? {
                            background: "var(--active-bg)",
                            color: "var(--primary)",
                          }
                        : { color: "var(--ink-faint)" }
                    }
                  >
                    <Network size={13} strokeWidth={1.9} /> Bản đồ
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    className="flex h-[27px] items-center gap-1.5 rounded-[7px] px-2.5 text-[11px]"
                    style={
                      view === "list"
                        ? {
                            background: "var(--active-bg)",
                            color: "var(--primary)",
                          }
                        : { color: "var(--ink-faint)" }
                    }
                  >
                    <List size={13} strokeWidth={1.9} /> Danh sách
                  </button>
                </div>
              </div>

              <div className="flex min-h-0 flex-1">
                {/* Stage - Knowledge Map hoac List cua nhom dang chon. Doi
                    nhom (key doi) -> AnimatePresence cho noi dung cu thu nho
                    + mo dan roi noi dung moi (ke ca "loading" trong luc cho
                    docs) phinh to kem nay - xem stageVariants. */}
                <main className="relative min-w-0 flex-1 overflow-hidden">
                  {/* panelsReady: cho DetailsPanel truot vao xong (hoac khong
                      co gi de cho, xem selectWorkspace) roi moi hien chuoi
                      loading/zoom nay - xem panelsReady o tren. */}
                  <AnimatePresence mode="wait">
                    {!panelsReady ? null : !selectedGroup ? (
                      <motion.div
                        key="empty"
                        variants={stageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="absolute inset-0 flex h-full flex-col items-center justify-center gap-2"
                      >
                        <Sparkles
                          size={26}
                          strokeWidth={1.5}
                          style={{ color: "var(--ink-faint)" }}
                        />
                        <p
                          className="text-xs"
                          style={{ color: "var(--ink-faint)" }}
                        >
                          Chọn 1 nhóm kiến thức bên trái.
                        </p>
                      </motion.div>
                    ) : isPending ? (
                      <motion.div
                        key={`${selectedGroup.id}-loading`}
                        variants={stageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="absolute inset-0 flex h-full flex-col items-center justify-center gap-2"
                      >
                        <LoaderCircle
                          size={22}
                          strokeWidth={1.9}
                          className="animate-spin"
                          style={{ color: "var(--ink-faint)" }}
                        />
                        <p
                          className="text-xs"
                          style={{ color: "var(--ink-faint)" }}
                        >
                          Đang tải...
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={`${selectedGroup.id}-ready`}
                        variants={stageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="absolute inset-0"
                      >
                        {selectedGroup.viewerCanWrite ||
                        selectedGroup.visibility === "PUBLIC" ? (
                          view === "map" ? (
                            <KnowledgeMap
                              group={selectedGroup}
                              docs={groupDocs}
                              selectedDocId={selectedDocId}
                              onSelect={setSelectedDocId}
                            />
                          ) : (
                            <PostListStage
                              group={selectedGroup}
                              docs={groupDocs}
                              onSelect={setSelectedDocId}
                            />
                          )
                        ) : (
                          <div className="flex h-full items-center justify-center p-6">
                            <RequestCollabButton groupId={selectedGroup.id} />
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </main>

                {/* Details panel */}
                {selectedGroup && (
                  <DetailsPanel
                    group={selectedGroup}
                    doc={selectedDoc}
                    docs={groupDocs}
                    username={username}
                    isSelf={isSelf}
                    onSelectDoc={setSelectedDocId}
                    onBackToGroup={() => setSelectedDocId(null)}
                    onSettled={() => setPanelsReady(true)}
                  />
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// "Knowledge Map" dang quy dao - hub trung tam = nhom dang chon, node xoay
// quanh = TUNG BAI VIET THAT trong nhom (toi da MAX_MAP_NODES, qua nguong
// nen chuyen sang "Danh sách" de xem het). Vi tri chia deu 360deg, KHONG con
// progress bar duoi node (khong co % tien do that cho 1 bai viet).
function KnowledgeMap({
  group,
  docs,
  selectedDocId,
  onSelect,
}: {
  group: ApiKnowledgeGroup;
  docs: ApiDocumentSummary[];
  selectedDocId: string | null;
  onSelect: (id: string) => void;
}) {
  const shown = docs.slice(0, MAX_MAP_NODES);
  const radius = 32;

  return (
    <div className="absolute inset-0">
      {/* Orbit rings trang tri */}
      {[43, 57, 71].map((size, i) => (
        <div
          key={size}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: `${size}%`,
            height: `${size}%`,
            border: "1px solid var(--border-strong)",
            opacity: i === 2 ? 0.22 : 0.32,
          }}
        />
      ))}

      {shown.length > 0 && (
        <svg
          className="absolute inset-0 size-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {shown.map((d, i) => {
            const angle = (-90 + (360 / shown.length) * i) * (Math.PI / 180);
            const x = 50 + Math.cos(angle) * radius;
            const y = 50 + Math.sin(angle) * radius;
            return (
              <line
                key={d.id}
                x1="50"
                y1="50"
                x2={x}
                y2={y}
                stroke={colorOf(d.id)}
                strokeOpacity={0.34}
                strokeWidth={0.3}
              />
            );
          })}
        </svg>
      )}

      {/* Hub trung tam */}
      <motion.div
        className="absolute top-1/2 left-1/2 flex size-[180px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full text-center"
        animate={{ scale: selectedDocId ? 0.9 : 1 }}
        transition={{ duration: 0.35 }}
        style={{
          background:
            "radial-gradient(circle at 40% 35%, var(--active-bg-strong), var(--surface) 70%)",
          border: "1px solid var(--primary)",
          boxShadow:
            "0 0 0 8px color-mix(in srgb, var(--primary) 4%, transparent), 0 0 60px color-mix(in srgb, var(--primary) 13%, transparent)",
        }}
      >
        <Folder
          size={38}
          strokeWidth={1.5}
          style={{ color: "var(--primary)" }}
        />
        <div
          className="mt-2 max-w-[130px] text-sm leading-tight font-semibold"
          style={{ color: "var(--ink)" }}
        >
          {group.name}
        </div>
        <div className="mt-1 text-[10px]" style={{ color: "var(--ink-faint)" }}>
          {group.postCount} bài viết
        </div>
      </motion.div>

      {shown.map((d, i) => {
        const angle = (-90 + (360 / shown.length) * i) * (Math.PI / 180);
        const x = 50 + Math.cos(angle) * radius;
        const y = 50 + Math.sin(angle) * radius;
        const accent = colorOf(d.id);
        const selected = selectedDocId === d.id;
        return (
          <motion.button
            key={d.id}
            type="button"
            onClick={() => onSelect(d.id)}
            className="absolute w-[120px] -translate-x-1/2 -translate-y-1/2 text-center"
            style={{ left: `${x}%`, top: `${y}%` }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: selected ? 1.1 : 1 }}
            transition={{
              delay: i * 0.045,
              duration: 0.4,
              type: "spring",
              stiffness: 150,
            }}
            whileHover={{ scale: 1.1 }}
          >
            <span
              className="mx-auto flex size-11 items-center justify-center rounded-full"
              style={{
                color: accent,
                border: `1px solid ${selected ? accent : `color-mix(in srgb, ${accent} 40%, transparent)`}`,
                background: `radial-gradient(circle, color-mix(in srgb, ${accent} 22%, transparent), var(--surface) 68%)`,
                boxShadow: selected
                  ? `0 0 30px color-mix(in srgb, ${accent} 40%, transparent)`
                  : `0 0 18px color-mix(in srgb, ${accent} 20%, transparent)`,
              }}
            >
              {d.isPinned ? (
                <Pin size={17} strokeWidth={1.9} />
              ) : (
                <FileText size={17} strokeWidth={1.9} />
              )}
            </span>
            <strong
              className="mt-1.5 block truncate text-[10px] font-medium"
              style={{ color: "var(--ink)" }}
            >
              {d.title}
            </strong>
            <small
              className="mt-0.5 block text-[8px]"
              style={{ color: "var(--ink-faint)" }}
            >
              {d.viewCount} lượt xem
            </small>
          </motion.button>
        );
      })}

      {shown.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <FileText
            size={26}
            strokeWidth={1.5}
            style={{ color: "var(--ink-faint)" }}
          />
          <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
            Nhóm này chưa có bài viết nào.
          </p>
        </div>
      )}

      {docs.length > MAX_MAP_NODES && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px]"
          style={{ color: "var(--ink-faint)" }}
        >
          Hiện {MAX_MAP_NODES}/{docs.length} bài viết trên bản đồ - chuyển
          &quot;Danh sách&quot; để xem hết.
        </div>
      )}
    </div>
  );
}

function PostListStage({
  group,
  docs,
  onSelect,
}: {
  group: ApiKnowledgeGroup;
  docs: ApiDocumentSummary[];
  onSelect: (id: string) => void;
}) {
  return (
    <motion.div
      className="h-full overflow-y-auto p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: "var(--ink)" }}
        >
          <Folder size={17} strokeWidth={1.9} /> {group.name}
        </span>
        <small style={{ color: "var(--ink-faint)" }}>
          {docs.length} bài viết
        </small>
      </div>
      {docs.length === 0 && (
        <p
          className="py-10 text-center text-xs"
          style={{ color: "var(--ink-faint)" }}
        >
          Nhóm này chưa có bài viết nào.
        </p>
      )}
      {docs.map((d, i) => (
        <motion.button
          key={d.id}
          type="button"
          onClick={() => onSelect(d.id)}
          className="my-1.5 grid w-full grid-cols-[36px_1fr_90px] items-center gap-3 rounded-[11px] p-3 text-left transition-colors duration-150 ease-out"
          style={{
            border: "1px solid var(--border)",
            background: "var(--surface)",
          }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
        >
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-[9px]"
            style={{
              color: colorOf(d.id),
              background: `color-mix(in srgb, ${colorOf(d.id)} 12%, transparent)`,
            }}
          >
            {d.isPinned ? (
              <Pin size={15} strokeWidth={1.9} />
            ) : (
              <FileText size={15} strokeWidth={1.9} />
            )}
          </span>
          <span className="min-w-0">
            <strong
              className="block truncate text-[11px] font-medium"
              style={{ color: "var(--ink)" }}
            >
              {d.title}
            </strong>
            <small
              className="mt-0.5 block truncate text-[9px]"
              style={{ color: "var(--ink-faint)" }}
            >
              {d.isPublished ? "Đã xuất bản" : "Bản nháp"}
            </small>
          </span>
          <span
            className="flex items-center justify-end gap-1 text-[9px]"
            style={{ color: "var(--ink-faint)" }}
          >
            <Eye size={11} strokeWidth={1.9} /> {d.viewCount}
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
}

function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <div
      className="rounded-[9px] p-2.5 text-center"
      style={{
        border: "1px solid var(--border)",
        background: "var(--surface-muted)",
      }}
    >
      <strong className="block text-[13px]" style={{ color: "var(--ink)" }}>
        {value}
      </strong>
      <span
        className="mt-0.5 block text-[7px]"
        style={{ color: "var(--ink-faint)" }}
      >
        {label}
      </span>
    </div>
  );
}

function DetailsPanel({
  group,
  doc,
  docs,
  username,
  isSelf,
  onSelectDoc,
  onBackToGroup,
  onSettled,
}: {
  group: ApiKnowledgeGroup;
  doc: ApiDocumentSummary | null;
  docs: ApiDocumentSummary[];
  username: string;
  isSelf: boolean;
  onSelectDoc: (id: string) => void;
  onBackToGroup: () => void;
  // Bao cho WorkspaceSwitcher biet panel nay da "ha canh" xong (chi fire 1
  // lan luc mount - doi group/doc sau do KHONG remount lai component nay
  // nen khong bi goi lai lien tuc).
  onSettled?: () => void;
}) {
  const [composerOpen, setComposerOpen] = useState(false);

  return (
    <>
    <motion.aside
      initial={{ x: 420, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={PANEL_SPRING}
      onAnimationComplete={onSettled}
      className="w-[420px] shrink-0 overflow-y-auto"
      style={{
        borderLeft: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      <div
        className="sticky top-0 flex h-[52px] items-center px-4"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--surface-header)",
        }}
      >
        <button
          type="button"
          onClick={doc ? onBackToGroup : undefined}
          disabled={!doc}
          className="flex items-center gap-1.5 text-[10px] disabled:cursor-default"
          style={{
            color: doc
              ? "var(--ink-muted)"
              : "color-mix(in srgb, var(--ink-muted) 60%, transparent)",
          }}
        >
          <ArrowLeft size={14} strokeWidth={1.9} />{" "}
          {doc ? "Quay lại nhóm" : "Tổng quan"}
        </button>
      </div>

      <div className="p-4">
        {!doc ? (
          <>
            <div
              className="flex items-center gap-3 rounded-[13px] p-3.5"
              style={{
                border: "1px solid var(--border)",
                background:
                  "linear-gradient(135deg, var(--surface-raised), var(--surface))",
              }}
            >
              <span
                className="flex size-[62px] shrink-0 items-center justify-center rounded-xl"
                style={{
                  color: "var(--knowledge)",
                  background:
                    "radial-gradient(circle, var(--knowledge-soft), var(--surface))",
                }}
              >
                <Folder size={30} strokeWidth={1.5} />
              </span>
              <div className="min-w-0">
                <span
                  className="text-[9px] font-bold tracking-wide"
                  style={{ color: "var(--ink-faint)" }}
                >
                  KNOWLEDGE GROUP
                </span>
                <h1
                  className="mt-0.5 truncate text-[15px] font-bold"
                  style={{ color: "var(--ink)" }}
                >
                  {group.name}
                </h1>
                <p
                  className="mt-0.5 line-clamp-2 text-[9px] leading-relaxed"
                  style={{ color: "var(--ink-faint)" }}
                >
                  {group.description ?? "Chưa có mô tả."}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-1.5">
              <Metric value={group.postCount} label="Bài viết" />
              <Metric
                value={group.visibility === "PUBLIC" ? "Công khai" : "Riêng tư"}
                label="Quyền xem"
              />
              <Metric
                value={group.viewerCanWrite ? "Có" : "Không"}
                label="Được viết"
              />
              <Metric value={group.pendingRequests.length} label="Chờ duyệt" />
            </div>

            {isSelf && group.pendingRequests.length > 0 && (
              <div className="mt-4">
                <KnowledgeGroupCollabRequestsPanel
                  groupId={group.id}
                  username={username}
                  initialRequests={group.pendingRequests}
                />
              </div>
            )}

            {docs.length > 0 && (
              <section className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <h3
                    className="text-[11px] font-semibold"
                    style={{ color: "var(--ink)" }}
                  >
                    Bài viết trong nhóm
                  </h3>
                </div>
                {docs.slice(0, 5).map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => onSelectDoc(d.id)}
                    className="my-1.5 grid w-full grid-cols-[12px_1fr_30px] items-center gap-2"
                  >
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{
                        background: colorOf(d.id),
                        boxShadow: `0 0 8px ${colorOf(d.id)}`,
                      }}
                    />
                    <span className="min-w-0 text-left">
                      <strong
                        className="block truncate text-[9px]"
                        style={{ color: "var(--ink)" }}
                      >
                        {d.title}
                      </strong>
                      <small
                        className="mt-0.5 block text-[7px]"
                        style={{ color: "var(--ink-faint)" }}
                      >
                        {d.viewCount} lượt xem
                      </small>
                    </span>
                    <b
                      className="text-right text-[8px]"
                      style={{ color: "var(--ink-faint)" }}
                    >
                      →
                    </b>
                  </button>
                ))}
              </section>
            )}

            {group.viewerCanWrite && (
              <button
                type="button"
                onClick={() => setComposerOpen(true)}
                className="mt-5 flex h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-[9px] text-[10px] font-semibold"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary), var(--secondary))",
                  boxShadow:
                    "0 10px 30px color-mix(in srgb, var(--secondary) 25%, transparent)",
                  color: "var(--on-primary)",
                }}
              >
                <Send size={14} strokeWidth={1.9} /> Viết bài mới
              </button>
            )}
          </>
        ) : (
          <>
            <div
              className="flex items-center gap-3 rounded-[13px] p-3.5"
              style={{
                border: "1px solid var(--border)",
                background:
                  "linear-gradient(135deg, var(--surface-raised), var(--surface))",
              }}
            >
              <span
                className="flex size-[62px] shrink-0 items-center justify-center rounded-xl"
                style={{
                  color: colorOf(doc.id),
                  background: `color-mix(in srgb, ${colorOf(doc.id)} 12%, transparent)`,
                }}
              >
                {doc.isPinned ? (
                  <Pin size={28} strokeWidth={1.5} />
                ) : (
                  <FileText size={28} strokeWidth={1.5} />
                )}
              </span>
              <div className="min-w-0">
                <span
                  className="text-[9px] font-bold tracking-wide"
                  style={{ color: "var(--ink-faint)" }}
                >
                  BÀI VIẾT
                </span>
                <h1
                  className="mt-0.5 line-clamp-2 text-[14px] font-bold"
                  style={{ color: "var(--ink)" }}
                >
                  {doc.title}
                </h1>
                {doc.summary && (
                  <p
                    className="mt-0.5 line-clamp-2 text-[9px] leading-relaxed"
                    style={{ color: "var(--ink-faint)" }}
                  >
                    {doc.summary}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-1.5">
              <Metric value={doc.viewCount} label="Lượt xem" />
              <Metric
                value={doc.isPublished ? "Xuất bản" : "Nháp"}
                label="Trạng thái"
              />
              <Metric value={doc.isPinned ? "Có" : "Không"} label="Đã ghim" />
              <Metric value={doc.tags.length} label="Thẻ" />
            </div>

            {doc.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {doc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full px-2 py-0.5 text-[9px]"
                    style={{
                      background: "var(--tag-bg)",
                      color: "var(--tag-text)",
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <Link
              href={`/u/${doc.author.username}/workspaces/${doc.slug}`}
              className="mt-5 flex h-[42px] w-full items-center justify-center gap-2 rounded-[9px] text-[10px] font-semibold"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), var(--secondary))",
                boxShadow:
                  "0 10px 30px color-mix(in srgb, var(--secondary) 25%, transparent)",
                color: "var(--on-primary)",
              }}
            >
              Xem bài đầy đủ <span>→</span>
            </Link>
          </>
        )}
      </div>
    </motion.aside>
    <PostEditorModal
      open={composerOpen}
      onClose={() => setComposerOpen(false)}
      groupId={group.id}
    />
    </>
  );
}
