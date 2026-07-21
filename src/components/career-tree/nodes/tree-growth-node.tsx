import { memo } from "react";
import { Folder, FileText, Target } from "lucide-react";
import { Handle, Position, useStore } from "@xyflow/react";
import GrowthCard from "@/components/ui/growth-card";
import { MAX_EXPECTED_CARDS } from "@/lib/career-tree/constants";
import { getNodeStatus } from "@/lib/career-tree/node-status";
import type { NodeRole, TreeNodeData } from "@/lib/career-tree/types";

const ROLE_ICON: Record<NodeRole, typeof Target> = {
  root: Target,
  branch: Folder,
  leaf: FileText,
};

// Duoi nguong nay coi nhu "zoom xa" - an bot metadata phu theo yeu cau muc 9.
const ZOOM_OUT_THRESHOLD = 0.6;

type TreeGrowthNodeProps = {
  data: TreeNodeData;
};

const TreeGrowthNode = ({ data }: TreeGrowthNodeProps) => {
  // Selector tra ve boolean thay vi useViewport() (tra ve object moi lien tuc
  // theo tung frame khi pan/zoom) - useStore chi re-render khi gia tri boolean
  // nay THAT SU doi (vuot/lui qua nguong), khong phai moi lan viewport nhich 1 chut.
  const zoomedOut = useStore((s) => s.transform[2] < ZOOM_OUT_THRESHOLD);
  const hasVisibleChildren = data.childrenCount > 0 && !data.isCollapsed;
  const done = Math.min(data.cardCount, MAX_EXPECTED_CARDS);
  const status = getNodeStatus({
    streakCurrent: data.streak.current,
    openIssueCount: data.openIssueCount,
  });

  return (
    <div className="animate-[node-enter_200ms_ease-out] motion-reduce:animate-none">
      {data.role !== "root" && <Handle type="target" position={Position.Top} />}

      <GrowthCard
        icon={ROLE_ICON[data.role]}
        title={data.title}
        subtitle={`${data.cardCount} ghi chú`}
        branches={data.childrenCount}
        streak={data.streak}
        lastActivity={data.lastActivity}
        done={done}
        total={MAX_EXPECTED_CARDS}
        status={status}
        zoomedOut={zoomedOut}
        isCollapsed={data.isCollapsed}
        isToggling={data.isToggling}
        onToggleCollapse={data.onToggleCollapse}
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
