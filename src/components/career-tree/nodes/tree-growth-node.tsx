import { Folder, FileText, Target } from "lucide-react";
import { Handle, Position } from "@xyflow/react";
import { motion } from "framer-motion";
import GrowthCard, { type CardFrequency } from "@/components/ui/growth-card";
import {
  getDelayStatus,
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
};

const TreeGrowthNode = ({ data }: TreeGrowthNodeProps) => {
  const level = getFreshnessLevel(data.lastActivity);
  const hasVisibleChildren = data.childrenCount > 0 && !data.isCollapsed;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {data.role !== "root" && <Handle type="target" position={Position.Top} />}
      <GrowthCard
        icon={ROLE_ICON[data.role]}
        title={data.title}
        subtitle={`${data.cardCount} ghi chú`}
        branches={data.childrenCount}
        frequency={FREQUENCY_BY_LEVEL[level]}
        status={getDelayStatus(data.lastActivity)}
        done={Math.min(data.cardCount, MAX_EXPECTED_CARDS)}
        total={MAX_EXPECTED_CARDS}
        isCollapsed={data.isCollapsed}
        isToggling={data.isToggling}
        onToggleCollapse={data.onToggleCollapse}
      />
      {hasVisibleChildren && <Handle type="source" position={Position.Bottom} />}
    </motion.div>
  );
};

export default TreeGrowthNode;
