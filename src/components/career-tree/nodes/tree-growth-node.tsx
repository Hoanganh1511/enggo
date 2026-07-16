import { Folder, FileText, Target } from "lucide-react";
import { Handle, Position } from "@xyflow/react";
import GrowthCard, { type CardFrequency } from "@/components/ui/growth-card";
import {
  getFreshnessLevel,
  MAX_EXPECTED_CARDS,
  type FreshnessLevel,
} from "@/lib/career-tree/constants";
import type { NodeRole, TreeNodeData } from "@/lib/career-tree/types";

const ROLE_ICON: Record<NodeRole, typeof Target> = {
  root: Target,
  branch: Folder,
  leaf: FileText,
};

const FREQUENCY_BY_LEVEL: Record<FreshnessLevel, CardFrequency> = {
  fresh: "daily",
  recent: "weekly",
  fading: "monthly",
  stale: "monthly",
};

type TreeGrowthNodeProps = {
  data: TreeNodeData;
  selected?: boolean;
};

const TreeGrowthNode = ({ data, selected }: TreeGrowthNodeProps) => {
  const level = getFreshnessLevel(data.lastActivity);

  return (
    <div
      className={
        selected ? "rounded-xl ring-2 ring-gray-900 ring-offset-2" : ""
      }
    >
      <Handle type="target" position={Position.Top} />
      <GrowthCard
        icon={ROLE_ICON[data.role]}
        title={data.title}
        subtitle={`${data.cardCount} ghi chú`}
        branches={data.childrenCount}
        frequency={FREQUENCY_BY_LEVEL[level]}
        done={Math.min(data.cardCount, MAX_EXPECTED_CARDS)}
        total={MAX_EXPECTED_CARDS}
      />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default TreeGrowthNode;
