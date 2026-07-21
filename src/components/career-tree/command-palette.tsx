"use client";

import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import type { ApiNodeListItem } from "@/lib/api/types";
import { getChildNodes, hasChildren } from "@/lib/career-tree/get-child-nodes";
import Spinner from "@/components/ui/spinner";
import { useCareerTreeStore } from "@/stores/career-tree-store";
type CommandPaletteProps = {
  onClose: () => void;
  allNodes: ApiNodeListItem[];
  onSelect: (nodeId: string) => void | Promise<void>;
};

type VisibleRow = {
  node: ApiNodeListItem;
  hasChildren: boolean;
  isExpanded: boolean;
  guides: boolean[]; //mỗi node ứng với 1 cấp tổ tiên; true = trục dọc còn tiếp tục
  isLastChild: boolean; // row này có phải con cuối của cha nó không ?
};

function buildVisibleRows(
  allNodes: ApiNodeListItem[],
  expandedIds: Set<string>,
  parentId: string | null,
  guides: boolean[] = [],
  rows: VisibleRow[] = [],
): VisibleRow[] {
  const children = getChildNodes(allNodes, parentId);

  children.forEach((node, index) => {
    const isLastChild = index === children.length - 1;
    const nodeHasChildren = hasChildren(allNodes, node.id);
    const isExpanded = expandedIds.has(node.id);
    rows.push({
      node,
      hasChildren: nodeHasChildren,
      isExpanded,
      guides,
      isLastChild,
    });
    if (nodeHasChildren && isExpanded) {
      buildVisibleRows(
        allNodes,
        expandedIds,
        node.id,
        [...guides, !isLastChild],
        rows,
      );
    }
  });

  return rows;
}

const CommandPalette = ({
  onClose,
  allNodes,
  onSelect,
}: CommandPaletteProps) => {
  const [query, setQuery] = useState("");
  const expandedNodeIds = useCareerTreeStore((s) => s.expandedNodeIds);
  const setExpandedNodeIds = useCareerTreeStore((s) => s.setExpandedNodeIds);

  const [focusingNodeId, setFocusingNodeId] = useState<string | null>(null);

  const visibleRows = useMemo(
    () => buildVisibleRows(allNodes, expandedNodeIds, null),
    [allNodes, expandedNodeIds],
  );

  const isSearching = query.trim().length > 0;
  const results = isSearching
    ? visibleRows.filter((row) =>
        row.node.title.toLowerCase().includes(query.toLowerCase()),
      )
    : visibleRows;

  const toggleExpanded = (nodeId: string) => {
    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const handleSelect = async (nodeId: string) => {
    if (focusingNodeId) return;
    setFocusingNodeId(nodeId);
    try {
      await onSelect(nodeId);
    } finally {
      setFocusingNodeId(null);
    }
  };

  return (
    <Dialog.Root
      open
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <Dialog.Content className="fixed left-1/2 top-32 z-50 w-[calc(100%-3rem)] max-w-lg -translate-x-1/2 overflow-hidden rounded-sm border border-border bg-surface shadow-panel focus:outline-none">
          <Dialog.Title className="sr-only">Tìm kiếm</Dialog.Title>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (results.length > 0) handleSelect(results[0].node.id);
            }}
            className="flex items-center gap-3 border-b border-search-border bg-surface-muted px-4 py-3"
          >
            <Search
              size={16}
              strokeWidth={1.75}
              className="shrink-0 text-icon"
            />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm"
              disabled={focusingNodeId !== null}
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint disabled:opacity-50"
            />
          </form>
          <div className="modal-scrollbar max-h-80 overflow-y-auto bg-surface p-2">
            {results.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-ink-faint">
                Không tìm thấy kết quả nào
              </p>
            ) : (
              results.map(
                ({
                  node,
                  hasChildren: nodeHasChildren,
                  isExpanded,
                  guides,
                  isLastChild,
                }) => {
                  const isFocusing = focusingNodeId === node.id;
                  const isDisabled = focusingNodeId !== null && !isFocusing;
                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => handleSelect(node.id)}
                      disabled={focusingNodeId !== null}
                      style={{
                        paddingLeft: isSearching ? 12 + node.depth * 16 : 12,
                      }}
                      className={`group flex w-full cursor-pointer items-stretch gap-1 rounded-lg  pr-3 text-left text-sm text-ink transition-all duration-150 ease-out  disabled:cursor-wait hover:bg-hover-bg active:bg-press-bg ${
                        isDisabled ? "opacity-40" : ""
                      }`}
                    >
                      {!isSearching && node.depth > 0 && (
                        <>
                          {guides.map((continues, i) => (
                            <span
                              key={i}
                              className="relative w-4 shrink-0 self-stretch"
                            >
                              {continues && (
                                <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-tree-line" />
                              )}
                            </span>
                          ))}
                          <span className="relative w-4 shrink-0 self-stretch">
                            <span
                              className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-tree-line"
                              style={{ height: isLastChild ? "50%" : "100%" }}
                            />
                            <span className="absolute left-1/2 top-1/2 h-px w-1/2 -translate-y-1/2 bg-tree-line" />
                          </span>
                        </>
                      )}

                      <span className="flex flex-1 items-center gap-1 py-2 ">
                        {isFocusing ? (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                            <Spinner size={13} />
                          </span>
                        ) : (
                          !isSearching &&
                          (nodeHasChildren ? (
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpanded(node.id);
                              }}
                              className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-icon  hover:text-icon-hover"
                            >
                              {isExpanded ? (
                                <ChevronDown size={44} strokeWidth={1.75} />
                              ) : (
                                <ChevronRight size={44} strokeWidth={1.75} />
                              )}
                            </span>
                          ) : null)
                        )}
                        <span className="truncate opacity-90 transition-opacity text-[12.5px] 2xl:text-base duration-150 ease-out group-hover:opacity-100">
                          {node.title}
                        </span>
                      </span>
                    </button>
                  );
                },
              )
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CommandPalette;
