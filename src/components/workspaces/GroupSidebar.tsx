"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckSquare,
  ChevronLeft,
  CircleDot,
  FileText,
  Map,
  Menu,
  RotateCw,
  Settings,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ApiKnowledgeGroup } from "@/lib/api/types";
import { SidebarSectionLabel } from "./article-tab-shared";
import { PANEL_SPRING } from "./motion";
import { GroupIconGlyph } from "./group-icons";
import { EditGroupButton } from "./EditGroupButton";
import { GroupGoalButton } from "./GroupGoalModal";
import { PostEditorModal } from "./PostEditorModal";
import { WorkspaceButton } from "./WorkspaceButton";
import { useWorkspaceShell, type GroupSection } from "./workspace-shell-context";

// Gradient dung chung cho nut CTA/hanh dong noi bat trong khu vuc Workspace
// (xem docs/workspace-style-guide.md muc 8).
const CTA_GRADIENT = "linear-gradient(to right, #20c5d8, #269ce9, #326eea)";

const panelVariants = {
  hidden: { x: -260, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: PANEL_SPRING },
};

type NavItem = { id: GroupSection; label: string; Icon: LucideIcon };

const OVERVIEW_ITEMS: NavItem[] = [{ id: "overview", label: "Tổng quan", Icon: CircleDot }];
const LEARNING_ITEMS: NavItem[] = [
  { id: "roadmap", label: "Lộ trình", Icon: Map },
  { id: "knowledge", label: "Kiến thức", Icon: BookOpen },
  { id: "articles", label: "Bài viết", Icon: FileText },
  { id: "goals", label: "Mục tiêu", Icon: Target },
];
const WORK_ITEMS: NavItem[] = [
  { id: "tasks", label: "Việc cần làm", Icon: CheckSquare },
  { id: "review", label: "Ôn tập", Icon: RotateCw },
];
const MANAGEMENT_ITEMS: NavItem[] = [
  { id: "progress", label: "Tiến độ", Icon: BarChart3 },
  { id: "members", label: "Thành viên", Icon: Users },
  { id: "settings", label: "Cài đặt", Icon: Settings },
];

function NavRow({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
}) {
  const { Icon, label } = item;
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex w-full cursor-pointer items-center gap-2.5 rounded-[9px] py-2 pr-2 pl-2.5 text-left transition-colors duration-150 ease-out hover:text-ink"
      style={{
        background: active ? "var(--active-bg)" : undefined,
        color: active ? "var(--primary)" : "var(--ink-muted)",
      }}
    >
      {active && (
        <motion.span
          layoutId="groupNavActiveBar"
          className="absolute top-1 bottom-1 left-0 w-0.75 rounded-full"
          style={{ background: "var(--primary)" }}
          transition={{ type: "spring", stiffness: 500, damping: 38 }}
        />
      )}
      <Icon
        size={14}
        strokeWidth={1.9}
        className="shrink-0"
        style={active ? undefined : { color: "var(--ink-faint)" }}
      />
      <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium">{label}</span>
    </button>
  );
}

