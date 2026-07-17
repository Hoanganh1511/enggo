"use client";

import { useCareerTree } from "@/lib/career-tree/career-tree-context";
import type { ApiWorkspace } from "@/lib/api/types";
import Toolbar from "./toolbar";
import WorkspaceInfoBar from "./workspace-info-bar";
import CommandPalette from "./command-palette";
import NodeModalContainer from "./node-modal/node-modal-container";

type CareerTreeHeaderProps = {
  workspaceId: string;
  workspace: ApiWorkspace;
  workspaces: ApiWorkspace[];
  children: React.ReactNode;
};

const CareerTreeHeader = ({
  workspaceId,
  workspace,
  workspaces,
  children,
}: CareerTreeHeaderProps) => {
  const {
    allNodes,
    nodes,
    selectedNodeId,
    setSelectedNodeId,
    isPaletteOpen,
    setIsPaletteOpen,
    setPendingFocusNodeId,
  } = useCareerTree();

  const selectedApiNode = allNodes.find((n) => n.id === selectedNodeId);
  const selectedAppNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-gray-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950">
          <Toolbar
            onOpenSearch={() => setIsPaletteOpen(true)}
            workspace={workspace}
            workspaces={workspaces}
          />
          <div className="mt-2">
            <WorkspaceInfoBar workspace={workspace} nodes={allNodes} />
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-sm">
            <span className="text-gray-500">Workspaces</span>
            <span className="text-gray-300">/</span>
            <span className="font-medium text-gray-900">{workspace.name}</span>
          </div>
          <div className="-mx-5 mt-3 flex gap-5 border-t border-gray-100 px-5 pt-3 dark:border-zinc-800">
            <span className="border-b-2 border-gray-900 pb-2 text-sm font-medium text-gray-900">
              Tổng quan
            </span>
            <span className="cursor-not-allowed pb-2 text-sm text-gray-300 select-none">
              Nhật ký
            </span>
            <span className="cursor-not-allowed pb-2 text-sm text-gray-300 select-none">
              Cài đặt
            </span>
          </div>
        </header>

        <div className="relative min-h-0 flex-1">{children}</div>
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
      {isPaletteOpen && (
        <CommandPalette
          onClose={() => setIsPaletteOpen(false)}
          nodes={nodes}
          onSelect={(nodeId) => {
            setPendingFocusNodeId(nodeId);
            setIsPaletteOpen(false);
          }}
        />
      )}
    </>
  );
};

export default CareerTreeHeader;
