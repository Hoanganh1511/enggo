"use client";
import { useCareerTree } from "@/lib/career-tree/career-tree-context";
import { getCollapsedAncestorIds } from "@/lib/career-tree/get-child-nodes";
import { updateNodeAction } from "@/actions/career-tree/update-node";
import CommandPalette from "./command-palette";

type CareerTreeHeaderProps = {
  workspaceId: string;
  topbar: React.ReactNode;
  children: React.ReactNode;
};

const CareerTreeHeader = ({
  workspaceId,
  topbar,
  children,
}: CareerTreeHeaderProps) => {
  const { allNodes, isPaletteOpen, setIsPaletteOpen, setPendingFocusNodeId } =
    useCareerTree();

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {topbar}

        <div className="relative min-h-0 flex-1">{children}</div>
      </div>

      {isPaletteOpen && (
        <CommandPalette
          onClose={() => setIsPaletteOpen(false)}
          allNodes={allNodes}
          onSelect={async (nodeId) => {
            const collapsedAncestors = getCollapsedAncestorIds(
              allNodes,
              nodeId,
            );
            await Promise.all(
              collapsedAncestors.map((id) =>
                updateNodeAction(workspaceId, id, { isCollapsed: false }),
              ),
            );
            setPendingFocusNodeId(nodeId);
            setIsPaletteOpen(false);
          }}
        />
      )}
    </>
  );
};

export default CareerTreeHeader;
