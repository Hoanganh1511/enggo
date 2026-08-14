"use client";

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
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
  Send,
  Sparkles,
} from "lucide-react";
import type {
  ApiDocument,
  ApiDocumentSummary,
  ApiKnowledgeGroup,
  ApiWorkspaceWithGroups,
} from "@/lib/api/types";
import { getGroupDocumentsAction } from "@/actions/knowledge-groups/get-group-documents";
import { getDocumentAction } from "@/actions/documents/get-document";
import { colorOf } from "./node-color";
import {
  KnowledgeUniverseCanvas,
  MAP_TRANSITION_MS,
} from "./KnowledgeUniverseCanvas";
import { CreateGroupButton } from "./CreateGroupButton";
import { PostEditorModal } from "./PostEditorModal";
import { RequestCollabButton } from "./RequestCollabButton";
import { KnowledgeGroupCollabRequestsPanel } from "./KnowledgeGroupCollabRequestsPanel";
import { ArticleFocusOverlay } from "./ArticleFocusOverlay";

export type TocItem = { id: string; text: string; level: number };

// Man "ben trong" 1 workspace (sidebar nhom + stage Ban do/Danh sach +
// DetailsPanel) - TACH RA thanh trang rieng /workspace/[username]/
// [workspaceId] (xem page.tsx cung thu muc), truoc day nam chung trong
// WorkspaceSwitcher.tsx nhu 1 "phase" noi bo (khong doi URL). Nhan thang
// "workspace" (ApiWorkspaceWithGroups) tu Server Component page.tsx - da la
// du lieu FRESH tai luc load trang nen KHONG can goi lai
// getWorkspaceGroupsAction nhu ban SPA cu (chi con goi getGroupDocumentsAction
// cho tung nhom duoc chon).

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
// theo index). Mau sac tung item da khac nhau qua colorOf(g.id) nen hieu ung
// tha lan luot tu nhien tao cam giac "rem cau vong". KHONG dung filter:blur()
// - filter khong duoc GPU composite re nhu transform/opacity, browser phai
// repaint tung frame; voi nhieu item tha stagger cung luc day la 1 nguyen
// nhan giat khi mount.
const groupItemVariants: Variants = {
  hidden: { opacity: 0, y: -18, scale: 0.92 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 380,
      damping: 24,
      delay: 0.12 + index * 0.06,
    },
  }),
};

// React.memo: WorkspaceDetail re-render rat thuong xuyen vi nhung ly do
// KHONG lien quan gi toi danh sach nhom (chon doc tren KnowledgeMap, doi
// view Ban do/Danh sach, isPending cua stage...). Tach rieng + memo de item
// CHI re-render khi group/index/active/onSelect that su doi (onSelect on
// dinh nho selectGroup da boc useCallback).
const GroupListItem = memo(function GroupListItem({
  group,
  index,
  active,
  onSelect,
}: {
  group: ApiKnowledgeGroup;
  index: number;
  active: boolean;
  onSelect: (g: ApiKnowledgeGroup) => void;
}) {
  return (
    <motion.button
      custom={index}
      variants={groupItemVariants}
      initial="hidden"
      animate="visible"
      type="button"
      onClick={() => onSelect(group)}
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.985 }}
      className={`flex items-center gap-2.5 rounded-[11px] p-2.5 text-left transition-colors duration-150 ease-out${active ? " group-item-plasma" : ""}`}
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
          color: colorOf(group.id),
          background: `color-mix(in srgb, ${colorOf(group.id)} 12%, transparent)`,
        }}
      >
        <Folder size={15} strokeWidth={1.9} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className="block truncate text-[11px] font-semibold"
          style={{ color: "var(--ink)" }}
        >
          {group.name}
        </span>
        <span
          className="mt-0.5 flex items-center gap-1 text-[9px]"
          style={{ color: "var(--ink-faint)" }}
        >
          {group.visibility === "PRIVATE" ? (
            <Lock size={9} />
          ) : (
            <Globe size={9} />
          )}
          {group.postCount} bài viết
        </span>
      </span>
      {group.pendingRequests.length > 0 && (
        <span
          className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
          style={{
            background: "var(--primary)",
            color: "var(--on-primary)",
          }}
        >
          {group.pendingRequests.length}
        </span>
      )}
    </motion.button>
  );
});

