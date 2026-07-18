import { getFreshnessColor, getNodeSize } from "@/lib/career-tree/constants";
import { TreeNodeData } from "@/lib/career-tree/types";
import { Handle, Position } from "@xyflow/react";
import { motion } from "framer-motion";
type TreeNodeProps = {
  data: TreeNodeData;
  selected: boolean;
};
const TreeNode = ({ data, selected }: TreeNodeProps) => {
  const size = getNodeSize(data.cardCount);
  const freshnessColor = getFreshnessColor(data.lastActivity);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      title={data.title}
      className={`relative flex cursor-pointer items-center justify-center rounded-xl border-2 bg-surface px-3 text-center text-sm font-medium text-ink shadow-sm transition-shadow hover:shadow-md ${
        selected ? "ring-2 ring-offset-2 ring-primary" : ""
      }`}
      style={{ width: size, height: size * 0.5, borderColor: freshnessColor }}
    >
      <Handle type="target" position={Position.Top} />
      <span
        className="absolute right-2 top-2 h-2 w-2 rounded-full"
        style={{ backgroundColor: freshnessColor }}
      />
      <span className="truncate">{data.title}</span>
      <Handle type="source" position={Position.Bottom} />
    </motion.div>
  );
};
export default TreeNode;
