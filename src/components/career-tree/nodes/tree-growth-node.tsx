import { memo } from "react";
import { Folder, FileText, Target } from "lucide-react";
import { Handle, Position } from "@xyflow/react";
import GrowthCard from "@/components/ui/growth-card";
import { MAX_EXPECTED_CARDS } from "@/lib/career-tree/constants";
import { getNodeStatus } from "@/lib/career-tree/node-status";
import { getMasteryPercent } from "@/lib/career-tree/node-narrative";
import type { NodeRole, TreeNodeData } from "@/lib/career-tree/types";

const ROLE_ICON: Record<NodeRole, typeof Target> = {
  root: Target,
  branch: Folder,
  leaf: FileText,
};

type TreeGrowthNodeProps = {
  data: TreeNodeData;
};

const TreeGrowthNode = ({ data }: TreeGrowthNodeProps) => {
  const hasVisibleChildren = data.childrenCount > 0 && !data.isCollapsed;
  const done = Math.min(data.cardCount, MAX_EXPECTED_CARDS);
  const status = getNodeStatus({
    streakCurrent: data.streak.current,
    openIssueCount: data.openIssueCount,
    masteryPercent: getMasteryPercent(data.cardCount),
    lastActivity: data.lastActivity,
  });

  return (
    <div className="animate-[node-enter_200ms_ease-out] motion-reduce:animate-none">
      {data.role !== "root" && <Handle type="target" position={Position.Top} />}

      <GrowthCard
        icon={ROLE_ICON[data.role]}
        role={data.role}
        title={data.title}
        subtitle={`${data.cardCount} ghi chú`}
        branches={data.childrenCount}
        streak={data.streak}
        lastActivity={data.lastActivity}
        done={done}
        total={MAX_EXPECTED_CARDS}
        status={status}
        isCollapsed={data.isCollapsed}
        isToggling={data.isToggling}
        onToggleCollapse={data.onToggleCollapse}
        category={data.category}
        difficulty={data.difficulty}
        tags={data.tags}
        isPinned={data.isPinned}
        onTogglePin={data.onTogglePin}
        childNodes={data.childNodes}
        openIssueCount={data.openIssueCount}
        cardCount={data.cardCount}
        onSelectNode={data.onSelectNode}
      />

      {hasVisibleChildren && (
        <Handle type="source" position={Position.Bottom} />
      )}
    </div>
  );
};

// memo dung khi "data" khong doi tham chieu giua cac lan render cua canvas cha
// (xem career-tree-canvas.tsx: opacity/fade khi hover duoc tach rieng khoi
// "data" nen khong lam "data" doi lien tuc) - neu khong memo, ca 30+ node se
// re-render toan bo moi lan hover.
export default memo(TreeGrowthNode);
