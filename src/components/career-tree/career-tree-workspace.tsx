"use client";

import { useEffect, useRef, useState } from "react";
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
  type ReactFlowInstance,
} from "@xyflow/react";
import Sidebar from "./sidebar";
import TreeGrowthNode from "./nodes/tree-growth-node";
import { buildHierarchy } from "@/lib/career-tree/transform";
import { computeTreeLayout } from "@/lib/career-tree/layout";
import { createNodeAction } from "@/actions/career-tree/create-node";
import { updateNodeAction } from "@/actions/career-tree/update-node";
import {
  filterVisibleNodes,
  getRealChildrenCount,
} from "@/lib/career-tree/filter-visible-nodes";
import type { ApiNode } from "@/lib/api/types";
import { resolveNodeRole, type AppEdge, type AppNode } from "@/lib/career-tree/types";
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
  const [togglingNodeId, setTogglingNodeId] = useState<string | null>(null);
  const [pendingFocusNodeId, setPendingFocusNodeId] = useState<string | null>(null);
  const reactFlowInstanceRef = useRef<ReactFlowInstance<AppNode, AppEdge> | null>(
    null,
  );
  //   Đồng bộ lại canvas mỗi khi Server Component cha refetch dữ liệu (sau khi 1 Server Action gọi revalidatePath)
  // useNodesState chỉ nhận giá trị khởi tạo ban đầu, không tự re-sync theo prop, nên cần useEffect này để node mới tạo thực sự hiện lên canvas.
  useEffect(() => {
    if (initialNodes.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }
    const visibleNodes = filterVisibleNodes(initialNodes);
    const hierarchy = buildHierarchy(visibleNodes);
    const layout = computeTreeLayout(hierarchy);

    // childrenCount/role tính từ computeTreeLayout dựa trên cây ĐÃ LỌC — node đang
    // collapsed sẽ luôn ra 0 nhánh vì con của nó không còn trong hierarchy. Ghi đè
    // lại bằng số con THẬT (tính từ initialNodes chưa lọc) để nút mở lại không biến mất.
    const realChildrenCount = getRealChildrenCount(initialNodes);
    const apiNodeById = new Map(initialNodes.map((n) => [n.id, n]));
    const patchedNodes = layout.nodes.map((n) => {
      const childrenCount = realChildrenCount.get(n.id) ?? 0;
      const apiNode = apiNodeById.get(n.id);
      const role = apiNode ? resolveNodeRole(apiNode, childrenCount > 0) : n.data.role;
      return {
        ...n,
        type: role,
        data: { ...n.data, childrenCount, role },
      };
    });

    setNodes(patchedNodes);
    setEdges(layout.edges);
  }, [initialNodes, setNodes, setEdges]);

  // Sau khi mở/đóng nhánh, layout tính lại vị trí (các node còn lại reflow) —
  // canh camera về đúng node vừa bấm để người dùng không bị mất dấu vị trí của nó.
  useEffect(() => {
    if (!pendingFocusNodeId) return;
    const node = nodes.find((n) => n.id === pendingFocusNodeId);
    const instance = reactFlowInstanceRef.current;
    if (!node || !instance) return;
    const width = node.measured?.width ?? 256;
    const height = node.measured?.height ?? 100;
    instance.setCenter(node.position.x + width / 2, node.position.y + height / 2, {
      zoom: instance.getZoom(),
      duration: 400,
    });
    setPendingFocusNodeId(null);
  }, [nodes, pendingFocusNodeId]);

  const rootId = initialNodes.find((n) => n.parentId === null)?.id;

  const handleAddNode = async () => {
    if (!rootId) return;
    await createNodeAction(workspaceId, rootId, "Node mới");
  };

  const handleToggleCollapse = async (nodeId: string, current: boolean) => {
    setTogglingNodeId(nodeId);
    setPendingFocusNodeId(nodeId);
    try {
      await updateNodeAction(workspaceId, nodeId, { isCollapsed: !current });
    } finally {
      setTogglingNodeId(null);
    }
  };

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  };

  const selectedApiNode = initialNodes.find((n) => n.id === selectedNodeId);
  const selectedAppNode = nodes.find((n) => n.id === selectedNodeId);
  const displayNodes: AppNode[] = nodes.map((n) => ({
    ...n,
    selected: n.id === selectedNodeId,
    data: {
      ...n.data,
      isToggling: n.id === togglingNodeId,
      onToggleCollapse: () => handleToggleCollapse(n.id, n.data.isCollapsed),
    },
  }));
  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar onAddNode={handleAddNode} />
      <div className="relative min-h-0 flex-1">
        <ReactFlow
          nodes={displayNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onInit={(instance) => {
            reactFlowInstanceRef.current = instance;
          }}
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
              className="pointer-events-auto cursor-pointer rounded-full bg-foreground px-4 py-2 text-sm text-background transition-colors hover:opacity-90"
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
