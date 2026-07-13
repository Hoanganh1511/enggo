"use client";
import { useCallback, useState } from "react";
import { useEdgesState, useNodesState } from "@xyflow/react";
import Canvas from "./canvas";
import Sidebar from "./sidebar";
import { initialEdges, initialNodes } from "@/lib/whiteboard/mock-data";
import { createParentBoard } from "@/lib/whiteboard/create-parent-board";
import type { AppNode } from "@/lib/whiteboard/types";
import BoardDetailModal from "./board-detail-modal";
import { AnimatePresence } from "framer-motion";

const WhiteBoardWorkspace = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<AppNode | null>(null);
  const addParentBoard = useCallback(() => {
    setNodes((currentNodes) => [
      ...currentNodes,
      createParentBoard(currentNodes),
    ]);
  }, []);
  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar onAddBoard={addParentBoard} />
      <div className="relative min-h-0 flex-1">
        <Canvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onAddParentBoard={addParentBoard}
          onSelectNode={setSelectedNode}
        />
      </div>
      <AnimatePresence>
        {selectedNode && (
          <BoardDetailModal
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhiteBoardWorkspace;
