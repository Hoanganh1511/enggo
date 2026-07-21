
import { create } from "zustand";
import type { ApiNodeListItem } from "@/lib/api/types";

type CareerTreeStore = {
  allNodes: ApiNodeListItem[];
  setAllNodes: (nodes: ApiNodeListItem[]) => void;

  isPaletteOpen: boolean;
  setIsPaletteOpen: (open: boolean) => void;

  expandedNodeIds: Set<string>;
  setExpandedNodeIds: (updater: (prev: Set<string>) => Set<string>) => void;

  pendingFocusNodeId: string | null;
  setPendingFocusNodeId: (id: string | null) => void;
};



export const useCareerTreeStore = create<CareerTreeStore>((set) => ({
  allNodes: [],
  setAllNodes: (allNodes) => set({ allNodes }),

  isPaletteOpen: false,
  setIsPaletteOpen: (isPaletteOpen) => set({ isPaletteOpen }),

  expandedNodeIds: new Set(),
  setExpandedNodeIds: (updater) =>
    set((state) => ({ expandedNodeIds: updater(state.expandedNodeIds) })),

  pendingFocusNodeId: null,
  setPendingFocusNodeId: (pendingFocusNodeId) => set({ pendingFocusNodeId }),
}));