export function WorkspaceDetail({
  workspace,
  username,
  isSelf,
}: {
  workspace: ApiWorkspaceWithGroups;
  username: string;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [groups, setGroups] = useState<ApiKnowledgeGroup[]>(workspace.groups);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    workspace.groups[0]?.id ?? null,
  );
  const [groupDocs, setGroupDocs] = useState<ApiDocumentSummary[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  // Dieu phoi hieu ung "xoay vao lo den" (main) + truot phai (DetailsPanel)
  // luc mo/dong 1 bai viet - xem MAP_TRANSITION_MS trong
  // KnowledgeUniverseCanvas.tsx. "closing": dang xoay vao tam (selectedDocId
  // VAN CON null luc nay, ArticleFocusOverlay chua mount). "opening": vua
  // dong ArticleFocusOverlay xong, main/DetailsPanel dang truot/xoay tro
  // lai. main+DetailsPanel CHI thuc su unmount (khong con "an tam" duoi lop
  // mo nhu truoc) khi selectedDocId da co gia tri - xem dieu kien render o
  // duoi.
  const [mainPhase, setMainPhase] = useState<"idle" | "closing" | "opening">(
    "idle",
  );
  const [view, setView] = useState<"map" | "list">("map");
  const [isPending, startTransition] = useTransition();
  // Doc DAY DU (co content) cho bai dang mo trong main - groupDocs chi la ban
  // rut gon (ApiDocumentSummary, khong co content) nen phai fetch rieng qua
  // getDocumentAction luc chon 1 bai.
  const [selectedDocFull, setSelectedDocFull] = useState<ApiDocument | null>(
    null,
  );
  const [docPending, startDocTransition] = useTransition();
  // Muc luc sinh tu heading trong noi dung bai (xem PostDetailStage) - lift
  // len day vi DetailsPanel (tab "Muc luc") va PostDetailStage (main) la 2
  // component anh em, khong the tu trao doi DOM/id cho nhau.
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeTocId, setActiveTocId] = useState("");
  // Container CUON THAT SU cua bai dang doc (main) - dung chung cho ca
  // PostDetailStage (gan lam ref cuon) va scroll-spy o duoi (lang nghe scroll
  // tren CHINH container nay, khong phai window, vi no nam long trong 1 the
  // overflow-y-auto rieng).
  const postScrollRef = useRef<HTMLDivElement>(null);
  // Choreography luc vao trang: DetailsPanel (aside phai) truot vao tu ngoai
  // le man hinh, CHI SAU KHI no "ha canh" xong (onAnimationComplete) moi cho
  // stage giua hien trang thai/loading - tranh cam giac moi thu bung ra cung
  // luc.
  // Khoi tao dung tu dau (khong phai set trong effect) - workspace khong co
  // nhom nao thi stage mo khoa luon, khong co DetailsPanel nao se truot vao
  // de bao "da on dinh" ca.
  const [panelsReady, setPanelsReady] = useState(workspace.groups.length === 0);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? null;

  const loadGroupDocs = useCallback((g: ApiKnowledgeGroup) => {
    setGroupDocs([]);
    setSelectedDocId(null);
    setSelectedDocFull(null);
    setToc([]);
    setActiveTocId("");
    if (g.viewerCanWrite || g.visibility === "PUBLIC") {
      startTransition(async () => {
        setGroupDocs(await getGroupDocumentsAction(g.id));
      });
    }
  }, []);

  // Mo 1 bai viet DE DOC NGAY TRONG TRANG (main hien noi dung bai, khong con
  // dieu huong sang /u/[username]/workspaces/[slug]). groupDocs (summary) da
  // co slug + author.username nen khong can goi lai getGroupDocumentsAction.
  //
  // Khong set selectedDocId ngay - cho hieu ung "xoay vao lo den" cua main +
  // truot phai cua DetailsPanel (mainPhase="closing") CHAY XONG (khop
  // MAP_TRANSITION_MS) roi moi thuc su mo ArticleFocusOverlay, dung y
  // "dong main lai... roi phan nay thay vao" nguoi dung yeu cau (khong phai
  // mo modal chong len). Chan bam node moi trong luc dang chuyen canh
  // (mainPhase !== "idle") - tranh xep chong nhieu hieu ung.
  const selectDoc = useCallback(
    (id: string) => {
      if (mainPhase !== "idle") return;
      setMainPhase("closing");
      window.setTimeout(() => {
        setSelectedDocId(id);
        setSelectedDocFull(null);
        setToc([]);
        setActiveTocId("");
        setMainPhase("idle");
        const summary = groupDocs.find((d) => d.id === id);
        if (!summary) return;
        startDocTransition(async () => {
          setSelectedDocFull(
            await getDocumentAction(summary.author.username, summary.slug),
          );
        });
      }, MAP_TRANSITION_MS);
    },
    [groupDocs, mainPhase],
  );

  // Goi boi ArticleFocusOverlay's onClose - CHI fire SAU KHI overlay da tu
  // mo dan xong (~320ms, xem handleClose trong ArticleFocusOverlay.tsx), nen
  // luc nay overlay da vo hinh - dat selectedDocId=null la an toan, khong
  // gay giat hinh. mainPhase="opening" cho main+DetailsPanel remount va
  // choi hieu ung nguoc lai (xoay ra tu tam / truot vao tu phai).
  const backToPostList = useCallback(() => {
    setSelectedDocId(null);
    setSelectedDocFull(null);
    setToc([]);
    setActiveTocId("");
    setMainPhase("opening");
    window.setTimeout(() => setMainPhase("idle"), MAP_TRANSITION_MS);
  }, []);

  // Scroll-spy cho tab "Muc luc": dung IntersectionObserver voi root la CHINH
  // container cuon cua bai viet (postScrollRef, gan boi PostDetailStage) -
  // khong dung window vi no nam trong the overflow-y-auto rieng, khong phai
  // body. root: container khien IntersectionObserver tu tinh giao voi khung
  // nhin CUA CONTAINER DO (bat ke container dat o dau tren trang, offset bao
  // nhieu do voi viewport that) - dang tin cay hon cach cu doc
  // getBoundingClientRect().top (toa do tuyet doi theo VIEWPORT) roi tu so
  // sanh voi 1 threshold co dinh, de lech khi container khong nam sat dinh
  // man hinh. rootMargin bop khung quan sat con lai 1 dai mong gan dinh
  // container ("da doc qua" = di qua dai nay) - dung "heading dau tien (theo
  // thu tu tai lieu) dang nam trong dai" lam active, giong quy uoc scrollspy
  // pho bien.
  useEffect(() => {
    if (toc.length === 0) return;
    const container = postScrollRef.current;
    if (!container) return;
    const els = toc
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;

    // setState qua 1 ham long (khong goi truc tiep trong than effect) -
    // tranh eslint react-hooks/set-state-in-effect, cung pattern voi
    // compute() cua ban truoc.
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

  // Nap bai viet cho nhom dau tien duoc chon san khi vao trang.
  // workspace.groups la du lieu Server Component da fetch, khong can goi lai
  // getWorkspaceGroupsAction (khac ban SPA cu, luc do phai fetch lai vi danh
  // sach workspaces o trang truoc co the da cu). Khong goi qua loadGroupDocs
  // (se setGroupDocs([])/setSelectedDocId(null) thua - da dung gia tri do
  // luc mount) de effect nay khong con setState nao chay dong bo, chi con
  // startTransition (bat buoc, se bao loi "set-state-in-effect" neu goi
  // truc tiep).
  useEffect(() => {
    const first = workspace.groups[0];
    if (!first) return;
    if (first.viewerCanWrite || first.visibility === "PUBLIC") {
      startTransition(async () => {
        setGroupDocs(await getGroupDocumentsAction(first.id));
      });
    }
    // Chi chay 1 lan luc mount trang (workspace.id doi = page.tsx remount
    // component nay qua key/route, khong phai props doi tai cho).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectGroup = useCallback(
    (g: ApiKnowledgeGroup) => {
      setSelectedGroupId(g.id);
      loadGroupDocs(g);
    },
    [loadGroupDocs],
  );

  function backToList() {
    router.push(`/workspace/${username}`);
  }

  return (
    <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="relative z-10 flex h-full flex-col"
    >
      <div className="flex min-h-0 flex-1">
        {/* Sidebar - ten workspace + danh sach Knowledge Group, TU no choan
            het chieu cao: heading "WORKSPACE" + ten nam trong sidebar, khong
            phai trong toolbar cua main display. */}
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
              {workspace.name}
            </h2>
          </div>
          <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto p-3">
            {groups.map((g, index) => (
              <GroupListItem
                key={g.id}
                group={g}
                index={index}
                active={g.id === selectedGroupId}
                onSelect={selectGroup}
              />
            ))}
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
                workspaceId={workspace.id}
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
            content-grid, KHONG choan qua sidebar. */}
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

          {/* main+DetailsPanel CHI mount khi khong focus 1 bai viet (hoac
              dang trong luc chuyen canh closing/opening - selectedDocId con
              null suot "closing", vua ve null luc "opening" bat dau) - xem
              mainPhase. Khac truoc (chi lam mo qua .pre-focus-blur, van
              mount ngam duoi lop overlay): gio UNMOUNT THAT SU luc dang
              focus, dung y "nhe" da chuyen tu Pixi sang DOM/SVG. */}
          {!selectedDocId && (
            <div className="flex min-h-0 flex-1">
              {/* Stage - Knowledge Map hoac List cua nhom dang chon. Doi nhom
                  (key doi) -> AnimatePresence cho noi dung cu thu nho + mo dan
                  roi noi dung moi (ke ca "loading" trong luc cho docs) phinh to
                  kem nay - xem stageVariants. */}
              <main className="relative min-w-0 flex-1 overflow-hidden">
                {/* panelsReady: cho DetailsPanel truot vao xong (hoac khong co
                    gi de cho) roi moi hien trang thai/loading. */}
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
                      <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
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
                      <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
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
                          <KnowledgeUniverseCanvas
                            group={selectedGroup}
                            docs={groupDocs}
                            selectedDocId={selectedDocId}
                            onSelect={selectDoc}
                            phase={mainPhase}
                          />
                        ) : (
                          <PostListStage
                            group={selectedGroup}
                            docs={groupDocs}
                            onSelect={selectDoc}
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
                  docs={groupDocs}
                  username={username}
                  isSelf={isSelf}
                  onSelectDoc={selectDoc}
                  onSettled={() => setPanelsReady(true)}
                  closing={mainPhase === "closing"}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>

    <AnimatePresence>
      {selectedDocId && (
        <ArticleFocusOverlay
          doc={selectedDocFull}
          docLoading={docPending || !selectedDocFull}
          siblingDocs={groupDocs.filter((d) => d.id !== selectedDocId)}
          toc={toc}
          activeTocId={activeTocId}
          scrollRef={postScrollRef}
          onTocChange={setToc}
          onOpenDoc={selectDoc}
          onClose={backToPostList}
        />
      )}
    </AnimatePresence>
    </>
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
  docs,
  username,
  isSelf,
  onSelectDoc,
  onSettled,
  closing,
}: {
  group: ApiKnowledgeGroup;
  docs: ApiDocumentSummary[];
  username: string;
  isSelf: boolean;
  // Mo 1 bai viet - chuyen sang "focus mode" toan man hinh (xem
  // ArticleFocusOverlay), khong con doi noi dung panel nay nua.
  onSelectDoc: (id: string) => void;
  // Bao cho WorkspaceDetail biet panel nay da "ha canh" xong (chi fire 1 lan
  // luc mount).
  onSettled?: () => void;
  // true khi WorkspaceDetail dang trong pha "closing" (chuan bi mo 1 bai
  // viet) - panel truot NGUOC ra phai + mo dan thay vi dung yen. Component
  // van MOUNT suot pha nay (chi thuc su unmount SAU KHI closing xong, xem
  // dieu kien {!selectedDocId && ...} o WorkspaceDetail) nen chi can doi
  // "animate", khong can AnimatePresence/exit rieng - luc mo lai (remount
  // sau khi dong ArticleFocusOverlay), initial={x:420,opacity:0} da san co
  // ben duoi tu lam dung viec "truot vao tu phai" ma khong can sua gi them.
  closing?: boolean;
}) {
  const [composerOpen, setComposerOpen] = useState(false);

  return (
    <>
      <motion.aside
        initial={{ x: 420, opacity: 0 }}
        animate={closing ? { x: 420, opacity: 0 } : { x: 0, opacity: 1 }}
        transition={PANEL_SPRING}
        onAnimationComplete={onSettled}
        className="flex w-[420px] shrink-0 flex-col overflow-hidden"
        style={{
          borderLeft: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        <div
          className="flex h-[52px] shrink-0 items-center px-4"
          style={{
            borderBottom: "1px solid var(--border)",
            background: "var(--surface-header)",
          }}
        >
          <span
            className="flex items-center gap-1.5 text-[10px]"
            style={{
              color: "color-mix(in srgb, var(--ink-muted) 60%, transparent)",
            }}
          >
            <ArrowLeft size={14} strokeWidth={1.9} /> Tổng quan
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
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
                  value={
                    group.visibility === "PUBLIC" ? "Công khai" : "Riêng tư"
                  }
                  label="Quyền xem"
                />
                <Metric
                  value={group.viewerCanWrite ? "Có" : "Không"}
                  label="Được viết"
                />
                <Metric
                  value={group.pendingRequests.length}
                  label="Chờ duyệt"
                />
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
