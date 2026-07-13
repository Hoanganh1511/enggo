import { Handle, Position, type NodeProps } from "@xyflow/react";
import BoardNodeCard from "./board-node-card";
import type { ParentBoardNode as ParentBoardNodeType } from "@/lib/whiteboard/types";
const ParentBoardNode = ({ data }: NodeProps<ParentBoardNodeType>) => {
  return (
    <div className="relatvei">
      <BoardNodeCard
        title={data.title}
        description={data.description}
        variant="parent"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        className="!h-1.5 !w-1.5 !bg-zinc-400 opacity-40"
      />
    </div>
  );
};

export default ParentBoardNode;
