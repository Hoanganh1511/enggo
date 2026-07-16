"use client";

import { useEffect, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import Sidebar from "./sidebar";
import TreeGrowthNode from "./nodes/tree-growth-node";
import { buildHierarchy } from "@/lib/career-tree/transform";
import { computeTreeLayout } from "@/lib/career-tree/layout";
import { createNodeAction } from "@/actions/career-tree/create-node";
import type { ApiNode } from "@/lib/api/types";
import type { AppEdge, AppNode } from "@/lib/career-tree/types";
import NodeModalContainer from "./node-modal/node-modal-container";

const nodeTypes: NodeTypes = {
  root: TreeGrowthNode,
  branch: TreeGrowthNode,
  leaf: TreeGrowthNode,
};
type CareerTreeWorkspaceProps = {
  workspaceId: string;
  initialNodes: ApiNode[];
};
const CareerTreeWorkspace = ({
  workspaceId,
  initialNodes,
}: CareerTreeWorkspaceProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  //   Đồng bộ lại canvas mỗi khi Server Component cha refetch dữ liệu (sau khi 1 Server Action gọi revalidatePath)
  // useNodesState chỉ nhận giá trị khởi tạo ban đầu, không tự re-sync theo prop, nên cần useEffect này để node mới tạo thực sự hiện lên canvas.
  useEffect(() => {
    if (initialNodes.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }
    const hierarchy = buildHierarchy(initialNodes);
    const layout = computeTreeLayout(hierarchy);

    setNodes(layout.nodes);
    setEdges(layout.edges);
  }, [initialNodes, setNodes, setEdges]);

  const rootId = initialNodes.find((n) => n.parentId === null)?.id;

  const handleAddNode = async () => {
    if (!rootId) return;
    await createNodeAction(workspaceId, rootId, "Node mới");
  };

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  };

  const selectedApiNode = initialNodes.find((n) => n.id === selectedNodeId);
  const selectedAppNode = nodes.find((n) => n.id === selectedNodeId);
  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar onAddNode={handleAddNode} />
      <div className="relative min-h-0 flex-1">
        <ReactFlow
          nodes={nodes.map((n) => ({
            ...n,
            selected: n.id === selectedNodeId,
          }))}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          defaultEdgeOptions={{
            style: { stroke: "#a1a1aa", strokeWidth: 1.5 },
          }}
          fitView
          className="h-full w-full"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={28}
            size={2}
            color="#e5e5e0"
          />
          <Controls
            position="top-right"
            orientation="horizontal"
            showInteractive={false}
          />
          <MiniMap pannable zoomable className="bg-white! dark:bg-zinc-900!" />
        </ReactFlow>

        {nodes.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Chưa có node nào — bắt đầu cây sự nghiệp của bạn
            </p>
            <button
              type="button"
              onClick={handleAddNode}
              className="pointer-events-auto rounded-full bg-foreground px-4 py-2 text-sm text-background transition-colors hover:opacity-90"
            >
              + Tạo node đầu tiên
            </button>
          </div>
        )}
      </div>
      {selectedApiNode && selectedAppNode && (
        <NodeModalContainer
          workspaceId={workspaceId}
          node={selectedApiNode}
          role={selectedAppNode.data.role}
          childrenCount={selectedAppNode.data.childrenCount}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  );
};
export default CareerTreeWorkspace;