// Left panel - navigation CHINH cua 1 Knowledge Group ("Workspace" trong yeu
// cau cua nguoi dung, xem docs/../noble-crunching-newt.md). Truoc day panel
// nay TRUC TIEP la danh sach bai viet (GroupArticleToc.tsx) - danh sach do da
// CHUYEN het sang GroupArticlesSection.tsx (muc "Bài viết"), panel nay gio
// CHI con dieu huong giua cac "trang" (activeSection, client-side view state -
// xem workspace-shell-context.tsx) - cung tinh than ArticleTabs.tsx trong
// ArticleReaderPane.tsx, khong phai route rieng.
export function GroupSidebar({ group }: { group: ApiKnowledgeGroup }) {
  const { clearSelectedGroup, username, workspace, isSelf, activeSection, setActiveSection } =
    useWorkspaceShell();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  // Composer "Viết bài mới" - luon bam duoc tu sidebar bat ke dang o "trang"
  // nao trong nhom, khong phu thuoc GroupArticlesSection co dang mount hay
  // khong (vd dang o Roadmap/Kien thuc...).
  const [composerOpen, setComposerOpen] = useState(false);

  // Bam 1 muc nav phai LUON hien ra dung "trang" do, ke ca khi dang o trang
  // doc bai viet ([slug]/page.tsx) - GroupSectionRouter (doc activeSection)
  // CHI mount tren route cua nhom (group/[groupId]/page.tsx), doi state
  // khong thoi se vo hinh neu dang o route khac. router.push ve route nhom -
  // neu da o do san thi la no-op, khong remount/nhay gi them.
  function goToSection(id: GroupSection) {
    setActiveSection(id);
    router.push(`/workspace/${username}/${workspace.id}/group/${group.id}`);
  }

  const toggleButton = (
    <motion.button
      type="button"
      onClick={() => setCollapsed((v) => !v)}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 420, damping: 20 }}
      className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 text-white"
      style={{
        background: CTA_GRADIENT,
        boxShadow: "0 7px 18px rgba(40,125,235,0.24)",
      }}
      title={collapsed ? "Mở panel" : "Đóng panel"}
      aria-label={collapsed ? "Mở panel" : "Đóng panel"}
    >
      {collapsed ? (
        <Menu size={14} strokeWidth={2.2} />
      ) : (
        <ChevronLeft size={14} strokeWidth={2.2} />
      )}
    </motion.button>
  );

  const aside = (
    <motion.aside
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      className="shadow-panel flex shrink-0 flex-col overflow-hidden rounded-[13px] backdrop-blur-md"
      style={{
        border: "1px solid var(--border)",
        background: "color-mix(in srgb, var(--surface) 82%, transparent)",
      }}
    >
      <motion.div
        animate={{ width: collapsed ? 56 : 260 }}
        transition={PANEL_SPRING}
        className="flex h-full min-h-0 flex-col"
      >
        <div
          className="flex shrink-0 items-start gap-2 px-3 py-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          {collapsed ? (
            toggleButton
          ) : (
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                {/* Link (khong phai button don thuan): khi dang o trang doc
                    bai viet ([slug]/page.tsx), can DIEU HUONG ve trang browse
                    de man tong quan (KnowledgeGroupCatalog.tsx) - von chi
                    render trong page.tsx browse - thuc su hien ra, khong chi
                    doi state chon nhom. */}
                <Link
                  href={`/workspace/${username}/${workspace.id}`}
                  onClick={clearSelectedGroup}
                  className="flex cursor-pointer items-center gap-1 text-[9px] font-bold tracking-wide transition-colors duration-150 ease-out hover:text-ink"
                  style={{ color: "var(--ink-faint)" }}
                >
                  <ArrowLeft size={10} strokeWidth={2.2} />
                  TẤT CẢ NHÓM
                </Link>
                {toggleButton}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5">
                <GroupIconGlyph
                  name={group.icon}
                  size={13}
                  strokeWidth={2}
                  className="shrink-0 text-ink-muted"
                />
                <h2
                  className="min-w-0 flex-1 truncate text-sm font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  {group.name}
                </h2>
                {/* key={group.id}: buoc remount khi CHUYEN nhom - GroupSidebar
                    KHONG remount khi doi group (cung 1 vi tri trong cay, xem
                    WorkspaceShell.tsx), nhung editor Tiptap ben trong
                    GroupGoalButton chi doc `content` MOT LAN luc tao, se giu
                    noi dung nhom CU neu khong ep remount o day. */}
                <GroupGoalButton key={group.id} group={group} />
                {/* Sua ten/mo ta/quyen xem - CHI chu workspace (isSelf) moi
                    duoc, backend gate bang assertGroupOwner (chat hon
                    viewerCanWrite ma collaborator APPROVED cung co). */}
                {isSelf && <EditGroupButton group={group} />}
              </div>

              {group.viewerCanWrite && (
                <WorkspaceButton
                  onClick={() => setComposerOpen(true)}
                  size="sm"
                  className="mt-2.5 w-full justify-center"
                >
                  Thêm bài viết mới
                </WorkspaceButton>
              )}
            </div>
          )}
        </div>

        {!collapsed && (
          <nav className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-3">
            <div>
              <SidebarSectionLabel>OVERVIEW</SidebarSectionLabel>
              <div className="flex flex-col gap-0.5">
                {OVERVIEW_ITEMS.map((item) => (
                  <NavRow
                    key={item.id}
                    item={item}
                    active={activeSection === item.id}
                    onClick={() => goToSection(item.id)}
                  />
                ))}
              </div>
            </div>

            <div>
              <SidebarSectionLabel>LEARNING</SidebarSectionLabel>
              <div className="flex flex-col gap-0.5">
                {LEARNING_ITEMS.map((item) => (
                  <NavRow
                    key={item.id}
                    item={item}
                    active={activeSection === item.id}
                    onClick={() => goToSection(item.id)}
                  />
                ))}
              </div>
            </div>

            <div>
              <SidebarSectionLabel>WORK</SidebarSectionLabel>
              <div className="flex flex-col gap-0.5">
                {WORK_ITEMS.map((item) => (
                  <NavRow
                    key={item.id}
                    item={item}
                    active={activeSection === item.id}
                    onClick={() => goToSection(item.id)}
                  />
                ))}
              </div>
            </div>

            <div
              className="mt-auto flex flex-col gap-0.5 pt-3"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              {MANAGEMENT_ITEMS.map((item) => (
                <NavRow
                  key={item.id}
                  item={item}
                  active={activeSection === item.id}
                  onClick={() => setActiveSection(item.id)}
                />
              ))}
            </div>
          </nav>
        )}
      </motion.div>
    </motion.aside>
  );

  return (
    <>
      {aside}
      <PostEditorModal
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        groupId={group.id}
      />
    </>
  );
}
