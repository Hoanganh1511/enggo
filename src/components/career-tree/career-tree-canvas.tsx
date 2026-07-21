"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  useNodesState,
  useEdgesState,
  type Viewport,
  type ReactFlowInstance,
} from "@xyflow/react";
import { Map as MapIcon } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import TreeGrowthNode from "./nodes/tree-growth-node";
import { buildHierarchy } from "@/lib/career-tree/transform";
import { computeTreeLayout } from "@/lib/career-tree/layout";
import { createNodeAction } from "@/actions/career-tree/create-node";
import { updateNodeAction } from "@/actions/career-tree/update-node";
import { useCareerTreeStore } from "@/stores/career-tree-store";
import {
  filterVisibleNodes,
  getRealChildrenCount,
} from "@/lib/career-tree/filter-visible-nodes";
import type { ApiNodeListItem } from "@/lib/api/types";
import {
  resolveNodeRole,
  type AppNode,
  type AppEdge,
} from "@/lib/career-tree/types";
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
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>([]);
  const [togglingNodeId, setTogglingNodeId] = useState<string | null>(null);
  const [lastViewport, setLastViewport] = useState<Viewport | null>(null);
  const reactFlowInstanceRef = useRef<ReactFlowInstance<
    AppNode,
    AppEdge
  > | null>(null);

  // FIeld thực sự dùng dung - lấy từ Zustand, mỗi field 1 selecteor riêng để canvas chỉ re-render khi dùng Field đó thoi

  const setAllNodes = useCareerTreeStore((s) => s.setAllNodes);
  const pendingFocusNodeId = useCareerTreeStore((s) => s.pendingFocusNodeId);
  const setPendingFocusNodeId = useCareerTreeStore(
    (s) => s.setPendingFocusNodeId,
  );
  const [minimapSize, setMinimapSize] = useState<MinimapSize>("md");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Cha/con suy tu edges (source->target) - khong can them field parentId
  // rieng vao TreeNodeData, vi quan he cha-con da co san qua canh noi.
  const { parentOf, childrenOf } = useMemo(() => {
    const parentOf = new Map<string, string>();
    const childrenOf = new Map<string, string[]>();
    for (const e of edges) {
      parentOf.set(e.target, e.source);
      childrenOf.set(e.source, [...(childrenOf.get(e.source) ?? []), e.target]);
    }
    return { parentOf, childrenOf };
  }, [edges]);

  // Tap hop node duoc "sang" khi hover: chinh no + toan bo to tien (duong len
  // goc) + toan bo hau due - dung de quyet dinh node/canh nao giu opacity 100%,
  // phan con lai mo dan theo muc 1+7.
  const highlightedSet = useMemo(() => {
    if (!hoveredNodeId) return null;
    const set = new Set<string>([hoveredNodeId]);
    let cur = parentOf.get(hoveredNodeId);
    while (cur) {
      set.add(cur);
      cur = parentOf.get(cur);
    }
    const stack = [...(childrenOf.get(hoveredNodeId) ?? [])];
    while (stack.length > 0) {
      const id = stack.pop();
      if (!id || set.has(id)) continue;
      set.add(id);
      stack.push(...(childrenOf.get(id) ?? []));
    }
    return set;
  }, [hoveredNodeId, parentOf, childrenOf]);

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

  // useCallback de giu nguyen 1 reference qua cac lan render - can thiet vi
  // day la dependency cua nodesWithData ben duoi; neu doi reference moi lan
  // render (nhu 1 arrow function thuong) se lam "data" cua tung node cung doi
  // theo, pha vi memo() cua TreeGrowthNode.
  const handleToggleCollapse = useCallback(
    async (nodeId: string, current: boolean) => {
      setTogglingNodeId(nodeId);
      setPendingFocusNodeId(nodeId);
      try {
        await updateNodeAction(workspaceId, nodeId, { isCollapsed: !current });
      } finally {
        setTogglingNodeId(null);
      }
    },
    [workspaceId, setTogglingNodeId, setPendingFocusNodeId],
  );

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    router.push(`/w/${workspaceId}/nodes/${node.id}`);
  };

  // Luu lai vi tri sau khi keo tha xong - lan fetch sau, layout.ts se doc
  // dung x/y nay thay vi tinh lai auto-layout cho node nay.
  const handleNodeDragStop = async (
    _event: MouseEvent | TouchEvent,
    node: Node,
  ) => {
    await updateNodeAction(workspaceId, node.id, {
      x: node.position.x,
      y: node.position.y,
    });
  };

  // Tach rieng khoi buoc gan opacity ben duoi de "data" giu nguyen 1 reference
  // qua cac lan hover doi (chi phu thuoc nodes/togglingNodeId/handleToggleCollapse,
  // KHONG phu thuoc highlightedSet) - memo() cua TreeGrowthNode nho vay co the
  // bo qua re-render khi chi co opacity doi, thay vi ca 30+ node re-render lai
  // toan bo (Radix HoverCard/Tooltip, framer-motion...) moi lan chuot di qua.
  const nodesWithData: AppNode[] = useMemo(() => {
    return nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        isToggling: n.id === togglingNodeId,
        onToggleCollapse: () => handleToggleCollapse(n.id, n.data.isCollapsed),
      },
    }));
  }, [nodes, togglingNodeId, handleToggleCollapse]);

  const displayNodes: AppNode[] = useMemo(() => {
    return nodesWithData.map((n) => {
      const isFaded = highlightedSet !== null && !highlightedSet.has(n.id);
      return {
        ...n,
        style: {
          ...n.style,
          opacity: isFaded ? 0.35 : 1,
          transition: "opacity 180ms ease-out",
        },
      };
    });
  }, [nodesWithData, highlightedSet]);

  const displayEdges: AppEdge[] = useMemo(() => {
    return edges.map((e) => {
      const isConnected =
        highlightedSet !== null &&
        highlightedSet.has(e.source) &&
        highlightedSet.has(e.target);
      const isFaded = highlightedSet !== null && !isConnected;
      return {
        ...e,
        style: {
          ...e.style,
          opacity: isFaded ? 0.2 : 1,
          transition: "opacity 180ms ease-out",
        },
      };
    });
  }, [edges, highlightedSet]);

  return (
    <Tooltip.Provider delayDuration={300}>
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onNodeDragStop={handleNodeDragStop}
        onNodeMouseEnter={(_, node) => setHoveredNodeId(node.id)}
        onNodeMouseLeave={() => setHoveredNodeId(null)}
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
            nodeColor={(n) =>
              n.id === hoveredNodeId
                ? "var(--color-primary)"
                : "var(--surface-muted)"
            }
            nodeStrokeColor={(n) =>
              n.id === hoveredNodeId ? "var(--color-primary)" : "var(--border)"
            }
            nodeStrokeWidth={1}
            nodeBorderRadius={4} // bo góc nhẹ
          />
        )}
      </ReactFlow>

      {initialNodes.length === 0 && (
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
    </Tooltip.Provider>
  );
};

export default CareerTreeCanvas;
