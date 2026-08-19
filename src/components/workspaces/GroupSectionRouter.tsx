"use client";

import {
  BarChart3,
  BookOpen,
  CheckSquare,
  Map,
  RotateCw,
  Settings,
  Users,
} from "lucide-react";
import type { ApiDocumentSummary, ApiKnowledgeGroup } from "@/lib/api/types";
import { GroupOverviewSection } from "./GroupOverviewSection";
import { GroupArticlesSection } from "./GroupArticlesSection";
import { GroupGoalsSection } from "./GroupGoalsSection";
import { GroupSectionPlaceholder } from "./GroupSectionPlaceholder";
import { useWorkspaceShell } from "./workspace-shell-context";

// Chuyen "trang" hien thi trong khu vuc trung tam theo activeSection (xem
// GroupSidebar.tsx/workspace-shell-context.tsx) - Overview va Bai viet la
// trang THAT, con lai la placeholder trung thuc (khong du lieu gia) cho phase
// sau. Doc du lieu group/docs/loading tu context thay vi nhan lai qua props -
// WorkspaceMain.tsx (cha) da co san qua useWorkspaceShell() nen truyen thang
// xuong day cho gon.
export function GroupSectionRouter({
  group,
  docs,
  loading,
}: {
  group: ApiKnowledgeGroup;
  docs: ApiDocumentSummary[];
  loading: boolean;
}) {
  const { activeSection } = useWorkspaceShell();

  switch (activeSection) {
    case "overview":
      return <GroupOverviewSection group={group} docs={docs} />;
    case "articles":
      return <GroupArticlesSection group={group} docs={docs} loading={loading} />;
    case "roadmap":
      return (
        <GroupSectionPlaceholder
          icon={Map}
          title="Lộ trình học tập"
          description="Bản đồ trực quan các chủ đề cần học, theo thứ tự và mức độ hoàn thành."
        />
      );
    case "knowledge":
      return (
        <GroupSectionPlaceholder
          icon={BookOpen}
          title="Kiến thức"
          description="Cây phân loại các chủ đề kiến thức trong nhóm, kèm trạng thái đã học."
        />
      );
    case "goals":
      return <GroupGoalsSection group={group} />;
    case "tasks":
      return (
        <GroupSectionPlaceholder
          icon={CheckSquare}
          title="Việc cần làm"
          description="Danh sách việc cần làm gắn với từng phần kiến thức trong nhóm."
        />
      );
    case "review":
      return (
        <GroupSectionPlaceholder
          icon={RotateCw}
          title="Ôn tập"
          description="Nhắc ôn lại những kiến thức đã lâu chưa xem, dựa trên checklist đã đánh dấu."
        />
      );
    case "progress":
      return (
        <GroupSectionPlaceholder
          icon={BarChart3}
          title="Tiến độ"
          description="Toàn cảnh tiến độ học tập: mức hoàn thành, streak, số bài viết/kiến thức."
        />
      );
    case "members":
      return (
        <GroupSectionPlaceholder
          icon={Users}
          title="Thành viên"
          description="Quản lý cộng tác viên và yêu cầu tham gia nhóm kiến thức này."
        />
      );
    case "settings":
      return (
        <GroupSectionPlaceholder
          icon={Settings}
          title="Cài đặt"
          description="Các thiết lập khác cho nhóm kiến thức này."
        />
      );
    default:
      return null;
  }
}
