"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  useEdgesState,
  useNodesState,
  type OnEdgesChange,
  type OnNodesChange,
  type ReactFlowInstance,
} from "@xyflow/react";
import type { ApiNode } from "@/lib/api/types";
import type { AppEdge, AppNode } from "./types";

type CareerTreeContextValue = {
  allNodes: ApiNode[];
  setAllNodes: Dispatch<SetStateAction<ApiNode[]>>;
  nodes: AppNode[];
  setNodes: Dispatch<SetStateAction<AppNode[]>>;
  onNodesChange: OnNodesChange<AppNode>;
  edges: AppEdge[];
  setEdges: Dispatch<SetStateAction<AppEdge[]>>;
  onEdgesChange: OnEdgesChange<AppEdge>;
  selectedNodeId: string | null;
  setSelectedNodeId: Dispatch<SetStateAction<string | null>>;
  togglingNodeId: string | null;
  setTogglingNodeId: Dispatch<SetStateAction<string | null>>;
  pendingFocusNodeId: string | null;
  setPendingFocusNodeId: Dispatch<SetStateAction<string | null>>;
  isPaletteOpen: boolean;
  setIsPaletteOpen: Dispatch<SetStateAction<boolean>>;
  reactFlowInstanceRef: React.MutableRefObject<ReactFlowInstance<AppNode, AppEdge> | null>;
};

const CareerTreeContext = createContext<CareerTreeContextValue | null>(null);

export function useCareerTree() {
  const ctx = useContext(CareerTreeContext);
  if (!ctx) {
    throw new Error("useCareerTree must be used within CareerTreeProvider");
  }
  return ctx;
}

const CareerTreeProvider = ({ children }: { children: React.ReactNode }) => {
  const [allNodes, setAllNodes] = useState<ApiNode[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [togglingNodeId, setTogglingNodeId] = useState<string | null>(null);
  const [pendingFocusNodeId, setPendingFocusNodeId] = useState<string | null>(
    null,
  );
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const reactFlowInstanceRef = useRef<ReactFlowInstance<
    AppNode,
    AppEdge
  > | null>(null);

  // Global: Ctrl/Cmd+K mở command palette để tìm-và-nhảy-tới node, từ bất kỳ đâu trong app.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <CareerTreeContext.Provider
      value={{
        allNodes,
        setAllNodes,
        nodes,
        setNodes,
        onNodesChange,
        edges,
        setEdges,
        onEdgesChange,
        selectedNodeId,
        setSelectedNodeId,
        togglingNodeId,
        setTogglingNodeId,
        pendingFocusNodeId,
        setPendingFocusNodeId,
        isPaletteOpen,
        setIsPaletteOpen,
        reactFlowInstanceRef,
      }}
    >
      {children}
    </CareerTreeContext.Provider>
  );
};

export default CareerTreeProvider;
