import {
  Background,
  BackgroundVariant,
  Controls,
  Panel,
  ReactFlow,
  type NodeTypes,
  type OnEdgesChange,
  type OnNodesChange,
} from "@xyflow/react";
import ParentBoardNode from "./nodes/parent-board-node";
import ChildBoardNode from "./nodes/child-board-node";
import AddParentBoardNode from "./nodes/add-parent-board-node";
import type { AppNode, AppEdge } from "@/lib/whiteboard/types";
import Toolbar from "./toolbar";

const nodeTypes: NodeTypes = {
  parentBoard: ParentBoardNode,
  childBoard: ChildBoardNode,
  addParentBoard: AddParentBoardNode,
};

type CanvasProps = {
  nodes: AppNode[];
  edges: AppEdge[];
  onNodesChange: OnNodesChange<AppNode>;
  onEdgesChange: OnEdgesChange<AppEdge>;
  onAddParentBoard: () => void;
  onSelectNode: (node: AppNode) => void;
};

const Canvas = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onAddParentBoard,
  onSelectNode,
}: CanvasProps) => {
  const handleNodeClick = (_event: React.MouseEvent, node: AppNode) => {
    onSelectNode(node);
  };
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={handleNodeClick}
      fitView
      className="h-full w-full"
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      <Controls
        position="top-right"
        orientation="horizontal"
        showInteractive={false}
      />
      <Panel position="top-center" className="m-4">
        <Toolbar onAddBoard={onAddParentBoard} />
      </Panel>
    </ReactFlow>
  );
};

export default Canvas;
