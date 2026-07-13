import { Handle, Position, type NodeProps } from "@xyflow/react";
import BoardNodeCard from "./board-node-card";
import type { ChildBoardNode as ChildBoardNodeType } from "@/lib/whiteboard/types";
const ChildBoardNode = ({ data }: NodeProps<ChildBoardNodeType>) => {
  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        className="!h-1.5 !w-1.5 !bg-zinc-400 opacit-40"
      />
      <BoardNodeCard title={data.title} variant="child" />
    </div>
  );
};

export default ChildBoardNode;
