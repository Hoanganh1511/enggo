"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ControlButton,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import { Map as MapIcon } from "lucide-react";
import TreeGrowthNode from "./nodes/tree-growth-node";
import { buildHierarchy } from "@/lib/career-tree/transform";
import { computeTreeLayout } from "@/lib/career-tree/layout";
import { createNodeAction } from "@/actions/career-tree/create-node";
import { updateNodeAction } from "@/actions/career-tree/update-node";
import {
  filterVisibleNodes,
  getRealChildrenCount,
} from "@/lib/career-tree/filter-visible-nodes";
import type { ApiNodeListItem } from "@/lib/api/types";
import { resolveNodeRole, type AppNode } from "@/lib/career-tree/types";
import { useCareerTree } from "@/lib/career-tree/career-tree-context";
const nodeTypes: NodeTypes = {
  root: TreeGrowthNode,
  branch: TreeGrowthNode,
  leaf: TreeGrowthNode,
};

type CareerTreeCanvasProps = {
  workspaceId: string;
  initialNodes: ApiNodeListItem[];
};

const MINIMAP_SIZES = ["sm", "md", "lg", "hidden"] as const;
type MinimapSize = (typeof MINIMAP_SIZES)[number];

const MINIMAP_DIMENSIONS: Record<
  Exclude<MinimapSize, "hidden">,
  { width: number; height: number }
> = {
  sm: {
    width: 120,
    height: 90,
  },
  md: { width: 180, height: 135 },
  lg: { width: 240, height: 180 },
};

const MINIMAP_LABEL: Record<MinimapSize, string> = {
  sm: "Nhỏ",
  md: "Vừa",
  lg: "Lớn",
  hidden: "Đã ẩn",
};

const CareerTreeCanvas = ({
  workspaceId,
  initialNodes,
}: CareerTreeCanvasProps) => {
  const router = useRouter();
  const {
    setAllNodes,
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    lastViewport,
    setLastViewport,
    togglingNodeId,
    setTogglingNodeId,
    pendingFocusNodeId,
    setPendingFocusNodeId,
    reactFlowInstanceRef,
  } = useCareerTree();
  const [minimapSize, setMinimapSize] = useState<MinimapSize>("md");

  const cycleMinimapSize = () => {
    setMinimapSize((prev) => {
      const nextIndex =
        (MINIMAP_SIZES.indexOf(prev) + 1) % MINIMAP_SIZES.length;
      return MINIMAP_SIZES[nextIndex];
    });
  };

  //   Đồng bộ lại canvas mỗi khi Server Component cha refetch dữ liệu (sau khi 1 Server Action gọi revalidatePath)
  // useNodesState chỉ nhận giá trị khởi tạo ban đầu, không tự re-sync theo prop, nên cần useEffect này để node mới tạo thực sự hiện lên canvas.

  useEffect(() => {
    setAllNodes(initialNodes);

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
      const role = apiNode
        ? resolveNodeRole(apiNode, childrenCount > 0)
        : n.data.role;
      return {
        ...n,
        type: role,
        data: { ...n.data, childrenCount, role },
      };
    });

    setNodes(patchedNodes);
    setEdges(layout.edges);
  }, [initialNodes, setAllNodes, setNodes, setEdges]);

  // Sau khi mở/đóng nhánh, layout tính lại vị trí (các node còn lại reflow) —
  // canh camera về đúng node vừa bấm để người dùng không bị mất dấu vị trí của nó.
  useEffect(() => {
    if (!pendingFocusNodeId) return;
    const node = nodes.find((n) => n.id === pendingFocusNodeId);
    const instance = reactFlowInstanceRef.current;
    if (!node || !instance) return;
    const width = node.measured?.width ?? 256;
    const height = node.measured?.height ?? 100;
    instance.setCenter(
      node.position.x + width / 2,
      node.position.y + height / 2,
      {
        zoom: instance.getZoom(),
        duration: 600,
      },
    );
    setPendingFocusNodeId(null);
  }, [nodes, pendingFocusNodeId, setPendingFocusNodeId, reactFlowInstanceRef]);

  const rootId = nodes.find((n) => n.data.role === "root")?.id;

  const handleAddNode = async () => {
    await createNodeAction(workspaceId, rootId ?? null, "Node mới");
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
    router.push(`/w/${workspaceId}/nodes/${node.id}`);
  };

  const displayNodes: AppNode[] = nodes.map((n) => ({
    ...n,
    data: {
      ...n.data,
      isToggling: n.id === togglingNodeId,
      onToggleCollapse: () => handleToggleCollapse(n.id, n.data.isCollapsed),
    },
  }));

  return (
    <>
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
        onMoveEnd={(_, viewport) => setLastViewport(viewport)}
        defaultEdgeOptions={{
          style: { stroke: "#a1a1aa", strokeWidth: 1.5 },
        }}
        {...(lastViewport
          ? { defaultViewport: lastViewport }
          : { fitView: true })}
        onlyRenderVisibleElements
        className="h-full w-full"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={2}
          color="var(--border)"
        />
        <Controls
          position="top-right"
          orientation="horizontal"
          showInteractive={false}
        >
          <ControlButton
            onClick={cycleMinimapSize}
            title={`Minimap: ${MINIMAP_LABEL[minimapSize]} - bấm để đổi cỡ`}
          >
            <MapIcon size={14} strokeWidth={1.75} />
          </ControlButton>
        </Controls>
        {minimapSize !== "hidden" && (
          <MiniMap
            pannable
            zoomable
            style={{
              width: MINIMAP_DIMENSIONS[minimapSize].width,
              height: MINIMAP_DIMENSIONS[minimapSize].height,
            }}
            className="bg-surface! border border-border! rounded-lg! overflow-hidden!"
            maskColor="var(--overlay)" // đổi vùng ngoài viewport sang overlay thay vì màu mặc định
            nodeColor="var(--surface-muted)" // khối xám mặc định
            nodeStrokeColor="var(--border)"
            nodeStrokeWidth={1}
            nodeBorderRadius={4} // bo góc nhẹ
          />
        )}
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-ink-muted">
            Chưa có node nào — bắt đầu cây sự nghiệp của bạn
          </p>
          <button
            type="button"
            onClick={handleAddNode}
            className="pointer-events-auto cursor-pointer rounded-full bg-primary px-4 py-2 text-sm text-white transition-colors duration-150 ease-out hover:bg-primary-hover"
          >
            + Tạo node đầu tiên
          </button>
        </div>
      )}
    </>
  );
};

export default CareerTreeCanvas;
